#!/bin/bash
set -euo pipefail

# Load the source hash calculation function
source ./.github/workflows/scripts/calculate-source-hash.sh

# Calculate current source hash
echo "Calculating current source hash..."
CURRENT_HASH=$(calculate_source_hash)
echo "Current source hash: $CURRENT_HASH"

# Get the latest release
echo "Getting latest release..."

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
    echo "No previous release found. Proceeding with new build."
    PREVIOUS_HASH=""
else
    # Get the latest release ZIP filename
    if command -v jq &> /dev/null; then
        LATEST_FILENAME=$(echo "$LATEST_RELEASE" | jq -r '.assets[0].name // ""')
    else
        LATEST_FILENAME=$(echo "$LATEST_RELEASE" | python3 -c "import sys, json; d=json.load(sys.stdin); assets=d.get('assets', []); print(assets[0]['name'] if assets else '')")
    fi
    
    if [ -n "$LATEST_FILENAME" ]; then
        echo "Latest release filename: $LATEST_FILENAME"
        
        # Extract hash from filename (format: name-vYY.M.D.N-HASH.zip)
        PREVIOUS_HASH=$(echo "$LATEST_FILENAME" | sed -E 's/.*-v[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+-([a-f0-9]+)\.zip$/\1/')
        
        # Validate hash format (should be 64 hex characters)
        if [ ${#PREVIOUS_HASH} -eq 64 ] && [[ "$PREVIOUS_HASH" =~ ^[a-f0-9]+$ ]]; then
            echo "Previous release hash: $PREVIOUS_HASH"
        else
            echo "Could not extract valid hash from filename: $LATEST_FILENAME"
            PREVIOUS_HASH=""
        fi
    else
        echo "No ZIP file found in previous release"
        PREVIOUS_HASH=""
    fi
fi

# Compare hashes
if [ -n "$PREVIOUS_HASH" ]; then
    if [ "$CURRENT_HASH" = "$PREVIOUS_HASH" ]; then
        echo "Source hash matches previous release. No changes detected."
        
        # Output results for GitHub Actions
        if [ -n "${GITHUB_OUTPUT:-}" ]; then
            echo "hash_matches=true" >>$GITHUB_OUTPUT
            echo "current_hash=$CURRENT_HASH" >>$GITHUB_OUTPUT
        fi
        
        exit 0
    else
        echo "Source hash differs from previous release."
        echo "Previous: $PREVIOUS_HASH"
        echo "Current:  $CURRENT_HASH"
    fi
fi

# Output results for GitHub Actions
if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "hash_matches=false" >>$GITHUB_OUTPUT
    echo "current_hash=$CURRENT_HASH" >>$GITHUB_OUTPUT
fi