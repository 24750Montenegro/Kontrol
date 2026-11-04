import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

// Only the Cloudinary file storage is stubbed. PostgreSQL, Mongo and the worker are real.
const uploads = vi.hoisted(() => ({ deleteFiles: vi.fn() }))
vi.mock('../../src/services/fileStorage.js', async (importOriginal) => ({
  ...(await importOriginal()),
  deleteStoredFiles: (keys) => uploads.deleteFiles(keys),
}))
import {
  api,
  closeDb,
  createCompanyWithOwner,
  createProduct,
  createProject,
  createUser,
  query,
  tokenFor,
  unique,
} from '../db/fixtures.js'
import { connectMongo } from '../../src/db/mongo.js'
import AgentConversation from '../../src/models/AgentConversation.js'
import AgentMessage from '../../src/models/AgentMessage.js'
import AccountPrivacyState from '../../src/models/AccountPrivacyState.js'
import { persistUserTurn } from '../../src/services/agentPersistence.js'
import { processCompanyClosure, processDueCompanyClosures } from '../../src/services/companyClosure.js'

const password = 'Closure-test-password'
const DAY_MS = 24 * 60 * 60 * 1000
const COMPANY_TABLES = [
  'categoria', 'empresa', 'empresa_config', 'empresa_invitacion', 'empresa_usuario', 'equipo',
  'integracion', 'integracion_log', 'marketing_campaign', 'movimiento_inventario', 'proveedor',
  'proyecto', 'proyecto_invitacion', 'reporte', 'venta',
]

async function owner() {
  const ctx = await createCompanyWithOwner()
  await query('UPDATE public.usuario SET password_hash = $1 WHERE id_usuario = $2', [
    await bcrypt.hash(password, 4),
    ctx.owner.id_usuario,
  ])
  return ctx
}

async function addMember(companyId, role) {
  const user = await createUser({ nombre: `Member ${role}` })
  await query(
    `INSERT INTO public.empresa_usuario (id_empresa, id_usuario, id_rol_empresa)
     SELECT $1, $2, id_rol_empresa FROM public.rol_empresa WHERE nombre = $3`,
    [companyId, user.id_usuario, role]
  )
  return { ...user, token: tokenFor(user) }
}

