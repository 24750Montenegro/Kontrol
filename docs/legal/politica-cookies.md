# Política de cookies y almacenamiento local

**Versión 1.1 · 27 de octubre de 2026 · tareas L-3 y L-6.** Se publica resumida en `/legal/cookies` (textos `legal.cookies` de `frontend/src/locales`). Sigue la misma reserva que el resto del expediente: requiere revisión profesional antes de uso comercial ([README](README.md)).

Detalle técnico de cada clave: [inventario de almacenamiento en el navegador](inventario-almacenamiento-navegador.md). Esta política y el inventario tienen que nombrar las mismas claves; si cambia uno, cambia el otro.

## En pocas palabras

- Kontrol **no usa cookies propias**. Guarda la información en el almacenamiento local del navegador (`localStorage`), que solo lee la propia aplicación desde tu equipo.
- No hay publicidad, analítica ni rastreo entre sitios.
- Hay dos tipos de datos: lo **imprescindible** para que la aplicación funcione, que no se puede desactivar, y tus **preferencias**, que solo se guardan si lo aceptas.
- La primera vez que entras, un aviso te pregunta por las preferencias. Hasta que respondes no se guarda ninguna.

## 1. Imprescindible

| Qué | Claves | Para qué |
| --- | --- | --- |
| Tu sesión | `token` | Demostrar a Kontrol que eres tú en cada acción. |
| Tu perfil y tus empresas | `user`, `empresas`, `empresaActual`, `accessContext` | Mostrar tu nombre, la empresa en la que trabajas y las secciones a las que tienes acceso. |
| Tu respuesta a este aviso | `kontrol:storage-consent` | Recordar si aceptaste o rechazaste las preferencias, y no volver a preguntarte. |

**Si no lo quieres:** no se puede rechazar y seguir usando Kontrol, porque sin estos datos no se puede iniciar sesión. Sin sesión, en la portada y en `/legal`, solo se guarda tu respuesta a este aviso, y solo si respondes.

**Cuánto dura:** al cerrar sesión se borran la sesión, el perfil y las empresas. Tu respuesta a este aviso se queda para no volver a pedírtela; se borra al borrar los datos del sitio (sección 5). Desde la versión 1.1 (L-6) tu aceptación de los Términos no se guarda en el navegador, sino en los servidores de Kontrol.

### Riesgo conocido de la sesión

Tu sesión (`token`) se guarda en `localStorage`, y **cualquier código JavaScript que llegue a ejecutarse en la página de Kontrol puede leerla**. Si alguien lograra inyectar código en la aplicación, por un fallo de seguridad o por una dependencia comprometida, podría copiar tu sesión y usarla desde otro equipo, como si fueras tú, hasta que caduque (8 horas). Cerrar sesión borra la copia de tu navegador, pero no invalida una copia que ya se haya robado.

