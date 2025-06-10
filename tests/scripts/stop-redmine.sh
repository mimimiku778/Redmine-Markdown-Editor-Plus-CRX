#!/bin/bash

# Stop and remove Redmine containers completely

set -e

# Determine script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TESTS_DIR="$(dirname "$SCRIPT_DIR")"

cd "$TESTS_DIR"

# Load environment variables
source "$SCRIPT_DIR/load-env.sh"

echo "🛑 Stopping Redmine environment..."
echo "  Container: $CONTAINER_NAME"

# Stop and remove containers, networks, and volumes
REDMINE_PORT=$REDMINE_PORT docker compose -f "$TESTS_DIR/docker-compose.test.yml" down -v --remove-orphans

echo "🧹 Cleaning up Docker resources..."

# Remove any remaining containers with the same name
if docker ps -a --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
    echo "  Removing container: $CONTAINER_NAME"
    docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
fi

# Remove any dangling volumes related to the project
docker volume prune -f >/dev/null 2>&1 || true

echo "✅ Redmine environment completely removed"