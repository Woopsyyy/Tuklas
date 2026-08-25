@echo off
cd /d "%~dp0.."
set PORT=8090
npx expo start --port %PORT%
