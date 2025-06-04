import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/static/',
  server: {
    proxy: {
      '/qa': 'http://localhost:8000',
      '/subscribe': 'http://localhost:8000'
    }
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/landing.html'),
        app: resolve(__dirname, 'index.html'),
      }
    }
  }
});
