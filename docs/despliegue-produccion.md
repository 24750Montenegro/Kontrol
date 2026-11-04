# Despliegue de producción

Estado del servidor de producción de Kontrol, decisión de topología y procedimiento de despliegue. Responde a PROD-1 (SCRUM-94).

Estado verificado el **14/10/2026** sobre la VM y desde una red externa.

> **Cambio de VM (04/11/2026).** Producción pasa a la VM de Google Cloud `kontrol-staging` (proyecto `kontrol-staging-jfm`, zona `us-central1-a`, e2-micro: 1 GB de RAM, 2 GB de swap, 30 GB de disco), IP `35.202.118.162`, dominio `kontrol.it.com`, y se despliega sola con cada push a `main` (§5). El repositorio pasa a `24750Montenegro/Kontrol`. Cambios respecto de la VM anterior:
>
> - Las imágenes de backend y frontend se construyen fuera de la VM (runner de GitHub Actions) y se cargan con `docker load`: compilar el frontend en 1 GB de RAM tarda demasiado.
> - MongoDB corre en la propia VM (contenedor `mongo`, replica set `rs0`), salvo que `MONGODB_URI` apunte a otro cluster. Ya no se usa Atlas por defecto.
> - Los archivos (adjuntos del chat y evidencias) van a Cloudinary en lugar de UploadThing.
> - El staging que corría en esa VM (`staging.kontrol.it.com`, proyecto de compose `kontrol-staging`) se dio de baja el 04/11/2026 con sus volúmenes de Postgres, Mongo y Caddy. Producción arranca con una base vacía, inicializada con `backend/kontrol.sql`.
>
> Las secciones 1 a 4 y 6 a 8 describen todavía la VM anterior (`34.121.51.151`) hasta que se verifique la nueva.

---

## 1. Resumen

