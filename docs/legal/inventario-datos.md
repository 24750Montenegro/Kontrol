# Inventario verificable de datos de Kontrol

Fecha de consulta y corte: **2026-10-16, Guatemala (America/Guatemala)**. Estado: inventario técnico estático para preparar el expediente legal; no certifica cumplimiento ni describe una inspección de producción.

## 1. Alcance, evidencia y lectura

Para el microempresario: Kontrol guarda datos de las personas que usan la herramienta, de proveedores y de la actividad del negocio. Un nombre de cliente escrito en una nota, una fotografía, un audio o un documento también entra en el inventario. Desactivar una cuenta no borra todo su historial; descargar un reporte tampoco exporta toda su información.

Se contrastaron `backend/kontrol.sql`, el bootstrap ejecutado desde el arranque, las declaraciones DDL del código y de los scripts de pruebas, los cuatro modelos Mongo, rutas/controladores, servicios de salida, frontend, configuración de proxy/contenedores y generadores de evidencias. **No hubo conexión a PostgreSQL/Mongo, lectura de filas reales, inspección del host, prueba de proveedores ni explotación de producción.** No se ejecutó bootstrap, seed, reset ni despliegue. No se modifican la aplicación ni git. No se encontraron instrucciones AGENTS.md aplicables en los ascendientes ni en el árbol propio revisado. [Arranque](../../backend/src/index.js#L63), [montaje de rutas](../../backend/src/router.js#L1).

**Código observado** significa una función o configuración verificable en estos archivos. **Entorno no comprobado** significa que no se conoce si está desplegada, habilitada o configurada igual. Un destino en el código no acredita una transferencia efectivamente realizada. **El país del servidor IA ClawStitch es Guatemala según declaración directa del equipo del 2026-10-16; su infraestructura no se verificó.** Los países de los demás destinos y las ubicaciones de tránsito, soporte y copias, incluidas las de IA, siguen **desconocidos**: no se deducen de una IP, dominio, marca o nombre del script. Fuente del país IA: [declaración del equipo](#declaración-directa-del-equipo-sobre-ia). Fuentes de configuración, que no verifican esa ubicación: [Compose declarado](../../docker-compose.prod.yml#L1), [configuración de conexiones](../../backend/src/db/poolConfig.js#L76).

El prestador es el equipo, sin entidad legal constituida; identificación y contacto siguen pendientes. La herramienta es privada e independiente de SAT; el POS registra operaciones. **Stripe está integrado exclusivamente como demostración TEST (PAY-1, 24-10-2026), sin cobros reales; los planes/precios de la aplicación son de demostración.** ClawStitch/Qwen/vLLM pertenece al contexto confirmado del equipo; el código muestra el endpoint configurable, pero no prueba la configuración interna de inferencia. P-1 está implementado parcialmente (22-10-2026); P-2 y P-3 siguen pendientes sin fecha. Estas son decisiones del encargo y del [expediente](README.md), no resultados de una prueba del entorno.

### Declaración directa del equipo sobre IA

El 2026-10-16 el usuario confirmó directamente en esta conversación: **“ClawStitch servidor IA está en GUATEMALA”**. Se registra **Guatemala como país declarado por el equipo para el servidor IA**, sin verificación independiente de infraestructura. El proveedor de hosting no está identificado; identificación de prestadores y contacto siguen pendientes. La declaración no confirma ubicación de copias, tránsito, soporte, subproveedores, medidas de seguridad ni retención. Fuente primaria: mensaje directo del usuario/equipo del 2026-10-16, sin URL pública; no es una afirmación normativa.

No se formulan aquí afirmaciones normativas ni sobre aplicación del GDPR. No fue necesaria investigación web para este inventario de código; contratos, verificación de ubicaciones y políticas de proveedores pertenecen a la investigación paralela. Si se incorpora después una afirmación normativa, deberá llevar URL oficial directa, artículo/cláusula y fecha de consulta; este documento no sustituye esa verificación.

### Clasificación de cada campo

| Código | Qué significa |
| --- | --- |
| D | Identificación/contacto de una persona; un correo o teléfono comercial también puede ser personal. |
| I | Identificador, relación, permiso, autoría o actividad atribuible a una cuenta/persona. |
| C | Dato comercial enlazable al negocio, proyecto, proveedor, cajero o equipo; no se presume anónimo. |
| L | Texto, URL o JSON abierto: puede incorporar nombres, contactos, documentos, secretos u otra información personal por decisión del usuario. |
| S | Credencial, verificador o elemento de autenticación/autorización; requiere especial reserva técnica. |
| G | Localización declarada en el esquema. |
| NP | Catálogo técnico global: valor aislado sin información de una persona. Su asignación sí se inventaría como I. |

Se enumeran **también los campos comerciales y los catálogos NP** para que ninguna columna quede fuera del contraste. NP solo excluye el contenido técnico estándar de los catálogos de la categoría de dato personal; no excluye las relaciones de permisos ni textos que un operador introdujera fuera de ese uso. Los importes y métricas agregadas no identifican por sí solos al comprador, pero siguen siendo C por su enlace a la actividad del negocio. No se observan tablas estructuradas de clientes, empleados, nómina, DPI/NIT de cliente o tarjetas en el esquema conjunto; eso no excluye tales datos de campos L o archivos. [Esquema base](../../backend/kontrol.sql#L2), [bootstrap](../../backend/src/db/bootstrap.js#L5), [modelos de mensajes](../../backend/src/models/Message.js#L3).

### Retención ACTUAL: perfiles usados en las filas

**“Sin TTL observado” significa que el código no programa caducidad; no fija una duración contractual ni prueba conservación eterna.** Un borrado SQL puede estar bloqueado por relaciones y no retira automáticamente todas las copias externas. Todos estos perfiles se refieren al código revisado, no a respaldos/configuración desconocida del host.

| Perfil | Persistencia y mecanismo actual observado |
| --- | --- |
| R0 | PostgreSQL persistente, sin TTL/job de purga observado. Puede cambiarse por operación administrativa/relaciones; no hay plazo de conservación codificado. |
| R-US | P-1 (22-10-2026): baja inmediata, sin período de gracia. Desactiva la cuenta, reemplaza nombre/apellido/correo/teléfono, borra hash y Google ID, retira membresías y permisos, y registra en la misma transacción SQL una tarea durable para limpiar conversaciones IA del titular y mensajes humanos enviados por él después del `COMMIT`. El worker reintenta fallos con espera exponencial, limitada a un intervalo máximo de 24 horas; no hay plazo garantizado de finalización si MongoDB sigue indisponible. La respuesta de borrado distingue `completed` de `pending_retry`. La fila de `usuario` queda como referencia técnica anonimizada para conservar FKs/autoría; ventas y registros empresariales compartidos siguen retenidos. Plazo de retención empresarial no definido. |
| R-EM | R0 mientras la empresa está en uso. Cierre de empresa (P-1, 26-10-2026): el owner lo solicita con reautenticación y el nombre de la empresa; se desactivan la empresa, sus invitaciones y sus integraciones y se abre una ventana de exportación de 30 días, o ninguna si el owner lo pide. Al vencer, un worker elimina las filas de todas las tablas de la empresa, sus archivos de evidencia en Cloudinary y su historial del asistente en Mongo, con plazo de 60 días desde la solicitud. Queda `company_closure` como constancia. El cierre también se programa cuando el último owner borra su cuenta sin sucesor. Plazo de 90 días para respaldos y registros técnicos: comprometido en la adenda, pendiente de P-2 y O09. |
| R-EQ | R0. Baja de equipo pone `activo=false`; conservar no equivale a borrar sus miembros. |
| R-INV | R0. Enlace desactivable mediante `activa=false`, con fechas conservadas; sin fecha de expiración ni purga automática observada. Los permisos de invitación pueden reemplazarse. |
| R-MEM | R0. Filas de membresía/asignación/permisos pueden eliminarse o reemplazarse al gestionar accesos; quedan cuenta, actividad y copias desnormalizadas. |
| R-TA | R0. Cerrar tarea cambia estado a COMPLETADA; no se observa ruta DELETE de tarea. |
| R-DEL | R0. Hay DELETE de registro en ese módulo, sujeto a FKs y permiso de ruta; sin borrado integral de archivos, destinatarios o copias. |
| R-EV | R0. DELETE de evidencia borra fila y luego intenta borrar el archivo en Cloudinary; fallo remoto se registra y devuelve éxito igualmente. No hay reconciliación/reintento persistente observado. |
| R-INT | R0. Desconectar elimina fila de configuración; no elimina `integracion_log`, mensajes ya enviados ni credenciales en el destino. |
| R-LOG | R0. Resultados de despacho en `integracion_log` sin TTL/purga observada; CASCADE si efectivamente se borra empresa. |

Fuentes de los perfiles: [baja usuario](../../backend/src/controllers/userController.js#L214), [estado empresa](../../backend/src/controllers/globalController.js#L16), [equipo](../../backend/src/controllers/teamController.js#L247), [invitación empresa](../../backend/src/services/companyInvitationService.js#L123), [invitación proyecto](../../backend/src/services/projectInvitationService.js#L193), [gestión de miembros](../../backend/src/controllers/companyController.js#L645), [cierre de tarea](../../backend/src/controllers/taskController.js#L171), [borrado de proyecto](../../backend/src/controllers/projectController.js#L262), [evidencia](../../backend/src/controllers/evidenciaController.js#L29), [desconexión de integración](../../backend/src/controllers/integrationController.js#L163), [registro de envío](../../backend/src/services/notificationService.js#L66). Los enlaces DDL de cada fila fundamentan la persistencia sin caducidad declarada; la búsqueda de purgas se limitó al árbol de aplicación y scripts propios.

### Cifrado ACTUAL: perfiles usados en las filas

| Perfil | Evidencia y límite |
| --- | --- |
| SC | Sin cifrado de campo observado en la aplicación para esta columna. No afirma que el disco/servicio esté sin cifrar: **at-rest del host/proveedor no comprobado**. |
| HASH | bcrypt; costo configurable con BCRYPT_SALT_ROUNDS, defecto 10; entorno test declara defecto 6. Es hash, **no cifrado reversible**. |
| AES | AES-256-GCM; IV aleatorio de 16 bytes y tag de 16. Clave derivada con SHA-256 de INTEGRATION_ENCRYPTION_KEY o, en su ausencia, JWT_SECRET. Solo el JSON de credenciales recibe este cifrado de campo; la codificación base64 no es el cifrado. |

Fuentes: [bcrypt](../../backend/src/controllers/authController.js#L16), [test](../../docker-compose.test.yml#L40), [cifrado y máscara](../../backend/src/services/integrationService.js#L1). JWT está firmado, no cifrado; el contenido se puede decodificar. El tránsito se describe aparte: TLS PostgreSQL es condicional a DATABASE_SSL y verifica certificado cuando está activo; no se presupone TLS efectivo por existir esa opción. [JWT](../../backend/src/controllers/authController.js#L19), [TLS condicional](../../backend/src/db/poolConfig.js#L36).

## 2. Contraste exhaustivo de PostgreSQL

**Resultado: 38 tablas persistentes y 278 columnas únicas.** El SQL base contiene 33 tablas/239 columnas, contando su ALTER de `proyecto.id_equipo`. Bootstrap declara o altera 22 tablas/158 columnas; **39 columnas son adicionales al SQL base**, distribuidas entre cinco tablas nuevas y dos columnas de evidencia. La unión estática, no la suma de declaraciones duplicadas, produce 278. Estas cifras excluyen vistas y temporales, inventariadas en §3.

| Tabla public | Columnas únicas | SQL base | Bootstrap (CREATE/ADD) | Perfil |
| --- | ---: | --- | --- | --- |
| `rol` | 3 | Sí | No | R0 |
| `permiso_empresa` | 3 | Sí | No | R0 |
| `permiso_proyecto` | 3 | Sí | No | R0 |
| `usuario` | 10 | Sí | No | R-US |
| `empresa` | 7 | Sí | Sí | R-EM |
| `empresa_config` | 6 | Sí | Sí | R0 |
| `categoria` | 4 | Sí | No | R0 |
| `proveedor` | 6 | Sí | Sí | R-DEL |
| `rol_empresa` | 3 | Sí | No | R0 |
| `rol_empresa_permiso` | 2 | Sí | No | R0 |
| `empresa_usuario` | 3 | Sí | No | R-MEM |
| `empresa_invitacion` | 8 | Sí | Sí | R-INV |
| `proyecto` | 10 | Sí | Sí | R-DEL |
| `rol_proyecto` | 4 | Sí | No | R0 |
| `rol_proyecto_permiso` | 2 | Sí | No | R0 |
| `proyecto_usuario` | 3 | Sí | No | R-MEM |
| `proyecto_usuario_permiso` | 3 | Sí | No | R-MEM |
| `producto` | 11 | Sí | Sí | R-DEL |
| `producto_proveedor` | 4 | Sí | No | R-DEL |
| `presupuesto_actividad` | 5 | Sí | No | R-DEL |
| `venta` | 12 | Sí | Sí | R0 |
| `movimiento_inventario` | 16 | Sí | Sí | R0 |
| `tarea` | 7 | Sí | No | R-TA |
| `asignacion` | 4 | Sí | No | R-MEM |
| `evidencia` | 11 | Sí | Sí | R-EV |
| `presupuesto_ajuste` | 6 | Sí | Sí | R0 |
| `reporte` | 8 | Sí | Sí | R-DEL |
| `equipo` | 7 | Sí | Sí | R-EQ |
| `equipo_usuario` | 2 | Sí | Sí | R-MEM |
| `marketing_campaign` | 14 | Sí | Sí | R-DEL |
| `marketing_publication` | 18 | Sí | Sí | R-DEL |
| `marketing_item` | 19 | Sí | Sí | R-DEL |
| `marketing_publication_metric_snapshot` | 17 | Sí | Sí | R-DEL |
| `proyecto_invitacion` | 9 | No | Sí | R-INV |
| `proyecto_invitacion_permiso` | 2 | No | Sí | R-INV |
| `project_progress_entry` | 10 | No | Sí | R-DEL |
| `integracion` | 9 | No | Sí | R-INT |
| `integracion_log` | 7 | No | Sí | R-LOG |

Cada fila siguiente identifica **TABLA.COLUMNA**. “Dónde” incluye la declaración exacta y, si existe en ambos archivos, las dos fuentes. El origen describe el flujo previsto del código, no un registro individual comprobado. Las finalidades explican el uso funcional observado, sin atribuir una base legal o un consentimiento.

### public.rol

Catálogo de roles de sistema. Origen funcional: SQL/administración de catálogo. Uso: Definir roles globales.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `rol.id_rol`: identificador de rol del sistema | NP | [kontrol.sql:3](../../backend/kontrol.sql#L3) | Clave generada o relación seleccionada | Permisos globales | R0: sin TTL | SC |
| `rol.nombre_rol`: nombre del rol de sistema | NP | [kontrol.sql:4](../../backend/kontrol.sql#L4) | Catálogo SQL/bootstrap | Permisos globales | R0: sin TTL | SC |
| `rol.descripcion`: descripción de texto libre | NP | [kontrol.sql:5](../../backend/kontrol.sql#L5) | Catálogo SQL/bootstrap | Permisos globales | R0: sin TTL | SC |

### public.permiso_empresa

Catálogo de permisos de empresa. Origen funcional: SQL de catálogo. Uso: Definir permisos posibles.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `permiso_empresa.id_permiso_empresa`: identificador de permiso de empresa | NP | [kontrol.sql:9](../../backend/kontrol.sql#L9) | Clave generada o relación seleccionada | Permisos globales | R0: sin TTL | SC |
| `permiso_empresa.nombre_permiso`: nombre técnico del permiso | NP | [kontrol.sql:10](../../backend/kontrol.sql#L10) | Catálogo SQL/bootstrap | Permisos globales | R0: sin TTL | SC |
| `permiso_empresa.descripcion`: descripción de texto libre | NP | [kontrol.sql:11](../../backend/kontrol.sql#L11) | Catálogo SQL/bootstrap | Permisos globales | R0: sin TTL | SC |

### public.permiso_proyecto

Catálogo de permisos de proyecto. Origen funcional: SQL/bootstrap de catálogo. Uso: Definir permisos posibles.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `permiso_proyecto.id_permiso_proyecto`: identificador de permiso de proyecto | NP | [kontrol.sql:15](../../backend/kontrol.sql#L15) | Clave generada o relación seleccionada | Permisos globales | R0: sin TTL | SC |
| `permiso_proyecto.nombre_permiso`: nombre técnico del permiso | NP | [kontrol.sql:16](../../backend/kontrol.sql#L16) | Catálogo SQL/bootstrap | Permisos globales | R0: sin TTL | SC |
| `permiso_proyecto.descripcion`: descripción de texto libre | NP | [kontrol.sql:17](../../backend/kontrol.sql#L17) | Catálogo SQL/bootstrap | Permisos globales | R0: sin TTL | SC |

### public.usuario

Cuentas de personas. Origen funcional: Registro, Google OAuth o administración de usuarios. Uso: Identificar, autenticar y administrar acceso.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `usuario.id_usuario`: identificador de la persona/cuenta | I | [kontrol.sql:22](../../backend/kontrol.sql#L22) | Cuenta/selección de operador | Cuenta y acceso | R-US: sin TTL | SC |
| `usuario.nombre`: nombre registrado | D | [kontrol.sql:23](../../backend/kontrol.sql#L23) | Persona/admin u OAuth | Cuenta y acceso | R-US: sin TTL | SC |
| `usuario.apellido`: apellido de la persona | D | [kontrol.sql:24](../../backend/kontrol.sql#L24) | Persona/admin u OAuth | Cuenta y acceso | R-US: sin TTL | SC |
| `usuario.email`: correo electrónico | D | [kontrol.sql:25](../../backend/kontrol.sql#L25) | Persona/admin u OAuth | Cuenta y acceso | R-US: sin TTL | SC |
| `usuario.password_hash`: verificador de contraseña | S | [kontrol.sql:26](../../backend/kontrol.sql#L26) | Servidor a partir de contraseña | Cuenta y acceso | R-US: sin TTL | HASH |
| `usuario.telefono`: número telefónico | D | [kontrol.sql:27](../../backend/kontrol.sql#L27) | Operador / valores de sistema | Cuenta y acceso | R-US: sin TTL | SC |
| `usuario.id_rol`: identificador de rol del sistema | I | [kontrol.sql:28](../../backend/kontrol.sql#L28) | Clave generada o relación seleccionada | Cuenta y acceso | R-US: sin TTL | SC |
| `usuario.activo`: estado habilitado/deshabilitado | I | [kontrol.sql:29](../../backend/kontrol.sql#L29) | Operador / valores de sistema | Cuenta y acceso | R-US: sin TTL | SC |
| `usuario.google_id`: identificador externo Google (sub) | D | [kontrol.sql:30](../../backend/kontrol.sql#L30) | Google OAuth | Cuenta y acceso | R-US: sin TTL | SC |
| `usuario.token_version`: versión para invalidación de sesiones | S | [kontrol.sql:31](../../backend/kontrol.sql#L31) | Servidor / valor DDL | Cuenta y acceso | R-US: se incrementa al borrar cuenta; sin TTL para la fila técnica | SC |

### public.empresa

Negocios y contacto. Origen funcional: Alta de empresa; email copiado de usuario.email. Uso: Identificar el negocio y vincular su propietario.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `empresa.id_empresa`: identificador del negocio | C | [kontrol.sql:36](../../backend/kontrol.sql#L36) | Clave generada o relación seleccionada | Identificar negocio | R-EM: sin TTL | SC |
| `empresa.nombre`: nombre registrado | L/C | [kontrol.sql:37](../../backend/kontrol.sql#L37) | Operador / valores de sistema | Identificar negocio | R-EM: sin TTL | SC |
| `empresa.industria`: sector declarado del negocio | C | [kontrol.sql:38](../../backend/kontrol.sql#L38) | Operador / valores de sistema | Identificar negocio | R-EM: sin TTL | SC |
| `empresa.telefono`: número telefónico | D | [kontrol.sql:39](../../backend/kontrol.sql#L39) | Operador / valores de sistema | Identificar negocio | R-EM: sin TTL | SC |
| `empresa.direccion`: dirección de contacto, posiblemente domicilio | D | [kontrol.sql:40](../../backend/kontrol.sql#L40) | Operador / valores de sistema | Identificar negocio | R-EM: sin TTL | SC |
| `empresa.email`: correo electrónico | D | [kontrol.sql:41](../../backend/kontrol.sql#L41) | Copia de usuario.email | Identificar negocio | R-EM: sin TTL | SC |
| `empresa.activo`: estado habilitado/deshabilitado | C | [kontrol.sql:42](../../backend/kontrol.sql#L42); [bootstrap.js:7](../../backend/src/db/bootstrap.js#L7) | Operador / valores de sistema | Identificar negocio | R-EM: sin TTL | SC |

### public.empresa_config

Configuración POS. Origen funcional: Valores por defecto y configuración del dueño. Uso: Calcular ventas, descuentos y moneda.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `empresa_config.id_empresa`: identificador del negocio | C | [kontrol.sql:58](../../backend/kontrol.sql#L58); [bootstrap.js:275](../../backend/src/db/bootstrap.js#L275) | Clave generada o relación seleccionada | Cálculo POS | R0: sin TTL | SC |
| `empresa_config.iva_activo`: opción de IVA del registro POS | C | [kontrol.sql:59](../../backend/kontrol.sql#L59); [bootstrap.js:276](../../backend/src/db/bootstrap.js#L276) | Operador / valores de sistema | Cálculo POS | R0: sin TTL | SC |
| `empresa_config.iva_tasa`: tasa guardada de IVA | C | [kontrol.sql:60](../../backend/kontrol.sql#L60); [bootstrap.js:277](../../backend/src/db/bootstrap.js#L277) | Operador / valores de sistema | Cálculo POS | R0: sin TTL | SC |
| `empresa_config.descuento_activo`: opción de descuento | C | [kontrol.sql:61](../../backend/kontrol.sql#L61); [bootstrap.js:278](../../backend/src/db/bootstrap.js#L278) | Operador / valores de sistema | Cálculo POS | R0: sin TTL | SC |
| `empresa_config.descuento_max_pct`: máximo de descuento permitido | C | [kontrol.sql:62](../../backend/kontrol.sql#L62); [bootstrap.js:279](../../backend/src/db/bootstrap.js#L279) | Operador / valores de sistema | Cálculo POS | R0: sin TTL | SC |
| `empresa_config.moneda`: moneda de registro | C | [kontrol.sql:63](../../backend/kontrol.sql#L63); [bootstrap.js:289](../../backend/src/db/bootstrap.js#L289) | Operador / valores de sistema | Cálculo POS | R0: sin TTL | SC |

### public.categoria

Categorías de inventario. Origen funcional: Alta/resolución de categoría desde productos. Uso: Clasificar productos del negocio.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `categoria.id_categoria`: identificador de categoría | C | [kontrol.sql:68](../../backend/kontrol.sql#L68) | Clave generada o relación seleccionada | Clasificar inventario | R0: sin TTL | SC |
| `categoria.nombre`: nombre registrado | L/C | [kontrol.sql:69](../../backend/kontrol.sql#L69) | Operador / valores de sistema | Clasificar inventario | R0: sin TTL | SC |
| `categoria.descripcion`: descripción de texto libre | L/C | [kontrol.sql:70](../../backend/kontrol.sql#L70) | Operador / valores de sistema | Clasificar inventario | R0: sin TTL | SC |
| `categoria.id_empresa`: identificador del negocio | C | [kontrol.sql:71](../../backend/kontrol.sql#L71) | Clave generada o relación seleccionada | Clasificar inventario | R0: sin TTL | SC |

### public.proveedor

Proveedores y sus contactos. Origen funcional: Formulario de proveedores y operador del negocio. Uso: Gestionar compras y contactos.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `proveedor.id_proveedor`: identificador del proveedor | C | [kontrol.sql:78](../../backend/kontrol.sql#L78) | Clave generada o relación seleccionada | Contacto y compras | R-DEL: sin TTL | SC |
| `proveedor.nombre`: nombre registrado | L/C | [kontrol.sql:79](../../backend/kontrol.sql#L79) | Operador / valores de sistema | Contacto y compras | R-DEL: sin TTL | SC |
| `proveedor.contacto_nombre`: nombre de la persona de contacto | D | [kontrol.sql:80](../../backend/kontrol.sql#L80) | Operador / valores de sistema | Contacto y compras | R-DEL: sin TTL | SC |
| `proveedor.telefono`: número telefónico | D | [kontrol.sql:81](../../backend/kontrol.sql#L81) | Operador / valores de sistema | Contacto y compras | R-DEL: sin TTL | SC |
| `proveedor.email`: correo electrónico | D | [kontrol.sql:82](../../backend/kontrol.sql#L82) | Operador / valores de sistema | Contacto y compras | R-DEL: sin TTL | SC |
| `proveedor.id_empresa`: identificador del negocio | C | [kontrol.sql:83](../../backend/kontrol.sql#L83); [bootstrap.js:250](../../backend/src/db/bootstrap.js#L250) | Clave generada o relación seleccionada | Contacto y compras | R-DEL: sin TTL | SC |

### public.rol_empresa

Catálogo de roles de empresa. Origen funcional: SQL de catálogo. Uso: Definir owner/admin/manager/collaborator.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `rol_empresa.id_rol_empresa`: identificador del rol dentro de empresa | NP | [kontrol.sql:90](../../backend/kontrol.sql#L90) | Clave generada o relación seleccionada | Permisos globales | R0: sin TTL | SC |
| `rol_empresa.nombre`: nombre registrado | NP | [kontrol.sql:91](../../backend/kontrol.sql#L91) | Catálogo SQL/bootstrap | Permisos globales | R0: sin TTL | SC |
| `rol_empresa.descripcion`: descripción de texto libre | NP | [kontrol.sql:92](../../backend/kontrol.sql#L92) | Catálogo SQL/bootstrap | Permisos globales | R0: sin TTL | SC |

### public.rol_empresa_permiso

Permisos de un rol global. Origen funcional: SQL de catálogo. Uso: Definir autorización general.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `rol_empresa_permiso.id_rol_empresa`: identificador del rol dentro de empresa | NP | [kontrol.sql:96](../../backend/kontrol.sql#L96) | Clave generada o relación seleccionada | Permisos globales | R0: sin TTL | SC |
| `rol_empresa_permiso.id_permiso_empresa`: identificador de permiso de empresa | NP | [kontrol.sql:97](../../backend/kontrol.sql#L97) | Clave generada o relación seleccionada | Permisos globales | R0: sin TTL | SC |

### public.empresa_usuario

Membresía laboral o de colaboración. Origen funcional: Alta de empresa, invitación o gestión de miembros. Uso: Vincular cuenta, negocio y función.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `empresa_usuario.id_empresa`: identificador del negocio | I | [kontrol.sql:104](../../backend/kontrol.sql#L104) | Clave generada o relación seleccionada | Membresía y acceso | R-MEM: sin TTL | SC |
| `empresa_usuario.id_usuario`: identificador de la persona/cuenta | I | [kontrol.sql:105](../../backend/kontrol.sql#L105) | Cuenta/selección de operador | Membresía y acceso | R-MEM: sin TTL | SC |
| `empresa_usuario.id_rol_empresa`: identificador del rol dentro de empresa | I | [kontrol.sql:106](../../backend/kontrol.sql#L106) | Clave generada o relación seleccionada | Membresía y acceso | R-MEM: sin TTL | SC |

### public.empresa_invitacion

Invitaciones al negocio. Origen funcional: Servidor y dueño del negocio. Uso: Invitar y registrar activación/uso.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `empresa_invitacion.id_invitacion`: identificador del enlace de invitación | I | [kontrol.sql:114](../../backend/kontrol.sql#L114); [bootstrap.js:12](../../backend/src/db/bootstrap.js#L12) | Clave generada o relación seleccionada | Invitar al negocio | R-INV: sin TTL | SC |
| `empresa_invitacion.id_empresa`: identificador del negocio | I | [kontrol.sql:115](../../backend/kontrol.sql#L115); [bootstrap.js:13](../../backend/src/db/bootstrap.js#L13) | Clave generada o relación seleccionada | Invitar al negocio | R-INV: sin TTL | SC |
| `empresa_invitacion.token`: secreto de invitación reutilizable mientras esté activo | S | [kontrol.sql:116](../../backend/kontrol.sql#L116); [bootstrap.js:14](../../backend/src/db/bootstrap.js#L14) | Servidor / valor DDL | Invitar al negocio | R-INV: sin TTL | SC |
| `empresa_invitacion.id_usuario_owner`: identificador del dueño que invita | I | [kontrol.sql:117](../../backend/kontrol.sql#L117); [bootstrap.js:15](../../backend/src/db/bootstrap.js#L15) | Cuenta autenticada/servidor | Invitar al negocio | R-INV: sin TTL | SC |
| `empresa_invitacion.activa`: estado del enlace | I | [kontrol.sql:118](../../backend/kontrol.sql#L118); [bootstrap.js:16](../../backend/src/db/bootstrap.js#L16) | Operador / valores de sistema | Invitar al negocio | R-INV: sin TTL | SC |
| `empresa_invitacion.creada_en`: fecha de creación del enlace | I | [kontrol.sql:119](../../backend/kontrol.sql#L119); [bootstrap.js:17](../../backend/src/db/bootstrap.js#L17) | Servidor/DDL y operación | Invitar al negocio | R-INV: sin TTL | SC |
| `empresa_invitacion.desactivada_en`: fecha de desactivación del enlace | I | [kontrol.sql:120](../../backend/kontrol.sql#L120); [bootstrap.js:18](../../backend/src/db/bootstrap.js#L18) | Servidor/DDL y operación | Invitar al negocio | R-INV: sin TTL | SC |
| `empresa_invitacion.ultimo_uso_en`: fecha de último uso del enlace | I | [kontrol.sql:121](../../backend/kontrol.sql#L121); [bootstrap.js:19](../../backend/src/db/bootstrap.js#L19) | Servidor/DDL y operación | Invitar al negocio | R-INV: sin TTL | SC |

### public.proyecto

Proyectos y responsable. Origen funcional: Formulario de proyectos y gestión de equipos. Uso: Planificar y asignar trabajo/presupuesto.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `proyecto.id_proyecto`: identificador del proyecto | C | [kontrol.sql:133](../../backend/kontrol.sql#L133) | Clave generada o relación seleccionada | Control de proyecto | R-DEL: sin TTL | SC |
| `proyecto.nombre`: nombre registrado | L/C | [kontrol.sql:134](../../backend/kontrol.sql#L134) | Operador / valores de sistema | Control de proyecto | R-DEL: sin TTL | SC |
| `proyecto.descripcion`: descripción de texto libre | L/C | [kontrol.sql:135](../../backend/kontrol.sql#L135) | Operador / valores de sistema | Control de proyecto | R-DEL: sin TTL | SC |
| `proyecto.fecha_inicio`: fecha de inicio | C | [kontrol.sql:136](../../backend/kontrol.sql#L136) | Operador / valores de sistema | Control de proyecto | R-DEL: sin TTL | SC |
| `proyecto.fecha_fin_planificada`: fecha prevista de finalización | C | [kontrol.sql:137](../../backend/kontrol.sql#L137) | Operador / valores de sistema | Control de proyecto | R-DEL: sin TTL | SC |
| `proyecto.presupuesto_total`: monto de presupuesto asignado | C | [kontrol.sql:138](../../backend/kontrol.sql#L138) | Operador / valores de sistema | Control de proyecto | R-DEL: sin TTL | SC |
| `proyecto.estado`: estado del registro | C | [kontrol.sql:139](../../backend/kontrol.sql#L139) | Operador / valores de sistema | Control de proyecto | R-DEL: sin TTL | SC |
| `proyecto.id_empresa`: identificador del negocio | C | [kontrol.sql:140](../../backend/kontrol.sql#L140) | Clave generada o relación seleccionada | Control de proyecto | R-DEL: sin TTL | SC |
| `proyecto.id_encargado`: identificador de la persona encargada | I | [kontrol.sql:141](../../backend/kontrol.sql#L141) | Cuenta/selección de operador | Control de proyecto | R-DEL: sin TTL | SC |
| `proyecto.id_equipo`: identificador del equipo de personas | C | [kontrol.sql:482](../../backend/kontrol.sql#L482); [bootstrap.js:453](../../backend/src/db/bootstrap.js#L453) | Clave generada o relación seleccionada | Control de proyecto | R-DEL: sin TTL | SC |

### public.rol_proyecto

Roles propios de cada proyecto. Origen funcional: Configuración y servicios de acceso del proyecto. Uso: Definir responsabilidades específicas.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `rol_proyecto.id_rol_proyecto`: identificador de rol dentro de proyecto | I | [kontrol.sql:149](../../backend/kontrol.sql#L149) | Clave generada o relación seleccionada | Roles del proyecto | R0: sin TTL | SC |
| `rol_proyecto.id_proyecto`: identificador del proyecto | I | [kontrol.sql:150](../../backend/kontrol.sql#L150) | Clave generada o relación seleccionada | Roles del proyecto | R0: sin TTL | SC |
| `rol_proyecto.nombre`: nombre registrado | L/C | [kontrol.sql:151](../../backend/kontrol.sql#L151) | Operador / valores de sistema | Roles del proyecto | R0: sin TTL | SC |
| `rol_proyecto.descripcion`: descripción de texto libre | L/C | [kontrol.sql:152](../../backend/kontrol.sql#L152) | Operador / valores de sistema | Roles del proyecto | R0: sin TTL | SC |

### public.rol_proyecto_permiso

Permisos de roles de proyecto. Origen funcional: Gestión de acceso/SQL. Uso: Resolver permisos de personas por su rol.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `rol_proyecto_permiso.id_rol_proyecto`: identificador de rol dentro de proyecto | I | [kontrol.sql:159](../../backend/kontrol.sql#L159) | Clave generada o relación seleccionada | Acceso por rol | R0: sin TTL | SC |
| `rol_proyecto_permiso.id_permiso_proyecto`: identificador de permiso de proyecto | I | [kontrol.sql:160](../../backend/kontrol.sql#L160) | Clave generada o relación seleccionada | Acceso por rol | R0: sin TTL | SC |

### public.proyecto_usuario

Miembros de proyecto. Origen funcional: Invitación o gestión de miembros. Uso: Autorizar participación en un proyecto.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `proyecto_usuario.id_proyecto`: identificador del proyecto | I | [kontrol.sql:167](../../backend/kontrol.sql#L167) | Clave generada o relación seleccionada | Acceso a proyecto | R-MEM: sin TTL | SC |
| `proyecto_usuario.id_usuario`: identificador de la persona/cuenta | I | [kontrol.sql:168](../../backend/kontrol.sql#L168) | Cuenta/selección de operador | Acceso a proyecto | R-MEM: sin TTL | SC |
| `proyecto_usuario.id_rol_proyecto`: identificador de rol dentro de proyecto | I | [kontrol.sql:169](../../backend/kontrol.sql#L169) | Clave generada o relación seleccionada | Acceso a proyecto | R-MEM: sin TTL | SC |

### public.proyecto_usuario_permiso

Permisos individuales. Origen funcional: Invitación o gestión de miembros. Uso: Conceder accesos individuales.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `proyecto_usuario_permiso.id_proyecto`: identificador del proyecto | I | [kontrol.sql:179](../../backend/kontrol.sql#L179) | Clave generada o relación seleccionada | Acceso individual | R-MEM: sin TTL | SC |
| `proyecto_usuario_permiso.id_usuario`: identificador de la persona/cuenta | I | [kontrol.sql:180](../../backend/kontrol.sql#L180) | Cuenta/selección de operador | Acceso individual | R-MEM: sin TTL | SC |
| `proyecto_usuario_permiso.id_permiso_proyecto`: identificador de permiso de proyecto | I | [kontrol.sql:181](../../backend/kontrol.sql#L181) | Clave generada o relación seleccionada | Acceso individual | R-MEM: sin TTL | SC |

### public.producto

Inventario de productos. Origen funcional: Formulario de inventario y cálculo de movimientos. Uso: Controlar existencias, precios y reposición.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `producto.id_producto`: identificador de producto | C | [kontrol.sql:189](../../backend/kontrol.sql#L189) | Clave generada o relación seleccionada | Inventario y precios | R-DEL: sin TTL | SC |
| `producto.nombre`: nombre registrado | L/C | [kontrol.sql:190](../../backend/kontrol.sql#L190) | Operador / valores de sistema | Inventario y precios | R-DEL: sin TTL | SC |
| `producto.descripcion`: descripción de texto libre | L/C | [kontrol.sql:191](../../backend/kontrol.sql#L191) | Operador / valores de sistema | Inventario y precios | R-DEL: sin TTL | SC |
| `producto.precio_venta`: precio de venta | C | [kontrol.sql:192](../../backend/kontrol.sql#L192) | Operador / valores de sistema | Inventario y precios | R-DEL: sin TTL | SC |
| `producto.precio_costo`: precio de costo | C | [kontrol.sql:193](../../backend/kontrol.sql#L193) | Operador / valores de sistema | Inventario y precios | R-DEL: sin TTL | SC |
| `producto.costo_promedio_ponderado`: costo medio calculado | C | [kontrol.sql:194](../../backend/kontrol.sql#L194) | Cálculo/registro del servidor | Inventario y precios | R-DEL: sin TTL | SC |
| `producto.stock_actual`: cantidad de existencias | C | [kontrol.sql:195](../../backend/kontrol.sql#L195) | Cálculo/registro del servidor | Inventario y precios | R-DEL: sin TTL | SC |
| `producto.stock_minimo`: umbral de reposición | C | [kontrol.sql:196](../../backend/kontrol.sql#L196) | Operador / valores de sistema | Inventario y precios | R-DEL: sin TTL | SC |
| `producto.id_categoria`: identificador de categoría | C | [kontrol.sql:197](../../backend/kontrol.sql#L197) | Clave generada o relación seleccionada | Inventario y precios | R-DEL: sin TTL | SC |
| `producto.id_proyecto`: identificador del proyecto | C | [kontrol.sql:198](../../backend/kontrol.sql#L198) | Clave generada o relación seleccionada | Inventario y precios | R-DEL: sin TTL | SC |
| `producto.codigo_barras`: código comercial de barras | C | [kontrol.sql:201](../../backend/kontrol.sql#L201); [bootstrap.js:236](../../backend/src/db/bootstrap.js#L236) | Operador / valores de sistema | Inventario y precios | R-DEL: sin TTL | SC |

### public.producto_proveedor

Cotizaciones y relación proveedor-producto. Origen funcional: Formulario de vinculación de proveedor. Uso: Registrar costo, oferta y proveedor.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `producto_proveedor.id_producto`: identificador de producto | C | [kontrol.sql:216](../../backend/kontrol.sql#L216) | Clave generada o relación seleccionada | Cotización y suministro | R-DEL: sin TTL | SC |
| `producto_proveedor.id_proveedor`: identificador del proveedor | C | [kontrol.sql:217](../../backend/kontrol.sql#L217) | Clave generada o relación seleccionada | Cotización y suministro | R-DEL: sin TTL | SC |
| `producto_proveedor.precio_unitario`: precio unitario registrado | C | [kontrol.sql:218](../../backend/kontrol.sql#L218) | Operador / valores de sistema | Cotización y suministro | R-DEL: sin TTL | SC |
| `producto_proveedor.fecha_ultima_cotizacion`: fecha de cotización del proveedor | C | [kontrol.sql:219](../../backend/kontrol.sql#L219) | Operador / valores de sistema | Cotización y suministro | R-DEL: sin TTL | SC |

### public.presupuesto_actividad

Actividades presupuestarias. Origen funcional: Formulario de presupuesto. Uso: Comparar gasto previsto y real.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `presupuesto_actividad.id_actividad`: identificador de actividad presupuestaria | C | [kontrol.sql:228](../../backend/kontrol.sql#L228) | Clave generada o relación seleccionada | Control de gasto | R-DEL: sin TTL | SC |
| `presupuesto_actividad.nombre`: nombre registrado | L/C | [kontrol.sql:229](../../backend/kontrol.sql#L229) | Operador / valores de sistema | Control de gasto | R-DEL: sin TTL | SC |
| `presupuesto_actividad.monto_planificado`: gasto planificado | C | [kontrol.sql:230](../../backend/kontrol.sql#L230) | Operador / valores de sistema | Control de gasto | R-DEL: sin TTL | SC |
| `presupuesto_actividad.monto_real`: gasto real registrado | C | [kontrol.sql:231](../../backend/kontrol.sql#L231) | Operador / valores de sistema | Control de gasto | R-DEL: sin TTL | SC |
| `presupuesto_actividad.id_proyecto`: identificador del proyecto | C | [kontrol.sql:232](../../backend/kontrol.sql#L232) | Clave generada o relación seleccionada | Control de gasto | R-DEL: sin TTL | SC |

### public.venta

Registro POS, sin cobro por pasarela. Origen funcional: Operador POS y cálculos del servidor. Uso: Registrar venta y atribuirla al cajero.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `venta.id_venta`: identificador del registro de venta | C | [kontrol.sql:254](../../backend/kontrol.sql#L254); [bootstrap.js:312](../../backend/src/db/bootstrap.js#L312) | Clave generada o relación seleccionada | Registro de venta/cajero | R0: sin TTL | SC |
| `venta.fecha`: fecha/hora de la operación atribuible | C | [kontrol.sql:255](../../backend/kontrol.sql#L255); [bootstrap.js:313](../../backend/src/db/bootstrap.js#L313) | Operador / valores de sistema | Registro de venta/cajero | R0: sin TTL | SC |
| `venta.subtotal`: importe anterior a descuento e IVA | C | [kontrol.sql:256](../../backend/kontrol.sql#L256); [bootstrap.js:314](../../backend/src/db/bootstrap.js#L314) | Cálculo/registro del servidor | Registro de venta/cajero | R0: sin TTL | SC |
| `venta.descuento_pct`: porcentaje de descuento de venta | C | [kontrol.sql:257](../../backend/kontrol.sql#L257); [bootstrap.js:315](../../backend/src/db/bootstrap.js#L315) | Operador / valores de sistema | Registro de venta/cajero | R0: sin TTL | SC |
| `venta.descuento`: importe de descuento | C | [kontrol.sql:258](../../backend/kontrol.sql#L258); [bootstrap.js:316](../../backend/src/db/bootstrap.js#L316) | Cálculo/registro del servidor | Registro de venta/cajero | R0: sin TTL | SC |
| `venta.base_imponible`: base registrada para IVA | C | [kontrol.sql:259](../../backend/kontrol.sql#L259); [bootstrap.js:317](../../backend/src/db/bootstrap.js#L317) | Cálculo/registro del servidor | Registro de venta/cajero | R0: sin TTL | SC |
| `venta.iva_tasa`: tasa guardada de IVA | C | [kontrol.sql:260](../../backend/kontrol.sql#L260); [bootstrap.js:318](../../backend/src/db/bootstrap.js#L318) | Operador / valores de sistema | Registro de venta/cajero | R0: sin TTL | SC |
| `venta.iva`: importe de IVA | C | [kontrol.sql:261](../../backend/kontrol.sql#L261); [bootstrap.js:319](../../backend/src/db/bootstrap.js#L319) | Cálculo/registro del servidor | Registro de venta/cajero | R0: sin TTL | SC |
| `venta.total`: importe total de la venta | C | [kontrol.sql:262](../../backend/kontrol.sql#L262); [bootstrap.js:320](../../backend/src/db/bootstrap.js#L320) | Cálculo/registro del servidor | Registro de venta/cajero | R0: sin TTL | SC |
| `venta.motivo`: justificación de texto libre | L/C | [kontrol.sql:263](../../backend/kontrol.sql#L263); [bootstrap.js:321](../../backend/src/db/bootstrap.js#L321) | Operador / valores de sistema | Registro de venta/cajero | R0: sin TTL | SC |
| `venta.id_empresa`: identificador del negocio | C | [kontrol.sql:264](../../backend/kontrol.sql#L264); [bootstrap.js:322](../../backend/src/db/bootstrap.js#L322) | Clave generada o relación seleccionada | Registro de venta/cajero | R0: sin TTL | SC |
| `venta.id_usuario`: identificador de la persona/cuenta | I | [kontrol.sql:265](../../backend/kontrol.sql#L265); [bootstrap.js:323](../../backend/src/db/bootstrap.js#L323) | Cuenta/selección de operador | Registro de venta/cajero | R0: sin TTL | SC |

### public.movimiento_inventario

Historial de inventario y gastos. Origen funcional: Operador, compra, ajuste, gasto o venta POS. Uso: Trazar stock, gasto, ingresos y autoría.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `movimiento_inventario.id_movimiento`: identificador del movimiento | C | [kontrol.sql:275](../../backend/kontrol.sql#L275) | Clave generada o relación seleccionada | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.tipo`: tipo de registro u operación | C | [kontrol.sql:276](../../backend/kontrol.sql#L276) | Operador / valores de sistema | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.cantidad`: cantidad de unidades | C | [kontrol.sql:277](../../backend/kontrol.sql#L277) | Operador / valores de sistema | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.precio_unitario`: precio unitario registrado | C | [kontrol.sql:278](../../backend/kontrol.sql#L278) | Operador / valores de sistema | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.fecha`: fecha/hora de la operación atribuible | C | [kontrol.sql:279](../../backend/kontrol.sql#L279) | Operador / valores de sistema | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.motivo`: justificación de texto libre | L/C | [kontrol.sql:280](../../backend/kontrol.sql#L280) | Operador / valores de sistema | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.id_empresa`: identificador del negocio | C | [kontrol.sql:281](../../backend/kontrol.sql#L281) | Clave generada o relación seleccionada | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.id_producto`: identificador de producto | C | [kontrol.sql:282](../../backend/kontrol.sql#L282) | Clave generada o relación seleccionada | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.id_usuario`: identificador de la persona/cuenta | I | [kontrol.sql:283](../../backend/kontrol.sql#L283) | Cuenta/selección de operador | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.id_proyecto`: identificador del proyecto | C | [kontrol.sql:284](../../backend/kontrol.sql#L284) | Clave generada o relación seleccionada | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.id_proveedor`: identificador del proveedor | C | [kontrol.sql:285](../../backend/kontrol.sql#L285) | Clave generada o relación seleccionada | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.id_actividad`: identificador de actividad presupuestaria | C | [kontrol.sql:286](../../backend/kontrol.sql#L286); [bootstrap.js:197](../../backend/src/db/bootstrap.js#L197) | Clave generada o relación seleccionada | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.costo_unitario_venta`: costo congelado al registrar venta | C | [kontrol.sql:289](../../backend/kontrol.sql#L289); [bootstrap.js:228](../../backend/src/db/bootstrap.js#L228) | Cálculo/registro del servidor | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.id_venta`: identificador del registro de venta | C | [kontrol.sql:292](../../backend/kontrol.sql#L292); [bootstrap.js:340](../../backend/src/db/bootstrap.js#L340) | Clave generada o relación seleccionada | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.descuento_linea`: descuento repartido a línea | C | [kontrol.sql:301](../../backend/kontrol.sql#L301); [bootstrap.js:344](../../backend/src/db/bootstrap.js#L344) | Cálculo/registro del servidor | Trazabilidad operativa | R0: sin TTL | SC |
| `movimiento_inventario.iva_linea`: IVA repartido a línea | C | [kontrol.sql:302](../../backend/kontrol.sql#L302); [bootstrap.js:348](../../backend/src/db/bootstrap.js#L348) | Cálculo/registro del servidor | Trazabilidad operativa | R0: sin TTL | SC |

### public.tarea

Trabajo asignable. Origen funcional: Formulario de tareas y cambio de estado. Uso: Coordinar tareas y fechas.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `tarea.id_tarea`: identificador de la tarea | C | [kontrol.sql:318](../../backend/kontrol.sql#L318) | Clave generada o relación seleccionada | Coordinar trabajo | R-TA: sin TTL | SC |
| `tarea.nombre`: nombre registrado | L/C | [kontrol.sql:319](../../backend/kontrol.sql#L319) | Operador / valores de sistema | Coordinar trabajo | R-TA: sin TTL | SC |
| `tarea.descripcion`: descripción de texto libre | L/C | [kontrol.sql:320](../../backend/kontrol.sql#L320) | Operador / valores de sistema | Coordinar trabajo | R-TA: sin TTL | SC |
| `tarea.fecha_vencimiento`: fecha límite de trabajo | C | [kontrol.sql:321](../../backend/kontrol.sql#L321) | Operador / valores de sistema | Coordinar trabajo | R-TA: sin TTL | SC |
| `tarea.estado`: estado del registro | C | [kontrol.sql:322](../../backend/kontrol.sql#L322) | Operador / valores de sistema | Coordinar trabajo | R-TA: sin TTL | SC |
| `tarea.prioridad`: prioridad de trabajo | C | [kontrol.sql:323](../../backend/kontrol.sql#L323) | Operador / valores de sistema | Coordinar trabajo | R-TA: sin TTL | SC |
| `tarea.id_proyecto`: identificador del proyecto | C | [kontrol.sql:324](../../backend/kontrol.sql#L324) | Clave generada o relación seleccionada | Coordinar trabajo | R-TA: sin TTL | SC |

### public.asignacion

Asignaciones de trabajo a personas. Origen funcional: Creación/edición de tarea y gestión de acceso. Uso: Identificar quién realiza una tarea.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `asignacion.id_tarea`: identificador de la tarea | I | [kontrol.sql:330](../../backend/kontrol.sql#L330) | Clave generada o relación seleccionada | Atribuir trabajo | R-MEM: sin TTL | SC |
| `asignacion.id_usuario`: identificador de la persona/cuenta | I | [kontrol.sql:331](../../backend/kontrol.sql#L331) | Cuenta/selección de operador | Atribuir trabajo | R-MEM: sin TTL | SC |
| `asignacion.id_proyecto`: identificador del proyecto | I | [kontrol.sql:332](../../backend/kontrol.sql#L332) | Clave generada o relación seleccionada | Atribuir trabajo | R-MEM: sin TTL | SC |
| `asignacion.fecha_asignacion`: fecha de asignación a la persona | I | [kontrol.sql:333](../../backend/kontrol.sql#L333) | Servidor/DDL y operación | Atribuir trabajo | R-MEM: sin TTL | SC |

### public.evidencia

Evidencias y adjuntos. Origen funcional: Carga directa del archivo a Cloudinary y registro con la firma verificada de su respuesta. Uso: Documentar tareas y avances con autoría.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `evidencia.id_evidencia`: identificador de evidencia | I | [kontrol.sql:342](../../backend/kontrol.sql#L342) | Clave generada o relación seleccionada | Prueba y autoría | R-EV: sin TTL | SC |
| `evidencia.descripcion`: descripción de texto libre | L/C | [kontrol.sql:343](../../backend/kontrol.sql#L343) | Operador / valores de sistema | Prueba y autoría | R-EV: sin TTL | SC |
| `evidencia.url_archivo`: URL del adjunto, potencialmente accesible a quien la posea | L/I | [kontrol.sql:344](../../backend/kontrol.sql#L344) | Callback/objeto de archivo | Prueba y autoría | R-EV: sin TTL | SC |
| `evidencia.tipo_archivo`: categoría del archivo | I | [kontrol.sql:345](../../backend/kontrol.sql#L345) | Operador / valores de sistema | Prueba y autoría | R-EV: sin TTL | SC |
| `evidencia.timestamp_captura`: fecha del registro de evidencia; no acredita captura real del dispositivo | I | [kontrol.sql:346](../../backend/kontrol.sql#L346) | Servidor/DDL y operación | Prueba y autoría | R-EV: sin TTL | SC |
| `evidencia.latitud`: coordenada declarada en esquema; captura automática no observada | D/G | [kontrol.sql:347](../../backend/kontrol.sql#L347) | Solo declaración DDL observada | Prueba y autoría | R-EV: sin TTL | SC |
| `evidencia.longitud`: coordenada declarada en esquema; captura automática no observada | D/G | [kontrol.sql:348](../../backend/kontrol.sql#L348) | Solo declaración DDL observada | Prueba y autoría | R-EV: sin TTL | SC |
| `evidencia.id_tarea`: identificador de la tarea | I | [kontrol.sql:349](../../backend/kontrol.sql#L349) | Clave generada o relación seleccionada | Prueba y autoría | R-EV: sin TTL | SC |
| `evidencia.id_usuario`: identificador de la persona/cuenta | I | [kontrol.sql:350](../../backend/kontrol.sql#L350) | Cuenta/selección de operador | Prueba y autoría | R-EV: sin TTL | SC |
| `evidencia.public_id`: clave `tipo:public_id` del archivo en Cloudinary | L/I | [bootstrap.js:784](../../backend/src/db/bootstrap.js#L784) | Respuesta firmada de Cloudinary | Prueba y autoría | R-EV: sin TTL | SC |
| `evidencia.id_progress_entry`: identificador de avance | I | [bootstrap.js:789](../../backend/src/db/bootstrap.js#L789) | Clave generada o relación seleccionada | Prueba y autoría | R-EV: sin TTL | SC |

### public.presupuesto_ajuste

Auditoría de aportes/retiros. Origen funcional: Operador de presupuesto y servidor. Uso: Trazar cambios de capital y su autor.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `presupuesto_ajuste.id_ajuste`: identificador del ajuste de capital | C | [kontrol.sql:360](../../backend/kontrol.sql#L360); [bootstrap.js:174](../../backend/src/db/bootstrap.js#L174) | Clave generada o relación seleccionada | Auditar capital | R0: sin TTL | SC |
| `presupuesto_ajuste.id_proyecto`: identificador del proyecto | C | [kontrol.sql:361](../../backend/kontrol.sql#L361); [bootstrap.js:175](../../backend/src/db/bootstrap.js#L175) | Clave generada o relación seleccionada | Auditar capital | R0: sin TTL | SC |
| `presupuesto_ajuste.monto`: importe del aporte o retiro | C | [kontrol.sql:362](../../backend/kontrol.sql#L362); [bootstrap.js:176](../../backend/src/db/bootstrap.js#L176) | Operador / valores de sistema | Auditar capital | R0: sin TTL | SC |
| `presupuesto_ajuste.motivo`: justificación de texto libre | L/C | [kontrol.sql:363](../../backend/kontrol.sql#L363); [bootstrap.js:177](../../backend/src/db/bootstrap.js#L177) | Operador / valores de sistema | Auditar capital | R0: sin TTL | SC |
| `presupuesto_ajuste.fecha`: fecha/hora de la operación atribuible | C | [kontrol.sql:364](../../backend/kontrol.sql#L364); [bootstrap.js:178](../../backend/src/db/bootstrap.js#L178) | Operador / valores de sistema | Auditar capital | R0: sin TTL | SC |
| `presupuesto_ajuste.id_usuario`: identificador de la persona/cuenta | I | [kontrol.sql:365](../../backend/kontrol.sql#L365); [bootstrap.js:179](../../backend/src/db/bootstrap.js#L179) | Cuenta/selección de operador | Auditar capital | R0: sin TTL | SC |

### public.reporte

Reportes y constancia de exportación. Origen funcional: Formulario de reporte o registro de descarga. Uso: Consultar y dejar constancia de informes.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `reporte.id_reporte`: identificador del reporte/exportación | C | [kontrol.sql:371](../../backend/kontrol.sql#L371) | Clave generada o relación seleccionada | Informe/descarga y autor | R-DEL: sin TTL | SC |
| `reporte.titulo`: título de texto libre | L/C | [kontrol.sql:372](../../backend/kontrol.sql#L372) | Operador / valores de sistema | Informe/descarga y autor | R-DEL: sin TTL | SC |
| `reporte.fecha_generacion`: fecha de reporte o descarga | C | [kontrol.sql:373](../../backend/kontrol.sql#L373) | Servidor/DDL y operación | Informe/descarga y autor | R-DEL: sin TTL | SC |
| `reporte.tipo`: tipo de registro u operación | C | [kontrol.sql:374](../../backend/kontrol.sql#L374) | Operador / valores de sistema | Informe/descarga y autor | R-DEL: sin TTL | SC |
| `reporte.contenido_url`: URL externa ingresada para contenido del reporte | L/I | [kontrol.sql:375](../../backend/kontrol.sql#L375) | Operador / valores de sistema | Informe/descarga y autor | R-DEL: sin TTL | SC |
| `reporte.id_proyecto`: identificador del proyecto | C | [kontrol.sql:377](../../backend/kontrol.sql#L377) | Clave generada o relación seleccionada | Informe/descarga y autor | R-DEL: sin TTL | SC |
| `reporte.id_empresa`: identificador del negocio | C | [kontrol.sql:378](../../backend/kontrol.sql#L378); [bootstrap.js:385](../../backend/src/db/bootstrap.js#L385) | Clave generada o relación seleccionada | Informe/descarga y autor | R-DEL: sin TTL | SC |
| `reporte.id_usuario`: identificador de la persona/cuenta | I | [kontrol.sql:379](../../backend/kontrol.sql#L379) | Cuenta/selección de operador | Informe/descarga y autor | R-DEL: sin TTL | SC |

### public.equipo

Equipos y liderazgo. Origen funcional: Formulario de equipos. Uso: Organizar personas y proyectos.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `equipo.id_equipo`: identificador del equipo de personas | I | [kontrol.sql:460](../../backend/kontrol.sql#L460); [bootstrap.js:425](../../backend/src/db/bootstrap.js#L425) | Clave generada o relación seleccionada | Organizar equipo | R-EQ: sin TTL | SC |
| `equipo.nombre`: nombre registrado | L/C | [kontrol.sql:461](../../backend/kontrol.sql#L461); [bootstrap.js:426](../../backend/src/db/bootstrap.js#L426) | Operador / valores de sistema | Organizar equipo | R-EQ: sin TTL | SC |
| `equipo.descripcion`: descripción de texto libre | L/C | [kontrol.sql:462](../../backend/kontrol.sql#L462); [bootstrap.js:427](../../backend/src/db/bootstrap.js#L427) | Operador / valores de sistema | Organizar equipo | R-EQ: sin TTL | SC |
| `equipo.id_empresa`: identificador del negocio | I | [kontrol.sql:463](../../backend/kontrol.sql#L463); [bootstrap.js:428](../../backend/src/db/bootstrap.js#L428) | Clave generada o relación seleccionada | Organizar equipo | R-EQ: sin TTL | SC |
| `equipo.id_lider`: identificador de la persona líder | I | [kontrol.sql:464](../../backend/kontrol.sql#L464); [bootstrap.js:429](../../backend/src/db/bootstrap.js#L429) | Cuenta/selección de operador | Organizar equipo | R-EQ: sin TTL | SC |
| `equipo.activo`: estado habilitado/deshabilitado | I | [kontrol.sql:465](../../backend/kontrol.sql#L465); [bootstrap.js:430](../../backend/src/db/bootstrap.js#L430) | Operador / valores de sistema | Organizar equipo | R-EQ: sin TTL | SC |
| `equipo.creado_en`: fecha de alta | I | [kontrol.sql:466](../../backend/kontrol.sql#L466); [bootstrap.js:431](../../backend/src/db/bootstrap.js#L431) | Servidor/DDL y operación | Organizar equipo | R-EQ: sin TTL | SC |

### public.equipo_usuario

Personas que integran equipo. Origen funcional: Gestión de miembros del equipo. Uso: Relacionar cuentas y equipo.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `equipo_usuario.id_equipo`: identificador del equipo de personas | I | [kontrol.sql:473](../../backend/kontrol.sql#L473); [bootstrap.js:441](../../backend/src/db/bootstrap.js#L441) | Clave generada o relación seleccionada | Pertenencia a equipo | R-MEM: sin TTL | SC |
| `equipo_usuario.id_usuario`: identificador de la persona/cuenta | I | [kontrol.sql:474](../../backend/kontrol.sql#L474); [bootstrap.js:442](../../backend/src/db/bootstrap.js#L442) | Cuenta/selección de operador | Pertenencia a equipo | R-MEM: sin TTL | SC |

### public.marketing_campaign

Campañas comerciales. Origen funcional: Formularios de marketing. Uso: Planificar campañas y atribuir cambios.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `marketing_campaign.id_campaign`: identificador de campaña | C | [kontrol.sql:492](../../backend/kontrol.sql#L492); [bootstrap.js:479](../../backend/src/db/bootstrap.js#L479) | Clave generada o relación seleccionada | Planificar campaña | R-DEL: sin TTL | SC |
| `marketing_campaign.id_empresa`: identificador del negocio | C | [kontrol.sql:493](../../backend/kontrol.sql#L493); [bootstrap.js:480](../../backend/src/db/bootstrap.js#L480) | Clave generada o relación seleccionada | Planificar campaña | R-DEL: sin TTL | SC |
| `marketing_campaign.id_proyecto`: identificador del proyecto | C | [kontrol.sql:494](../../backend/kontrol.sql#L494); [bootstrap.js:481](../../backend/src/db/bootstrap.js#L481) | Clave generada o relación seleccionada | Planificar campaña | R-DEL: sin TTL | SC |
| `marketing_campaign.name`: nombre de campaña | L/C | [kontrol.sql:495](../../backend/kontrol.sql#L495); [bootstrap.js:482](../../backend/src/db/bootstrap.js#L482) | Operador / valores de sistema | Planificar campaña | R-DEL: sin TTL | SC |
| `marketing_campaign.description`: descripción de texto libre | L/C | [kontrol.sql:496](../../backend/kontrol.sql#L496); [bootstrap.js:483](../../backend/src/db/bootstrap.js#L483) | Operador / valores de sistema | Planificar campaña | R-DEL: sin TTL | SC |
| `marketing_campaign.objective`: objetivo comercial de texto libre | L/C | [kontrol.sql:497](../../backend/kontrol.sql#L497); [bootstrap.js:484](../../backend/src/db/bootstrap.js#L484) | Operador / valores de sistema | Planificar campaña | R-DEL: sin TTL | SC |
| `marketing_campaign.channel`: canal comercial declarado | C | [kontrol.sql:498](../../backend/kontrol.sql#L498); [bootstrap.js:485](../../backend/src/db/bootstrap.js#L485) | Operador / valores de sistema | Planificar campaña | R-DEL: sin TTL | SC |
| `marketing_campaign.status`: estado del registro | C | [kontrol.sql:499](../../backend/kontrol.sql#L499); [bootstrap.js:486](../../backend/src/db/bootstrap.js#L486) | Operador / valores de sistema | Planificar campaña | R-DEL: sin TTL | SC |
| `marketing_campaign.start_date`: fecha de inicio de campaña | C | [kontrol.sql:500](../../backend/kontrol.sql#L500); [bootstrap.js:488](../../backend/src/db/bootstrap.js#L488) | Operador / valores de sistema | Planificar campaña | R-DEL: sin TTL | SC |
| `marketing_campaign.end_date`: fecha final de campaña | C | [kontrol.sql:501](../../backend/kontrol.sql#L501); [bootstrap.js:489](../../backend/src/db/bootstrap.js#L489) | Operador / valores de sistema | Planificar campaña | R-DEL: sin TTL | SC |
| `marketing_campaign.created_by`: identificador del autor | I | [kontrol.sql:502](../../backend/kontrol.sql#L502); [bootstrap.js:490](../../backend/src/db/bootstrap.js#L490) | Cuenta autenticada/servidor | Planificar campaña | R-DEL: sin TTL | SC |
| `marketing_campaign.updated_by`: identificador del último editor | I | [kontrol.sql:503](../../backend/kontrol.sql#L503); [bootstrap.js:491](../../backend/src/db/bootstrap.js#L491) | Cuenta autenticada/servidor | Planificar campaña | R-DEL: sin TTL | SC |
| `marketing_campaign.created_at`: fecha de creación atribuible | C | [kontrol.sql:504](../../backend/kontrol.sql#L504); [bootstrap.js:492](../../backend/src/db/bootstrap.js#L492) | Servidor/DDL y operación | Planificar campaña | R-DEL: sin TTL | SC |
| `marketing_campaign.updated_at`: fecha de última modificación atribuible | C | [kontrol.sql:505](../../backend/kontrol.sql#L505); [bootstrap.js:493](../../backend/src/db/bootstrap.js#L493) | Servidor/DDL y operación | Planificar campaña | R-DEL: sin TTL | SC |

### public.marketing_publication

Publicaciones y recursos. Origen funcional: Formulario y ciclo de estados de marketing. Uso: Planificar/registrar publicaciones; sin envío a redes observado.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `marketing_publication.id_publication`: identificador de publicación | C | [kontrol.sql:521](../../backend/kontrol.sql#L521); [bootstrap.js:520](../../backend/src/db/bootstrap.js#L520) | Clave generada o relación seleccionada | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.id_empresa`: identificador del negocio | C | [kontrol.sql:522](../../backend/kontrol.sql#L522); [bootstrap.js:521](../../backend/src/db/bootstrap.js#L521) | Clave generada o relación seleccionada | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.id_proyecto`: identificador del proyecto | C | [kontrol.sql:523](../../backend/kontrol.sql#L523); [bootstrap.js:522](../../backend/src/db/bootstrap.js#L522) | Clave generada o relación seleccionada | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.id_campaign`: identificador de campaña | C | [kontrol.sql:524](../../backend/kontrol.sql#L524); [bootstrap.js:523](../../backend/src/db/bootstrap.js#L523) | Clave generada o relación seleccionada | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.title`: título de texto libre | L/C | [kontrol.sql:525](../../backend/kontrol.sql#L525); [bootstrap.js:524](../../backend/src/db/bootstrap.js#L524) | Operador / valores de sistema | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.caption`: texto de publicación | L/C | [kontrol.sql:526](../../backend/kontrol.sql#L526); [bootstrap.js:525](../../backend/src/db/bootstrap.js#L525) | Operador / valores de sistema | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.asset_url`: URL del recurso gráfico/archivo | L/I | [kontrol.sql:527](../../backend/kontrol.sql#L527); [bootstrap.js:526](../../backend/src/db/bootstrap.js#L526) | Operador / valores de sistema | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.platform`: plataforma social declarada | C | [kontrol.sql:528](../../backend/kontrol.sql#L528); [bootstrap.js:527](../../backend/src/db/bootstrap.js#L527) | Operador / valores de sistema | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.publication_format`: formato de publicación | C | [kontrol.sql:529](../../backend/kontrol.sql#L529); [bootstrap.js:529](../../backend/src/db/bootstrap.js#L529) | Operador / valores de sistema | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.status`: estado del registro | C | [kontrol.sql:530](../../backend/kontrol.sql#L530); [bootstrap.js:531](../../backend/src/db/bootstrap.js#L531) | Operador / valores de sistema | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.scheduled_for`: fecha programada, sin ejecución automática de publicación observada | C | [kontrol.sql:531](../../backend/kontrol.sql#L531); [bootstrap.js:533](../../backend/src/db/bootstrap.js#L533) | Operador / valores de sistema | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.published_at`: fecha registrada de publicación | C | [kontrol.sql:532](../../backend/kontrol.sql#L532); [bootstrap.js:534](../../backend/src/db/bootstrap.js#L534) | Operador / valores de sistema | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.publication_url`: URL externa de la publicación | L/I | [kontrol.sql:533](../../backend/kontrol.sql#L533); [bootstrap.js:535](../../backend/src/db/bootstrap.js#L535) | Operador / valores de sistema | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.notes`: notas de texto libre | L/C | [kontrol.sql:534](../../backend/kontrol.sql#L534); [bootstrap.js:536](../../backend/src/db/bootstrap.js#L536) | Operador / valores de sistema | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.created_by`: identificador del autor | I | [kontrol.sql:535](../../backend/kontrol.sql#L535); [bootstrap.js:537](../../backend/src/db/bootstrap.js#L537) | Cuenta autenticada/servidor | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.updated_by`: identificador del último editor | I | [kontrol.sql:536](../../backend/kontrol.sql#L536); [bootstrap.js:538](../../backend/src/db/bootstrap.js#L538) | Cuenta autenticada/servidor | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.created_at`: fecha de creación atribuible | C | [kontrol.sql:537](../../backend/kontrol.sql#L537); [bootstrap.js:539](../../backend/src/db/bootstrap.js#L539) | Servidor/DDL y operación | Registro de publicación | R-DEL: sin TTL | SC |
| `marketing_publication.updated_at`: fecha de última modificación atribuible | C | [kontrol.sql:538](../../backend/kontrol.sql#L538); [bootstrap.js:540](../../backend/src/db/bootstrap.js#L540) | Servidor/DDL y operación | Registro de publicación | R-DEL: sin TTL | SC |

### public.marketing_item

Piezas, borradores e integración declarada. Origen funcional: Formulario o generador local de reglas. Uso: Guardar contenido comercial y sus referencias.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `marketing_item.id_marketing_item`: identificador de pieza de marketing | C | [kontrol.sql:565](../../backend/kontrol.sql#L565); [bootstrap.js:586](../../backend/src/db/bootstrap.js#L586) | Clave generada o relación seleccionada | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.id_empresa`: identificador del negocio | C | [kontrol.sql:566](../../backend/kontrol.sql#L566); [bootstrap.js:587](../../backend/src/db/bootstrap.js#L587) | Clave generada o relación seleccionada | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.id_proyecto`: identificador del proyecto | C | [kontrol.sql:567](../../backend/kontrol.sql#L567); [bootstrap.js:588](../../backend/src/db/bootstrap.js#L588) | Clave generada o relación seleccionada | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.id_campaign`: identificador de campaña | C | [kontrol.sql:568](../../backend/kontrol.sql#L568); [bootstrap.js:589](../../backend/src/db/bootstrap.js#L589) | Clave generada o relación seleccionada | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.title`: título de texto libre | L/C | [kontrol.sql:569](../../backend/kontrol.sql#L569); [bootstrap.js:590](../../backend/src/db/bootstrap.js#L590) | Operador / valores de sistema | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.description`: descripción de texto libre | L/C | [kontrol.sql:570](../../backend/kontrol.sql#L570); [bootstrap.js:591](../../backend/src/db/bootstrap.js#L591) | Operador / valores de sistema | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.content`: contenido de texto libre | L/C | [kontrol.sql:571](../../backend/kontrol.sql#L571); [bootstrap.js:592](../../backend/src/db/bootstrap.js#L592) | Operador / valores de sistema | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.status`: estado del registro | C | [kontrol.sql:572](../../backend/kontrol.sql#L572); [bootstrap.js:593](../../backend/src/db/bootstrap.js#L593) | Operador / valores de sistema | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.content_type`: tipo de pieza | C | [kontrol.sql:573](../../backend/kontrol.sql#L573); [bootstrap.js:595](../../backend/src/db/bootstrap.js#L595) | Operador / valores de sistema | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.marketing_date`: fecha comercial de la pieza | C | [kontrol.sql:574](../../backend/kontrol.sql#L574); [bootstrap.js:597](../../backend/src/db/bootstrap.js#L597) | Operador / valores de sistema | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.resource_link`: URL externa de recurso | L/I | [kontrol.sql:575](../../backend/kontrol.sql#L575); [bootstrap.js:598](../../backend/src/db/bootstrap.js#L598) | Operador / valores de sistema | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.origin_type`: origen manual o generador de reglas | C | [kontrol.sql:576](../../backend/kontrol.sql#L576); [bootstrap.js:599](../../backend/src/db/bootstrap.js#L599) | Operador / valores de sistema | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.integration_provider`: proveedor de origen declarado | C | [kontrol.sql:577](../../backend/kontrol.sql#L577); [bootstrap.js:601](../../backend/src/db/bootstrap.js#L601) | Operador / valores de sistema | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.integration_reference`: referencia externa declarada | L/I | [kontrol.sql:578](../../backend/kontrol.sql#L578); [bootstrap.js:602](../../backend/src/db/bootstrap.js#L602) | Operador / valores de sistema | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.integration_metadata`: JSON abierto con datos externos arbitrarios | L/C | [kontrol.sql:579](../../backend/kontrol.sql#L579); [bootstrap.js:603](../../backend/src/db/bootstrap.js#L603) | Operador / valores de sistema | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.created_by`: identificador del autor | I | [kontrol.sql:580](../../backend/kontrol.sql#L580); [bootstrap.js:604](../../backend/src/db/bootstrap.js#L604) | Cuenta autenticada/servidor | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.updated_by`: identificador del último editor | I | [kontrol.sql:581](../../backend/kontrol.sql#L581); [bootstrap.js:605](../../backend/src/db/bootstrap.js#L605) | Cuenta autenticada/servidor | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.created_at`: fecha de creación atribuible | C | [kontrol.sql:582](../../backend/kontrol.sql#L582); [bootstrap.js:606](../../backend/src/db/bootstrap.js#L606) | Servidor/DDL y operación | Contenido de marketing | R-DEL: sin TTL | SC |
| `marketing_item.updated_at`: fecha de última modificación atribuible | C | [kontrol.sql:583](../../backend/kontrol.sql#L583); [bootstrap.js:607](../../backend/src/db/bootstrap.js#L607) | Servidor/DDL y operación | Contenido de marketing | R-DEL: sin TTL | SC |

### public.marketing_publication_metric_snapshot

Métricas de publicaciones. Origen funcional: Ingreso manual de métricas. Uso: Registrar resultados comerciales y autoría.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `marketing_publication_metric_snapshot.id_metric_snapshot`: identificador de medición | C | [kontrol.sql:598](../../backend/kontrol.sql#L598); [bootstrap.js:637](../../backend/src/db/bootstrap.js#L637) | Clave generada o relación seleccionada | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.id_publication`: identificador de publicación | C | [kontrol.sql:599](../../backend/kontrol.sql#L599); [bootstrap.js:638](../../backend/src/db/bootstrap.js#L638) | Clave generada o relación seleccionada | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.captured_at`: fecha de la medición | C | [kontrol.sql:600](../../backend/kontrol.sql#L600); [bootstrap.js:639](../../backend/src/db/bootstrap.js#L639) | Operador / valores de sistema | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.impressions`: cantidad de impresiones | C | [kontrol.sql:601](../../backend/kontrol.sql#L601); [bootstrap.js:640](../../backend/src/db/bootstrap.js#L640) | Operador / valores de sistema | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.reach`: alcance agregado registrado | C | [kontrol.sql:602](../../backend/kontrol.sql#L602); [bootstrap.js:641](../../backend/src/db/bootstrap.js#L641) | Operador / valores de sistema | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.likes`: cantidad de reacciones | C | [kontrol.sql:603](../../backend/kontrol.sql#L603); [bootstrap.js:642](../../backend/src/db/bootstrap.js#L642) | Operador / valores de sistema | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.comments`: cantidad de comentarios; no sus textos | C | [kontrol.sql:604](../../backend/kontrol.sql#L604); [bootstrap.js:643](../../backend/src/db/bootstrap.js#L643) | Operador / valores de sistema | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.shares`: cantidad de compartidos | C | [kontrol.sql:605](../../backend/kontrol.sql#L605); [bootstrap.js:644](../../backend/src/db/bootstrap.js#L644) | Operador / valores de sistema | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.saves`: cantidad de guardados | C | [kontrol.sql:606](../../backend/kontrol.sql#L606); [bootstrap.js:645](../../backend/src/db/bootstrap.js#L645) | Operador / valores de sistema | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.clicks`: cantidad de clics | C | [kontrol.sql:607](../../backend/kontrol.sql#L607); [bootstrap.js:646](../../backend/src/db/bootstrap.js#L646) | Operador / valores de sistema | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.leads`: cantidad agregada de leads; no nombres estructurados | C | [kontrol.sql:608](../../backend/kontrol.sql#L608); [bootstrap.js:647](../../backend/src/db/bootstrap.js#L647) | Operador / valores de sistema | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.followers_gained`: cantidad de seguidores ganados | C | [kontrol.sql:609](../../backend/kontrol.sql#L609); [bootstrap.js:648](../../backend/src/db/bootstrap.js#L648) | Operador / valores de sistema | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.spend`: gasto de campaña | C | [kontrol.sql:610](../../backend/kontrol.sql#L610); [bootstrap.js:649](../../backend/src/db/bootstrap.js#L649) | Operador / valores de sistema | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.notes`: notas de texto libre | L/C | [kontrol.sql:611](../../backend/kontrol.sql#L611); [bootstrap.js:650](../../backend/src/db/bootstrap.js#L650) | Operador / valores de sistema | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.created_by`: identificador del autor | I | [kontrol.sql:612](../../backend/kontrol.sql#L612); [bootstrap.js:651](../../backend/src/db/bootstrap.js#L651) | Cuenta autenticada/servidor | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.created_at`: fecha de creación atribuible | C | [kontrol.sql:613](../../backend/kontrol.sql#L613); [bootstrap.js:652](../../backend/src/db/bootstrap.js#L652) | Servidor/DDL y operación | Medición y autoría | R-DEL: sin TTL | SC |
| `marketing_publication_metric_snapshot.updated_at`: fecha de última modificación atribuible | C | [kontrol.sql:614](../../backend/kontrol.sql#L614); [bootstrap.js:653](../../backend/src/db/bootstrap.js#L653) | Servidor/DDL y operación | Medición y autoría | R-DEL: sin TTL | SC |

### public.proyecto_invitacion

Invitaciones a proyectos. Origen funcional: Servidor y persona que invita. Uso: Conceder membresía y permisos al aceptar enlace.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `proyecto_invitacion.id_invitacion`: identificador del enlace de invitación | I | [bootstrap.js:40](../../backend/src/db/bootstrap.js#L40) | Clave generada o relación seleccionada | Invitar a proyecto | R-INV: sin TTL | SC |
| `proyecto_invitacion.id_empresa`: identificador del negocio | I | [bootstrap.js:41](../../backend/src/db/bootstrap.js#L41) | Clave generada o relación seleccionada | Invitar a proyecto | R-INV: sin TTL | SC |
| `proyecto_invitacion.id_proyecto`: identificador del proyecto | I | [bootstrap.js:42](../../backend/src/db/bootstrap.js#L42) | Clave generada o relación seleccionada | Invitar a proyecto | R-INV: sin TTL | SC |
| `proyecto_invitacion.token`: secreto de invitación reutilizable mientras esté activo | S | [bootstrap.js:43](../../backend/src/db/bootstrap.js#L43) | Servidor / valor DDL | Invitar a proyecto | R-INV: sin TTL | SC |
| `proyecto_invitacion.id_usuario_invitador`: identificador de quien invita | I | [bootstrap.js:44](../../backend/src/db/bootstrap.js#L44) | Cuenta autenticada/servidor | Invitar a proyecto | R-INV: sin TTL | SC |
| `proyecto_invitacion.activa`: estado del enlace | I | [bootstrap.js:45](../../backend/src/db/bootstrap.js#L45) | Operador / valores de sistema | Invitar a proyecto | R-INV: sin TTL | SC |
| `proyecto_invitacion.creada_en`: fecha de creación del enlace | I | [bootstrap.js:46](../../backend/src/db/bootstrap.js#L46) | Servidor/DDL y operación | Invitar a proyecto | R-INV: sin TTL | SC |
| `proyecto_invitacion.desactivada_en`: fecha de desactivación del enlace | I | [bootstrap.js:47](../../backend/src/db/bootstrap.js#L47) | Servidor/DDL y operación | Invitar a proyecto | R-INV: sin TTL | SC |
| `proyecto_invitacion.ultimo_uso_en`: fecha de último uso del enlace | I | [bootstrap.js:48](../../backend/src/db/bootstrap.js#L48) | Servidor/DDL y operación | Invitar a proyecto | R-INV: sin TTL | SC |

### public.proyecto_invitacion_permiso

Permisos concedidos por enlace. Origen funcional: Gestión de invitación. Uso: Resolver permisos de quien acepte.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `proyecto_invitacion_permiso.id_invitacion`: identificador del enlace de invitación | I | [bootstrap.js:60](../../backend/src/db/bootstrap.js#L60) | Clave generada o relación seleccionada | Permisos del enlace | R-INV: sin TTL | SC |
| `proyecto_invitacion_permiso.id_permiso_proyecto`: identificador de permiso de proyecto | I | [bootstrap.js:61](../../backend/src/db/bootstrap.js#L61) | Clave generada o relación seleccionada | Permisos del enlace | R-INV: sin TTL | SC |

### public.project_progress_entry

Avances y bloqueos. Origen funcional: Formulario de avances y autor autenticado. Uso: Registrar progreso, fechas y responsable.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `project_progress_entry.id_progress_entry`: identificador de avance | I | [bootstrap.js:83](../../backend/src/db/bootstrap.js#L83) | Clave generada o relación seleccionada | Progreso y autoría | R-DEL: sin TTL | SC |
| `project_progress_entry.id_proyecto`: identificador del proyecto | I | [bootstrap.js:84](../../backend/src/db/bootstrap.js#L84) | Clave generada o relación seleccionada | Progreso y autoría | R-DEL: sin TTL | SC |
| `project_progress_entry.id_usuario`: identificador de la persona/cuenta | I | [bootstrap.js:85](../../backend/src/db/bootstrap.js#L85) | Cuenta/selección de operador | Progreso y autoría | R-DEL: sin TTL | SC |
| `project_progress_entry.title`: título de texto libre | L/C | [bootstrap.js:86](../../backend/src/db/bootstrap.js#L86) | Operador / valores de sistema | Progreso y autoría | R-DEL: sin TTL | SC |
| `project_progress_entry.details`: detalle de avance/bloqueo de texto libre | L/C | [bootstrap.js:87](../../backend/src/db/bootstrap.js#L87) | Operador / valores de sistema | Progreso y autoría | R-DEL: sin TTL | SC |
| `project_progress_entry.update_type`: tipo de avance | I | [bootstrap.js:88](../../backend/src/db/bootstrap.js#L88) | Operador / valores de sistema | Progreso y autoría | R-DEL: sin TTL | SC |
| `project_progress_entry.progress_percentage`: porcentaje de progreso | I | [bootstrap.js:89](../../backend/src/db/bootstrap.js#L89) | Operador / valores de sistema | Progreso y autoría | R-DEL: sin TTL | SC |
| `project_progress_entry.happened_at`: fecha declarada del hecho | I | [bootstrap.js:90](../../backend/src/db/bootstrap.js#L90) | Operador / valores de sistema | Progreso y autoría | R-DEL: sin TTL | SC |
| `project_progress_entry.created_at`: fecha de creación atribuible | I | [bootstrap.js:91](../../backend/src/db/bootstrap.js#L91) | Servidor/DDL y operación | Progreso y autoría | R-DEL: sin TTL | SC |
| `project_progress_entry.updated_at`: fecha de última modificación atribuible | I | [bootstrap.js:92](../../backend/src/db/bootstrap.js#L92) | Servidor/DDL y operación | Progreso y autoría | R-DEL: sin TTL | SC |

### public.integracion

Conexiones externas por negocio. Origen funcional: Administrador configura credenciales y opciones. Uso: Enviar alertas a destinos habilitados.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `integracion.id_integracion`: identificador de integración | I | [bootstrap.js:111](../../backend/src/db/bootstrap.js#L111) | Clave generada o relación seleccionada | Conectar notificaciones | R-INT: sin TTL | SC |
| `integracion.id_empresa`: identificador del negocio | I | [bootstrap.js:112](../../backend/src/db/bootstrap.js#L112) | Clave generada o relación seleccionada | Conectar notificaciones | R-INT: sin TTL | SC |
| `integracion.slug`: nombre técnico de integración | I | [bootstrap.js:113](../../backend/src/db/bootstrap.js#L113) | Operador / valores de sistema | Conectar notificaciones | R-INT: sin TTL | SC |
| `integracion.status`: estado del registro | I | [bootstrap.js:114](../../backend/src/db/bootstrap.js#L114) | Operador / valores de sistema | Conectar notificaciones | R-INT: sin TTL | SC |
| `integracion.credentials_enc`: JSON cifrado de credenciales, teléfonos y destinos | S/D | [bootstrap.js:116](../../backend/src/db/bootstrap.js#L116) | Administrador → cifrado | Conectar notificaciones | R-INT: sin TTL | AES |
| `integracion.config`: JSON abierto de configuración | L/C | [bootstrap.js:117](../../backend/src/db/bootstrap.js#L117) | Operador / valores de sistema | Conectar notificaciones | R-INT: sin TTL | SC |
| `integracion.creado_por`: identificador de quien configuró la integración | I | [bootstrap.js:118](../../backend/src/db/bootstrap.js#L118) | Cuenta autenticada/servidor | Conectar notificaciones | R-INT: sin TTL | SC |
| `integracion.created_at`: fecha de creación atribuible | I | [bootstrap.js:119](../../backend/src/db/bootstrap.js#L119) | Servidor/DDL y operación | Conectar notificaciones | R-INT: sin TTL | SC |
| `integracion.updated_at`: fecha de última modificación atribuible | I | [bootstrap.js:120](../../backend/src/db/bootstrap.js#L120) | Servidor/DDL y operación | Conectar notificaciones | R-INT: sin TTL | SC |

### public.integracion_log

Resultado de envíos externos. Origen funcional: notificationService en cada despacho. Uso: Diagnosticar integración y estado de envío.

| Campo y qué contiene | Clase | Dónde / evidencia | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL |
| --- | --- | --- | --- | --- | --- | --- |
| `integracion_log.id_log`: identificador del evento de integración | I | [bootstrap.js:131](../../backend/src/db/bootstrap.js#L131) | Resultado de despacho | Diagnóstico de envíos | R-LOG: sin TTL | SC |
| `integracion_log.id_empresa`: identificador del negocio | I | [bootstrap.js:132](../../backend/src/db/bootstrap.js#L132) | Resultado de despacho | Diagnóstico de envíos | R-LOG: sin TTL | SC |
| `integracion_log.slug`: nombre técnico de integración | I | [bootstrap.js:133](../../backend/src/db/bootstrap.js#L133) | Resultado de despacho | Diagnóstico de envíos | R-LOG: sin TTL | SC |
| `integracion_log.event`: nombre del evento enviado | I | [bootstrap.js:134](../../backend/src/db/bootstrap.js#L134) | Resultado de despacho | Diagnóstico de envíos | R-LOG: sin TTL | SC |
| `integracion_log.status`: estado del registro | I | [bootstrap.js:135](../../backend/src/db/bootstrap.js#L135) | Resultado de despacho | Diagnóstico de envíos | R-LOG: sin TTL | SC |
| `integracion_log.error_msg`: mensaje de error, posible eco de datos externos | I | [bootstrap.js:136](../../backend/src/db/bootstrap.js#L136) | Resultado de despacho | Diagnóstico de envíos | R-LOG: sin TTL | SC |
| `integracion_log.created_at`: fecha de creación atribuible | I | [bootstrap.js:137](../../backend/src/db/bootstrap.js#L137) | Resultado de despacho | Diagnóstico de envíos | R-LOG: sin TTL | SC |

## 3. DDL dinámico, migraciones, relaciones y drift

### Bootstrap e inline

No se encontró un directorio propio de migraciones versionadas independiente: la evolución observada está en `ensureDatabaseSchema()`, que se llama al arrancar fuera de NODE_ENV=test. El SQL montado por Docker y el bootstrap no son equivalentes: CREATE IF NOT EXISTS no convierte por sí solo una tabla antigua al esquema de una instalación nueva. [Arranque](../../backend/src/index.js#L63), [volumen de inicialización](../../docker-compose.prod.yml#L8), [migraciones inline](../../backend/src/db/bootstrap.js#L670).

| Fuente | Objeto/campos cubiertos | Persistencia y efecto observado |
| --- | --- | --- |
| Bootstrap: tablas adicionales | `proyecto_invitacion`, `proyecto_invitacion_permiso`, `project_progress_entry`, `integracion`, `integracion_log`: todos los campos están en §2 | Persistentes; no se deben omitir por no figurar en kontrol.sql. |
| Bootstrap: cierre de empresa (P-1, 26-10-2026) | `company_closure(company_id, company_name, reason, requested_by, requested_at, export_until, delete_by, backups_by, status, file_keys, rows_deleted, files_deleted, assistant_documents_deleted, sql_deleted_at, files_deleted_at, mongo_deleted_at, deleted_at, attempts, available_at, locked_until)` | Constancia del cierre: sobrevive a la empresa, sin FK a `empresa` y sin columna `id_empresa` para quedar fuera de la exportación y del borrado. Conserva nombre de la empresa, identificador de quien la cerró, fechas y conteos; `file_keys` guarda claves de Cloudinary solo hasta borrarlas. Sin plazo de purga propio. |
| Bootstrap: ADD COLUMN | `empresa.activo`, `movimiento_inventario.id_actividad/costo_unitario_venta/id_venta/descuento_linea/iva_linea`, `producto.codigo_barras`, `proveedor.id_empresa`, `empresa_config.moneda`, `reporte.id_empresa`, `proyecto.id_equipo`, `evidencia.public_id/id_progress_entry` | Todos incluidos en §2; no hay otros ADD COLUMN propios encontrados en la búsqueda de backend/src, backend/scripts y volume/sql. |
| Bootstrap: cambios de estructura/valores | Reporte admite id_proyecto nulo y backfill de empresa; marketing_publication admite campaña opcional, transforma estados y reconstruye checks/relaciones | Cambian significado/validación de datos existentes. No son TTL ni suprimen identidad. |
| `agentSql.createTempView` | 24 vistas: `rol`, `permiso_empresa`, `permiso_proyecto`, `rol_empresa`, `empresa`, `empresa_usuario`, `categoria`, `proyecto`, `rol_proyecto`, `rol_proyecto_permiso`, `proyecto_usuario`, `proyecto_usuario_permiso`, `usuario`, `producto`, `producto_proveedor`, `proveedor`, `movimiento_inventario`, `tarea`, `asignacion`, `evidencia`, `presupuesto_actividad`, `presupuesto_ajuste`, `reporte`, `project_progress_entry` | CREATE OR REPLACE TEMP VIEW y GRANT SELECT a kontrol_agent dentro de la transacción de la consulta; se eliminan antes del COMMIT y un rollback también revierte su creación. Seleccionan las columnas de §2, salvo usuario: solo id_usuario, nombre, apellido, email, telefono, id_rol, activo. Los IDs del ámbito se usan solo durante esa transacción. No hay copia materializada ni borrado de tablas de negocio. |
| `ensureAgentRole` | Rol PostgreSQL `kontrol_agent` NOLOGIN y membresía al usuario de conexión | Metadatos de autorización, no tabla de datos personales adicional. Permisos reales instalados no inspeccionados. |
| `volume/sql/populate.sql` | `vol_hot(id_proyecto,id_empresa)`; `vol_cold(idx,id_proyecto,id_empresa)`; `vol_cold_ext(idx,id_proyecto,id_empresa)` | Temporales de sesión para reparto de datos de prueba; C/I. Sin cifrado de campo observado. |
| Mismo script | `vol_prod(is_hot,idx,id_producto,id_proyecto,id_empresa,precio_venta,precio_costo)`; `vol_sale(id_empresa,idx,n,id_venta)` | Temporales ON COMMIT DROP; índices de selección/reparto, no TTL. |
| Mismo script | `vol_mov(tipo,cantidad,precio_unitario,fecha,motivo,id_empresa,id_producto,id_usuario,id_proyecto,costo_unitario_venta,id_venta)`; `vol_emp_proj(idx,id_proyecto,n)` | Temporales ON COMMIT DROP; C e I, incluidos autores. EXECUTE format inserta datos de prueba en movimiento_inventario con/sin id_venta según esquema; no crea otra tabla persistente. |
| Mismo script | `pg_temp.vol_missing(total,share,have,hot)` | Función de cálculo temporal, sin almacenamiento propio de personas. |
| Seed/reset/bench | Inserts, actualizaciones, limpieza de datos y resultados de prueba | No añaden tablas persistentes propias. Reset hace TRUNCATE usuario/empresa CASCADE y vuelve a sembrar; es herramienta destructiva de test, no mecanismo de derechos de usuarios. |

Fuentes: [bootstrap completo](../../backend/src/db/bootstrap.js#L5), [ADD proveedor](../../backend/src/db/bootstrap.js#L249), [reporte](../../backend/src/db/bootstrap.js#L384), [marketing](../../backend/src/db/bootstrap.js#L670), [vistas](../../backend/src/services/agentSql.js#L69), [rol](../../backend/src/db/bootstrap.js#L819), [temporales iniciales](../../volume/sql/populate.sql#L77), [temporales de movimientos](../../volume/sql/populate.sql#L207), [temporal de reportes](../../volume/sql/populate.sql#L363), [reset](../../backend/src/db/reset.js#L37), [bench](../../backend/scripts/bench-dashboard.js#L148).

### ON DELETE no equivale a política de retención

| Acción declarada | Relaciones que la usan | Qué conserva o elimina |
| --- | --- | --- |
| CASCADE desde empresa | `empresa_config.id_empresa`, `reporte.id_empresa`, `equipo.id_empresa`, `marketing_item.id_empresa`, `integracion.id_empresa`, `integracion_log.id_empresa` | Solo opera si se ejecuta y permite DELETE del padre. No elimina archivos externos ni mensajes Mongo. |
| CASCADE desde proyecto | `presupuesto_ajuste.id_proyecto`, `project_progress_entry.id_proyecto`; FKs compuestas `marketing_campaign(id_empresa,id_proyecto)`, `marketing_publication(id_empresa,id_proyecto)`, `marketing_item(id_empresa,id_proyecto)` | Elimina hijos relacionados dentro de PostgreSQL; otras FKs pueden impedir borrar el proyecto. |
| CASCADE en membresía/métrica | `equipo_usuario.id_equipo` y `.id_usuario`; `marketing_publication_metric_snapshot.id_publication` | Eliminación relacional limitada a esas filas. |
| SET NULL | `proyecto.id_equipo`, `movimiento_inventario.id_actividad`, `evidencia.id_progress_entry` | Conserva la fila hija, con el vínculo indicado nulo; no borra contenido ni autor. |
| RESTRICT explícito | Campaña referenciada por `marketing_publication(id_empresa,id_campaign)` y `marketing_item(id_empresa,id_campaign)` | Impide borrar campaña mientras existan esos hijos. |
| Sin ON DELETE explícito (NO ACTION del DDL) | Resto de FKs declaradas: usuario→rol; categoria/proveedor→empresa; rol_empresa_permiso→catálogos; empresa_usuario→empresa/usuario/rol; invitaciones→empresa/proyecto/usuario y sus permisos→invitación/catálogo; proyecto→empresa/encargado; rol_proyecto y sus permisos; proyecto_usuario y proyecto_usuario_permiso; producto→categoría/proyecto; producto_proveedor→producto/proveedor; presupuesto_actividad→proyecto; venta→empresa/usuario; movimiento→producto-proyecto/venta/proyecto-empresa/usuario/proveedor; tarea→proyecto; asignacion→tarea-proyecto/miembro-proyecto; evidencia→tarea/usuario; presupuesto_ajuste/reporte→usuario y reporte→proyecto; equipo→líder; marketing→usuarios autores/editores | Una referencia puede bloquear el borrado. No existe cascada universal por borrar usuario o empresa, ni sincronización automática con Mongo/Cloudinary. |

El detalle de las relaciones procede de [SQL base](../../backend/kontrol.sql#L21), [equipo/marketing](../../backend/kontrol.sql#L459), [bootstrap adicional](../../backend/src/db/bootstrap.js#L39) y [relación evidencia-avance](../../backend/src/db/bootstrap.js#L783). `reporte.id_empresa` puede ser nulo según DDL y el código usa COALESCE con proyecto para registros anteriores. [Reportes](../../backend/src/controllers/reportsController.js#L3).

### Índices y estado real pendiente

En PostgreSQL hay PK, UNIQUE e índices de consulta; no se observa mecanismo de expiración de filas por esos índices. Los índices parciales de invitación (`activa=true`) restringen enlaces activos; `producto_codigo_barras_unique` evita duplicados dentro de proyecto cuando el código no es NULL. Ninguno es una purga. Las fechas de eventos tampoco son fechas automáticas de borrado. [Invitación](../../backend/kontrol.sql#L126), [código de barras](../../backend/kontrol.sql#L211), [índices bootstrap](../../backend/src/db/bootstrap.js#L28).

Drift pendiente: comparar información_schema.columns, pg_constraint (incluido convalidated), pg_indexes y definiciones reales contra §2/§3, sin exportar filas de personas. Bootstrap añade `proveedor.id_empresa` nullable en instalaciones anteriores y FK NOT VALID; las FKs compuestas migradas de marketing_publication también pueden quedar NOT VALID para filas heredadas. No se puede afirmar que todos los datos existentes cumplen esas relaciones. La tabla nueva declara restricciones más fuertes que ciertas migraciones. [Proveedor](../../backend/src/db/bootstrap.js#L246), [marketing heredado](../../backend/src/db/bootstrap.js#L735).

## 4. MongoDB: todos los campos declarados e implícitos

Colecciones de conversaciones humanas separadas de las del agente. `conversations` y `messages` son nombres derivados por Mongoose de los modelos; no se consultó Mongo para confirmar nombres instalados. `agent_conversations` y `agent_messages` sí están fijados expresamente. Las rutas siguientes incluyen hojas de subdocumentos, claves de mapas, arrays e implícitos `_id`, `__v`, `createdAt`, `updatedAt`. Los subdocumentos de participantes, último mensaje, adjuntos y queries desactivan su propio _id. [Modelos](../../backend/src/models/Conversation.js#L1), [valores implícitos de Mongoose local](../../node_modules/mongoose/lib/schema.js#L622).

**M0:** persistencia Mongo sin TTL observado, sin cifrado de campo; at-rest/retención del servicio no comprobados. **MA:** igual que M0, con DELETE explícito de conversación IA (mensajes y cabecera) o de mensaje IA; no borra logs ni copias en inferencia. No se observan hooks de borrado entre PostgreSQL y estos modelos. Comentarios sobre “pruning on user delete” no prueban una implementación: la baja observada de usuario es soft delete. [Modelos IA](../../backend/src/models/AgentMessage.js#L9), [borrado IA](../../backend/src/controllers/agentController.js#L258), [baja usuario](../../backend/src/controllers/userController.js#L214).

### conversations

| Campo completo | Clase | Qué contiene | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL / fuente |
| --- | --- | --- | --- | --- | --- | --- |
| `conversations._id` | I | Identificador del hilo | Mongo/Mongoose | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:17](../../backend/src/models/Conversation.js#L17) |
| `conversations.__v` | I | Versión interna del documento | Mongoose | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:17](../../backend/src/models/Conversation.js#L17) |
| `conversations.type` | I | Tipo dm | Servidor | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:18](../../backend/src/models/Conversation.js#L18) |
| `conversations.participants[]` | I | IDs PostgreSQL de participantes | Inicio de conversación | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:20](../../backend/src/models/Conversation.js#L20) |
| `conversations.participantInfo[].id` | I | ID de persona duplicado | PostgreSQL → Mongo | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:4](../../backend/src/models/Conversation.js#L4) |
| `conversations.participantInfo[].nombre` | D | Nombre duplicado del participante | PostgreSQL → Mongo | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:5](../../backend/src/models/Conversation.js#L5) |
| `conversations.participantInfo[].email` | D | Correo duplicado | PostgreSQL → Mongo | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:6](../../backend/src/models/Conversation.js#L6) |
| `conversations.participantInfo[].avatar` | I | Iniciales calculadas, no foto de perfil | Nombre/apellido → servidor | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:7](../../backend/src/models/Conversation.js#L7) |
| `conversations.lastMessage.text` | L/I | Vista previa de texto/adjunto | Servidor al enviar | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:11](../../backend/src/models/Conversation.js#L11) |
| `conversations.lastMessage.senderId` | I | ID de quien envió el último mensaje | Servidor | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:12](../../backend/src/models/Conversation.js#L12) |
| `conversations.lastMessage.type` | I | text/image/audio/file/video | Servidor | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:13](../../backend/src/models/Conversation.js#L13) |
| `conversations.lastMessage.createdAt` | I | Fecha del último mensaje | Servidor | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:14](../../backend/src/models/Conversation.js#L14) |
| `conversations.unreadCounts.<userId>` | I | Clave ID de persona y contador de no leídos | Envío/lectura | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:24](../../backend/src/models/Conversation.js#L24) |
| `conversations.createdAt` | I | Fecha de creación del hilo | timestamps Mongoose | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:25](../../backend/src/models/Conversation.js#L25) |
| `conversations.updatedAt` | I | Fecha de modificación del hilo | timestamps Mongoose | Conversación, entrega y lectura | M0: sin TTL | SC; [Conversation.js:25](../../backend/src/models/Conversation.js#L25) |

### messages

| Campo completo | Clase | Qué contiene | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL / fuente |
| --- | --- | --- | --- | --- | --- | --- |
| `messages._id` | I | Identificador del mensaje | Mongo/Mongoose | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:15](../../backend/src/models/Message.js#L15) |
| `messages.__v` | I | Versión interna del documento | Mongoose | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:15](../../backend/src/models/Message.js#L15) |
| `messages.conversationId` | I | Referencia al hilo | Socket autenticado | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:16](../../backend/src/models/Message.js#L16) |
| `messages.senderId` | I | ID de quien envía | Cuenta autenticada | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:22](../../backend/src/models/Message.js#L22) |
| `messages.senderName` | D | Nombre/apellido desnormalizado | PostgreSQL → servidor | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:23](../../backend/src/models/Message.js#L23) |
| `messages.senderAvatar` | I | Iniciales calculadas | PostgreSQL → servidor | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:24](../../backend/src/models/Message.js#L24) |
| `messages.text` | L | Texto libre del mensaje | Persona que escribe | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:25](../../backend/src/models/Message.js#L25) |
| `messages.attachments[].type` | I | Tipo image/audio/file/video | Carga/cliente saneado | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:4](../../backend/src/models/Message.js#L4) |
| `messages.attachments[].url` | L/I | URL del archivo | Cloudinary o descriptor recibido | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:5](../../backend/src/models/Message.js#L5) |
| `messages.attachments[].publicId` | I | Clave `tipo:public_id` del archivo en Cloudinary | Cliente | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:6](../../backend/src/models/Message.js#L6) |
| `messages.attachments[].filename` | L/I | Nombre original; puede identificar personas | Archivo del usuario | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:7](../../backend/src/models/Message.js#L7) |
| `messages.attachments[].size` | I | Tamaño en bytes | Archivo/cliente | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:8](../../backend/src/models/Message.js#L8) |
| `messages.attachments[].mimeType` | I | Tipo MIME | Archivo/cliente | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:9](../../backend/src/models/Message.js#L9) |
| `messages.attachments[].duration` | I | Duración de audio/video | Descriptor del cliente | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:10](../../backend/src/models/Message.js#L10) |
| `messages.attachments[].width` | I | Ancho de imagen/video | Descriptor del cliente | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:11](../../backend/src/models/Message.js#L11) |
| `messages.attachments[].height` | I | Alto de imagen/video | Descriptor del cliente | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:12](../../backend/src/models/Message.js#L12) |
| `messages.readBy[]` | I | IDs de personas que lo leyeron | Envío/marcado de lectura | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:27](../../backend/src/models/Message.js#L27) |
| `messages.createdAt` | I | Fecha de envío persistida | timestamps Mongoose | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:28](../../backend/src/models/Message.js#L28) |
| `messages.updatedAt` | I | Fecha de modificación/lectura persistida | timestamps Mongoose | Conversación, entrega y lectura | M0: sin TTL | SC; [Message.js:28](../../backend/src/models/Message.js#L28) |

### agent_conversations

| Campo completo | Clase | Qué contiene | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL / fuente |
| --- | --- | --- | --- | --- | --- | --- |
| `agent_conversations._id` | I | Identificador del hilo IA | Mongo/Mongoose | Historial/autoría IA | MA: sin TTL | SC; [AgentConversation.js:9](../../backend/src/models/AgentConversation.js#L9) |
| `agent_conversations.__v` | I | Versión interna | Mongoose | Historial/autoría IA | MA: sin TTL | SC; [AgentConversation.js:9](../../backend/src/models/AgentConversation.js#L9) |
| `agent_conversations.userId` | I | Propietario, ID PostgreSQL | Cuenta autenticada | Historial/autoría IA | MA: sin TTL | SC; [AgentConversation.js:11](../../backend/src/models/AgentConversation.js#L11) |
| `agent_conversations.empresaId` | I/C | Empresa del hilo | Empresa seleccionada | Historial/autoría IA | MA: sin TTL | SC; [AgentConversation.js:13](../../backend/src/models/AgentConversation.js#L13) |
| `agent_conversations.title` | L | Título derivado del primer mensaje; truncado a 60 caracteres | Servidor/persona | Historial/autoría IA | MA: sin TTL | SC; [AgentConversation.js:14](../../backend/src/models/AgentConversation.js#L14) |
| `agent_conversations.lastMessageAt` | I | Fecha del último intercambio | Servidor | Historial/autoría IA | MA: sin TTL | SC; [AgentConversation.js:15](../../backend/src/models/AgentConversation.js#L15) |
| `agent_conversations.createdAt` | I | Fecha de creación | timestamps Mongoose | Historial/autoría IA | MA: sin TTL | SC; [AgentConversation.js:17](../../backend/src/models/AgentConversation.js#L17) |
| `agent_conversations.updatedAt` | I | Fecha de modificación | timestamps Mongoose | Historial/autoría IA | MA: sin TTL | SC; [AgentConversation.js:17](../../backend/src/models/AgentConversation.js#L17) |

### agent_messages

| Campo completo | Clase | Qué contiene | Origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL / fuente |
| --- | --- | --- | --- | --- | --- | --- |
| `agent_messages._id` | I | Identificador del mensaje IA | Mongo/Mongoose | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:16](../../backend/src/models/AgentMessage.js#L16) |
| `agent_messages.__v` | I | Versión interna | Mongoose | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:16](../../backend/src/models/AgentMessage.js#L16) |
| `agent_messages.conversationId` | I | Referencia al hilo IA | Servidor | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:17](../../backend/src/models/AgentMessage.js#L17) |
| `agent_messages.userId` | I | Propietario duplicado | Cuenta autenticada | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:24](../../backend/src/models/AgentMessage.js#L24) |
| `agent_messages.empresaId` | I/C | Empresa duplicada | Empresa seleccionada | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:25](../../backend/src/models/AgentMessage.js#L25) |
| `agent_messages.role` | I | user o assistant | Servidor | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:27](../../backend/src/models/AgentMessage.js#L27) |
| `agent_messages.content` | L | Consulta o respuesta; puede repetir datos SQL | Persona o inferencia/local | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:28](../../backend/src/models/AgentMessage.js#L28) |
| `agent_messages.queries[].sql` | L/I | SQL generado/ejecutado; puede contener literales | Bucle de agente | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:10](../../backend/src/models/AgentMessage.js#L10) |
| `agent_messages.queries[].rowCount` | I/C | Cantidad de filas de resultado | Motor SQL | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:11](../../backend/src/models/AgentMessage.js#L11) |
| `agent_messages.queries[].error` | L/I | Error SQL; posible eco de datos | Motor/validador SQL | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:12](../../backend/src/models/AgentMessage.js#L12) |
| `agent_messages.queries[].rationale` | L | Justificación generada | Modelo | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:13](../../backend/src/models/AgentMessage.js#L13) |
| `agent_messages.edited` | I | Marca de edición del mensaje de usuario | Acción del usuario | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:33](../../backend/src/models/AgentMessage.js#L33) |
| `agent_messages.createdAt` | I | Fecha de creación | timestamps Mongoose | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:35](../../backend/src/models/AgentMessage.js#L35) |
| `agent_messages.updatedAt` | I | Fecha de modificación | timestamps Mongoose | Historial/autoría IA | MA: sin TTL | SC; [AgentMessage.js:35](../../backend/src/models/AgentMessage.js#L35) |

**Índices declarados, ninguno TTL:** Conversation: participants; Message: conversationId; AgentConversation: userId, empresaId y compuesto userId/lastMessageAt; AgentMessage: conversationId, userId y compuesto conversationId/createdAt; más _id de cada colección. No se observan `expireAfterSeconds`, `expires` ni rutinas de caducidad en los modelos revisados. Es necesario contrastar listCollections/getIndexes en el entorno; la ausencia en modelos no descarta índices añadidos fuera del repositorio. [Conversation](../../backend/src/models/Conversation.js#L27), [Message](../../backend/src/models/Message.js#L16), [AgentConversation](../../backend/src/models/AgentConversation.js#L11), [AgentMessage](../../backend/src/models/AgentMessage.js#L17).

Lecturas paginadas (50 por defecto, máximo 100 en chat humano) y listado de hasta 100 hilos IA son límites de respuesta, **no borrado**. P-1 agenda la eliminación de mensajes humanos del titular tras confirmar la baja; para conversaciones compartidas, los mensajes de otros participantes pueden persistir. La tarea se reintenta si MongoDB falla y no ofrece un plazo garantizado de finalización. [Chat HTTP](../../backend/src/controllers/chatController.js#L39), [rutas humanas](../../backend/src/routes/chatRoutes.js#L12), [historial IA](../../backend/src/controllers/agentController.js#L220), [borrado y outbox](../../backend/src/services/accountDeletionOutbox.js).

## 5. Mapa de flujos salientes y destinatarios

**Estado observado:** integrado = existe camino invocable en código; opcional = depende de acción/configuración; prueba de conexión = existe envío de comprobación, no acredita sandbox del proveedor; no enlazado = servicio presente sin invocación observada desde aplicación; previsto = decisión futura sin integración comprobada. Ninguno significa “activo en producción”. **Excepción de país: servidor IA ClawStitch en Guatemala, declarado por el equipo el 2026-10-16, sin verificación de infraestructura y con proveedor de hosting no identificado.** Los países/regiones de los demás destinos siguen desconocidos; tampoco se conocen ubicaciones de tránsito, soporte o copias de IA. La retención de todos los receptores sigue desconocida. No se comprobó entrenamiento, conservación o subencargados de inferencia. Los campos son los construidos por el código, no una captura de red. Fuente de la excepción: [declaración directa del equipo](#declaración-directa-del-equipo-sobre-ia).

### Aplicación, bases de datos e identidad

| Flujo / estado | Campos exactos o conjunto de campos | Destino / transporte declarado | Finalidad, copia y evidencia |
| --- | --- | --- | --- |
| Navegador → Vercel; configuración observada en `develop` (PR #158), añadida el 2026-10-26 | GET de HTML/JS/CSS y recursos de la SPA para cualquier ruta: método, ruta completa con query, IP, user agent y cabeceras HTTP según navegador. Dos rutas llevan secretos en la URL: `/invite/:token` y `/auth/callback?token=…`, con el JWT de sesión (fila del callback OAuth, más abajo). | Hosting estático del frontend según `frontend/vercel.json`, que reescribe todas las rutas a `index.html`; `FRONTEND_URL` admite `*.vercel.app`. Proyecto, plan, dominio, región y retención de los registros de acceso **no comprobados**. | Servir la interfaz. No recibe los registros del negocio: el API se llama en `VITE_API_URL`. Los registros de acceso del proveedor pueden conservar el JWT y los tokens de invitación de esas rutas. Contrato y plan: [anexo de proveedores](anexo-proveedores.md). [Configuración](../../frontend/vercel.json#L1), [orígenes](../../backend/src/utils/frontendUrl.js#L22), [recepción del callback](../../frontend/src/views/AuthCallback.vue#L32). |
| Navegador → API Kontrol; integrado | JSON de los formularios que alimentan los campos §2; `Authorization: Bearer JWT`; `X-Company-ID` o `X-Empresa-ID` donde se configura; IDs en ruta y filtros en query. JWT: `id_usuario,email,nombre_rol,iat,exp`. Contraseña solo en registro/login/gestión de cuenta según esquema, no se guarda como columna de contraseña plana. Consultas de ventas/movimientos pueden enviar `projectId,id_producto,tipo,desde,hasta,bucket,tz` según ruta. | API relativa /api o VITE_API_URL según módulo; proxy nginx/Caddy; país del host desconocido. No se verificó conexión real. | Operar el producto. API devuelve subconjuntos, relaciones y derivados de §2/§4; no todos los campos viajan juntos. [Auth frontend](../../frontend/src/services/auth.js#L42), [middleware](../../backend/src/middleware/requireCompany.js#L7), [filtros](../../backend/src/schemas/inventoryMovementSchemas.js#L14). |
| Backend → PostgreSQL; integrado configurable | SQL y parámetros de CRUD/reportes sobre los **278 campos enumerados en §2**, más filtros, claves de conexión y ámbito; autor/empresa salen de JWT/cabeceras según controlador. | DATABASE_URL; local Docker en Compose base, servicio/dirección de despliegue configurables. TLS solo si DATABASE_SSL=true según poolConfig. País y cifrado del disco desconocidos. | Persistencia, consultas, derivados. [Pool](../../backend/src/db/pool.js#L1), [TLS](../../backend/src/db/poolConfig.js#L36), [Compose](../../docker-compose.prod.yml#L26). |
| Backend → Mongo; integrado condicional a conexión | Los **56 campos/rutas de §4**, búsquedas por IDs/fechas y actualizaciones de lectura. | MONGODB_URI. Desarrollo declara mongo:27017/kontrol_chat; producción y test usan la misma variable de URI en los Compose revisados. TLS/autenticación dependen de URI/configuración no inspeccionadas. País desconocido. | Chat/historial. No se puede afirmar separación test/producción por colección/instancia a partir de esos Compose. [Conexión](../../backend/src/db/mongo.js#L1), [producción](../../docker-compose.prod.yml#L30), [test](../../docker-compose.test.yml#L21). |
| Navegador → consentimiento Google; opcional OAuth | `client_id,redirect_uri,response_type=code,scope=openid email profile,access_type=offline,prompt=select_account`; `state` opcional codifica `inviteToken` en base64url. | https://accounts.google.com/o/oauth2/v2/auth; HTTPS. Google recibe también metadatos de conexión del navegador según configuración. País desconocido. | Inicio de sesión. No se describe state/base64 como cifrado. [Construcción de redirect](../../backend/src/controllers/authController.js#L216). |
| Backend → token Google; opcional OAuth | POST form: `code,client_id,client_secret,redirect_uri,grant_type=authorization_code`. Entrada: objeto `tokens` con `id_token`; se extraen `sub→google_id,email,given_name→nombre,family_name→apellido`. No hay columnas propias observadas para guardar access_token/refresh_token de Google. | https://oauth2.googleapis.com/token; HTTPS. País/retención desconocidos. | Verificar flujo de acceso y vincular/crear cuenta. Un fallo del intercambio imprime el objeto tokens; no se comprobó contenido de logs reales. [Callback](../../backend/src/controllers/authController.js#L245). |
| Backend → callback del frontend; integrado OAuth | Query de redirección: `token,onboarding`; opcionales `joinedEmpresaId,inviteToken,inviteError`. Frontend lee token, guarda sesión y usa router.replace. | FRONTEND_URL/getFrontendBaseUrl + /auth/callback; origen configurado. | JWT pasa por URL, historial de navegación/proxies potenciales; replace no prueba borrado de logs previos. [Redirect](../../backend/src/controllers/authController.js#L96), [recepción](../../frontend/src/views/AuthCallback.vue#L32). |
| Enlaces de invitación compartidos por usuario; opcional | Token de enlace en ruta; página pública devuelve empresa `nombre,industria,email,owner_nombre`; para proyecto añade `id_proyecto,nombre,estado` según serializador. La aceptación usa cuenta autenticada y permisos del enlace. | Persona que recibe el enlace y navegador; sin envío automático por correo observado en esos servicios. País del destinatario desconocido. | Invitar. Token no caduca por fecha en el esquema observado; puede desactivarse. [Empresa](../../backend/src/services/companyInvitationService.js#L36), [proyecto](../../backend/src/services/projectInvitationService.js#L66), [rutas](../../backend/src/routes/projectRoutes.js#L48). |

### Inferencia IA y contexto SQL

| Flujo / estado | Campos enviados | Destino / copia / evidencia |
| --- | --- | --- |
| Backend → ClawStitch; opcional al consultar agente configurado | Header `Authorization: Bearer AGENT_API_KEY`; JSON `model,messages,temperature,max_tokens,stream=false,response_format={type:json_object}`; opcional `chat_template_kwargs={enable_thinking:false}`, con reintento sin ese campo si el servidor lo rechaza. | AGENT_API_URL configurable; defecto https://model.clawstitch.com/v1/chat/completions, modelo defecto Qwen/Qwen3.6-27B-FP8. **País del servidor IA: Guatemala, declarado por el equipo el 2026-10-16; infraestructura no verificada. Proveedor de hosting no identificado.** Operación por el equipo según contexto del encargo; prestadores/contacto pendientes. Ubicaciones de copias, tránsito y soporte, accesos, logs y retención no comprobados. [Declaración directa del equipo](#declaración-directa-del-equipo-sobre-ia), [configuración de código](../../backend/src/services/aiAgentService.js#L12), [petición](../../backend/src/services/aiAgentService.js#L818). |
| Contenido de messages.system; mismo flujo | Contexto estático de producto, descripción de esquema/reglas/protocolo; usuario `id_usuario,email,nombre_rol`; empresa `id_empresa,nombre,rol_empresa`; ámbito `management_access,project_ids,inventory_project_ids`; capacidades `can_manage_users,can_view_inventory` incluidas en texto del prompt. | Mismo endpoint. El correo sí sale de forma explícita aunque no se solicite en la pregunta. [Prompt](../../backend/src/services/agentContext.js#L185). |
| Historial y herramientas; mismo flujo | Últimos **10 mensajes** aceptados `{role,content}`, con contenido de usuario recortado a 3000 caracteres, asistente sin ese recorte. Turnos del modelo `action,sql,rationale,text` según protocolo. Retroalimentación JSON `tool,result:{columns,row_count,rows,truncated}` o `tool,error`; muestra hasta **20 filas** por resultado. Sus nombres/valores exactos dependen del SELECT sobre las 24 vistas de §3; usuario excluye password_hash/google_id/token_version. | Mismo endpoint; puede recibir texto libre, contactos de proveedor, usuarios, adjuntos por URL, autores e importes visibles en las vistas. Los resultados completos no se guardan como array dedicado en AgentMessage; la respuesta puede repetirlos. Se conservan `content` y `queries.sql/rowCount/error/rationale` en Mongo cuando está disponible. [Historial/muestra](../../backend/src/services/aiAgentService.js#L903), [resultado de herramienta](../../backend/src/services/aiAgentService.js#L1050), [persistencia](../../backend/src/controllers/agentController.js#L161). |

El agente tiene respuestas locales de saludo/ayuda y consultas analíticas predefinidas que pueden resolver la solicitud **sin llamar al modelo**. Estar configurado no prueba que cada mensaje se envíe fuera. El bucle libre aplica validación SQL, límite por defecto 200 filas y timeout SQL de 8 segundos; no equivalen a borrado ni prueban todo el aislamiento. [Ramas locales](../../backend/src/services/aiAgentService.js#L943), [límites](../../backend/src/services/agentSql.js#L31).

El historial se acepta del cliente para cada turno; no se reconstruye exclusivamente desde Mongo antes de inferir. Una consulta del usuario se guarda antes de llamar al modelo, así que cancelar puede dejar esa consulta persistida. Si Mongo no está conectado, puede haber inferencia sin historial persistente local. Abortar la llamada no garantiza retirada de datos ya recibidos por inferencia. [Controlador](../../backend/src/controllers/agentController.js#L76).

### Alertas: contenido común y servicios exactos

El dispatcher solo selecciona filas `integracion` con `status='active'`; guardar configuración la deja inactive, activar/testear es acción adicional. Testear puede generar un mensaje real en la cuenta externa configurada; aquí no se presupone modo sandbox. Los estados efectivamente guardados no se consultaron. [Guardar/probar](../../backend/src/controllers/integrationController.js#L125), [dispatcher](../../backend/src/services/notificationService.js#L15).

Contenido de negocio que alimenta los servicios:

- **inventory.low_stock:** `title` contiene nombre del producto; `text` contiene nombre de producto, nombre de proyecto y, según caso, stock_actual/stock_minimo; `data={id_producto,stock_actual,stock_minimo}`.
- **budget.alert:** `title/text` contienen nombre de proyecto, nivel/porcentaje de uso; `data={projectId,alertLevel,usageRatio,totalBudget,totalSpent}`.
- Se construye `message=title ? "*"+title+"*\n"+text : text`. Slack/Telegram reciben message; Teams recibe title y text; SMS recibe text; SendGrid recibe subject/title y text; webhook recibe event y `{title,text,...data}`. No se observó envío automático general de todas las tablas a estos canales. [Stock](../../backend/src/controllers/inventoryMovementController.js#L290), [venta](../../backend/src/controllers/inventoryMovementController.js#L482), [presupuesto](../../backend/src/controllers/budgetController.js#L511), [despacho](../../backend/src/services/notificationService.js#L29).

| Servicio / estado | Credenciales y destinatario configurables | Prueba de conexión: solicitud exacta | Envío funcional: solicitud exacta / fuente |
| --- | --- | --- | --- |
| Slack; opcional integrado | `webhook_url,channel`; cifrados dentro de credentials_enc. La URL puede contener secreto. Dominio/país real no confirmados: el código usa la URL ingresada. | POST a webhook_url; Content-Type application/json; `{text:"✅ Kontrol conectado correctamente"+ sufijo de channel}`. channel se incorpora al texto de prueba, **no** se envía como campo channel. | POST misma URL; JSON `{text,blocks}` en servicio. El dispatcher llama con `{text:message}`, por lo que `blocks` queda undefined y JSON.stringify lo omite. channel no se usa para cambiar el destinatario del envío normal. [Servicio completo](../../backend/src/services/slackService.js#L4), [envío](../../backend/src/services/slackService.js#L22), [llamada](../../backend/src/services/notificationService.js#L80). |
| Microsoft Teams; opcional integrado | `webhook_url` cifrada. Destino específico proviene de esa URL; dominio/país desconocidos. | POST JSON `{type:"message",attachments:[{contentType:"application/vnd.microsoft.card.adaptive",content:{type:"AdaptiveCard",version:"1.4",body:[{type:"TextBlock",text:mensaje_de_conexión,wrap:true}]}}]}`. | Si title existe: misma envoltura message/attachments/AdaptiveCard, body con `{type:"TextBlock",text:title,weight:"Bolder",size:"Medium"}` y `{type:"TextBlock",text,wrap:true}`. Sin title: `{type:"message",text}`. Content-Type JSON. [Prueba](../../backend/src/services/teamsService.js#L4), [envío](../../backend/src/services/teamsService.js#L38). |
| Telegram; opcional integrado | `bot_token,chat_id` cifrados. Token forma parte de URL de API. País desconocido. | GET https://api.telegram.org/bot{bot_token}/getMe; después mensaje de conexión con sendMessage. | POST https://api.telegram.org/bot{bot_token}/sendMessage; JSON `{chat_id,text:message,parse_mode:"Markdown"}`. [Servicio](../../backend/src/services/telegramService.js#L3). |
| Twilio SMS; opcional integrado | `account_sid,auth_token,from_number,to_number` cifrados; teléfono destinatario personal identificable. País desconocido, no inferido del prefijo. | Llama a sendSms con texto de prueba: puede enviar SMS. | POST https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json; header Authorization Basic(base64(account_sid:auth_token)); form `From=from_number,To=to_number,Body=text`. Base64 es codificación de autenticación, no cifrado. [Servicio](../../backend/src/services/twilioSmsService.js#L3). |
| SendGrid; opcional integrado | `api_key,from_email,to_email,from_name` cifrados. No se confirma ningún buzón operativo de atención o derechos. País desconocido. | GET https://api.sendgrid.com/v3/user/account con Authorization Bearer api_key; esta prueba **no** envía correo según código. | POST https://api.sendgrid.com/v3/mail/send; Bearer api_key; JSON `{personalizations:[{to:[{email:to_email}]}],from:{email:from_email,name:from_name??"Kontrol"},subject:title??"Notificación de Kontrol",content:[{type:"text/plain",value:text}]}` desde dispatcher. Servicio también admite html, que cambia type a text/html y value a html si se usa directamente. [Servicio](../../backend/src/services/sendgridService.js#L3), [dispatcher](../../backend/src/services/notificationService.js#L93). |
| Webhook genérico; opcional integrado | `url,secret` cifrados; destinatario elegido por el administrador (no se presume Zapier/Make/n8n por mencionarlos en catálogo). Puede admitir HTTP; no se garantiza TLS para toda URL aceptada. País desconocido. | POST JSON a url: `{event:"test",source:"kontrol",timestamp:ISO,data:{message:"Webhook conectado correctamente desde Kontrol."}}`. Header X-Kontrol-Signature solo si secret. | POST JSON `{event,source:"kontrol",timestamp:ISO,data:{title,text,...data_del_evento}}`. Header Content-Type application/json; opcional `X-Kontrol-Signature="sha256="+HMAC_SHA256(JSON.stringify(payload),secret)`. Se envía firma, **no** secret como campo de payload. [Prueba](../../backend/src/services/webhookService.js#L5), [envío/firma](../../backend/src/services/webhookService.js#L33). |
| WhatsApp/Meta; servicio no enlazado observado | `access_token,phone_number_id,to_number` en firma del servicio; ausente en catálogo, controlador de prueba y dispatcher revisados. Activación real no comprobada. | GET https://graph.facebook.com/v25.0/{phone_number_id}?fields=display_phone_number,verified_name, Bearer access_token. Si to_number existe: POST /{phone_number_id}/messages con `messaging_product:"whatsapp",to:número_normalizado,type:"template",template:{name:"hello_world",language:{code:"en_US"}}`. | Servicio separado POST /messages con `messaging_product:"whatsapp",to:número_normalizado,type:"text",text:{body:text}`; imprime JSON de respuesta en consola. No atribuirlo a un flujo activo de Kontrol sin otra evidencia. [Servicio](../../backend/src/services/whatsappService.js#L1), [catálogo](../../backend/src/services/integrationService.js#L56), [dispatcher](../../backend/src/services/notificationService.js#L78). |

**Campos extensibles:** saveIntegrationSchema acepta `credentials` como record de cadenas y `config` como record de cualquier valor. El catálogo enumera las claves funcionales anteriores, pero no es una lista cerrada de todo lo que un administrador podría guardar. credentials se cifra; config se guarda en JSONB y se devuelve sin esa protección de campo. La máscara devuelve valores de longitud ≤8 sin ocultar y para otros conserva extremos; por eso no se describe como anonimización ni garantía universal de ocultación de secretos. [Esquema](../../backend/src/schemas/integrationSchemas.js#L29), [máscara](../../backend/src/services/integrationService.js#L45), [lectura](../../backend/src/controllers/integrationController.js#L55).

### Archivos, recursos del navegador, chat y llamadas

| Flujo / estado | Campos que salen y destino | Persistencia, alcance y fuente |
| --- | --- | --- |
| Cloudinary: firma y subida de evidencia o adjunto | El navegador pide a `POST /api/uploads/signature` (Bearer) una firma de `folder,timestamp`, válida una hora, y sube a `api.cloudinary.com/v1_1/<cloud>/auto/upload` los campos `file,api_key,timestamp,folder,signature`. A Cloudinary no se le envían usuario, tarea, avance ni descripción; sí el archivo completo con su nombre original. | **Región de la cuenta desconocida.** El secreto de la API no sale del backend. [Firma](../../backend/src/services/fileStorage.js#L66), [cliente](../../frontend/src/services/fileUpload.js#L54). |
| Cloudinary: bytes y registro | Archivo completo; puede incluir rostros, voz, documentos o EXIF, y la aplicación no limpia metadatos. Cloudinary responde `public_id,version,signature,resource_type,format,bytes,secure_url` y dimensiones/duración. Evidencia: el backend verifica la firma de esa respuesta y arma la URL él mismo. Chat: se guarda el descriptor que envía el cliente. | URLs y claves en PostgreSQL o Mongo; retención remota no comprobada. No se guarda el binario en una columna SQL/Mongo. [Registro de evidencia](../../backend/src/controllers/evidenciaController.js#L45). |
| Cloudinary: borrado | `destroy` firmado por archivo, con `invalidate`, al borrar una evidencia, en el cierre de empresa y en el reset de pruebas. | Evidencia: SQL se borra primero y el fallo remoto no bloquea el éxito. Cierre de empresa: reintenta hasta que Cloudinary confirma. Chat: no hay ruta que elimine sus archivos; una carga abandonada puede dejar un objeto sin mensaje. [Borrado](../../backend/src/services/fileStorage.js#L143). |
| Recursos externos por URL guardada; opcional/automático al mostrar imagen | URLs completas `marketing_publication.asset_url`, `messages.attachments[].url`; pueden cargarse como img/audio/video. `evidencia.url_archivo` y `reporte.contenido_url` se abren como enlaces. Destino es el host de la URL, que puede ser Cloudinary u otro elegido por usuario. | Receptor ve solicitud de recurso, metadatos de red y referrer según navegador/política, sin que se prueben cabeceras concretas. No se envía JWT de Kontrol expresamente a esas URLs en los tags/enlaces observados. URLs podrían incorporar identificadores o secretos ingresados por usuario. [Marketing](../../frontend/src/views/MarketingPublicationsView.vue#L92), [chat](../../frontend/src/views/ChatView.vue#L432), [evidencia](../../frontend/src/components/projects/TaskDetailModal.vue#L43), [reporte](../../frontend/src/components/reports/ReportDetailModal.vue#L21). |
| Google Fonts; integrado en HTML y varios CSS | Solicitudes a https://fonts.googleapis.com/css2 con selección de familias/pesos y display=swap; fuentes a fonts.gstatic.com y preconnect. IP y metadatos HTTP según navegador; no se observa payload de negocio agregado por la aplicación. | Carga de fuentes; caché/cookies/retención y países del proveedor no comprobados. [HTML](../../frontend/index.html#L10), [CSS adicional](../../frontend/src/views/InventoryPage.css#L15). |
| Icons8; integrado en login/registro | GET https://img.icons8.com/ios11/512/FFFFFF/google-logo.png, con metadatos de conexión según navegador. | Imagen externa; no es un SDK de autenticación ni acredita rastreo/cookies específicos. País/retención desconocidos. [Login](../../frontend/src/views/LoginView.vue#L93), [registro](../../frontend/src/views/RegisterView.vue#L107). |
| Chat humano por Socket.IO; integrado condicional Mongo | Handshake auth `{token}`; mensajes a backend `{conversationId,text,attachments}`; inicio DM `{targetUserId}`; typing/stop_typing/mark_read `{conversationId}`. Eventos de respuesta incluyen campos de mensajes/conversaciones §4, contadores e IDs. | VITE_SOCKET_URL/origen de API según frontend, polling/websocket con withCredentials=true. Backend distribuye a participantes y persiste mensaje/preview/readBy. No se observa cifrado extremo a extremo del chat humano. [Frontend](../../frontend/src/stores/chat.js#L622), [socket](../../backend/src/socket/index.js#L169). |
| Señalización de llamada; opcional | Entrada `{conversationId,description,candidate}`; retransmisión `{conversationId,fromUserId,description,candidate}`. Invitación/aceptación declaran IDs y nombres/iniciales; fin/rechazo incluye byUserId y reason cuando corresponde. description es SDP; candidate, candidato ICE, puede contener direcciones de red/puertos. | Pasa por Socket.IO de Kontrol y el otro participante. No hay colección propia de grabaciones/llamadas en estos modelos; ello no demuestra ausencia de metadatos en terceros o logs. [Señalización](../../backend/src/socket/index.js#L313), [invitación](../../backend/src/socket/index.js#L218). |
| STUN y medios WebRTC; opcional al llamar | STUN por defecto `stun:stun.l.google.com:19302`; negociación de conectividad expone direcciones/puertos de red necesarios al servicio/contraparte. VITE_WEBRTC_ICE_SERVERS puede sustituirlo por otros STUN/TURN con urls/username/credential según configuración. Audio/video del dispositivo via RTCPeerConnection hacia contraparte o relay elegido. | País, relay real, cifrado/retención del operador TURN no comprobados. Configuración ICE compilada para frontend es visible al cliente: no tratarla como almacén secreto. No se observa grabación de videollamada en backend. [ICE](../../frontend/src/stores/chat.js#L33), [medios/conexión](../../frontend/src/stores/chat.js#L283), [señal](../../backend/src/socket/index.js#L313). |
| Escáner de código; opcional | Cámara local mediante lector @zxing/browser, resultado de código al formulario/carrito; consulta de producto/venta a API con codigo_barras/IDs según flujo. No se observó envío de fotogramas a servicio de reconocimiento externo en este componente. | Permisos/cámara y procesamiento en navegador; detener controles al cerrar. Puede fallar por permisos/políticas del navegador o proxy. No demuestra captura de ubicación: solo hay latitud/longitud declaradas en DDL. [Escáner](../../frontend/src/components/inventory/BarcodeScanner.vue#L191), [producto](../../backend/src/controllers/productController.js#L1). |
| Descargas de reportes y recibo POS en pantalla; opcional | PDF/CSV de reportes: companyName, generatedBy, generatedAt, scopeLabel; filas de proyectos con nombre/progreso/estado/fecha_inicio y de reportes con titulo/tipo/proyecto/fecha_generacion. Detalle añade descripción/fechas/presupuesto/gasto/disponible, conteos de tareas/roles de equipo. POS devuelve líneas de producto/cantidad/precio y totales/descuento/IVA calculados; se muestra recibo de la última venta. | Archivo descargado o datos en pantalla; retención de copias del usuario desconocida. Se registra evento de descarga de reporte, sin cargar el PDF/CSV producido a almacenamiento remoto en ese flujo. No se atribuye una función de impresión de ticket no comprobada. [Dataset](../../frontend/src/utils/reportExport.js#L98), [detalle](../../frontend/src/utils/reportExport.js#L203), [descarga](../../frontend/src/utils/download.js#L4), [recibo POS](../../frontend/src/views/InventoryPage.vue#L69), [respuesta POS](../../backend/src/controllers/inventoryMovementController.js#L495), [registro](../../backend/src/controllers/reportsController.js#L84). |
| Marketing generado; código local integrado | Inputs objective/audience/tone/channel/callToAction/productName/campaignName/projectName/contentType/quantity; genera title/description/content/status/contentType/marketingDate/originType=RULE_BASED. | Generación local por reglas; no se observó llamada a LLM ni publicación automática a redes en ese servicio. Un asset_url o clic posterior sí puede producir salida distinta ya inventariada. [Generador](../../backend/src/services/marketingGenerationService.js#L153). |
| Stripe; TEST exclusivamente (PAY-1) | Ningún campo de tarjeta en Kontrol: el pago se escribe en Checkout/portal hospedados por Stripe. `empresa_suscripcion`: id_empresa, proveedor, id_cliente_proveedor, id_suscripcion_proveedor, plan, intervalo, estado, fin_periodo_actual, cancelar_al_final, actualizado_en. `evento_pago_procesado`: id_evento, proveedor, tipo, procesado_en. A Stripe sale solo metadata `id_empresa` y una descripción genérica. | **Transferencia TEST activa: identificador de empresa hacia Stripe; correo y tarjeta de prueba los capta Stripe en su página.** Sin cobros reales; sin plazo de retención definido para ambas tablas (se borran en cascada con la empresa). [Diseño](../pagos-suscripciones.md), [esquema](../../backend/kontrol.sql), [rutas](../../backend/src/routes/billingRoutes.js), [webhook](../../backend/src/billing/webhook.js). |

Las dependencias importadas y empaquetadas (incluido @zxing) no se clasifican como CDN remoto solo por su nombre; las peticiones externas declaradas son Fonts, Icons8, URLs configuradas/guardadas y los servicios anteriores. Imágenes data: y SVG con namespace http://www.w3.org no son por sí mismas llamadas HTTP. [Entradas del frontend](../../frontend/src/main.js#L1), [HTML](../../frontend/index.html#L10), [escáner](../../frontend/src/components/inventory/BarcodeScanner.vue#L202).

## 6. Navegador, sesión, cookies y almacenamiento transitorio

| Dato / campos | Dónde y origen | Finalidad | Retención ACTUAL | Cifrado ACTUAL / evidencia |
| --- | --- | --- | --- | --- |
| JWT `id_usuario,email,nombre_rol,iat,exp` | localStorage clave `token`, desde login/registro/callback | Autenticación API/socket | Sin TTL de almacenamiento; exp limita aceptación del token, no borra automáticamente su texto. Logout elimina la clave. Caducidad por defecto emitida 8h, configurable, no comprobada en producción. | Firmado, no cifrado; sin cifrado aplicativo de localStorage. [Store](../../frontend/src/stores/auth.js#L5), [emisión](../../backend/src/controllers/authController.js#L19). |
| Perfil `id_usuario,nombre,apellido,email,nombre_rol`, y tras /me `telefono,activo` | localStorage `user`; objeto devuelto por backend | Identidad visible y acceso UI | Persiste hasta sustitución/logout/borrado de datos del navegador; no TTL. | SC. [Store](../../frontend/src/stores/auth.js#L39), [/me](../../backend/src/controllers/authController.js#L192). |
| Empresas `id_empresa,nombre,industria,email,telefono,rol`; empresa seleccionada con propiedades del objeto | localStorage `empresas` y `empresaActual` | Elegir ámbito de trabajo | Sin TTL; actualización/logout elimina claves de sesión. | SC. [Objetos de API](../../backend/src/controllers/companyController.js#L120), [store](../../frontend/src/stores/auth.js#L44). |
| `accessContext`: `rol_empresa,assigned_projects_count,project_ids,inventory_project_ids,capabilities` con `can_manage_users,can_view_projects,can_create_projects,can_view_inventory,can_sell_inventory,can_manage_inventory,can_view_marketing,can_manage_marketing` | localStorage `accessContext`; respuesta del servicio de acceso | Permisos y navegación UI; no reemplaza autorización backend | Sin TTL; reemplazo/logout elimina clave | SC. [Servicio](../../backend/src/services/projectAccessService.js#L204), [store](../../frontend/src/stores/auth.js#L50). |
| `birdieVisible`; clave incluye ID de usuario o anon | localStorage `prefs_<idUsuario>` o `prefs_anon` | Preferencia personal del ayudante | Sin TTL; no está en la lista de claves borradas por logout | SC. [Preferencias](../../frontend/src/stores/preferences.js#L12), [logout](../../frontend/src/stores/auth.js#L145). |
| Idioma; tema; tamaño de letra | localStorage `kontrol:locale`, `kontrol:theme`, `kontrol:font-scale`; lectura legacy `locale_<id>` | Presentación de la interfaz | Sin TTL; migración legacy no implica eliminación de la clave antigua; no se borran por logout observado | SC. [Idioma](../../frontend/src/composables/useLocale.js#L27), [tema](../../frontend/src/composables/useTheme.js#L15), [tamaño de letra](../../frontend/src/composables/useFontScale.js#L20). |
| Modo grid/list; posiciones x/y del ayudante | localStorage `projects-view-mode`, `birdie-fab-position`, `birdie-assistant-home` | Disposición recordada del navegador | Sin TTL; persiste hasta sobrescribir/borrar navegador; no borrado por logout observado | SC. [Proyectos](../../frontend/src/views/ProjectsView.vue#L484), [botón](../../frontend/src/components/birdie/BirdieFloatingButton.vue#L33), [asistente](../../frontend/src/components/birdie/BirdieAssistant.vue#L163). |
| Borradores, mensajes, query SQL/errores visibles, IDs seleccionados, carrito POS, configuración de venta en stores, estado Birdie | Memoria Vue/Pinia/componentes; formularios/respuestas | Interacción mientras está cargada la app | Vida de stores/componentes/recarga; algunos mensajes ya están persistidos en Mongo, por lo que vaciar UI no los borra. | Memoria sin cifrado de campo observado. [Birdie](../../frontend/src/stores/birdie.js#L1), [agente](../../frontend/src/services/agent.js#L55), [chat](../../frontend/src/stores/chat.js#L1), [venta](../../frontend/src/stores/saleConfig.js#L1). |
| Bytes de archivos seleccionados, streams de cámara/micrófono, objetos Blob/URL temporales y archivo de descarga | Memoria del navegador y descarga/impresión | Enviar archivos, llamar, escanear, exportar | La app detiene tracks al cerrar llamada y controles de escáner; downloadBlob revoca objectURL. No asegura eliminación de caché del navegador/archivos descargados. | No se comprobó cifrado del dispositivo. [Tracks](../../frontend/src/stores/chat.js#L131), [escáner](../../frontend/src/components/inventory/BarcodeScanner.vue#L252), [descargas](../../frontend/src/utils/download.js#L4). |
| Cookies propias, sessionStorage, caché de terceros | No se encontró escritura explícita de cookies ni sessionStorage en código propio revisado; CORS/Socket.IO permiten credentials/withCredentials. Servicios Google/CDN/Cloudinary y configuración heredada pueden comportarse de otra forma. | Dependiente del componente/tercero | **Desconocida en navegador real**; sin inspección de Set-Cookie, almacenamiento ni sesiones externas | No afirmar “Kontrol no usa cookies” en términos absolutos. No se observó integración propia de analítica de visitas en los puntos de entrada revisados; tampoco es prueba de ausencia de todo tracking de terceros. [CORS](../../backend/src/index.js#L43), [socket frontend](../../frontend/src/stores/chat.js#L622), [HTML externo](../../frontend/index.html#L10). |

No hay columna de “país por IP” ni geolocalización IP implementada observada en las fuentes revisadas. Sí se procesa IP en la red, proxies y límites de solicitudes; no son lo mismo que guardar país o ubicación física comprobada. [Proxy](../../frontend/nginx.conf.template#L17), [rate limit](../../backend/src/middleware/rateLimit.js#L59), [coordenadas declaradas](../../backend/kontrol.sql#L347).

## 7. Logs, cachés, volúmenes, resultados y copias

| Soporte / datos identificables o comerciales posibles | Dónde/origen/finalidad | Retención ACTUAL comprobable | Cifrado y límite de evidencia |
| --- | --- | --- | --- |
| Errores backend: método, URL original con query, objeto Error/stack y detalles de base/proveedor | console.error de errorHandler → stderr del proceso/contenedor; otros controladores imprimen objetos de error | Sin política de purga/rotación en aplicación observada. Retención del driver Docker/host/servicio externo desconocida; no afirmar “hasta deploy”. No se observó logger general que registre siempre Authorization/JWT de cada petición. | Sin redacción general observada para todos los Error. URL puede incluir OAuth code/state/invite u otros identificadores. SC de aplicación; disco/driver desconocidos. [Handler](../../backend/src/middleware/errorHandler.js#L35), [OAuth](../../backend/src/controllers/authController.js#L269), [Compose](../../docker-compose.prod.yml#L20). |
| Fallos IA: hasta 500 caracteres de respuesta upstream dentro del error; SQL/error en historial | callLlm construye Error; agentController lo imprime, no devuelve el detalle upstream al cliente en 5xx | stderr sin plazo de conservación propio observado; historial Mongo según MA. No se consultaron logs reales. | Puede haber datos incorporados por el servidor/modelo; no afirmar que contiene un secreto concreto. [Upstream](../../backend/src/services/aiAgentService.js#L876), [log IA](../../backend/src/controllers/agentController.js#L205). |
| Integraciones: empresa, slug, event, status, error_msg, created_at | PostgreSQL integracion_log y errores de notifyCompany en stderr | Sin TTL/job de purga observado. Desconexión no borra log. CASCADE de empresa solo si se ejecuta borrado permitido. | error_msg sin AES de campo; respuestas de Slack/Teams/Telegram/Twilio/SendGrid pueden aportar contenido de error. [Dispatcher/log](../../backend/src/services/notificationService.js#L38), [DDL](../../backend/src/db/bootstrap.js#L130). |
| WhatsApp: respuesta JSON completa | console.log en servicio separado | Solo ocurriría si se invoca; no enlazado observado. Retención stdout desconocida. | Posibles números/IDs de mensaje/errores según respuesta, no se inspeccionaron reales. [Servicio](../../backend/src/services/whatsappService.js#L65). |
| Conectividad Mongo, arranque y métricas de pool | stdout/stderr; poolStats opcional emite `event,at,total,idle,waiting,max`; /api/health devuelve status y db counters | poolStats apagado por defecto (intervalo 0), configurable. Logs sin retención propia observada. Health no tiene datos personales explícitos en su payload. | Métricas operativas NP/C, sin SQL ni filas en ese logger. [Pool stats](../../backend/src/db/poolStats.js#L16), [arranque](../../backend/src/index.js#L67). |
| IP, ruta, cabeceras de proxy; posibles query URLs/referrer en logs heredados | nginx: template no declara access_log/error_log/log_format propios; imagen nginx:alpine y defaults heredados no inspeccionados. Caddyfile no activa directiva de access log; pueden existir logs operativos/configuración externa. | Formato, ruta física efectiva, rotación y plazos **no comprobados**. No afirmar ausencia de registros por no verse directiva en template. | HTTPS externo puede terminar en Caddy; upstream declarado HTTP frontend/backend. Configuración/certificados reales y cifrado de disco no comprobados. [nginx](../../frontend/nginx.conf.template#L1), [imagen](../../frontend/Dockerfile#L25), [Caddy](../../Caddyfile#L1). |
| stdout/stderr de contenedores y logs del daemon | Docker del host | Ningún Compose revisado declara logging driver/max-size/max-file; política global del daemon y proveedores externos desconocida. Redeploy puede recrear contenedores, pero no acredita borrado de logs exportados/copias. | No se inspeccionó daemon ni journald. [Compose base](../../docker-compose.yml#L1), [producción](../../docker-compose.prod.yml#L1), [test](../../docker-compose.test.yml#L1), [recreación](../../scripts/deploy.sh#L131). |
| PostgreSQL y Mongo persistentes en desarrollo; PostgreSQL local declarado producción | Volúmenes Docker `postgres_data:/var/lib/postgresql/data`, `mongo_data:/data/db` en Compose base. Producción declara postgres_data; Mongo apunta a URI, sin volumen mongo propio allí. | Volumen persistente sin TTL ni calendario de eliminación observado; eliminar/recrear contenedor no es borrar volumen. Contenido real/acoplamiento con DATABASE_URL no comprobado. | No se verificó cifrado en reposo, snapshots o copias del volumen. [Base](../../docker-compose.yml#L8), [Mongo](../../docker-compose.yml#L19), [producción](../../docker-compose.prod.yml#L8). |
| Caddy data/config, certificados y metadatos de configuración | Volúmenes `caddy_data:/data` y `caddy_config:/config`; host/dominios configurados | Persistentes; no política de limpieza propia observada. No equivalen a tablas de datos de negocio ni backup acreditado. | Contienen material operativo que no debe copiarse sin revisión; cifrado host no comprobado. [Volúmenes](../../docker-compose.prod.yml#L71). |
| Caché de presupuesto | Map en memoria por id_empresa y lista ordenada de IDs de proyecto; guarda data de resumen, expiresAt | TTL lógico 30 segundos y máximo 500 entradas; eliminación al leer caducada, invalidar, desalojar o terminar proceso. **No se garantiza borrado físico puntual a los 30s**, porque no hay barrido temporizado en esa utilidad. | C/I, sin cifrado de campo. [Cache](../../backend/src/utils/budgetSummaryCache.js#L3). |
| Contadores rate-limit | Memoria por IP normalizada IPv6/56, userId o email normalizado de cuenta objetivo | Ventanas por defecto 15min auth/login y 1min endpoints costosos/IA, configurables; almacenamiento de librería en memoria y ciclo de proceso. No son TTL de datos PostgreSQL/Mongo. | S/I, sin geolocalización ni persistencia SQL declarada. [Rate limit](../../backend/src/middleware/rateLimit.js#L59). |
| Sesiones de conexión PostgreSQL y Socket.IO | Memoria del servidor: IDs, JWT decodificado, rooms user/conv, señalización; vistas SQL temporales conservan definiciones en la sesión del pool | Conexión/sesión/proceso y reemplazo de vistas; no política que pruebe purga de todos los metadatos por simple cierre de pantalla. | Sin cifrado de campo en memoria. No grabación de medios observada en este backend. [Socket](../../backend/src/socket/index.js#L140), [vistas](../../backend/src/services/agentSql.js#L69). |
| Logs consola del navegador | Errores de subidas, ICE, señalización, socket, configuración ICE inválida | Vida de consola/devtools y cualquier exportación del usuario; no se observó envío a colector de errores dedicado desde esos console.*. | Pueden contener objetos Error o configuración problemática; retención del navegador desconocida. [Chat frontend](../../frontend/src/stores/chat.js#L48), [subida](../../frontend/src/stores/chat.js#L943). |
| PDF/CSV descargados, recibo POS en pantalla, objetos en navegador | Descargas y datos mostrados; el usuario puede producir copias por medios de su dispositivo | No TTL ni retirada remota de archivos descargados implementada en la app; conservación de copias controlada por usuario/dispositivo. | C/I/L según contenido de §5; cifrado de dispositivo no comprobado. [Exportador](../../frontend/src/utils/reportExport.js#L336), [download](../../frontend/src/utils/download.js#L4), [recibo](../../frontend/src/views/InventoryPage.vue#L69). |
| Pruebas ZAP: reportes, requests/responses y metadatos de objetivos | `zap/out` producido por scripts; `docs/evidencias/security-regression` y `docs/evidencias/scrum-52` contienen resultados guardados; verify-*.txt, resúmenes/reportes JSON/HTML, monitores stats/health/baseline CSV, runs.csv | Sin TTL de archivos/limpieza general observado en scripts. Algunos resultados se guardan en repositorio; no se asume que son anónimos por ser pruebas. No se repiten cuerpos/tokens ni se ejecuta ZAP. | IDs, URLs y potencial contenido de respuesta. Wrapper afirma manejo del token en memoria, lo que no acredita ausencia de tokens en toda evidencia/tercero. [Salida](../../zap/run-zap.sh#L28), [verify](../../zap/verify-controls.sh#L17), [monitor](../../zap/monitor-prod.sh#L71), [planes](../../zap/plans/passive.yaml#L104). |
| k6/CI y coverage | resumen k6 summary.json; carpetas backend/coverage y frontend/coverage; artefactos de workflow. Código y nombres de archivos/reportes pueden contener IDs, URLs o datos sintéticos de pruebas. | **retention-days:30** configurado para esos artefactos en los workflows, sin extenderlo a logs de job, al repositorio o a cualquier copia descargada. Retención efectiva del servicio no comprobada. | Sin secreto reproducido. [CI](../../.github/workflows/ci.yml#L41), [frontend](../../.github/workflows/ci.yml#L70), [k6 CI](../../.github/workflows/ci.yml#L161), [load-test](../../.github/workflows/load-test.yml#L62). |
| Bench/volumen: tiempos, índices, conteos, paridad e IDs | backend/scripts/bench-results/*.json y consola; volume/sql/inventory.sql produce salidas de catálogo/conteos; datos de prueba se insertan en tablas ya enumeradas | Archivos sin TTL propio observado; filas de test permanecen hasta limpieza/reset específico. Las tablas temporales se rigen por §3. | C/I cuando enlazables a empresa/proyecto; sin cifrado de campo. [Bench](../../backend/scripts/bench-dashboard.js#L497), [inventario de volumen](../../volume/sql/inventory.sql#L5). |
| Capturas/evidencias manuales y documentos de prueba | `.playwright-mcp`, `docs/evidencias`, documentos de usabilidad/pruebas en docs; salidas de herramientas del equipo | No hay TTL/purga propia acreditada para esos archivos. Se identificaron como soportes potenciales por árbol y generadores; **no se inspeccionaron exhaustivamente bytes de todos los PNG/PDF/DOCX/XLSX ni capturas**, por lo que no se certifica anonimización. | Una captura/documento puede reproducir datos mostrados o participantes; no se transcriben datos de personas. [Registro de sesiones](../pruebas-usabilidad/registro-sesiones.md), [evidencia CI](../evidencias/scrum-74/README.md). |
| Copias en destinatarios, servicios, navegador, soporte, host o repositorio | Dependientes de cada flujo anterior, exportación, tercero y operación humana | Desconocidas salvo regla específica comprobada. **No se observó job propio de pg_dump/mongodump, calendario de backup, prueba de restauración o borrado coordinado en el código/scripts revisados; no demuestra que proveedor/host carezca de backups.** | Cifrado, región, accesos y retención deben acreditarse con configuración/contrato real. [Compose](../../docker-compose.prod.yml#L1), [scripts de despliegue](../../scripts/deploy.sh#L1), [estado P-2](README.md). |

Los scripts de despliegue pueden extraer las últimas 120 líneas de logs de backend al fallar la salud; eso crea otra salida en terminal/registro de ejecución, **no una política de conservar solo 120 líneas**. No se ejecutaron scripts ni se revisaron logs de despliegue reales para este inventario. [Deploy](../../scripts/deploy.sh#L151).

Las imágenes, paquetes, cachés de compilación/Vite y volúmenes node_modules son soportes técnicos; no se encontró en las rutas de producción de la aplicación una escritura deliberada de filas de personas a esos cachés. No se certifica que toda imagen o carpeta de desarrollo esté libre de material agregado fuera del flujo normal. La revisión de archivos sensibles y rotación de credenciales queda fuera de este cierre; no se enlazan ni reproducen credenciales.

## 8. Alcance de acceso y límites relevantes del inventario

Esta sección se limita a explicar quién puede ver o modificar datos según el código; no es una auditoría completa de seguridad. No se probó acceso ajeno ni se alteró producción.

| Superficie | Control observado y límite |
| --- | --- |
| /api/health | Público en router; devuelve estado y contadores de pool, sin filas de negocio. |
| /api/auth | Registro/login y redirects OAuth públicos; /me requiere JWT; limitadores de auth/login según configuración. |
| /api/users | JWT y rol de sistema admin/super_user. Controlador de listado/detalle no filtra por empresa: no equiparar admin global con admin limitado al negocio. |
| /api/global y /api/admin | JWT + requireSuperUser; consulta/gestión global intencional. |
| /api/companies | my-companies/alta con JWT; contexto y gestión de miembros/configuración con requireCompany y dueño según ruta; consulta pública de invitación por token. |
| /api/projects | Empresa seleccionada y validaciones de rol/permiso según operación; endpoints públicos de invitación por token. |
| /api/products, /api/suppliers, /api/inventory-movements, /api/budgets | JWT/empresa y reglas de proyecto/permiso según ruta/controlador; no deducir aislamiento de todas las rutas por aplicar guard en una. |
| /api/reports y /api/marketing | JWT+empresa; roles de empresa para escritura según ruta. Listado/resumen de reportes es ámbito empresa, no una garantía general de restricción a proyectos asignados. |
| /api/teams | JWT/empresa y rol requerido de administración de equipo según ruta. |
| /api/projects/:projectId/tasks y evidencia | El subrouter solo monta requireAuth; controlador usa IDs del proyecto/tarea sin comprobar membresía de empresa/proyecto. getTaskEvidence usa tarea y deleteTaskEvidence usa tarea/evidencia, sin ese alcance. **Impide afirmar aislamiento completo de tareas, asignaciones y adjuntos.** |
| /api/uploads y POST de evidencia | requireAuth verifica la sesión. El registro de evidencia comprueba que la tarea sea del proyecto y el avance del mismo proyecto, pero no ejecuta requireCompany ni demuestra pertenencia del usuario al proyecto. No se debe afirmar aislamiento completo. |
| /api/chat + Socket.IO | HTTP verifica JWT; mensajes verifican participants. Inicio DM exige compartir alguna empresa. Conversación humana no guarda empresaId, y listados/mensajes posteriores no se atan a empresa actualmente seleccionada ni revalidan toda membresía al enviar. |
| /api/agent | JWT+requireCompany en conversación/mensajes/chat, salvo status solo JWT. Listado filtra userId+empresaId; helpers para acceder/editar/borrar hilo/mensaje existente verifican propietario **sin contrastar empresaId actual**. No afirmar separación estricta entre los espacios del mismo usuario. |
| Revocación | requireAuth y handshake/socket verifican firma/caducidad JWT; no se observa consulta de usuario.activo/token_version en esos verificadores. Desactivar usuario impide nuevos logins según controlador, pero no prueba revocación inmediata de token/conexión vigente. |

Fuentes: [router](../../backend/src/router.js#L25), [rutas auth](../../backend/src/routes/authRoutes.js#L10), [usuarios](../../backend/src/routes/userRoutes.js#L23), [controlador usuarios](../../backend/src/controllers/userController.js#L24), [empresa](../../backend/src/routes/companyRoutes.js#L34), [proyectos](../../backend/src/routes/projectRoutes.js#L48), [productos](../../backend/src/routes/productRoutes.js#L34), [proveedores](../../backend/src/routes/supplierRoutes.js#L22), [movimientos](../../backend/src/routes/inventoryMovementRoutes.js#L24), [presupuesto](../../backend/src/routes/budgetRoutes.js#L1), [reportes](../../backend/src/routes/reportsRoutes.js#L25), [marketing](../../backend/src/routes/marketingRoutes.js#L1), [equipos](../../backend/src/routes/teamRoutes.js#L1), [tareas](../../backend/src/routes/taskRoutes.js#L23), [evidencia](../../backend/src/controllers/evidenciaController.js#L13), [uploads](../../backend/src/routes/uploadRoutes.js#L10), [chat/socket](../../backend/src/socket/index.js#L140), [IA](../../backend/src/controllers/agentController.js#L26), [JWT](../../backend/src/middleware/requireAuth.js#L12).

Las FKs/roles/vistas son controles observados, no prueba del entorno instalado. Casos NOT VALID y uso compartido de variable Mongo entre test/producción ya constan en §3/§5. Estas limitaciones deben reflejarse al redactar privacidad; documentarlas no elimina la responsabilidad propia del prestador ni justifica una exención absoluta.

## 9. P-1 / P-2 / P-3 y cierre verificable

| Pendiente confirmado | Mecanismo parcial existente | Qué NO queda acreditado / sin promesa |
| --- | --- | --- |
| P-1: exportación/supresión integral | Implementado parcialmente 22-10-2026: `GET /api/companies/export` valida membresía DT-05 y limita a owner/admin; transmite JSON por streaming, con filas PostgreSQL de la empresa, perfil, conversaciones IA de la empresa y metadatos mínimos de chats humanos del solicitante junto con sus propios mensajes. Credenciales/tokens se excluyen. `DELETE /api/auth/account` exige contraseña o reautenticación Google reciente; desactiva y anonimiza cuenta, retira membresías, registra en la misma transacción una tarea durable para borrar chats propios en MongoDB tras el `COMMIT`, e informa si la limpieza quedó pendiente. El worker reintenta fallos; no garantiza plazo de finalización si MongoDB no está disponible. El rol owner se transfiere a un miembro activo; si no hay sucesor, se programa el cierre de la empresa. Cierre de empresa (26-10-2026): `POST /api/companies/closure` (owner, contraseña o prueba Google propia del cierre, y nombre de la empresa) abre una ventana de 30 días en la que solo funcionan la exportación, la consulta y la anulación (`DELETE /api/companies/closure`). Después el worker borra en una transacción REPEATABLE READ las filas de la empresa, marcadas por `id_empresa` y por claves foráneas NO ACTION, RESTRICT o CASCADE; luego, los archivos de evidencia en Cloudinary y el historial del asistente en Mongo, con reintentos. `GET /api/companies/closures/mine` entrega la constancia. | La baja de cuenta no es borrado integral: no elimina registros compartidos de negocio, archivos de empresa ni copias ya enviadas a proveedores; deja una fila técnica anónima por FKs. Plazo de retención de esos registros no definido mientras la empresa siga en uso. El cierre de empresa no elimina chats humanos (no tienen `id_empresa`), adjuntos de chat, lo ya enviado a integraciones, cuentas de miembros ni copias de respaldo y registros técnicos; para estos últimos el plazo de 90 días de la adenda depende de P-2 y O09. Chats humanos carecen de `id_empresa`, por lo que no se atribuyen a la empresa conversaciones de otros miembros, ni se exportan mensajes o datos de perfil de terceros. La exportación es descarga directa autenticada: no se aloja archivo ni se crea enlace público/de larga vida. Los países, acuerdos y retención efectiva de copias de proveedores siguen pendientes de verificar. |
| P-2: respaldos/restauración | Persistencia de volúmenes y servicios configurables | Volumen persistente no es prueba de backup. No se observó implementación propia de plan, periodicidad, restauración comprobada o retención/purga de respaldos; backups del host/proveedor desconocidos. Sin promesa de RPO/RTO o plazo de recuperación. |
| P-3: brechas/incidentes | Logs, validaciones, limitadores y pruebas de seguridad existentes | No se observó circuito operativo documentado/implementado que identifique responsables, evalúe alcance, preserve evidencia y gestione comunicación de brechas. No hay plazo comprometido ni canal operativo acreditado en este encargo. Las alertas budget/stock no son un sistema de gestión de brechas. |

Fuentes: [decisiones P-1/P-2/P-3](README.md), [exportación empresa](../../backend/src/services/companyDataExport.js), [baja propia](../../backend/src/controllers/privacyController.js), [outbox de limpieza Mongo](../../backend/src/services/accountDeletionOutbox.js), [cierre de empresa](../../backend/src/services/companyClosure.js), [reautenticación Google](../../backend/src/controllers/authController.js), [baja administrativa anterior](../../backend/src/controllers/userController.js#L214), [borrado IA](../../backend/src/controllers/agentController.js#L258), [reportes](../../backend/src/controllers/reportsController.js#L84), [evidencia](../../backend/src/controllers/evidenciaController.js#L29), [dispatcher de negocio](../../backend/src/services/notificationService.js#L15), [infra declarada](../../docker-compose.prod.yml#L1). Esta actualización P-1 complementa el corte estático del 16-10-2026; no certifica entorno productivo ni ubicación/retención efectiva de terceros.

**Cierre de cobertura:** 38 tablas/278 columnas PostgreSQL contrastadas contra SQL base + bootstrap; DDL inline de vistas/temporales separado; cuatro modelos Mongo con 56 rutas de campo/implícitos; salidas e integraciones distinguidas por estado, incluidas Slack/Teams/webhook con payloads; logs/storage y límites de retención/cifrado documentados. No se alteró aplicación ni git.

**Validación de entorno pendiente, no compromiso de implementación:** confirmar esquema/índices/constraints reales (drift), infraestructura que sustente la ubicación del servidor IA declarada en Guatemala, proveedor de hosting y países de los demás destinos, TLS y cifrado at-rest efectivos, activación de conexiones, objetos huérfanos, retención de cada log/copia y comportamiento real de cookies. La declaración del equipo no verifica ubicaciones de tránsito, soporte o copias. La inspección de documentos binarios/capturas del equipo y configuraciones de terceros no está certificada por este inventario. No se amplía investigación jurídica ni de proveedores desde este anexo.
