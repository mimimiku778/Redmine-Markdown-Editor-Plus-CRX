#!/bin/bash

# Local test runner script with Redmine environment

set -e

# Determine script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$SCRIPT_DIR"

# Cleanup function to ensure containers are always removed
cleanup() {
  echo "🧹 Cleaning up containers and volumes..."
  if docker compose -f "$SCRIPT_DIR/docker-compose.test.yml" down -v --timeout 10; then
    echo "✅ Cleanup completed successfully"
  else
    echo "⚠️  Cleanup completed with warnings"
  fi
}

# Set trap to cleanup on script exit (success, error, or interrupt)
trap cleanup EXIT

# Check if containers are already running
echo "🔍 Checking for existing Docker containers..."
EXISTING_CONTAINERS=$(docker compose -f "$SCRIPT_DIR/docker-compose.test.yml" ps -q)

if [ ! -z "$EXISTING_CONTAINERS" ]; then
  echo "⚠️  Found existing Docker containers for this project."
  echo "Running containers:"
  docker compose -f "$SCRIPT_DIR/docker-compose.test.yml" ps
  echo
  read -p "Do you want to stop and remove these containers? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🛑 Stopping and removing existing containers..."
    docker compose -f "$SCRIPT_DIR/docker-compose.test.yml" down -v
    echo "✅ Existing containers removed"
  else
    echo "❌ Cannot proceed with existing containers running. Exiting."
    exit 1
  fi
fi

# Start E2E tests with Redmine environment
./run-redmine.sh

# Run tests
echo "🧪 Running Playwright tests..."
cd "$PROJECT_ROOT"
CI=true npx playwright test tests/e2e/extension-redmine.spec.ts

echo "✅ Tests completed!"