| Elemento | Valor |
|---|---|
| URL pública | <https://34.121.51.151.nip.io> |
| Comprobación de salud | <https://34.121.51.151.nip.io/api/health> |
| Certificado | Let's Encrypt, emitido por Caddy de forma automática. Válido del 26/09/2026 al 25/12/2026; Caddy lo renueva solo |
| VM | Google Cloud, 2 vCPU, disco de 8.6 GB, IP `34.121.51.151` |
| Versión desplegada | `c06b6bd` (merge del PR #149 en `develop`), contenedores levantados el 14/10/2026 20:56 UTC |
| Ambiente de pruebas | Retirado (ver §2) |

---

## 2. Topología

**Decisión:** la VM aloja **solo producción**. El ambiente de pruebas (SCRUM-25, `test.34.121.51.151.nip.io`) se retiró en el PR #149.

**Razones:**

- **Espacio.** El disco de 8.6 GB llegó al 98 % el 26/09/2026 y se llenó por completo el 01/10/2026, lo que rompió el build. Dos stacks completos (imágenes, contenedores y caché de build de cada uno) no caben con margen.
- **Base de pruebas sin servicio.** La base del ambiente de pruebas estaba en Supabase, en el plan gratuito, y excedió la cuota.
- **Sin uso.** Ninguna tarea abierta del sprint requiere el ambiente de pruebas. Las pruebas automatizadas corren en CI contra bases desechables.

Separar producción en otra VM no hace falta mientras no exista un ambiente de pruebas. Si se vuelve a necesitar, debe ir en otra VM o en un disco más grande, no en esta.

### Componentes

```
Internet ──443/80──► caddy (TLS, proxy) ──► frontend (nginx + SPA)
                                                │  /api, /socket.io
                                                ▼
                                             backend (Express) ──► postgres (local, volumen)
                                                │
                                                └──► MongoDB Atlas (chat y agente)
```

| Contenedor | Imagen | Persistencia |
|---|---|---|
| `kontrol-caddy-1` | `caddy:2-alpine` | `kontrol_caddy_data`, `kontrol_caddy_config` (certificados) |
| `kontrol-frontend-1` | build de `frontend/Dockerfile` | — |
| `kontrol-backend-1` | build de `backend/Dockerfile` | — |
| `kontrol-postgres-1` | `postgres:16-alpine` | `kontrol_postgres_data` |

Definición: `docker-compose.prod.yml` y `Caddyfile`. Proyecto de compose: `kontrol`. Checkout en `/app/Kontrol`.

---

## 3. Bases de datos

| Base | Producción | Antiguo ambiente de pruebas | ¿Separadas? |
|---|---|---|---|
| PostgreSQL | Contenedor `postgres` en la misma VM, volumen `kontrol_postgres_data` | Supabase (`aws-1-us-east-2.pooler.supabase.com`) | **Sí.** Verificado: el `DATABASE_URL` del backend apunta al host `postgres` del compose |
| MongoDB | Atlas, cluster `p6drz4j` | El mismo cluster | **No.** Pruebas no tenía su propio `MONGODB_URI`. Al retirarse pruebas lo usa solo producción, pero puede contener datos de chat generados en pruebas |

Contenido de la base de producción el 14/10/2026: 37 usuarios, 25 empresas, 43 proyectos.

Producción no carga `seed.js`: la base se inicializa con `backend/kontrol.sql` la primera vez que se crea el volumen. Hay 9 cuentas `*.neurolab@kontrol.test` creadas para las sesiones con usuarios; no vienen del sembrado de pruebas.

---

## 4. Espacio en disco

| Momento | Usado | Libre | Fuente |
|---|---|---|---|
| 26/09/2026 | 98 % | — | DT-21, `docs/deuda-tecnica.md` |
| 01/10/2026 | 100 % | 0 | Build fallido con `ENOSPC`. Se limpiaron caché de build, snaps viejos y journal, y se dieron de baja los contenedores e imágenes de pruebas |
| 14/10/2026 | 6.6 GB (77 %) | 2.0 GB | `df -h /` tras el despliegue del PR #149 |

Desglose de Docker el 14/10/2026 (`docker system df`):

| Tipo | Tamaño | Recuperable |
|---|---|---|
| Imágenes (4) | 1.67 GB | 0 |
| Volúmenes (4) | 68 MB | 0 |
| Caché de build | 812 MB | 23 MB |

Journal de systemd: 51 MB.

---

## 5. Procedimiento de despliegue

Desde el 04/11/2026 el despliegue es **automático**: cada push a `main` (en la práctica, el merge de un PR o del release `develop → main`) dispara `.github/workflows/deploy.yml`, que corre `scripts/deploy.sh` en el runner contra la VM `35.202.118.162`. También se puede lanzar a mano desde *Actions → Deploy → Run workflow*. Un solo despliegue corre a la vez; el que está en curso nunca se cancela.

### Requisitos (una sola vez)

1. **Clave de despliegue.** Generar un par de claves solo para GitHub Actions y autorizar la pública en la VM (en `~/.ssh/authorized_keys` del usuario que despliega, o en los metadatos SSH de la VM en Google Cloud):

   ```bash
   ssh-keygen -t ed25519 -N "" -C "github-actions-deploy" -f kontrol_deploy
   ```

   Ese usuario debe poder usar `docker` sin `sudo` (grupo `docker`), y el firewall de la VM debe aceptar SSH (puerto 22) desde fuera, porque los runners de GitHub no tienen IP fija. En la VM actual el usuario `kontrol` ya cumple ambas cosas y la regla `default-allow-ssh` está abierta. La clave de Actions (`github-actions-deploy@kontrol`, huella `SHA256:VpRGUjgHUJyBUct1bt6dHtX5lO4xweA05u1SNTMIvGQ`) se autorizó el 04/11/2026 en `/home/kontrol/.ssh/authorized_keys` con `no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty`.
2. **Configuración.** Copiar `.env.deploy.example` a `.env.deploy` (está en `.gitignore`) y llenar los valores. Pídelos a quien administra la VM por un canal privado; **nunca** por el repositorio ni por chat de grupo.
   - `VM_USER`: el usuario de la VM al que se le autorizó la clave.
   - `POSTGRES_PASSWORD`: la misma con la que se creó el volumen de Postgres de la VM; Postgres solo la lee al crear el volumen.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: en la consola de Cloudinary, *Settings → API Keys*. El *cloud name* aparece arriba de esa página (también en el *Dashboard*); no es el nombre de la clave. Sin ellas no se pueden subir adjuntos ni evidencias.
   - `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: en Google Cloud Console, *APIs & Services → Credentials*, en el cliente *OAuth 2.0 Client IDs* de tipo *Web application*. Opcionales: sin ellas el inicio de sesión con Google queda deshabilitado.
3. **Secrets del environment `DEPLOY_ENV`** (*Settings → Environments → DEPLOY_ENV → Add environment secret*): uno por variable de `.env.deploy.example`, con el mismo nombre. Allí `SSH_KEY` es el **contenido** de la clave privada (`kontrol_deploy`, no la `.pub`), no una ruta.
   - Obligatorios: `VM_IP`, `VM_USER`, `SSH_KEY`, `POSTGRES_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL`.
   - Recomendados: `PUBLIC_HOST`, `JWT_EXPIRES_IN`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
   - Opcionales: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `MONGODB_URI`, `AGENT_*`, `STRIPE_*`, `VITE_*`. Un secret que no existe llega vacío.

   El despliegue automático solo lee estos secrets; `.env.deploy` es para desplegar a mano. Al cambiar un valor, cámbialo en los dos.
4. **DNS y OAuth.** El registro A de `kontrol.it.com` (`@`) debe apuntar a `35.202.118.162`, y el CNAME de `www` a `kontrol.it.com.`; Caddy emite los dos certificados en el primer despliegue con el DNS ya propagado y redirige `www` al dominio principal con un 301. `https://kontrol.it.com/api/auth/google/callback` debe estar en *Authorized redirect URIs* del cliente OAuth en Google Cloud Console.

### Desplegar a mano

Sigue funcionando, con tu propia clave (`SSH_KEY` en `.env.deploy`) y Docker en tu máquina, que es donde se construyen las imágenes:

```bash
git checkout main
git pull
./scripts/deploy.sh
```

El script se niega a seguir si hay cambios sin commit o si la rama local no coincide con `origin`. Despliega la rama actual; para desplegar otra sin cambiarte, usa `GIT_REF=main ./scripts/deploy.sh`.

> **Solo se despliega `main`.** Desplegar `develop` u otra rama a mano pone esa rama en producción.

Pasos que ejecuta. `IMAGE_TAG` son los primeros 12 caracteres del commit de `origin/<rama>` verificado al empezar:

1. **Imágenes.** Construye `kontrol-backend:<IMAGE_TAG>` y `kontrol-frontend:<IMAGE_TAG>` en la máquina que despliega, a partir de `git archive` del commit (sin `node_modules` ni archivos sin commit).
2. **Configuración.** Copia a `/app/Kontrol` en la VM solo lo que usa el compose (`docker-compose.prod.yml`, `Caddyfile`, `backend/kontrol.sql`, `scripts/mongo-replica-health.js`) y escribe `.env` (permisos `600`) por stdin, no dentro del comando remoto.
3. **Carga.** `docker save | gzip | ssh docker load`.
4. **Arranque.** `docker compose up -d --no-build`: como el tag cambia, recrea `backend` y `frontend`; `postgres`, `mongo` y `caddy` solo si cambió su definición. Si faltara una imagen, falla en lugar de compilar en la VM.
5. **Verificación.** Espera hasta 3 min a que `http://localhost:3000/api/health` responda; si no, imprime el estado de los contenedores y las últimas 120 líneas del log del backend y termina con error.
6. **Versión desplegada** (DT-21). Comprueba que `backend` y `frontend` corren exactamente la imagen recién construida (el ID se conserva en `save`/`load`). Conserva la versión anterior de cada imagen para volver atrás y borra las demás. Avisa si el disco pasa del 85 %.
7. **Acceso público.** Pide `FRONTEND_URL/api/health` desde fuera de la VM. Si no responde (DNS sin propagar, certificado pendiente), solo avisa.

### Después de desplegar

```bash
curl -fsS https://kontrol.it.com/api/health
```

Debe responder `{"status":"ok",...}`. Luego abre la URL en el navegador e inicia sesión.

### Volver a una versión anterior

No hay rollback automático. Lo normal es revertir en `main` (`git revert <commit>`, PR, merge), lo que vuelve a desplegar. Para volver ya a la versión anterior, que la VM conserva:

```bash
cd /app/Kontrol
docker images kontrol-backend          # el segundo tag es la versión anterior
sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=<tag-anterior>/' .env
docker compose -f docker-compose.prod.yml up -d --no-build
```

El siguiente despliegue reescribe `.env`. Los datos de Postgres y Mongo viven en sus volúmenes y no se tocan al redesplegar.

### Comandos útiles en la VM

```bash
cd /app/Kontrol
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=200 backend
df -h /
docker system df
free -m                      # 1 GB de RAM: vigilar el swap
```

---

## 6. Flujos verificados

### Comprobaciones automáticas (14/10/2026, desde red externa, sin modificar datos)

| Comprobación | Esperado | Resultado |
|---|---|---|
| `GET /` (SPA) | 200 | ✅ 200 |
| `GET /login` | 200 | ✅ 200 |
| `GET /api/health` | 200, `status: ok` | ✅ 200, `{"status":"ok"}` |
| `POST /api/auth/login` con credenciales inexistentes | 401 | ✅ 401 |
| `GET /api/projects` sin token | 401 | ✅ 401 |
| `GET /api/agent/status` sin token | 401 | ✅ 401 |
| Certificado TLS | Válido | ✅ Let's Encrypt, vence el 25/12/2026 |
| Puerto 3000 (backend) desde fuera | Cerrado | ✅ Filtrado |

### Flujos de usuario

Pendientes de verificar a mano en el navegador sobre producción, con una cuenta de producción (no una cuenta sembrada).

| Flujo | Resultado | Observaciones |
|---|---|---|
| Alta de cuenta | Pendiente | |
| Inicio de sesión (correo y Google) | Pendiente | |
| Dashboard | Pendiente | |
| Inventario | Pendiente | |
| Punto de venta | Pendiente | |
| Presupuesto | Pendiente | |
| Asistente (agente de IA) | Pendiente | |

---

## 7. Monitoreo

| Elemento | Estado |
|---|---|
| Endpoint de salud (`/api/health`) | ✅ Existe; `deploy.sh` lo comprueba al terminar cada despliegue |
| Comprobación periódica de salud con alerta | ❌ No configurada |
| Alerta de espacio en disco | ❌ No configurada. La VM no tiene `cron` instalado ni timers propios de systemd |
| Rotación de logs de contenedores | ⏳ Configurada en `docker-compose.prod.yml` desde el 26/10/2026 (3 × 10 MB por contenedor); se aplica en el siguiente despliegue. Al 14/10/2026 los cuatro contenedores usaban `json-file` sin `max-size` (DT-21) |

---

## 8. Riesgos y pendientes

| # | Severidad | Hallazgo | Acción propuesta |
|---|---|---|---|
| 1 | Alta | Sin rotación de logs ni alerta de disco: el incidente del 01/10 puede repetirse | Rotación en el compose y aviso de disco en `deploy.sh` desde el 26/10/2026. Falta un timer de systemd o un monitor externo para disco y salud (DT-21, a futuro) |
| 2 | Media | `/app/Kontrol/.env` tiene permisos `664`: cualquier usuario de la VM lee los secretos | Corregido el 04/11/2026: `deploy.sh` escribe el `.env` con permisos `600` |
| 3 | Media | `deploy.sh` pasa el `.env` codificado en base64 dentro del comando remoto: se ve en `ps` durante el despliegue (DT-27) | Corregido el 04/11/2026: el `.env` viaja por stdin |
| 4 | Media | El checkout de la VM está en la rama local `main`, pero contiene `develop` (`c06b6bd`); `origin/main` aún no incluye el PR #149 | Hacer el release `develop → main` y desplegar desde `main`, como indica §5 |
| 5 | Baja | MongoDB compartido históricamente con pruebas (§3) | Base de Mongo propia para producción, o limpiar los datos de pruebas |
| 6 | Baja | El HTML del SPA no emitía cabeceras de seguridad y nginx exponía su versión (DT-19) | Corregido en `frontend/nginx.conf.template` el 26/10/2026; se aplica en el siguiente despliegue |
| 7 | Baja | 812 MB de caché de build en un disco con 2.0 GB libres | `docker builder prune` periódico o dentro de `deploy.sh` |
