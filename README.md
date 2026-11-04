<div align="center">

# Kontrol

**Plataforma de gestión de proyectos, equipos, inventario y marketing — con agente de IA integrado.**

Monorepo: **Vue 3 + Vite** en el frontend · **Node.js + Express** en el backend · **PostgreSQL** + **MongoDB** como bases de datos.

[![CI](https://github.com/PabloVS044/Kontrol/actions/workflows/ci.yml/badge.svg?event=pull_request)](https://github.com/PabloVS044/Kontrol/actions/workflows/ci.yml)

![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)
![Node](https://img.shields.io/badge/Node-20--22-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-ready-2496ED?logo=docker&logoColor=white)

</div>

---

## Tabla de contenido

- [Stack](#stack)
- [Requisitos](#requisitos)
- [Inicio rápido (Docker — Windows y Linux)](#inicio-rápido-docker--windows-y-linux)
- [Variables de entorno](#variables-de-entorno)
- [Comandos útiles de Docker](#comandos-útiles-de-docker)
- [Desarrollo sin Docker (opcional)](#desarrollo-sin-docker-opcional)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Integración continua](#integración-continua)
- [Cobertura de código](#cobertura-de-código)
- [Pruebas de integración y regresión](#pruebas-de-integración-y-regresión)
- [Solución de problemas](#solución-de-problemas)
- [Documentación legal](#documentación-legal)
- [Licencia](#licencia)
- [Contribuir](#contribuir)

---

## Stack

| Capa | Tecnología | Puerto local |
|---|---|---|
| Frontend | Vue 3 · Vite · Pinia · Vue Router · Socket.IO · Three / OGL / GSAP | `5173` |
| Backend | Node.js · Express · Socket.IO · Zod · JWT · Google OAuth | `3000` |
| Base de datos relacional | PostgreSQL 16 | `5433` (host) → `5432` (contenedor) |
| Base de datos de chat | MongoDB 7 | `27017` |
| Agente de IA | Servidor de inferencia compatible con OpenAI (Qwen 3.6 vía vLLM) | externo / configurable |

---

## Requisitos

| Camino | Necesitas |
|---|---|
| **Recomendado — Docker** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose). En Linux: `docker` + `docker compose` v2. |
| **Sin Docker** | [Node.js 20–22](https://nodejs.org) (ver `.nvmrc` → `22`), PostgreSQL 16 y MongoDB 7 corriendo localmente. |

> El proyecto usa `node >=20 <23`. Si usas [`nvm`](https://github.com/nvm-sh/nvm) (Linux/macOS) o [`nvm-windows`](https://github.com/coreybutler/nvm-windows): `nvm install 22 && nvm use 22`.

---

## Inicio rápido (Docker — Windows y Linux)

Un solo flujo sirve para **ambos sistemas operativos**. Los comandos `git` y `docker compose` son idénticos; solo cambia cómo copias el archivo `.env`.

```bash
# 1. Clonar el repositorio
git clone git@github.com:PabloVS044/Kontrol.git
cd Kontrol
```

**2. Crear el archivo de variables de entorno**

<table>
<tr><th>Linux / macOS (bash)</th><th>Windows (PowerShell)</th><th>Windows (CMD)</th></tr>
<tr>
<td><code>cp backend/.env.example backend/.env</code></td>
<td><code>Copy-Item backend/.env.example backend/.env</code></td>
<td><code>copy backend\.env.example backend\.env</code></td>
</tr>
</table>

Edita `backend/.env` y rellena al menos `JWT_SECRET` (cualquier cadena larga aleatoria). El resto puede quedar vacío para un arranque básico — ver [Variables de entorno](#variables-de-entorno).

```bash
# 3. Levantar todo (frontend + backend + PostgreSQL + MongoDB)
docker compose up
```

La primera vez Docker construye las imágenes e inicializa PostgreSQL con `backend/kontrol.sql`. Cuando termine:

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend (API) | http://localhost:3000 |
| PostgreSQL | `localhost:5433` (usuario `postgres` / pass `postgres` / db `kontrol`) |
| MongoDB | `localhost:27017` (db `kontrol_chat`) |

**Hot reload activado** en frontend y backend: cualquier cambio en el código se refleja sin reiniciar nada.

> ¿El puerto `5433` está ocupado? Define otro antes de levantar:
> - Linux/macOS: `POSTGRES_HOST_PORT=5434 docker compose up`
> - PowerShell: `$env:POSTGRES_HOST_PORT=5434; docker compose up`

---

## Variables de entorno

Todas viven en `backend/.env` (copiado desde `backend/.env.example`). **Nunca** se commitea. Si añades una variable nueva, actualiza también `.env.example`.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PORT` | — | Puerto del backend (default `3000`). |
| `DATABASE_URL` | sí | Cadena de conexión a PostgreSQL. En Docker el host es `postgres`; sin Docker, `localhost`. |
| `DATABASE_SSL` | — | `true` solo si la DB remota exige SSL (ej. Supabase). |
| `JWT_SECRET` | **sí** | Secreto para firmar JWT. Cadena larga y aleatoria. |
| `JWT_EXPIRES_IN` | — | Caducidad del token (default `8h`). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | para login Google | Credenciales OAuth de [Google Cloud Console](https://console.cloud.google.com). |
| `FRONTEND_URL` | sí | URL del frontend para redirigir tras el callback OAuth. |
| `MONGODB_URI` | sí | Conexión a MongoDB (chat). En Docker el host es `mongo`. |
| `INTEGRATION_ENCRYPTION_KEY` | — | Clave para cifrar API keys/webhooks guardados. Si falta, usa `JWT_SECRET`. |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | para adjuntos | Credenciales de [Cloudinary](https://cloudinary.com) (adjuntos del chat y evidencias de tareas). Están en *Dashboard → API Keys*. Sin ellas no se pueden subir archivos. |
| `AGENT_API_KEY` | para el agente IA | Token Bearer del endpoint Qwen de ClawStitch. |
| `AGENT_API_URL` | — | Override opcional de la base OpenAI-compatible del agente. Default: `https://model.clawstitch.com/v1`. |
| `AGENT_MODEL` | — | Modelo del agente (default `Qwen/Qwen3.6-27B-FP8`). |
| `AGENT_TEMPERATURE` / `AGENT_MAX_TOKENS` / `AGENT_MAX_STEPS` | — | Parámetros de inferencia del agente. |
| `BILLING_PROVIDER` | — | Pasarela de pago (default `stripe`). Ver [pagos y suscripciones](docs/pagos-suscripciones.md). |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | para pagos | **Solo claves de modo de prueba** (`sk_test_…`): el backend no arranca con otra. Vacías = todas las empresas en el plan Gratis. |

> Para producción/despliegue en VM existe `.env.deploy.example` + `scripts/deploy.sh`. Eso es otro flujo, no necesario para desarrollo local.

---

## Comandos útiles de Docker

```bash
# Levantar en segundo plano
docker compose up -d

# Ver logs (todos / un servicio)
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Detener (mantiene los datos)
docker compose down

# Detener y BORRAR volúmenes (resetea PostgreSQL y MongoDB)
docker compose down -v

# Reconstruir imágenes (tras cambiar package.json o un Dockerfile.dev)
docker compose up --build

# Abrir una shell dentro de un contenedor
docker compose exec backend sh
docker compose exec postgres psql -U postgres -d kontrol
```

---

## Desarrollo sin Docker (opcional)

Solo si prefieres correr Node directamente. Necesitas **PostgreSQL 16** y **MongoDB 7** instalados y corriendo, y haber creado la base `kontrol` cargando `backend/kontrol.sql`.

Antes de empezar, configura `backend/.env` apuntando a `localhost`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kontrol
MONGODB_URI=mongodb://localhost:27017/kontrol_chat
```

**Opción A — una terminal por subcarpeta** (lo más habitual). Funciona igual en Windows y Linux:

```bash
# Terminal 1 — backend
cd backend
npm i
npm run dev        # Node --watch en :3000

# Terminal 2 — frontend
cd frontend
npm i
npm run dev        # Vite en :5173
```

**Opción B — desde la raíz** (workspaces, una sola terminal):

```bash
npm install        # instala backend + frontend de una vez
npm run dev        # levanta ambos en paralelo (concurrently)
```

Otros scripts del `package.json` raíz:

| Script | Acción |
|---|---|
| `npm run dev` | Frontend y backend en paralelo (`concurrently`). |
| `npm run dev:frontend` | Solo el frontend (Vite en `:5173`). |
| `npm run dev:backend` | Solo el backend (Node `--watch` en `:3000`). |
| `npm run build` | Build de producción del frontend. |

**Atajo en Linux:** `./dev.sh` abre backend y frontend en dos pestañas de `gnome-terminal`.

> El frontend hace proxy de `/api` y `/socket.io` hacia el backend (configurable con `VITE_API_PROXY_TARGET`).

---

## Estructura del proyecto

```
Kontrol/
├── frontend/              # Vue 3 + Vite + Pinia + Vue Router          -> :5173
│   ├── src/
│   │   └── services/
│   │       ├── http.js    # Cliente HTTP: URL, auth, reintentos y 401
│   │       ├── api.js     # Enruta cada petición al servicio de dominio
│   │       └── domains/   # Adaptadores por dominio sobre el cliente HTTP
│   ├── vite.config.js
│   └── Dockerfile.dev
├── backend/               # Node.js + Express + Socket.IO              -> :3000
│   ├── src/
│   │   ├── controllers/   # Lógica de cada recurso (auth, projects, tasks, ...)
│   │   ├── routes/        # Definición de endpoints
│   │   ├── middleware/    # Auth, roles, permisos, validación
│   │   ├── services/      # Integraciones, IA, notificaciones, email, Slack
│   │   ├── schemas/       # Validación con Zod
│   │   ├── models/        # Modelos de MongoDB (chat)
│   │   ├── db/            # Pool de PostgreSQL, conexión a Mongo, bootstrap
│   │   └── index.js       # Punto de entrada
│   ├── kontrol.sql        # Esquema inicial de PostgreSQL (lo carga Docker)
│   ├── .env.example
│   └── Dockerfile.dev
├── scripts/               # azure-setup.sh, deploy.sh (despliegue en VM)
├── docker-compose.yml     # Entorno de desarrollo
├── docker-compose.prod.yml# Entorno de producción
├── Caddyfile              # Reverse proxy en producción
├── dev.sh                 # Atajo para levantar dev en Linux
└── package.json           # Workspaces del monorepo
```

Las llamadas del frontend deben pasar por `src/services/api.js`; los adaptadores
de dominio delegan en `src/services/http.js`, que resuelve la URL base e inyecta
la autenticación y la empresa activa. Los 401 invalidan la sesión en el cliente
común y la app redirige a login desde un único listener.

---

## Integración continua

Cada pull request a `main` o `develop` dispara `.github/workflows/ci.yml`, con tres jobs en paralelo. Ninguno se lanza a mano y ninguno lleva `continue-on-error`: si uno falla, el PR queda en rojo. El badge del encabezado muestra el estado de la última corrida de ese workflow en un pull request.

| Job | Tipo de prueba | Qué corre | Bloquea el merge |
|---|---|---|---|
| Backend - tests unitarios | Unitarias | Vitest con cobertura v8 y los umbrales de [Cobertura de código](#cobertura-de-código) | Sí, check requerido en `main` y `develop` |
| Frontend - tests unitarios y build | Unitarias | Vitest con cobertura v8, umbrales, y `vite build` de producción | Sí, check requerido en `main` y `develop` |
| Carga - k6 | Carga | `k6/ci-load-test.js` contra un backend y un PostgreSQL desechables levantados en el runner, con los umbrales de `docs/plan-maestro-pruebas.md` §7.2 | Queda en rojo si falla; no es check requerido |

Los reportes de cobertura (`coverage-backend`, `coverage-frontend`) y el resumen de k6 (`k6-summary`) se publican como artefactos de cada corrida durante 30 días.

El job de carga es una prueba corta de regresión (5–10 usuarios virtuales, ~3.5 min), no una medición de capacidad. La batería completa contra el ambiente de pruebas de la VM está en `.github/workflows/load-test.yml`, se lanza a mano y sus resultados están en `docs/pruebas-carga-estres.md`. Detalles en [`k6/README.md`](k6/README.md).

### Despliegue continuo

Cada push a `main` dispara `.github/workflows/deploy.yml`, que despliega en la VM de producción de Google Cloud (`https://kontrol.it.com`) con `scripts/deploy.sh`. Lee la configuración de los secrets del environment `DEPLOY_ENV`, uno por variable de `.env.deploy.example`. Requisitos y pasos en [`docs/despliegue-produccion.md`](docs/despliegue-produccion.md) §5.

---

## Cobertura de código

La cobertura no es solo informativa: es un **control automático que bloquea el merge**. Vitest sale con código distinto de cero si un umbral no se cumple, y el workflow de CI propaga ese fallo, así que un PR que baje la cobertura queda en rojo.

```bash
npm run test:coverage -w backend
npm run test:coverage -w frontend
```

### Política de trinquete

Acordada en la retrospectiva del Sprint 5 (SCRUM-23) y recalibrada el 20/09/2026 al declarar `coverage.include` y remedir sobre el denominador completo. Tres reglas:

1. **Umbral del 70 % por módulo crítico** — POS, presupuesto, autenticación y reportes. Dos excepciones vigentes, documentadas más abajo: POS, inventario, proveedores y autenticación del backend llevan un umbral sobre lo medido, no sobre el 70 %, y `stores/auth.js` lleva 65 en ramas.
2. **Umbral global fijado en la línea base medida, menos 1 punto porcentual de margen.** El umbral no autoriza a bajar cobertura: el margen solo cubre la varianza de la medición.
3. **+5 puntos porcentuales por sprint** sobre el umbral global, contados desde esta base nueva.

Hasta el 20/09/2026 la regla 2 iba sin margen, y funcionaba mientras el denominador era pequeño y estable. Con el denominador real hay dos fuentes de varianza que antes no pesaban. La primera es la versión de Node: v8 contabiliza ramas y funciones de forma distinta entre versiones mayores, y la medición se hace en local mientras el CI usa el 22 de `.nvmrc`. La segunda es el tamaño del denominador: sobre 3 929 sentencias de backend, un controlador nuevo de 200 sentencias sin prueba baja `statements` 0.78 puntos por sí solo, y sobre 9 152 de frontend una vista nueva de 300 sentencias lo baja 0.32. Sin margen, cualquier PR que añada un archivo sin prueba quedaría rojo aunque no tocara nada de lo ya cubierto.

### Línea base: antes y después

La caída del 20/09/2026 es una corrección de medición, no una regresión. No se eliminó ninguna prueba y ninguna línea dejó de estar cubierta: el numerador es idéntico, 637 sentencias en backend y 929 en frontend. Lo único que cambió es el denominador, que antes contenía solo los archivos que algún test importaba.

| Backend | Antes | Después |
|---|---|---|
| Statements | 37.05 % (637/1 719) | **16.21 % (637/3 929)** |
| Branches | 23.96 % (265/1 106) | **10.94 % (265/2 421)** |
| Functions | 27.44 % (59/215) | **12.42 % (59/475)** |
| Lines | 37.24 % (610/1 638) | **16.46 % (610/3 705)** |
| Archivos en el reporte | 35 de 94 | **83 de 83** |

| Frontend | Antes | Después |
|---|---|---|
| Statements | 92.90 % (929/1 000) | **10.15 % (929/9 152)** |
| Branches | 87.07 % (586/673) | **9.84 % (586/5 955)** |
| Functions | 91.30 % (252/276) | **12.12 % (252/2 078)** |
| Lines | 93.90 % (848/903) | **10.46 % (848/8 104)** |
| Archivos en el reporte | 19 de código, más 6 recursos | **129 de 129** |

### Umbrales vigentes

Línea base medida el 20/09/2026. Remedido el 11/10/2026 y el 26/10/2026.

| | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| Backend — medido 11/10/2026 | 37.79 | 24.26 | 35.72 | 38.33 |
| Backend — medido 26/10/2026 | 45.39 | 31.36 | 46.22 | 45.82 |
| Backend — actual (Sprint 8 + Sprint 9) | 25 | 19 | 21 | 25 |
| Backend — cierre Sprint 10 | 30 | 24 | 26 | 30 |
| Frontend — medido 11/10/2026, antes de las pruebas nuevas | 10.61 | 10.43 | 12.72 | 10.96 |
| Frontend — medido 11/10/2026, con las pruebas nuevas | 16.24 | 16.49 | 18.47 | 16.65 |
| Frontend — medido 26/10/2026 | 26.53 | 24.81 | 27.61 | 27.39 |
| Frontend — actual (Sprint 8) | 14 | 13 | 16 | 14 |
| Frontend — meta Sprint 9, no alcanzada | 19 | 18 | 21 | 19 |

La subida del Sprint 8 no se aplicó a tiempo en ningún workspace. En backend se aplican juntas la del Sprint 8 y la del Sprint 9 (+10 sobre la base), y la cobertura medida las supera con al menos 5 puntos de margen. En frontend la cobertura no alcanzaba ni la meta del Sprint 8; se añadieron pruebas de utilidades (`utils/chat.js`, `boxPricing.js`, `authFlow.js`, `markdown.js`, `taskIndicatorColors.js`), servicios (`agent`, `integrations`, `marketing`), stores (`chat`, `saleConfig`, `birdie`) y `composables/useTheme.js`, y con ellas se aplica la del Sprint 8 con al menos 2.2 puntos de margen. La del Sprint 9 en frontend (19/18/21/19) queda pendiente: exige unos 260 statements más, que ya pasan por probar vistas.

Por módulo crítico, con su medición real al lado:

| Módulo | Archivo | Medido | Umbral |
|---|---|---|---|
| Presupuesto | `backend/src/utils/budgetCalculations.js` | 100 / 100 / 100 / 100 | 70 × 4 |
| Autenticación | `backend/src/middleware/require{Auth,Role}.js` | 100 / 100 / 100 / 100 | 70 × 4 |
| Reportes | `backend/src/controllers/reportsController.js` | 97.53 / 100 / 100 / 97.53 | 70 × 4 |
| Reportes | `backend/src/routes/reportsRoutes.js` | 100 / 100 / 100 / 100 | 70 × 4 |
| Reportes | `backend/src/schemas/reportsSchemas.js` | 100 / 100 / 100 / 100 | 70 × 4 |
| POS | `backend/src/controllers/inventoryMovementController.js` | 31.25 / 17.50 / 28.57 / 31.18 | 30 / 16 / 27 / 30 |
| POS | `backend/src/routes/inventoryMovementRoutes.js` | 81.81 / 0 / 0 / 81.81 | 80 / 0 / 0 / 80 |
| POS | `backend/src/schemas/inventoryMovementSchemas.js` | 100 / 100 / 100 / 100 | 99 × 4 |
| Inventario | `backend/src/controllers/productController.js` | 30.20 / 13.38 / 41.66 / 33.33 | 29 / 12 / 40 / 32 |
| Proveedores | `backend/src/controllers/supplierController.js` | 30 / 10.71 / 40 / 30 | 29 / 9 / 39 / 29 |
| Autenticación | `backend/src/controllers/authController.js` | 37.25 / 32.95 / 63.63 / 38.25 | 34 / 29 / 57 / 36 |
| POS | `frontend/src/utils/sales.js` | 95.45 / 94.44 / 100 / 100 | 70 × 4 |
| Autenticación | `frontend/src/stores/auth.js` | 71.60 / 66.66 / 70.37 / 75 | 70 / 65 / 70 / 70 |
| Reportes | `frontend/src/utils/reportExport.js` | 96.87 / 94.44 / 93.33 / 96.87 | 70 × 4 |
| Reportes | `frontend/src/utils/pdf/reportPdf.js` | 95.08 / 77.50 / 100 / 95.61 | 70 × 4 |
| Reportes | `frontend/src/utils/pdf/pdfDocument.js` | 89.04 / 75.26 / 96.66 / 90.40 | 70 × 4 |

Tres notas sobre esta tabla:

- Los umbrales de reportes del frontend apuntaban antes a `views/ReportsView.vue`, `views/ReportDetailView.vue` y `components/reports/**`, y casaban con cero archivos. Los tests que esperaban nunca llegaron: esos quince archivos siguen a 0 %. Se redirigieron a los tres archivos del módulo que sí tienen pruebas, donde vive la lógica de exportación. Las vistas y los componentes no quedan desprotegidos: ahora entran al denominador global, así que su 0 % pesa ahí en lugar de esconderse detrás de un glob vacío.
- El POS de backend iba en 0 como marcador, y en 0 no protegía nada. La RTF 2 (TEST-03 y TEST-04) lo señaló junto con inventario, proveedores y autenticación, que medían 0 %. Las pruebas de caracterización llegadas desde entonces los sacaron de 0, aunque siguen lejos del 70 %. Desde el 26/10/2026 sus umbrales están en lo medido, truncado y menos 1 punto (autenticación, por debajo de lo que mide con el cierre de empresa del PR #170, que añade código a ese controlador): no exigen más cobertura, pero ya no dejan que baje. Llevarlos al 70 % queda como trabajo a futuro.
- `frontend/src/stores/auth.js` subió de 60/55/55/60, escalón fijado cuando el archivo medía 66.66/60.41/59.25/69.73. Ramas se queda en 65 porque mide 66.66. En funciones el margen es de 0.37 puntos (19 de 27): una función que deje de cubrirse incumple el umbral.

### Cobertura real por módulo

Punto de partida de las tareas de caracterización del Sprint 8. Formato: statements / branches / functions / lines.

| Módulo | Archivos | Cobertura | Sentencias |
|---|---|---|---|
| POS backend | 3 | **0 / 0 / 0 / 0** | 0 / 198 |
| Inventario backend | 3 | **0 / 0 / 0 / 0** | 0 / 205 |
| Proveedores backend | 3 | **0 / 0 / 0 / 0** | 0 / 72 |
| Autenticación backend | 3 | **0 / 0 / 0 / 0** | 0 / 126 |
| Autorización (`middleware/**`) | 9 | **50.00 / 37.33 / 66.67 / 48.39** | 50 / 100 |
| Presupuesto backend | 4 | 20.22 / 28.48 / 21.05 / 18.36 | 54 / 267 |
| Reportes backend | 3 | 97.92 / 100 / 100 / 97.92 | 94 / 96 |
| POS frontend — `utils/sales.js` | 1 | 95.45 / 94.44 / 100 / 100 | 42 / 44 |
| POS frontend — componentes de venta | 3 | 95.45 / 93.15 / 93.33 / 97.37 | 126 / 132 |
| Inventario frontend | 10 | 14.52 / 10.48 / 10.65 / 15.06 | 126 / 868 |
| Proveedores frontend (`SuppliersView.vue`) | 1 | **0 / 0 / 0 / 0** | 0 / 121 |
| Autenticación frontend | 3 | 70.94 / 67.90 / 70.59 / 72.90 | 83 / 117 |
| Reportes frontend — exportación | 3 | 92.33 / 83.41 / 96.92 / 93.36 | 277 / 300 |
| Reportes frontend — vistas y componentes | 15 | **0 / 0 / 0 / 0** | 0 / 887 |

Autorización es el único de los módulos bloqueantes que no parte de cero: `requireAuth.js` y `requireRole.js` al 100 %, `validate.js` 100/75/100/100, `requireCompanyRole.js` 87.50, `requireCompany.js` 61.90, `requireCompanyOwner.js` 14.28, `requireProjectPermission.js` 13.04, y `requireProject.js` y `requireSuperUser.js` a 0.

El 14.52 % de inventario del frontend se concentra en los tres componentes de venta, que están al 95 %. El resto del módulo, `InventoryPage.vue` incluido, está sin cubrir.

### Qué se mide

`coverage.all` no existe en Vitest 4, así que el denominador lo fija `coverage.include`. Desde el 20/09/2026 está declarado en los dos workspaces.

| | Backend | Frontend |
|---|---|---|
| `include` | `src/**/*.js` | `src/**/*.{js,vue}` |
| `exclude` | `tests/**`, `src/index.js`, `src/db/**`, `src/models/**` | `tests/**`, `src/main.js`, `src/router/**`, `src/locales/**`, `src/assets/**`, `src/styles/**`, `src/components/UI/Backgrounds/**` |
| Denominador | 83 archivos, 3 929 sentencias | 129 archivos, 9 152 sentencias |

Queda fuera el arranque del proceso, la configuración de SDK externos, las conexiones y scripts de base de datos, los esquemas declarativos de Mongoose, la tabla de rutas, los diccionarios de i18n, los recursos estáticos y los fondos WebGL. `src/socket/index.js` sí entra: son 450 líneas de lógica de chat, no infraestructura. Las extensiones explícitas del `include` del frontend dejan fuera los `.css`, `.png` y `.json` que antes figuraban como archivos medidos.

Vitest, por sí solo, aprueba **en vacío y sin avisar** un glob de umbral que no case con ningún archivo. No es hipotético: es lo que ocurrió con los tres umbrales de reportes del frontend durante un mes. Desde el 26/10/2026 (RTF 2, TEST-01) los dos configs pasan sus umbrales por `scripts/coverage-thresholds.mjs`, y la configuración falla al cargar si algún glob se queda vacío. Cada umbral por módulo sigue llevando su medición real en un comentario al lado.

---

## Pruebas de integración y regresión

Además de las pruebas unitarias (`npm test`, con el pool de Postgres simulado), el backend tiene dos suites que corren contra un **PostgreSQL real**: la app de `src/index.js` recibe peticiones HTTP de Supertest y sus consultas llegan a una base desechable con el esquema de `backend/kontrol.sql` más las migraciones de `ensureDatabaseSchema()`.

```bash
npm run db:test:up -w backend          # Postgres 16 en localhost:5433 (docker-compose.integration.yml)
npm run test:integration -w backend    # tests/integration/
npm run test:regression -w backend     # tests/regression/
npm run db:test:down -w backend
```

| Suite | Archivo | Qué verifica |
|---|---|---|
| I1 | `tests/integration/auth.int.test.js` | Registro → login → `/me` a través de Postgres, bcrypt y JWT |
| I2 | `tests/integration/posSale.int.test.js` | Venta POS atómica: `venta`, `movimiento_inventario` y stock coherentes; ROLLBACK si falla |
| I3 | `tests/integration/productBarcode.int.test.js` | Unicidad del código de barras por proyecto impuesta por el índice único de la base |
| RG1 | `tests/regression/saleTotals.regression.test.js` | El IVA se calcula sobre la base con descuento (Q100 − 10 % + IVA = Q100.80) |
| RG2 | `tests/regression/salePriceAuthority.regression.test.js` | El precio lo dicta la base; un precio del cliente distinto da 409 `PRICE_MISMATCH` |
| RG3 | `tests/regression/tenantIsolation.regression.test.js` | Un usuario no ve ni vende datos de otra empresa |

`globalSetup` **borra el esquema `public`** antes de cada ejecución, así que `tests/db/testDatabase.js` se niega a correr si `TEST_DATABASE_URL` no apunta a un host local con una base cuyo nombre contenga `test`. El `.env` de desarrollo (Supabase) nunca se usa.

En CI las corre `.github/workflows/integration-regression.yml` en cada PR a `main` o `develop` (y a mano con *Run workflow*): un job por suite, con Postgres como *service container*, resumen por prueba en la página del run y los reportes JUnit/JSON como artefactos `reporte-integration` y `reporte-regression`.

---

## Solución de problemas

| Síntoma | Causa / solución |
|---|---|
| `port is already allocated` al hacer `docker compose up` | Otro proceso usa `3000`, `5173`, `5433` o `27017`. Cierra ese proceso o cambia `POSTGRES_HOST_PORT`. |
| El backend arranca pero no conecta a PostgreSQL | `DATABASE_URL` debe usar host `postgres` dentro de Docker y `localhost` fuera. |
| Cambié `package.json` y no se ven las nuevas dependencias | `docker compose up --build` (las `node_modules` viven en un volumen). |
| Quiero empezar de cero (base de datos limpia) | `docker compose down -v && docker compose up`. |
| Login con Google falla | Faltan `GOOGLE_CLIENT_ID/SECRET` o la *redirect URI* no coincide con `GOOGLE_CALLBACK_URL`. |
| En Windows: `git clone` por SSH falla | Usa la URL HTTPS: `git clone https://github.com/PabloVS044/Kontrol.git` |
| `npm install` falla por versión de Node | Usa Node 20–22 (`.nvmrc` = `22`). |

---

## Documentación legal

El [expediente legal de Kontrol](docs/legal/README.md) reúne el marco para Guatemala, los borradores de Términos y Condiciones y Política de Privacidad, el inventario verificable de datos y la revisión de proveedores. Incluye el alcance de Stripe exclusivamente en modo test, sin cobros reales; el diseño del módulo de suscripciones y la limitación del proveedor en Guatemala están en [docs/pagos-suscripciones.md](docs/pagos-suscripciones.md).

La versión pública resumida está en la vista `/legal`, enlazada desde el pie de página, con el contacto `support@kontrol.it.com`. Al entrar por primera vez, cada usuario debe aceptar los Términos en un aviso bloqueante; la aceptación se guarda en el navegador y se vuelve a pedir al subir `LEGAL_VERSION` en `frontend/src/utils/legal.js`.

Consulta en el expediente las reservas de investigación y los pendientes antes de publicar los documentos o usar el producto comercialmente. Los textos requieren revisión profesional en Guatemala.

---

## Licencia

Copyright (c) 2026 los integrantes del equipo de desarrollo de Kontrol. **Todos los derechos reservados.** Kontrol es software propietario de sus integrantes, no de la Universidad del Valle de Guatemala; no se concede ninguna licencia de uso, copia ni distribución sin autorización por escrito. Texto completo en [`LICENSE`](LICENSE) y la decisión, con su justificación, en [`docs/legal/licencia.md`](docs/legal/licencia.md).

Las bibliotecas de terceros conservan sus licencias. La [auditoría de licencias](docs/legal/licencias/README.md) no encontró dependencias copyleft fuertes, y los avisos de producción se publican con la aplicación en [`THIRD-PARTY-NOTICES.txt`](frontend/public/THIRD-PARTY-NOTICES.txt). Después de cambiar dependencias, `npm run licenses` regenera el inventario y las atribuciones.

---

## Contribuir

Lee [`CONTRIBUTING.md`](CONTRIBUTING.md): convención de ramas (`type/short-description`), Conventional Commits, plantillas de PR/issues y manejo de secretos.

Resumen rápido:
- Rama desde `main`: `feat/...`, `fix/...`, `docs/...`, etc.
- Commits: `type(scope): descripción en imperativo`.
- Un PR por feature/fix · rellena la plantilla · al menos una review antes de mergear.
- Nunca commitees `.env` con credenciales reales; actualiza `.env.example` al añadir variables.


### Validación de privacidad P1

La limpieza de cuentas y las escrituras de chat necesitan un MongoDB con soporte
para transacciones (replica set o clúster fragmentado). El Compose local y el de
integración inicializan un replica set de un nodo para desarrollo/pruebas.
La guía [PRIVACY_VALIDATION.md](PRIVACY_VALIDATION.md) contiene los cambios,
las pruebas, los comandos y el requisito de despliegue.
