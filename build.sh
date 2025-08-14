#!/bin/bash
set -euo pipefail

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Installing Node.js dependencies and building frontend..."
cd graceguide-ui
npm ci
npm run build
cd ..

echo "Build completed successfully!"