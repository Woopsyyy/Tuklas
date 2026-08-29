$ErrorActionPreference = "Stop"

$PORT = if ($env:PORT) { $env:PORT } else { "8090" }

try {
    $WIN_HOST = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.*' -and $_.IPAddress -notlike '172.*' })[0].IPAddress
    Write-Host "Windows host: $WIN_HOST"
    $env:REACT_NATIVE_PACKAGER_HOSTNAME = $WIN_HOST
} catch {
    Write-Host "Could not detect host IP, using default"
}

npx expo start --port $PORT --tunnel
