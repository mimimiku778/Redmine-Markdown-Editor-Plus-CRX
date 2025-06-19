#!/bin/bash

# Local test runner script with Redmine environment

set -e

# Determine script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TESTS_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$TESTS_DIR")"

cd "$TESTS_DIR"

# Cleanup function to ensure containers are always removed
cleanup() {
  # Skip cleanup in CI environment
  if [ "$CI" = "true" ]; then
    echo "🔄 Skipping cleanup in CI environment"
    return
  fi

  echo "🧹 Cleaning up containers and volumes..."
  # Load environment variables
  source "$SCRIPT_DIR/load-env.sh"

  if REDMINE_PORT=$REDMINE_PORT docker compose -f "$TESTS_DIR/docker-compose.test.yml" down -v --timeout 10; then
    echo "✅ Cleanup completed successfully"
  else
    echo "⚠️  Cleanup completed with warnings"
  fi
}

# Set trap to cleanup on script exit (success, error, or interrupt)
trap cleanup EXIT

# Load environment variables
source "$SCRIPT_DIR/load-env.sh"

# Check if containers are already running
echo "🔍 Checking for existing Docker containers..."
EXISTING_CONTAINERS=$(REDMINE_PORT=$REDMINE_PORT docker compose -f "$TESTS_DIR/docker-compose.test.yml" ps -q)

if [ ! -z "$EXISTING_CONTAINERS" ]; then
  echo "⚠️  Found existing Docker containers for this project."
  echo "Running containers:"
  REDMINE_PORT=$REDMINE_PORT docker compose -f "$TESTS_DIR/docker-compose.test.yml" ps
  echo

  # Auto-cleanup for CI or non-interactive environments
  if [ "$CI" = "true" ] || [ ! -t 0 ]; then
    echo "🛑 Auto-removing existing containers (non-interactive mode)..."
    REDMINE_PORT=$REDMINE_PORT docker compose -f "$TESTS_DIR/docker-compose.test.yml" down -v
    echo "✅ Existing containers removed"
  else
    read -p "Do you want to stop and remove these containers? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "🛑 Stopping and removing existing containers..."
      REDMINE_PORT=$REDMINE_PORT docker compose -f "$TESTS_DIR/docker-compose.test.yml" down -v
      echo "✅ Existing containers removed"
    else
      echo "❌ Cannot proceed with existing containers running. Exiting."
      exit 1
    fi
  fi
fi

if [ "$CI" != "true" ] || [ ! -d "$PROJECT_ROOT/dist" ]; then
  # Build the extension
  echo "📦 Building extension..."
  cd "$PROJECT_ROOT"
  npm run build
fi

cd "$TESTS_DIR"

# Start E2E tests with Redmine environment
echo "🚀 Starting E2E tests with Redmine environment..."
"$SCRIPT_DIR/run-redmine.sh"

# Run tests
echo "🧪 Running Playwright tests..."
cd "$PROJECT_ROOT"
# Export environment variables for Playwright config
export REDMINE_PORT="$REDMINE_PORT"
export REDMINE_ADMIN_PASSWORD="$REDMINE_ADMIN_PASSWORD"
CI=true npx playwright test --config tests/playwright.config.ts tests/e2e/01-redmine-setup.spec.ts tests/e2e/02-extension-redmine.spec.ts

echo "✅ Tests completed!"
