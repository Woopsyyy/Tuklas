@echo off
cd /d "%~dp0.."
set PORT=8082
npx expo start --port %PORT%
