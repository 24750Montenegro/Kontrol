#!/usr/bin/env bash
# deploy.sh — Despliega Kontrol en la VM de producción (Google Cloud, e2-micro).
# Uso: ./scripts/deploy.sh
# Lo corre .github/workflows/deploy.yml en cada push a main, y también se
# puede correr a mano (necesita Docker local). Variables opcionales del entorno:
#   GIT_REF          rama a desplegar (por defecto, la rama actual)
#   DEPLOY_ENV_FILE  archivo de configuración (por defecto, .env.deploy)
#   DEPLOY_SSH_KEY   clave SSH; tiene prioridad sobre SSH_KEY del archivo
#
# La VM tiene 1 GB de RAM: compilar ahí el frontend tarda demasiado. Las
# imágenes se construyen en esta máquina a partir del commit exacto (git
# archive, sin node_modules ni archivos sin commit) y se cargan en la VM con
# docker save | ssh docker load. En la VM solo viven los archivos de
# configuración que usa el compose y los volúmenes de datos.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${DEPLOY_ENV_FILE:-$ROOT/.env.deploy}"
GIT_REF="${GIT_REF:-$(git -C "$ROOT" rev-parse --abbrev-ref HEAD)}"
APP_DIR=/app/Kontrol
COMPOSE="docker compose -f docker-compose.prod.yml"
# Lo que el compose necesita en la VM, además de las imágenes.
RUNTIME_FILES="docker-compose.prod.yml Caddyfile backend/kontrol.sql scripts/mongo-replica-health.js"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: no existe $ENV_FILE"
  echo "Cópialo desde .env.deploy.example y rellena los valores."
  exit 1
fi

set -a
# Sin los \r de un archivo guardado en Windows, que quedarían dentro de cada valor.
# shellcheck disable=SC1090
source <(tr -d '\r' < "$ENV_FILE")
set +a

SSH_KEY="${DEPLOY_SSH_KEY:-${SSH_KEY:-}}"

PUBLIC_HOST="${PUBLIC_HOST:-${FRONTEND_URL#*://}}"
PUBLIC_HOST="${PUBLIC_HOST%%/*}"

if [ -n "$(git -C "$ROOT" status --porcelain)" ]; then
  echo "Error: tienes cambios locales sin commit. Este deploy solo sube lo que exista en origin/$GIT_REF."
  echo "Haz commit y push antes de desplegar."
  exit 1
fi

if git -C "$ROOT" show-ref --verify --quiet "refs/remotes/origin/$GIT_REF"; then
  LOCAL_SHA="$(git -C "$ROOT" rev-parse HEAD)"
  REMOTE_SHA="$(git -C "$ROOT" rev-parse "origin/$GIT_REF")"
  if [ "$LOCAL_SHA" != "$REMOTE_SHA" ]; then
    echo "Error: tu branch local no coincide con origin/$GIT_REF."
    echo "Haz push antes de desplegar para que el servidor reciba estos cambios."
    exit 1
  fi
else
  echo "Error: no existe origin/$GIT_REF."
  echo "Haz push de la rama primero o exporta GIT_REF=<rama-remota>."
  exit 1
fi

: "${VM_IP:?Falta VM_IP en .env.deploy}"
: "${VM_USER:?Falta VM_USER en .env.deploy}"
: "${SSH_KEY:?Falta SSH_KEY en .env.deploy}"
: "${POSTGRES_PASSWORD:?Falta POSTGRES_PASSWORD en .env.deploy}"
: "${JWT_SECRET:?Falta JWT_SECRET en .env.deploy}"
: "${FRONTEND_URL:?Falta FRONTEND_URL en .env.deploy}"
: "${PUBLIC_HOST:?No se pudo derivar PUBLIC_HOST desde FRONTEND_URL}"

command -v docker >/dev/null 2>&1 || { echo "Error: hace falta Docker en esta máquina para construir las imágenes."; exit 1; }

