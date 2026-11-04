# Política de Privacidad de Kontrol

**Versión 0.1 — BORRADOR INTERNO**  
**Fecha de elaboración: 16 de octubre de 2026**  
**Entrada en vigencia: PENDIENTE DE APROBACIÓN Y PUBLICACIÓN**

> **Revisión profesional en Guatemala requerida antes de uso comercial.** Este documento no está vigente ni listo para publicación. Integrantes prestadores, identidad y contacto legal/privacidad siguen PENDIENTES. El contacto futuro no funciona como canal de solicitudes hasta que se habilite y pruebe. Este bloqueo no elimina los derechos que legalmente correspondan.

## 1. Quién trata los datos y con qué alcance

Kontrol es una herramienta privada de registro y control para negocios. El prestador es un equipo sin entidad jurídica constituida: **nombres e identificación de integrantes, NIT correspondiente, domicilio y correo/canal legal y de privacidad PENDIENTES**. No se atribuye el servicio a una sociedad ficticia ni a una persona designada que no esté confirmada.

Para cuentas, autenticación y decisiones propias de operación/seguridad, el equipo determina fines y medios y se propone identificarlo como responsable de esos tratamientos. Cuando un negocio decide qué datos de clientes, trabajadores o proveedores registrar y Kontrol únicamente los procesa siguiendo sus instrucciones, el negocio determina esos fines y el equipo puede actuar como encargado. Deben documentarse los límites de cada función; un mismo dato no impone un único rol para toda la plataforma. La [Adenda de tratamiento de datos, §3](adenda-tratamiento-datos.md#3-roles-de-las-partes) concreta el rol por tratamiento. **Es un borrador 0.1 no vigente**; esta explicación tampoco equivale a un DPA formalizado.

Este aviso se basa en el [inventario cerrado](inventario-datos.md): 38 tablas/278 columnas PostgreSQL, cuatro modelos/56 rutas de campo Mongo y sus flujos, navegador, logs, almacenamiento y pendientes. Es revisión estática con corte 16-10-2026, referencia HEAD `3a004d9` aportada; no inspección de bases ni de producción. La descripción distingue código disponible, configuración, declaraciones del equipo y datos todavía desconocidos.

Para leerlo: **DPA** significa acuerdo de tratamiento; **hosting**, alojamiento; y **logs**, registros técnicos.

## 2. Qué información entra y de dónde procede

| Categoría | Datos y origen observados | Uso funcional |
| --- | --- | --- |
| Cuenta y acceso | Nombre, apellido, correo, teléfono cuando se aporta, identificadores, estado, roles, hash de contraseña y datos de sesión. Del usuario, administradores autorizados y sistema. | Registro, autenticación y control de acceso. |
| Acceso con Google, opcional | Identificador Google, correo, nombre y apellido desde el flujo OAuth con permisos `openid email profile`; también código/tokens de intercambio y datos técnicos del flujo. | Crear/vincular cuenta e iniciar sesión. No se observó acceso a Gmail o Drive ni columnas para conservar tokens de acceso/refresco de Google. |
| Negocio y colaboración | Nombre y contacto del negocio, industria, membresías, equipos, invitaciones, roles y permisos, autores y asignaciones. Del titular, administradores, invitados y sistema. | Organizar empresas y trabajo compartido. |
| Proveedores, proyectos e inventario | Identificación/contacto de proveedores, productos, códigos, stock, costos/precios, proyectos, tareas, presupuestos, ajustes y reportes. De formularios, importes calculados y actividad de usuarios. | Registro, consultas, alertas y reportes. |
| Ventas POS | Líneas, cantidades, precios, descuentos, base/IVA/total configurados, motivo, fechas, negocio y usuario que registra. | Registrar operaciones y calcular reportes; no sustituir documentación SAT/FEL. |
| Contenido libre, marketing y evidencias | Descripciones, notas, URLs, archivos, nombres/MIME/tamaño y metadatos. Los archivos pueden contener imagen, voz o documentos. Las columnas latitud/longitud solo están verificadas en la declaración del esquema: sin flujo de captura/carga observado ni geolocalización automática acreditada. | Tareas, adjuntos, publicaciones y consulta de contenidos. No se observa limpieza general de metadatos de archivos; la declaración de coordenadas no acredita su recogida actual. |
| Chat y llamadas | Participantes, nombres/correos duplicados, mensajes, adjuntos, lecturas y vistas previas. Al llamar: invitación, señalización, direcciones/puertos de conectividad y medios hacia contraparte/relay configurado. | Mensajería y llamadas. No se observa grabación de llamadas en el backend; esto no certifica ausencia de metadatos o copias externas. |
| Asistente IA | Preguntas, respuestas, historial, IDs de usuario/empresa y trazas SQL con conteos, errores y razonamientos. Del usuario, servicio y resultados consultados. | Responder consultas y conservar historial cuando Mongo está disponible; detalle en §5. |
| Integraciones y diagnóstico | Claves/bots/webhooks y destinatarios configurados, eventos, resultado/error de envíos, actividad técnica, IP y URLs/errores potencialmente identificables en registros. | Conectar servicios, limitar solicitudes, diagnosticar y operar; detalle en §§4, 7 y 9. |
| Navegador y archivos locales | Sesión, perfil, empresas, permisos, preferencias, borradores y descargas/impresiones. De API, elecciones de interfaz y dispositivo. | Mantener sesión, presentación y trabajo local; detalle en §8. |

Un nombre de cliente en una nota o un documento de empleado en un adjunto puede ser dato personal aunque no exista una tabla específica de clientes o nómina. Quien lo carga debe tener autorización o fundamento de licitud y facilitar la información exigible. **Subir información ajena no demuestra consentimiento de esas personas.** No se debe usar el formulario libre como depósito de datos sensibles, tarjetas o documentos innecesarios. Referencia de campos/origen: inventario §§1–5.

## 3. Por qué se utilizarían los datos y qué justificación falta

Esta tabla expresa el criterio contractual y el estándar de privacidad elegidos para el borrador. No importa automáticamente las bases del art. 6 RGPD como ley general guatemalteca. Las obligaciones nacionales y extranjeras se determinan por ámbito y tratamiento, según [el marco legal, N1–N6 y E1–E4](marco-legal.md), fuentes consultadas 16-10-2026.

| Finalidad | Justificación propuesta y límite |
| --- | --- |
| Cuenta, permisos y funciones solicitadas | Necesidad para ejecutar la relación de servicio válidamente acordada e instrucciones autorizadas. No es permiso para todo uso comercial posterior. La prueba de aceptación sigue pendiente. |
| Datos del negocio y de terceros | Instrucciones documentadas del negocio y fundamento que le corresponda respecto de cada titular. La [adenda de tratamiento](adenda-tratamiento-datos.md), §§4–5 y 12, precisa responsabilidades; aceptar términos no sana una recogida ilícita. |
| OAuth, IA, llamadas y conexiones opcionales | Acción informada para la función elegida; consentimiento específico si es la base exigible para el tratamiento concreto. Activar una función no constituye consentimiento genérico a nuevas finalidades ni de todos los terceros mencionados. |
| Seguridad y diagnóstico | Operación y diligencia de protección conforme al marco aplicable; minimizar datos/accesos y definir conservación. La existencia de logs no justifica guardar todo sin límite. |
| Cumplimiento de una obligación o requerimiento | Identificar disposición o requerimiento concreto, autoridad, alcance y datos necesarios. No se invoca una obligación genérica para conservar indefinidamente. |

Si se elige consentimiento para un uso concreto, debe explicarse finalidad y retirada, con prueba suficiente; ese proceso no está acreditado de forma integral. La recepción de este aviso se distingue de aceptación contractual y consentimientos opcionales. Si el RGPD resultara aplicable, correspondería evaluar sus propias bases, requisitos y condiciones, no sustituirlos por esta tabla ([RGPD arts. 6–7](https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807), consulta documentada 16-10-2026).

## 4. Quién puede recibir información y dónde

Los miembros autorizados y destinatarios elegidos reciben lo compartido para sus funciones. Un enlace de invitación puede mostrar datos del negocio/proyecto a quien lo posea. Los permisos y límites de acceso se explican en §9 y en el inventario §8; no hay una garantía general de aislamiento acreditada.

En la tabla, **integrado** significa camino invocable en código, no uso confirmado en producción; **opcional** requiere acción/configuración; **previsto** no está integrado observado. La lista completa contractual, sus URLs, cláusulas, fechas y límites está en el [anexo de proveedores y destinatarios](anexo-proveedores.md), consultas 16-10-2026. Un DPA público no demuestra aceptación por una cuenta real.

| Proveedor o destinatario / estado | Qué puede recibir | Contrato, DPA y país: estado comprobado |
| --- | --- | --- |
| PostgreSQL / Supabase referenciado | Campos de negocio/cuenta del inventario y consultas. | Backend configurable; uso real de Supabase, titular y región por confirmar. TOS/DPA públicos revisados; aceptación no acreditada. |
| GCP, despliegue descrito | Aplicación, peticiones, memoria, archivos/logs si se utiliza la VM descrita. | TOS/CDPA revisados; proyecto, contratación, despliegue y regiones reales desconocidos. |
| MongoDB / Atlas condicional | Conversaciones, mensajes, participantes e historial/trazas IA. | Código confirma Mongo, no Atlas. Contratos Atlas revisados condicionalmente; cuenta, nube y región desconocidas. |
| Cloudinary, adjuntos/evidencias integrados | Archivo completo, nombre original, tamaño, tipo, claves/URLs. La descripción y los IDs de tarea o usuario se quedan en Kontrol. | Titular/región por confirmar. DPA público accesible no verificado; restricción TOS §5 para servicios a terceros requiere resolver permiso/acuerdo. |
| Google OAuth, opcional | Solicitud de autenticación y datos técnicos; intercambio de código y credenciales de aplicación. | Términos API/OAuth; no asignar automáticamente CDPA GCP. Cuenta y versión/país de tratamiento por confirmar. |
| Slack, opcional BYOK | Texto de alerta a workspace/canal. | Contrato/DPA revisado; formalización y versión real pendientes. Región desconocida. |
| Microsoft Teams, opcional BYOK | Título/texto o tarjeta de alerta al destino configurado. | Catálogo DPA accesible; cuerpo completo no recuperado. Acuerdo, componentes del tenant y región pendientes. |
| Telegram, opcional BYOK | Texto, chat de destino, datos técnicos del bot/envío. | Términos de bots revisados; DPA público accesible no verificado. País real desconocido. |
| Twilio SMS, opcional BYOK | Teléfonos, texto de alerta y datos de entrega. | TOS/DPA/política de mensajería revisados; titular, aceptación y rutas/países pendientes. |
| Twilio SendGrid, opcional BYOK | Correos, nombre del remitente, asunto y contenido de alerta. | TOS/DPA/política de correo revisados; cuenta, aceptación y región pendientes. Retención distinta de SMS. |
| Webhook genérico, opcional BYOK | Evento, fecha, título/texto, IDs, stock o importes de presupuesto según evento. | Operador, contrato/DPA, países y posteriores reenvíos desconocidos; puede ser servidor del negocio. |
| WhatsApp/Meta, preparado, no enlazado observado | Si se conectara: números, texto/plantilla y respuesta de entrega. | No flujo activo confirmado. Términos WhatsApp revisados; términos Meta completos inaccesibles. Cuenta/país pendientes. |
| Google Fonts, carga externa | IP y solicitud técnica de fuentes desde el navegador. | No DPA específico acreditado para esta carga; región y retención desconocidas. |
| Icons8, icono externo | IP y metadatos de la solicitud del recurso. | Licencia/privacidad revisadas; contrato concreto y región desconocidos. No recibe el formulario por el mero icono observado. |
| STUN Google predeterminado; ICE alternativo configurable | IP/puerto y conectividad. Un TURN configurado podría retransmitir medios. | STUN no prueba recepción de audio/vídeo como relay. Términos específicos, TURN efectivo, región y retención no acreditados. |
| Hosts de URLs aportadas por usuarios y participantes | Solicitudes de imágenes/archivos/enlaces y lo compartido; medios al interlocutor o relay. | Destino según URL/configuración; país, condiciones y copias por confirmar. |
| ClawStitch / Qwen / vLLM, infraestructura del equipo | Contexto, preguntas/historial y resultados resumidos de §5. | Servidor en **Guatemala, declarado por el equipo el 16-10-2026, sin verificación independiente**. Proveedor de hosting, operadores, accesos, logs, retención/copias pendientes; no se trata como tercero solo por el nombre del endpoint. |
| Stripe, solo DEMOSTRACIÓN TEST (PAY-1) | Kontrol envía únicamente el ID interno de la empresa (metadata `id_empresa`) y una descripción genérica; no envía nombre, correo ni teléfono. Lo que se escribe en la página hospedada de Stripe (correo, tarjeta de prueba) lo recibe Stripe directamente, no Kontrol. Kontrol guarda identificadores de cliente y suscripción, plan, estado y fin del período (`empresa_suscripcion`) y el ID de cada evento procesado (`evento_pago_procesado`). | Solo claves de prueba; sin cobros reales. Cuenta, entidad/país, elegibilidad y aceptación SSA/DPA pendientes. No enviar identidades/tarjetas reales a la demo: usar tarjetas de prueba y datos sintéticos. |

BYOK significa que el negocio aporta su clave, bot o webhook. Si es titular de la cuenta, el proveedor es suyo y Kontrol opera la conexión según instrucciones; no es automáticamente un subencargado contratado por el equipo. Si la cuenta es del equipo, debe evaluarse y documentarse la cadena de encargo/subencargo.

Las alertas observadas contienen producto/proyecto, stock o nivel de uso de presupuesto; el webhook puede incluir IDs e importes. Probar Slack, Teams, Telegram, SMS o webhook puede enviar mensajes reales al destino configurado. La prueba SendGrid observada consulta la cuenta; el envío de correo es otra función. No se observó envío general automático de toda la base a esos canales.

**Ubicación confirmada como configuración no significa ubicación física verificada.** El repositorio muestra conexiones PostgreSQL/Mongo, una VM GCP descrita y servicios externos; no prueba sus regiones reales. La declaración sobre el servidor IA no prueba que soporte, tránsito, logs, copias o todos los datos permanezcan en Guatemala. Domicilio del proveedor, dominio o un DPA que contemple EE. UU. no acreditan almacenamiento allí. La evaluación jurídica de transferencias y de alcance extranjero depende de los hechos, roles y contratos, no solo de dónde esté un servidor [Marco legal, E1–E4, consulta 16-10-2026].

## 5. Qué información llega al asistente IA

El endpoint es configurable; el valor predeterminado apunta a ClawStitch y la etiqueta de modelo a `Qwen/Qwen3.6-27B-FP8`. Qwen/vLLM y la operación por el equipo proceden del contexto confirmado; la etiqueta no prueba pesos, licencia o configuración cargados. Usar un formato de API compatible con OpenAI no acredita intervención de OpenAI.

Cuando se invoca el modelo, el backend construye un contexto con descripción del producto/esquema y reglas; `id_usuario`, correo y rol del sistema; `id_empresa`, nombre y rol en la empresa; proyectos visibles y de inventario y capacidades de acceso. Incluye hasta diez mensajes recientes, con contenido del usuario limitado a 3,000 caracteres en ese historial. El asistente no recibe necesariamente solo lo escrito en la última pregunta: **el correo forma parte explícita del contexto**.

El ciclo de consultas puede enviar columnas, conteo, hasta veinte filas de muestra y señal de truncamiento, o un error. Sus valores dependen de la consulta a los conjuntos de datos disponibles: pueden incluir datos comerciales, contactos de proveedor, autores o URLs de adjuntos. Las trazas locales almacenan contenido y consultas/conteos/errores/razonamientos en Mongo cuando hay conexión. Las respuestas de saludo/ayuda y ciertas consultas predefinidas pueden resolverse localmente sin llamar al modelo.

Los límites de diez mensajes o veinte filas son límites de envío, **no plazos de conservación**. Una pregunta puede guardarse antes de inferir; cancelar no asegura que se borre ni que el endpoint retire lo recibido. La inferencia puede funcionar sin historial Mongo si esa conexión no está disponible. La generación de marketing revisada usa reglas locales; no se observó allí llamada a un LLM o publicación automática a redes.

El servidor IA está en Guatemala por declaración del equipo, sin verificación independiente. **Actualización 26-10-2026 (L-5):** el equipo declara que el servidor de inferencia no registra las peticiones ni las usa para entrenar; el [aviso del asistente](aviso-asistente-ia.md) lo publica así. Siguen sin verificación independiente hosting, operadores/accesos y copias del endpoint. La licencia limitada de los Términos y Condiciones no concede autorización de entrenamiento, pero no prueba la práctica o los acuerdos de toda la infraestructura. Resolver estas condiciones es requisito del expediente antes de ofrecer garantías al público.

Fuentes exactas: [configuración y límites](../../backend/src/services/aiAgentService.js#L12), [petición](../../backend/src/services/aiAgentService.js#L818), [contexto](../../backend/src/services/agentContext.js#L185), [historial y muestras](../../backend/src/services/aiAgentService.js#L903), [herramientas](../../backend/src/services/aiAgentService.js#L1050), [persistencia](../../backend/src/controllers/agentController.js#L76) e inventario §5. No se auditó tráfico real ni el servidor de inferencia.

## 6. Derechos: ley aplicable y estándar elegido

La Constitución art. 31 se refiere a archivos estatales; LAIP y sus procedimientos requieren ser sujeto obligado. No se presentan sus derechos/plazos como un catálogo automáticamente exigible a toda base privada. Si se activa una ley extranjera u otro supuesto nacional, los derechos y condiciones legales correspondientes se conservan [Marco legal, N1–N2, E1–E4; fuentes consultadas 16-10-2026].

Kontrol elige avanzar hacia acceso, corrección, reducción de datos y supresión/exportación verificables como estándar voluntario. **P-1 habilita una exportación empresarial y la baja de acceso de la cuenta; el borrado de los registros del negocio solo ocurre al cerrar la empresa, y no alcanza las copias de proveedores ni los datos ya enviados a integraciones.** El mecanismo no sustituye un contacto operativo de privacidad ni reduce derechos legales u obligaciones existentes.

| Solicitud o mecanismo | Fundamento y alcance | Mecanismo observado / estado SIN FECHA |
| --- | --- | --- |
| Conocer y acceder a información propia | Estándar voluntario; derecho legal con el alcance del régimen aplicable. | PARCIAL: vistas de cuenta, negocio e historiales según permisos. PENDIENTE: solicitud por titular, identificación y respuesta completa. |
| Corregir o actualizar | Estándar voluntario y obligaciones de exactitud que correspondan. | PARCIAL: edición de determinados registros autorizados. PENDIENTE: circuito coordinado entre bases, copias y terceros. |
| Obtener copia/exportación | Estándar voluntario; portabilidad legal solo si se cumplen sus condiciones. | IMPLEMENTADO P1 (22-10-2026): endpoint autenticado de descarga JSON; solo owner/admin de la empresa activa. Exporta perfil del solicitante, empresa y filas PostgreSQL vinculadas por `id_empresa` o claves foráneas, conversaciones IA de esa empresa y metadatos mínimos de chats humanos donde participa el solicitante, junto con sus propios mensajes. No incluye mensajes ni datos de perfil de otros participantes. Credenciales, tokens y hashes se excluyen. Es una respuesta en streaming; no se crea un enlace ni archivo alojado que caduque. Los chats humanos no tienen `id_empresa`, por lo que no se pueden atribuir a la empresa conversaciones de otros miembros. |
| Suprimir | Estándar voluntario y derechos legales sujetos a excepciones/retenciones justificadas. | IMPLEMENTADO PARCIALMENTE P1 (22-10-2026): baja inmediata autenticada con contraseña o reautenticación Google; invalida sesiones, elimina credenciales/contacto y membresías, y registra en la misma transacción PostgreSQL una tarea durable para limpiar conversaciones IA y mensajes humanos del titular en MongoDB después del `COMMIT`. El proceso reintenta fallos con espera exponencial (intervalo máximo de 24 horas); la respuesta distingue limpieza completada de `pending_retry`, pero no existe un plazo garantizado si MongoDB permanece indisponible. Se conserva una fila técnica anonimizada por las claves foráneas y se mantienen registros empresariales compartidos y bitácoras/logs que pueden identificar. Si hay sucesor activo, se transfiere el rol owner; sin sucesor se programa el cierre de la empresa. La baja de cuenta no borra archivos empresariales ni copias en proveedores: no existe flujo de borrado por cuenta que se propague a ellos. Mientras la empresa siga en uso, los plazos de retención de esos datos siguen SIN DEFINIR. IMPLEMENTADO P1 (26-10-2026), cierre de empresa: el owner lo solicita con reautenticación y el nombre de la empresa; hay 30 días para exportar (o ninguno, si lo pide) y se puede anular en ese plazo. Después se eliminan las filas de la empresa, sus archivos de evidencia y el historial del asistente, a más tardar a los 60 días de la solicitud, y queda una constancia. No se eliminan cuentas de miembros, chats humanos ni lo ya enviado a integraciones. El plazo de 90 días para respaldos y registros técnicos está comprometido en la adenda de tratamiento de datos (L-4) y depende de P-2. |
| Retirar consentimiento; oponerse o limitar, cuando corresponda | Depende de base y ley; no toda instrucción o relación contractual es consentimiento. | PENDIENTE: constancia de consentimiento/retirada y tramitación específica. Desconectar integración no retira mensajes ya recibidos ni elimina logs. |
| Pedir atención o presentar reclamo | Derechos según régimen; canal propio debe existir para poder anunciarse. | PENDIENTE: identidad/contacto real, recepción, verificación y registro de respuesta. No hay buzón ni procedimiento manual acreditado. |

El contacto futuro solo podrá anunciarse después de habilitarlo y probarlo. Hoy no se instruye a enviar solicitudes a un correo inventado. Si resulta aplicable RGPD, su plazo general es un mes, con ampliación motivada de hasta dos meses en las condiciones del art. 12.3; acceso, supresión y portabilidad tienen sus reglas y excepciones. Esta referencia condicional no promete ese procedimiento como operativo para todos ([EDPB, derechos, arts. 12 y 15–20](https://www.edpb.europa.eu/sme/be-compliant/respect-individuals-rights_en), consulta 16-10-2026). La ausencia de mecanismo es un bloqueo de publicación, no una dispensa de derechos.

## 7. Cuánto se conserva hoy y qué falta decidir

**No está definida una política integral de plazos por categoría.** «Sin TTL observado» significa que el código no programa caducidad, no que deba conservarse para siempre o que se haya probado conservación eterna. El estado actual exige decidir fines, obligaciones concretas, plazos, purgas y tratamiento de copias; no se presenta como conservación indefinida justificada.

| Soporte o categoría | Conservación ACTUAL observada | Deuda y límite |
| --- | --- | --- |
| Cuenta, empresa, equipo, ventas y demás PostgreSQL | Persistencia sin TTL/job general de purga observado. P-1 desactiva la cuenta, reemplaza nombre/apellido/correo/teléfono, elimina hash y Google ID, y retira membresías; la fila con identificador técnico permanece para no romper autoría/FK. Se conservan ventas, gastos, autoría seudonimizada y demás registros compartidos de negocio. | Plazo por categoría NO DEFINIDO mientras la empresa siga en uso. El borrado de cuenta no borra el negocio ni sus archivos; el cierre de empresa sí los borra, a más tardar a los 60 días de solicitarlo. La retención y purga de empresas en uso requieren decisión L-2/L-7 y revisión legal. |
| Invitaciones, membresías y permisos | Desactivación o reemplazo según función; fechas conservadas; sin expiración/purga automática general observada. | Definir caducidad, revisión y eliminación; quitar acceso no borra autoría o copias. |
| Chat humano, participantes, adjuntos referenciados y lecturas Mongo | Sin TTL observado. P-1 elimina mensajes enviados por el titular y lo retira de participantes/lecturas mediante una tarea Mongo posterior al `COMMIT`, con reintentos durables; el historial de otros participantes puede conservarse. | Plazo NO DEFINIDO; el reintento no garantiza un plazo de purga mientras MongoDB esté indisponible. No elimina copias externas ni adjuntos empresariales. |
| Historial IA Mongo | Sin TTL; P-1 agenda el borrado de conversaciones y mensajes del titular tras el `COMMIT`, con reintentos durables. | No elimina logs/copias del endpoint. La limpieza puede quedar pendiente mientras MongoDB esté indisponible; retención de inferencia NO CONFIRMADA. |
| Archivos en Cloudinary y referencias | Persistencia remota sin plazo de cuenta comprobado. Al borrar evidencia se intenta eliminar el objeto después de su fila. Al cerrar la empresa se eliminan sus archivos de evidencia después de la ventana de exportación; si Cloudinary falla, el borrado se reintenta sin dar el cierre por terminado. | Fallo remoto puede no impedir respuesta de éxito; adjuntos abandonados/copias requieren conciliación. |
| Configuración y logs de integraciones | Desconectar elimina configuración; logs y mensajes enviados no desaparecen por esa acción. Logs SQL sin TTL observado. | Plazos NO DEFINIDOS; destinatarios y proveedores tienen conservación propia por verificar. |
| Logs backend, OAuth, errores IA, SDK, proxies, contenedores y consola | Sin política integral propia de rotación/purga observada; driver/host/configuración efectiva desconocidos. | No equivalen a «hasta el próximo deploy». Algunos errores/URLs pueden reproducir identificadores o contenido. |
| Sesión y preferencias en navegador | localStorage sin TTL de almacenamiento; logout borra claves de sesión, no todas las preferencias. | Caducidad del JWT no borra su texto. Eliminación local no retira copias del servidor. |
| Caché de presupuesto y límites de solicitudes | Caché en memoria: TTL lógico 30 segundos, máximo 500 entradas; contadores con ventanas configurables. | No borrado físico puntual garantizado; son límites técnicos, no retención de PostgreSQL/Mongo. |
| Descargas, impresiones, evidencias/capturas y resultados de pruebas | Archivos sin TTL general observado; copias locales/repositorio según soporte. | No retirada remota acreditada; no se certificó anonimización de todas las evidencias. |
| Determinados artefactos CI/k6/coverage | Workflows declaran 30 días para esos artefactos. | No extender esa cifra a logs de jobs, repositorio o archivos descargados. Retención efectiva no comprobada. |
| Volúmenes, respaldos del host/proveedores y copias de destinatarios | Volúmenes persistentes; cobertura, retención y purga de respaldos no acreditadas. | P2 pendiente; retención de copias DESCONOCIDA. No promesa de recuperación ni borrado total en treinta días. |

Fuentes: inventario §§1, 4, 6–7 y 9. Los plazos contractuales de cierre de cada proveedor se documentan separadamente en el anexo; no son plazos generales de Kontrol ni sustituyen una política propia. Los permisos de conservación legal deben concretarse; este borrador no inventa un plazo fiscal uniforme.

## 8. Cookies, localStorage, cámara y archivos del dispositivo

El código guarda en localStorage `token`, `user`, `empresas`, `empresaActual` y `accessContext`; logout elimina esas claves. Guarda también preferencias del ayudante, idioma/tema, vista de proyectos y posiciones del asistente que no se eliminan necesariamente al cerrar sesión. Borradores, carrito y partes del chat viven además en memoria; puede existir copia persistida en las bases. Referencia: [inventario, §6](inventario-datos.md).

No se encontró escritura explícita de cookies propias ni sessionStorage en el código revisado. Esto **no demuestra ausencia de cookies** de OAuth Google, Cloudinary, CDN, proxies o componentes externos. CORS/Socket.IO admiten credenciales; no hubo auditoría de `Set-Cookie`, tráfico o almacenamiento real. Tampoco se certifica ausencia de todo seguimiento por terceros a partir de no observar analítica propia en los puntos de entrada.

El documento de cookies y almacenamiento sigue pendiente de revisión y decisión técnica; no hay un banner o mecanismo de consentimiento acreditado que este texto pueda dar por operativo. La carga externa de fuentes e iconos ya puede producir solicitudes técnicas.

El escáner usa cámara y reconocimiento local de código en el componente revisado; no se observó envío de fotogramas a un servicio externo de reconocimiento. Las llamadas pueden usar cámara/micrófono y WebRTC hacia la contraparte o relay. Los permisos del navegador no equivalen a consentir todos los usos posteriores. Descargar, imprimir o borrar archivos en tu equipo no elimina automáticamente copias de Kontrol o terceros.

## 9. Seguridad y limitaciones comprobadas

El código usa bcrypt para contraseñas: es **hash, no cifrado reversible**. Cifra con AES-256-GCM el JSON de credenciales de integraciones; no todos los campos de configuración, logs o contenidos. JWT está firmado, no cifrado, y localStorage no tiene cifrado aplicativo observado. No se observó cifrado de extremo a extremo del chat humano.

Hay verificaciones JWT, controles por empresa/rol en distintas rutas, validaciones y limitadores. Existen también limitaciones identificadas de autorización, separación de espacios y revocación que requieren corrección y prueba. La selección de empresa o un permiso en la interfaz no permite afirmar aislamiento completo. El detalle interno está en el [inventario, §8](inventario-datos.md); documentarlo no exonera al prestador ni sustituye la corrección.

La conexión PostgreSQL ofrece TLS condicional a su configuración; la configuración declarada de proxy/HTTPS no acredita certificados, tránsito completo o cifrado de discos de producción. No se inspeccionaron hosts, contratos de copias o todas las configuraciones de los proveedores. Tampoco se certificó separación efectiva de Mongo test/producción. No se publican secretos ni se afirma que una exposición concreta haya ocurrido.

Fuentes de medidas: [autenticación](../../backend/src/controllers/authController.js#L16), [credenciales](../../backend/src/services/integrationService.js#L1), [pool/TLS](../../backend/src/db/poolConfig.js#L36) e inventario §§1, 5, 7–9. Estas son constataciones estáticas, no auditoría o certificación de seguridad.

## 10. Incidentes y comunicaciones

P3 —detección, evaluación, responsables, conservación de evidencia y comunicaciones de brechas— está pendiente, sin canal operativo ni plazo voluntario comprometido. Los logs y las alertas de stock/presupuesto no constituyen ese procedimiento. P2 —respaldos/restauración— tampoco está acreditado por disponer de volúmenes o por un contrato público del proveedor.

Si se activa RGPD, el responsable notifica a la autoridad sin dilación indebida y, de ser posible, dentro de 72 horas desde tener conocimiento, salvo que sea improbable el riesgo para derechos y libertades; documenta las violaciones y justifica demora. Comunica a titulares sin dilación indebida ante alto riesgo, con las excepciones legales. El encargado informa al responsable sin dilación indebida: no dispone de una franquicia universal de 72 horas. Fuentes: [RGPD arts. 33–34](https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807), [EDPB, brechas](https://www.edpb.europa.eu/sme/assess-the-risks/data-breaches_en), consulta documentada 16-10-2026.

No se traslada ese plazo como promesa universal guatemalteca ni se certifica ausencia de deberes locales/contractuales. La obligación concreta depende de ley, rol, riesgo y contrato. Que P3 siga pendiente no suspende un deber legal existente [Marco legal, N1–N5, E1–E4 y anexo, consulta 16-10-2026].

## 11. Cambios, compromisos y aprobación pendiente

Este borrador no autoriza vender información ni concede una licencia general de entrenamiento. No afirma, sin evidencia, que ningún proveedor guarde o reutilice datos. Las instrucciones, finalidades permitidas y condiciones de infraestructura deben resolverse y verificarse antes de asumir compromisos públicos adicionales. La licencia propuesta al equipo se limita a operar y transmitir según las instrucciones del servicio, conforme a [los Términos y Condiciones, §9](terminos-condiciones.md#9-software-contenidos-y-licencia-limitada).

Los cambios de finalidades, destinatarios, derechos o condiciones deberán reflejarse en una versión identificada y comunicarse antes de aplicar lo que exija información o nueva aceptación/consentimiento. Ese mecanismo sigue pendiente; el uso continuado no demuestra aceptación incondicional. Si cambia el marco normativo, deberán revisarse bases, inventario, roles, derechos, conservación, contratos/DPA, transferencias, incidentes y consentimientos según [el marco legal](marco-legal.md), sin tratar proyectos como leyes vigentes.

La identificación/contacto, contratos y ubicaciones por confirmar, P1/P2/P3, prueba de aceptación/consentimiento y correcciones de seguridad siguen en el [índice de bloqueos](README.md). La [adenda de tratamiento de datos](adenda-tratamiento-datos.md) está redactada como borrador 0.1 no vigente; las políticas específicas de cookies y los avisos complementarios están pendientes, sin enlaces a documentos inexistentes. El cierre de investigación no aprueba esta política ni autoriza lanzamiento.

| Historial | Cambio |
| --- | --- |
| 16-10-2026 · 0.1 | Redacción inicial interna con inventario cerrado y servidor IA en Guatemala por declaración del equipo; sin verificación independiente, aprobación, publicación o vigencia. |


### Nota técnica P1: atomicidad de la limpieza Mongo

La implementación actual agrupa la limpieza de MongoDB en una transacción y
conserva `account_privacy_states`: un registro técnico con identificador numérico,
marca de eliminación y contador de revisión, sin nombre, correo ni contenido.
Las escrituras de chat humano y de IA usan ese mismo registro dentro de sus
transacciones para impedir que una petición en curso vuelva a crear información
después de completar la limpieza. Este registro no se purga automáticamente.
La baja de PostgreSQL y el trabajo del outbox siguen siendo una transacción
separada: un fallo de Mongo deja la limpieza pendiente de reintento, sin reactivar
la cuenta. Esto no modifica las retenciones empresariales ni elimina copias en
proveedores. La validación operativa se documenta en `PRIVACY_VALIDATION.md`.