// One row in every kind of company table, including rows that only reach the
// company through foreign keys (tasks, assignments, evidence, supplier links).
async function seedCompany(ctx) {
  const companyId = ctx.company.id_empresa
  const ownerId = ctx.owner.id_usuario
  const member = await addMember(companyId, 'collaborator')
  const { id_proyecto: projectId } = await createProject({ id_empresa: companyId, id_encargado: ownerId })
  const product = await createProduct({ id_proyecto: projectId })
  const one = async (sql, params) => (await query(sql, params)).rows[0]

  const category = await one(
    'INSERT INTO public.categoria (nombre, id_empresa) VALUES ($1, $2) RETURNING id_categoria',
    ['Categoría', companyId]
  )
  await query('UPDATE public.producto SET id_categoria = $1 WHERE id_producto = $2', [
    category.id_categoria,
    product.id_producto,
  ])
  const supplier = await one(
    'INSERT INTO public.proveedor (nombre, id_empresa) VALUES ($1, $2) RETURNING id_proveedor',
    ['Proveedora María Pérez', companyId]
  )
  await query(
    'INSERT INTO public.producto_proveedor (id_producto, id_proveedor, precio_unitario) VALUES ($1, $2, 10)',
    [product.id_producto, supplier.id_proveedor]
  )
  const sale = await one(
    `INSERT INTO public.venta (subtotal, base_imponible, total, id_empresa, id_usuario)
     VALUES (50, 50, 50, $1, $2) RETURNING id_venta`,
    [companyId, ownerId]
  )
  const activity = await one(
    `INSERT INTO public.presupuesto_actividad (nombre, monto_planificado, id_proyecto)
     VALUES ('Actividad', 100, $1) RETURNING id_actividad`,
    [projectId]
  )
  await query(
    `INSERT INTO public.movimiento_inventario
       (tipo, cantidad, id_producto, id_empresa, id_usuario, id_proyecto, id_venta, id_proveedor, id_actividad)
     VALUES ('SALIDA', 1, $1, $2, $3, $4, $5, $6, $7)`,
    [product.id_producto, companyId, ownerId, projectId, sale.id_venta, supplier.id_proveedor, activity.id_actividad]
  )
  await query('INSERT INTO public.proyecto_usuario (id_proyecto, id_usuario) VALUES ($1, $2)', [
    projectId,
    member.id_usuario,
  ])
  const task = await one('INSERT INTO public.tarea (nombre, id_proyecto) VALUES ($1, $2) RETURNING id_tarea', [
    'Tarea',
    projectId,
  ])
  await query('INSERT INTO public.asignacion (id_tarea, id_usuario, id_proyecto) VALUES ($1, $2, $3)', [
    task.id_tarea,
    member.id_usuario,
    projectId,
  ])
  const entry = await one(
    `INSERT INTO public.project_progress_entry (id_proyecto, id_usuario, title, progress_percentage)
     VALUES ($1, $2, 'Avance', 10) RETURNING id_progress_entry`,
    [projectId, ownerId]
  )
  const publicId = `kontrol/evidence/${unique('file')}`
  const fileKey = `image:${publicId}`
  await query(
    `INSERT INTO public.evidencia (url_archivo, tipo_archivo, id_tarea, id_usuario, public_id, id_progress_entry)
     VALUES ($1, 'IMAGEN', $2, $3, $4, $5)`,
    [`https://res.cloudinary.com/kontrol/image/upload/v1/${publicId}.png`, task.id_tarea, member.id_usuario, fileKey, entry.id_progress_entry]
  )
  const team = await one(
    'INSERT INTO public.equipo (nombre, id_empresa, id_lider) VALUES ($1, $2, $3) RETURNING id_equipo',
    ['Equipo', companyId, ownerId]
  )
  await query('INSERT INTO public.equipo_usuario (id_equipo, id_usuario) VALUES ($1, $2)', [
    team.id_equipo,
    member.id_usuario,
  ])
  await query('UPDATE public.proyecto SET id_equipo = $1 WHERE id_proyecto = $2', [team.id_equipo, projectId])
  await query(
    `INSERT INTO public.reporte (titulo, tipo, id_usuario, id_empresa, id_proyecto)
     VALUES ('Reporte', 'AVANCE', $1, $2, $3)`,
    [ownerId, companyId, projectId]
  )
  await query('INSERT INTO public.presupuesto_ajuste (id_proyecto, monto, id_usuario) VALUES ($1, 5, $2)', [
    projectId,
    ownerId,
  ])
  await query('INSERT INTO public.rol_proyecto (id_proyecto, nombre) VALUES ($1, $2)', [projectId, 'Revisor'])
  await query(
    `INSERT INTO public.marketing_campaign (id_empresa, id_proyecto, name, created_by, updated_by)
     VALUES ($1, $2, 'Campaña', $3, $3)`,
    [companyId, projectId, ownerId]
  )
  await query("INSERT INTO public.integracion (id_empresa, slug, status) VALUES ($1, 'slack', 'active')", [companyId])
  await query("INSERT INTO public.integracion_log (id_empresa, slug, status) VALUES ($1, 'slack', 'success')", [
    companyId,
  ])
  await query('INSERT INTO public.empresa_invitacion (id_empresa, token, id_usuario_owner) VALUES ($1, $2, $3)', [
    companyId,
    unique('company-invite-token'),
    ownerId,
  ])
  await query(
    `INSERT INTO public.proyecto_invitacion (id_empresa, id_proyecto, token, id_usuario_invitador)
     VALUES ($1, $2, $3, $4)`,
    [companyId, projectId, unique('project-invite-token'), ownerId]
  )
  await persistUserTurn({ userId: ownerId, empresaId: companyId, content: `assistant prompt ${companyId}` })
  return { member, projectId, taskId: task.id_tarea, productId: product.id_producto, fileKey }
}

const withCompany = (ctx, request, token = ctx.token) =>
  request.set('Authorization', `Bearer ${token}`).set('X-Company-ID', String(ctx.company.id_empresa))
const requestClosure = (ctx, body = {}) =>
  withCompany(ctx, api().post('/api/companies/closure')).send({
    confirm_name: ctx.company.nombre,
    password,
    ...body,
  })
const endExportWindow = (companyId) =>
  query(
    `UPDATE public.company_closure
     SET export_until = CURRENT_TIMESTAMP - INTERVAL '1 minute',
         available_at = CURRENT_TIMESTAMP - INTERVAL '1 minute'
     WHERE company_id = $1`,
    [companyId]
  )
const closureRow = async (companyId) =>
  (await query('SELECT * FROM public.company_closure WHERE company_id = $1', [companyId])).rows[0]

async function companyRowCounts(companyId) {
  const counts = {}
  for (const table of COMPANY_TABLES) {
    const { rows } = await query(`SELECT COUNT(*)::int AS n FROM public.${table} WHERE id_empresa = $1`, [companyId])
    counts[table] = rows[0].n
  }
  return counts
}

beforeAll(connectMongo)
afterAll(async () => {
  await mongoose.disconnect()
  await closeDb()
})
beforeEach(async () => {
  vi.clearAllMocks()
  uploads.deleteFiles.mockResolvedValue({ success: true, deletedCount: 1 })
  for (const model of [AgentConversation, AgentMessage, AccountPrivacyState]) await model.deleteMany({})
  await query('DELETE FROM public.company_closure')
})

