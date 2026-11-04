import { z } from 'zod'
import { UPLOAD_FOLDERS } from '../services/fileStorage.js'

export const uploadSignatureSchema = z.object({
  purpose: z.enum(Object.keys(UPLOAD_FOLDERS), {
    message: `Purpose must be one of: ${Object.keys(UPLOAD_FOLDERS).join(', ')}.`,
  }),
})

// Lo que Cloudinary devolvió al navegador tras subir la evidencia. Solo
// `publicId`, `version` y `signature` están firmados; el resto se usa para
// armar la URL y la etiqueta, nunca para decidir permisos.
export const createEvidenceSchema = z.object({
  publicId: z.string().min(1).max(255),
  version: z.coerce.number().int().positive(),
  signature: z.string().regex(/^[a-f0-9]{40}$/, 'Invalid upload signature.'),
  resourceType: z.enum(['image', 'video', 'raw']),
  format: z.string().max(20).regex(/^[a-z0-9]*$/i).optional(),
  mimeType: z.string().max(255).optional(),
  descripcion: z.string().max(500).optional(),
  progressEntryId: z.coerce.number().int().positive().optional(),
})
