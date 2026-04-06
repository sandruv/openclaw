#!/usr/bin/env bash
set -euo pipefail

HOST="46.202.186.194"
PORT="65002"
USER="u141166830"
TARGET="~/domains/dev.sanzmoses.com/public_html/"
BACKUP_DIR="~/deploy-backups"

if ! command -v sshpass >/dev/null 2>&1; then
  echo "sshpass is required for this deploy script."
  exit 1
fi

if [[ -z "${HOSTINGER_PASSWORD:-}" ]]; then
  echo "Set HOSTINGER_PASSWORD before running deploy."
  exit 1
fi

echo "[1/4] Building static export..."
npm run build

if [[ ! -d out ]]; then
  echo "Missing out/ after build."
  exit 1
fi

TS=$(date +%Y%m%d-%H%M%S)

echo "[2/4] Backing up remote site..."
sshpass -p "$HOSTINGER_PASSWORD" ssh -o StrictHostKeyChecking=no -p "$PORT" "$USER@$HOST" \
  "mkdir -p $BACKUP_DIR && cp -a ~/domains/dev.sanzmoses.com/public_html $BACKUP_DIR/dev.sanzmoses.com-$TS"

echo "[3/4] Uploading exported site..."
sshpass -p "$HOSTINGER_PASSWORD" rsync -av --delete \
  -e "ssh -o StrictHostKeyChecking=no -p $PORT" \
  out/ "$USER@$HOST:$TARGET"

echo "[4/4] Done: https://dev.sanzmoses.com"
