import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameAudio } from '../hooks/useGameAudio';

// Mock localStorage
const storage = new Map<string, string>();
const mockLocalStorage = {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
  clear: () => storage.clear(),
};

// Mock AudioContext
const mockGainNode = () => ({
  gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  connect: vi.fn().mockReturnThis(),
});

class MockAudioContext {
  state = 'running';
  currentTime = 0;
  sampleRate = 44100;
  destination = {};
  createGain = () => mockGainNode();
  createOscillator = () => ({
    type: '', frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    detune: { value: 0 }, connect: vi.fn().mockReturnThis(), start: vi.fn(), stop: vi.fn(), onended: null,
  });
  createBiquadFilter = () => ({ type: '', frequency: { value: 0 }, Q: { value: 0 }, connect: vi.fn().mockReturnThis() });
  createBufferSource = () => ({ buffer: null, connect: vi.fn().mockReturnThis(), start: vi.fn() });
  createBuffer = () => ({ getChannelData: () => new Float32Array(100) });
  resume = vi.fn();
  close = vi.fn();
}

beforeEach(() => {
  storage.clear();
  vi.stubGlobal('AudioContext', MockAudioContext);
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useGameAudio', () => {
  it('returns all expected methods and muted state', () => {
    const { result } = renderHook(() => useGameAudio());
    expect(result.current.playJump).toBeTypeOf('function');
    expect(result.current.playHit).toBeTypeOf('function');
    expect(result.current.playScore).toBeTypeOf('function');
    expect(result.current.playStart).toBeTypeOf('function');
    expect(result.current.stopAmbient).toBeTypeOf('function');
    expect(result.current.toggleMute).toBeTypeOf('function');
    expect(result.current.muted).toBe(false);
  });

  it('reads muted state from localStorage', () => {
    storage.set('fg-game-muted', '1');
    const { result } = renderHook(() => useGameAudio());
    expect(result.current.muted).toBe(true);
  });

  it('toggleMute flips the muted state and persists it', () => {
    const { result } = renderHook(() => useGameAudio());
    expect(result.current.muted).toBe(false);

    act(() => { result.current.toggleMute(); });
    expect(result.current.muted).toBe(true);
    expect(storage.get('fg-game-muted')).toBe('1');

    act(() => { result.current.toggleMute(); });
    expect(result.current.muted).toBe(false);
    expect(storage.get('fg-game-muted')).toBe('0');
  });

  it('all play methods are safe to call (no throws)', () => {
    const { result } = renderHook(() => useGameAudio());
    act(() => {
      result.current.playJump();
      result.current.playHit();
      result.current.playScore();
      result.current.playStart();
      result.current.stopAmbient();
    });
    // No error = pass
  });

  it('gracefully no-ops when AudioContext is unavailable', () => {
    vi.stubGlobal('AudioContext', undefined);
    const { result } = renderHook(() => useGameAudio());
    act(() => {
      result.current.playJump();
      result.current.playStart();
      result.current.playHit();
    });
    // No error = pass
  });
});
