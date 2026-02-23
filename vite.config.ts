import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  // Base path used for GitHub Pages deployment (repo name)
  base: '/fast-read/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'Fast Read — RSVP Reader',
        short_name: 'Fast Read',
        description: 'Read faster with RSVP — one word at a time. PDF & EPUB support.',
        theme_color: '#060606',
        background_color: '#060606',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/fast-read/',
        start_url: '/fast-read/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cache the app shell
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Don't cache the heavy PDF worker (it changes between builds)
        globIgnores: ['**/pdf.worker*'],
      },
    }),
  ],
  // localforage@1.10.0 ships dist/localforage.js in its package.json "main"
  // but this version's dist only contains localforage.min.js, causing Rollup
  // to fail. Pin to the .min.js until localforage publishes a fixed release.
  // If you upgrade localforage, verify the alias is still needed.
  resolve: {
    alias: {
      localforage: resolve(
        __dirname,
        'node_modules/localforage/dist/localforage.min.js',
      ),
    },
  },
  optimizeDeps: {
    // Pre-bundle pdfjs-dist to avoid ESM resolution issues
    // localforage is a dep of vite-plugin-pwa/workbox – needs explicit bundling
    include: ['pdfjs-dist', 'localforage'],
  },
  worker: {
    format: 'es',
  },
})
