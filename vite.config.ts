import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Araz Chat",
        short_name: "Araz Chat",
        description: "Araz Chat - Connect and communicate",
        theme_color: "#60a5fa",
        background_color: "#ffffff",
        display: "fullscreen",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/logo.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
          {
            src: "/logo.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/logo.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          }
        ],
      },
      workbox: {
        offlineGoogleAnalytics: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            }
          },
          {
            // Cache API responses for robust offline/poor internet experience
            urlPattern: /^https?:\/\/(localhost:5050|your-backend-domain\.com)\/api\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 30, // 30 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            }
          },
          {
            // Cache socket endpoint for fallback (note: limited use)
            urlPattern: /^https?:\/\/(localhost:5050|your-backend-domain\.com)\/socket\.io.*$/i,
            handler: 'NetworkOnly', // No offline caching for sockets! fallback to default
          },
          {
            // Cache static assets
            urlPattern: /\.(?:js|css|html|png|svg|jpg|jpeg|json|woff2?)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            }
          }
        ],
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
      },
      devOptions: {
        enabled: true,
      },
    })

  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
