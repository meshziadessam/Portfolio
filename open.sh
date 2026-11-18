#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
read -r -s -p "Editor password (at least 10 characters): " PORTFOLIO_ADMIN_PASSWORD
printf '\n'
export PORTFOLIO_ADMIN_PASSWORD
if [ "${#PORTFOLIO_ADMIN_PASSWORD}" -lt 10 ]; then
  printf 'Password must contain at least 10 characters.\n' >&2
  exit 1
fi
npx --yes pnpm@11.25.0 admin
