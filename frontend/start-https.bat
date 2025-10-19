@echo off
echo.
echo ============================================
echo   Starting Frontend with HTTPS
echo ============================================
echo.

cd /d "%~dp0"

echo Starting frontend dev server...
npm start

pause
