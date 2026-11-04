// Idempotent seed for the SCRUM-25 UX test environment.
// Safe to run repeatedly: every insert is preceded by a lookup on the field
// that identifies the row for this environment (email, or name+empresa
// where there's no unique constraint), so re-running never duplicates data.
import bcrypt from 'bcrypt'
import pool from './pool.js'

// Matches the app's own SALT_ROUNDS (authController.js/userController.js):
// bcrypt.compare()'s cost is fixed by whatever's embedded in the stored
// hash, not by this constant at compare time — so a lower BCRYPT_SALT_ROUNDS
// only speeds up login once the seeded accounts are re-hashed at that cost,
// which happens the next time this script runs (e.g. via reset:test).
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10
const PARTICIPANT_PASSWORD = 'Kontrol2026!'
const EMPRESA_EMAIL = 'contacto@lospinos-test.dev'
const EMPRESA_NOMBRE = 'Ferretería Los Pinos'

const PARTICIPANTS = [
  { email: 'participante1@kontrol-test.dev', nombre: 'Ana', apellido: 'Martínez' },
  { email: 'participante2@kontrol-test.dev', nombre: 'Luis', apellido: 'Ramírez' },
  { email: 'participante3@kontrol-test.dev', nombre: 'Carla', apellido: 'Gómez' },
  { email: 'participante4@kontrol-test.dev', nombre: 'Diego', apellido: 'Torres' },
  { email: 'participante5@kontrol-test.dev', nombre: 'Sofía', apellido: 'Herrera' },
  { email: 'reserva@kontrol-test.dev', nombre: 'Jorge', apellido: 'Paredes' },
]

function daysFromNow(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().substring(0, 10)
}

async function upsertUsuario({ email, nombre, apellido }) {
  const existing = await pool.query('SELECT id_usuario FROM public.usuario WHERE email = $1', [email])
  if (existing.rows.length) return existing.rows[0].id_usuario

  const { rows: [rol] } = await pool.query(
    "SELECT id_rol FROM public.rol WHERE nombre_rol = 'usuario'"
  )
  const passwordHash = await bcrypt.hash(PARTICIPANT_PASSWORD, SALT_ROUNDS)

  const { rows: [user] } = await pool.query(
    `INSERT INTO public.usuario (nombre, apellido, email, password_hash, id_rol)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_usuario`,
    [nombre, apellido, email, passwordHash, rol.id_rol]
  )
  return user.id_usuario
}

async function upsertEmpresa() {
  const existing = await pool.query('SELECT id_empresa FROM public.empresa WHERE email = $1', [EMPRESA_EMAIL])
  if (existing.rows.length) return existing.rows[0].id_empresa

  const { rows: [empresa] } = await pool.query(
    `INSERT INTO public.empresa (nombre, industria, email, telefono, direccion)
     VALUES ($1, 'Comercio y ferretería', $2, '+502 2345 6789', 'Zona 4, Ciudad de Guatemala')
     RETURNING id_empresa`,
    [EMPRESA_NOMBRE, EMPRESA_EMAIL]
  )
  return empresa.id_empresa
}

// PAY-1 — La empresa de pruebas va en Business. Tiene seis participantes,
// tres proyectos y usa exportación, equipos, marketing y el agente: en el plan
// Gratis superaría los topes y perdería esos módulos, y las pruebas de UX y de
// carga (k6, escenario C4) dejarían de ejercitarlos. No es una suscripción de
// la pasarela: proveedor 'seed' y sin identificadores del proveedor, así que
// ningún evento de Stripe la toca.
async function ensureSuscripcionDemo(idEmpresa) {
  await pool.query(
    `INSERT INTO public.empresa_suscripcion (id_empresa, proveedor, plan, intervalo, estado, fin_periodo_actual)
     VALUES ($1, 'seed', 'business', 'year', 'active', CURRENT_TIMESTAMP + INTERVAL '10 years')
     ON CONFLICT (id_empresa) DO UPDATE SET
       plan = EXCLUDED.plan,
       intervalo = EXCLUDED.intervalo,
       estado = EXCLUDED.estado,
       fin_periodo_actual = EXCLUDED.fin_periodo_actual,
       actualizado_en = CURRENT_TIMESTAMP
     WHERE public.empresa_suscripcion.proveedor = 'seed'`,
    [idEmpresa]
  )
}

