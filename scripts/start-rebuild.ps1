$ADB = if ($env:ADB) { $env:ADB } else { "C:\Users\woopsy\AppData\Local\Android\Sdk\platform-tools\adb.exe" }
$EMULATOR_EXE = "C:\Users\woopsy\AppData\Local\Android\Sdk\emulator\emulator.exe"
$AVD = if ($env:AVD) { $env:AVD } else { "Pixel_API_35" }
$PACKAGE = "com.woopsy.tuklas"
$PORT = if ($env:PORT) { $env:PORT } else { "8082" }
$serial = $null

& $ADB start-server 2>&1 | Out-Null

function Find-OnlineEmulators {
    $output = & $ADB devices 2>&1
    if (-not $output) { return @() }
    $output | ForEach-Object {
        $trimmed = $_.Trim()
        if ($trimmed -match "^(emulator-\d+)\s+device$") {
            $Matches[1]
        }
    }
}

function Cleanup {
    Write-Host "`nShutting down..."
    Get-Job | Stop-Job -ErrorAction SilentlyContinue
    Get-Job | Remove-Job -Force -ErrorAction SilentlyContinue
    if ($serial) {
        Write-Host "  Killing emulator..."
        & $ADB -s $serial emu kill 2>&1 | Out-Null
    }
    Remove-Item Env:REACT_NATIVE_PACKAGER_HOSTNAME -ErrorAction SilentlyContinue
    Write-Host "Done."
    exit 0
}

Register-EngineEvent PowerShell.Exiting -Action { Cleanup } | Out-Null

Write-Host "Stopping all running emulators..."
$existing = @(Find-OnlineEmulators)
foreach ($em in $existing) {
    Write-Host "  Killing $em..."
    & $ADB -s $em emu kill 2>&1 | Out-Null
}

Stop-Process -Name emulator, qemu-system-x86_64 -Force -ErrorAction SilentlyContinue
$avdLockDir = "C:\Users\woopsy\.android\avd\$AVD.avd"
if (Test-Path $avdLockDir) {
    Write-Host "Clearing lock files in $avdLockDir..."
    Remove-Item "$avdLockDir\*.lock" -Force -ErrorAction SilentlyContinue
}

if ($existing.Count -gt 0) {
    Start-Sleep -Seconds 3
    Write-Host "All emulators stopped."
}

Write-Host "Launching fresh emulator: $AVD (no-snapshot)..."
$proc = Start-Process $EMULATOR_EXE -ArgumentList "-avd", $AVD, "-no-snapshot-load" -PassThru
$EMULATOR_PID = $proc.Id
Write-Host "Emulator process started (PID: $EMULATOR_PID)"
Start-Sleep -Seconds 5
if (-not (Get-Process -Id $EMULATOR_PID -ErrorAction SilentlyContinue)) {
    Write-Host "Emulator process died immediately." -ForegroundColor Red
    exit 1
}
Write-Host "Emulator process still alive."

Write-Host "Waiting for emulator to come online..."
for ($i = 0; $i -lt 90; $i++) {
    $emulators = @(Find-OnlineEmulators)
    if ($i -eq 0 -or $i -eq 5 -or $i -eq 10 -or ($i % 15 -eq 0)) {
        Write-Host "  [$($i * 2) s] Online emulators: $($emulators.Count)"
    }
    if ($emulators.Count -gt 0) {
        $serial = $emulators[0]
        break
    }
    Start-Sleep -Seconds 2
}

if (-not $serial) {
    Write-Host "Emulator did not come online." -ForegroundColor Red
    exit 1
}

Write-Host "Found: $serial"
Write-Host "Waiting for $serial to finish booting..."
$booted = $false
for ($i = 0; $i -lt 120; $i++) {
    $result = & $ADB -s $serial shell getprop sys.boot_completed 2>&1
    $booted = "$result".Trim()
    if ($booted -eq "1") {
        Write-Host "Booted."
        break
    }
    Start-Sleep -Seconds 2
}

if ($booted -ne "1") {
    Write-Host "Emulator did not finish booting." -ForegroundColor Red
    exit 1
}

Write-Host "Mapping emulator port $PORT to this machine..."
& $ADB -s $serial reverse "tcp:$PORT" "tcp:$PORT" 2>&1 | Out-Null

Write-Host "Checking if $PACKAGE is installed..."
$installed = & $ADB -s $serial shell pm list packages "$PACKAGE" 2>&1
if ("$installed".Trim() -match "package:$PACKAGE") {
    Write-Host "  $PACKAGE found. Uninstalling..."
    & $ADB -s $serial shell pm uninstall "$PACKAGE" 2>&1
    Write-Host "  Uninstalled."
} else {
    Write-Host "  $PACKAGE is not installed."
}

Write-Host ""
Write-Host "Building and installing the app (expo run:android)..."
npx expo run:android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

$expoProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*expo start*" } |
    Select-Object -First 1

if ($expoProcess) {
    Write-Host "Stopping previous Expo server..."
    Stop-Process -Id $expoProcess.Id -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "Starting Metro on port $PORT (lan mode)..."
$env:REACT_NATIVE_PACKAGER_HOSTNAME = "127.0.0.1"

Start-Job -ScriptBlock {
    param($ADB, $SERIAL, $PORT, $PACKAGE)
    Start-Sleep -Seconds 20
    & $ADB -s $SERIAL shell am force-stop $PACKAGE 2>&1 | Out-Null
    Start-Sleep -Seconds 2
    & $ADB -s $SERIAL shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:$PORT" 2>&1 | Out-Null
} -ArgumentList $ADB, $serial, $PORT, $PACKAGE | Out-Null

try {
    npx expo start --port $PORT --lan
} finally {
    Cleanup
}