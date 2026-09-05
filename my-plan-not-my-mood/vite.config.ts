import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { SPA_PUBLIC_BASE } from './src/lib/spaAssets';
import { localFolderImportPlugin } from './vite.localFolderImport';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || SPA_PUBLIC_BASE,
  plugins: [react(), localFolderImportPlugin()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'e2e', 'dist'],
  },
  server: {
    port: 3001,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        // Default: production API. For fully local email, run `bun run dev:api` and set
        // VITE_API_PROXY=http://127.0.0.1:8788 (see .dev.vars.example).
        target: process.env.VITE_API_PROXY || 'https://nonnegotiation.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
