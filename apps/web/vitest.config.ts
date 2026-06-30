import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // `server-only` throws when evaluated outside an RSC bundle; stub it so
      // server modules (e.g. lib/content.ts) can be imported under vitest.
      'server-only': path.resolve(__dirname, 'test/stubs/server-only.ts'),
    },
  },
});
