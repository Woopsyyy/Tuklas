param(
    [string]$OutDir = "dist",
    [string]$ManualVersion = ""
)

$ErrorActionPreference = "Stop"

# ---------------------------------------------------------------
# 1. Determine repo owner/name from the git remote
# ---------------------------------------------------------------
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "Could not find git remote 'origin'." -ForegroundColor Red
    exit 1
}

$repoMatch = [regex]::Match($remote, "github\.com[:/]([^/]+)/([^/]+?)(\.git)?$")
if (-not $repoMatch.Success -or $repoMatch.Groups.Count -lt 3) {
    Write-Host "Could not parse GitHub repo from remote: $remote" -ForegroundColor Red
    exit 1
}
$owner = $repoMatch.Groups[1].Value
$repo = $repoMatch.Groups[2].Value

Write-Host "GitHub repo: $owner/$repo"

# ---------------------------------------------------------------
# 2. Auth token (GH_TOKEN / GITHUB_TOKEN / gh)
# ---------------------------------------------------------------
$token = $env:GH_TOKEN
if (-not $token) { $token = $env:GITHUB_TOKEN }
if (-not $token) {
    $gh = Get-Command gh -ErrorAction SilentlyContinue
    if ($gh) {
        $token = & gh auth token 2>$null
    }
}
if (-not $token) {
    Write-Host "No GitHub token found. Set GH_TOKEN (or GITHUB_TOKEN) before running." -ForegroundColor Red
    Write-Host "Add it to your environment:  setx GH_TOKEN ghp_xxx" -ForegroundColor Yellow
    exit 1
}

$headers = @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json" }

# ---------------------------------------------------------------
# 3. Find the highest existing release version (releases only, not tags)
# ---------------------------------------------------------------
function Get-ReleasesPage([string]$Url) {
    $r = Invoke-RestMethod -Method Get -Uri $Url -Headers $headers
    $link = $null
    try {
        $resp = Invoke-WebRequest -Method Get -Uri $Url -Headers $headers
        $linkHeader = $resp.Headers["Link"]
        if ($linkHeader -match 'rel="next".*<(.*?)>') { $link = $Matches[1] }
    } catch { }
    return @{ Releases = $r; Next = $link }
}

$releases = @()
$url = "https://api.github.com/repos/$owner/$repo/releases?per_page=100&page=1"
while ($url) {
    $page = Get-ReleasesPage $url
    $releases += $page.Releases
    $url = $page.Next
}

$versions = @()
foreach ($rel in $releases) {
    $m = [regex]::Match("$($rel.tag_name)", "^v?(\d+)\.(\d+)\.(\d+)$")
    if ($m.Success) {
        $versions += [Version]::new([int]$m.Groups[1].Value, [int]$m.Groups[2].Value, [int]$m.Groups[3].Value)
    }
}

Write-Host "Existing release versions: $(if ($versions.Count -gt 0) { ($versions | Sort-Object | ForEach-Object { $_.ToString() }) -join ', ' } else { 'none' })"

# ---------------------------------------------------------------
# 4. Compute the next version
#    Patch increment based on the HIGHEST existing release. A release
#    that was deleted is simply not counted, so its version is reused
#    instead of jumping (1.0.0 -> 1.0.1 -> 1.0.4 is avoided).
# ---------------------------------------------------------------
$newVersion = if ($ManualVersion) {
    [Version]::new($ManualVersion)
} elseif ($versions.Count -gt 0) {
    $highest = $versions | Sort-Object | Select-Object -Last 1
    [Version]::new($highest.Major, $highest.Minor, $highest.Build + 1)
} else {
    $appJson = Get-Content "app.json" -Raw | ConvertFrom-Json
    [Version]::new($appJson.expo.version)
}

Write-Host ""
Write-Host "Next release version: $newVersion" -ForegroundColor Green

# ---------------------------------------------------------------
# 5. Bump app.json version + versionCode so the APK embeds it
# ---------------------------------------------------------------
$appPath = "app.json"
$app = Get-Content $appPath -Raw | ConvertFrom-Json
$app.expo.version = $newVersion.ToString()
$versionCode = $newVersion.Major * 10000 + $newVersion.Minor * 100 + $newVersion.Build
$app.expo.android | Add-Member -NotePropertyName versionCode -NotePropertyValue $versionCode -Force
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $appPath), ($app | ConvertTo-Json -Depth 10))

Write-Host "app.json updated: version=$($app.expo.version) versionCode=$versionCode"

# ---------------------------------------------------------------
# 6. Expo login check
# ---------------------------------------------------------------
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

