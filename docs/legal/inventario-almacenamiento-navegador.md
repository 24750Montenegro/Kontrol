# Inventario de almacenamiento en el navegador

**Tarea L-3 · corte: 23 de octubre de 2026 · base de código `8616968` (rama `feat/p1-export-delete-account`).**

Este documento enumera todo lo que el código de Kontrol escribe en el navegador del usuario. Es la base de la [Política de cookies y almacenamiento](politica-cookies.md) y amplía la tabla de la [§6 del inventario de datos](inventario-datos.md).

## Cómo se levantó

Búsqueda sobre `frontend/src`, `frontend/index.html`, `frontend/public`, `backend/src` y `shared`:

```bash
grep -rnE "localStorage|sessionStorage|indexedDB|document\.cookie|res\.cookie|Set-Cookie|serviceWorker|caches\.open" \
  frontend/src frontend/index.html frontend/public backend/src shared
grep -rnE "useStorage|useLocalStorage|useSessionStorage|setItem|getItem|removeItem" frontend/src
```

Para repetir la verificación basta con volver a correr esas dos búsquedas: cualquier clave que aparezca y no esté en la tabla de abajo es un hueco del inventario.

Resultado:

| Mecanismo | Uso encontrado |
| --- | --- |
| `localStorage` | 12 claves fijas y 2 familias de claves con prefijo (tablas siguientes). Once existían antes de L-3; L-3 añade `kontrol:storage-consent`. |
| `sessionStorage` | Ninguno. |
| IndexedDB | Ninguno. |
| Cookies propias | Ninguna. El frontend no escribe `document.cookie` y el backend no envía `Set-Cookie`: no usa `res.cookie`, `express-session` ni `cookie-parser`, y Socket.IO trabaja con su opción `cookie` por defecto (desactivada). |
| Service worker / Cache API | Ninguno. |
| Dependencias del frontend | `@vueuse/core` se usa sin sus helpers de almacenamiento (`useStorage`, `useDark`…). Ninguna otra dependencia de `frontend/package.json` escribe en el navegador en el uso que hace Kontrol de ella. |

## Claves de `localStorage`

Duración: `localStorage` no caduca. Todas las claves duran hasta que el código las borra o el usuario borra los datos del sitio en su navegador. La columna indica cuándo las borra el código, si lo hace.

### Imprescindibles: sin ellas la aplicación no funciona

| Clave | Qué guarda | Para qué | Cuánto dura | Dónde se escribe |
| --- | --- | --- | --- | --- |
| `token` | JWT de sesión con `id_usuario`, `email`, `nombre_rol`, `iat`, `exp`. Firmado, **no cifrado**: cualquiera que lo lea puede decodificar su contenido. | Autenticar cada llamada a la API (`Authorization: Bearer`) y la conexión de Socket.IO. | Se borra al cerrar sesión y cuando la API responde 401. El JWT deja de ser válido a las 8 h (`JWT_EXPIRES_IN`), pero su texto sigue en el navegador hasta que se borre. | `frontend/src/services/http.js` (`setStoredToken`, `clearStoredToken`) |
| `user` | Perfil: `id_usuario`, `nombre`, `apellido`, `email`, `nombre_rol` y, tras `/me`, `telefono` y `activo`. | Mostrar la identidad y decidir qué ve la interfaz. | Se borra al cerrar sesión. | `frontend/src/stores/auth.js` (`setUser`, `logout`) |
| `empresas` | Empresas del usuario: `id_empresa`, `nombre`, `industria`, `email`, `telefono`, `rol`. | Elegir el espacio de trabajo. | Se borra al cerrar sesión. | `frontend/src/stores/auth.js` (`setEmpresas`, `logout`) |
| `empresaActual` | La empresa seleccionada (mismo objeto). | Enviar `X-Company-ID` en las llamadas a la API. | Se reemplaza al cambiar de empresa y se borra al cerrar sesión. | `frontend/src/stores/auth.js` (`setEmpresaActual`, `logout`) |
| `accessContext` | Rol en la empresa, proyectos asignados y capacidades (`can_manage_users`, `can_view_inventory`…). | Mostrar u ocultar navegación. No sustituye la autorización del backend. | Se reemplaza al cambiar de empresa y se borra al cerrar sesión. | `frontend/src/stores/auth.js` (`setAccessContext`, `logout`) |
| `kontrol:storage-consent` | `{ version, preferences: true \| false, decidedAt }`: si el usuario aceptó o rechazó las preferencias, y cuándo. | Respetar la decisión y no volver a mostrar el aviso en cada carga. Se escribe solo cuando el usuario responde. | No se borra al cerrar sesión. Subir `CONSENT_VERSION` la invalida y el aviso vuelve a salir. | `frontend/src/composables/useStorageConsent.js` (`storeDecision`) |

