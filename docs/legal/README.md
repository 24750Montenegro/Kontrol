# Documentación legal de Kontrol

**Corte: 16 de octubre de 2026 · referencia de código HEAD `3a004d9`.**

**CERRADA la investigación y decisión del marco legal, con reservas documentales. Los Términos y Condiciones y la Política de Privacidad son borradores internos versión 0.1: NO VIGENTES, pendientes de aprobación y publicación.** Este expediente no certifica cumplimiento integral, no verifica de forma exhaustiva la vigencia legislativa y no autoriza lanzamiento. Requiere revisión profesional en Guatemala antes de uso comercial.

## Actualización del 17 de octubre de 2026: publicación y aceptación

El equipo decidió publicar en la vista `/legal` una **versión 1.0 resumida** de los Términos y Condiciones, el Aviso de Privacidad y la política de cookies y almacenamiento. Los textos viven en `frontend/src/locales` (`legal.*`) y siguen los borradores 0.1 de esta carpeta, que se conservan como expediente interno.

| Bloqueo | Qué cambia | Qué sigue pendiente |
| --- | --- | --- |
| O01 · Contacto | Canal legal, de privacidad y reclamos: `support@kontrol.it.com`, publicado en `/legal#contact`. | El buzón debe configurarse y probarse antes de desplegar. Integrantes, NIT y domicilio siguen PENDIENTES. |
| O04 · Aceptación | Aviso bloqueante (`LegalConsentModal.vue`) la primera vez que un usuario entra con sesión: casilla con enlace a los Términos y botón Aceptar. Sin aceptar no se usa la plataforma. | **Decisión del equipo: la aceptación se guarda solo en el navegador** (versión y usuarios en `localStorage`), sin registro en el servidor. No hay prueba recuperable de quién aceptó ni cuándo; borrar los datos del navegador o cambiar de equipo vuelve a pedirla. |
| O13 · Cambios | Subir `LEGAL_VERSION` en `frontend/src/utils/legal.js` vuelve a pedir la aceptación a todos los usuarios. | Revisión profesional y resto de bloqueos de la matriz. |

## Actualización del 27 de octubre de 2026: documentos en la aplicación (L-6)

Sustituye la decisión de O04 del 17 de octubre: **la aceptación ya no se guarda en el navegador, sino en la base de datos.**

| Qué | Dónde | Límite |
| --- | --- | --- |
| Una página pública por documento, sin sesión: `/legal/terms`, `/legal/privacy`, `/legal/cookies`, `/legal/data-processing` y `/legal/ai-assistant`. `/legal` es el índice; los anclajes viejos (`/legal#terms`…) redirigen. | `LegalView.vue`, `LegalDocumentView.vue`, `router/index.js` | Los textos siguen siendo los resúmenes publicados, no los borradores completos de esta carpeta. |
| Versión, fecha de vigencia e historial de cambios visibles en cada documento. | Catálogo en `frontend/src/utils/legal.js`, espejo de `backend/src/services/legalDocuments.js` (una prueba falla si se separan). | El 1.1 de privacidad (22-10-2026) y las fechas de las versiones anteriores se reconstruyeron del historial de git: esos cambios se publicaron sin versión. |
| Constancia en `public.aceptacion_legal`: usuario, documento, versión, fecha y hora (de la base) e IP (`req.ip`), una fila por documento. | Alta: `POST /api/auth/register`, en la misma transacción que la cuenta. Reaceptación: `POST /api/legal/acceptances`. | Se aceptan Términos y Privacidad. Cookies (consentimiento aparte, L-3), adenda y aviso del asistente son informativos. La IP es un dato nuevo para este fin: se declara en Privacidad 1.2. Sin plazo de conservación definido, como el resto (O09). |
| Casilla del alta nunca premarcada; sin ella el backend rechaza el alta (400) y no crea nada. Si el formulario mostró una versión que ya no es la vigente, 409 y nada se crea. | `RegisterView.vue`, `registerSchema` | Las cuentas creadas con Google no pasan por la casilla: el aviso bloqueante les pide aceptar en su primera entrada y queda la constancia con origen `aviso`. |
| Un cambio con `substantial: true` vuelve a pedir la aceptación a quien aceptó una versión anterior. | `LegalConsentModal.vue` consulta `GET /api/legal/acceptances`. | Los Términos (§13) prometen pedir la aceptación ante cualquier cambio: un cambio menor de los Términos no la pide. Revisar esa redacción o marcar todo cambio de los Términos como sustancial. |
| Adenda de tratamiento (L-4): página con estructura completa y **marcador de pendiente**, sin texto. | `/legal/data-processing` | El borrador 0.1 no está vigente (condiciones A1–A11). Se publica cuando se apruebe, con su versión 1.0 en el catálogo. Solo existe en español: la página lo avisa en lugar de ofrecer una versión en inglés. |

