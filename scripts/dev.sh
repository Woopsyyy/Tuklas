#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ADB="${ADB:-/mnt/c/Users/woopsy/AppData/Local/Android/Sdk/platform-tools/adb.exe}"
EMULATOR_EXE='C:\Users\woopsy\AppData\Local\Android\Sdk\emulator\emulator.exe'
AVD="${AVD:-Pixel_API_35}"
PORT="${PORT:-8090}"

find_device() {
  "$ADB" devices 2>/dev/null | tr -d '\r' | awk '/^emulator-.+device$/{print $1; exit}'
}

echo "Looking for a running emulator..."
serial="$(find_device)"

if [ -z "$serial" ]; then
  echo "No emulator found. Launching $AVD (window hidden)..."
  /mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -NoProfile -Command \
    "Start-Process '$EMULATOR_EXE' -ArgumentList '-avd','$AVD' -WindowStyle Hidden" >/dev/null
  for _ in $(seq 1 60); do
    serial="$(find_device)"
    [ -n "$serial" ] && break
    sleep 2
  done
  [ -n "$serial" ] || { echo "Emulator failed to appear." >&2; exit 1; }
else
  echo "Emulator already running ($serial)."
fi

echo "Waiting for $serial to finish booting..."
for _ in $(seq 1 120); do
  booted="$("$ADB" -s "$serial" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
  [ "$booted" = "1" ] && { echo "Booted."; break; }
  sleep 2
done
[ "${booted:-}" = "1" ] || { echo "Emulator did not finish booting." >&2; exit 1; }

echo "Mapping emulator port $PORT to this machine..."
"$ADB" -s "$serial" reverse "tcp:$PORT" "tcp:$PORT"

if pgrep -f "expo start --port $PORT" >/dev/null; then
  echo "Stopping previous Expo server..."
  pkill -f "expo start --port $PORT" || true
  sleep 2
fi

echo "Opening Tuklas once Metro is ready..."
(
  until (echo >/dev/tcp/localhost/"$PORT") 2>/dev/null; do sleep 2; done
  sleep 3
  "$ADB" -s "$serial" shell am force-stop host.exp.exponent >/dev/null 2>&1 || true
  "$ADB" -s "$serial" shell am start -a android.intent.action.VIEW \
    -d "exp://localhost:$PORT" >/dev/null 2>&1
) &

WIN_HOST="$(/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { \$_.InterfaceAlias -notlike '*Loopback*' -and \$_.IPAddress -notlike '169.*' -and \$_.IPAddress -notlike '172.*' })[0].IPAddress" 2>/dev/null | tr -d '\r')"

echo "Starting Expo on port $PORT..."
if [ -n "$WIN_HOST" ]; then
  REACT_NATIVE_PACKAGER_HOSTNAME="$WIN_HOST" npx expo start --port "$PORT" --host lan
else
  npx expo start --port "$PORT" --host lan
fi
