import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  FileStorageNotConfiguredError,
  buildDeliveryUrl,
  createUploadSignature,
  deleteStoredFiles,
  isFileStorageConfigured,
  parseStorageKey,
  signParams,
  toStorageKey,
  uploadBuffer,
  verifyUploadSignature,
} from '../src/services/fileStorage.js'

const ENV = { CLOUDINARY_CLOUD_NAME: 'kontrol-test', CLOUDINARY_API_KEY: '123456', CLOUDINARY_API_SECRET: 'abcd' }

function respond(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) }
}

let fetchMock

beforeEach(() => {
  for (const [key, value] of Object.entries(ENV)) vi.stubEnv(key, value)
  fetchMock = vi.fn(() => Promise.resolve(respond({ result: 'ok' })))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('fileStorage · firmas', () => {
  it('firma igual que el ejemplo de la documentación de Cloudinary', () => {
    // https://cloudinary.com/documentation/authentication_signatures
    const signature = signParams(
      { timestamp: 1315060510, public_id: 'sample_image', eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop' },
      'abcd'
    )
    expect(signature).toBe('bfd09f95f331f558cbd1320e67aa8d488770583e')
  })

  it('omite parámetros vacíos al firmar', () => {
    expect(signParams({ a: '1', b: '', c: null, d: undefined }, 's')).toBe(signParams({ a: '1' }, 's'))
  })

  it('emite una firma de subida para la carpeta del propósito', () => {
    const data = createUploadSignature('evidence', 1_700_000_000_500)
    expect(data).toEqual({
      cloudName: 'kontrol-test',
      apiKey: '123456',
      folder: 'kontrol/evidence',
      timestamp: 1_700_000_000,
      signature: signParams({ folder: 'kontrol/evidence', timestamp: 1_700_000_000 }, 'abcd'),
      uploadUrl: 'https://api.cloudinary.com/v1_1/kontrol-test/auto/upload',
    })
    expect(() => createUploadSignature('avatar')).toThrow('Unknown upload purpose')
  })

  it('verifica la firma que Cloudinary devuelve tras subir', () => {
    const signature = signParams({ public_id: 'kontrol/chat/x', version: 17 }, 'abcd')
    expect(verifyUploadSignature({ publicId: 'kontrol/chat/x', version: 17, signature })).toBe(true)
    expect(verifyUploadSignature({ publicId: 'kontrol/chat/y', version: 17, signature })).toBe(false)
    expect(verifyUploadSignature({ publicId: 'kontrol/chat/x', version: 18, signature })).toBe(false)
    expect(verifyUploadSignature({ publicId: 'kontrol/chat/x', version: 17, signature: 'corta' })).toBe(false)
    expect(verifyUploadSignature({ publicId: '', version: 17, signature })).toBe(false)
  })
})

describe('fileStorage · configuración', () => {
  it('requiere las tres variables', () => {
    expect(isFileStorageConfigured()).toBe(true)
    vi.stubEnv('CLOUDINARY_API_SECRET', ' ')
    expect(isFileStorageConfigured()).toBe(false)
    expect(() => createUploadSignature('chat')).toThrow(FileStorageNotConfiguredError)
    expect(() => verifyUploadSignature({ publicId: 'a', version: 1, signature: 'b' })).toThrow('not configured')
  })
})

describe('fileStorage · URLs y claves', () => {
  it('arma la URL de entrega según el tipo de recurso', () => {
    expect(buildDeliveryUrl({ resourceType: 'image', publicId: 'kontrol/evidence/a', version: 3, format: 'png' }))
      .toBe('https://res.cloudinary.com/kontrol-test/image/upload/v3/kontrol/evidence/a.png')
    expect(buildDeliveryUrl({ resourceType: 'raw', publicId: 'kontrol/chat/b.txt', version: 4, format: 'txt' }))
      .toBe('https://res.cloudinary.com/kontrol-test/raw/upload/v4/kontrol/chat/b.txt')
    expect(() => buildDeliveryUrl({ resourceType: 'audio', publicId: 'a', version: 1 })).toThrow('Unknown resource type')
  })

  it('guarda el tipo de recurso dentro de la clave', () => {
    expect(toStorageKey('video', 'kontrol/chat/c')).toBe('video:kontrol/chat/c')
    expect(parseStorageKey('video:kontrol/chat/c')).toEqual({ resourceType: 'video', publicId: 'kontrol/chat/c' })
    expect(parseStorageKey('abc123-uploadthing-key')).toBeNull()
    expect(parseStorageKey(null)).toBeNull()
    expect(() => toStorageKey('pdf', 'x')).toThrow('Unknown resource type')
  })
})

describe('fileStorage · borrado', () => {
  it('borra cada archivo con su tipo de recurso y omite claves viejas', async () => {
    const result = await deleteStoredFiles(['image:kontrol/evidence/a', 'legacy-key', 'raw:kontrol/chat/b.txt'])

    expect(result).toEqual({ deleted: 2, skipped: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.cloudinary.com/v1_1/kontrol-test/image/destroy')
    const body = Object.fromEntries(init.body)
    expect(body).toMatchObject({ public_id: 'kontrol/evidence/a', invalidate: 'true', api_key: '123456' })
    expect(body.signature).toBe(
      signParams({ invalidate: 'true', public_id: 'kontrol/evidence/a', timestamp: Number(body.timestamp) }, 'abcd')
    )
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.cloudinary.com/v1_1/kontrol-test/raw/destroy')
  })

  it('acepta "not found" y no llama a Cloudinary sin claves suyas', async () => {
    fetchMock.mockResolvedValueOnce(respond({ result: 'not found' }))
    await expect(deleteStoredFiles(['image:a'])).resolves.toEqual({ deleted: 1, skipped: 0 })
    await expect(deleteStoredFiles(['legacy'])).resolves.toEqual({ deleted: 0, skipped: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('falla si Cloudinary no confirma o responde con error', async () => {
    fetchMock.mockResolvedValueOnce(respond({ result: 'error' }))
    await expect(deleteStoredFiles(['image:a'])).rejects.toThrow('did not confirm')

    fetchMock.mockResolvedValueOnce(respond({ error: { message: 'Invalid Signature' } }, 401))
    await expect(deleteStoredFiles(['image:a'])).rejects.toThrow('Cloudinary responded 401: Invalid Signature')

    fetchMock.mockResolvedValueOnce({ ok: false, status: 502, json: () => Promise.reject(new Error('html')) })
    await expect(deleteStoredFiles(['image:a'])).rejects.toThrow('Cloudinary responded 502: unknown error')
  })

  it('falla sin credenciales cuando hay archivos que borrar', async () => {
    vi.stubEnv('CLOUDINARY_API_KEY', '')
    await expect(deleteStoredFiles(['image:a'])).rejects.toThrow(FileStorageNotConfiguredError)
  })
})

describe('fileStorage · subida desde el servidor', () => {
  it('sube el buffer firmado y devuelve URL y clave', async () => {
    fetchMock.mockResolvedValueOnce(respond({ resource_type: 'image', public_id: 'kontrol/evidence/s', version: 9, format: 'png' }))

    const uploaded = await uploadBuffer({ buffer: Buffer.from('x'), filename: 's.png', mimeType: 'image/png', purpose: 'evidence' })

    expect(uploaded).toEqual({
      url: 'https://res.cloudinary.com/kontrol-test/image/upload/v9/kontrol/evidence/s.png',
      key: 'image:kontrol/evidence/s',
    })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.cloudinary.com/v1_1/kontrol-test/auto/upload')
    expect(init.body.get('folder')).toBe('kontrol/evidence')
    expect(init.body.get('api_key')).toBe('123456')
    expect(init.body.get('file')).toBeInstanceOf(Blob)
  })
})
