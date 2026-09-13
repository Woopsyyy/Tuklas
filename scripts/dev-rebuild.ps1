$ADB = if ($env:ADB) { $env:ADB } else { "C:\Users\woopsy\AppData\Local\Android\Sdk\platform-tools\adb.exe" }
$EMULATOR_EXE = "C:\Users\woopsy\AppData\Local\Android\Sdk\emulator\emulator.exe"
$AVD = if ($env:AVD) { $env:AVD } else { "Pixel_API_35" }
$PACKAGE = "com.woopsy.tuklas"
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
Write-Host "Emulator process started (PID: $($proc.Id))"
Start-Sleep -Seconds 5
if (-not (Get-Process -Id $proc.Id -ErrorAction SilentlyContinue)) {
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
Write-Host "Rebuilding the app (expo run:android)..."
npx expo run:android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Rebuild failed." -ForegroundColor Red
    exit 1
}