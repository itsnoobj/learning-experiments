import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      reportsDirectory: './coverage',
      include: ['modules/**', 'lib/**', 'shared/**', 'store/**'],
      exclude: [
        '**/__tests__/**',
        '**/*.test.*',
        '**/e2e/**',
        '**/*.d.ts',
        'app/layout.tsx',
        'app/theme-provider.tsx',
        'app/ServiceWorkerRegister.tsx',
        'modules/*/index.ts',
      ],
      // Regression ratchet: fail CI if coverage drops below these floors,
      // set just under current (statements/lines ~92%, branches ~82%,
      // functions ~69%). Gate meaning primarily on statements/lines/branches.
      //
      // `functions` is deliberately NOT 85: in this React codebase every inline
      // handler (onClick/onMouseEnter/…) counts as a "function", so raw function
      // coverage understates real coverage. Pushing it to 85 would mean either
      // excluding well-tested components or writing low-value hover tests. Raise
      // this only alongside genuine interaction tests.
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 67,
        lines: 90,
      },
    },
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
