#!/bin/bash
set -euo pipefail

# Function to calculate SHA256 hash of the dist directory
calculate_dist_hash() {
    find dist -type f -exec sha256sum {} \; | sort | sha256sum | cut -d' ' -f1
}

# Calculate hash of current dist directory
echo "Calculating hash of dist directory..."
CURRENT_HASH=$(calculate_dist_hash)
echo "Current dist hash: $CURRENT_HASH"

# Get the hash from the latest release
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

# Debug output
if command -v jq &> /dev/null; then
    API_STATUS=$(echo "$LATEST_RELEASE" | jq -r '.message // "OK"')
else
    API_STATUS=$(echo "$LATEST_RELEASE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('message', 'OK'))")
fi
echo "API Response status: $API_STATUS"

if [ "$API_STATUS" = "Not Found" ]; then
    echo "No previous release found. Proceeding with new build."
    PREVIOUS_HASH=""
else
    # Get the ZIP file URL from the latest release
    if command -v jq &> /dev/null; then
        ZIP_URL=$(echo "$LATEST_RELEASE" | jq -r '.assets[0].browser_download_url // ""')
    else
        ZIP_URL=$(echo "$LATEST_RELEASE" | python3 -c "import sys, json; d=json.load(sys.stdin); assets=d.get('assets', []); print(assets[0]['browser_download_url'] if assets else '')")
    fi
    
    if [ -n "$ZIP_URL" ]; then
        echo "Found ZIP file: $ZIP_URL"
        echo "Downloading and extracting previous release..."
        
        # Create temp directory
        TEMP_DIR=$(mktemp -d)
        TEMP_ZIP="$TEMP_DIR/release.zip"
        
        # Download and extract ZIP
        if curl -sL "$ZIP_URL" -o "$TEMP_ZIP"; then
            # Extract the ZIP using Python
            python3 -c "import zipfile; zipfile.ZipFile('$TEMP_ZIP').extractall('$TEMP_DIR')"
            
            # Find the extracted directory (should be named like *-v*)
            EXTRACTED_DIR=$(find "$TEMP_DIR" -maxdepth 1 -type d -name "*-v*" | head -1)
            
            if [ -n "$EXTRACTED_DIR" ] && [ -d "$EXTRACTED_DIR" ]; then
                # Calculate hash of the extracted directory
                PREVIOUS_HASH=$(find "$EXTRACTED_DIR" -type f -exec sha256sum {} \; | sort | sha256sum | cut -d' ' -f1)
                echo "Previous release hash: $PREVIOUS_HASH"
            else
                echo "Could not find extracted directory in ZIP"
                PREVIOUS_HASH=""
            fi
        else
            echo "Failed to download previous release ZIP"
            PREVIOUS_HASH=""
        fi
        
        # Clean up
        rm -rf "$TEMP_DIR"
    else
        echo "No ZIP file found in previous release"
        PREVIOUS_HASH=""
    fi
    
    if [ -z "$PREVIOUS_HASH" ]; then
        echo "No hash available from previous release. Proceeding with new build."
    else
        echo "Previous release hash: $PREVIOUS_HASH"
        
        # Compare hashes
        if [ "$CURRENT_HASH" = "$PREVIOUS_HASH" ]; then
            echo "Build hash matches previous release. No changes detected."
            
            # Output results for GitHub Actions
            if [ -n "$GITHUB_OUTPUT" ]; then
                echo "hash_matches=true" >>$GITHUB_OUTPUT
                echo "current_hash=$CURRENT_HASH" >>$GITHUB_OUTPUT
            fi
            
            exit 0
        else
            echo "Build hash differs from previous release."
        fi
    fi
fi

# Output results for GitHub Actions
if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "hash_matches=false" >>$GITHUB_OUTPUT
    echo "current_hash=$CURRENT_HASH" >>$GITHUB_OUTPUT
fi