#!/bin/bash

# Load environment variables helper
# Usage: source "$(dirname "$0")/load-env.sh"

# Determine script directory
LOAD_ENV_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TESTS_DIR="$(dirname "$LOAD_ENV_SCRIPT_DIR")"

# Load environment variables with fallback to defaults
if [ -f "$TESTS_DIR/.env" ]; then
  set -a && source "$TESTS_DIR/.env" && set +a
else
  set -a && source "$TESTS_DIR/.env.default" && set +a
fi