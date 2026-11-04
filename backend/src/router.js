import { Router } from 'express'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import globalRoutes from './routes/globalRoutes.js'
import productRoutes from './routes/productRoutes.js'
import supplierRoutes from './routes/supplierRoutes.js'
import inventoryMovementRoutes from './routes/inventoryMovementRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import reportsRoutes from './routes/reportsRoutes.js'
import budgetRoutes from './routes/budgetRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import teamRoutes from './routes/teamRoutes.js'
import agentRoutes from './routes/agentRoutes.js'
import integrationRoutes from './routes/integrationRoutes.js'
import marketingRoutes from './routes/marketingRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import billingRoutes from './routes/billingRoutes.js'
import legalRoutes from './routes/legalRoutes.js'
import { authLimiter } from './middleware/rateLimit.js'
import pool from './db/pool.js'
import { createHealthHandler } from './db/poolStats.js'


const router = Router()

// DT-15 — `db` expone los contadores del pool para muestrearlos desde k6.
router.get('/health', createHealthHandler(pool))

router.use('/auth', authLimiter, authRoutes)
router.use('/legal', legalRoutes)
router.use('/users', userRoutes)
router.use('/global', globalRoutes)
router.use('/products', productRoutes)
router.use('/suppliers', supplierRoutes)
router.use('/inventory-movements', inventoryMovementRoutes)
router.use('/projects', projectRoutes)
router.use('/companies', companyRoutes)
router.use('/reports', reportsRoutes)
router.use('/budgets', budgetRoutes)
router.use('/projects/:projectId/tasks', taskRoutes)
router.use('/admin', adminRoutes)
router.use('/chat', chatRoutes)
router.use('/teams', teamRoutes)
router.use('/agent', agentRoutes)
router.use('/integrations', integrationRoutes)
router.use('/marketing', marketingRoutes)
router.use('/billing', billingRoutes)
router.use('/uploads', uploadRoutes)

export default router