## Índice y estado de los entregables

| Entregable | Documento local | Estado y límite |
| --- | --- | --- |
| Marco legal | [Marco legal de Kontrol en Guatemala](marco-legal.md) | 1.0, definitivo de investigación/decisión con reservas. Selección del estándar y límites, no habilitación operativa. |
| Términos y Condiciones | [Borrador de términos](terminos-condiciones.md) | 0.2 BORRADOR (26-10-2026: remisión a la adenda de tratamiento). Entrada en vigencia PENDIENTE DE APROBACIÓN Y PUBLICACIÓN. |
| Política de Privacidad | [Borrador de privacidad](politica-privacidad.md) | 0.1 BORRADOR. Entrada en vigencia PENDIENTE DE APROBACIÓN Y PUBLICACIÓN. |
| Anexo técnico de datos | [Inventario de datos](inventario-datos.md) | Cierre estático: nueve secciones, 38 tablas/278 columnas PostgreSQL, cuatro modelos/56 rutas de campo Mongo. No auditoría de producción. |
| Anexo de terceros | [Proveedores y destinatarios](anexo-proveedores.md) | Revisión documental, con cuentas/contratos/regiones pendientes. No todos los DPA fueron accesibles ni se verificaron las aceptaciones. 26-10-2026: se añade Vercel (hosting del frontend). |
| Licencia propia | [Decisión de licencia](licencia.md) | 17-10-2026. Software propietario, todos los derechos reservados por los integrantes del equipo (no la UVG). Pendientes: nombres de los titulares y acuerdo entre integrantes. |
| Licencias de terceros | [Auditoría](licencias/README.md) e [inventario](licencias/inventario.md) | 17-10-2026, generado con CycloneDX sobre el lockfile posterior a DT-08. Sin copyleft fuerte; atribuciones en `frontend/public/THIRD-PARTY-NOTICES.txt`. |
| Informe ejecutivo | [Resumen del expediente](../../reports/Marco%20legal%20de%20Kontrol.md) | Remite a los entregables; no duplica el marco legal ni la investigación. |
| Adenda de tratamiento de datos | [Adenda](adenda-tratamiento-datos.md) | 0.1 BORRADOR, 26-10-2026 (L-4). Incorporable por referencia a los Términos o firmable aparte. NO VIGENTE: condiciones previas A1–A11 en su nota interna N4. |
| Referencia para P-3 | [Requisitos de incidentes](referencia-p3-incidentes.md) | 26-10-2026. Insumo para P-3, que no ha empezado: requisitos, línea de tiempo, registro, contactos, plantilla de aviso y contención derivados del §8 de la adenda. |
| Cookies y almacenamiento | [Política](politica-cookies.md) e [inventario del navegador](inventario-almacenamiento-navegador.md) | 1.0, 23-10-2026 (L-3). Aviso de consentimiento implementado (`StorageConsentBanner.vue`); la decisión se guarda solo en el navegador. Registro de la verificación en navegador pendiente de adjuntar en el PR. |
| Aviso del asistente IA | [Aviso de uso del asistente](aviso-asistente-ia.md) | 1.0, 26-10-2026 (L-5). Publicado en `/legal/ai-assistant` y enlazado desde `/agent`. No entrenamiento y no conservación en el servidor de inferencia: declaración del equipo, sin auditoría independiente. |
| Aviso fiscal del POS | Aviso específico del alcance fiscal del POS | PENDIENTE como entregable separado; Términos y Condiciones describen sus limitaciones actuales. |

Fuentes de investigación: [Guatemala](../../research_notes/Marco%20legal%20de%20Kontrol/guatemala.md), [extraterritorialidad](../../research_notes/Marco%20legal%20de%20Kontrol/extraterritorialidad.md), [proveedores](../../research_notes/Marco%20legal%20de%20Kontrol/proveedores.md) y [notas técnicas](../../research_notes/Marco%20legal%20de%20Kontrol/inventario.md). El inventario cerrado prevalece sobre el avance resumido de sus notas para flujos/logs/storage. Las consultas jurídicas/contractuales citadas son las documentadas el 16-10-2026; no se amplió investigación web.

