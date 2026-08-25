#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ADB="${ADB:-/mnt/c/Users/woopsy/AppData/Local/Android/Sdk/platform-tools/adb.exe}"
EMULATOR_EXE='C:\Users\woopsy\AppData\Local\Android\Sdk\emulator\emulator.exe'
AVD="${AVD:-Pixel_API_35}"
PORT="${PORT:-8090}"
LOG="${LOG:-/tmp/opencode/tuklas-expo-dev.log}"

find_device() {
  "$ADB" devices 2>/dev/null | tr -d '\r' | awk '/^emulator-.+device$/{print $1; exit}'
}

echo "Looking for a running emulator..."
serial="$(find_device)"

if [ -z "$serial" ]; then
  echo "No emulator found. Launching $AVD..."
  /mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -NoProfile -Command \
    "Start-Process '$EMULATOR_EXE' -ArgumentList '-avd','$AVD'" >/dev/null
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
  echo "Stopping previous Expo dev server..."
  pkill -f "expo start --port $PORT" || true
  sleep 2
fi

echo "Starting Expo on port $PORT (log: $LOG)..."
mkdir -p "$(dirname "$LOG")"
: > "$LOG"
setsid nohup npx expo start --port "$PORT" > "$LOG" 2>&1 < /dev/null &
disown || true

for _ in $(seq 1 60); do
  grep -q "Waiting on http://localhost:$PORT" "$LOG" 2>/dev/null && break
  sleep 2
done
grep -q "Waiting on http://localhost:$PORT" "$LOG" || {
  echo "Expo did not become ready. Last log lines:" >&2
  tail -20 "$LOG" >&2
  exit 1
}
echo "Metro is ready."

echo "Opening Tuklas in Expo Go..."
"$ADB" -s "$serial" shell am force-stop host.exp.exponent >/dev/null 2>&1 || true
"$ADB" -s "$serial" shell am start -a android.intent.action.VIEW -d "exp://localhost:$PORT" >/dev/null

echo "Done. Tuklas should now be loading on the emulator."
