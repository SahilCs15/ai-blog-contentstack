import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pure client-side SPA. The Contentstack delivery SDK and live-preview-utils
// both run in the browser; LP.init is called with ssr:false.
export default defineConfig({
  plugins: [react()],
  server: { port: 3010 },
  preview: { port: 3010 },
})
