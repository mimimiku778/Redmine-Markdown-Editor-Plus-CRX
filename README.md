#　![icon](icons/icon-48.png) Redmine Markdown Editor Plus

A Chrome extension that adds a CodeMirror-based Markdown editor to Redmine textareas with syntax highlighting, live preview, and enhanced editing capabilities.

## Features

- **Rich Markdown Editor**: Replaces plain textareas with a powerful Markdown editor
- **Drag & Drop Support**: Easy file uploads with drag and drop functionality
- **Live Preview**: Instant preview of Markdown content
- **Custom Shortcuts**: Keyboard shortcuts for enhanced productivity
- **Seamless Integration**: Non-intrusive overlay that preserves Redmine's native functionality

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

- Image Display in Markdown Editor

## Related

- [React Markdown Editor](https://github.com/uiwjs/react-markdown-editor)
- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin)
- [Vite](https://vitejs.dev/)
- [Playwright](https://playwright.dev/)

## License

MIT

---

# ![icon](icons/icon-48.png) Redmine Markdown エディター Plus

RedmineのテキストエリアにCodeMirrorベースのMarkdownエディターを追加し、シンタックスハイライト、ライブプレビュー、高度な編集機能を提供するChrome拡張機能です。

## 機能

- プレーンテキストエリアを置き換えるリッチMarkdownエディター
- ドラッグ&ドロップファイルサポート
- ライブプレビュー機能
- カスタムキーボードショートカット
- Redmineとのシームレスな統合

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

- Markdownエディターでの画像表示

## 関連

- [React Markdown Editor](https://github.com/uiwjs/react-markdown-editor)
- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin)
- [Vite](https://vitejs.dev/)
- [Playwright](https://playwright.dev/)

## ライセンス

MIT