async function ensureEmpresaUsuario(idEmpresa, idUsuario, rolNombre) {
  const { rows: [rol] } = await pool.query(
    'SELECT id_rol_empresa FROM public.rol_empresa WHERE nombre = $1',
    [rolNombre]
  )
  // El rol converge en vez de quedarse con el de la primera siembra: con DO
  // NOTHING, cambiar el rol que asigna el seed no tenía efecto sobre un ambiente
  // ya sembrado, y había que borrar la base para verlo.
  await pool.query(
    `INSERT INTO public.empresa_usuario (id_empresa, id_usuario, id_rol_empresa)
     VALUES ($1, $2, $3)
     ON CONFLICT (id_empresa, id_usuario)
       DO UPDATE SET id_rol_empresa = EXCLUDED.id_rol_empresa`,
    [idEmpresa, idUsuario, rol.id_rol_empresa]
  )
}

async function ensureProyecto({ idEmpresa, idEncargado, nombre, descripcion, fechaInicio, fechaFin, presupuesto, estado }) {
  const existing = await pool.query(
    'SELECT id_proyecto FROM public.proyecto WHERE id_empresa = $1 AND nombre = $2',
    [idEmpresa, nombre]
  )
  if (existing.rows.length) return existing.rows[0].id_proyecto

  const { rows: [proyecto] } = await pool.query(
    `INSERT INTO public.proyecto (nombre, descripcion, fecha_inicio, fecha_fin_planificada, presupuesto_total, estado, id_empresa, id_encargado)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id_proyecto`,
    [nombre, descripcion, fechaInicio, fechaFin, presupuesto, estado, idEmpresa, idEncargado]
  )
  return proyecto.id_proyecto
}

async function ensureProyectoUsuario(idProyecto, idUsuario) {
  await pool.query(
    `INSERT INTO public.proyecto_usuario (id_proyecto, id_usuario)
     VALUES ($1, $2)
     ON CONFLICT (id_proyecto, id_usuario) DO NOTHING`,
    [idProyecto, idUsuario]
  )
}

async function ensureTarea({ idProyecto, nombre, descripcion, estado, prioridad, fechaVencimiento, idAsignado }) {
  const existing = await pool.query(
    'SELECT id_tarea FROM public.tarea WHERE id_proyecto = $1 AND nombre = $2',
    [idProyecto, nombre]
  )
  let idTarea = existing.rows[0]?.id_tarea

  if (!idTarea) {
    const { rows: [tarea] } = await pool.query(
      `INSERT INTO public.tarea (nombre, descripcion, estado, prioridad, fecha_vencimiento, id_proyecto)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_tarea`,
      [nombre, descripcion, estado, prioridad, fechaVencimiento, idProyecto]
    )
    idTarea = tarea.id_tarea
  }

  if (idAsignado) {
    await pool.query(
      `INSERT INTO public.asignacion (id_tarea, id_usuario, id_proyecto)
       VALUES ($1, $2, $3)
       ON CONFLICT (id_tarea, id_usuario) DO NOTHING`,
      [idTarea, idAsignado, idProyecto]
    )
  }

  return idTarea
}

async function ensureProgressEntry({ idProyecto, idUsuario, title, details, updateType, progressPercentage, happenedAt }) {
  const existing = await pool.query(
    'SELECT id_progress_entry FROM public.project_progress_entry WHERE id_proyecto = $1 AND title = $2',
    [idProyecto, title]
  )
  if (existing.rows.length) return existing.rows[0].id_progress_entry

  const { rows: [entry] } = await pool.query(
    `INSERT INTO public.project_progress_entry (id_proyecto, id_usuario, title, details, update_type, progress_percentage, happened_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id_progress_entry`,
    [idProyecto, idUsuario, title, details, updateType, progressPercentage, happenedAt]
  )
  return entry.id_progress_entry
}

