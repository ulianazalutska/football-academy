import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  server: { open: true },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        childProtection: resolve(__dirname, 'child-protection.html'),
        terms: resolve(__dirname, 'terms.html'),
      },
    },
  },
});
