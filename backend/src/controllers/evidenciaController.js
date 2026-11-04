import pool from '../db/pool.js'
import {
  buildDeliveryUrl,
  deleteStoredFiles,
  isFileStorageConfigured,
  toStorageKey,
  verifyUploadSignature,
} from '../services/fileStorage.js'
import { logger } from '../utils/logger.js'

const EVIDENCIA_SELECT = `
  e.id_evidencia, e.descripcion, e.url_archivo, e.tipo_archivo,
  e.timestamp_captura, e.id_tarea, e.id_usuario, e.id_progress_entry,
  u.nombre AS autor_nombre, u.apellido AS autor_apellido
`

// Cloudinary guarda los PDF como `image` y el audio como `video`.
export function evidenceType({ resourceType, format, mimeType = '' }) {
  if (format === 'pdf' || mimeType === 'application/pdf') return 'DOCUMENTO'
  if (resourceType === 'image') return 'IMAGEN'
  if (resourceType === 'video' && !mimeType.startsWith('audio/')) return 'VIDEO'
  return 'OTRO'
}

// GET /api/projects/:projectId/tasks/:id/evidence
export const getTaskEvidence = async (req, res) => {
  const { id: id_tarea } = req.params

  const result = await pool.query(
    `SELECT ${EVIDENCIA_SELECT}
     FROM public.evidencia e
     JOIN public.usuario u ON u.id_usuario = e.id_usuario
     WHERE e.id_tarea = $1
     ORDER BY e.timestamp_captura DESC`,
    [id_tarea]
  )

  return res.json({ success: true, data: result.rows })
}

// POST /api/projects/:projectId/tasks/:id/evidence
// Registra un archivo que el navegador ya subió a Cloudinary con una firma de
// /api/uploads/signature. La firma de la respuesta prueba que el archivo está
// en la cuenta de Kontrol; la URL se arma aquí, no se toma del cliente.
export const createTaskEvidence = async (req, res) => {
  if (!isFileStorageConfigured()) {
    return res.status(503).json({ success: false, message: 'File uploads are not configured.' })
  }

  const { projectId, id: id_tarea } = req.params
  const { publicId, version, signature, resourceType, format, mimeType, descripcion, progressEntryId } = req.body

  if (!verifyUploadSignature({ publicId, version, signature })) {
    return res.status(400).json({ success: false, message: 'The upload could not be verified.' })
  }

  const task = await pool.query(
    'SELECT id_tarea FROM public.tarea WHERE id_tarea = $1 AND id_proyecto = $2',
    [id_tarea, projectId]
  )
  if (!task.rows.length) {
    return res.status(404).json({ success: false, message: 'Task not found.' })
  }

  if (progressEntryId) {
    const entry = await pool.query(
      'SELECT 1 FROM public.project_progress_entry WHERE id_progress_entry = $1 AND id_proyecto = $2',
      [progressEntryId, projectId]
    )
    if (!entry.rows.length) {
      return res.status(404).json({ success: false, message: 'Progress entry not found.' })
    }
  }

  const url = buildDeliveryUrl({ resourceType, publicId, version, format })
  const result = await pool.query(
    `INSERT INTO public.evidencia
      (descripcion, url_archivo, tipo_archivo, id_tarea, id_usuario, public_id, id_progress_entry)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id_evidencia`,
    [
      descripcion ?? null,
      url,
      evidenceType({ resourceType, format, mimeType }),
      id_tarea,
      req.user.id_usuario,
      toStorageKey(resourceType, publicId),
      progressEntryId ?? null,
    ]
  )

  return res.status(201).json({ success: true, data: { idEvidencia: result.rows[0].id_evidencia, url } })
}

// DELETE /api/projects/:projectId/tasks/:id/evidence/:evidenceId
export const deleteTaskEvidence = async (req, res) => {
  const { id: id_tarea, evidenceId } = req.params

  const existing = await pool.query(
    'SELECT id_evidencia, public_id FROM public.evidencia WHERE id_evidencia = $1 AND id_tarea = $2',
    [evidenceId, id_tarea]
  )

  if (!existing.rows.length) {
    return res.status(404).json({ success: false, message: 'Evidence not found.' })
  }

  await pool.query('DELETE FROM public.evidencia WHERE id_evidencia = $1', [evidenceId])

  const publicId = existing.rows[0].public_id
  if (publicId) {
    try {
      await deleteStoredFiles([publicId])
    } catch (error) {
      logger.error('Could not delete evidence file from Cloudinary:', error)
    }
  }

  return res.json({ success: true })
}
