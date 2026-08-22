import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon-192.png', 'icon-512.png', 'icon.svg'],
        injectRegister: 'auto',
        manifest: {
          id: '/',
          name: 'تقييماتي - سجل التقييمات المدرسية',
          short_name: 'تقييماتي',
          description: 'منصة التقييمات المدرسية الشاملة للمعلمين والطلاب',
          theme_color: '#0f2b5c',
          background_color: '#0f2b5c',
          display: 'standalone',
          display_override: ['standalone', 'window-controls-overlay'],
          start_url: '/',
          scope: '/',
          orientation: 'portrait-primary',
          lang: 'ar',
          dir: 'rtl',
          categories: ['education', 'productivity'],
          prefer_related_applications: false,
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          maximumFileSizeToCacheInBytes: 5000000
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