describe('company closure: request, export window and cancellation', () => {
  it('opens the 30-day window, blocks ordinary use and keeps the export available', async () => {
    const ctx = await owner()
    await seedCompany(ctx)

    const response = await requestClosure(ctx)
    expect(response.status).toBe(201)
    const closure = response.body.data
    expect(closure.status).toBe('export_window')
    const requestedAt = new Date(closure.requested_at).getTime()
    expect(Math.round((new Date(closure.export_until) - requestedAt) / DAY_MS)).toBe(30)
    expect(Math.round((new Date(closure.delete_by) - requestedAt) / DAY_MS)).toBe(60)
    expect(Math.round((new Date(closure.backups_by) - requestedAt) / DAY_MS)).toBe(90)

    expect((await withCompany(ctx, api().get('/api/companies/access-context'))).status).toBe(403)
    const exported = await withCompany(ctx, api().get('/api/companies/export'))
    expect(exported.status).toBe(200)
    expect(exported.text).toContain('Proveedora María Pérez')
    expect((await withCompany(ctx, api().get('/api/companies/closure'))).body.data.status).toBe('export_window')

    const companyId = ctx.company.id_empresa
    expect((await query('SELECT activa FROM public.empresa_invitacion WHERE id_empresa = $1', [companyId])).rows)
      .toEqual([{ activa: false }])
    expect((await query('SELECT activa FROM public.proyecto_invitacion WHERE id_empresa = $1', [companyId])).rows)
      .toEqual([{ activa: false }])
    expect((await query('SELECT status FROM public.integracion WHERE id_empresa = $1', [companyId])).rows)
      .toEqual([{ status: 'inactive' }])
    expect((await requestClosure(ctx)).status).toBe(403)
  })

  it('rejects a wrong name, a wrong password and non-owners without changing anything', async () => {
    const ctx = await owner()
    const admin = await addMember(ctx.company.id_empresa, 'admin')

    expect((await requestClosure(ctx, { confirm_name: 'Otra empresa' })).status).toBe(400)
    expect((await requestClosure(ctx, { password: 'wrong-password' })).status).toBe(401)
    expect((await withCompany(ctx, api().post('/api/companies/closure'), admin.token)
      .send({ confirm_name: ctx.company.nombre, password })).status).toBe(403)

    expect(await closureRow(ctx.company.id_empresa)).toBeUndefined()
    expect((await withCompany(ctx, api().get('/api/companies/access-context'))).status).toBe(200)
  })

  it('lets the owner cancel during the window, but not after it ends', async () => {
    const ctx = await owner()
    expect((await requestClosure(ctx)).status).toBe(201)
    expect((await withCompany(ctx, api().delete('/api/companies/closure'))).status).toBe(200)
    expect(await closureRow(ctx.company.id_empresa)).toBeUndefined()
    expect((await withCompany(ctx, api().get('/api/companies/access-context'))).status).toBe(200)

    expect((await requestClosure(ctx)).status).toBe(201)
    await endExportWindow(ctx.company.id_empresa)
    expect((await withCompany(ctx, api().delete('/api/companies/closure'))).status).toBe(409)
  })

  it('does not delete anything before the window ends', async () => {
    const ctx = await owner()
    await seedCompany(ctx)
    const before = await companyRowCounts(ctx.company.id_empresa)
    await requestClosure(ctx)

    expect(await processCompanyClosure(ctx.company.id_empresa)).toBe(false)
    expect(await companyRowCounts(ctx.company.id_empresa)).toEqual(before)
    expect(uploads.deleteFiles).not.toHaveBeenCalled()
  })
})

