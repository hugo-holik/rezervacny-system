import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    allowedHosts: ['frontend'],
    hmr: {
      path: '/ws',
    },
  },
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src', import.meta.url)),
      '@componentes': fileURLToPath(new URL('./src/componentes', import.meta.url)),
    },
  },
});