## Decisiones confirmadas y cambios de alcance

El prestador sigue siendo un equipo sin entidad jurídica constituida: integrantes, identificación/NIT, domicilio y contacto legal/privacidad **PENDIENTES**. No hay correo operativo acreditado. Kontrol es una herramienta privada de control y registro, independiente de SAT y de instituciones de reporte financiero/tributario; el POS y su IVA configurado no sustituyen declaraciones o FEL. Los textos preservan las responsabilidades propias del equipo y las del usuario, sin exoneración absoluta [Marco legal N3–N5 y N9, consultas 16-10-2026].

Frente al planteamiento original del ticket, la instrucción del usuario sustituye la pasarela prevista por **Stripe solo DEMOSTRACIÓN TEST, sin cobros reales**. Su implementación se hizo en PAY-1 (24-10-2026), con planes y precios de demostración; ver [pagos-suscripciones.md](../pagos-suscripciones.md). Los planes/precios de la demo no son una oferta comercial; no se trasladaron renovación, cancelación de cargos o reembolsos comerciales ficticios. Se preservan derechos ante un eventual cobro indebido. Un cobro futuro exige condiciones, información y aceptación previas; no conversión automática del acceso gratuito [Términos y Condiciones §§5 y 14; Marco legal N3/N5].

P1 —exportación/supresión—, P2 —respaldos/restauración— y P3 —brechas— siguen **PENDIENTES SIN FECHA** por decisión expresa del usuario, no «completados» mediante los documentos. No se inventaron plazos, responsables personales, direcciones ni un procedimiento manual operativo. Una obligación legal aplicable no se suspende por esa anotación [Marco legal, cierre; Política de Privacidad §§6 y 10].

Actualización técnica P-2 (26/10/2026, Guatemala): se completó una restauración de laboratorio con bases sintéticas PostgreSQL y MongoDB en un entorno aislado. La ejecución `kontrol-p2-20261026t230439z-6fee091f237c` terminó con `restored_verified_lab`, inventarios coincidentes y limpieza completa. La restauración tomó 1.437 s y la recuperación con validación, 23.875 s.

La [evidencia y ficha del operador](../respaldos/evidencias/README.md) sustentan este alcance. La operación de respaldos productivos y el cumplimiento de los objetivos RPO de 6 h y RTO de 4 h continúan sin acreditarse mediante este ensayo. El cierre de la tarea queda sujeto a revisión del alcance y evidencia entregados. Para L-1/L-2, utilizar el [texto técnico actualizado](../respaldos/alcance-y-textos-legales.md).

## Checklist de aceptación documental trazable

**[x] significa criterio satisfecho en los documentos; no mecanismo implementado ni permiso de publicación.** Los pendientes operativos se mantienen en la matriz siguiente.

