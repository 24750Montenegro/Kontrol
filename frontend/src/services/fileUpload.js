import { apiFetch } from './api.js'

/**
 * Subida directa a Cloudinary: el backend firma los parámetros
 * (POST /api/uploads/signature) y el navegador sube cada archivo a Cloudinary
 * sin pasar los bytes por el servidor de Kontrol.
 */

const MB = 1024 * 1024

// Dentro de los máximos del plan gratuito de Cloudinary: 10 MB por imagen o
// archivo y 100 MB por video (el audio cuenta como video).
export const UPLOAD_LIMITS = Object.freeze({
  chat: { maxFiles: 6, image: 8 * MB, video: 64 * MB, audio: 32 * MB, pdf: 10 * MB, text: 4 * MB, file: 10 * MB },
  evidence: { maxFiles: 3, image: 8 * MB, video: 64 * MB, audio: 10 * MB, pdf: 10 * MB, text: 4 * MB, file: 10 * MB },
})

export function fileKind(mimeType = '') {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.startsWith('text/')) return 'text'
  return 'file'
}

const formatMb = (bytes) => `${Math.round(bytes / MB)} MB`

export function validateFiles(files, purpose) {
  const limits = UPLOAD_LIMITS[purpose]
  if (!limits) throw new TypeError(`Unknown upload purpose: ${purpose}`)
  if (files.length > limits.maxFiles) {
    throw new Error(`You can upload up to ${limits.maxFiles} files at a time.`)
  }
  for (const file of files) {
    const max = limits[fileKind(file.type)]
    if (file.size > max) {
      throw new Error(`"${file.name || 'File'}" exceeds the ${formatMb(max)} limit.`)
    }
  }
}

async function requestSignature(purpose, token) {
  const res = await apiFetch('/api/uploads/signature', {
    method: 'POST',
    body: JSON.stringify({ purpose }),
    ...(token !== undefined ? { token } : {}),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || !body?.data) throw new Error(body?.message || 'Could not prepare the upload.')
  return body.data
}

async function uploadOne(file, signed) {
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', signed.apiKey)
  form.append('timestamp', String(signed.timestamp))
  form.append('folder', signed.folder)
  form.append('signature', signed.signature)

  const res = await fetch(signed.uploadUrl, { method: 'POST', body: form })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.error?.message || 'Upload failed.')

  return {
    publicId: body.public_id,
    version: body.version,
    signature: body.signature,
    resourceType: body.resource_type,
    format: body.format,
    url: body.secure_url,
    bytes: body.bytes,
    width: body.width,
    height: body.height,
    duration: body.duration,
    filename: file.name || body.original_filename || 'Archivo',
    mimeType: file.type || '',
    kind: fileKind(file.type),
  }
}

/** Sube los archivos y devuelve lo que respondió Cloudinary por cada uno. */
export async function uploadFiles(fileList, { purpose, token } = {}) {
  const files = Array.from(fileList ?? []).filter(Boolean)
  if (!files.length) return []
  validateFiles(files, purpose)

  const signed = await requestSignature(purpose, token)
  return Promise.all(files.map((file) => uploadOne(file, signed)))
}

/** Adjunto de chat a partir de un resultado de uploadFiles. */
export function toChatAttachment(uploaded) {
  if (!uploaded?.url) return null
  const type = ['image', 'video', 'audio'].includes(uploaded.kind) ? uploaded.kind : 'file'
  return {
    type,
    url: uploaded.url,
    publicId: uploaded.resourceType && uploaded.publicId ? `${uploaded.resourceType}:${uploaded.publicId}` : '',
    filename: uploaded.filename,
    size: uploaded.bytes,
    mimeType: uploaded.mimeType,
    duration: uploaded.duration,
    width: uploaded.width,
    height: uploaded.height,
  }
}

/** Cuerpo de POST /api/projects/:projectId/tasks/:id/evidence. */
export function toEvidencePayload(uploaded, extra = {}) {
  return {
    publicId: uploaded.publicId,
    version: uploaded.version,
    signature: uploaded.signature,
    resourceType: uploaded.resourceType,
    ...(uploaded.format ? { format: uploaded.format } : {}),
    ...(uploaded.mimeType ? { mimeType: uploaded.mimeType } : {}),
    ...extra,
  }
}
