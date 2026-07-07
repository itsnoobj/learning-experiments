'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Procedural game audio via Web Audio API — zero audio files.
 *
 * Sounds: ambient pad, jump whoosh, hit thud, score chime, start arpeggio.
 * Mute preference persisted in localStorage.
 */

const MUTE_KEY = 'fg-game-muted';

export interface GameAudio {
  playJump: () => void;
  playHit: () => void;
  playScore: () => void;
  playStart: () => void;
  stopAmbient: () => void;
  toggleMute: () => boolean;
  muted: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Play a short tone with frequency envelope and auto-stop. */
function tone(
  ctx: AudioContext,
  dest: AudioNode,
  opts: {
    type?: OscillatorType;
    freq: number;
    freqEnd?: number;
    vol?: number;
    attack?: number;
    decay: number;
    delay?: number;
  },
) {
  const { type = 'sine', freq, freqEnd, vol = 0.15, attack = 0, decay, delay = 0 } = opts;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + decay * 0.7);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + Math.max(attack, 0.005));
  gain.gain.exponentialRampToValueAtTime(0.001, t + decay);

  osc.connect(gain).connect(dest);
  osc.start(t);
  osc.stop(t + decay);
}

/** Play a short burst of filtered noise. */
function noiseBurst(ctx: AudioContext, dest: AudioNode, duration = 0.06, vol = 0.12, cutoff = 800) {
  const size = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / size);

  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  src.buffer = buffer;
  filter.type = 'lowpass';
  filter.frequency.value = cutoff;
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  src.connect(filter).connect(gain).connect(dest);
  src.start(ctx.currentTime);
}

/** Read mute preference safely. */
function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useGameAudio(): GameAudio {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const ambientRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode; lfo: ReturnType<typeof setInterval> } | null>(null);
  const [muted, setMuted] = useState(() => (typeof window === 'undefined' ? false : readMuted()));

  /** Lazily init AudioContext on first user gesture. Returns null in test/SSR. */
  const ensureCtx = useCallback((): { ctx: AudioContext; master: GainNode } | null => {
    if (typeof AudioContext === 'undefined') return null;
    if (!ctxRef.current) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return { ctx: ctxRef.current, master: masterRef.current! };
  }, [muted]);

  // Sync mute to gain + localStorage.
  useEffect(() => {
    if (masterRef.current) masterRef.current.gain.value = muted ? 0 : 1;
    try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch { /* noop */ }
  }, [muted]);

  // Cleanup on unmount.
  useEffect(() => () => {
    ambientRef.current?.osc1.stop();
    ambientRef.current?.osc2.stop();
    if (ambientRef.current?.lfo) clearInterval(ambientRef.current.lfo);
    ctxRef.current?.close();
  }, []);

  const playJump = useCallback(() => {
    const audio = ensureCtx();
    if (!audio) return;
    tone(audio.ctx, audio.master, { freq: 320, freqEnd: 680, decay: 0.12 });
  }, [ensureCtx]);

  const playHit = useCallback(() => {
    const audio = ensureCtx();
    if (!audio) return;
    tone(audio.ctx, audio.master, { freq: 120, freqEnd: 40, vol: 0.3, decay: 0.25 });
    noiseBurst(audio.ctx, audio.master);
  }, [ensureCtx]);

  const playScore = useCallback(() => {
    const audio = ensureCtx();
    if (!audio) return;
    // Two-note chime: C5, E5
    tone(audio.ctx, audio.master, { type: 'triangle', freq: 523.25, vol: 0.12, attack: 0.02, decay: 0.2 });
    tone(audio.ctx, audio.master, { type: 'triangle', freq: 659.25, vol: 0.12, attack: 0.02, decay: 0.2, delay: 0.07 });
  }, [ensureCtx]);

  const startAmbient = useCallback(() => {
    const audio = ensureCtx();
    if (!audio) return;
    const { ctx, master } = audio;

    // Kill existing
    if (ambientRef.current) {
      ambientRef.current.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      ambientRef.current.osc1.stop(ctx.currentTime + 0.4);
      ambientRef.current.osc2.stop(ctx.currentTime + 0.4);
      clearInterval(ambientRef.current.lfo);
      ambientRef.current = null;
    }

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.value = 110; // A2
    osc2.type = 'triangle';
    osc2.frequency.value = 165; // E3
    osc2.detune.value = 3;

    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 1;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.5);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain).connect(master);
    osc1.start();
    osc2.start();

    // Slow LFO on filter cutoff for movement
    const lfo = setInterval(() => {
      if (!ctxRef.current || ctxRef.current.state === 'closed') return;
      filter.frequency.value = 400 + Math.sin(ctxRef.current.currentTime * 0.4) * 150;
    }, 200);

    ambientRef.current = { osc1, osc2, gain, lfo };
    osc1.onended = () => clearInterval(lfo);
  }, [ensureCtx]);

  const stopAmbient = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !ambientRef.current) return;
    const { osc1, osc2, gain, lfo } = ambientRef.current;
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    osc1.stop(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 0.6);
    clearInterval(lfo);
    ambientRef.current = null;
  }, []);

  const playStart = useCallback(() => {
    const audio = ensureCtx();
    if (!audio) return;
    // Ascending arpeggio: A3, C#4, E4
    [220, 277.18, 329.63].forEach((freq, i) => {
      tone(audio.ctx, audio.master, { type: 'triangle', freq, vol: 0.1, attack: 0.02, decay: 0.15, delay: i * 0.06 });
    });
    startAmbient();
  }, [ensureCtx, startAmbient]);

  const toggleMute = useCallback((): boolean => {
    const next = !muted;
    setMuted(next);
    return next;
  }, [muted]);

  return { playJump, playHit, playScore, playStart, stopAmbient, toggleMute, muted };
}
