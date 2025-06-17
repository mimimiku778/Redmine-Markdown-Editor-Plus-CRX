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

# Get the latest merged PR title from commits
echo "Getting latest merged PR title..."
LATEST_PR_TITLE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GITHUB_REPOSITORY/pulls?state=closed&sort=updated&direction=desc" |
    jq -r '[.[] | select(.merged_at != null)] | .[0].title // "No recent merged PR found"')

echo "Latest merged PR title: $LATEST_PR_TITLE"

# Create dynamic release body
echo "Creating dynamic release body..."
RELEASE_BODY_FILE="release-body-generated.md"

# Create release body with appropriate section based on PR title if PR title exists
if [ "$LATEST_PR_TITLE" != "No recent merged PR found" ]; then
    # Determine section based on PR title prefix
    if [[ "$LATEST_PR_TITLE" =~ ^feat: ]]; then
        SECTION_TITLE="🆕 Features"
    elif [[ "$LATEST_PR_TITLE" =~ ^fix: ]]; then
        SECTION_TITLE="🐛 Bug Fixes"
    elif [[ "$LATEST_PR_TITLE" =~ ^refactor: ]]; then
        SECTION_TITLE="🔧 Improvements"
    elif [[ "$LATEST_PR_TITLE" =~ ^docs: ]]; then
        SECTION_TITLE="📝 Documentation"
    else
        SECTION_TITLE="✨ Changes"
    fi
    
    cat > "$RELEASE_BODY_FILE" << EOF
### $SECTION_TITLE
- $LATEST_PR_TITLE

$(cat .github/workflows/templates/release-body.md)
EOF
else
    cp .github/workflows/templates/release-body.md "$RELEASE_BODY_FILE"
fi

echo "Release body created: $RELEASE_BODY_FILE"

# Pass the release body file path to GitHub Actions
if [ -n "$GITHUB_OUTPUT" ]; then
    echo "version=$VERSION" >>$GITHUB_OUTPUT
    echo "filename=$FILENAME" >>$GITHUB_OUTPUT
    echo "pr_title=$LATEST_PR_TITLE" >>$GITHUB_OUTPUT
    echo "release_body_file=$RELEASE_BODY_FILE" >>$GITHUB_OUTPUT
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
