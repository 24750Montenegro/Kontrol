import { createRouter } from '../middleware/asyncHandler.js'
import requireAuth from '../middleware/requireAuth.js'
import validate from '../middleware/validate.js'
import { uploadSignatureSchema } from '../schemas/uploadSchemas.js'
import { createSignature } from '../controllers/uploadController.js'

const router = createRouter()
router.use(requireAuth)

router.post('/signature', validate(uploadSignatureSchema), createSignature)

export default router
