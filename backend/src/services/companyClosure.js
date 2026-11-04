import mongoose from 'mongoose'
import pool from '../db/pool.js'
import { isMongoReady } from '../db/mongo.js'
import AgentConversation from '../models/AgentConversation.js'
import AgentMessage from '../models/AgentMessage.js'
import { MONGO_TRANSACTION_OPTIONS } from './accountMongoWrite.js'
import { markSubscriptionsForCancellation } from './billingService.js'
import { deleteStoredFiles } from './fileStorage.js'
import { logger } from '../utils/logger.js'

// Deadlines promised by the data processing addendum, §10
// (docs/legal/adenda-tratamiento-datos.md). All count from the closure request.
export const EXPORT_WINDOW_DAYS = 30
export const ACTIVE_DELETION_DAYS = 60
export const BACKUP_DELETION_DAYS = 90

export const CLOSURE_REASONS = Object.freeze({
  OWNER_REQUEST: 'owner_request',
  NO_ACTIVE_OWNER: 'no_active_owner',
  PROVIDER_TERMINATION: 'provider_termination',
})

const LEASE_MINUTES = 15
const POLL_INTERVAL_MS = 60_000
const MAX_RETRY_SECONDS = 6 * 60 * 60

// FK actions that make a child row part of the company: NO ACTION, RESTRICT
// (would block the parent delete) and CASCADE (would vanish with it). SET NULL
// and SET DEFAULT children survive the parent, so they are not company data.
const ROUTE_ACTIONS = new Set(['a', 'r', 'c'])
// Accounts, the closure record itself and the account outbox are never
// company data. Reaching one of them means the schema changed: stop instead.
const PROTECTED_TABLES = new Set(['usuario', 'company_closure', 'account_mongo_deletion_outbox'])
// Columns holding storage keys (Cloudinary) of files that belong to company rows.
const FILE_KEY_COLUMNS = { evidencia: 'public_id' }

const CLOSURE_COLUMNS = `company_id, company_name, reason, requested_by, requested_at,
  export_until, delete_by, backups_by, status, rows_deleted, files_deleted,
  assistant_documents_deleted, sql_deleted_at, files_deleted_at, mongo_deleted_at, deleted_at`

const quoteIdentifier = (value) => `"${String(value).replaceAll('"', '""')}"`

/**
 * Starts the closure of a company inside the caller's transaction: blocks the
 * company for ordinary use, disables its invitations and integrations, marks
 * its subscription for cancellation and opens the export window. Returns null
 * when the company is already closing.
 */
export async function scheduleCompanyClosure(client, {
  companyId,
  requestedBy = null,
  reason = CLOSURE_REASONS.OWNER_REQUEST,
  skipExportWindow = false,
}) {
  const { rows } = await client.query(
    `INSERT INTO public.company_closure
       (company_id, company_name, reason, requested_by, export_until, delete_by, backups_by, available_at)
     SELECT e.id_empresa, e.nombre, $2, $3, w.export_until,
            CURRENT_TIMESTAMP + ($5 * INTERVAL '1 day'),
            CURRENT_TIMESTAMP + ($6 * INTERVAL '1 day'),
            w.export_until
     FROM public.empresa e
     CROSS JOIN (
       SELECT CASE WHEN $4::boolean THEN CURRENT_TIMESTAMP
                   ELSE CURRENT_TIMESTAMP + ($7 * INTERVAL '1 day') END AS export_until
     ) w
     WHERE e.id_empresa = $1
     ON CONFLICT (company_id) DO NOTHING
     RETURNING ${CLOSURE_COLUMNS}`,
    [
      companyId,
      reason,
      requestedBy,
      skipExportWindow,
      ACTIVE_DELETION_DAYS,
      BACKUP_DELETION_DAYS,
      EXPORT_WINDOW_DAYS,
    ]
  )

  await client.query('UPDATE public.empresa SET activo = false WHERE id_empresa = $1', [companyId])
  if (!rows.length) return null

  await client.query(
    `UPDATE public.empresa_invitacion
     SET activa = false, desactivada_en = COALESCE(desactivada_en, CURRENT_TIMESTAMP)
     WHERE id_empresa = $1 AND activa = true`,
    [companyId]
  )
  await client.query(
    `UPDATE public.proyecto_invitacion
     SET activa = false, desactivada_en = COALESCE(desactivada_en, CURRENT_TIMESTAMP)
     WHERE id_empresa = $1 AND activa = true`,
    [companyId]
  )
  await client.query(
    `UPDATE public.integracion
     SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
     WHERE id_empresa = $1 AND status <> 'inactive'`,
    [companyId]
  )
  // PAY-1 — A closing company must not renew its plan. The caller cancels it
  // with the provider after COMMIT; the billing worker retries on failure.
  await markSubscriptionsForCancellation(client, [companyId])
  return rows[0]
}