describe('company closure: deletion and certificate', () => {
  it('deletes every company row, file and assistant document and issues a certificate', async () => {
    const ctx = await owner()
    const other = await owner()
    const seeded = await seedCompany(ctx)
    const kept = await seedCompany(other)
    const keptCounts = await companyRowCounts(other.company.id_empresa)

    expect((await requestClosure(ctx)).status).toBe(201)
    await endExportWindow(ctx.company.id_empresa)
    expect(await processCompanyClosure(ctx.company.id_empresa)).toBe(true)

    const counts = await companyRowCounts(ctx.company.id_empresa)
    expect(Object.values(counts).every((n) => n === 0)).toBe(true)
    for (const [table, column, id] of [
      ['tarea', 'id_tarea', seeded.taskId],
      ['asignacion', 'id_tarea', seeded.taskId],
      ['evidencia', 'id_tarea', seeded.taskId],
      ['producto', 'id_producto', seeded.productId],
      ['producto_proveedor', 'id_producto', seeded.productId],
      ['presupuesto_actividad', 'id_proyecto', seeded.projectId],
      ['project_progress_entry', 'id_proyecto', seeded.projectId],
      ['rol_proyecto', 'id_proyecto', seeded.projectId],
    ]) {
      expect((await query(`SELECT 1 FROM public.${table} WHERE ${column} = $1`, [id])).rows).toHaveLength(0)
    }
    // Accounts are not company data: the member keeps theirs.
    expect((await query('SELECT activo FROM public.usuario WHERE id_usuario = $1', [seeded.member.id_usuario])).rows)
      .toEqual([{ activo: true }])

    expect(await companyRowCounts(other.company.id_empresa)).toEqual(keptCounts)
    expect((await query('SELECT 1 FROM public.tarea WHERE id_tarea = $1', [kept.taskId])).rows).toHaveLength(1)
    expect(await AgentConversation.countDocuments({ empresaId: ctx.company.id_empresa })).toBe(0)
    expect(await AgentMessage.countDocuments({ empresaId: ctx.company.id_empresa })).toBe(0)
    expect(await AgentConversation.countDocuments({ empresaId: other.company.id_empresa })).toBe(1)
    expect(uploads.deleteFiles).toHaveBeenCalledWith([seeded.fileKey])

    const certificates = await api().get('/api/companies/closures/mine').set('Authorization', `Bearer ${ctx.token}`)
    expect(certificates.status).toBe(200)
    const [certificate] = certificates.body.data
    expect(certificate).toMatchObject({ company_id: ctx.company.id_empresa, status: 'deleted' })
    expect(certificate.deletion).toMatchObject({ files_deleted: 1, assistant_documents_deleted: 2 })
    expect(certificate.deletion.rows_deleted).toMatchObject({ empresa: 1, tarea: 1, evidencia: 1 })
    expect((await withCompany(ctx, api().get('/api/companies/export'))).status).toBe(403)
  })

  it('skips the window when the owner asks for deletion right away', async () => {
    const ctx = await owner()
    await seedCompany(ctx)
    const response = await requestClosure(ctx, { skip_export_window: true })
    expect(response.status).toBe(201)
    expect(new Date(response.body.data.export_until).getTime())
      .toBeLessThanOrEqual(new Date(response.body.data.requested_at).getTime() + 1000)
    expect((await withCompany(ctx, api().delete('/api/companies/closure'))).status).toBe(409)

    await processDueCompanyClosures()
    expect((await closureRow(ctx.company.id_empresa)).status).toBe('deleted')
    expect(Object.values(await companyRowCounts(ctx.company.id_empresa)).every((n) => n === 0)).toBe(true)
  })

  it('keeps the database deletion and retries the files when Cloudinary fails', async () => {
    const ctx = await owner()
    const seeded = await seedCompany(ctx)
    await requestClosure(ctx)
    await endExportWindow(ctx.company.id_empresa)
    uploads.deleteFiles.mockRejectedValueOnce(new Error('Cloudinary offline'))

    await expect(processCompanyClosure(ctx.company.id_empresa)).rejects.toThrow('Cloudinary offline')
    const pending = await closureRow(ctx.company.id_empresa)
    expect(pending.status).toBe('deleting')
    expect(pending.sql_deleted_at).not.toBeNull()
    expect(pending.files_deleted_at).toBeNull()
    expect(pending.file_keys).toEqual([seeded.fileKey])
    expect(pending.available_at.getTime()).toBeGreaterThan(Date.now())

    await query('UPDATE public.company_closure SET available_at = CURRENT_TIMESTAMP WHERE company_id = $1', [
      ctx.company.id_empresa,
    ])
    expect(await processCompanyClosure(ctx.company.id_empresa)).toBe(true)
    expect(uploads.deleteFiles).toHaveBeenCalledTimes(2)
    expect(uploads.deleteFiles).toHaveBeenLastCalledWith([seeded.fileKey])
    expect(await closureRow(ctx.company.id_empresa)).toMatchObject({ status: 'deleted', file_keys: [], files_deleted: 1 })
  })

  it('schedules the closure when the last owner deletes the account without a successor', async () => {
    const ctx = await owner()
    await seedCompany(ctx)
    await query("DELETE FROM public.empresa_usuario WHERE id_empresa = $1 AND id_usuario <> $2", [
      ctx.company.id_empresa,
      ctx.owner.id_usuario,
    ])

    const response = await api().delete('/api/auth/account')
      .set('Authorization', `Bearer ${ctx.token}`)
      .send({ password })
    expect(response.status).toBe(200)
    expect(response.body.data.companiesScheduledForDeletion).toEqual([ctx.company.id_empresa])
    expect(await closureRow(ctx.company.id_empresa)).toMatchObject({
      reason: 'no_active_owner',
      status: 'export_window',
    })
  })
})
