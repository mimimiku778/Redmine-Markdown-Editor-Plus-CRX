#!/bin/bash
set -euo pipefail

# Function to calculate SHA256 hash of the ZIP file
calculate_zip_hash() {
    if [ -f "$1" ]; then
        sha256sum "$1" | cut -d' ' -f1
    else
        echo "Error: ZIP file not found: $1" >&2
        return 1
    fi
}

# Check if ZIP file is provided as argument
if [ $# -eq 0 ]; then
    echo "Error: No ZIP file provided"
    echo "Usage: $0 <zip-file>"
    exit 1
fi

ZIP_FILE="$1"

# Calculate hash of current ZIP file
echo "Calculating hash of ZIP file..."
CURRENT_HASH=$(calculate_zip_hash "$ZIP_FILE")
echo "Current ZIP hash: $CURRENT_HASH"

# Get the latest release
echo "Getting hash from latest release..."

# Check if required environment variables are set
if [ -z "${GITHUB_REPOSITORY:-}" ]; then
    # Try to detect from git remote if not set
    GITHUB_REPOSITORY=$(git remote get-url origin | sed -E 's|.*github.com[:/](.*)\.git|\1|' || echo "")
    if [ -z "$GITHUB_REPOSITORY" ]; then
        echo "Error: GITHUB_REPOSITORY not set and could not be detected"
        exit 1
    fi
    echo "Detected repository: $GITHUB_REPOSITORY"
fi

# Make API call with or without token
if [ -n "${GITHUB_TOKEN:-}" ]; then
    LATEST_RELEASE=$(curl -sL -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$GITHUB_REPOSITORY/releases/latest")
else
    echo "Warning: GITHUB_TOKEN not set, using unauthenticated API call"
    LATEST_RELEASE=$(curl -sL "https://api.github.com/repos/$GITHUB_REPOSITORY/releases/latest")
fi

# Check API response status
if command -v jq &> /dev/null; then
    API_STATUS=$(echo "$LATEST_RELEASE" | jq -r '.message // "OK"')
else
    API_STATUS=$(echo "$LATEST_RELEASE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('message', 'OK'))")
fi
echo "API Response status: $API_STATUS"

if [ "$API_STATUS" = "Not Found" ]; then
    echo "No previous release found. Proceeding with new release."
    PREVIOUS_HASH=""
else
    # Get the ZIP file URL from the latest release
    if command -v jq &> /dev/null; then
        ZIP_URL=$(echo "$LATEST_RELEASE" | jq -r '.assets[0].browser_download_url // ""')
    else
        ZIP_URL=$(echo "$LATEST_RELEASE" | python3 -c "import sys, json; d=json.load(sys.stdin); assets=d.get('assets', []); print(assets[0]['browser_download_url'] if assets else '')")
    fi
    
    if [ -z "$ZIP_URL" ]; then
        echo "No ZIP file found in previous release. Proceeding with new release."
        PREVIOUS_HASH=""
    else
        echo "Found ZIP file: $ZIP_URL"
        echo "Downloading and calculating hash of previous release ZIP..."
        
        # Download the ZIP file and calculate its hash
        TEMP_ZIP=$(mktemp)
        if curl -sL "$ZIP_URL" -o "$TEMP_ZIP"; then
            PREVIOUS_HASH=$(sha256sum "$TEMP_ZIP" | cut -d' ' -f1)
            echo "Previous release ZIP hash: $PREVIOUS_HASH"
            rm -f "$TEMP_ZIP"
        else
            echo "Failed to download previous release ZIP. Proceeding with new release."
            PREVIOUS_HASH=""
            rm -f "$TEMP_ZIP"
        fi
    fi
fi

# Compare hashes
if [ -n "$PREVIOUS_HASH" ]; then
    if [ "$CURRENT_HASH" = "$PREVIOUS_HASH" ]; then
        echo "ZIP hash matches previous release. No changes detected."
        
        # Output results for GitHub Actions
        if [ -n "${GITHUB_OUTPUT:-}" ]; then
            echo "hash_matches=true" >>$GITHUB_OUTPUT
            echo "current_hash=$CURRENT_HASH" >>$GITHUB_OUTPUT
        fi
        
        exit 0
    else
        echo "ZIP hash differs from previous release. Proceeding with new release."
    fi
fi

# Output results for GitHub Actions
if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "hash_matches=false" >>$GITHUB_OUTPUT
    echo "current_hash=$CURRENT_HASH" >>$GITHUB_OUTPUT
fi