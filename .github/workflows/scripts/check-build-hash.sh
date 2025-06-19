#!/bin/bash
set -e

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
LATEST_RELEASE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GITHUB_REPOSITORY/releases/latest")

if [ "$(echo "$LATEST_RELEASE" | jq -r '.message // empty')" = "Not Found" ]; then
    echo "No previous release found. Proceeding with new build."
    PREVIOUS_HASH=""
else
    # Extract hash from release body if it exists
    PREVIOUS_HASH=$(echo "$LATEST_RELEASE" | jq -r '.body // ""' | grep -oP '\*\*Build Hash:\*\* `[^`]+`' | grep -oP '`[^`]+`' | tr -d '`' || echo "")
    
    if [ -z "$PREVIOUS_HASH" ]; then
        echo "No hash found in previous release. Proceeding with new build."
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
if [ -n "$GITHUB_OUTPUT" ]; then
    echo "hash_matches=false" >>$GITHUB_OUTPUT
    echo "current_hash=$CURRENT_HASH" >>$GITHUB_OUTPUT
fi