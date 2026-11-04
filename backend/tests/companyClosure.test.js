import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  connect: vi.fn(),
  isMongoReady: vi.fn(),
  deleteFiles: vi.fn(),
  transaction: vi.fn(),
  error: vi.fn(),
}))
vi.mock('../src/db/pool.js', () => ({ default: { query: mocks.query, connect: mocks.connect } }))
vi.mock('../src/db/mongo.js', () => ({ isMongoReady: mocks.isMongoReady }))
vi.mock('../src/utils/logger.js', () => ({ logger: { error: mocks.error, info: vi.fn(), warn: vi.fn() } }))
vi.mock('../src/services/fileStorage.js', () => ({ deleteStoredFiles: mocks.deleteFiles }))
vi.mock('mongoose', () => ({ default: { connection: { transaction: mocks.transaction } } }))
vi.mock('../src/services/accountMongoWrite.js', () => ({ MONGO_TRANSACTION_OPTIONS: {} }))
vi.mock('../src/models/AgentConversation.js', () => ({ default: { deleteMany: vi.fn(async () => ({ deletedCount: 1 })) } }))
vi.mock('../src/models/AgentMessage.js', () => ({ default: { deleteMany: vi.fn(async () => ({ deletedCount: 3 })) } }))

import {
  buildCompanyDeletionPlan,
  cancelCompanyClosure,
  deleteCompanyAssistantData,
  deleteUploadedFiles,
  presentClosure,
  processCompanyClosure,
  processDueCompanyClosures,
  scheduleCompanyClosure,
  startCompanyClosureWorker,
} from '../src/services/companyClosure.js'

const table = (name, columns) => ({ name, columns })
const fk = (child, parent, onDelete = 'a', childColumns = [`id_${parent}`], parentColumns = [`id_${parent}`]) =>
  ({ child, parent, onDelete, childColumns, parentColumns })

beforeEach(() => {
  vi.resetAllMocks()
  mocks.transaction.mockImplementation(async (callback) => callback('session'))
})

describe('company deletion plan', () => {
  const tables = [
    table('empresa', ['id_empresa', 'nombre']),
    table('proyecto', ['id_proyecto', 'id_empresa']),
    table('tarea', ['id_tarea', 'id_proyecto']),
    table('asignacion', ['id_tarea', 'id_usuario']),
    table('nota', ['id_nota', 'id_tarea']),
    table('usuario', ['id_usuario']),
    table('rol', ['id_rol']),
  ]
  const foreignKeys = [
    fk('proyecto', 'empresa'),
    fk('tarea', 'proyecto', 'c'),
    fk('asignacion', 'tarea', 'r'),
    fk('asignacion', 'usuario'),
    fk('nota', 'tarea', 'n'),
    fk('usuario', 'rol'),
  ]

  it('orders company tables parents first and follows blocking or cascading keys only', () => {
    const plan = buildCompanyDeletionPlan(tables, foreignKeys)
    expect(plan.map((step) => step.table)).toEqual(['empresa', 'proyecto', 'tarea', 'asignacion'])
    expect(plan.find((step) => step.table === 'asignacion').routes.map((route) => route.parent)).toEqual(['tarea'])
    expect(plan.find((step) => step.table === 'proyecto').direct).toBe(true)
    expect(plan.find((step) => step.table === 'tarea').direct).toBe(false)
  })

  it('refuses to reach account tables or the closure record', () => {
    expect(() => buildCompanyDeletionPlan(
      [...tables, table('company_closure', ['company_id', 'id_empresa'])],
      foreignKeys
    )).toThrow('protected tables: company_closure')
  })

  it('refuses a foreign key cycle and ignores self-references', () => {
    const cycle = [table('a', ['id_a', 'id_empresa']), table('b', ['id_b', 'id_empresa'])]
    expect(() => buildCompanyDeletionPlan(cycle, [fk('a', 'b'), fk('b', 'a')])).toThrow('cycle')
    const selfReference = buildCompanyDeletionPlan([table('a', ['id_a', 'id_empresa'])], [fk('a', 'a')])
    expect(selfReference.map((step) => step.table)).toEqual(['a'])
  })
})