# Opcionales: el backend arranca igual sin ellas y desactiva la función.
[ -n "${GOOGLE_CLIENT_ID:-}" ] || echo "Aviso: sin GOOGLE_CLIENT_ID; el inicio de sesión con Google quedará deshabilitado."
[ -n "${CLOUDINARY_API_SECRET:-}" ] || echo "Aviso: sin credenciales de Cloudinary; no se podrán subir adjuntos ni evidencias."
[ -n "${AGENT_API_KEY:-}" ] || echo "Aviso: sin AGENT_API_KEY; el agente de IA quedará deshabilitado."
[ -n "${MONGODB_URI:-}" ] || echo "Aviso: sin MONGODB_URI; el chat usará el MongoDB local de la VM."

IMAGE_TAG="${REMOTE_SHA:0:12}"
SSH="ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -i $SSH_KEY $VM_USER@$VM_IP"

ENV_CONTENT=$(printf '%s\n' \
  "IMAGE_TAG=$IMAGE_TAG" \
  "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" \
  "MONGODB_URI=${MONGODB_URI-}" \
  "JWT_SECRET=$JWT_SECRET" \
  "JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-8h}" \
  "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID-}" \
  "GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET-}" \
  "GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL-}" \
  "FRONTEND_URL=$FRONTEND_URL" \
  "PUBLIC_HOST=$PUBLIC_HOST" \
  "CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME-}" \
  "CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY-}" \
  "CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET-}" \
  "AGENT_API_URL=${AGENT_API_URL-}" \
  "AGENT_API_KEY=${AGENT_API_KEY-}" \
  "AGENT_MODEL=${AGENT_MODEL-}" \
  "AGENT_TEMPERATURE=${AGENT_TEMPERATURE-}" \
  "AGENT_MAX_TOKENS=${AGENT_MAX_TOKENS-}" \
  "AGENT_MAX_STEPS=${AGENT_MAX_STEPS-}" \
  "AGENT_DISABLE_THINKING=${AGENT_DISABLE_THINKING-}" \
  "STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY-}" \
  "STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET-}" \
  "VITE_API_URL=${VITE_API_URL-}" \
  "VITE_SOCKET_URL=${VITE_SOCKET_URL-}" \
  "VITE_WEBRTC_ICE_SERVERS=${VITE_WEBRTC_ICE_SERVERS-}")

BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "$BUILD_DIR"' EXIT

echo "==> [1/6] Construyendo imágenes de ${REMOTE_SHA:0:7} (origin/$GIT_REF)..."
git -C "$ROOT" archive "$REMOTE_SHA" backend frontend | tar -x -C "$BUILD_DIR"
docker build -q -t "kontrol-backend:$IMAGE_TAG" "$BUILD_DIR/backend"
docker build -q -t "kontrol-frontend:$IMAGE_TAG" \
  --build-arg "VITE_API_URL=${VITE_API_URL-}" \
  --build-arg "VITE_SOCKET_URL=${VITE_SOCKET_URL-}" \
  --build-arg "VITE_WEBRTC_ICE_SERVERS=${VITE_WEBRTC_ICE_SERVERS-}" \
  "$BUILD_DIR/frontend"
BACKEND_ID="$(docker image inspect --format '{{.Id}}' "kontrol-backend:$IMAGE_TAG")"
FRONTEND_ID="$(docker image inspect --format '{{.Id}}' "kontrol-frontend:$IMAGE_TAG")"

echo "==> [2/6] Subiendo configuración a $VM_USER@$VM_IP:$APP_DIR ..."
$SSH "[ -d $APP_DIR ] || { sudo mkdir -p $APP_DIR && sudo chown \$USER:\$USER $APP_DIR; }"
# shellcheck disable=SC2086
git -C "$ROOT" archive "$REMOTE_SHA" $RUNTIME_FILES | $SSH "tar -x -C $APP_DIR"
# El .env viaja por stdin, no dentro del comando remoto, para que los secretos
# no aparezcan en `ps` de la VM durante el despliegue (DT-27).
printf '%s\n' "$ENV_CONTENT" | $SSH "cd $APP_DIR && umask 077 && cat > .env && chmod 600 .env"