| ID | Criterio | Estado documental y evidencia |
| --- | --- | --- |
| C01 | Marco legal guardado antes de los borradores, cierre limitado | [x] [Marco legal, encabezado/cierre](marco-legal.md); reservas y bloqueos conservados. |
| C02 | Norma/artículos/ámbito/consecuencia/fuente-fecha | [x] Marco legal N1–N9; diferencia Constitución/LAIP condicionada de base civil privada y consumo condicionado. |
| C03 | Consumo: información, copia, reclamos, reparación y límites irrenunciables | [x] Marco legal N5 y párrafo de precisión; [Términos y Condiciones §15](terminos-condiciones.md). No se presume inaplicabilidad por gratis/TEST. |
| C04 | Estado legislativo e iniciativas | PARCIAL: Marco legal I1–I5 documenta hitos y contenido recuperado; quedan pendientes la verificación exhaustiva de vigencia y la lectura íntegra de algunos proyectos. DCA 403 y textos parciales no prueban inexistencia de ley. |
| C05 | Estándar razonado, costes y origen de secciones | [x] Marco legal opciones A/B/C y matriz obligatoria/condicional/voluntaria. Opción B decidida, ejecución pendiente; sin certificación RGPD. |
| C06 | Extraterritorialidad y obligaciones contractuales | PARCIAL: Marco legal E1–E4 y anexo separan alcance legal y contratos; cuentas, acuerdos/DPA no accesibles y regiones requieren comprobación. No basta el servidor, ni un DPA es legislación. |
| C07 | Identidad auténtica, versión, vigencia y revisión profesional | PARCIAL: encabezados y §1 de Términos y Condiciones y Política de Privacidad identifican versión 0.1 BORRADOR, elaboración 16-10-2026 y revisión requerida. Identidad/contacto y fecha de vigencia siguen PENDIENTES. |
| C08 | Alcance del servicio, POS, responsabilidad y capacidad | [x] Términos y Condiciones §§2–4, 6–7, 11–15: independencia SAT; tributos del usuario; permisos/invitaciones; mantenimientos sin SLA/preaviso operativo; sin límite cero o exoneración propia. |
| C09 | Cobros reales inexistentes y Stripe solo TEST (integrado en PAY-1) | [x] Términos y Condiciones §5; Política de Privacidad §4; anexo. Datos sintéticos, no tarjetas/identidades reales; futuro cobro nunca automático. |
| C10 | IA: flujo y país con fuente/límite correctos | [x] Marco legal cierre; Términos y Condiciones §8; Política de Privacidad §§4–5: correo/contexto, historial/muestras y excepciones locales; Guatemala declarado; no conservación ni entrenamiento declarados por el equipo el 26-10-2026 y publicados en el [aviso del asistente](aviso-asistente-ia.md); copias/hosting sin verificar. |
| C11 | Licencia limitada y reparto de roles por tratamiento | [x] Términos y Condiciones §§9–10; Política de Privacidad §§1 y 3: sin venta/perpetuidad/entrenamiento en la licencia; datos ajenos requieren fundamento, BYOK no presume subencargo. Roles por tratamiento concretados en la [adenda de tratamiento](adenda-tratamiento-datos.md), borrador 0.1 no vigente. |
| C12 | Privacidad basada en inventario completo | [x] Política de Privacidad §§2–5: categorías, origen/usos y destinatarios; coordenadas solo como declaración de esquema, sin captura/carga o geolocalización automática acreditadas. |
| C13 | Retención actual y derechos sin procesos ficticios | [x] Política de Privacidad §§6–7: implementado/parcial/pendiente SIN FECHA; sin TTL/plazos definidos donde faltan; CSV/bajas/borrados parciales diferenciados de P1. |
| C14 | Seguridad, cookies y brechas con límites | [x] Política de Privacidad §§8–10: hash frente a cifrado, configuración frente a producción, hallazgos internos sin secretos, cookies no auditadas, P3 pendiente; RGPD 72 h/riesgo/rol condicionado. |
| C15 | Versiones, cambios de marco y aceptación no presumida | [x] Marco legal cierre; Términos y Condiciones §§3 y 14; Política de Privacidad §11/historial: aviso, versión y reaceptación pendientes; uso continuado no prueba incondicional. |
| C16 | Anexos, pendientes sin enlaces rotos e informe breve | [x] Índice e informe ejecutivo; entregables pendientes no se presentan como documentos terminados. |

## Matriz de bloqueos de publicación y evidencia de cierre

**Todos los renglones siguientes siguen pendientes, sin fecha comprometida.** Los responsables son perfiles sugeridos para que el equipo los designe, no personas ya asignadas. Son criterios operativos de este expediente; no una lista exhaustiva de obligaciones legales. El marco legal explica sus fuentes y condiciones.