describe('closure records', () => {
  it('only exposes deletion details once the company is deleted', () => {
    const base = {
      company_id: 4, company_name: 'Tienda', reason: 'owner_request', requested_at: 'r', export_until: 'e',
      delete_by: 'd', backups_by: 'b', deleted_at: null, rows_deleted: null,
    }
    expect(presentClosure({ ...base, status: 'export_window' }).deletion).toBeNull()
    expect(presentClosure({ ...base, status: 'deleted', rows_deleted: { empresa: 1 }, files_deleted: 2 }).deletion)
      .toMatchObject({ rows_deleted: { empresa: 1 }, files_deleted: 2, assistant_documents_deleted: 0 })
    expect(presentClosure({ ...base, status: 'deleted' }).deletion.rows_deleted).toEqual({})
  })

  it('marks the subscription of the company for cancellation', async () => {
    const client = { query: vi.fn(async (sql) => ({ rows: sql.includes('INSERT INTO public.company_closure') ? [{ company_id: 4 }] : [] })) }
    expect(await scheduleCompanyClosure(client, { companyId: 4 })).toEqual({ company_id: 4 })
    expect(client.query).toHaveBeenLastCalledWith(expect.stringContaining('SET cancelacion_pendiente = true'), [[4]])
  })

  it('does not disable invitations again when the company is already closing', async () => {
    const client = { query: vi.fn(async () => ({ rows: [] })) }
    expect(await scheduleCompanyClosure(client, { companyId: 4 })).toBeNull()
    expect(client.query).toHaveBeenCalledTimes(2)
    expect(client.query).toHaveBeenLastCalledWith('UPDATE public.empresa SET activo = false WHERE id_empresa = $1', [4])
  })

  it('reactivates the company only when the closure could be withdrawn', async () => {
    const client = { query: vi.fn(async () => ({ rowCount: 0 })) }
    expect(await cancelCompanyClosure(client, 4)).toBe(false)
    expect(client.query).toHaveBeenCalledTimes(1)
    client.query.mockResolvedValue({ rowCount: 1 })
    expect(await cancelCompanyClosure(client, 4)).toBe(true)
    expect(client.query).toHaveBeenLastCalledWith('UPDATE public.empresa SET activo = true WHERE id_empresa = $1', [4])
  })
})

describe('closure side effects', () => {
  it('skips the file storage when there are no files and fails when a deletion fails', async () => {
    await deleteUploadedFiles([])
    expect(mocks.deleteFiles).not.toHaveBeenCalled()
    mocks.deleteFiles.mockRejectedValue(new Error('Cloudinary did not confirm the deletion of a.'))
    await expect(deleteUploadedFiles(['image:a'])).rejects.toThrow('did not confirm')
    expect(mocks.deleteFiles).toHaveBeenCalledWith(['image:a'])
  })

  it('deletes assistant conversations and messages of the company in one transaction', async () => {
    expect(await deleteCompanyAssistantData(4)).toBe(4)
    expect(mocks.transaction).toHaveBeenCalledOnce()
  })
})

describe('closure worker', () => {
  const job = { company_id: 4, attempts: 1, file_keys: [], sql_deleted_at: 'done', files_deleted_at: 'done', mongo_deleted_at: null }

  it('returns false when no closure is due', async () => {
    mocks.query.mockResolvedValue({ rows: [] })
    expect(await processCompanyClosure(4)).toBe(false)
  })

  it('schedules a retry when MongoDB is unavailable', async () => {
    mocks.query.mockResolvedValueOnce({ rows: [job] }).mockResolvedValue({ rows: [], rowCount: 1 })
    mocks.isMongoReady.mockReturnValue(false)
    await expect(processCompanyClosure(4)).rejects.toThrow('MongoDB is unavailable')
    expect(mocks.query).toHaveBeenLastCalledWith(expect.stringContaining('available_at = CURRENT_TIMESTAMP'), [4, 60, 1])
  })

  it('rolls back the database step and keeps processing the next closure', async () => {
    const client = {
      query: vi.fn(async (sql) => {
        if (sql.includes('pg_class')) throw new Error('catalog offline')
        return { rows: [] }
      }),
      release: vi.fn(),
    }
    mocks.connect.mockResolvedValue(client)
    mocks.query
      .mockResolvedValueOnce({ rows: [{ ...job, sql_deleted_at: null }] })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rows: [] })
    await processDueCompanyClosures()
    expect(client.query).toHaveBeenCalledWith('ROLLBACK')
    expect(client.release).toHaveBeenCalledOnce()
    expect(mocks.error).toHaveBeenCalledWith('Could not complete a scheduled company deletion:', expect.any(Error))
  })

  it('completes the remaining steps and marks the closure as deleted', async () => {
    mocks.isMongoReady.mockReturnValue(true)
    mocks.query.mockResolvedValueOnce({ rows: [job] }).mockResolvedValue({ rowCount: 1 })
    expect(await processCompanyClosure(4)).toBe(true)
    expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining('assistant_documents_deleted = $2'), [4, 4])
    expect(mocks.query).toHaveBeenLastCalledWith(expect.stringContaining("status = 'deleted'"), [4, 1])
  })

  it('logs a failed tick and can be stopped', async () => {
    mocks.query.mockRejectedValue(new Error('postgres offline'))
    const stop = startCompanyClosureWorker()
    await vi.waitFor(() => expect(mocks.error).toHaveBeenCalledWith('Company closure worker failed:', expect.any(Error)))
    stop()
  })
})
