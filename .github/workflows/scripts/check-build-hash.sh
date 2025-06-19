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

# Check if required environment variables are set
if [ -z "$GITHUB_REPOSITORY" ]; then
    # Try to detect from git remote if not set
    GITHUB_REPOSITORY=$(git remote get-url origin | sed -E 's|.*github.com[:/](.*)\.git|\1|' || echo "")
    if [ -z "$GITHUB_REPOSITORY" ]; then
        echo "Error: GITHUB_REPOSITORY not set and could not be detected"
        exit 1
    fi
    echo "Detected repository: $GITHUB_REPOSITORY"
fi

# Make API call with or without token
if [ -n "$GITHUB_TOKEN" ]; then
    LATEST_RELEASE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$GITHUB_REPOSITORY/releases/latest")
else
    echo "Warning: GITHUB_TOKEN not set, using unauthenticated API call"
    LATEST_RELEASE=$(curl -s "https://api.github.com/repos/$GITHUB_REPOSITORY/releases/latest")
fi

# Debug output
echo "API Response status: $(echo "$LATEST_RELEASE" | jq -r '.message // "OK"')"

if [ "$(echo "$LATEST_RELEASE" | jq -r '.message // empty')" = "Not Found" ]; then
    echo "No previous release found. Proceeding with new build."
    PREVIOUS_HASH=""
else
    # Debug: Show release body
    RELEASE_BODY=$(echo "$LATEST_RELEASE" | jq -r '.body // ""')
    echo "Release body length: ${#RELEASE_BODY} characters"
    
    # Extract hash from release body if it exists
    PREVIOUS_HASH=$(echo "$RELEASE_BODY" | grep -oP '\*\*Build Hash:\*\* `[^`]+`' | grep -oP '`[^`]+`' | tr -d '`' || echo "")
    
    if [ -z "$PREVIOUS_HASH" ]; then
        echo "No hash found in previous release. Proceeding with new build."
        # Debug: Show last few lines of release body
        echo "Last 5 lines of release body:"
        echo "$RELEASE_BODY" | tail -5
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