/**
 * Withdraws an owner's closure while the export window is still open and
 * reactivates the company. Invitations and integrations stay disabled.
 */
export async function cancelCompanyClosure(client, companyId) {
  const { rowCount } = await client.query(
    `DELETE FROM public.company_closure
     WHERE company_id = $1
       AND status = 'export_window'
       AND export_until > CURRENT_TIMESTAMP
       AND reason <> $2`,
    [companyId, CLOSURE_REASONS.NO_ACTIVE_OWNER]
  )
  if (!rowCount) return false
  await client.query('UPDATE public.empresa SET activo = true WHERE id_empresa = $1', [companyId])
  return true
}

export async function findCompanyClosure(db, companyId) {
  const { rows } = await db.query(
    `SELECT ${CLOSURE_COLUMNS} FROM public.company_closure WHERE company_id = $1`,
    [companyId]
  )
  return rows[0] ?? null
}

export async function listClosuresRequestedBy(db, userId) {
  const { rows } = await db.query(
    `SELECT ${CLOSURE_COLUMNS}
     FROM public.company_closure
     WHERE requested_by = $1
     ORDER BY requested_at DESC`,
    [userId]
  )
  return rows
}

/** Public view of a closure; once deleted it doubles as the deletion certificate. */
export function presentClosure(row) {
  return {
    company_id: row.company_id,
    company_name: row.company_name,
    reason: row.reason,
    status: row.status,
    requested_at: row.requested_at,
    export_until: row.export_until,
    delete_by: row.delete_by,
    backups_by: row.backups_by,
    deleted_at: row.deleted_at,
    deletion: row.status === 'deleted'
      ? {
          rows_deleted: row.rows_deleted ?? {},
          files_deleted: row.files_deleted ?? 0,
          assistant_documents_deleted: row.assistant_documents_deleted ?? 0,
          database_deleted_at: row.sql_deleted_at,
          files_deleted_at: row.files_deleted_at,
          assistant_deleted_at: row.mongo_deleted_at,
        }
      : null,
  }
}

/**
 * Orders every company table parents first. A table belongs to the company
 * when it has an id_empresa column or a NO ACTION/RESTRICT/CASCADE foreign key
 * to a company table. Self-references are not followed.
 */
export function buildCompanyDeletionPlan(tables, foreignKeys) {
  const columns = new Map(tables.map((table) => [table.name, new Set(table.columns)]))
  const scoped = new Set(tables.filter((table) => columns.get(table.name).has('id_empresa')).map((t) => t.name))
  const routes = foreignKeys.filter((fk) => ROUTE_ACTIONS.has(fk.onDelete) && fk.child !== fk.parent)

  let changed = true
  while (changed) {
    changed = false
    for (const fk of routes) {
      if (scoped.has(fk.parent) && !scoped.has(fk.child)) {
        scoped.add(fk.child)
        changed = true
      }
    }
  }

  const reached = [...scoped].filter((name) => PROTECTED_TABLES.has(name))
  if (reached.length) {
    throw new Error(`Company deletion would reach protected tables: ${reached.join(', ')}.`)
  }

  const parentsOf = new Map([...scoped].map((name) => [name, new Set()]))
  for (const fk of foreignKeys) {
    if (fk.child !== fk.parent && scoped.has(fk.child) && scoped.has(fk.parent)) {
      parentsOf.get(fk.child).add(fk.parent)
    }
  }

  const order = []
  const placed = new Set()
  while (order.length < scoped.size) {
    const ready = [...scoped]
      .filter((name) => !placed.has(name) && [...parentsOf.get(name)].every((p) => placed.has(p)))
      .sort()
    if (!ready.length) throw new Error('Company deletion plan has a foreign key cycle.')
    for (const name of ready) {
      placed.add(name)
      order.push(name)
    }
  }

  return order.map((name) => ({
    table: name,
    direct: columns.get(name).has('id_empresa'),
    columns: columns.get(name),
    routes: routes.filter((fk) => fk.child === name && scoped.has(fk.parent)),
  }))
}

