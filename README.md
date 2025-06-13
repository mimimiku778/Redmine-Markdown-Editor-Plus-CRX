# Redmine Markdown Editor Chrome Extension

Chrome extension that adds a Markdown editor overlay to Redmine textareas with real-time sync and advanced editing features.

## Features

- Rich Markdown editor replacing plain textareas
- Real-time content synchronization 
- Drag & drop file support
- Preview mode detection
- Custom keyboard shortcuts
- Redmine-specific list formatting

## Installation

1. Clone repository
2. `npm install`
3. `npm run build`
4. Load `dist/` folder in Chrome as unpacked extension

## Development

```bash
npm install        # Install dependencies
npm run dev        # Development mode
npm run build      # Production build
npm run type-check # Type checking
npm run lint       # Lint code
npm run format     # Format code
npm run test         # Run tests
npm run redmine      # Start Redmine Docker container for development
npm run redmine:down # Stop and remove Redmine Docker container
npm run update:patches # Update patches from patches/markdown-fix.css
```

## CSS Patches

This project uses patches to customize the styling of the `@uiw/react-markdown-preview` package for better integration with Redmine's styles:

- `patches/markdown-fix.css` - Modified CSS file with Redmine-optimized styles
- `patches/@uiw+react-markdown-preview+*.patch` - Auto-generated patch file

To update the patch after modifying `patches/markdown-fix.css`:

```bash
npm run update:patches
```

## Testing

E2E testing workflow (runs on `npm run test` and GitHub Actions):

- Start latest Redmine Docker instance for testing environment
- Load extension into Playwright Chrome browser
- Verify extension functionality on live Redmine pages

## Future Features

- **Image Display in Markdown Editor**: Proper display of uploaded images in the markdown preview by resolving relative paths to Redmine attachment URLs (`/attachments/download/{ID}/filename`)
  - Implementation approach: Extract attachment IDs from Redmine's preview API response HTML and map them to filenames for remark plugin processing

## Related

- [React Markdown Editor](https://github.com/uiwjs/react-markdown-editor)
- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin)
- [Vite](https://vitejs.dev/)
- [Playwright](https://playwright.dev/)

## License

MIT

---

# Redmine Markdown Editor Chrome拡張機能

Redmineのテキストエリアにリアルタイム同期と高度な編集機能を備えたMarkdownエディターオーバーレイを追加するChrome拡張機能です。

## 機能

- プレーンテキストエリアを置き換えるリッチMarkdownエディター
- リアルタイムコンテンツ同期
- ドラッグ&ドロップファイルサポート
- プレビューモード検出
- カスタムキーボードショートカット
- Redmine固有のリスト書式設定

## インストール

1. リポジトリをクローン
2. `npm install`
3. `npm run build`
4. Chrome で `dist/` フォルダーを未パッケージ拡張機能として読み込み

## 開発

```bash
npm install        # 依存関係のインストール
npm run dev        # 開発モード
npm run build      # プロダクションビルド
npm run type-check # 型チェック
npm run lint       # コードのリント
npm run format     # コードのフォーマット
npm run test       # テストの実行
npm run redmine    # 開発用Redmine Dockerコンテナーの起動
npm run redmine:down # Redmine Dockerコンテナーの停止・削除
npm run update:patches # patches/markdown-fix.cssからパッチを更新
```

## CSSパッチ

このプロジェクトでは、`@uiw/react-markdown-preview`パッケージのスタイルをRedmineとより良く統合するためにパッチを使用しています：

- `patches/markdown-fix.css` - Redmine最適化スタイルを含む修正済みCSSファイル
- `patches/@uiw+react-markdown-preview+*.patch` - 自動生成されるパッチファイル

`patches/markdown-fix.css`を変更した後にパッチを更新するには：

```bash
npm run update:patches
```

## テスト

E2Eテストワークフロー（`npm run test` とGitHub Actionsで実行）：

- テスト環境用に最新のRedmine Dockerインスタンスを起動
- Playwright Chromeブラウザーに拡張機能をロード
- 実際のRedmineページで拡張機能の動作を検証

## 今後の機能

- **Markdownエディターでの画像表示**: 相対パスをRedmineの添付ファイルURL（`/attachments/download/{ID}/filename`）に解決することで、アップロードされた画像をMarkdownプレビューで適切に表示
  - 実装アプローチ: RedmineのプレビューAPI応答HTMLから添付ファイルIDを抽出し、remarkプラグイン処理用にファイル名にマッピング
  - もしくはSession Storageにアップロードした画像を保持してプレビューで表示する？

## 関連

- [React Markdown Editor](https://github.com/uiwjs/react-markdown-editor)
- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin)
- [Vite](https://vitejs.dev/)
- [Playwright](https://playwright.dev/)

## ライセンス

MIT