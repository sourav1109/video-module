@echo off
echo.
echo ========================================
echo   VIDEO CALL APP - RENDER DEPLOYMENT
echo ========================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo [1/5] Initializing Git repository...
if not exist ".git" (
    git init
    echo Git initialized successfully!
) else (
    echo Git already initialized.
)
echo.

echo [2/5] Adding all files to Git...
git add .
echo Files added successfully!
echo.

echo [3/5] Committing changes...
git commit -m "Ready for Render deployment - Complete video call app"
if %ERRORLEVEL% EQU 0 (
    echo Committed successfully!
) else (
    echo Nothing to commit or already committed.
)
echo.

echo [4/5] Checking GitHub remote...
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo GitHub remote found!
    echo.
    echo [5/5] Pushing to GitHub...
    git push origin master
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================
        echo   SUCCESS! Code pushed to GitHub!
        echo ========================================
    ) else (
        echo.
        echo [WARNING] Push failed. You may need to pull first:
        echo   git pull origin master --rebase
        echo   git push origin master
    )
) else (
    echo.
    echo [INFO] No GitHub remote configured yet.
    echo.
    echo ========================================
    echo   NEXT STEPS:
    echo ========================================
    echo.
    echo 1. Create a new repository on GitHub:
    echo    https://github.com/new
    echo.
    echo    - Name: video-call-app
    echo    - Visibility: Public (required for free Render)
    echo    - Don't initialize with README
    echo.
    echo 2. Connect your repository (replace YOUR_USERNAME):
    echo.
    echo    git remote add origin https://github.com/YOUR_USERNAME/video-call-app.git
    echo    git branch -M master
    echo    git push -u origin master
    echo.
)

echo.
echo ========================================
echo   DEPLOYMENT FILES READY!
echo ========================================
echo.
echo Created files:
echo   [✓] render.yaml - Render configuration
echo   [✓] .gitignore - Git ignore rules
echo   [✓] backend/src/health.js - Health endpoint
echo   [✓] RENDER_DEPLOYMENT_GUIDE.md - Full guide
echo   [✓] CAN_FRIEND_JOIN.md - Yes, they can!
echo.
echo ========================================
echo   READY TO DEPLOY TO RENDER!
echo ========================================
echo.
echo After pushing to GitHub:
echo.
echo 1. Go to: https://dashboard.render.com
echo 2. Sign up with GitHub (free)
echo 3. Click "New +" -^> "Blueprint"
echo 4. Select your repository
echo 5. Click "Apply"
echo 6. Wait 5-10 minutes
echo 7. Share frontend URL with friends!
echo.
echo Full instructions: RENDER_DEPLOYMENT_GUIDE.md
echo.
pause
