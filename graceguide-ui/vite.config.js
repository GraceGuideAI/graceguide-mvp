import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
    // Ensure service worker is copied to dist
    copyPublicDir: true
  },
  server: {
    proxy: {
      '/qa': 'http://localhost:8000',
      '/subscribe': 'http://localhost:8000',
      '/log_event': 'http://localhost:8000',
      '/metrics': 'http://localhost:8000',
      '/auth': 'http://localhost:8000',
      '/verse-of-the-day': 'http://localhost:8000'
    }
  },
  // PWA specific settings
  define: {
    'process.env.VITE_PWA': 'true'
  }
});
