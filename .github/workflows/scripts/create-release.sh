#!/bin/bash
set -e

# Configuration
REPO_NAME=$(basename "$GITHUB_REPOSITORY")
DATE=$(date +'%y.%-m.%-d')

echo "=== Creating release for $REPO_NAME ==="
echo "Date: $DATE"

# Use GitHub API to get the number of releases for today
echo "Checking existing releases for today..."
RELEASES_TODAY=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GITHUB_REPOSITORY/releases" |
    jq -r --arg date "$DATE" '[.[] | select(.tag_name | contains($date)) | .tag_name] | length')

# Release number for the same day (starting from 0)
RELEASE_NUMBER=$RELEASES_TODAY
VERSION="${DATE}.${RELEASE_NUMBER}"
FILENAME="${REPO_NAME}-v${VERSION}"

echo "Release number for today: $RELEASE_NUMBER"
echo "Generated version: $VERSION"
echo "Generated filename: $FILENAME"

# Pass output to GitHub Actions
if [ -n "$GITHUB_OUTPUT" ]; then
    echo "version=$VERSION" >>$GITHUB_OUTPUT
    echo "filename=$FILENAME" >>$GITHUB_OUTPUT
fi

# Update manifest.json version
echo "Updating manifest.json version..."
if [ -f "dist/manifest.json" ]; then
    npx dot-json@1 dist/manifest.json version "$VERSION"
    echo "Updated manifest.json version to: $VERSION"

    # Verify the updated version
    UPDATED_VERSION=$(npx dot-json@1 dist/manifest.json version)
    echo "Verified manifest.json version: $UPDATED_VERSION"
else
    echo "Warning: dist/manifest.json not found"
fi

# Rename dist folder and create ZIP archive
echo "Creating ZIP archive..."
if [ -d "dist" ]; then
    mv dist "$FILENAME"
    zip -r "${FILENAME}.zip" "$FILENAME"
    echo "ZIP archive created: ${FILENAME}.zip"
else
    echo "Error: dist folder not found"
    exit 1
fi

echo "=== Release preparation completed ==="
