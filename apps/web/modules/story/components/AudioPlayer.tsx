'use client';

import { useRef, useState } from 'react';

const wrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-md)',
  padding: 'var(--spacing-sm) var(--spacing-md)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  backgroundColor: 'var(--color-surface)',
};

const btnStyle: React.CSSProperties = {
  background: 'none',
  border: '2px solid var(--color-border)',
  borderRadius: '50%',
  cursor: 'pointer',
  color: 'var(--color-text)',
  width: '48px',
  height: '48px',
  flexShrink: 0,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'border-color 0.15s ease',
};

const PlayIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <polygon points="3,1 13,8 3,15" />
  </svg>
);

const PauseIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <rect x="2" y="1" width="4" height="14" />
    <rect x="10" y="1" width="4" height="14" />
  </svg>
);

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Compact narration player with play/pause, a seekable bar and time. */
export function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const label = playing ? 'Pause' : 'Play';

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else void audio.play();
    setPlaying(!playing);
  }

  function seek(event: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(event.target.value);
    setCurrent(audio.currentTime);
  }

  // Don't render if the audio file doesn't exist
  if (error) return null;

  return (
    <div style={wrapStyle}>
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        style={btnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-gold)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
      >
        {playing ? PauseIcon : PlayIcon}
      </button>
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={current}
        onChange={seek}
        aria-label="Seek"
        style={{ flex: 1, accentColor: 'var(--color-gold)' }}
      />
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
        {formatTime(current)} / {formatTime(duration)}
      </span>
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onEnded={() => setPlaying(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}