async function readSchemaGraph(client) {
  const tables = await client.query(
    `SELECT c.relname AS name, array_agg(a.attname::text ORDER BY a.attnum) AS columns
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     JOIN pg_attribute a ON a.attrelid = c.oid
     WHERE n.nspname = 'public'
       AND c.relkind IN ('r', 'p')
       AND a.attnum > 0
       AND NOT a.attisdropped
     GROUP BY c.relname`
  )
  // Grouped by constraint: two FKs between the same pair of tables stay apart.
  const foreignKeys = await client.query(
    `SELECT child.relname AS child, parent.relname AS parent,
            constraint_row.confdeltype::text AS "onDelete",
            array_agg(child_column.attname::text ORDER BY key_pair.ordinality) AS "childColumns",
            array_agg(parent_column.attname::text ORDER BY key_pair.ordinality) AS "parentColumns"
     FROM pg_constraint constraint_row
     JOIN pg_class child ON child.oid = constraint_row.conrelid
     JOIN pg_namespace child_schema ON child_schema.oid = child.relnamespace
     JOIN pg_class parent ON parent.oid = constraint_row.confrelid
     JOIN pg_namespace parent_schema ON parent_schema.oid = parent.relnamespace
     CROSS JOIN LATERAL unnest(constraint_row.conkey, constraint_row.confkey)
       WITH ORDINALITY AS key_pair(child_attnum, parent_attnum, ordinality)
     JOIN pg_attribute child_column
       ON child_column.attrelid = child.oid AND child_column.attnum = key_pair.child_attnum
     JOIN pg_attribute parent_column
       ON parent_column.attrelid = parent.oid AND parent_column.attnum = key_pair.parent_attnum
     WHERE constraint_row.contype = 'f'
       AND child_schema.nspname = 'public'
       AND parent_schema.nspname = 'public'
     GROUP BY constraint_row.oid, child.relname, parent.relname, constraint_row.confdeltype`
  )
  return { tables: tables.rows, foreignKeys: foreignKeys.rows }
}

/**
 * Deletes every company row inside the caller's REPEATABLE READ transaction.
 * Rows are marked by ctid parents first, so each table only looks at its
 * direct parents, and then deleted children first. A concurrent change to a
 * marked row aborts the transaction instead of leaving it behind.
 */
export async function deleteCompanyRows(client, companyId) {
  const { tables, foreignKeys } = await readSchemaGraph(client)
  const plan = buildCompanyDeletionPlan(tables, foreignKeys)
  const marks = new Map()

  for (const [index, step] of plan.entries()) {
    const mark = quoteIdentifier(`kontrol_closure_${index}`)
    marks.set(step.table, mark)
    await client.query(`CREATE TEMP TABLE ${mark} (row_ctid tid PRIMARY KEY) ON COMMIT DROP`)

    const conditions = step.direct ? ['t."id_empresa" = $1'] : []
    for (const fk of step.routes) {
      const join = fk.childColumns
        .map((column, i) => `t.${quoteIdentifier(column)} = p.${quoteIdentifier(fk.parentColumns[i])}`)
        .join(' AND ')
      conditions.push(
        `EXISTS (SELECT 1 FROM public.${quoteIdentifier(fk.parent)} p
                 JOIN ${marks.get(fk.parent)} m ON m.row_ctid = p.ctid
                 WHERE ${join})`
      )
    }
    await client.query(
      `INSERT INTO ${mark}
       SELECT t.ctid FROM public.${quoteIdentifier(step.table)} t
       WHERE ${conditions.join(' OR ')}`,
      step.direct ? [companyId] : []
    )
  }

  const fileKeys = []
  for (const [table, column] of Object.entries(FILE_KEY_COLUMNS)) {
    const step = plan.find((candidate) => candidate.table === table)
    if (!step?.columns.has(column)) continue
    const { rows } = await client.query(
      `SELECT DISTINCT t.${quoteIdentifier(column)} AS key
       FROM public.${quoteIdentifier(table)} t
       JOIN ${marks.get(table)} m ON m.row_ctid = t.ctid
       WHERE t.${quoteIdentifier(column)} IS NOT NULL`
    )
    fileKeys.push(...rows.map((row) => row.key))
  }

  const rowsDeleted = {}
  for (const step of [...plan].reverse()) {
    const result = await client.query(
      `DELETE FROM public.${quoteIdentifier(step.table)} t
       USING ${marks.get(step.table)} m
       WHERE t.ctid = m.row_ctid`
    )
    if (result.rowCount) rowsDeleted[step.table] = result.rowCount
  }

  for (const step of plan.filter((candidate) => candidate.direct)) {
    const left = await client.query(
      `SELECT 1 FROM public.${quoteIdentifier(step.table)} WHERE "id_empresa" = $1 LIMIT 1`,
      [companyId]
    )
    if (left.rows.length) throw new Error(`Company rows remain in ${step.table} after deletion.`)
  }

  return { rowsDeleted, fileKeys }
}

// Throws when a file could not be deleted, so the worker retries the step.
export async function deleteUploadedFiles(keys) {
  if (!keys.length) return
  await deleteStoredFiles(keys)
}