async function ensurePresupuestoActividad({ idProyecto, nombre, montoPlanificado, montoReal }) {
  const existing = await pool.query(
    'SELECT id_actividad FROM public.presupuesto_actividad WHERE id_proyecto = $1 AND nombre = $2',
    [idProyecto, nombre]
  )
  if (existing.rows.length) return existing.rows[0].id_actividad

  const { rows: [actividad] } = await pool.query(
    `INSERT INTO public.presupuesto_actividad (nombre, monto_planificado, monto_real, id_proyecto)
     VALUES ($1, $2, $3, $4)
     RETURNING id_actividad`,
    [nombre, montoPlanificado, montoReal, idProyecto]
  )
  return actividad.id_actividad
}

async function ensureGasto({ idEmpresa, idProyecto, idUsuario, idActividad, motivo, monto, fecha }) {
  const existing = await pool.query(
    `SELECT id_movimiento FROM public.movimiento_inventario
     WHERE id_proyecto = $1 AND tipo = 'GASTO_ADMIN' AND motivo = $2`,
    [idProyecto, motivo]
  )
  if (existing.rows.length) return existing.rows[0].id_movimiento

  const { rows: [gasto] } = await pool.query(
    `INSERT INTO public.movimiento_inventario (tipo, precio_unitario, fecha, motivo, id_empresa, id_usuario, id_proyecto, id_actividad)
     VALUES ('GASTO_ADMIN', $1, $2, $3, $4, $5, $6, $7)
     RETURNING id_movimiento`,
    [monto, fecha, motivo, idEmpresa, idUsuario, idProyecto, idActividad]
  )
  return gasto.id_movimiento
}

async function ensureCategoria({ idEmpresa, nombre }) {
  const existing = await pool.query(
    'SELECT id_categoria FROM public.categoria WHERE id_empresa = $1 AND nombre = $2',
    [idEmpresa, nombre]
  )
  if (existing.rows.length) return existing.rows[0].id_categoria

  const { rows: [categoria] } = await pool.query(
    'INSERT INTO public.categoria (nombre, id_empresa) VALUES ($1, $2) RETURNING id_categoria',
    [nombre, idEmpresa]
  )
  return categoria.id_categoria
}

// Los proveedores del inventario pasan `contacto` y los de Fase 2
// `contactoNombre`; se aceptan los dos.
async function ensureProveedor({ idEmpresa, nombre, contacto, contactoNombre, telefono, email }) {
  const existing = await pool.query(
    'SELECT id_proveedor FROM public.proveedor WHERE id_empresa = $1 AND nombre = $2',
    [idEmpresa, nombre]
  )
  if (existing.rows.length) return existing.rows[0].id_proveedor

  const { rows: [proveedor] } = await pool.query(
    `INSERT INTO public.proveedor (nombre, contacto_nombre, telefono, email, id_empresa)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_proveedor`,
    [nombre, contacto ?? contactoNombre, telefono, email, idEmpresa]
  )
  return proveedor.id_proveedor
}

/**
 * El inventario es por proyecto: cada producto pertenece a uno solo y su stock
 * es independiente. La identidad para no duplicar es (proyecto, nombre), porque
 * el código de barras sí puede repetirse entre proyectos.
 */
async function ensureProducto({
  idProyecto, idCategoria, nombre, descripcion,
  precioVenta, precioCosto, stockActual, stockMinimo, codigoBarras = null,
}) {
  const existing = await pool.query(
    'SELECT id_producto FROM public.producto WHERE id_proyecto = $1 AND nombre = $2',
    [idProyecto, nombre]
  )
  if (existing.rows.length) return existing.rows[0].id_producto

  const { rows: [producto] } = await pool.query(
    `INSERT INTO public.producto
       (nombre, descripcion, precio_venta, precio_costo, costo_promedio_ponderado,
        stock_actual, stock_minimo, id_categoria, id_proyecto, codigo_barras)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id_producto`,
    [nombre, descripcion, precioVenta, precioCosto, precioCosto,
     stockActual, stockMinimo, idCategoria, idProyecto, codigoBarras]
  )
  return producto.id_producto
}

