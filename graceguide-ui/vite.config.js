import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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
  }
});
