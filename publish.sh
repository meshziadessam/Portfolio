#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
git add .
if git diff --cached --quiet; then
  printf 'No new changes to commit.\n'
else
  git diff --cached --stat
  git commit -m "Update portfolio content"
fi
git push origin main
printf 'Uploaded. Follow deployment at https://github.com/meshziadessam/Portfolio/actions\n'