async function ensureReporte({ idEmpresa, idUsuario, titulo, tipo }) {
  const existing = await pool.query(
    'SELECT id_reporte FROM public.reporte WHERE id_empresa = $1 AND titulo = $2',
    [idEmpresa, titulo]
  )
  if (existing.rows.length) return existing.rows[0].id_reporte

  const { rows: [reporte] } = await pool.query(
    `INSERT INTO public.reporte (titulo, tipo, id_empresa, id_usuario)
     VALUES ($1, $2, $3, $4)
     RETURNING id_reporte`,
    [titulo, tipo, idEmpresa, idUsuario]
  )
  return reporte.id_reporte
}

async function ensureMarketingPublication({ idEmpresa, idProyecto, idUsuario, title, caption }) {
  const existing = await pool.query(
    'SELECT id_publication FROM public.marketing_publication WHERE id_empresa = $1 AND title = $2',
    [idEmpresa, title]
  )
  if (existing.rows.length) return existing.rows[0].id_publication

  const { rows: [publication] } = await pool.query(
    `INSERT INTO public.marketing_publication
       (id_empresa, id_proyecto, title, caption, platform, publication_format,
        status, created_by, updated_by, notes)
     VALUES ($1, $2, $3, $4, 'INSTAGRAM', 'POST', 'DRAFT', $5, $5, $6)
     RETURNING id_publication`,
    [idEmpresa, idProyecto, title, caption, idUsuario, 'Dato base para la prueba de usabilidad de Fase 2.']
  )
  return publication.id_publication
}

async function ensureEvidenciaConArchivo({ idTarea, idUsuario, idProgressEntry, descripcion }) {
  const existing = await pool.query(
    'SELECT id_evidencia FROM public.evidencia WHERE id_tarea = $1 AND descripcion = $2',
    [idTarea, descripcion]
  )
  if (existing.rows.length) return existing.rows[0].id_evidencia

  let url = 'https://placehold.co/600x400?text=Evidencia'
  let publicId = null

  const { isFileStorageConfigured, uploadBuffer } = await import('../services/fileStorage.js')
  if (isFileStorageConfigured()) {
    try {
      const png1x1 = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64'
      )
      const uploaded = await uploadBuffer({
        buffer: png1x1,
        filename: 'evidencia-seed.png',
        mimeType: 'image/png',
        purpose: 'evidence',
      })
      url = uploaded.url
      publicId = uploaded.key
    } catch (error) {
      console.warn('  ! No se pudo subir el archivo de evidencia a Cloudinary, se usa un placeholder:', error.message)
    }
  }

  const { rows: [evidencia] } = await pool.query(
    `INSERT INTO public.evidencia (descripcion, url_archivo, tipo_archivo, id_tarea, id_usuario, public_id, id_progress_entry)
     VALUES ($1, $2, 'IMAGEN', $3, $4, $5, $6)
     RETURNING id_evidencia`,
    [descripcion, url, idTarea, idUsuario, publicId, idProgressEntry]
  )
  return evidencia.id_evidencia
}

