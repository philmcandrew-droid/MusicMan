#!/usr/bin/env bash
set -e

# Next.js static export for web (Render). Set empty prefix so JS/CSS load from /_next.
# For Capacitor APK builds, build locally without NEXT_ASSET_PREFIX (defaults to ./ in next.config).
export NEXT_ASSET_PREFIX="${NEXT_ASSET_PREFIX:-/}"

echo "==> Installing New UI dependencies..."
cd "New UI"
npm ci
echo "==> Building New UI (Next.js static export)..."
npm run build
cd ..

echo "==> Copying New UI out/ to backend/static..."
rm -rf backend/static
cp -r "New UI/out" backend/static

echo "==> Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "==> Build complete!"