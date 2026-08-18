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
      // Regression ratchet: fail CI if coverage drops below these floors. Set
      // conservatively below current (which varies ~89-91% lines run-to-run,
      // and rises once the seo.ts/ResultCTA coverage PRs merge) so the gate is
      // stable, not flaky. Ratchet these up as coverage improves.
      //
      // `functions` is deliberately low: in this React codebase every inline
      // handler (onClick/onMouseEnter/…) counts as a "function", so raw function
      // coverage understates real coverage. The meaningful gate is lines/
      // statements/branches; raise `functions` only alongside real interaction
      // tests, never by adding hover-only tests to game the metric.
      thresholds: {
        statements: 85,
        branches: 78,
        functions: 65,
        lines: 85,
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
