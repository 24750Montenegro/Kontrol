import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  UPLOAD_LIMITS,
  fileKind,
  toChatAttachment,
  toEvidencePayload,
  uploadFiles,
  validateFiles,
} from '@/services/fileUpload.js'

const MB = 1024 * 1024
const signed = {
  cloudName: 'kontrol-test',
  apiKey: '123456',
  folder: 'kontrol/chat',
  timestamp: 1730000000,
  signature: 'f'.repeat(40),
  uploadUrl: 'https://api.cloudinary.com/v1_1/kontrol-test/auto/upload',
}

const respond = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(body),
})

// Un File con tamaño arbitrario sin reservar los bytes.
function fakeFile(name, type, size) {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

let fetchMock

beforeEach(() => {
  localStorage.setItem('token', 'jwt')
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('fileUpload · validación', () => {
  it('clasifica por tipo MIME', () => {
    expect(fileKind('image/png')).toBe('image')
    expect(fileKind('video/mp4')).toBe('video')
    expect(fileKind('audio/webm')).toBe('audio')
    expect(fileKind('application/pdf')).toBe('pdf')
    expect(fileKind('text/plain')).toBe('text')
    expect(fileKind('application/zip')).toBe('file')
    expect(fileKind()).toBe('file')
  })

  it('aplica el límite de cada tipo y la cantidad máxima', () => {
    expect(() => validateFiles([fakeFile('a.png', 'image/png', 8 * MB)], 'chat')).not.toThrow()
    expect(() => validateFiles([fakeFile('a.png', 'image/png', 8 * MB + 1)], 'chat')).toThrow('"a.png" exceeds the 8 MB limit.')
    expect(() => validateFiles([fakeFile('v.mp4', 'video/mp4', 60 * MB)], 'evidence')).not.toThrow()
    expect(() => validateFiles([fakeFile('d.pdf', 'application/pdf', 11 * MB)], 'evidence')).toThrow('10 MB')

    const many = Array.from({ length: UPLOAD_LIMITS.evidence.maxFiles + 1 }, (_, i) => fakeFile(`${i}.png`, 'image/png', 1))
    expect(() => validateFiles(many, 'evidence')).toThrow('up to 3 files')
    expect(() => validateFiles([], 'avatar')).toThrow('Unknown upload purpose')
  })
})

describe('fileUpload · subida', () => {
  it('pide la firma y sube cada archivo directo a Cloudinary', async () => {
    fetchMock
      .mockResolvedValueOnce(respond({ success: true, data: signed }))
      .mockResolvedValueOnce(respond({
        public_id: 'kontrol/chat/a', version: 3, signature: 'a'.repeat(40), resource_type: 'image',
        format: 'png', secure_url: 'https://res.cloudinary.com/kontrol-test/image/upload/v3/kontrol/chat/a.png',
        bytes: 120, width: 10, height: 20,
      }))

    const [result] = await uploadFiles([fakeFile('a.png', 'image/png', 120)], { purpose: 'chat' })

    const [signatureUrl, signatureInit] = fetchMock.mock.calls[0]
    expect(signatureUrl).toMatch(/\/api\/uploads\/signature$/)
    expect(JSON.parse(signatureInit.body)).toEqual({ purpose: 'chat' })
    expect(new Headers(signatureInit.headers).get('Authorization')).toBe('Bearer jwt')

    const [uploadUrl, uploadInit] = fetchMock.mock.calls[1]
    expect(uploadUrl).toBe(signed.uploadUrl)
    expect(uploadInit.body.get('api_key')).toBe('123456')
    expect(uploadInit.body.get('folder')).toBe('kontrol/chat')
    expect(uploadInit.body.get('timestamp')).toBe('1730000000')
    expect(uploadInit.body.get('signature')).toBe(signed.signature)

    expect(result).toMatchObject({
      publicId: 'kontrol/chat/a', version: 3, resourceType: 'image', format: 'png',
      bytes: 120, filename: 'a.png', mimeType: 'image/png', kind: 'image',
    })
  })

  it('usa el token que se le pasa', async () => {
    fetchMock
      .mockResolvedValueOnce(respond({ data: signed }))
      .mockResolvedValueOnce(respond({ public_id: 'p', version: 1, resource_type: 'raw', secure_url: 'https://x' }))
    await uploadFiles([fakeFile('n.txt', 'text/plain', 1)], { purpose: 'chat', token: 'otro' })
    expect(new Headers(fetchMock.mock.calls[0][1].headers).get('Authorization')).toBe('Bearer otro')
  })

  it('no llama a la red sin archivos o si un archivo excede el límite', async () => {
    expect(await uploadFiles([], { purpose: 'chat' })).toEqual([])
    expect(await uploadFiles(null, { purpose: 'chat' })).toEqual([])
    await expect(uploadFiles([fakeFile('g.png', 'image/png', 9 * MB)], { purpose: 'chat' })).rejects.toThrow('8 MB')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('propaga los errores del backend y de Cloudinary', async () => {
    fetchMock.mockResolvedValueOnce(respond({ success: false, message: 'File uploads are not configured.' }, 503))
    await expect(uploadFiles([fakeFile('a.png', 'image/png', 1)], { purpose: 'chat' }))
      .rejects.toThrow('File uploads are not configured.')

    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.reject(new Error('html')) })
    await expect(uploadFiles([fakeFile('a.png', 'image/png', 1)], { purpose: 'chat' }))
      .rejects.toThrow('Could not prepare the upload.')

    fetchMock
      .mockResolvedValueOnce(respond({ data: signed }))
      .mockResolvedValueOnce(respond({ error: { message: 'File size too large.' } }, 400))
    await expect(uploadFiles([fakeFile('a.png', 'image/png', 1)], { purpose: 'chat' }))
      .rejects.toThrow('File size too large.')

    fetchMock
      .mockResolvedValueOnce(respond({ data: signed }))
      .mockResolvedValueOnce({ ok: false, status: 502, json: () => Promise.reject(new Error('html')) })
    await expect(uploadFiles([fakeFile('a.png', 'image/png', 1)], { purpose: 'chat' }))
      .rejects.toThrow('Upload failed.')
  })
})

describe('fileUpload · conversiones', () => {
  const uploaded = {
    publicId: 'kontrol/chat/v', version: 5, signature: 'b'.repeat(40), resourceType: 'video', format: 'webm',
    url: 'https://res.cloudinary.com/x/video/upload/v5/kontrol/chat/v.webm', bytes: 99, duration: 3.5,
    filename: 'nota.webm', mimeType: 'audio/webm', kind: 'audio',
  }

  it('arma el adjunto de chat con la clave de almacenamiento', () => {
    expect(toChatAttachment(uploaded)).toEqual({
      type: 'audio', url: uploaded.url, publicId: 'video:kontrol/chat/v', filename: 'nota.webm',
      size: 99, mimeType: 'audio/webm', duration: 3.5, width: undefined, height: undefined,
    })
    expect(toChatAttachment({ ...uploaded, kind: 'pdf' }).type).toBe('file')
    expect(toChatAttachment({ url: 'https://x' }).publicId).toBe('')
    expect(toChatAttachment(null)).toBeNull()
  })

  it('arma el cuerpo para registrar la evidencia', () => {
    expect(toEvidencePayload(uploaded, { descripcion: 'Audio' })).toEqual({
      publicId: 'kontrol/chat/v', version: 5, signature: 'b'.repeat(40), resourceType: 'video',
      format: 'webm', mimeType: 'audio/webm', descripcion: 'Audio',
    })
    expect(toEvidencePayload({ publicId: 'p.txt', version: 1, signature: 's', resourceType: 'raw' }))
      .toEqual({ publicId: 'p.txt', version: 1, signature: 's', resourceType: 'raw' })
  })
})
