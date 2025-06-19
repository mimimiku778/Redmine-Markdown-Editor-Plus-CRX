#!/bin/bash
set -euo pipefail

# Function to calculate SHA256 hash of source files
calculate_source_hash() {
    # Define directories and files to include
    local dirs=("icons" "patches" "src" "_locales")
    local files=("vite.config.ts" "package-lock.json")
    
    # Calculate hash of all specified directories and files
    {
        # Hash directories
        for dir in "${dirs[@]}"; do
            if [ -d "$dir" ]; then
                find "$dir" -type f -exec sha256sum {} \;
            fi
        done
        
        # Hash individual files
        for file in "${files[@]}"; do
            if [ -f "$file" ]; then
                sha256sum "$file"
            fi
        done
    } | sort | sha256sum | cut -d' ' -f1
}

# If this script is run directly, output the hash
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    HASH=$(calculate_source_hash)
    echo "Source hash: $HASH"
    
    # Output for GitHub Actions
    if [ -n "${GITHUB_OUTPUT:-}" ]; then
        echo "source_hash=$HASH" >>$GITHUB_OUTPUT
    fi
fi