| ID | Bloqueo / estado | Evidencia necesaria para resolverlo | Responsable sugerido |
| --- | --- | --- | --- |
| O01 | Identidad y contacto: PENDIENTE | Integrantes que contratan, facultades, identificación/NIT, domicilio; canal real de legal/privacidad/reclamos habilitado y probado; textos completos. | Coordinación del equipo y asesoría jurídica Guatemala |
| O02 | Vigencia y alcance jurídico: CON RESERVAS | Comprobar publicación oficial, reformas, entrada en vigor/transitorios; evaluar consumo/DIACO y, según hechos, LAIP/leyes extranjeras. DCA inaccesible no prueba ausencia de ley. | Asesoría jurídica Guatemala |
| O03 | Cuentas, países y contratos: PENDIENTE | Titular/contraparte, servicio/proyecto/tenant, versiones aceptadas, DPA/acuerdos aplicables, regiones de datos/copias/soporte y cadena real. Revisar términos y DPA de Cloudinary, DPA inaccesibles/no localizados, Teams, Meta y formalización Slack según anexo. | Administración de proveedores, infraestructura y asesoría |
| O04 | Prueba de aceptación y consentimiento: PARCIAL desde L-6 (constancia por usuario, versión, fecha e IP en la base; falta la revisión profesional del alcance y la conservación) | Texto íntegro recuperable, acción afirmativa, cuenta/versión/momento, integridad y prueba; separar contrato, entrega del aviso y consentimientos; probar retirada y reaceptación cuando proceda. No recoger IP/DPI por defecto sin justificación. | Producto, backend/frontend y asesoría |
| O05 | P1: PARCIAL, circuito integral PENDIENTE | Canal real; verificar identidad/facultades; acceso/corrección/exportación/supresión por PostgreSQL, Mongo, objetos, IA, logs y copias/destinatarios; excepciones justificadas y pruebas sin mezclar negocios. | Backend/datos y función de privacidad por designar |
| O06 | P2: PENDIENTE | Plan de copias con alcance, almacenamiento, acceso, retención/purga y restauración probada; relación con bajas y solicitudes. Sin RPO/RTO prometidos mientras no se definan y prueben. | Infraestructura y backend/datos |
| O07 | P3: PENDIENTE, con requisitos de partida | Responsables/contactos, detección, contención, evaluación por rol/riesgo, registro de conocimiento/decisión, preservación y comunicación; recepción de avisos de proveedores y ensayo. Requisitos R1–R12 y plazos de la adenda (aviso en 48 h) en la [referencia para P-3](referencia-p3-incidentes.md). | Seguridad, infraestructura y asesoría |
| O08 | Aislamiento y revocación: DEFECTOS DOCUMENTADOS, corrección pendiente | Corregir/verificar pertenencia de tareas/evidencias/subidas, ámbito de accesos IA, controles globales y revocación de tokens/sockets según inventario §8; pruebas por empresa/proyecto/rol y contraste del despliegue. | Backend y revisión de seguridad |
| O09 | Conservación, logs y entorno: PENDIENTE | Fines/plazos por categoría; purgas, objetos huérfanos, redacción de logs y evidencias; esquema/índices/constraints reales, separación test/producción y TLS/cifrado efectivos. | Datos, infraestructura y seguridad |
| O10 | Infraestructura IA: DECLARACIONES DE PAÍS (16-10-2026) Y DE NO CONSERVACIÓN NI ENTRENAMIENTO (26-10-2026, L-5) RECIBIDAS, verificación independiente pendiente | Conservar declaración Guatemala y verificar alcance del servidor; proveedor/contrato de hosting, operadores, accesos, retención/logs/copias; modelo/pesos/licencia y límites de uso/instrucciones. No generalizar a residencia de todos los datos. | Operación IA, infraestructura y asesoría |
| O11 | Almacenamiento del navegador y cookies: PARCIAL desde L-3 (inventario del código, política y aviso de consentimiento; falta inspeccionar tráfico y terceros en el despliegue real) | Inspeccionar cookies/tráfico/storage real y terceros; definir información, controles y consentimientos que procedan; revisar preferencias que sobreviven logout y cargas externas. | Frontend, privacidad y asesoría |
| O12 | Acuerdo de tratamiento: BORRADOR 0.1 (L-4); aviso fiscal del POS: PENDIENTE (aviso del asistente IA publicado en L-5) | Cumplir las condiciones previas A1–A11 de la [adenda](adenda-tratamiento-datos.md#n4-condiciones-previas-a-la-vigencia), confirmar sus plazos (nota N3), revisión profesional y remisión en los Términos publicados; determinar/revisar los avisos específicos sin presumirlos terminados. | Coordinación y asesoría |
| O13 | Aprobación/publicación y cambios: PENDIENTE | Revisión profesional, resolución de bloqueos, aprobación de versión y mecanismos de aviso/aceptación; publicación efectiva y fecha real entonces documentada. Lanzamiento requiere decisión posterior separada. | Coordinación del equipo y asesoría |

Una nueva norma o cambio de mercado/producto exige volver a contrastar inventario, bases, derechos, retención, contratos/DPA, transferencias, incidentes y consentimiento. Las medidas adoptadas y los compromisos publicados deberán poder ejecutarse: la redacción de una política no completa P1/P2/P3 ni corrige defectos [Marco legal, decisión y cierre].

**Resultado de esta entrega: expediente documental integrado, investigación/decisión cerradas con reservas; operación, publicación y vigencia de Términos y Condiciones y Política de Privacidad continúan pendientes.**
