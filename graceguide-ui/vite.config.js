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
  }
});
