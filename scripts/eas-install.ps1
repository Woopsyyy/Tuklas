param(
    [ValidateSet("production", "preview")]
    [string]$Profile = "production"
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

Write-Host "Fetching latest build info..."
$buildJson = npx eas-cli build:list -p android --limit 1 --json --non-interactive 2>$null
if ($LASTEXITCODE -ne 0 -or -not $buildJson) {
    Write-Host "Could not fetch build info, but the build succeeded. Check the EAS build page manually." -ForegroundColor Yellow
    exit 0
}

$build = ($buildJson | ConvertFrom-Json) | Select-Object -First 1
if (-not $build) {
    Write-Host "No build record found." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "BUILD COMPLETE" -ForegroundColor Green
Write-Host "Status:      $($build.status)"
Write-Host "Platform:    $($build.platform)"
Write-Host ""
Write-Host "SHAREABLE INSTALL PAGE (no Expo account needed):" -ForegroundColor Cyan
Write-Host "  $($build.url)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Direct APK download link:" -ForegroundColor Cyan
if ($build.artifactUrl) {
    Write-Host "  $($build.artifactUrl)" -ForegroundColor Cyan
} else {
    Write-Host "  (temporary; open the install page above instead)" -ForegroundColor DarkCyan
}
Write-Host ""
Write-Host "The install page works for anyone with the link - they open it," -ForegroundColor Yellow
Write-Host "tap Install/Download, and the APK installs without an Expo account." -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Green