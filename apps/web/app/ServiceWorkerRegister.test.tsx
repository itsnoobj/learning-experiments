import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ServiceWorkerRegister } from './ServiceWorkerRegister';

describe('ServiceWorkerRegister', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  const mockRegister = vi.fn(() => Promise.resolve({} as ServiceWorkerRegistration));

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: mockRegister },
      writable: true,
      configurable: true,
    });
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers the service worker at /sw.js', () => {
    render(<ServiceWorkerRegister />);
    expect(mockRegister).toHaveBeenCalledWith('/sw.js');
  });

  it('listens for error events', () => {
    render(<ServiceWorkerRegister />);
    expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('reloads once on ChunkLoadError', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
      configurable: true,
    });

    render(<ServiceWorkerRegister />);

    const errorHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'error'
    )?.[1] as (event: ErrorEvent) => void;

    errorHandler(new ErrorEvent('error', { message: 'ChunkLoadError: Loading chunk 177 failed.' }));

    expect(reloadMock).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem('hd-chunk-reload')).toBe('1');
  });

  it('does not reload twice (prevents infinite loop)', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
      configurable: true,
    });

    sessionStorage.setItem('hd-chunk-reload', '1');
    render(<ServiceWorkerRegister />);

    const errorHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'error'
    )?.[1] as (event: ErrorEvent) => void;

    errorHandler(new ErrorEvent('error', { message: 'ChunkLoadError: Loading chunk 177 failed.' }));

    expect(reloadMock).not.toHaveBeenCalled();
  });

  it('ignores non-chunk errors', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
      configurable: true,
    });

    render(<ServiceWorkerRegister />);

    const errorHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'error'
    )?.[1] as (event: ErrorEvent) => void;

    errorHandler(new ErrorEvent('error', { message: 'TypeError: undefined is not a function' }));

    expect(reloadMock).not.toHaveBeenCalled();
  });
});
