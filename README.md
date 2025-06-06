# Redmine Markdown Editor Chrome Extension

A Chrome extension that enhances Redmine's textarea fields with a powerful Markdown editor, providing a modern writing experience with live preview and advanced editing features.

## Features

- 🎨 **Rich Markdown Editor**: Replaces Redmine's plain textareas with a feature-rich Markdown editor
- 🔄 **Real-time Sync**: Automatically syncs content between the editor and original textarea
- 📎 **Drag & Drop Support**: Drag and drop files directly into the editor
- 👁️ **Preview Mode Detection**: Automatically hides when in preview mode
- ⌨️ **Custom Keyboard Shortcuts**: Enhanced editing experience with custom keybindings
- 🧩 **Custom Commands**: Support for ordered/unordered lists with Redmine-specific formatting
- 🔍 **Debug Logging**: Configurable logging for development and troubleshooting
- ⚡ **Performance Optimized**: Efficient DOM observation and minimal re-renders

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
npm run lint:fix

# Format code
npm run format
npm run format:check

# Run tests
npm run test

# Debug tests
npm run test:debug

# Run tests with UI mode
npm run test:ui
```

## Architecture

The extension follows clean architecture principles with strong TypeScript typing:

```
src/
├── config/              # Configuration and constants
│   └── index.ts        # Central configuration
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types and interfaces
├── utils/              # Utility functions
│   ├── logger.ts       # Logging utility
│   └── errors.ts       # Error handling utilities
├── content/
│   ├── components/     # React components
│   │   └── MarkdownOverlay.tsx
│   ├── custom-commands/ # Custom editor commands
│   │   ├── olist.tsx   # Ordered list command
│   │   └── ulist.tsx   # Unordered list command
│   ├── extensions/     # Editor extensions
│   │   └── customKeymap.ts
│   ├── hooks/          # React hooks
│   │   ├── useTabState.ts
│   │   ├── useTextareaSync.ts
│   │   └── useDragAndDrop.ts
│   ├── remark-plugins/ # Markdown plugins
│   │   └── remark-collapse.tsx
│   ├── services/       # Core services
│   │   ├── DOMObserver.ts
│   │   ├── RedmineService.ts
│   │   ├── TextareaProcessor.ts
│   │   └── domUtils.ts
│   └── RedmineMarkdownExtension.ts
└── content-script.tsx  # Extension entry point
```

## Key Components

### Services
- **DOMObserver**: Monitors DOM changes for new textareas with cleanup management
- **RedmineService**: Detects Redmine pages and finds relevant textareas
- **TextareaProcessor**: Manages overlay creation and cleanup with error handling
- **DOMUtils**: Utility functions for safe DOM manipulation

### Hooks
- **useTabState**: Tracks preview/edit mode state with mutation observation
- **useTextareaSync**: Bidirectional content synchronization with performance optimization
- **useDragAndDrop**: Handles file drag and drop with position calculation

### Error Handling & Logging
- Custom error types for different failure scenarios
- Configurable debug logging via environment
- Graceful error recovery and fallbacks
- Comprehensive error context tracking

## Configuration

The extension can be configured via `src/config/index.ts`:

```typescript
export const CONFIG = {
  debug: import.meta.env.DEV,  // Auto-enabled in development
  syncInterval: 500,           // Textarea sync interval (ms)
  cursorSyncDelay: 10,        // Cursor position sync delay (ms)
  overlay: {
    minHeight: 200,           // Minimum editor height
    backgroundColor: 'white'   // Editor background color
  }
}
```

## Security

- No external runtime dependencies
- All processing happens locally in the browser
- No data transmission to external servers
- Follows Chrome extension security best practices

## Browser Compatibility

- Chrome/Chromium 90+
- Edge 90+
- Other Chromium-based browsers

## Performance

- Efficient DOM observation with debouncing
- Memoized React components to prevent unnecessary re-renders
- Lazy initialization of editor features
- Automatic cleanup of resources

## Testing

The extension includes a minimal test suite using Playwright to verify successful builds:

```bash
# Run tests
npm run test

# Debug tests
npm run test:debug

# Run tests with UI mode
npm run test:ui
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Write tests for new functionality
5. Ensure all tests pass and linting is clean
6. Submit a pull request

## License

MIT License