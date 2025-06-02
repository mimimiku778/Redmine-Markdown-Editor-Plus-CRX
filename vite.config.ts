import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
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
    },
  ],
  permissions: ['activeTab'],
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
})
