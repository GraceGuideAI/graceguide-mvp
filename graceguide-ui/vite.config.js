import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/static/',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/landing.html'),
        app: resolve(__dirname, 'index.html'),
      }
    }
  }
});
