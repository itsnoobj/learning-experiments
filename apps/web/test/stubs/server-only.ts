// Empty stub for the `server-only` package so server modules can be imported
// in the vitest (jsdom) environment. The real package throws when bundled
// outside a React Server Component; in tests we simply make it a no-op.
export {};