### No imprescindibles: preferencias y comodidad

Sin ellas Kontrol funciona igual; solo olvida la preferencia al recargar. **Desde L-3 se escriben solo si `kontrol:storage-consent` dice `preferences: true`**, a través de `setPreferenceItem` en `frontend/src/composables/useStorageConsent.js`. Mientras el usuario no decide, o si rechaza, la preferencia se aplica en la pestaña pero no se guarda. Rechazar borra las que ya hubiera.

| Clave | Qué guarda | Para qué | Cuánto dura | Dónde se escribe |
| --- | --- | --- | --- | --- |
| `kontrol:locale` | `en` o `es`. | Recordar el idioma elegido (Sprint 9, bug B-01). Sin ella se usa el idioma del navegador. | No se borra al cerrar sesión. | `frontend/src/composables/useLocale.js` (`persist`): al elegir idioma y al migrar la clave antigua durante el arranque. |
| `locale_<id_usuario>` | `en` o `es`. | Esquema anterior al Sprint 9. **El código ya no la escribe**: solo la lee una vez para migrarla a `kontrol:locale`, y no la borra. | Queda en navegadores que usaron versiones anteriores. | Lectura en `frontend/src/composables/useLocale.js` (`readLegacy`) |
| `kontrol:theme` | `dark` o `light`. | Recordar el tema. Hoy ningún control de la interfaz llama a `setTheme`, así que en la práctica no se escribe. | No se borra al cerrar sesión. | `frontend/src/composables/useTheme.js` (`persist`) |
| `kontrol:font-scale` | `large`, `larger` o `largest`. El tamaño normal no se guarda: elegirlo borra la clave. | Recordar el tamaño de letra elegido en Configuración. | No se borra al cerrar sesión. | `frontend/src/composables/useFontScale.js` (`persist`) |
| `prefs_<id_usuario>` y `prefs_anon` | `{ birdieVisible }`. | Recordar si el usuario ocultó el asistente flotante (Configuración). | No se borra al cerrar sesión. | `frontend/src/stores/preferences.js` (`persist`) |
| `projects-view-mode` | `grid` o `list`. | Recordar la vista de la lista de proyectos. | No se borra al cerrar sesión. | `frontend/src/views/ProjectsView.vue` (`watch(viewMode)`) |
| `birdie-fab-position` | `{ x, y }` en píxeles. | Recordar dónde dejó el usuario el botón flotante del asistente. | No se borra al cerrar sesión. | `frontend/src/components/birdie/BirdieFloatingButton.vue` (`savePosition`) |
| `birdie-assistant-home` | `{ x, y }` en píxeles. | Recordar la posición del asistente. | No se borra al cerrar sesión. | `frontend/src/components/birdie/BirdieAssistant.vue` (`saveHomePosition`) |

Antes de L-3 todas estas claves se escribían sin preguntar. Las que ya estén en navegadores de usuarios existentes se siguen leyendo hasta que el usuario decida; si rechaza, se borran.

`frontend/tests/storageConsent.test.js` falla si un archivo de `frontend/src` distinto de `services/http.js`, `stores/auth.js`, `composables/useLegalConsent.js` o `composables/useStorageConsent.js` escribe directamente en `localStorage`, `sessionStorage`, IndexedDB o `document.cookie`. Una preferencia nueva tiene que pasar por `setPreferenceItem`, entrar en `PREFERENCE_KEYS` y añadirse a este inventario y a la política.

## El token de sesión en `localStorage` (DT-14)

