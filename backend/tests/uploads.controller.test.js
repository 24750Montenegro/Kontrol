import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/db/pool.js', () => ({
  default: { query: vi.fn() },
}))

import request from 'supertest'
import pool from '../src/db/pool.js'
import { signParams } from '../src/services/fileStorage.js'
import { evidenceType } from '../src/controllers/evidenciaController.js'
import { buildTestApp, signToken, dbRows } from './helpers/authTestApp.js'

const app = buildTestApp()
const auth = (req) => req.set('Authorization', `Bearer ${signToken()}`)

const SECRET = 'abcd'
const uploaded = (overrides = {}) => {
  const publicId = overrides.publicId ?? 'kontrol/evidence/foto'
  const version = overrides.version ?? 1730000000
  return {
    publicId,
    version,
    signature: signParams({ public_id: publicId, version }, SECRET),
    resourceType: 'image',
    format: 'jpg',
    mimeType: 'image/jpeg',
    ...overrides,
  }
}

let fetchMock

beforeEach(() => {
  vi.mocked(pool.query).mockReset()
  vi.stubEnv('CLOUDINARY_CLOUD_NAME', 'kontrol-test')
  vi.stubEnv('CLOUDINARY_API_KEY', '123456')
  vi.stubEnv('CLOUDINARY_API_SECRET', SECRET)
  fetchMock = vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ result: 'ok' }) }))
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('POST /api/uploads/signature', () => {
  it('exige sesión', async () => {
    const res = await request(app).post('/api/uploads/signature').send({ purpose: 'chat' })
    expect(res.status).toBe(401)
  })

  it('rechaza un propósito desconocido', async () => {
    const res = await auth(request(app).post('/api/uploads/signature')).send({ purpose: 'avatar' })
    expect(res.status).toBe(400)
  })

  it('responde 503 si Cloudinary no está configurado', async () => {
    vi.stubEnv('CLOUDINARY_API_SECRET', '')
    const res = await auth(request(app).post('/api/uploads/signature')).send({ purpose: 'chat' })
    expect(res.status).toBe(503)
    expect(res.body.message).toBe('File uploads are not configured.')
  })

  it('devuelve los parámetros firmados para subir', async () => {
    const res = await auth(request(app).post('/api/uploads/signature')).send({ purpose: 'chat' })
    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({
      cloudName: 'kontrol-test',
      apiKey: '123456',
      folder: 'kontrol/chat',
      uploadUrl: 'https://api.cloudinary.com/v1_1/kontrol-test/auto/upload',
    })
    const { folder, timestamp, signature } = res.body.data
    expect(signature).toBe(signParams({ folder, timestamp }, SECRET))
    expect(res.body.data).not.toHaveProperty('apiSecret')
  })
})

describe('POST /api/projects/:projectId/tasks/:id/evidence', () => {
  const path = '/api/projects/10/tasks/5/evidence'

  it('registra la evidencia con la URL armada en el servidor', async () => {
    pool.query
      .mockResolvedValueOnce(dbRows([{ id_tarea: 5 }]))
      .mockResolvedValueOnce(dbRows([{ id_evidencia: 33 }]))

    const res = await auth(request(app).post(path)).send(uploaded({ descripcion: 'Exhibidor' }))

    expect(res.status).toBe(201)
    const url = 'https://res.cloudinary.com/kontrol-test/image/upload/v1730000000/kontrol/evidence/foto.jpg'
    expect(res.body.data).toEqual({ idEvidencia: 33, url })
    expect(pool.query.mock.calls[0][1]).toEqual([5, 10])
    expect(pool.query.mock.calls[1][1]).toEqual([
      'Exhibidor', url, 'IMAGEN', 5, 7, 'image:kontrol/evidence/foto', null,
    ])
  })

  it('rechaza una subida cuya firma no es de Cloudinary', async () => {
    const res = await auth(request(app).post(path)).send({ ...uploaded(), signature: 'a'.repeat(40) })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('The upload could not be verified.')
    expect(pool.query).not.toHaveBeenCalled()
  })

  it('valida el cuerpo', async () => {
    const res = await auth(request(app).post(path)).send({ ...uploaded(), resourceType: 'audio' })
    expect(res.status).toBe(400)
  })

  it('responde 404 si la tarea no es del proyecto', async () => {
    pool.query.mockResolvedValueOnce(dbRows([]))
    const res = await auth(request(app).post(path)).send(uploaded())
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Task not found.')
  })

  it('comprueba que el avance sea del mismo proyecto', async () => {
    pool.query
      .mockResolvedValueOnce(dbRows([{ id_tarea: 5 }]))
      .mockResolvedValueOnce(dbRows([]))
    const res = await auth(request(app).post(path)).send(uploaded({ progressEntryId: 8 }))
    expect(res.status).toBe(404)
    expect(pool.query.mock.calls[1][1]).toEqual([8, 10])

    pool.query
      .mockResolvedValueOnce(dbRows([{ id_tarea: 5 }]))
      .mockResolvedValueOnce(dbRows([{ '?column?': 1 }]))
      .mockResolvedValueOnce(dbRows([{ id_evidencia: 34 }]))
    const ok = await auth(request(app).post(path)).send(uploaded({ progressEntryId: 8 }))
    expect(ok.status).toBe(201)
    expect(pool.query.mock.calls[4][1][6]).toBe(8)
  })

  it('responde 503 si Cloudinary no está configurado', async () => {
    vi.stubEnv('CLOUDINARY_CLOUD_NAME', '')
    const res = await auth(request(app).post(path)).send(uploaded())
    expect(res.status).toBe(503)
  })
})

describe('DELETE /api/projects/:projectId/tasks/:id/evidence/:evidenceId', () => {
  const path = '/api/projects/10/tasks/5/evidence/33'

  it('borra la fila y luego el archivo en Cloudinary', async () => {
    pool.query
      .mockResolvedValueOnce(dbRows([{ id_evidencia: 33, public_id: 'image:kontrol/evidence/foto' }]))
      .mockResolvedValueOnce(dbRows([]))

    const res = await auth(request(app).delete(path))

    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.cloudinary.com/v1_1/kontrol-test/image/destroy')
  })

  it('responde éxito aunque Cloudinary falle', async () => {
    pool.query
      .mockResolvedValueOnce(dbRows([{ id_evidencia: 33, public_id: 'video:kontrol/evidence/v' }]))
      .mockResolvedValueOnce(dbRows([]))
    fetchMock.mockRejectedValueOnce(new Error('offline'))

    const res = await auth(request(app).delete(path))
    expect(res.status).toBe(200)
  })

  it('responde 404 si la evidencia no existe', async () => {
    pool.query.mockResolvedValueOnce(dbRows([]))
    const res = await auth(request(app).delete(path))
    expect(res.status).toBe(404)
  })
})

describe('evidenceType', () => {
  it('clasifica según lo que Cloudinary reporta', () => {
    expect(evidenceType({ resourceType: 'image', format: 'png' })).toBe('IMAGEN')
    expect(evidenceType({ resourceType: 'image', format: 'pdf' })).toBe('DOCUMENTO')
    expect(evidenceType({ resourceType: 'raw', mimeType: 'application/pdf' })).toBe('DOCUMENTO')
    expect(evidenceType({ resourceType: 'video', mimeType: 'video/mp4' })).toBe('VIDEO')
    expect(evidenceType({ resourceType: 'video', mimeType: 'audio/mpeg' })).toBe('OTRO')
    expect(evidenceType({ resourceType: 'raw' })).toBe('OTRO')
  })
})
