import crypto from 'node:crypto'

/**
 * Almacenamiento de archivos en Cloudinary (adjuntos del chat y evidencias).
 *
 * El navegador sube cada archivo directo a Cloudinary con una firma que emite
 * este servidor (createUploadSignature): los bytes nunca pasan por la VM, que
 * tiene 1 GB de RAM. Al registrar una evidencia, el servidor comprueba la
 * firma que Cloudinary devuelve en la respuesta de la subida
 * (verifyUploadSignature), así que solo se aceptan archivos subidos con las
 * credenciales de Kontrol, y arma la URL de entrega él mismo.
 *
 * Se usa la API REST directamente: firmar es un SHA-1 de los parámetros
 * ordenados más el secreto, y no hace falta el SDK para eso.
 * https://cloudinary.com/documentation/authentication_signatures
 */

const API_BASE = 'https://api.cloudinary.com/v1_1'
const DELIVERY_BASE = 'https://res.cloudinary.com'

export const UPLOAD_FOLDERS = Object.freeze({
  chat: 'kontrol/chat',
  evidence: 'kontrol/evidence',
})

// Cloudinary clasifica audio como `video` y PDF como `image`; el resto es `raw`.
const RESOURCE_TYPES = new Set(['image', 'video', 'raw'])
const STORAGE_KEY = /^(image|video|raw):(.+)$/
const DELETE_CONCURRENCY = 5

export class FileStorageNotConfiguredError extends Error {
  constructor() {
    super('File uploads are not configured.')
    this.name = 'FileStorageNotConfiguredError'
  }
}

function readConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null
}

function requireConfig() {
  const config = readConfig()
  if (!config) throw new FileStorageNotConfiguredError()
  return config
}

export function isFileStorageConfigured() {
  return readConfig() !== null
}

/** Firma de Cloudinary: SHA-1 de `k=v&k=v` (claves ordenadas) seguido del secreto. */
export function signParams(params, apiSecret) {
  const payload = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return crypto.createHash('sha1').update(payload + apiSecret).digest('hex')
}

/** Parámetros para que el navegador suba a la carpeta de `purpose`. Valen 1 hora. */
export function createUploadSignature(purpose, now = Date.now()) {
  const folder = UPLOAD_FOLDERS[purpose]
  if (!folder) throw new TypeError(`Unknown upload purpose: ${purpose}`)

  const { cloudName, apiKey, apiSecret } = requireConfig()
  const timestamp = Math.floor(now / 1000)
  return {
    cloudName,
    apiKey,
    folder,
    timestamp,
    signature: signParams({ folder, timestamp }, apiSecret),
    uploadUrl: `${API_BASE}/${cloudName}/auto/upload`,
  }
}

/** true si `signature` es la que Cloudinary calcula para ese public_id y versión. */
export function verifyUploadSignature({ publicId, version, signature }) {
  const { apiSecret } = requireConfig()
  if (typeof publicId !== 'string' || !publicId || typeof signature !== 'string') return false

  const expected = Buffer.from(signParams({ public_id: publicId, version }, apiSecret))
  const received = Buffer.from(signature)
  return expected.length === received.length && crypto.timingSafeEqual(expected, received)
}

/** URL https de entrega. Los `raw` ya llevan la extensión en el public_id. */
export function buildDeliveryUrl({ resourceType, publicId, version, format }) {
  if (!RESOURCE_TYPES.has(resourceType)) throw new TypeError(`Unknown resource type: ${resourceType}`)
  const { cloudName } = requireConfig()
  const extension = resourceType !== 'raw' && format ? `.${format}` : ''
  return `${DELIVERY_BASE}/${cloudName}/${resourceType}/upload/v${version}/${publicId}${extension}`
}

/**
 * Clave que se guarda en `evidencia.public_id` y `attachments[].publicId`.
 * Borrar en Cloudinary exige el tipo de recurso, así que va delante.
 */
export function toStorageKey(resourceType, publicId) {
  if (!RESOURCE_TYPES.has(resourceType)) throw new TypeError(`Unknown resource type: ${resourceType}`)
  return `${resourceType}:${publicId}`
}

export function parseStorageKey(key) {
  const match = typeof key === 'string' ? STORAGE_KEY.exec(key) : null
  return match ? { resourceType: match[1], publicId: match[2] } : null
}

async function postForm(url, body) {
  const response = await fetch(url, { method: 'POST', body })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`Cloudinary responded ${response.status}: ${data?.error?.message ?? 'unknown error'}`)
  }
  return data
}

async function destroy(config, { resourceType, publicId }) {
  const params = { invalidate: 'true', public_id: publicId, timestamp: Math.floor(Date.now() / 1000) }
  const body = new URLSearchParams({
    ...params,
    timestamp: String(params.timestamp),
    api_key: config.apiKey,
    signature: signParams(params, config.apiSecret),
  })
  const data = await postForm(`${API_BASE}/${config.cloudName}/${resourceType}/destroy`, body)
  // `not found` también cuenta: el objetivo es que el archivo no exista.
  if (data.result !== 'ok' && data.result !== 'not found') {
    throw new Error(`Cloudinary did not confirm the deletion of ${publicId}.`)
  }
}

/**
 * Borra los archivos de esas claves. Falla si alguno no se pudo borrar, para
 * que quien llama reintente (el cierre de empresa lo hace). Las claves que no
 * son de Cloudinary (las de UploadThing de antes de la migración) se omiten.
 */
export async function deleteStoredFiles(keys) {
  const targets = keys.map(parseStorageKey).filter(Boolean)
  if (!targets.length) return { deleted: 0, skipped: keys.length }

  const config = requireConfig()
  for (let i = 0; i < targets.length; i += DELETE_CONCURRENCY) {
    await Promise.all(targets.slice(i, i + DELETE_CONCURRENCY).map((target) => destroy(config, target)))
  }
  return { deleted: targets.length, skipped: keys.length - targets.length }
}

/** Sube un archivo desde el servidor (solo lo usa el sembrado de datos de prueba). */
export async function uploadBuffer({ buffer, filename, mimeType, purpose }) {
  const { apiKey, folder, timestamp, signature, uploadUrl } = createUploadSignature(purpose)
  const body = new FormData()
  body.append('file', new Blob([buffer], { type: mimeType }), filename)
  body.append('api_key', apiKey)
  body.append('timestamp', String(timestamp))
  body.append('folder', folder)
  body.append('signature', signature)

  const data = await postForm(uploadUrl, body)
  return {
    url: buildDeliveryUrl({
      resourceType: data.resource_type,
      publicId: data.public_id,
      version: data.version,
      format: data.format,
    }),
    key: toStorageKey(data.resource_type, data.public_id),
  }
}
