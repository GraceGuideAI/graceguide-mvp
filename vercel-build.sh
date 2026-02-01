#!/bin/bash
set -euo pipefail

echo "========================================="
echo "GraceGuide UI - Vercel Build Script"
echo "========================================="

# Check Node.js version
echo "→ Node.js version: $(node --version)"
echo "→ npm version: $(npm --version)"

# Navigate to UI directory
cd graceguide-ui

# Install dependencies
echo "→ Installing dependencies..."
npm ci

# Build the application
echo "→ Building application..."
npm run build

# Verify build output
echo "→ Verifying build output..."
if [ ! -d "dist" ]; then
    echo "ERROR: dist directory not found!"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "ERROR: index.html not found in dist!"
    exit 1
fi

# Check for PWA files
echo "→ Checking PWA files..."
if [ ! -f "dist/manifest.json" ]; then
    echo "WARNING: manifest.json not found in dist"
fi

if [ ! -f "dist/service-worker.js" ]; then
    echo "WARNING: service-worker.js not found in dist"
fi

# List build output
echo "→ Build output:"
ls -la dist/

echo ""
echo "========================================="
echo "Build completed successfully!"
echo "========================================="
