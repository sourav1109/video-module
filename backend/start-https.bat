@echo off
echo.
echo ============================================
echo   Starting Backend with HTTPS
echo ============================================
echo.

cd /d "%~dp0"

echo Stopping any existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting backend server...
npm start

pause
