import { createUploadSignature, isFileStorageConfigured } from '../services/fileStorage.js'

// POST /api/uploads/signature
// El navegador sube directo a Cloudinary con estos parámetros firmados.
export const createSignature = async (req, res) => {
  if (!isFileStorageConfigured()) {
    return res.status(503).json({ success: false, message: 'File uploads are not configured.' })
  }

  return res.json({ success: true, data: createUploadSignature(req.body.purpose) })
}