No tenemos constancia de que haya ocurrido. Es un riesgo de cómo está construida la sesión hoy, registrado en la deuda técnica (DT-14 y DT-19), y está propuesto moverla a una cookie que el código de la página no pueda leer ([propuesta](inventario-almacenamiento-navegador.md#tarea-propuesta-sesión-en-cookie-httponly)). Mientras tanto, cierra sesión al terminar en equipos compartidos.

## 2. Preferencias (solo si las aceptas)

| Qué | Claves | Para qué |
| --- | --- | --- |
| Idioma | `kontrol:locale` (y `locale_<id>`, de versiones anteriores, que solo se lee) | Abrir Kontrol en el idioma que elegiste. |
| Tema | `kontrol:theme` | Recordar el tema visual. Hoy no hay un control para cambiarlo, así que en la práctica no se guarda. |
| Tamaño de letra | `kontrol:font-scale` | Recordar el tamaño de letra que elegiste en Configuración. |
| Asistente visible | `prefs_<id>`, `prefs_anon` | Recordar si ocultaste la burbuja del asistente en Configuración. |
| Vista de proyectos | `projects-view-mode` | Recordar si ves los proyectos en cuadrícula o en lista. |
| Posición del asistente | `birdie-fab-position`, `birdie-assistant-home` | Recordar dónde dejaste el asistente en la pantalla. |

**Si las rechazas:** Kontrol funciona igual. Tus elecciones se aplican mientras tienes la pestaña abierta y se olvidan al recargar: el idioma vuelve al de tu navegador y el asistente a su sitio. Rechazar también borra las preferencias que ya estuvieran guardadas.

**Si aún no has respondido:** igual que si las rechazaras, pero sin borrar nada. Si eliges un idioma y después aceptas, ese idioma se guarda en ese momento.

**Cuánto dura:** hasta que cambies tu decisión o borres los datos del sitio. No se borran al cerrar sesión.

## 3. Servicios de terceros

Kontrol no instala cookies de terceros, pero tu navegador se conecta a estos servicios para mostrar la interfaz o porque tú lo pides:

| Servicio | Cuándo | Qué reciben |
| --- | --- | --- |
| Google Fonts | En cada carga, para las tipografías. | Tu dirección IP y datos técnicos de la petición. |
| Icons8 | En las pantallas de inicio de sesión y registro, para el logo de Google. | Tu dirección IP y datos técnicos de la petición. |
| Google | Solo si inicias sesión con Google. | Lo que gestione Google en su propio sitio, según su política de privacidad. |
| Cloudinary | Al subir o abrir un archivo adjunto o una evidencia. | La petición del archivo. |

Estas conexiones no dependen del aviso: Kontrol no las usa para guardar nada en tu navegador. Lo que cada servicio haga en su propio dominio se rige por su política.

## 4. Cómo cambiar tu decisión

En cualquier momento, desde:

- **El pie de página:** "Preferencias de cookies" vuelve a abrir el aviso.
- **`/legal/cookies`:** debajo de esta política, con o sin sesión.
- **Configuración → Tus preferencias:** "Recordar preferencias en este navegador".

La decisión es de cada navegador. Si usas Kontrol en otro equipo o en otro navegador, te lo preguntará de nuevo.

## 5. Cómo borrarlo todo

- **Cerrar sesión** borra la sesión, el perfil y las empresas.
- **Rechazar las preferencias** borra las preferencias.
- **Borrar los datos del sitio** en el navegador lo borra todo, incluida tu respuesta a este aviso, que se te volverá a pedir:
  - Chrome y Edge: Configuración → Privacidad y seguridad → Configuración de sitios → Ver permisos y datos almacenados en sitios → buscar el dominio de Kontrol → Borrar datos.
  - Firefox: Configuración → Privacidad y seguridad → Cookies y datos del sitio → Gestionar datos → seleccionar el dominio de Kontrol → Eliminar.
  - Safari: Ajustes → Privacidad → Gestionar datos de sitios web → seleccionar el dominio de Kontrol → Eliminar.

Borrar los datos de tu navegador no borra la información de tu cuenta ni de tu empresa en los servidores de Kontrol. Para eso, ver el Aviso de Privacidad y Configuración → Tus datos y tu cuenta.

## 6. Cambios a esta política

Si añadimos una categoría nueva de almacenamiento no imprescindible, se sube `CONSENT_VERSION` en `frontend/src/composables/useStorageConsent.js` y el aviso vuelve a aparecer a todos. Una clave imprescindible nueva se añade a esta política y al inventario.

## Cómo se verificó

Criterio de aceptación de L-3: el aviso no escribe nada no imprescindible antes del consentimiento, la decisión persiste entre sesiones y se puede cambiar.

**Pruebas automáticas** (`npm test` en `frontend/`):

- `tests/storageConsent.test.js`: sin decisión no se escribe ninguna preferencia; aceptar y rechazar guardan la decisión; rechazar borra las preferencias existentes y deja intactas las imprescindibles; la decisión sobrevive a una recarga del módulo; un archivo nuevo que escriba en el navegador fuera de los permitidos rompe la prueba.
- `tests/storageConsentBanner.test.js`: el aviso aparece en la primera visita sin haber escrito nada, no aparece una vez decidido, y el pie de página lo reabre para cambiar la decisión.
- `tests/locale.test.js`, `tests/useTheme.test.js` y `tests/preferences.test.js`: sin consentimiento, idioma, tema y asistente se aplican pero no se guardan.

**En el navegador**, con las herramientas de desarrollo (Aplicación → Almacenamiento local, y Cookies):

1. Ventana privada, abrir la portada. Sin tocar nada: almacenamiento local vacío y ninguna cookie del dominio de Kontrol.
2. Cambiar el idioma a Español sin responder al aviso: el texto cambia, `kontrol:locale` no aparece.
3. Rechazar: aparece solo `kontrol:storage-consent` con `preferences: false`. Recargar: el aviso no vuelve y el idioma vuelve al del navegador.
4. Pie de página → "Preferencias de cookies" → Aceptar: `preferences: true`. Elegir Español y recargar: se mantiene y aparece `kontrol:locale`.
5. Iniciar sesión: aparecen `token`, `user`, `empresas`, `empresaActual`, `accessContext`. Aceptar los Términos no escribe nada en el navegador. Ninguna otra clave fuera de las de esta política.
6. Configuración → rechazar: desaparecen `kontrol:locale`, `prefs_<id>`, `projects-view-mode` y las posiciones del asistente; la sesión sigue activa.
7. Cerrar el navegador y volver a abrir Kontrol: la decisión se mantiene.

Registro de la ejecución en navegador: pendiente de adjuntar en el PR.