export async function deleteCompanyAssistantData(companyId) {
  let deleted = 0
  await mongoose.connection.transaction(async (session) => {
    const messages = await AgentMessage.deleteMany({ empresaId: companyId }, { session })
    const conversations = await AgentConversation.deleteMany({ empresaId: companyId }, { session })
    deleted = messages.deletedCount + conversations.deletedCount
  }, MONGO_TRANSACTION_OPTIONS)
  return deleted
}

async function claimClosure(companyId = null) {
  const { rows } = await pool.query(
    `UPDATE public.company_closure
     SET status = 'deleting',
         attempts = attempts + 1,
         locked_until = CURRENT_TIMESTAMP + ($1 * INTERVAL '1 minute')
     WHERE company_id = (
       SELECT company_id
       FROM public.company_closure
       WHERE status IN ('export_window', 'deleting')
         AND available_at <= CURRENT_TIMESTAMP
         AND (locked_until IS NULL OR locked_until < CURRENT_TIMESTAMP)
         AND ($2::integer IS NULL OR company_id = $2)
       ORDER BY available_at, company_id
       LIMIT 1
       FOR UPDATE SKIP LOCKED
     )
     RETURNING company_id, attempts, file_keys, sql_deleted_at, files_deleted_at, mongo_deleted_at`,
    [LEASE_MINUTES, companyId]
  )
  return rows[0] ?? null
}

async function scheduleRetry(companyId, attempts) {
  const delaySeconds = Math.min(MAX_RETRY_SECONDS, 60 * (2 ** Math.min(attempts - 1, 12)))
  await pool.query(
    `UPDATE public.company_closure
     SET locked_until = NULL,
         available_at = CURRENT_TIMESTAMP + ($2 * INTERVAL '1 second')
     WHERE company_id = $1 AND attempts = $3`,
    [companyId, delaySeconds, attempts]
  )
}

async function runDatabaseStep(companyId) {
  const client = await pool.connect()
  let released = false
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ')
    const { rowsDeleted, fileKeys } = await deleteCompanyRows(client, companyId)
    await client.query(
      `UPDATE public.company_closure
       SET sql_deleted_at = CURRENT_TIMESTAMP, rows_deleted = $2::jsonb, file_keys = $3::jsonb
       WHERE company_id = $1`,
      [companyId, JSON.stringify(rowsDeleted), JSON.stringify(fileKeys)]
    )
    await client.query('COMMIT')
    return fileKeys
  } catch (error) {
    try { await client.query('ROLLBACK') } catch (rollbackError) {
      client.release(rollbackError)
      released = true
    }
    throw error
  } finally {
    if (!released) client.release()
  }
}

async function processClaimedClosure(job) {
  try {
    let fileKeys = job.file_keys ?? []
    if (!job.sql_deleted_at) fileKeys = await runDatabaseStep(job.company_id)

    if (!job.files_deleted_at) {
      await deleteUploadedFiles(fileKeys)
      await pool.query(
        `UPDATE public.company_closure
         SET files_deleted_at = CURRENT_TIMESTAMP, files_deleted = $2, file_keys = '[]'::jsonb
         WHERE company_id = $1`,
        [job.company_id, fileKeys.length]
      )
    }

    if (!job.mongo_deleted_at) {
      if (!isMongoReady()) throw new Error('MongoDB is unavailable; assistant data cleanup will be retried.')
      const deleted = await deleteCompanyAssistantData(job.company_id)
      await pool.query(
        `UPDATE public.company_closure
         SET mongo_deleted_at = CURRENT_TIMESTAMP, assistant_documents_deleted = $2
         WHERE company_id = $1`,
        [job.company_id, deleted]
      )
    }

    const result = await pool.query(
      `UPDATE public.company_closure
       SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP, locked_until = NULL
       WHERE company_id = $1 AND attempts = $2`,
      [job.company_id, job.attempts]
    )
    return result.rowCount === 1
  } catch (error) {
    await scheduleRetry(job.company_id, job.attempts)
    throw error
  }
}

/** Runs the deletion of one company if its export window has ended. */
export async function processCompanyClosure(companyId) {
  const job = await claimClosure(companyId)
  if (!job) return false
  return processClaimedClosure(job)
}

export async function processDueCompanyClosures(batchSize = 5) {
  for (let index = 0; index < batchSize; index += 1) {
    const job = await claimClosure()
    if (!job) return
    try {
      await processClaimedClosure(job)
    } catch (error) {
      logger.error('Could not complete a scheduled company deletion:', error)
    }
  }
}

export function startCompanyClosureWorker() {
  let running = false
  const tick = async () => {
    if (running) return
    running = true
    try { await processDueCompanyClosures() } catch (error) {
      logger.error('Company closure worker failed:', error)
    } finally { running = false }
  }
  const timer = setInterval(tick, POLL_INTERVAL_MS)
  timer.unref?.()
  void tick()
  return () => clearInterval(timer)
}
