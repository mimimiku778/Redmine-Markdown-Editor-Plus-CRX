#!/bin/bash

# Local test runner script with Redmine environment

set -e

# Determine script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TESTS_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$TESTS_DIR")"

cd "$TESTS_DIR"

# Load environment variables
source "$SCRIPT_DIR/load-env.sh"

# Generate base URL from port
REDMINE_BASE_URL="http://localhost:$REDMINE_PORT"
SERVICE_TIMEOUT=120
HEALTH_CHECK_INTERVAL=3

echo "🔧 Using configuration:"
echo "  Base URL: $REDMINE_BASE_URL"
echo "  Container: $CONTAINER_NAME"

# Start Redmine services
echo "🐳 Starting Redmine environment..."
REDMINE_PORT=$REDMINE_PORT docker compose -f "$TESTS_DIR/docker-compose.test.yml" up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
timeout $SERVICE_TIMEOUT bash -c "until curl -f $REDMINE_BASE_URL > /dev/null 2>&1; do echo 'Waiting for Redmine...'; sleep $HEALTH_CHECK_INTERVAL; done"

echo "✅ Redmine is ready!"

# Test accessibility
echo "🔍 Testing Redmine accessibility..."
if curl -f "$REDMINE_BASE_URL/" >/dev/null 2>&1; then
  echo "✅ Redmine is accessible and ready for testing"
else
  echo "❌ Redmine is not accessible"
  exit 1
fi

echo "⚙️  Setting up complete Redmine environment..."

# Copy complete setup script and run it with environment variables
docker cp "$SCRIPT_DIR/redmine-init.rb" "$CONTAINER_NAME":/usr/src/redmine/
docker exec -e REDMINE_ADMIN_PASSWORD="$REDMINE_ADMIN_PASSWORD" "$CONTAINER_NAME" bash -c 'cd /usr/src/redmine && bundle exec rails runner redmine-init.rb'

echo "✅ Complete Redmine environment configured"
