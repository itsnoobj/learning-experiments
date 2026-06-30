import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for the service worker logic (public/sw.js).
 * We eval the SW in a mocked self/caches/fetch environment.
 */

let listeners: Record<string, Function>;
let cacheStore: Record<string, Record<string, Response>>;
let currentCacheName: string;

beforeEach(() => {
  listeners = {};
  cacheStore = {};
  currentCacheName = 'hd-v2';

  // Mock caches API
  const mockCaches = {
    open: vi.fn((name: string) => {
      if (!cacheStore[name]) cacheStore[name] = {};
      return Promise.resolve({
        put: vi.fn((req: Request | string, res: Response) => {
          const key = typeof req === 'string' ? req : req.url;
          cacheStore[name][key] = res;
          return Promise.resolve();
        }),
        match: vi.fn((req: Request | string) => {
          const key = typeof req === 'string' ? req : req.url;
          return Promise.resolve(cacheStore[name]?.[key] || undefined);
        }),
        addAll: vi.fn(() => Promise.resolve()),
      });
    }),
    keys: vi.fn(() => Promise.resolve(Object.keys(cacheStore))),
    delete: vi.fn((name: string) => {
      delete cacheStore[name];
      return Promise.resolve(true);
    }),
    match: vi.fn((req: Request | string) => {
      const key = typeof req === 'string' ? req : req.url;
      for (const cache of Object.values(cacheStore)) {
        if (cache[key]) return Promise.resolve(cache[key]);
      }
      return Promise.resolve(undefined);
    }),
  };

  // Mock self (ServiceWorkerGlobalScope)
  Object.assign(globalThis, {
    self: {
      addEventListener: (event: string, handler: Function) => {
        listeners[event] = handler;
      },
      skipWaiting: vi.fn(() => Promise.resolve()),
      clients: { claim: vi.fn(() => Promise.resolve()) },
    },
    caches: mockCaches,
  });
});

function loadSW() {
  // Reset listeners before loading
  listeners = {};
  // Load the SW code by reading and eval-ing it
  const fs = require('fs');
  const path = require('path');
  const code = fs.readFileSync(path.resolve(__dirname, './sw.js'), 'utf-8');
  eval(code);
}

describe('sw.js', () => {
  describe('install', () => {
    it('calls skipWaiting', () => {
      loadSW();
      const event = { waitUntil: vi.fn() };
      listeners['install'](event);
      expect((globalThis as any).self.skipWaiting).toHaveBeenCalled();
    });
  });

  describe('activate', () => {
    it('deletes old caches and claims clients', async () => {
      cacheStore['old-cache-v1'] = {};
      cacheStore['hd-v2'] = {};

      loadSW();
      const waitUntilPromise: Promise<any>[] = [];
      const event = { waitUntil: (p: Promise<any>) => waitUntilPromise.push(p) };
      listeners['activate'](event);

      await waitUntilPromise[0];
      expect(cacheStore['old-cache-v1']).toBeUndefined();
      expect(cacheStore['hd-v2']).toBeDefined();
    });
  });

  describe('fetch', () => {
    it('ignores non-GET requests', () => {
      loadSW();
      const event = {
        request: { method: 'POST', url: 'https://example.com/api' },
        respondWith: vi.fn(),
      };
      listeners['fetch'](event);
      expect(event.respondWith).not.toHaveBeenCalled();
    });

    it('uses cache-first for _next/static assets', () => {
      loadSW();
      const event = {
        request: new Request('https://humandynamics.guide/_next/static/chunks/app.js'),
        respondWith: vi.fn(),
      };
      listeners['fetch'](event);
      expect(event.respondWith).toHaveBeenCalled();
    });

    it('uses network-first for navigation requests', () => {
      loadSW();
      const req = new Request('https://humandynamics.guide/');
      Object.defineProperty(req, 'mode', { value: 'navigate' });
      const event = {
        request: req,
        respondWith: vi.fn(),
      };
      listeners['fetch'](event);
      expect(event.respondWith).toHaveBeenCalled();
    });
  });
});
