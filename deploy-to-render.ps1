# Quick Render Deployment Setup
# Run this script to prepare your project for Render

Write-Host "🚀 Preparing Video Call App for Render Deployment..." -ForegroundColor Green
Write-Host ""

# Check if Git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

Write-Host ""

# Add all files
Write-Host "📦 Adding files to Git..." -ForegroundColor Yellow
git add .

Write-Host "✅ Files added" -ForegroundColor Green
Write-Host ""

# Commit
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
$commitMessage = "Ready for Render deployment - Complete video call app"
git commit -m $commitMessage

Write-Host "✅ Changes committed" -ForegroundColor Green
Write-Host ""

# Check if remote exists
$remoteUrl = git remote get-url origin 2>$null

if ($remoteUrl) {
    Write-Host "✅ GitHub remote already configured: $remoteUrl" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
    git push origin master
    Write-Host "✅ Pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "⚠️  No GitHub remote found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Create a new repository on GitHub: https://github.com/new" -ForegroundColor White
    Write-Host "   - Name: video-call-app" -ForegroundColor White
    Write-Host "   - Visibility: Public (required for free Render)" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Run these commands (replace YOUR_USERNAME):" -ForegroundColor White
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/video-call-app.git" -ForegroundColor Yellow
    Write-Host "   git branch -M master" -ForegroundColor Yellow
    Write-Host "   git push -u origin master" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "✨ Deployment Files Created:" -ForegroundColor Green
Write-Host "   ✅ render.yaml - Render Blueprint configuration" -ForegroundColor White
Write-Host "   ✅ .gitignore - Git ignore rules" -ForegroundColor White
Write-Host "   ✅ backend/src/health.js - Health check endpoint" -ForegroundColor White
Write-Host "   ✅ RENDER_DEPLOYMENT_GUIDE.md - Complete deployment guide" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Ready to Deploy to Render!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Push code to GitHub (if not done yet)" -ForegroundColor White
Write-Host "2. Go to: https://dashboard.render.com" -ForegroundColor Yellow
Write-Host "3. Click 'New +' → 'Blueprint'" -ForegroundColor White
Write-Host "4. Connect your GitHub repository" -ForegroundColor White
Write-Host "5. Click 'Apply' and wait 5-10 minutes" -ForegroundColor White
Write-Host "6. Share the frontend URL with your friend!" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full guide: RENDER_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
