#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

mkdir -p backups
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"

if command -v pg_dump >/dev/null 2>&1; then
  pg_dump "$DATABASE_URL" --format=custom --file="backups/hcj-admin-${timestamp}.dump"
  echo "Backup written to backups/hcj-admin-${timestamp}.dump"
else
  echo "pg_dump is not available; creating a logical JSON snapshot instead."
  if command -v node >/dev/null 2>&1; then
    node scripts/backup-logical.mjs
  else
    pnpm exec node scripts/backup-logical.mjs
  fi
fi
