import { defineConfig } from '@playwright/test';

/**
 * E2E config for the running dev server on http://localhost:3000.
 *
 * The bundled Playwright Chromium could not be downloaded in this environment,
 * so we drive the locally-installed Google Chrome via `channel: 'chrome'`.
 * The web server is assumed to already be running (webServer is left unset).
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    channel: 'chrome',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  // Server already running on :3000.
  webServer: undefined,
});
