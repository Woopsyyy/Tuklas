#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-8090}"
WIN_HOST="$(/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { \$_.InterfaceAlias -notlike '*Loopback*' -and \$_.IPAddress -notlike '169.*' -and \$_.IPAddress -notlike '172.*' })[0].IPAddress" 2>/dev/null | tr -d '\r')"

if [ -n "$WIN_HOST" ]; then
  echo "Windows host: $WIN_HOST"
  REACT_NATIVE_PACKAGER_HOSTNAME="$WIN_HOST" npx expo start --port "$PORT" --host lan
else
  npx expo start --port "$PORT" --host lan
fi
