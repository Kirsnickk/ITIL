#!/bin/bash
set -e

echo "🚀 Starting ITIL Backend..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "✅ DATABASE_URL is configured"

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed"

# Start the server
echo "🎯 Starting Node.js server..."
node src/server.js
