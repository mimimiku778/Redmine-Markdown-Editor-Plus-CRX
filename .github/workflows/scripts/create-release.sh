#!/bin/bash
set -e

# 設定
REPO_NAME="redmine-markdown-editor-crx"
DATE=$(date +'%Y.%m.%d')

echo "=== Creating release for $REPO_NAME ==="
echo "Date: $DATE"

# GitHub APIを使用して同日のリリース数を取得
echo "Checking existing releases for today..."
RELEASES_TODAY=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_REPOSITORY/releases" | \
  jq -r --arg date "$DATE" '[.[] | select(.tag_name | contains($date)) | .tag_name] | length')

# 同日のリリース番号（0から始まる）
RELEASE_NUMBER=$RELEASES_TODAY
VERSION="${DATE}.${RELEASE_NUMBER}"
FILENAME="${REPO_NAME}-v${VERSION}"

echo "Release number for today: $RELEASE_NUMBER"
echo "Generated version: $VERSION"
echo "Generated filename: $FILENAME"

# 出力をGitHub Actionsに渡す
if [ -n "$GITHUB_OUTPUT" ]; then
    echo "version=$VERSION" >> $GITHUB_OUTPUT
    echo "filename=$FILENAME" >> $GITHUB_OUTPUT
fi

# manifest.jsonのバージョンを更新
echo "Updating manifest.json version..."
if [ -f "dist/manifest.json" ]; then
    npx dot-json@1 dist/manifest.json version "$VERSION"
    echo "Updated manifest.json version to: $VERSION"
    
    # 更新されたバージョンを確認
    UPDATED_VERSION=$(npx dot-json@1 dist/manifest.json version)
    echo "Verified manifest.json version: $UPDATED_VERSION"
else
    echo "Warning: dist/manifest.json not found"
fi

# distフォルダをリネームしてZIPを作成
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
