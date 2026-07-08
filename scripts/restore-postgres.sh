#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

if [ -z "${1:-}" ]; then
  echo "Usage: scripts/restore-postgres.sh backups/file.dump"
  exit 1
fi

pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" "$1"
echo "Restore completed from $1"
