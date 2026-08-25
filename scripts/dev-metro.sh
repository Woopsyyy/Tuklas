#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-8090}"

npx expo start --port "$PORT" --host lan
