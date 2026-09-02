param(
    [ValidateSet("production", "preview")]
    [string]$Profile = "production",
    [string]$OutDir = "dist"
)

$ErrorActionPreference = "Stop"

Write-Host "Checking Expo login..."
$whoami = npx eas-cli whoami 2>&1
if ($LASTEXITCODE -ne 0 -or "$whoami".Trim() -eq "" -or "$whoami" -match "You are not logged in") {
    Write-Host "You need to log in to Expo first." -ForegroundColor Yellow
    npx eas-cli login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Login failed." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Launching EAS cloud build (profile: $Profile)..."
npx eas-cli build -p android --profile $Profile --non-interactive
if ($LASTEXITCODE -ne 0) {
    Write-Host "EAS build failed." -ForegroundColor Red
    exit 1
}

Write-Host "Locating the newest finished $Profile build for this project..."
$buildJson = npx eas-cli build:list -p android --build-profile $Profile --limit 1 --json --non-interactive 2>$null
if ($LASTEXITCODE -ne 0 -or -not $buildJson) {
    Write-Host "Could not fetch build info. The build likely succeeded - check the EAS dashboard." -ForegroundColor Yellow
    exit 0
}

$build = ($buildJson | ConvertFrom-Json) | Select-Object -First 1
if (-not $build -or $build.status -ne "FINISHED" -or -not $build.artifacts.buildUrl) {
    Write-Host "Could not find a finished $Profile build with an APK." -ForegroundColor Red
    exit 1
}

Write-Host "Build found:"
Write-Host "  Profile:    $($build.buildProfile)"
Write-Host "  Status:     $($build.status)"
Write-Host "  Artifact:   $($build.artifacts.buildUrl)"
Write-Host ""

if ($build.buildProfile -eq "development") {
    Write-Host "ERROR: this is a development build (needs a Metro server)." -ForegroundColor Red
    Write-Host "Re-run with a release profile: npm run dev:install -- --Profile production" -ForegroundColor Yellow
    exit 1
}

New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
$apkPath = Join-Path $OutDir "tuklas-$Profile-$($build.id.Substring(0, 8)).apk"
Write-Host "Downloading APK to $apkPath ..."
Invoke-WebRequest -Uri $build.artifacts.buildUrl -OutFile $apkPath
if (-not (Test-Path $apkPath)) {
    Write-Host "Download failed." -ForegroundColor Red
    exit 1
}

$sizeMb = [math]::Round((Get-Item $apkPath).Length / 1MB, 1)
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "PRODUCTION BUILD READY" -ForegroundColor Green
Write-Host "  Local APK : $apkPath ($sizeMb MB)"
Write-Host ""
Write-Host "Install link (send this to users, no Expo account needed):" -ForegroundColor Cyan
Write-Host "  $($build.artifacts.buildUrl)" -ForegroundColor Cyan
Write-Host ""
Write-Host "This is a release build: the JS bundle is embedded." -ForegroundColor Yellow
Write-Host "Users install the APK and it runs standalone with no server." -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Green