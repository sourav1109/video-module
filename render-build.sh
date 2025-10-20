#!/bin/bash
# Render build script for multi-service Node.js application

set -e

echo "Building backend..."
cd backend
npm ci
cd ..

echo "Building frontend..."
cd frontend
npm ci
npm run build
cd ..

echo "Build complete!"
