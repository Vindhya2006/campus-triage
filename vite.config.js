import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // ── Service Worker strategy ──────────────────────────────────────────
      // "generateSW" lets Workbox create the SW automatically.
      // We inject a custom sw addition for push notification handling.
      strategies: 'generateSW',
      registerType: 'autoUpdate',   // SW auto-updates silently in the background
      injectRegister: 'auto',       // Injects the SW registration into the bundle

      // ── PWA Web App Manifest ─────────────────────────────────────────────
      manifest: {
        name: 'CampusTriage',
        short_name: 'CampusTriage',
        description: 'Healthcare support platform for hostel students — doctor consultations, prescriptions, medicine delivery, and emergency support.',
        theme_color: '#1a8fe3',
        background_color: '#f0f7ff',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        lang: 'en',
        categories: ['health', 'medical', 'education'],
        icons: [
          { src: '/icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png' },
          { src: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          // Maskable icons (full-bleed, for Android adaptive icons)
          { src: '/icons/maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'AI Triage',
            short_name: 'Triage',
            description: 'Check your symptoms with AI',
            url: '/?tab=triage',
            icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
          },
          {
            name: 'Emergency',
            short_name: 'SOS',
            description: 'Emergency mode — call hospital',
            url: '/?tab=emergency',
            icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
          },
        ],
      },

      // ── Workbox (service worker) configuration ───────────────────────────
      workbox: {
        // ── Precache all static assets produced by Vite ──
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],

        // ── Runtime caching rules ──
        runtimeCaching: [
          // Google Fonts (if ever used)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Firebase Auth endpoints — NETWORK ONLY, never cache ──
          // Caching Auth responses breaks sign-in/sign-out persistence.
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/identitytoolkit\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/securetoken\.googleapis\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          // ── Firestore — NETWORK ONLY ──
          // Firestore handles its own offline persistence via the SDK;
          // do not let the SW cache these responses separately.
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          // ── Firebase Storage — network first, fall back to cache ──
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Anthropic API (AI triage) — network only ──
          {
            urlPattern: /^https:\/\/api\.anthropic\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          // ── OpenStreetMap tiles — cache first (map tiles rarely change) ──
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── CDN scripts (Leaflet) — stale-while-revalidate ──
          {
            urlPattern: /^https:\/\/unpkg\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cdn-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        // When offline and no cache match, serve the app shell
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],

        // Clean up old caches on activation
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },

      // ── Dev options ──────────────────────────────────────────────────────
      devOptions: {
        enabled: false,   // Keep SW disabled in dev to avoid caching issues
        type: 'module',
      },
    }),
  ],

  // Expose all VITE_* environment variables to the client bundle
  envPrefix: 'VITE_',

  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/groq': {
        target: 'https://api.groq.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/groq/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
})
