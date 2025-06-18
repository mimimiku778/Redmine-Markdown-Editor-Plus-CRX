# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome Extension (Manifest V3) that enhances Redmine's issue tracking system by replacing native textareas with a CodeMirror-based Markdown editor. The extension uses React 19, TypeScript, and Vite with the CRXJS plugin for development.

## Essential Commands

### Development
- `npm run dev` - Start Vite development server for extension development
- `npm run build` - Build the extension (TypeScript compilation + Vite production build)
- `npm run type-check` - Run TypeScript type checking without emitting files

### Code Quality
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted

### Testing
- `npm run test` - Run E2E tests with Playwright (automatically sets up Redmine Docker container)
- `npm run redmine` - Start Redmine Docker container for manual testing
- `npm run redmine:down` - Stop and remove Redmine Docker container

### Maintenance
- `npm run update:css-patches` - Update CSS patches for @uiw/react-markdown-preview

## Architecture Overview

### Core Integration Flow
1. **Content Script** (`src/content-script.tsx`) initializes when DOM is ready
2. **RedmineMarkdownExtension** (`src/content/RedmineMarkdownExtension.ts`) detects Redmine pages and processes textareas
3. **TextareaProcessor** (`src/content/services/TextareaProcessor.ts`) wraps textareas with React components
4. **MarkdownOverlay** (`src/content/components/MarkdownOverlay.tsx`) provides the rich editing experience

### Key Architectural Patterns

#### Non-Destructive Integration
The extension hides original textareas rather than removing them, preserving Redmine's form submission functionality. This is critical for maintaining compatibility.

#### Hook-Based Feature Organization
Each feature is encapsulated in a custom hook in `src/content/hooks/`:
- `useTextareaSync` - Bidirectional sync between editor and textarea
- `useExtensions` - CodeMirror extensions configuration
- `useDragAndDrop` - File upload handling
- `usePaste` - Enhanced paste functionality
- `useTabState` - Preview/edit mode management

#### Dynamic Content Handling
MutationObservers monitor for dynamically added textareas (e.g., AJAX-loaded comment forms) to ensure the extension works with all Redmine content.

### Important Implementation Details

#### Textarea Detection
Redmine textareas are identified by these selectors (defined in `src/config/index.ts`):
- `.wiki-edit` - Wiki content textareas
- `.jstBlock textarea` - Issue description and comment textareas

#### CSS Customization
The extension uses patch-package to modify styles of @uiw/react-markdown-preview. Custom styles are in `patches/markdown-fix.css`. After modifying, run `npm run update:css-patches`.

#### Extension Features
- Custom toolbar commands in `src/content/custom-commands/`
- Remark plugins for markdown processing in `src/content/remark-plugins/`
- CodeMirror extensions in `src/content/extensions/`

### Testing Infrastructure

E2E tests use Playwright with a Docker-based Redmine instance. The test workflow:
1. Builds the extension
2. Starts Redmine container with test data
3. Runs Playwright tests against live Redmine
4. Cleans up containers (unless in CI)

Test files are in `tests/e2e/` and test against real Redmine functionality.

### Build Configuration

The extension uses Vite with @crxjs/vite-plugin. Key configuration:
- Manifest defined in `vite.config.ts`
- Content script injected on `*://*/issues/*` URLs
- TypeScript with strict mode and project references
- React 19 with the new JSX transform

### Development Tips

1. When modifying the editor integration, always test with both static and dynamically loaded textareas
2. Ensure form submissions still work after changes - the original textarea must receive the editor's value
3. Test with different Redmine themes as CSS selectors may vary
4. Use the Docker Redmine instance for consistent testing environment
5. Check browser console for extension errors during development