El JWT vive en `localStorage`, y `localStorage` lo puede leer **cualquier script que se ejecute en el origen de Kontrol**. Si un atacante consigue inyectar JavaScript (un XSS en un campo que se renderice sin sanear, una dependencia comprometida o un script de terceros), puede leer el token y enviarlo fuera. Con él suplanta al usuario contra la API desde cualquier equipo hasta que el token caduque, a las 8 h por defecto.

Lo que agrava el riesgo hoy:

- El token no está ligado al navegador: copiado, funciona en cualquier parte.
- No hay revocación en el servidor. Cerrar sesión borra la copia local, pero un token ya robado sigue siendo válido hasta su `exp` ([inventario §8](inventario-datos.md), bloqueo O08).
- El HTML del SPA lo sirve nginx sin política de seguridad de contenido (DT-19), así que no hay CSP que frene un script inyectado. DT-08 y DT-20 documentan vías de XSS latentes.
- El token llega al navegador en la URL (`/auth/callback?token=…`) tras el inicio de sesión con Google. La vista lo reemplaza con `router.replace`, pero la URL completa pasa por el proxy y puede quedar en sus registros.

Las mitigaciones parciales (DT-14 añadió `helmet` a la API, DOMPurify sanea el Markdown) reducen la probabilidad de un XSS, pero no cambian el hecho: si hay un XSS, el token es alcanzable.

Esta tarea solo documenta el riesgo, no lo corrige. La propuesta está en [Tarea propuesta: sesión en cookie](#tarea-propuesta-sesión-en-cookie-httponly).

## Lo que queda fuera de Kontrol

Son peticiones a otros dominios. Kontrol no escribe nada en su nombre, pero el navegador sí se comunica con ellos:

| Servicio | Cuándo | Qué recibe o guarda |
| --- | --- | --- |
| Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) | En cada carga, desde `frontend/index.html`. | IP, agente de usuario y `Referer`. No se observaron cookies de esas respuestas en el código, pero su comportamiento depende de Google. |
| Icons8 (`img.icons8.com`) | Logo de Google en las pantallas de inicio de sesión y registro. | IP, agente de usuario y `Referer`. |
| Google (`accounts.google.com`) | Solo si el usuario elige iniciar sesión con Google. | Las cookies que Google gestione en su propio dominio, según la política de Google. |
| Cloudinary (`api.cloudinary.com`, `res.cloudinary.com`) | Al subir o abrir un adjunto o una evidencia. | Subida directa con una firma que emite Kontrol y descarga del archivo; IP, agente de usuario y `Referer`. El cliente propio no escribe en el almacenamiento del navegador. |

Este inventario es estático (código fuente). La comprobación en navegador real está en la [política](politica-cookies.md#cómo-se-verificó).

## Tarea propuesta: sesión en cookie `HttpOnly`

Fuera del alcance de L-3. Propuesta para crear como tarea aparte:

- **Objetivo:** sacar el JWT de `localStorage` para que un script inyectado no pueda leerlo.
- **Cambio:** el backend emite la sesión en una cookie `HttpOnly; Secure; SameSite=Lax; Path=/api`, con `Max-Age` igual a `JWT_EXPIRES_IN`. `requireAuth` y el handshake de Socket.IO la leen de la cookie. El frontend deja de guardar `token` y de enviar `Authorization`. Logout llama a un endpoint que borra la cookie.
- **Lo que arrastra:**
  - Protección CSRF: `SameSite=Lax` más comprobar `Origin` en métodos que modifican, o un token CSRF.
  - CORS con `credentials: true` y orígenes explícitos (ya existe la lista de `FRONTEND_URL`).
  - El callback de Google debe fijar la cookie en la redirección en vez de poner el token en la URL.
  - Frontend y API en dominios distintos (Vercel + backend propio) obligan a `SameSite=None` o a servir la API bajo el mismo sitio.
- **Qué no resuelve:** un XSS todavía puede hacer peticiones como el usuario mientras la página está abierta. Sigue haciendo falta la CSP de DT-19.
- **Efecto sobre esta política:** la cookie sería imprescindible y no requeriría consentimiento, pero habría que añadirla al inventario y a la política.
