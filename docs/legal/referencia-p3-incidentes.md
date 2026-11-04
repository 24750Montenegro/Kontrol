# Referencia para P-3: gestión de incidentes de seguridad

**26 de octubre de 2026 · insumo para la tarea P-3, que todavía no ha empezado.** Reúne lo que P-3 debe implementar para que Kontrol pueda cumplir la [Adenda de tratamiento de datos](adenda-tratamiento-datos.md) (L-4), §8 y cláusulas relacionadas. No es el procedimiento de P-3: es la lista de requisitos y los materiales de partida. Mientras P-3 no esté terminado, la adenda no puede entrar en vigencia (condición A7 de su nota N4).

Requiere revisión profesional en Guatemala antes de usarse en un incidente real, igual que la adenda.

## 1. Alcance

P-3 cubre los **incidentes de seguridad** que define la adenda: violaciones de la seguridad que causen la destrucción, pérdida o alteración accidental o ilícita de datos, o su comunicación o acceso no autorizados.

| Tipo de incidente | Quién es responsable | Qué rige |
| --- | --- | --- |
| Afecta Datos del Cliente (registros del negocio, chat, asistente IA, archivos) | El Cliente; Kontrol es encargado | Adenda §8: aviso al Cliente en 48 h; el Cliente decide si comunica a titulares y autoridades |
| Afecta solo Datos de cuenta y operación (cuentas, sesiones, registros técnicos) | Kontrol | [Política de Privacidad, §10](politica-privacidad.md#10-incidentes-y-comunicaciones): Kontrol evalúa sus propias obligaciones de comunicación |
| Afecta a ambos | Los dos, cada uno por lo suyo | Se aplican las dos filas anteriores en paralelo |

Una falla de disponibilidad sin pérdida ni acceso indebido a datos no es un incidente de seguridad para la adenda, pero conviene registrarla igual (R4).

## 2. Requisitos

Cada requisito indica la cláusula de origen y cómo se comprueba que P-3 lo cumple.

| ID | Requisito | Origen | Criterio de aceptación |
| --- | --- | --- | --- |
| R1 | Designar una persona responsable de incidentes y una suplente, con acceso a los sistemas y a los buzones de avisos. | Adenda §8; matriz O07 | Nombres y forma de contacto anotados en el procedimiento de P-3, con al menos una persona localizable cada día. |
| R2 | Canal de entrada para los clientes: support@kontrol.it.com con el asunto «Incidente de seguridad». El buzón debe revisarse a diario. | Adenda §4.8 y §14.4; matriz O01 | Correo de prueba recibido y contestado por R1. |
| R3 | Recibir los avisos de los subencargados en un buzón que R1 revise: suscripción a los avisos de seguridad y a los cambios de subencargados de cada proveedor del Anexo A.2 de la adenda, y también de Vercel. | Adenda §8.1 (el plazo corre desde que Kontrol recibe el aviso del proveedor) y §7.2 | Lista de proveedores con la dirección suscrita y la fecha de suscripción. |
| R4 | Registro de incidentes con los campos de la §4 de este documento, conservado al menos 24 meses. | Adenda §8.5 y §11.1 e | Plantilla del registro creada y probada en el ensayo de R11. |
| R5 | Identificar las empresas afectadas y los contactos de su propietario y administradores (§5). | Adenda §8.2 | Consulta ejecutada en el ensayo y lista de destinatarios obtenida en menos de una hora. |
| R6 | Enviar el aviso inicial a cada empresa afectada **dentro de 48 horas desde el conocimiento**, por correo al propietario y a los administradores. Si el correo falla, llamar al teléfono del propietario, si lo registró. Conservar constancia del envío. | Adenda §8.1–8.3 | Plantilla de la §6 adaptada; en el ensayo, aviso enviado antes de 48 h desde T0. |
| R7 | Mostrar el aviso dentro de la plataforma a los usuarios de las empresas afectadas al iniciar sesión. Hoy no existe ese mecanismo: P-3 debe implementarlo o definir uno equivalente. | Adenda §8.2 | Aviso visible para el propietario de una empresa de prueba e invisible para otra empresa no afectada. |
| R8 | Enviar actualizaciones cada vez que haya información relevante y, como mínimo, cada 72 horas hasta la contención. Entregar un informe de cierre dentro de 15 días naturales desde la contención. | Adenda §8.4 | Fechas de actualización y de cierre anotadas en el registro del ensayo. |
| R9 | Contener el incidente, preservar la evidencia y documentar las medidas (§7). | Adenda §8.5 | Lista de la §7 recorrida en el ensayo. |
| R10 | No comunicarse con los titulares ni con autoridades por cuenta del Cliente salvo instrucción escrita del Cliente o una obligación legal directa de Kontrol; en este último caso, avisar antes al Cliente si la ley lo permite. Entregar al Cliente la información que necesite para sus propias comunicaciones. | Adenda §8.6 | Regla escrita en el procedimiento de P-3. |
| R11 | Ensayo completo antes de que la adenda entre en vigencia y después una vez cada 12 meses. | Adenda §5.6 | Acta del ensayo con tiempos reales de T0 a cada hito. |
| R12 | Avisar a los clientes afectados si un incidente proviene de un proveedor sin acuerdo de tratamiento verificado (Cloudinary, Vercel) aplicando los mismos plazos. Que el proveedor no avise no exime a Kontrol de hacerlo cuando lo detecte. | Adenda §7.7 y §8.1 | Regla escrita en el procedimiento de P-3. |

## 3. Línea de tiempo

**T0** es el momento en que Kontrol tiene conocimiento del incidente: lo detecta el equipo, lo reporta un cliente al canal de R2 o llega el aviso de un proveedor (R3). Debe anotarse con fecha y hora en el registro.

| Momento | Acción | Cláusula |
| --- | --- | --- |
| T0 | Abrir el registro, avisar a R1 y empezar la contención | §8.5 |
| T0 + 48 h, como máximo | Aviso inicial a todas las empresas afectadas, aunque falte información | §8.1, §8.3 |
| Cada 72 h, como máximo | Actualización a las empresas afectadas | §8.4 |
| Contención | Anotar la fecha en el registro | §8.4 |
| Contención + 15 días naturales, como máximo | Informe de cierre | §8.4 |
| Contención + 24 meses, como mínimo | Conservar el registro | §8.5 |

### Plazos de los proveedores

Son plazos del proveedor hacia Kontrol, no de Kontrol hacia sus clientes. Fuentes: [anexo de proveedores](anexo-proveedores.md), consultas del 16-10-2026 y del 26-10-2026 para Vercel.

| Proveedor | Aviso a Kontrol |
| --- | --- |
| Supabase | Sin demora indebida y, si es viable, dentro de 48 h (DPA §§6, 10 y 12) |
| Google Cloud Platform | Sin demora indebida (CDPA §7.2) |
| MongoDB Atlas | Sin demora indebida (DPA §§3.4, 4 y 9) |
| Vercel | Sin demora indebida tras confirmar el incidente (DPA §8.3) |
| Cloudinary | Sin acuerdo de tratamiento verificado; sus términos y su DPA están sin revisar (sustituyó a UploadThing el 04-11-2026). No hay compromiso verificado de aviso del proveedor |
| Proveedor del servidor IA ClawStitch | Sin identificar (condición A3 de la adenda) |

## 4. Campos del registro de incidentes

| Campo | Contenido |
| --- | --- |
| Identificador | Correlativo, por ejemplo `INC-2026-001` |
| T0 | Fecha y hora del conocimiento y cómo se supo (detección propia, cliente, proveedor) |
| Descripción | Qué ocurrió, cuándo empezó si se sabe y cómo se detectó |
| Sistemas | PostgreSQL, MongoDB, Cloudinary, servidor de aplicación, servidor IA, frontend, proveedor |
| Tipo de datos | Datos del Cliente, Datos de cuenta y operación o ambos (§1) |
| Empresas afectadas | `id_empresa` de cada una, o «todas» |
| Categorías y volumen | Categorías de datos y número aproximado de titulares y de registros |
| Consecuencias probables | Para los titulares y para los clientes |
| Medidas | Contención, corrección y prevención, con fecha |
| Avisos enviados | Por empresa: fecha y hora, medio, destinatarios y constancia |
| Actualizaciones | Fecha y resumen de cada una |
| Contención | Fecha y hora |
| Informe de cierre | Fecha de entrega y enlace al documento |
| Decisiones de los clientes | Si el cliente informó que comunicará a titulares o autoridades, cuando lo comunique |

El registro no debe copiar los datos personales afectados: basta con describir las categorías y el volumen.

## 5. Contactos de las empresas afectadas

Consulta de referencia sobre el esquema actual ([kontrol.sql](../../backend/kontrol.sql), tablas `empresa`, `empresa_usuario`, `rol_empresa` y `usuario`). Devuelve el propietario y los administradores activos de las empresas indicadas:

```sql
SELECT e.id_empresa,
       e.nombre        AS empresa,
       re.nombre       AS rol,
       u.nombre,
       u.apellido,
       u.email,
       u.telefono
FROM public.empresa e
JOIN public.empresa_usuario eu ON eu.id_empresa = e.id_empresa
JOIN public.rol_empresa re     ON re.id_rol_empresa = eu.id_rol_empresa
JOIN public.usuario u          ON u.id_usuario = eu.id_usuario
WHERE e.id_empresa = ANY($1::int[])
  AND re.nombre IN ('owner', 'admin')
  AND u.activo = true
ORDER BY e.id_empresa, re.nombre DESC, u.id_usuario;
```

- **Todas las empresas:** si el incidente afecta a todas, se quita la condición sobre `id_empresa`.
- **Correo genérico de la empresa:** `empresa.email` no sustituye a estos contactos. Solo se usa como contacto adicional.
- **Uso de la lista:** se usa solo para el aviso, en el registro se anota solo quién la obtuvo y cuándo, y no se exporta a otros sistemas.

## 6. Plantilla del aviso inicial

Asunto: **Kontrol · Aviso de incidente de seguridad · [identificador]**

> Estimado/a [nombre]:
>
> Le escribimos como propietario/a o administrador/a del espacio de empresa «[empresa]» en Kontrol para avisarle de un incidente de seguridad que afecta o puede afectar los datos de su negocio, conforme al §8 de la Adenda de tratamiento de datos.
>
> **Qué ocurrió:** [descripción breve]. Lo detectamos el [fecha y hora de T0].
> **Datos afectados:** [categorías], de aproximadamente [número] personas y [número] registros. [Si aún no se sabe: «Todavía estamos determinando el alcance».]
> **Consecuencias probables:** [descripción].
> **Qué hemos hecho:** [medidas adoptadas].
> **Qué le recomendamos hacer:** [por ejemplo, cambiar contraseñas, revisar los accesos de sus usuarios o desconectar una integración].
>
> Como responsable de esos datos, le corresponde decidir si debe comunicar el incidente a las personas afectadas o a una autoridad. Le daremos la información que necesite para hacerlo. Le enviaremos actualizaciones al menos cada 72 horas hasta contener el incidente, y un informe de cierre.
>
> Contacto: [persona R1], support@kontrol.it.com.

Las actualizaciones y el informe de cierre siguen la misma estructura e indican qué cambió desde el último envío.

## 7. Contención y preservación de evidencia

Lista de partida que P-3 debe completar con su propio procedimiento:

1. **Preservar la evidencia antes de redesplegar.** El despliegue recrea los contenedores y los registros de `stdout` pueden perderse ([inventario, §7](inventario-datos.md#7-logs-cachés-volúmenes-resultados-y-copias)). Primero hay que copiar los registros del backend, del proxy y del proveedor afectado.
2. **Rotar los secretos comprometidos o en duda.** Los nombres están en `docker-compose.prod.yml`: `JWT_SECRET`, `DATABASE_URL` y `POSTGRES_PASSWORD`, `MONGODB_URI`, `CLOUDINARY_API_SECRET`, `AGENT_API_KEY`, `GOOGLE_CLIENT_SECRET` y la clave de cifrado de integraciones (`INTEGRATION_ENCRYPTION_KEY` en `integrationService.js`).
3. **Cortar las sesiones.** En `develop`, la verificación de JWT no consulta `usuario.activo` ni `token_version` (inventario §8). La única forma de invalidar sesiones de inmediato es rotar `JWT_SECRET`, y eso cierra la sesión de todos los usuarios. P-1 (rama `feat/p1-export-delete-account`) añade esa consulta en `requireAuth`. Cuando se integre, incrementar `token_version` de los usuarios afectados invalidará sus peticiones HTTP sin cerrar las de los demás. Hay que comprobar aparte Socket.IO, que verifica el JWT por su cuenta.
4. **Credenciales de integraciones.** Si se expuso `credentials_enc` o la clave de cifrado, hay que pedir a los clientes afectados que regeneren las claves de sus proveedores (Slack, Teams, Telegram, Twilio, SendGrid y webhooks), porque son cuentas suyas.
5. **Avisar al proveedor** cuando el incidente provenga de él o lo afecte, y anotar su número de caso.
6. **Restaurar desde respaldo** solo con P-2 resuelto. Si se restaura, hay que volver a aplicar las eliminaciones pendientes (adenda §10.5).

## 8. Dependencias

| Depende de | Por qué |
| --- | --- |
| O01 · buzón operativo | R2 y el contacto de la plantilla |
| A9 de la adenda · compromisos de confidencialidad | Quien atienda el incidente verá Datos del Cliente |
| P-2 · respaldos | Restauración segura (§7.6) |
| O08 · revocación de sesiones | Sin ella, la contención depende de rotar `JWT_SECRET` (§7.3) |
| L-2 · anexo de proveedores | Lista de proveedores para R3 |

## 9. Cuándo se considera cumplida la condición A7 de la adenda

- R1 a R12 implementados y documentados en el procedimiento de P-3.
- Ensayo de R11 hecho, con todos los hitos de la §3 dentro de plazo.
- Matriz del [índice](README.md), fila O07, actualizada con la evidencia.
