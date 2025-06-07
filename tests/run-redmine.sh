#!/bin/bash

# Local test runner script with Redmine environment

set -e

# Determine script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$SCRIPT_DIR"

echo "🚀 Starting E2E tests with Redmine environment..."

# Build the extension
echo "📦 Building extension..."
cd "$PROJECT_ROOT"
npm run build
cd "$SCRIPT_DIR"

# Start Redmine services
echo "🐳 Starting Redmine environment..."
docker compose -f "$SCRIPT_DIR/docker-compose.test.yml" up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
timeout 300 bash -c 'until curl -f http://localhost:3001 > /dev/null 2>&1; do echo "Waiting for Redmine..."; sleep 5; done'

echo "✅ Redmine is ready!"

# Test accessibility
echo "🔍 Testing Redmine accessibility..."
if curl -f http://localhost:3001/ >/dev/null 2>&1; then
  echo "✅ Redmine is accessible and ready for testing"
else
  echo "❌ Redmine is not accessible"
  exit 1
fi

echo "⚙️  Setting up complete Redmine environment..."

# Copy complete setup script and run it
docker cp setup-complete.rb redmine-markdown-editor-crx-test-redmine:/usr/src/redmine/
docker exec redmine-markdown-editor-crx-test-redmine bash -c 'cd /usr/src/redmine && bundle exec rails runner setup-complete.rb'

echo "✅ Complete Redmine environment configured"
