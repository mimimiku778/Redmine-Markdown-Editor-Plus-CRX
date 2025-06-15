#!/bin/bash

# CI environment setup script for Chrome Extension E2E tests with Playwright

set -e

echo "🔧 Setting up CI environment for Chrome Extension E2E tests..."

# Install Playwright browsers and dependencies
echo "📦 Installing Playwright browsers with system dependencies..."
npx playwright install --with-deps

# Update package lists
echo "🔄 Updating package lists..."
sudo apt-get update

# Install Xvfb for headless Chrome extension testing
echo "🖥️  Installing virtual display server for Chrome extension testing..."
sudo apt-get install -y xvfb

# Set up virtual display for Chrome browser automation
echo "🚀 Starting virtual display server for headless Chrome..."
export DISPLAY=:99
Xvfb :99 -screen 0 1920x1080x24 > /dev/null 2>&1 &

# Export DISPLAY environment variable for subsequent steps
echo "DISPLAY=:99" >> $GITHUB_ENV

echo "✅ CI environment setup completed successfully!"
echo "   - Playwright browsers installed with Chrome support"
echo "   - Virtual display server running for headless Chrome testing"
echo "   - Environment ready for Chrome Extension E2E tests"
