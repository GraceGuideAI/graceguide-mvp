import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/static/',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/landing.html'),
        app: resolve(__dirname, 'index.html'),
      }
    }
  },
  server: {
    proxy: {
      '/qa': 'http://localhost:8000',
      '/subscribe': 'http://localhost:8000',
      '/log_event': 'http://localhost:8000',
      '/metrics': 'http://localhost:8000',
      '/auth': 'http://localhost:8000'
    }
  }
});