export async function seed() {
  console.log('==> Sembrando ambiente de pruebas...')

  const idEmpresa = await upsertEmpresa()
  console.log(`  Empresa: ${EMPRESA_NOMBRE} (#${idEmpresa})`)
  await ensureSuscripcionDemo(idEmpresa)
  console.log('  Plan de pruebas: Business (sembrado, sin pasarela).')

  // El primer participante es owner y el resto managers. Con los seis como
  // manager, el ambiente no podía ejercitar nada reservado al dueño —la
  // configuración de IVA y descuento, entre otras—: no había ninguna cuenta
  // capaz de abrir esas pantallas.
  const userIds = {}
  for (const [i, p] of PARTICIPANTS.entries()) {
    const id = await upsertUsuario(p)
    userIds[p.email] = id
    await ensureEmpresaUsuario(idEmpresa, id, i === 0 ? 'owner' : 'manager')
  }
  console.log(`  ${PARTICIPANTS.length} cuentas listas (participante1 es owner, el resto manager).`)

  const [p1, p2, p3, p4, p5, reserva] = PARTICIPANTS.map((p) => userIds[p.email])

  const proyecto1 = await ensureProyecto({
    idEmpresa,
    idEncargado: p1,
    nombre: 'Remodelación de bodega principal',
    descripcion: 'Renovación de estanterías, iluminación y señalización de la bodega central.',
    fechaInicio: daysFromNow(-3),
    fechaFin: daysFromNow(45),
    presupuesto: 45000,
    estado: 'PLANIFICADO',
  })

  const proyecto2 = await ensureProyecto({
    idEmpresa,
    idEncargado: p2,
    nombre: 'Renovación de línea de ferretería eléctrica',
    descripcion: 'Ampliación del catálogo de material eléctrico y capacitación del equipo de ventas.',
    fechaInicio: daysFromNow(-30),
    fechaFin: daysFromNow(30),
    presupuesto: 80000,
    estado: 'EN_PROGRESO',
  })

  const proyecto3 = await ensureProyecto({
    idEmpresa,
    idEncargado: p3,
    nombre: 'Apertura de sucursal Zona 4',
    descripcion: 'Acondicionamiento y apertura de la segunda sucursal en Zona 4.',
    fechaInicio: daysFromNow(-90),
    fechaFin: daysFromNow(5),
    presupuesto: 120000,
    estado: 'EN_PROGRESO',
  })

  for (const idProyecto of [proyecto1, proyecto2, proyecto3]) {
    for (const idUsuario of [p1, p2, p3, p4, p5, reserva]) {
      await ensureProyectoUsuario(idProyecto, idUsuario)
    }
  }
  console.log('  3 proyectos listos, con los 6 participantes como miembros.')

  await ensureProveedor({
    idEmpresa,
    nombre: 'Distribuidora Central',
    contactoNombre: 'María López',
    telefono: '+502 2233 4455',
    email: 'ventas@distribuidora-central.test',
  })
  await ensureProveedor({
    idEmpresa,
    nombre: 'Suministros El Faro',
    contactoNombre: 'Carlos Méndez',
    telefono: '+502 2456 7788',
    email: 'cotizaciones@elfaro.test',
  })
  console.log('  2 proveedores listos para vincular en F2.')

  await ensureMarketingPublication({
    idEmpresa,
    idProyecto: proyecto2,
    idUsuario: p1,
    title: 'Consejos para instalaciones eléctricas seguras',
    caption: 'Cinco recomendaciones para elegir materiales eléctricos certificados.',
  })
  console.log('  1 publicación de marketing lista para filtrar en F5.')

  await ensureTarea({ idProyecto: proyecto1, nombre: 'Cotizar estanterías industriales', descripcion: 'Solicitar 3 cotizaciones de proveedores locales.', estado: 'PENDIENTE', prioridad: 'ALTA', fechaVencimiento: daysFromNow(10), idAsignado: p1 })
  await ensureTarea({ idProyecto: proyecto1, nombre: 'Definir plano de distribución', descripcion: 'Layout final de pasillos y zonas de producto.', estado: 'PENDIENTE', prioridad: 'MEDIA', fechaVencimiento: daysFromNow(15), idAsignado: null })

  const tareaAvance = await ensureTarea({ idProyecto: proyecto2, nombre: 'Instalar exhibidor de material eléctrico', descripcion: 'Montaje del nuevo exhibidor en la sección eléctrica.', estado: 'EN_PROGRESO', prioridad: 'ALTA', fechaVencimiento: daysFromNow(5), idAsignado: p2 })
  await ensureTarea({ idProyecto: proyecto2, nombre: 'Capacitar equipo de ventas', descripcion: 'Sesión de producto para el equipo de piso.', estado: 'PENDIENTE', prioridad: 'MEDIA', fechaVencimiento: daysFromNow(12), idAsignado: reserva })
  await ensureTarea({ idProyecto: proyecto2, nombre: 'Actualizar catálogo digital', descripcion: 'Subir nuevos productos al catálogo en línea.', estado: 'COMPLETADA', prioridad: 'BAJA', fechaVencimiento: daysFromNow(-2), idAsignado: p4 })

  await ensureTarea({ idProyecto: proyecto3, nombre: 'Firmar contrato de arrendamiento', descripcion: 'Local de Zona 4, firma con el propietario.', estado: 'COMPLETADA', prioridad: 'CRITICA', fechaVencimiento: daysFromNow(-60), idAsignado: p3 })
  await ensureTarea({ idProyecto: proyecto3, nombre: 'Instalar mobiliario y punto de venta', descripcion: 'Montaje de racks, caja y sistema POS.', estado: 'COMPLETADA', prioridad: 'ALTA', fechaVencimiento: daysFromNow(-10), idAsignado: p5 })
  await ensureTarea({ idProyecto: proyecto3, nombre: 'Coordinar inauguración', descripcion: 'Evento de apertura con clientes y proveedores.', estado: 'EN_PROGRESO', prioridad: 'ALTA', fechaVencimiento: daysFromNow(4), idAsignado: p3 })
  console.log('  Tareas sembradas en los 3 proyectos.')

  await ensureProgressEntry({ idProyecto: proyecto1, idUsuario: p1, title: 'Cotizaciones solicitadas', details: 'Se enviaron solicitudes a 3 proveedores.', updateType: 'UPDATE', progressPercentage: 10, happenedAt: daysFromNow(-1) })

  const entryConEvidencia = await ensureProgressEntry({ idProyecto: proyecto2, idUsuario: p2, title: 'Exhibidor montado en un 60%', details: 'Estructura principal instalada, falta iluminación.', updateType: 'MILESTONE', progressPercentage: 60, happenedAt: daysFromNow(-2) })
  await ensureEvidenciaConArchivo({ idTarea: tareaAvance, idUsuario: p2, idProgressEntry: entryConEvidencia, descripcion: 'Foto del exhibidor a medio instalar' })

  await ensureProgressEntry({ idProyecto: proyecto3, idUsuario: p3, title: 'Apertura casi lista', details: 'Falta solo la coordinación del evento de inauguración.', updateType: 'UPDATE', progressPercentage: 90, happenedAt: daysFromNow(-1) })
  console.log('  Avances sembrados, incluido uno con evidencia adjunta.')

  const actividad1 = await ensurePresupuestoActividad({ idProyecto: proyecto1, nombre: 'Materiales de remodelación', montoPlanificado: 25000, montoReal: null })
  await ensureGasto({ idEmpresa, idProyecto: proyecto1, idUsuario: p1, idActividad: actividad1, motivo: 'Compra de estanterías metálicas', monto: 18000, fecha: daysFromNow(-2) })
  await ensureGasto({ idEmpresa, idProyecto: proyecto1, idUsuario: p1, idActividad: actividad1, motivo: 'Materiales de iluminación LED', monto: 4500, fecha: daysFromNow(-1) })

  const actividad2 = await ensurePresupuestoActividad({ idProyecto: proyecto2, nombre: 'Inventario eléctrico', montoPlanificado: 50000, montoReal: null })
  await ensureGasto({ idEmpresa, idProyecto: proyecto2, idUsuario: p2, idActividad: actividad2, motivo: 'Compra de exhibidores', monto: 12000, fecha: daysFromNow(-5) })
  await ensureGasto({ idEmpresa, idProyecto: proyecto2, idUsuario: p2, idActividad: actividad2, motivo: 'Inventario inicial de material eléctrico', monto: 18500, fecha: daysFromNow(-3) })

  const actividad3 = await ensurePresupuestoActividad({ idProyecto: proyecto3, nombre: 'Acondicionamiento de local', montoPlanificado: 100000, montoReal: null })
  await ensureGasto({ idEmpresa, idProyecto: proyecto3, idUsuario: p3, idActividad: actividad3, motivo: 'Arrendamiento y depósito', monto: 40000, fecha: daysFromNow(-85) })
  await ensureGasto({ idEmpresa, idProyecto: proyecto3, idUsuario: p3, idActividad: actividad3, motivo: 'Remodelación del local', monto: 52000, fecha: daysFromNow(-40) })
  await ensureGasto({ idEmpresa, idProyecto: proyecto3, idUsuario: p3, idActividad: actividad3, motivo: 'Mobiliario y sistema POS', monto: 24000, fecha: daysFromNow(-10) })
  console.log('  Gastos sembrados (proyecto 3 queda cerca del límite de presupuesto).')

  // ── Inventario ──────────────────────────────────────────────────────────────
  // Faltaba por completo: la empresa se sembraba con proyectos y gastos pero sin
  // un solo producto, así que el inventario y el POS salían vacíos.
  const catElectrico  = await ensureCategoria({ idEmpresa, nombre: 'Material eléctrico' })
  const catFerreteria = await ensureCategoria({ idEmpresa, nombre: 'Ferretería general' })
  const catPintura    = await ensureCategoria({ idEmpresa, nombre: 'Pinturas y solventes' })

  await ensureProveedor({
    idEmpresa, nombre: 'Distribuidora Eléctrica del Sur',
    contacto: 'Marta Solís', telefono: '+502 2245 8890', email: 'ventas@deselectrica.gt',
  })
  await ensureProveedor({
    idEmpresa, nombre: 'Tornillos y Herrajes Quetzal',
    contacto: 'Byron Cifuentes', telefono: '+502 2298 1170', email: 'pedidos@thquetzal.gt',
  })

  // Proyecto 1 — remodelación: material de obra, con dos artículos bajo mínimo
  // para que las alertas de stock bajo tengan algo que mostrar.
  await ensureProducto({ idProyecto: proyecto1, idCategoria: catFerreteria, nombre: 'Tornillo drywall 1" (caja 100)', descripcion: 'Caja de 100 unidades, punta fina.', precioVenta: 28.50, precioCosto: 17.00, stockActual: 64, stockMinimo: 20, codigoBarras: '7501001000017' })
  await ensureProducto({ idProyecto: proyecto1, idCategoria: catFerreteria, nombre: 'Cinta métrica 5 m', descripcion: 'Carcasa de ABS con freno.', precioVenta: 75.00, precioCosto: 44.00, stockActual: 12, stockMinimo: 6, codigoBarras: '7501001000024' })
  await ensureProducto({ idProyecto: proyecto1, idCategoria: catPintura, nombre: 'Pintura blanca mate (galón)', descripcion: 'Base agua, rendimiento 40 m².', precioVenta: 185.00, precioCosto: 121.00, stockActual: 3, stockMinimo: 10, codigoBarras: '7501001000031' })
  await ensureProducto({ idProyecto: proyecto1, idCategoria: catPintura, nombre: 'Brocha 3"', descripcion: 'Cerda natural, mango de madera.', precioVenta: 42.00, precioCosto: 23.50, stockActual: 2, stockMinimo: 8, codigoBarras: '7501001000048' })
  // Sin código de barras a propósito: el escáner no lo encuentra y la búsqueda sí.
  await ensureProducto({ idProyecto: proyecto1, idCategoria: catFerreteria, nombre: 'Lija de agua #220 (pliego)', descripcion: 'Pliego suelto, grano 220.', precioVenta: 6.50, precioCosto: 3.10, stockActual: 240, stockMinimo: 50 })

  // Proyecto 2 — inventario eléctrico.
  await ensureProducto({ idProyecto: proyecto2, idCategoria: catElectrico, nombre: 'Cable THHN 12 AWG (metro)', descripcion: 'Cobre, aislamiento termoplástico.', precioVenta: 9.75, precioCosto: 5.90, stockActual: 820, stockMinimo: 200, codigoBarras: '7501002000014' })
  await ensureProducto({ idProyecto: proyecto2, idCategoria: catElectrico, nombre: 'Interruptor simple blanco', descripcion: 'Placa incluida, 15 A.', precioVenta: 34.00, precioCosto: 19.50, stockActual: 96, stockMinimo: 30, codigoBarras: '7501002000021' })
  await ensureProducto({ idProyecto: proyecto2, idCategoria: catElectrico, nombre: 'Foco LED 9 W luz cálida', descripcion: 'Rosca E27, 806 lm.', precioVenta: 27.00, precioCosto: 14.25, stockActual: 150, stockMinimo: 40, codigoBarras: '7501002000038' })
  // Agotado: el POS debe decir "sin stock" en vez de dejar venderlo.
  await ensureProducto({ idProyecto: proyecto2, idCategoria: catElectrico, nombre: 'Tubo conduit 1/2" (3 m)', descripcion: 'PVC rígido, tramo de 3 metros.', precioVenta: 38.00, precioCosto: 21.00, stockActual: 0, stockMinimo: 25, codigoBarras: '7501002000045' })

  // Proyecto 3 — nueva sucursal. Repite DOS códigos de los proyectos anteriores
  // a propósito: el índice único es (id_proyecto, codigo_barras), así que el
  // mismo artículo físico puede estar en dos sucursales con stock distinto. Es
  // el caso que obliga al escáner a preguntar de qué proyecto descontar.
  await ensureProducto({ idProyecto: proyecto3, idCategoria: catElectrico, nombre: 'Foco LED 9 W luz cálida', descripcion: 'Mismo artículo que en el proyecto 2, stock aparte.', precioVenta: 27.00, precioCosto: 14.25, stockActual: 48, stockMinimo: 20, codigoBarras: '7501002000038' })
  await ensureProducto({ idProyecto: proyecto3, idCategoria: catFerreteria, nombre: 'Tornillo drywall 1" (caja 100)', descripcion: 'Mismo artículo que en el proyecto 1, stock aparte.', precioVenta: 28.50, precioCosto: 17.00, stockActual: 25, stockMinimo: 15, codigoBarras: '7501001000017' })
  await ensureProducto({ idProyecto: proyecto3, idCategoria: catFerreteria, nombre: 'Candado de bronce 40 mm', descripcion: 'Dos llaves incluidas.', precioVenta: 68.00, precioCosto: 38.00, stockActual: 33, stockMinimo: 10, codigoBarras: '7501003000011' })
  await ensureProducto({ idProyecto: proyecto3, idCategoria: catPintura, nombre: 'Thinner estándar (litro)', descripcion: 'Envase metálico de 1 litro.', precioVenta: 52.00, precioCosto: 29.00, stockActual: 7, stockMinimo: 12, codigoBarras: '7501003000028' })
  console.log('  Inventario sembrado: 13 productos en los 3 proyectos, 2 proveedores.')
  console.log('    · 3 artículos bajo el mínimo y 1 agotado, para las alertas de stock.')
  console.log('    · 2 códigos de barras repetidos entre proyectos, para probar el escáner.')

  await ensureReporte({ idEmpresa, idUsuario: p1, titulo: 'Resumen general de proyectos — Q3', tipo: 'CONSOLIDADO' })
  console.log('  Reporte de ejemplo listo.')

  console.log('==> Seed completado.')
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  seed()
    .then(() => pool.end())
    .catch((error) => {
      console.error('Seed falló:', error)
      process.exitCode = 1
    })
}
