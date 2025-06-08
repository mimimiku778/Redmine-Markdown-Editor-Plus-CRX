import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx, defineManifest } from '@crxjs/vite-plugin'

const manifest = defineManifest({
  manifest_version: 3,
  name: 'Redmine Markdown Editor',
  version: '1.0.0',
  description: 'Markdown editor overlay for Redmine textareas',
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content-script.tsx'],
      run_at: 'document_end',
    },
  ],
  host_permissions: ['<all_urls>'],
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  // Without configuring the server, the error "WebSocket connection to 'ws://localhost/' failed" will occur.
  // https://github.com/crxjs/chrome-extension-tools/issues/746#issuecomment-1647484887
  server: {
    cors: {
      origin: [
        // ⚠️ SECURITY RISK: Allows any chrome-extension to access the vite server ⚠️
        // See https://github.com/crxjs/chrome-extension-tools/issues/971 for more info
        // I don't believe that the linked issue mentions a potential solution
        /chrome-extension:\/\//,
      ],
    },
  },
  legacy: {
    // ⚠️ SECURITY RISK: Allows WebSockets to connect to the vite server without a token check ⚠️
    // See https://github.com/crxjs/chrome-extension-tools/issues/971 for more info
    // The linked issue gives a potential fix that @crxjs/vite-plugin could implement
    skipWebSocketTokenCheck: true,
  },
  build: {
    chunkSizeWarningLimit: 5000, // Increase chunk size limit to avoid warnings
  },
})
