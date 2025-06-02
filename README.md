# Redmine Markdown Editor Chrome Extension

A Chrome extension that adds a modern Markdown editor overlay to Redmine textareas, providing a better writing experience with live preview and enhanced editing features.

## Features

- **Markdown Editor Overlay**: Replaces Redmine's default textarea with a modern markdown editor
- **Live Preview**: Switch between edit and preview modes seamlessly
- **Drag & Drop Support**: Upload images by dragging them onto the editor
- **Enhanced Toolbar**: Rich formatting tools for better markdown authoring
- **Seamless Integration**: Works with existing Redmine workflows and forms
- **Dynamic Detection**: Automatically detects and enhances textareas on all Redmine pages

## Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Load the `dist/` folder as an unpacked extension in Chrome

## Development

```bash
# Install dependencies
npm install

# Start development mode (hot reload)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Lint code
npm run lint
```

## Architecture

The extension follows SOLID principles with a clean, modular architecture:

```
src/content/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # Business logic services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and constants
└── RedmineMarkdownExtension.ts  # Main orchestrator
```

### Key Components

- **RedmineMarkdownExtension**: Main orchestrator managing the extension lifecycle
- **MarkdownOverlay**: React component providing the markdown editor interface
- **RedmineService**: Handles Redmine-specific operations and detection
- **TextareaProcessor**: Manages textarea enhancement and cleanup
- **DOMObserver**: Monitors for dynamically added textareas

## Compatibility

- **Redmine**: All modern versions
- **Browsers**: Chrome, Edge, and other Chromium-based browsers
- **Pages**: Issues, Wiki, Notes, and any page with `.wiki-edit` textareas

## License

MIT License