# ---------------------------------------------------------------
# 7. Build + download helper
# ---------------------------------------------------------------
function Build-AndDownload {
    param([string]$Profile, [string]$OutName)

    Write-Host ""
    Write-Host ">>> Building $Profile APK (profile: $Profile) ..."
    npx eas-cli build -p android --profile $Profile --non-interactive
    if ($LASTEXITCODE -ne 0) {
        Write-Host "$Profile EAS build failed." -ForegroundColor Red
        exit 1
    }

    Write-Host "Locating the newest finished $Profile build..."
    $buildJson = npx eas-cli build:list -p android --build-profile $Profile --limit 1 --json --non-interactive 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $buildJson) {
        Write-Host "Could not fetch $Profile build info. Check the EAS dashboard." -ForegroundColor Yellow
        exit 1
    }

    $build = ($buildJson | ConvertFrom-Json) | Select-Object -First 1
    if (-not $build -or $build.status -ne "FINISHED" -or -not $build.artifacts.buildUrl) {
        Write-Host "Could not find a finished $Profile build with an APK." -ForegroundColor Red
        exit 1
    }

    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
    $apkPath = Join-Path (Join-Path (Get-Location) $OutDir) $OutName
    Write-Host "Downloading $Profile APK to $apkPath ..."
    Invoke-WebRequest -Uri $build.artifacts.buildUrl -OutFile $apkPath
    if (-not (Test-Path $apkPath)) {
        Write-Host "$Profile APK download failed." -ForegroundColor Red
        exit 1
    }

    $sizeMb = [math]::Round((Get-Item $apkPath).Length / 1MB, 1)
    Write-Host "$Profile APK ready: $apkPath ($sizeMb MB)"
    return $apkPath
}

# Standalone APK (embedded JS, no Metro server needed)
$standaloneApk = Build-AndDownload -Profile "production" -OutName "tuklas-basa.apk"
# Development APK (dev client, needs a Metro server to run)
$devApk = Build-AndDownload -Profile "development" -OutName "tuklas-basa-development.apk"

# ---------------------------------------------------------------
# 8. Create/replace GitHub release and upload the APKs
# ---------------------------------------------------------------
$tagName = "v$newVersion"
Write-Host ""
Write-Host "Creating GitHub release $tagName ..."

$body = @{
    tag_name = $tagName
    name = $tagName
    body = "Tuklas-Basa $newVersion`n`nTwo install options:`n- tuklas-basa.apk - STANDALONE. The JS bundle is embedded, no internet or Metro server needed.`n- tuklas-basa-development.apk - DEVELOPMENT. Needs a Metro server (expo start) to run the app."
} | ConvertTo-Json

try {
    $release = Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/$owner/$repo/releases" -Headers $headers -Body $body
} catch {
    $detail = $_.ErrorDetails.Message
    if ("$detail" -match "already" ) {
        Write-Host "Release $tagName already exists. Finding it to replace the assets..."
        $release = Invoke-RestMethod -Method Get -Uri "https://api.github.com/repos/$owner/$repo/releases?per_page=100" -Headers $headers |
            Where-Object { $_.tag_name -eq $tagName } | Select-Object -First 1
    } else {
        Write-Host "Could not create GitHub release: $detail" -ForegroundColor Red
        exit 1
    }
}

if (-not $release -or -not $release.id) {
    Write-Host "Could not resolve the GitHub release for $tagName." -ForegroundColor Red
    exit 1
}

function Upload-Asset {
    param([string]$ApkPath, [string]$AssetName)

    # Remove an existing asset with the same name so re-uploads replace cleanly
    $existing = Invoke-RestMethod -Method Get -Uri "https://api.github.com/repos/$owner/$repo/releases/$($release.id)/assets?per_page=100" -Headers $headers
    $dup = $existing | Where-Object { $_.name -eq $AssetName }
    if ($dup) {
        Write-Host "Removing existing asset $AssetName from release..."
        Invoke-RestMethod -Method Delete -Uri "https://api.github.com/repos/$owner/$repo/releases/assets/$($dup.id)" -Headers $headers | Out-Null
    }

    Write-Host "Uploading $AssetName ..."
    $uploadUrl = "https://uploads.github.com/repos/$owner/$repo/releases/$($release.id)/assets?name=$AssetName"
    Invoke-RestMethod -Method Post -Uri $uploadUrl -Headers $headers -InFile $ApkPath -ContentType "application/vnd.android.package-archive" | Out-Null
}

Upload-Asset -ApkPath $standaloneApk -AssetName "tuklas-basa.apk"
Upload-Asset -ApkPath $devApk -AssetName "tuklas-basa-development.apk"

$standaloneSize = [math]::Round((Get-Item $standaloneApk).Length / 1MB, 1)
$devSize = [math]::Round((Get-Item $devApk).Length / 1MB, 1)

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "RELEASE PUBLISHED" -ForegroundColor Green
Write-Host "  Version     : $newVersion" -ForegroundColor Green
Write-Host "  Tag         : $tagName" -ForegroundColor Green
Write-Host "  Standalone  : tuklas-basa.apk ($standaloneSize MB, no Metro needed)" -ForegroundColor Green
Write-Host "  Development : tuklas-basa-development.apk ($devSize MB, needs Metro/expo start)" -ForegroundColor Green
Write-Host "  Release URL : https://github.com/$owner/$repo/releases/tag/$tagName" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Green