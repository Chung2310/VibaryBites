#!/usr/bin/env bash
set -euo pipefail
case "${DEPLOY_ENV:-}" in develop|production) ;; *) echo 'Invalid deployment environment'; exit 1 ;; esac
: "${ENV_FILE_CONTENT:?Missing ENV_FILE secret}"
: "${IMAGE_REF:?Missing tested image digest}"
: "${GHCR_USER:?Missing registry username}"
: "${GHCR_TOKEN:?Missing registry token}"
cd "/opt/vibary-bites/$DEPLOY_ENV"
umask 077
printf '%s\n' "$ENV_FILE_CONTENT" > .env.next
mv .env.next .env
printf 'IMAGE_REF=%s\n' "$IMAGE_REF" > .env.image
export COMPOSE_PROJECT_NAME="vibary-bites-$DEPLOY_ENV"
# Isolate temporary registry credentials from the VPS user's Docker login.
DOCKER_CONFIG=$(mktemp -d)
export DOCKER_CONFIG
trap 'rm -f "$DOCKER_CONFIG/config.json"; rmdir "$DOCKER_CONFIG" 2>/dev/null || true' EXIT
printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
unset GHCR_TOKEN ENV_FILE_CONTENT
# This network is shared with the existing infrastructure, as in Luxcare.
docker network inspect default_network >/dev/null 2>&1 || docker network create default_network >/dev/null
# Explicit -f prevents a local override from accidentally building on the VPS.
docker compose --env-file .env --env-file .env.image -f docker-compose.yml config --quiet
docker compose --env-file .env --env-file .env.image -f docker-compose.yml pull
if ! docker compose --env-file .env --env-file .env.image -f docker-compose.yml up -d --no-build --wait --wait-timeout 120; then
  docker compose --env-file .env --env-file .env.image -f docker-compose.yml ps -a
  echo 'Deployment failed its health check. Inspect the service on the VPS.'
  exit 1
fi
printf 'Deployed %s successfully.\n' "$IMAGE_REF"
