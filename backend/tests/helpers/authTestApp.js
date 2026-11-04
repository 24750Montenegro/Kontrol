import express from 'express'
import jwt from 'jsonwebtoken'
import { vi } from 'vitest'
import pool from '../../src/db/pool.js'

import reportsRoutes from '../../src/routes/reportsRoutes.js'
import projectRoutes from '../../src/routes/projectRoutes.js'
import taskRoutes from '../../src/routes/taskRoutes.js'
import companyRoutes from '../../src/routes/companyRoutes.js'
import marketingRoutes from '../../src/routes/marketingRoutes.js'
import productRoutes from '../../src/routes/productRoutes.js'
import { errorHandler } from '../../src/middleware/errorHandler.js'
import integrationRoutes from '../../src/routes/integrationRoutes.js'
import inventoryMovementRoutes from '../../src/routes/inventoryMovementRoutes.js'
import authRoutes from '../../src/routes/authRoutes.js'
import uploadRoutes from '../../src/routes/uploadRoutes.js'

export const JWT_SECRET = 'secreto-de-pruebas-hu31'
process.env.JWT_SECRET = JWT_SECRET

export function installTestSessionAccountMock() {
  if (!vi.isMockFunction(pool.query) || pool.query.__sessionAccountMocked) return
  const query = pool.query
  pool.query = new Proxy(query, {
    apply(target, thisArg, args) {
      if (args[0] === 'SELECT activo, token_version FROM public.usuario WHERE id_usuario = $1') {
        return Promise.resolve({ rows: [{ activo: true, token_version: 1 }] })
      }
      return Reflect.apply(target, thisArg, args)
    },
  })
  pool.query.__sessionAccountMocked = true
}

// Firma un JWT de prueba.
export function signToken(overrides = {}, options = {}) {
  return jwt.sign(
    { id_usuario: 7, email: 'ivana@kontrol.gt', nombre_rol: 'user', token_version: 1, ...overrides },
    JWT_SECRET,
    options
  )
}

// Usuario SÍ pertenece a la empresa.
export function companyMembership(rol_empresa, { activo = true, nombre = 'Empresa A' } = {}) {
  return { rows: [{ id_rol_empresa: 1, rol_empresa, activo, nombre }] }
}

// Usuario NO pertenece a la empresa.
export function noMembership() {
  return { rows: [] }
}

// Filas genéricas para que el controller no responda 404.
export function dbRows(rows = [{ id_proyecto: 10, id_reporte: 1 }]) {
  return { rows, rowCount: rows.length }
}

// App con los routers reales bajo los mismos paths que producción.
export function buildTestApp({ mockSessionAccount = true } = {}) {
  if (mockSessionAccount) installTestSessionAccountMock()
  const app = express()
  app.use(express.json())

  app.use('/api/reports', reportsRoutes)
  app.use('/api/projects', projectRoutes)
  app.use('/api/projects/:projectId/tasks', taskRoutes)
  app.use('/api/companies', companyRoutes)
  app.use('/api/marketing', marketingRoutes)
  app.use('/api/products', productRoutes)
  app.use('/api/integrations', integrationRoutes)
  app.use('/api/inventory-movements', inventoryMovementRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/uploads', uploadRoutes)

  app.use(errorHandler)

  return app
}
