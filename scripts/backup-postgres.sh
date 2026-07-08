#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

mkdir -p backups
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
pg_dump "$DATABASE_URL" --format=custom --file="backups/hcj-admin-${timestamp}.dump"
echo "Backup written to backups/hcj-admin-${timestamp}.dump"
