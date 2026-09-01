param(
    [ValidateSet("production", "preview")]
    [string]$Profile = "production"
)

$ErrorActionPreference = "Stop"
$ADB = if ($env:ADB) { $env:ADB } else { "C:\Users\woopsy\AppData\Local\Android\Sdk\platform-tools\adb.exe" }

function Find-OnlineDevice {
    $output = & $ADB devices 2>&1
    if (-not $output) { return $null }
    $output | ForEach-Object {
        $trimmed = $_.Trim()
        if ($trimmed -match "^(emulator-\d+|\S+)\s+device$") {
            return $Matches[1]
        }
    }
    return $null
}

$serial = Find-OnlineDevice
if (-not $serial) {
    Write-Host "No device or emulator connected (adb devices empty)." -ForegroundColor Red
    exit 1
}
Write-Host "Device found: $serial"

Write-Host "Launching EAS cloud build (profile: $Profile)..."
npx eas-cli@latest build -p android --profile $Profile --non-interactive
if ($LASTEXITCODE -ne 0) {
    Write-Host "EAS build failed." -ForegroundColor Red
    exit 1
}

Write-Host "Downloading latest APK from EAS..."
npx eas-cli@latest build:download --platform android --non-interactive
if ($LASTEXITCODE -ne 0) {
    Write-Host "Download failed." -ForegroundColor Red
    exit 1
}

$apk = Get-ChildItem -Path . -Filter "*.apk" -Recurse | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $apk) {
    Write-Host "No APK found to install." -ForegroundColor Red
    exit 1
}
Write-Host "Installing $($apk.FullName) on $serial..."
& $ADB -s $serial install -r $apk.FullName
if ($LASTEXITCODE -ne 0) {
    Write-Host "Install failed on device." -ForegroundColor Red
    exit 1
}

Write-Host "Launching app..."
& $ADB -s $serial shell monkey -p com.woopsy.tuklas -c android.intent.category.LAUNCHER 1 2>&1 | Out-Null
Write-Host "Done."