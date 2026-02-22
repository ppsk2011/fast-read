import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Pre-bundle pdfjs-dist to avoid ESM resolution issues
    include: ['pdfjs-dist'],
  },
  worker: {
    format: 'es',
  },
})
