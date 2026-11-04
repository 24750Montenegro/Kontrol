// Resets the SCRUM-25 UX test environment back to its seeded starting state.
// Meant to run repeatedly, once between each participant session.
import pool from './pool.js'
import { seed } from './seed.js'

const SAFETY_MARKER = process.env.TEST_DB_HOST_MARKER || 'supabase.co'

function assertTestDatabase() {
  const url = process.env.DATABASE_URL || ''
  if (!url.includes(SAFETY_MARKER)) {
    throw new Error(
      `Refusing to reset: DATABASE_URL does not look like the test database ` +
      `(expected it to contain "${SAFETY_MARKER}"). This guard exists so the ` +
      `reset can never accidentally run against production.`
    )
  }
}

async function deleteOrphanedEvidenceFiles() {
  const { rows } = await pool.query(
    'SELECT public_id FROM public.evidencia WHERE public_id IS NOT NULL'
  )
  const publicIds = rows.map((r) => r.public_id)
  if (!publicIds.length) return

  try {
    const { deleteStoredFiles } = await import('../services/fileStorage.js')
    const { deleted } = await deleteStoredFiles(publicIds)
    console.log(`  ${deleted} archivo(s) de evidencia eliminados de Cloudinary.`)
  } catch (error) {
    console.warn('  ! No se pudieron eliminar algunos archivos de Cloudinary (no bloqueante):', error.message)
  }
}

export async function reset() {
  assertTestDatabase()

  console.log('==> Restableciendo ambiente de pruebas...')
  await deleteOrphanedEvidenceFiles()

  await pool.query('TRUNCATE TABLE public.usuario, public.empresa RESTART IDENTITY CASCADE')
  console.log('  Datos de negocio eliminados (catálogo de roles/permisos intacto).')

  await seed()
  console.log('==> Reset completado.')
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  reset()
    .then(() => pool.end())
    .catch((error) => {
      console.error('Reset falló:', error.message)
      process.exitCode = 1
    })
}
