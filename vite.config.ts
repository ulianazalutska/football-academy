import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  server: { open: true },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        childProtection: resolve(import.meta.dirname, 'child-protection.html'),
        terms: resolve(import.meta.dirname, 'terms.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
});
