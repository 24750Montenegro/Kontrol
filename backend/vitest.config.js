import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { assertThresholdGlobsMatch } from '../scripts/coverage-thresholds.mjs'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.js'],
    // Las suites de integración y de regresión necesitan un Postgres real y
    // tienen su propia configuración: `vitest.integration.config.js`.
    exclude: ['tests/integration/**', 'tests/regression/**', 'tests/privacy/**', 'node_modules/**'],

    coverage: {
      provider: 'v8',

      // Los reporters por defecto más `json-summary`, que escribe
      // `coverage/coverage-summary.json`: de ahí salen los porcentajes exactos
      // para el informe del sprint sin tener que abrir el reporte HTML.
      reporter: ['text', 'html', 'clover', 'json', 'json-summary'],

      // El denominador. `coverage.all` no existe en Vitest 4: sin `include`
      // solo se mide lo que algún test importa, así que un archivo que nadie
      // prueba no aparece en el reporte y no baja el porcentaje. SCRUM-23 lo
      // dejó sin declarar a propósito para no poner el gate en rojo, y el
      // resultado fue que 59 de los 94 archivos de `src/` eran invisibles y el
      // 37 % que reportaba el gate no era cobertura real. Con `include` el
      // denominador es todo `src/`: 83 archivos y 3 929 sentencias.
      include: ['src/**/*.js'],

      // Fuera del denominador. En Vitest 4 `coverageConfigDefaults.exclude`
      // viene vacío, así que todo lo que no deba contar va listado aquí.
      exclude: [
        // Ayudantes de test (`tests/helpers/authTestApp.js` inflaba la cifra).
        'tests/**',
        // Arranque del proceso: `app.listen`, sin lógica que probar.
        'src/index.js',
        // Pool de Postgres, conexión de Mongo, DDL de arranque y los scripts
        // de `npm run seed:test` / `reset:test`.
        'src/db/**',
        // Esquemas de Mongoose: declaraciones, no comportamiento.
        'src/models/**'
      ],

      // Vitest sale con código 1 si no se cumple un umbral, así que el step
      // `npm run test:coverage -w backend` de ci.yml pone el job en rojo solo.
      //
      // RTF 2 (TEST-01): `assertThresholdGlobsMatch` hace fallar este config
      // si algún glob de abajo no casa con ningún archivo, en lugar de dejarlo
      // aprobar en vacío.
      thresholds: assertThresholdGlobsMatch({
        // Trinquete, punto 2: el umbral global se fija en la línea base real
        // medida el 20/09/2026 sobre el denominador completo, truncada a
        // entero y menos 1 punto porcentual de margen.
        //
        // El margen es nuevo. SCRUM-23 iba sin margen, pero con el
        // denominador real hay dos fuentes de varianza que antes no pesaban:
        // v8 cuenta ramas y funciones distinto entre versiones mayores de
        // Node —se mide en local y se verifica en CI, que usa el 22 de
        // `.nvmrc`—, y sobre 3 929 sentencias un controlador nuevo de 200
        // sentencias sin test baja `statements` 0.78 puntos por sí solo. El
        // margen absorbe esa varianza; no relaja el trinquete.
        //
        // Trinquete, punto 3: +5 puntos porcentuales por sprint sobre el
        // umbral global, contados desde la base del 20/09/2026 (15/9/11/15).
        // La subida del Sprint 8 (20/14/16/20) no se aplicó a tiempo; el
        // 11/10/2026 se aplican juntas la del Sprint 8 y la del Sprint 9.
        // Medido ese día: 37.79 / 24.26 / 35.72 / 38.33 (1615/4273,
        // 642/2646, 194/543, 1532/3996). Próxima subida, al cierre del
        // Sprint 10: 30/24/26/30. La política completa está en el README,
        // sección «Cobertura de código».
        statements: 25, // medido 37.79 % — base 20/09: 16.21 %
        branches: 19, //   medido 24.26 % — base 20/09: 10.94 %
        functions: 21, //  medido 35.72 % — base 20/09: 12.42 %
        lines: 25, //      medido 38.33 % — base 20/09: 16.46 %

        // Umbrales por módulo crítico. Los globs se resuelven con picomatch
        // contra la ruta relativa a la raíz del workspace, y los archivos que
        // casan siguen contando también en el umbral global de arriba.
        //
        // Un glob que no casa con ningún archivo hace fallar el config (ver
        // `scripts/coverage-thresholds.mjs`). Cada glob lleva al lado su
        // medición real.

        // Presupuesto: cálculo financiero puro. Medido 100 % en las cuatro.
        'src/utils/budgetCalculations.js': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70
        },

        // Autenticación: verificación de token y de rol. Medido 100 % en las
        // cuatro para ambos archivos. La expansión de llaves casa solo con
        // requireAuth.js y requireRole.js — requireCompanyRole.js queda fuera.
        'src/middleware/require{Auth,Role}.js': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70
        },

        // Reportes: cuarto módulo crítico del trinquete de SCRUM-23.
        // Cubierto por `tests/reports.controller.test.js`. Medido el
        // 12/08/2026: los tres archivos al 100 % en las cuatro métricas.
        'src/controllers/reportsController.js': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70
        },
        'src/routes/reportsRoutes.js': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70
        },
        'src/schemas/reportsSchemas.js': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70
        },

        // POS, inventario, proveedores y autenticación del backend: la RTF 2
        // (TEST-03, TEST-04) los encontró en 0 %, con el umbral del POS en 0
        // como simple marcador. Ya no están en 0, pero lejos del 70 % de la
        // regla 1: el umbral se fija en lo medido el 26/10/2026, truncado y
        // menos 1 punto, como el global. No pide más cobertura; impide que
        // baje. Subirlos hacia el 70 % queda como trabajo a futuro.
        'src/controllers/inventoryMovementController.js': {
          // 31.25 / 17.5 / 28.57 / 31.18 — 65 de 208 sentencias
          statements: 30,
          branches: 16,
          functions: 27,
          lines: 30
        },
        'src/routes/inventoryMovementRoutes.js': {
          // 81.81 / 0 / 0 / 81.81 — 11 sentencias; ramas y funciones son las
          // de los middlewares en línea, que las pruebas no recorren
          statements: 80,
          branches: 0,
          functions: 0,
          lines: 80
        },
        'src/schemas/inventoryMovementSchemas.js': {
          // 100 en las cuatro — 7 sentencias
          statements: 99,
          branches: 99,
          functions: 99,
          lines: 99
        },
        'src/controllers/productController.js': {
          // 30.2 / 13.38 / 41.66 / 33.33 — 58 de 192 sentencias
          statements: 29,
          branches: 12,
          functions: 40,
          lines: 32
        },
        'src/controllers/supplierController.js': {
          // 30 / 10.71 / 40 / 30 — 18 de 60 sentencias
          statements: 29,
          branches: 9,
          functions: 39,
          lines: 29
        },
        'src/controllers/authController.js': {
          // 37.25 / 32.95 / 63.63 / 38.25 — 57 de 153 sentencias. Con el
          // cierre de empresa (PR #170), que añade la reautenticación a este
          // archivo, mide 35.84 / 30.20 / 58.33 / 37.01: el umbral va bajo
          // las dos para que ningún orden de merge lo ponga en rojo.
          statements: 34,
          branches: 29,
          functions: 57,
          lines: 36
        }
      }, fileURLToPath(new URL('.', import.meta.url)))
    }
  }
})