echo "==> [3/6] Cargando imágenes en la VM..."
docker save "kontrol-backend:$IMAGE_TAG" "kontrol-frontend:$IMAGE_TAG" | gzip -1 | $SSH "gunzip | docker load"

echo "==> [4/6] Levantando contenedores..."
# Cada despliegue usa un tag nuevo, así que compose recrea backend y frontend
# por sí solo; postgres, mongo y caddy solo se recrean si cambió su definición.
# --no-build: si faltara una imagen, mejor fallar que compilar en la VM.
$SSH "
  set -e
  cd $APP_DIR
  $COMPOSE up -d --no-build --remove-orphans
"

echo "==> [5/6] Verificando salud del despliegue..."
$SSH "
  set -e
  cd $APP_DIR
  for i in \$(seq 1 60); do
    if curl -fsS http://localhost:3000/api/health >/dev/null 2>&1; then
      echo '  Backend healthy'
      exit 0
    fi
    sleep 3
  done
  echo '  Backend did not become healthy in time.'
  $COMPOSE ps
  echo '--- backend logs ---'
  $COMPOSE logs --tail=120 backend || true
  exit 1
"

# DT-21 (RTF 2, DEP-01): un despliegue llegó a dejar contenedores con la imagen
# anterior, y producción corrió una versión distinta de la que se creía. Aquí
# se comprueba que cada contenedor corre exactamente la imagen recién
# construida (el ID se conserva en docker save/load). El disco solo avisa: el
# 01/10/2026 se llenó y rompió el build.
echo "==> [6/6] Verificando la versión desplegada..."
$SSH "
  set -e
  cd $APP_DIR
  echo '  commit: ${REMOTE_SHA:0:7} (origin/$GIT_REF)'
  stale=0
  for pair in backend=$BACKEND_ID frontend=$FRONTEND_ID; do
    svc=\${pair%%=*}
    expected=\${pair#*=}
    running=\$(docker inspect --format '{{.Image}}' \"\$($COMPOSE ps -q \$svc)\")
    if [ \"\$running\" = \"\$expected\" ]; then
      echo \"  \$svc: imagen recién construida (\${running:7:12})\"
    else
      echo \"  \$svc: corre \${running:7:12}, pero la construida es \${expected:7:12}\"
      stale=1
    fi
  done
  [ \"\$stale\" = 0 ] || { echo '  Hay contenedores con una imagen anterior.'; exit 1; }
  # Conserva la versión actual y la anterior (para volver atrás a mano) y
  # borra el resto.
  for repo in kontrol-backend kontrol-frontend; do
    docker images \"\$repo\" --format '{{.Tag}}' | grep -vx '$IMAGE_TAG' | tail -n +2 \
      | xargs -r -I{} docker rmi \"\$repo:{}\" >/dev/null 2>&1 || true
  done
  docker image prune -f >/dev/null 2>&1 || true
  used=\$(df --output=pcent / | tail -1 | tr -dc '0-9')
  echo \"  disco: \${used} % usado\"
  if [ \"\$used\" -ge 85 ]; then
    echo '  AVISO: el disco supera el 85 %. Revisa docker system df.'
  fi
"

# Desde fuera de la VM: confirma DNS, Caddy y el certificado. Solo avisa,
# porque tras cambiar el DNS el certificado puede tardar unos minutos.
echo "==> Comprobando $FRONTEND_URL desde fuera de la VM..."
if curl -fsS --max-time 15 --retry 5 --retry-delay 6 --retry-all-errors "$FRONTEND_URL/api/health" >/dev/null 2>&1; then
  echo "  $FRONTEND_URL/api/health responde."
else
  echo "  AVISO: $FRONTEND_URL/api/health no responde desde fuera. Revisa que el DNS de $PUBLIC_HOST apunte a $VM_IP y los logs de caddy."
fi

echo ""
echo "==> Despliegue completado (imagen $IMAGE_TAG)."
echo "    App: $FRONTEND_URL"
echo "    Health: $FRONTEND_URL/api/health"
