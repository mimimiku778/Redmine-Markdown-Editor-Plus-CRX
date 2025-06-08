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
```

## Testing

E2E testing workflow (runs on `npm run test` and GitHub Actions):

- Start latest Redmine Docker instance for testing environment
- Load extension into Playwright Chrome browser
- Verify extension functionality on live Redmine pages

## Future Features

- **Image Display in Markdown Editor**: Proper display of uploaded images in the markdown preview by resolving relative paths to Redmine attachment URLs (`/attachments/download/{ID}/filename`)

## Related

- [React Markdown Editor](https://github.com/uiwjs/react-markdown-editor)
- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin)
- [Vite](https://vitejs.dev/)
- [Playwright](https://playwright.dev/)

## License

MIT