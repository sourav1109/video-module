# ============================================================================
# SGT-LMS Live Class System - Automated Setup Script
# ============================================================================
# This script automates the installation and setup process
# Run with: .\setup.ps1
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SGT-LMS Live Class System Setup" -ForegroundColor Cyan
Write-Host "  Enterprise Video Conferencing (10k+ Users)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Step 1: Installing Backend Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location backend

if (Test-Path "node_modules") {
    Write-Host "Backend dependencies already installed. Skipping..." -ForegroundColor Yellow
} else {
    Write-Host "Installing backend packages..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Backend dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Step 2: Installing Frontend Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location ../frontend

if (Test-Path "node_modules") {
    Write-Host "Frontend dependencies already installed. Skipping..." -ForegroundColor Yellow
} else {
    Write-Host "Installing frontend packages..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
}

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Step 3: Configuration Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if .env exists
if (Test-Path "backend\.env") {
    Write-Host "✓ Backend .env file found" -ForegroundColor Green
} else {
    Write-Host "✗ Backend .env file not found!" -ForegroundColor Red
    Write-Host "  Creating .env file..." -ForegroundColor Yellow
    # .env should already be created, but just in case
    Write-Host "  Please check backend/.env and update configuration" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Step 4: MongoDB Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Checking if MongoDB is running..." -ForegroundColor Yellow

try {
    $mongoCheck = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($mongoCheck) {
        Write-Host "✓ MongoDB is running on port 27017" -ForegroundColor Green
    } else {
        Write-Host "⚠ MongoDB is not running on port 27017" -ForegroundColor Yellow
        Write-Host "  Options:" -ForegroundColor Yellow
        Write-Host "  1. Start local MongoDB: net start MongoDB" -ForegroundColor Yellow
        Write-Host "  2. Use MongoDB Atlas (cloud) - Update MONGODB_URI in backend/.env" -ForegroundColor Yellow
        Write-Host "  3. Run with Docker: docker run -d -p 27017:27017 mongo:6" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not check MongoDB status" -ForegroundColor Yellow
    Write-Host "  Make sure MongoDB is installed and running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start Backend Server:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "2. Start Frontend (in new terminal):" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "3. Open Browser:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "4. Quick Test:" -ForegroundColor Yellow
Write-Host "   - Click 'Demo Teacher' for teacher dashboard" -ForegroundColor White
Write-Host "   - Click 'Demo Student' for student dashboard" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   - Quick Start: QUICK_START.md" -ForegroundColor White
Write-Host "   - Full Guide: PROJECT_COMPLETE.md" -ForegroundColor White
Write-Host "   - Scalability: SCALABILITY_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Or use Docker Compose:" -ForegroundColor Cyan
Write-Host "   docker-compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Green

# Optionally start servers
Write-Host ""
$startNow = Read-Host "Would you like to start the servers now? (y/n)"

if ($startNow -eq "y" -or $startNow -eq "Y") {
    Write-Host ""
    Write-Host "Starting servers..." -ForegroundColor Yellow
    Write-Host ""
    
    # Start backend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Starting Backend Server...' -ForegroundColor Green; npm start"
    
    # Wait a bit for backend to start
    Start-Sleep -Seconds 3
    
    # Start frontend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'Starting Frontend Server...' -ForegroundColor Green; npm start"
    
    Write-Host "✓ Servers starting in new windows..." -ForegroundColor Green
    Write-Host "✓ Frontend will open at http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "You can start servers manually using the commands above" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Happy teaching! 🎓" -ForegroundColor Cyan
Write-Host ""
