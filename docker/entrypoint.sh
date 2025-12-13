#!/bin/sh
set -e

echo "▶ Starting container..."

if npm run | grep -qE ' dev$| dev:'; then
  echo "▶ Using npm run dev"
  exec npm run dev
fi

echo "▶ No dev script found. Using Vite..."
if npx vite --host 0.0.0.0 --port 5173; then
  exit 0
fi

echo "▶ Vite failed. Using http-server..."
exec npx http-server -p 5173 .
