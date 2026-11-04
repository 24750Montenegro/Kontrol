# Adenda de tratamiento de datos de Kontrol

**Versión 0.1 — BORRADOR INTERNO**  
**Fecha de elaboración: 26 de octubre de 2026 · tarea L-4**  
**Entrada en vigencia: PENDIENTE DE APROBACIÓN Y PUBLICACIÓN**

> **Requiere revisión profesional en Guatemala antes de cualquier uso comercial real.** Este borrador no está vigente, no se ha ofrecido a ningún cliente y no acredita que Kontrol ya cumpla lo que promete. Antes de incorporarlo a los Términos o de firmarlo deben cumplirse las condiciones de la [nota interna N4](#n4-condiciones-previas-a-la-vigencia). La parte I es el texto de la adenda. La parte II son notas internas del expediente que deben retirarse antes de publicar o firmar.

---

## Parte I. Texto de la adenda

### 1. Objeto y forma de incorporación

1.1. Esta adenda regula cómo trata Kontrol los datos personales de terceros (clientes, proveedores, trabajadores y otras personas) que un negocio carga en la plataforma. Esas personas no tienen una relación con Kontrol: su relación es con el negocio. La adenda reparte entre el negocio y Kontrol las obligaciones sobre esos datos.

1.2. La adenda forma parte de los Términos y Condiciones de Kontrol por referencia (§10 de los Términos). Al aceptar los Términos en nombre de un negocio, el Cliente acepta también esta adenda.

1.3. El Cliente que lo pida puede firmarla por separado con el formato del [Anexo D](#anexo-d-formato-para-firma-separada). Para ese Cliente rige la versión firmada; una versión posterior publicada en línea solo le aplica si la acepta por escrito.

1.4. Si esta adenda contradice los Términos o la Política de Privacidad en algo relativo a los Datos del Cliente, prevalece la adenda. La Política de Privacidad sigue rigiendo los tratamientos en los que Kontrol es responsable (§3.3).

### 2. Definiciones

| Término | Significado |
| --- | --- |
| **Kontrol** | El equipo que desarrolla y opera la plataforma Kontrol, identificado en el §1 de los Términos. En esta adenda actúa como **encargado del tratamiento**. |
| **Cliente** | La persona individual o jurídica que usa Kontrol para su negocio y es titular de un espacio de empresa en la plataforma. Actúa por medio de su propietario (*owner*) o de administradores con facultades suficientes. En esta adenda actúa como **responsable del tratamiento**. |
| **Usuarios autorizados** | Las personas a las que el Cliente da acceso a su espacio de empresa: propietario, administradores, miembros e invitados. |
| **Titulares** | Las personas físicas a las que se refieren los Datos del Cliente: clientes finales, proveedores y sus contactos, trabajadores y colaboradores del Cliente y cualquier otra persona mencionada en sus registros. |
| **Datos del Cliente** | Los datos personales de Titulares que el Cliente o sus Usuarios autorizados registran, cargan o generan en el espacio de empresa. El [Anexo A.1](#a1-descripción-del-tratamiento) enumera sus categorías. No incluyen los Datos de cuenta y operación. |
| **Datos de cuenta y operación** | Los datos que Kontrol trata para sus propios fines: registro, autenticación, inicio de sesión con Google, sesiones, prueba de aceptación, seguridad de la plataforma y registros técnicos. Los regula la Política de Privacidad. |
| **Tratamiento** | Cualquier operación sobre datos personales: recogerlos, registrarlos, almacenarlos, consultarlos, modificarlos, transmitirlos o suprimirlos. |
| **Subencargado** | El tercero que Kontrol contrata y que trata Datos del Cliente por cuenta de Kontrol para prestar el servicio. |
| **Proveedor del Cliente** | El servicio que el Cliente contrata por su cuenta y conecta a Kontrol con su propia clave, bot o webhook (por ejemplo Slack, Teams, Telegram, SMS, correo o un webhook propio). |
| **Incidente de seguridad** | Toda violación de la seguridad que cause la destrucción, pérdida o alteración accidental o ilícita de Datos del Cliente, o su comunicación o acceso no autorizados. |
| **Día hábil** | De lunes a viernes, salvo feriados oficiales en Guatemala. Cuando un plazo se fija en días naturales u horas, se cuentan todos los días. |

### 3. Roles de las partes

3.1. **El Cliente es el responsable** de los Datos del Cliente: decide qué datos registra, de qué personas, para qué los usa, a quién los envía y cuánto tiempo los conserva.

3.2. **Kontrol es el encargado** de los Datos del Cliente: los trata únicamente por cuenta del Cliente y para prestarle el servicio, conforme a sus instrucciones (§5.1).

3.3. La asignación de roles por tratamiento es la siguiente:

| Tratamiento | Cliente | Kontrol |
| --- | --- | --- |
| Registros del negocio: proveedores y sus contactos, productos e inventario, proyectos, tareas y asignaciones, presupuestos, reportes, ventas POS, marketing, notas y archivos adjuntos | Responsable | Encargado |
| Mensajes de chat y archivos que los Usuarios autorizados intercambian para el negocio | Responsable | Encargado |
| Consultas al asistente IA sobre los datos de la empresa, sus respuestas y el historial de conversaciones | Responsable | Encargado |
| Alertas que Kontrol envía a Proveedores del Cliente | Responsable. Además contrata a ese proveedor y responde por lo que este haga con lo recibido | Encargado hasta entregar el mensaje al destino configurado |
| Invitaciones: los datos de la persona invitada y el enlace que el Cliente genera y comparte | Responsable: decide a quién invita y con qué permisos | Encargado |
| Cuenta propia de cada usuario, autenticación, sesiones, inicio con Google, prueba de aceptación, prevención de abuso, seguridad de la plataforma y registros técnicos | Sin rol | Responsable, según la Política de Privacidad |
| Cumplimiento de una obligación legal propia de Kontrol o de un requerimiento de autoridad dirigido a Kontrol | Sin rol | Responsable, solo en lo que exija esa obligación (§5.3) |

3.4. **Regla residual.** Un tratamiento de Datos del Cliente que no figure en la tabla se considera hecho por Kontrol como encargado y por cuenta del Cliente, salvo que la Política de Privacidad lo identifique de forma expresa como tratamiento propio de Kontrol.

3.5. Si Kontrol tratara Datos del Cliente para una finalidad propia en contra de esta adenda, responderá como responsable de ese tratamiento, sin perjuicio de su incumplimiento frente al Cliente.

### 4. Obligaciones del Cliente

4.1. **Base legítima.** El Cliente garantiza que, para cada Titular, cuenta con su autorización o con otro fundamento legal suficiente para registrar sus datos en Kontrol y para cada uso que haga de ellos, incluidas las alertas a terceros y las consultas al asistente IA. Cargar datos en Kontrol no prueba esa autorización.

4.2. **Información a los Titulares.** El Cliente informa a los Titulares, antes de registrar sus datos o cuando sea posible después, de que se guardan en una herramienta de gestión operada por un tercero que los trata solo por cuenta del negocio, para qué se usan y cómo pueden ejercer sus derechos ante el negocio. El [Anexo C](#anexo-c-texto-modelo-para-informar-a-los-titulares) ofrece un texto modelo.

4.3. **Exactitud y pertinencia.** El Cliente registra solo los datos necesarios para su finalidad, los mantiene exactos y actualizados y corrige o elimina los que no lo estén. No carga contraseñas, números de tarjeta, documentos de identidad, datos bancarios, datos de salud ni datos de menores de edad salvo que sean necesarios y tenga fundamento para ello. No usa notas libres ni archivos adjuntos como depósito de información que no necesita.

4.4. **Instrucciones lícitas.** Las instrucciones del Cliente (§5.1) cumplen la ley aplicable a su negocio. El Cliente responde de las integraciones que configura, de contar con un contrato válido con cada Proveedor del Cliente y de estar autorizado a comunicarle los datos que envía.

4.5. **Usuarios autorizados.** El Cliente gestiona invitaciones y permisos, concede a cada persona solo el acceso que necesita, retira el acceso cuando termina la relación con un trabajador o colaborador y responde por los actos de sus Usuarios autorizados dentro de su espacio.

4.6. **Derechos de los Titulares.** El Cliente atiende las solicitudes de acceso, corrección, supresión y oposición de sus Titulares y sus reclamos, y responde frente a ellos. Kontrol lo asiste según el §9.

4.7. **Conservación.** El Cliente decide cuánto tiempo conserva cada dato y lo elimina cuando deja de necesitarlo, con las herramientas del §9.1.

4.8. **Seguridad de su lado.** El Cliente protege las credenciales y los dispositivos de sus Usuarios autorizados. Si detecta un acceso indebido o la pérdida de una credencial, avisa a Kontrol tan pronto como lo detecte y a más tardar dentro de 48 horas, al canal del §14.4.

4.9. **Comunicación de incidentes.** El Cliente decide si un Incidente de seguridad debe comunicarse a los Titulares o a una autoridad y lo comunica cuando la ley aplicable lo exija (§8.6).

### 5. Obligaciones de Kontrol

5.1. **Solo según instrucciones.** Kontrol trata los Datos del Cliente únicamente para prestar el servicio y conforme a las instrucciones del Cliente. Son instrucciones: (a) los Términos y esta adenda; (b) la configuración y las acciones que los Usuarios autorizados realizan en la plataforma dentro de sus permisos; y (c) las instrucciones escritas que el propietario o un administrador envíe al canal del §14.4.

5.2. **Instrucción ilícita.** Si Kontrol considera que una instrucción infringe la ley, lo informa al Cliente dentro de 5 días hábiles y puede dejar de ejecutar esa instrucción concreta hasta que el Cliente la confirme o modifique. El resto del servicio sigue funcionando.

5.3. **Obligación legal o requerimiento de autoridad.** Si la ley o una autoridad competente exige a Kontrol tratar o entregar Datos del Cliente, Kontrol lo informa al Cliente dentro de 5 días hábiles desde que lo reciba, salvo que la ley o la orden lo prohíban, y entrega solo lo que se le exige.

5.4. **Prohibición de usos propios.** Kontrol no vende, cede, alquila ni comercializa Datos del Cliente. No los usa para publicidad, perfiles ni estudios propios, no los combina con datos de otros clientes y no contacta a los Titulares por su cuenta. Solo los trata en lo necesario para prestar, mantener y proteger el servicio y para dar el soporte que el Cliente pida.

5.5. **Confidencialidad.** Solo acceden a Datos del Cliente los integrantes del equipo de Kontrol que lo necesitan para una de estas causas: soporte pedido por el Cliente, atención de un Incidente de seguridad, mantenimiento o corrección de una falla, o cumplimiento del §5.3. Cada integrante con acceso asume por escrito un compromiso de confidencialidad que subsiste al terminar su participación. Las cuentas con acceso global a la plataforma solo se usan para esas causas.

5.6. **Seguridad.** Kontrol aplica las medidas técnicas y organizativas del [Anexo B](#anexo-b-medidas-de-seguridad), adecuadas al riesgo del tratamiento. No reduce su nivel de protección durante la vigencia de la adenda. Las revisa al menos una vez cada 12 meses y después de cada Incidente de seguridad.

5.7. **Asistencia.** Kontrol asiste al Cliente con los derechos de los Titulares (§9), los Incidentes de seguridad (§8) y la demostración de cumplimiento (§11).

5.8. **Imposibilidad de cumplir.** Si Kontrol prevé que no podrá cumplir esta adenda, por ejemplo por un cambio legal o porque un Subencargado retira sus garantías, lo informa al Cliente dentro de 5 días hábiles desde que lo sepa. El Cliente puede entonces terminar la relación con los efectos del §10.

### 6. Entrenamiento y mejora de modelos de IA

6.1. **Kontrol no usa los Datos del Cliente para entrenar, reentrenar, ajustar (*fine-tuning*), evaluar ni mejorar modelos de inteligencia artificial, propios ni de terceros.** Esto incluye las preguntas al asistente, sus respuestas, el historial de conversaciones, los resultados de consultas, los mensajes, los archivos y cualquier otro Dato del Cliente.

6.2. La prohibición también cubre las versiones anonimizadas, agregadas o derivadas de los Datos del Cliente.

6.3. El asistente usa un modelo ya entrenado solo para generar la respuesta que pide el Usuario autorizado (inferencia). El historial se conserva para mostrárselo al usuario, no para entrenar.

6.4. Kontrol impone la misma prohibición a sus Subencargados y no contrata servicios de IA que se reserven el derecho de usar Datos del Cliente para esos fines.

6.5. Esta postura solo puede cambiar con una autorización previa, expresa, escrita y separada del Cliente, que este puede revocar en cualquier momento. No puede cambiarse modificando los Términos de forma general, ni por el silencio o el uso continuado del servicio. Si el Cliente no da esa autorización, el servicio no cambia.

### 7. Subencargados

7.1. **Autorización.** El Cliente autoriza a Kontrol a recurrir a los Subencargados del [Anexo A.2](#a2-subencargados-autorizados) para las funciones y datos que allí se indican.

7.2. **Garantías.** Kontrol solo usa Subencargados que, por contrato o acuerdo de tratamiento, se obliguen a la confidencialidad, a medidas de seguridad, a avisar a Kontrol de los incidentes, a eliminar los datos al terminar el servicio y a no usarlos para fines propios, incluido el entrenamiento de modelos. Kontrol mantiene publicada la lista vigente con el enlace al acuerdo de cada uno.

7.3. **Aviso de cambios.** Kontrol avisa al Cliente con **al menos 30 días naturales de anticipación** antes de que un nuevo Subencargado empiece a tratar Datos del Cliente, o antes de que uno existente cambie de forma relevante los datos que recibe o el país donde los trata. El aviso se envía por correo electrónico al propietario y a los administradores del espacio de empresa, se muestra dentro de la plataforma y se refleja en el Anexo A.2 con su fecha. Indica el nombre del Subencargado, el servicio que presta, los datos que recibirá, el país o región y el enlace a su acuerdo.

7.4. **Objeción.** El Cliente puede oponerse por escrito al canal del §14.4 dentro de esos 30 días, por un motivo relacionado con la protección de los datos. Kontrol responde dentro de 10 días hábiles. Mientras tanto no aplica el cambio a los Datos de ese Cliente. Kontrol puede: (a) evitar que el nuevo Subencargado trate los Datos de ese Cliente u ofrecer una configuración alternativa; o (b) si eso no es posible, el Cliente puede terminar la relación antes de que el cambio le aplique, sin penalización ni costo, con la ventana de exportación y la eliminación del §10. Si el Cliente no se opone dentro del plazo, el cambio se considera aceptado.

7.5. **Sustitución urgente.** Si un Subencargado deja de prestar el servicio o representa un riesgo inmediato para la seguridad, Kontrol puede sustituirlo sin el preaviso del §7.3. En ese caso avisa al Cliente por los mismos medios **dentro de 72 horas** desde la sustitución, y el Cliente conserva el derecho de objeción del §7.4 durante 30 días naturales desde el aviso.

7.6. **Proveedores del Cliente.** Los Proveedores del Cliente no son Subencargados de Kontrol. Kontrol solo les entrega los mensajes que el Cliente configura. El Cliente responde de su contrato con ellos y de lo que hagan con los datos recibidos. Si en el futuro Kontrol ofrece una de esas conexiones con una cuenta propia, ese proveedor pasará a ser Subencargado y se aplicará el §7.3.

7.7. **Responsabilidad.** Kontrol responde ante el Cliente por el cumplimiento de sus Subencargados como si se tratara de actos propios.

### 8. Incidentes de seguridad

8.1. **Plazo.** Kontrol avisa al Cliente de todo Incidente de seguridad que afecte o pueda razonablemente afectar sus Datos **sin dilación indebida y, a más tardar, dentro de 48 horas desde que tenga conocimiento de él**. Si el aviso le llega de un Subencargado, el plazo corre desde que Kontrol lo recibe.

8.2. **Medio.** El aviso se envía por correo electrónico a las direcciones del propietario y de los administradores del espacio de empresa registradas en Kontrol, y se muestra dentro de la plataforma. Si el incidente afecta al correo o el envío falla, Kontrol usa el teléfono del propietario, si lo registró. Kontrol conserva constancia del envío. El Cliente mantiene actualizados esos datos de contacto.

8.3. **Contenido.** El aviso indica, en lo que se conozca: qué ocurrió y cuándo se detectó; las categorías y el número aproximado de Titulares y de registros afectados; las consecuencias probables; las medidas adoptadas o propuestas, incluidas las que el Cliente debe tomar, como cambiar credenciales; y una persona de contacto. Si en 48 horas no se conoce todo, Kontrol envía lo que sepa y completa el resto por fases.

8.4. **Seguimiento.** Kontrol envía actualizaciones cada vez que obtenga información relevante y, como mínimo, cada 72 horas hasta contener el incidente. Entrega un informe de cierre **dentro de 15 días naturales** desde la contención.

8.5. **Contención y registro.** Kontrol toma sin demora las medidas razonables para contener el incidente y reducir sus efectos, preserva la evidencia y registra cada incidente con sus hechos, efectos y medidas. Conserva ese registro al menos 24 meses.

8.6. **Comunicación a Titulares y autoridades.** El Cliente, como responsable, decide y hace esas comunicaciones cuando la ley aplicable lo exija. Kontrol le entrega la información que necesite para hacerlo. Kontrol no se comunica con los Titulares ni con autoridades por cuenta del Cliente, salvo que el Cliente se lo pida por escrito o que la ley obligue directamente a Kontrol. En este último caso lo informa al Cliente antes, si la ley lo permite.

8.7. Avisar de un incidente no implica reconocer responsabilidad.

### 9. Derechos de los Titulares y cooperación

9.1. **Herramientas.** Kontrol pone a disposición del Cliente funciones para consultar, corregir, exportar y eliminar Datos del Cliente desde la plataforma.

9.2. **Solicitudes que llegan a Kontrol.** Si un Titular se dirige a Kontrol por Datos del Cliente, Kontrol no resuelve la solicitud por su cuenta. La reenvía al Cliente **dentro de 5 días hábiles** e informa al Titular de que la trasladó al negocio responsable. Si la solicitud se refiere a Datos de cuenta y operación, la atiende Kontrol según la Política de Privacidad.

9.3. **Asistencia adicional.** Si el Cliente no puede atender una solicitud con las herramientas del §9.1, Kontrol lo asiste **dentro de 10 días hábiles** desde que el Cliente se lo pida por escrito, sin costo.

9.4. **Requerimientos de autoridad.** Se aplica el §5.3. Kontrol coopera con el Cliente en la respuesta que este deba dar.

### 10. Fin de la relación

10.1. **Terminación.** La relación termina cuando: (a) el Cliente cierra su espacio de empresa o deja de usar el servicio y lo comunica; (b) Kontrol termina la relación por una causa del §13 de los Términos; (c) Kontrol cierra el servicio; o (d) el espacio de empresa se desactiva por quedarse sin propietario activo. La fecha del hecho es la **fecha de terminación**. Desactivar a un usuario concreto no termina la relación.

10.2. **Exportación antes de terminar.** Mientras la relación está vigente, el propietario o un administrador puede exportar en cualquier momento los Datos del Cliente: la exportación completa de la empresa en formato JSON, los reportes en PDF o CSV y los archivos adjuntos por medio de los enlaces de descarga incluidos en la exportación.

10.3. **Preaviso de Kontrol.** Kontrol avisa al Cliente con **al menos 30 días naturales de anticipación** antes de cerrar el servicio, o antes de terminar la relación por una causa que no exija actuar de inmediato. Si la causa exige actuar de inmediato (abuso en curso, riesgo urgente para la seguridad u orden de autoridad), la ventana del §10.4 se aplica igual, salvo que la ley o la orden lo impidan.

10.4. **Ventana de exportación.** Durante los **30 días naturales** siguientes a la fecha de terminación, Kontrol conserva los Datos del Cliente bloqueados para cualquier otro uso y permite al propietario exportarlos.

10.5. **Eliminación.**

| Soporte | Plazo máximo |
| --- | --- |
| Sistemas activos de Kontrol y de sus Subencargados: bases de datos, archivos, mensajes e historial del asistente | 30 días naturales después de vencida la ventana; es decir, **60 días naturales desde la fecha de terminación** |
| Copias de respaldo y registros técnicos que contengan Datos del Cliente | Se eliminan o sobrescriben **a más tardar 90 días naturales desde la fecha de terminación**. Hasta entonces quedan aisladas y no se restauran salvo para atender un incidente; si se restauran, la eliminación se vuelve a aplicar |

El Cliente puede pedir que la eliminación empiece antes, renunciando al resto de la ventana. En ese caso Kontrol la inicia dentro de 5 días hábiles desde la solicitud.

10.6. **Excepciones.** No se eliminan en esos plazos:

- (a) Los datos que Kontrol deba conservar por una obligación legal concreta. Kontrol informa al Cliente de qué datos son, qué norma lo exige y por cuánto tiempo; los mantiene bloqueados y los elimina al vencer ese plazo.
- (b) Los Datos de cuenta y operación, que siguen la Política de Privacidad.
- (c) Lo ya entregado a Proveedores del Cliente o descargado por Usuarios autorizados, que está fuera del control de Kontrol. Eliminarlo allí corresponde al Cliente.

10.7. **Constancia.** A pedido del Cliente, Kontrol entrega una constancia escrita de la eliminación dentro de 10 días hábiles desde que la concluya, o desde la solicitud si esta es posterior.

10.8. **Suspensión.** Una suspensión no es una terminación. Durante la suspensión los Datos del Cliente se conservan y el Cliente puede pedir su exportación al canal del §14.4.

### 11. Información, auditoría y cooperación

11.1. **Información a pedido.** El Cliente puede pedir al canal del §14.4, y Kontrol entrega **dentro de 15 días hábiles**:

- (a) la versión vigente de esta adenda y, si la firmó, la versión firmada;
- (b) la lista vigente de Subencargados, con el país o región conocido y el enlace a su acuerdo;
- (c) la descripción actualizada de las medidas de seguridad y de las limitaciones conocidas que afecten a sus Datos, con su plan de corrección;
- (d) la descripción de qué Datos del Cliente trata Kontrol y dónde, a partir del inventario de datos de Kontrol;
- (e) el registro de los Incidentes de seguridad que hayan afectado a sus Datos;
- (f) las constancias de eliminación emitidas;
- (g) las respuestas a un cuestionario razonable de seguridad y privacidad.

11.2. **Frecuencia.** El Cliente puede hacer este pedido una vez cada 12 meses sin costo, y además cada vez que ocurra un Incidente de seguridad que afecte a sus Datos, que una autoridad se lo requiera o que objete un Subencargado.

11.3. **Auditoría.** Si esa información no basta para demostrar el cumplimiento, o si una autoridad lo exige, el Cliente puede auditar el cumplimiento de esta adenda por sí o mediante un auditor independiente obligado a confidencialidad. Debe avisar por escrito con 30 días naturales de anticipación. La auditoría es documental o remota, se hace en días hábiles, la paga el Cliente y no da acceso a datos de otros clientes, a credenciales ni a secretos. Si revela un incumplimiento, Kontrol presenta un plan de corrección dentro de 15 días hábiles.

### 12. Responsabilidad frente a los Titulares

12.1. Cada parte responde por sus propios incumplimientos de esta adenda y de la ley. Ninguna cláusula excluye la responsabilidad por dolo o culpa propia ni limita derechos irrenunciables, en línea con el §12 de los Términos.

12.2. Ante el reclamo de un Titular, la responsabilidad se reparte así:

| Si el reclamo trata de… | Responde | Qué hace la otra parte |
| --- | --- | --- |
| Que sus datos se cargaron sin autorización o fundamento legal, o sin informarle | Cliente | Kontrol entrega la información del tratamiento que el Cliente necesite |
| Datos inexactos, desactualizados o excesivos | Cliente | Kontrol mantiene las herramientas de corrección y eliminación |
| Una solicitud de acceso, corrección, supresión u oposición | Cliente, que la atiende | Kontrol la reenvía en 5 días hábiles y asiste en 10 (§9) |
| El uso que el negocio hace de los datos: ofertas, cobros, contactos | Cliente | — |
| Lo que un Proveedor del Cliente hace con las alertas recibidas | Cliente, junto con ese proveedor | Kontrol informa qué envió y cuándo |
| Un uso de los datos por Kontrol fuera de las instrucciones, su venta o su uso para entrenar modelos | Kontrol | — |
| Un Incidente de seguridad causado por fallas de las medidas de Kontrol o de un Subencargado | Kontrol | El Cliente comunica a Titulares y autoridades si la ley lo exige (§8.6) |
| Un Incidente de seguridad causado por credenciales, dispositivos o permisos mal gestionados por el Cliente o sus Usuarios autorizados | Cliente | Kontrol asiste en la contención (§8.5) |
| La divulgación de datos por un integrante del equipo de Kontrol | Kontrol | — |
| Que los datos no se eliminaran en los plazos del §10 | Kontrol | — |

12.3. Si una parte paga a un Titular o a un tercero un daño que corresponde a la otra según esta tabla, puede reclamárselo en la proporción que le corresponda conforme a la ley.

### 13. Ubicación y transferencias

13.1. Los Datos del Cliente se tratan en Guatemala, donde está el servidor del asistente IA, y en los países donde operan los Subencargados del Anexo A.2, que pueden estar fuera de Guatemala. El Cliente autoriza esas transferencias en los términos del Anexo A.

13.2. Kontrol informa en el Anexo A.2 la región de cada Subencargado a medida que la confirme. Un país nuevo se comunica con el procedimiento del §7.3.

### 14. Vigencia, cambios, ley aplicable y contacto

14.1. **Vigencia.** La adenda rige desde que el Cliente acepta los Términos que la incorporan, o desde su firma, hasta que Kontrol termine de eliminar los Datos del Cliente según el §10. Las obligaciones de confidencialidad subsisten después.

14.2. **Cambios.** Kontrol publica cada nueva versión con su número y fecha. Los cambios que reduzcan la protección de los Datos del Cliente o modifiquen los plazos de esta adenda se avisan con al menos 30 días naturales de anticipación y requieren nueva aceptación. Si el Cliente no los acepta, puede terminar la relación con los efectos del §10. La postura del §6 solo cambia según el §6.5. Un cambio exigido por la ley se avisa tan pronto como sea posible.

14.3. **Ley aplicable.** La adenda se rige por las leyes de Guatemala, con los tribunales competentes del §15 de los Términos. Si por las circunstancias del Cliente resulta aplicable otra ley de protección de datos, el Cliente lo informa a Kontrol y las partes completan la adenda con las cláusulas que esa ley exija.

14.4. **Contacto.** Las comunicaciones del Cliente sobre esta adenda (instrucciones, objeciones, incidentes y pedidos de información) se envían a support@kontrol.it.com, indicando el espacio de empresa y, para incidentes, el asunto «Incidente de seguridad». Las comunicaciones de Kontrol se envían al correo del propietario y de los administradores registrados.

---

### Anexo A. Descripción del tratamiento y subencargados

#### A.1. Descripción del tratamiento

| Elemento | Descripción |
| --- | --- |
| Finalidad | Prestar al Cliente el servicio Kontrol: registro y gestión de empresas, proyectos, inventario, proveedores, tareas, presupuestos, reportes, ventas POS, marketing, chat, asistente IA y alertas. |
| Naturaleza | Alojamiento, registro, consulta, cálculo, presentación a Usuarios autorizados, envío a destinos configurados, exportación y eliminación. |
| Titulares | Clientes finales del negocio, proveedores y sus contactos, trabajadores y colaboradores, Usuarios autorizados en cuanto aparecen en registros del negocio (autoría, asignaciones) y otras personas mencionadas en notas, mensajes o archivos. |
| Categorías de datos | Identificación y contacto de proveedores y otras personas; autoría y asignación de tareas, evidencias, reportes y ventas; contenido libre de notas, descripciones y mensajes; archivos adjuntos, que pueden contener imágenes, voz o documentos; preguntas al asistente, sus respuestas y muestras de resultados de consultas; contenido de alertas; datos de invitación. |
| Datos sensibles | No previstos por el servicio. El Cliente solo los carga según el §4.3. |
| Duración | Durante la relación y hasta la eliminación del §10. |

#### A.2. Subencargados autorizados

Lista coherente con el [anexo de proveedores](anexo-proveedores.md) del inventario L-2 (fuentes consultadas el 16-10-2026). «Región desconocida» significa que aún no se ha verificado la ubicación real.

| Subencargado | Función | Datos del Cliente que recibe | País o región | Acuerdo de tratamiento |
| --- | --- | --- | --- | --- |
| Supabase (Supabase Pte. Ltd. o Supabase, Inc., según la vía de contratación) | Base de datos PostgreSQL | Todos los registros del negocio del A.1 | Región desconocida | [DPA de Supabase](https://supabase.com/legal/customer-resources/data-processing-addendum) |
| Google Cloud Platform (Google LLC, contraparte por verificar) | Servidor de la aplicación | Datos en tránsito y en memoria, archivos y registros técnicos del servidor | Región desconocida | [CDPA de Google Cloud](https://cloud.google.com/terms/data-processing-addendum) |
| MongoDB Atlas (MongoDB, Inc.) | Base de datos de mensajes e historial del asistente | Conversaciones, participantes, mensajes, referencias de adjuntos e historial del asistente | Región desconocida | [DPA de MongoDB](https://www.mongodb.com/legal/data-processing-agreement) |
| Cloudinary (entidad por confirmar) | Almacenamiento y entrega de archivos | Archivos adjuntos y evidencias con su nombre original, tipo, tamaño e identificadores | Región desconocida | Términos y acuerdo de tratamiento de Cloudinary por revisar |
| Proveedor de alojamiento del servidor IA ClawStitch (por identificar) | Infraestructura física del asistente IA | Preguntas, contexto de la cuenta y la empresa, historial reciente y muestras de hasta 20 filas de resultados | Guatemala, según declaración del equipo | Por identificar |

El software del asistente (ClawStitch, Qwen y vLLM) lo opera el propio equipo de Kontrol y no es un Subencargado. Si se configura un servidor TURN que retransmita el audio o el vídeo de las llamadas, se incorporará a esta lista según el §7.3.

#### A.3. Servicios que no son Subencargados de Kontrol

| Servicio | Por qué no es Subencargado |
| --- | --- |
| Slack, Microsoft Teams, Telegram, Twilio SMS, Twilio SendGrid y webhooks genéricos | Son Proveedores del Cliente: los contrata el Cliente y los conecta con su propia clave, bot o webhook (§7.6). La conexión con WhatsApp está preparada en el código, pero no está activa. |
| Google OAuth, Google Fonts, Icons8 y el servidor STUN de Google | Tratan Datos de cuenta y operación (inicio de sesión, IP y datos técnicos de la conexión) para fines propios de Kontrol, según la Política de Privacidad. El servidor STUN no recibe el audio ni el vídeo de las llamadas. |
| Vercel (Vercel Inc.) | Sirve los archivos de la interfaz. Recibe la IP y la ruta de cada carga de página, que son Datos de cuenta y operación, pero no los registros del negocio, que van directamente al servidor de la aplicación. |
| Stripe | Previsto solo para una demostración TEST con datos sintéticos. No recibe Datos del Cliente. |

### Anexo B. Medidas de seguridad

| Ámbito | Medida |
| --- | --- |
| Credenciales | Contraseñas guardadas con hash bcrypt. Credenciales de integraciones cifradas con AES-256-GCM. |
| Acceso | Autenticación con JWT firmado y con caducidad. Control de acceso por empresa, proyecto y rol. Límites de solicitudes en autenticación y en funciones costosas. |
| Asistente IA | Consultas solo de lectura sobre vistas limitadas al ámbito del usuario, creadas dentro de la transacción de cada consulta. Validación de SQL, límite de filas y tiempo máximo por consulta. |
| Integraciones | Firma HMAC opcional de los webhooks. |
| Transporte | HTTPS en el acceso a la aplicación y TLS hacia la base de datos. |
| Verificación | Pruebas de seguridad sobre la aplicación y auditoría automática de dependencias en la integración continua. |
| Organización | Acceso del equipo limitado según el §5.5, compromisos de confidencialidad, registro de incidentes (§8.5) y revisión anual de las medidas (§5.6). |

A pedido, Kontrol informa al Cliente de las limitaciones conocidas de estas medidas y de su plan de corrección (§11.1 c).

### Anexo C. Texto modelo para informar a los Titulares

Texto que el Cliente puede adaptar para cumplir el §4.2, por ejemplo en su factura, contrato, formulario o aviso de privacidad:

> «[Nombre del negocio] registra sus datos de contacto y la información de las operaciones que realiza con nosotros en Kontrol, una herramienta de gestión operada por un tercero que trata esos datos solo por nuestra cuenta y siguiendo nuestras instrucciones. Los usamos para [finalidades: gestionar pedidos, pagos a proveedores, inventario, etc.]. Puede pedirnos acceso, corrección o eliminación de sus datos escribiendo a [contacto del negocio].»

### Anexo D. Formato para firma separada

> **Adenda de tratamiento de datos entre el Cliente y Kontrol**
>
> **Cliente (responsable):** nombre o razón social ______; NIT ______; domicilio ______; representado por ______, en calidad de ______; correo para avisos ______.
>
> **Kontrol (encargado):** [integrantes del equipo, identificación, NIT y domicilio: PENDIENTES]; correo para avisos: support@kontrol.it.com.
>
> Las partes acuerdan la Adenda de tratamiento de datos de Kontrol, versión ____ de fecha ____, cuyo texto íntegro (parte I y anexos A a C) se adjunta y forma parte de este documento. Para este Cliente rige la versión firmada, conforme al §1.3.
>
> Lugar y fecha: ______
>
> Firma del Cliente: ______ Firma de Kontrol: ______

---

## Parte II. Notas internas del expediente

**No forman parte de la adenda. Deben retirarse antes de publicarla o firmarla.**

### N1. Estado

Borrador 0.1 elaborado el 26-10-2026 sobre `develop` en `1fd2300`. No hubo revisión jurídica, inspección de producción ni consulta nueva de contratos de proveedores: las cláusulas de proveedores proceden del anexo L-2, consultas del 16-10-2026. Antes de cualquier uso comercial real se necesita revisión profesional en Guatemala de todo el texto, en especial los §§4, 8, 10 y 12.

### N2. Coordinación con otras tareas

| Tarea | Qué se tomó de ella o qué se le pide |
| --- | --- |
| L-0 · [Marco legal](marco-legal.md) | Terminología *responsable*, *encargado* y *subencargado*, y reparto de roles («equipo responsable de fines propios y posible encargado de datos del negocio; negocio responsable de fines que decide»), opción B. Los titulares se llaman así igual que en la Política de Privacidad. No se importan obligaciones del RGPD como ley; el §14.3 prevé completarlas si otra ley se activa. |
| L-1 · [Términos](terminos-condiciones.md) | Esta entrega actualiza el borrador interno de los Términos (§§10, 13 y 16, versión 0.2): incorpora la adenda por referencia y fija su prevalencia. **Pendiente para la versión publicada en `/legal`** (`frontend/src/locales/*.json`, `legal.terms`): cuando se apruebe la adenda, añadir la cláusula de remisión propuesta abajo y subir `LEGAL_VERSION` en `frontend/src/utils/legal.js` para pedir de nuevo la aceptación. No se modificó la versión publicada porque la adenda no está vigente. Las remisiones de la adenda a los Términos (§§1, 10, 12, 13 y 15) usan la numeración del borrador interno; deben ajustarse a la numeración de la versión publicada. |
| L-2 · [Inventario](inventario-datos.md) y [anexo de proveedores](anexo-proveedores.md) | El Anexo A.2 reproduce las filas del anexo cuyo rol es subencargo con datos del negocio en cuenta del equipo (Supabase, GCP, MongoDB Atlas, Cloudinary y el hosting de ClawStitch). El A.3 recoge las filas BYOK, los receptores técnicos, Vercel y Stripe. Vercel se incorporó a L-2 en esta entrega (N5). |
| L-5 · Aviso de uso del asistente de IA | Tarea asignada a otro integrante; al 26-10-2026 no hay entrega en ninguna rama del repositorio. Cuando se redacte, debe repetir sin matices la postura del §6: ni entrenamiento ni mejora de modelos con Datos del Cliente, tampoco con datos derivados, y cambio solo con autorización separada. Ya coincide con `/legal` (Términos 9 y Aviso de Privacidad 3: «no los usamos para entrenar modelos») y con el §9 del borrador de Términos. La Política de Privacidad §5 dice que no se han verificado garantías de no entrenamiento en la infraestructura: el §6 es un compromiso de Kontrol y su verificación forma parte de la condición A3 (N4). Si L-5 se contradice con el §6, prevalece la adenda para los Datos del Cliente (§1.4). |
| P-1 · exportación y supresión | Lo implementado está en `feat/p1-export-delete-account`, **sin integrar en `develop`** al 26-10-2026: exportación JSON de la empresa para propietario y administradores, y baja de la cuenta propia con limpieza diferida de MongoDB. La rama `feat/p1-company-closure`, construida sobre la anterior, implementa el cierre de empresa del §10. Incluye la ventana de 30 días con exportación y anulación, el borrado de filas, archivos de evidencia e historial del asistente a más tardar a los 60 días, la constancia consultable y el cierre automático cuando la empresa queda sin propietario activo. Falta:<br>· el plazo de 90 días para respaldos y registros técnicos (P-2 y O09);<br>· los adjuntos de chat, que no pertenecen a una empresa;<br>· una vía documentada para que Kontrol cierre una empresa por causa propia (hoy, una cuenta `super_user` con el mismo endpoint). |
| P-2 · respaldos | La retención de respaldos debe ser como máximo de 90 días para que el §10.5 se pueda cumplir. |
| P-3 · brechas | Todavía no ha empezado. La [referencia para P-3](referencia-p3-incidentes.md) fija sus requisitos (R1–R12), la línea de tiempo, los campos del registro, la consulta de contactos, la plantilla de aviso y la lista de contención que sostienen el §8. Los plazos de los proveedores encajan con el de 48 horas: Supabase avisa en 48 h cuando es viable, y GCP, MongoDB y Vercel «sin demora indebida». |

**Cláusula de remisión propuesta para los Términos publicados** (nueva cláusula tras la 9):

> «10. Datos de tus clientes, proveedores y trabajadores. Cuando registras en Kontrol datos de otras personas, tu negocio es el responsable de esos datos y Kontrol los trata solo por tu cuenta y siguiendo tus instrucciones. Las obligaciones de cada parte, los proveedores que usamos, el aviso de incidentes de seguridad y lo que pasa con los datos al terminar el servicio se regulan en la Adenda de tratamiento de datos, que forma parte de estos Términos. Puedes pedir firmarla por separado escribiendo a {email}.»

### N3. Plazos fijados en esta adenda

Son decisiones de este borrador. El equipo debe confirmarlos antes de la revisión profesional y verificar que pueden cumplirse.

| Plazo | Valor | Criterio |
| --- | --- | --- |
| Aviso de incidente al Cliente (§8.1) | 48 h desde el conocimiento | Deja margen al Cliente si debe notificar en 72 h, como en el RGPD art. 33 (referencia del Marco legal E1, no obligación actual). Es compatible con los plazos de los Subencargados. |
| Actualizaciones e informe de cierre (§8.4) | Cada 72 h; cierre en 15 días naturales | Seguimiento proporcional para un equipo pequeño. |
| Aviso de nuevo Subencargado y objeción (§7.3–7.4) | 30 días naturales; respuesta en 10 días hábiles | Tiempo suficiente para que un microempresario evalúe el cambio y, si objeta, exporte sus datos. El anexo L-2 no fija un plazo de referencia. |
| Sustitución urgente (§7.5) | Aviso en 72 h | Caída o riesgo de un proveedor. |
| Reenvío de solicitudes de Titulares (§9.2) | 5 días hábiles | Permite al Cliente responder dentro del plazo de un mes del RGPD si llegara a aplicarle. |
| Asistencia y pedidos de información (§§9.3, 11.1) | 10 y 15 días hábiles | Carga razonable para el equipo. |
| Exportación y eliminación (§10.4–10.5) | 30 días de ventana; 60 días para sistemas activos; 90 días para respaldos y registros | Ventana igual a la de Supabase (DPA §11.2). Requiere completar P-1 y P-2. |
| Preaviso de cierre (§10.3) | 30 días naturales | Llena el vacío que el §13 de los Términos deja «sin plazo de preaviso acreditado». |
| Registro de incidentes (§8.5) | 24 meses | Permite responder pedidos de información (§11.1 e). |

### N4. Condiciones previas a la vigencia

Mientras alguna siga abierta, la adenda no debe ofrecerse ni firmarse, porque prometería algo que hoy no se puede cumplir.

| ID | Condición | Relación con la matriz del [índice](README.md) |
| --- | --- | --- |
| A1 | Identificar a los integrantes que contratan, su NIT y domicilio, y comprobar que el buzón support@kontrol.it.com recibe y responde. | O01 |
| A2 | Revisar los Términos y el acuerdo de tratamiento de Cloudinary, que sustituyó a UploadThing el 04-11-2026, y confirmar la región de la cuenta. | O03 |
| A3 | Identificar el hosting de ClawStitch, su contrato, accesos, registros y retención, y confirmar que no usa los datos para entrenar. Sin esto el Anexo A.2 queda incompleto y el §6.4 no se puede verificar. | O10 |
| A4 | Confirmar titular, cuenta, versión aceptada del DPA y región de Supabase, GCP y MongoDB Atlas, o reemplazar la fila por el proveedor que realmente se use. | O03 |
| A5 | Integrar en `develop` el cierre de empresa de `feat/p1-company-closure` (ventana de 30 días, eliminación a los 60 y constancia del §10.7) y verificarlo en el despliegue. | O05 |
| A6 | Definir en P-2 respaldos con retención de 90 días o menos. | O06 |
| A7 | Implementar en P-3 el procedimiento que sostiene el §8, incluido el aviso por correo y dentro de la plataforma, según la [referencia para P-3](referencia-p3-incidentes.md#9-cuándo-se-considera-cumplida-la-condición-a7-de-la-adenda). | O07 |
| A8 | Corregir los defectos de aislamiento y revocación del inventario §8 (tareas, evidencias, subidas, chat sin empresa, sesiones no revocadas) y verificar en el despliegue el HTTPS y el TLS hacia la base de datos que declara el Anexo B. El §5.6 y el Anexo B no deben ofrecerse con esos puntos abiertos. | O08, O09 |
| A9 | Firmar compromisos de confidencialidad de los integrantes con acceso (§5.5) y limitar el uso de las cuentas de acceso global a las causas del §5.5. | O12 |
| A10 | Prueba de aceptación: hoy la aceptación de los Términos solo se guarda en el navegador. Para que la incorporación por referencia sea demostrable hace falta registro en el servidor, o la firma separada del Anexo D. | O04 |
| A11 | Vercel: confirmar titular y plan de la cuenta, contratar Pro o Enterprise antes de cualquier uso comercial (el plan Hobby es solo no comercial), confirmar que su DPA cubre ese plan y dejar de enviar el JWT en la query de `/auth/callback` (N5). | O03, O08 |

### N5. Vercel: discrepancia con L-2, resuelta

`develop` incluye desde el PR #158 (`ba7c2b7`, `frontend/vercel.json`) la configuración para servir el frontend en **Vercel**, y `FRONTEND_URL` admite dominios `*.vercel.app` (`backend/src/utils/frontendUrl.js`). Vercel no figuraba en el inventario ni en el anexo de proveedores, cuyo corte es del 16-10-2026. En esta entrega se añadió a ambos, con sus términos y su DPA consultados el 26-10-2026, y se clasificó como receptor técnico en el Anexo A.3: sirve archivos estáticos y no recibe los registros del negocio.

Quedan tres puntos abiertos (condición A11):

- **Plan:** el plan Hobby solo admite uso personal o no comercial. Todo uso comercial exige Pro o Enterprise.
- **DPA:** los Términos de Vercel lo incorporan por referencia, pero el propio DPA dice aplicar a Pro y Enterprise.
- **JWT en la URL:** la redirección de OAuth `/auth/callback?token=…` lleva el JWT de sesión en la URL (inventario §5), así que queda en los registros de acceso de Vercel. Es un hallazgo de seguridad que conviene corregir aparte, con un intercambio por código de un solo uso o un fragmento `#` que el navegador no envía al servidor.

### N6. Verificación de los criterios de aceptación

| Criterio | Dónde se cumple |
| --- | --- |
| Roles definidos con la terminología de L-0 | §3, con tabla por tratamiento y regla residual (§3.4) |
| Cada obligación atribuida a una parte, sin zonas grises | §4 Cliente, §5 Kontrol y tabla de responsabilidad del §12.2 |
| Postura sobre entrenamiento, sin ambigüedad | §6: prohibición total, incluidos los datos derivados y los Subencargados; cambio solo con autorización expresa y separada |
| Subencargados coherentes con L-2 | Anexos A.2 y A.3, correspondencia en N2; Vercel incorporado a L-2 (N5) |
| Plazos concretos | §§4.8, 5.2, 5.3, 5.8, 7.3–7.5, 8.1–8.5, 9.2–9.3, 10.3–10.7, 11.1–11.3 y 14.2; resumen en N3 |
| Nota de revisión profesional | Encabezado y N1 |
| Incorporable por referencia o firmable aparte | §1.2–1.4, Anexo D y remisión en los Términos (N2) |

| Historial | Cambio |
| --- | --- |
| 26-10-2026 · 0.1 | Redacción inicial interna (L-4). Sin revisión profesional, aprobación, publicación ni vigencia. |
