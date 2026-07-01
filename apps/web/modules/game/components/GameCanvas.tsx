'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Player } from '../lib/player';
import { Obstacle, spawnObstacle, nextSpacing } from '../lib/obstacle';
import { checkCollision } from '../lib/collision';
import { gameChapters, gameChapterIds } from '../lib/chapters';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameState } from '../hooks/useGameState';
import { useThemeStore } from '@/store/themeStore';
import { GameHUD } from './GameHUD';
import { HitInterstitial } from './HitInterstitial';
import { StartScreen } from './StartScreen';
import { ObstacleCleared } from './ObstacleCleared';

/**
 * Per-theme canvas palette. The DOM overlays (start screen, HUD, interstitial)
 * use CSS variables; the imperative canvas can't, so it reads from here based
 * on the live theme.
 */
const THEME_COLORS = {
  dark: {
    bg: '#0D0D0D',
    groundStroke: '#333333',
    hudText: '#E8E8E8',
    playerStroke: '#FFFFFF',
    obstacleStroke: '#FFFFFF',
    skyTop: 'rgba(0, 0, 0, 0.85)',
  },
  light: {
    bg: '#FAFAFA',
    groundStroke: '#DDDDDD',
    hudText: '#1A1A1A',
    playerStroke: '#1A1A1A',
    obstacleStroke: '#1A1A1A',
    skyTop: 'rgba(0, 0, 0, 0.04)',
  },
} as const;

const GROUND_FRACTION = 0.82; // ground line as a fraction of canvas height
const GRAVITY = 0.6; // px/frame^2 — tuned with jumpVelocity=-13 for reliable clears
const BASE_SPEED = 6; // px/frame at difficulty 0
const TARGET_FRAME_MS = 1000 / 60; // physics tuned for 60fps; delta-scaled below
const TILE = 32; // ground tile size in px (matches ground-tile.svg)
const CLOUD_PARALLAX = 0.25; // clouds drift at a fraction of the ground speed
const HILL_PARALLAX = 0.1; // distant hills drift slower than clouds (deep background)
const BIRD_PARALLAX = 0.15; // birds drift slowly across the top of the sky
const COMBO_CHANCE = 0.25; // probability a spawn becomes a tight 2-obstacle combo

/** SVG sprite sources, served from /public/assets/game. */
const ASSET_SOURCES = {
  ground: '/assets/game/ground-tile.svg',
  pipe: '/assets/game/pipe.svg',
  block: '/assets/game/block.svg',
  cloud: '/assets/game/cloud.svg',
  crate: '/assets/game/crate.svg',
  spike: '/assets/game/spike.svg',
} as const;

type AssetKey = keyof typeof ASSET_SOURCES;

/**
 * Background cloud field with three size tiers (small / medium / large). Base
 * positions live in a scrolling, wrapping field wider than the viewport so the
 * clouds recycle seamlessly. `scale` multiplies the cloud sprite's native size.
 */
const CLOUDS: { baseX: number; y: number; scale: number; size: 'small' | 'medium' | 'large' }[] = [
  { baseX: 120, y: 70, scale: 2.0, size: 'large' },
  { baseX: 360, y: 140, scale: 0.8, size: 'small' },
  { baseX: 560, y: 60, scale: 1.3, size: 'medium' },
  { baseX: 820, y: 120, scale: 0.7, size: 'small' },
  { baseX: 1040, y: 50, scale: 2.2, size: 'large' },
  { baseX: 1320, y: 110, scale: 1.2, size: 'medium' },
  { baseX: 1560, y: 80, scale: 0.75, size: 'small' },
];

/**
 * Distant hills/mountains drawn as low-opacity triangles in the deep
 * background. They scroll at {@link HILL_PARALLAX} (much slower than clouds and
 * the foreground) to sell depth. `baseX` is the peak x in a wrapping field;
 * `w`/`h` are the triangle's half-width and height in px.
 */
const HILLS: { baseX: number; w: number; h: number }[] = [
  { baseX: 80, w: 220, h: 180 },
  { baseX: 420, w: 300, h: 240 },
  { baseX: 820, w: 180, h: 150 },
  { baseX: 1140, w: 280, h: 210 },
  { baseX: 1520, w: 240, h: 190 },
];

/**
 * Birds rendered as simple "V" shapes drifting slowly across the top of the
 * sky. `baseX` lives in a wrapping field; `y` is the flight height; `s` is the
 * wingspan in px.
 */
const BIRDS: { baseX: number; y: number; s: number }[] = [
  { baseX: 200, y: 60, s: 14 },
  { baseX: 700, y: 100, s: 10 },
  { baseX: 1150, y: 45, s: 16 },
];

/** True once an image has finished decoding and is safe to draw. */
function isReady(img: HTMLImageElement | undefined): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0;
}

/**
 * Full-viewport canvas runner.
 *
 * Wires together the player physics, obstacle spawning/scrolling, collision
 * detection, and the React-driven overlays (start screen, HUD, hit
 * interstitial). The imperative game world lives in refs so the rAF loop can
 * mutate it every frame without triggering re-renders; only player-facing state
 * (phase, score, distance) flows through {@link useGameState}.
 */
export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const distanceRef = useRef(0);
  const spawnCountRef = useRef(Math.floor(Math.random() * gameChapterIds.length));
  const seenChaptersRef = useRef<Set<string>>(new Set());
  const nextSpawnAtRef = useRef(0); // distance threshold for the next spawn
  const groundYRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0 });
  const imagesRef = useRef<Partial<Record<AssetKey, HTMLImageElement>>>({});
  const [assetsReady, setAssetsReady] = useState(false);
  // True when the player returned via `/game?resume=1` after solving a chapter.
  // While set, the "Obstacle Cleared" celebration shows in place of the start
  // screen and the run begins only once it is dismissed.
  const [showCleared, setShowCleared] = useState(false);

  const game = useGameState();
  // Mirror the phase into a ref so the frame callback reads the live value.
  const phaseRef = useRef(game.phase);
  useEffect(() => {
    phaseRef.current = game.phase;
  }, [game.phase]);

  // Live theme. Mirrored into a ref so the imperative draw loop always reads
  // the current palette without being re-created on every theme change.
  const theme = useThemeStore((state) => state.theme);
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const [, forceTick] = useState(0);

  // Detect a resume entry (`/game?resume=1`) on the client. Reading from
  // `window.location` avoids the Suspense boundary that `useSearchParams`
  // would otherwise require here.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('resume') === '1') {
      setShowCleared(true);
    }
  }, []);

  /** Size the canvas to its container, accounting for devicePixelRatio. */
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const width = parent?.clientWidth ?? window.innerWidth;
    const height = parent?.clientHeight ?? window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    sizeRef.current = { width, height };
    groundYRef.current = height * GROUND_FRACTION;
    playerRef.current?.setGroundY(groundYRef.current);
  }, []);

  // Initialise canvas + handle resizes.
  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  // Preload all SVG sprites before the game becomes playable. We flip
  // `assetsReady` only once every image has resolved (errors count as resolved
  // so a single missing asset can't wedge the loading screen forever).
  useEffect(() => {
    const entries = Object.entries(ASSET_SOURCES) as [AssetKey, string][];
    const images: Partial<Record<AssetKey, HTMLImageElement>> = {};
    let settled = 0;
    let cancelled = false;

    const onSettle = () => {
      settled += 1;
      if (settled === entries.length && !cancelled) setAssetsReady(true);
    };

    for (const [key, src] of entries) {
      const img = new Image();
      img.onload = onSettle;
      img.onerror = onSettle;
      img.src = src;
      images[key] = img;
    }
    imagesRef.current = images;

    return () => {
      cancelled = true;
    };
  }, []);

  const initWorld = useCallback(() => {
    const groundY = groundYRef.current || sizeRef.current.height * GROUND_FRACTION;
    playerRef.current = new Player({ groundY });
    obstaclesRef.current = [];
    distanceRef.current = 0;
    // NOTE: spawnCountRef is NOT reset — it persists across runs so each
    // new run cycles to the next chapter instead of repeating the same one.
    // It's also randomised at mount so a fresh page load doesn't always start
    // with the same chapter.
    nextSpawnAtRef.current = nextSpacing(0);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const { width, height } = sizeRef.current;
    const groundY = groundYRef.current;
    const distance = distanceRef.current;
    const images = imagesRef.current;
    const colors = THEME_COLORS[themeRef.current];
    const isLight = themeRef.current === 'light';

    // Base background fill.
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle sky-depth shading at the very top, fading into the base bg.
    const sky = ctx.createLinearGradient(0, 0, 0, Math.max(1, height * 0.45));
    sky.addColorStop(0, colors.skyTop);
    sky.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height * 0.45);

    // Distant hills/mountains: low-opacity triangles in the deep background,
    // scrolling at HILL_PARALLAX (slower than clouds) to convey depth. Drawn
    // before the clouds so clouds float in front of the ridgeline.
    {
      ctx.save();
      ctx.fillStyle = isLight ? 'rgba(60, 60, 60, 0.08)' : 'rgba(255, 255, 255, 0.06)';
      for (const hill of HILLS) {
        const span = width + hill.w * 2;
        const peakX = ((((hill.baseX - distance * HILL_PARALLAX) % span) + span) % span) - hill.w;
        const baseY = groundY;
        ctx.beginPath();
        ctx.moveTo(peakX, baseY - hill.h); // peak
        ctx.lineTo(peakX + hill.w, baseY); // right foot
        ctx.lineTo(peakX - hill.w, baseY); // left foot
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Parallax clouds: drift slower than the foreground and wrap across a field
    // wider than the viewport so they recycle seamlessly. Three size tiers
    // (small/medium/large) via each cloud's `scale`. In light mode the white
    // cloud sprite is darkened (~#E0E0E0) and softened so it reads against the
    // pale sky instead of vanishing.
    const cloudImg = images.cloud;
    if (isReady(cloudImg)) {
      const baseW = cloudImg.naturalWidth || 64;
      const baseH = cloudImg.naturalHeight || 32;
      ctx.save();
      if (isLight) {
        ctx.globalAlpha = 0.3;
        ctx.filter = 'brightness(0.88)';
      }
      for (const cloud of CLOUDS) {
        const w = baseW * cloud.scale;
        const h = baseH * cloud.scale;
        const span = width + w * 2;
        const x = ((((cloud.baseX - distance * CLOUD_PARALLAX) % span) + span) % span) - w;
        ctx.drawImage(cloudImg, x, cloud.y, w, h);
      }
      ctx.restore();
    }

    // Birds: simple "V" shapes drifting slowly across the top of the sky. Drawn
    // after the clouds so they read as the nearest sky element. Each bird wraps
    // across a field wider than the viewport at BIRD_PARALLAX.
    {
      ctx.save();
      ctx.strokeStyle = isLight ? 'rgba(40, 40, 40, 0.45)' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      for (const bird of BIRDS) {
        const span = width + bird.s * 4;
        const x = ((((bird.baseX - distance * BIRD_PARALLAX) % span) + span) % span) - bird.s * 2;
        // A gentle vertical bob keyed off the wrapped x so wings "flap" subtly.
        const dip = Math.sin(x * 0.05) * 2;
        ctx.beginPath();
        ctx.moveTo(x - bird.s, bird.y);
        ctx.lineTo(x, bird.y + bird.s * 0.5 + dip);
        ctx.lineTo(x + bird.s, bird.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Repeating ground: a continuous strip of 32x32 tiles from the ground line
    // down to the bottom edge, scrolling left with the world.
    const groundImg = images.ground;
    if (isReady(groundImg)) {
      const offset = ((distance % TILE) + TILE) % TILE;
      for (let y = groundY; y < height; y += TILE) {
        for (let x = -offset; x < width; x += TILE) {
          ctx.drawImage(groundImg, x, y, TILE, TILE);
        }
      }
    } else {
      // Fallback ground line if the sprite is unavailable.
      ctx.strokeStyle = colors.groundStroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();
    }

    // Obstacles: each type renders from its own sprite when available
    // (pipe/block/crate/spike), sitting on top of the ground. `gap` has no
    // sprite and falls back to the canvas-drawn marker. The collision hitbox
    // (x/y/width/height) is unchanged. In light mode we trace a darker outline
    // around each sprite so the hazards stay legible against the pale
    // background — except spikes, whose triangular silhouette would be misread
    // as a box, so they keep their shaped fallback outline.
    const spriteByType: Partial<
      Record<(typeof obstaclesRef.current)[number]['type'], HTMLImageElement | undefined>
    > = {
      pipe: images.pipe,
      block: images.block,
      crate: images.crate,
      spike: images.spike,
    };
    for (const obstacle of obstaclesRef.current) {
      const sprite = spriteByType[obstacle.type];
      if (isReady(sprite)) {
        ctx.drawImage(sprite, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        if (isLight && obstacle.type !== 'spike') {
          ctx.save();
          ctx.strokeStyle = colors.obstacleStroke;
          ctx.lineWidth = 2;
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          ctx.restore();
        }
      } else {
        obstacle.draw(ctx, colors.obstacleStroke);
      }
    }

    // Player (brand stick figure) on top of everything.
    playerRef.current?.draw(ctx, distanceRef.current, colors.playerStroke);
  }, []);

  const onFrame = useCallback(
    (deltaMs: number) => {
      // Normalise to 60fps-equivalent steps so physics stay consistent.
      const step = Math.min(deltaMs / TARGET_FRAME_MS, 3);
      const player = playerRef.current;
      if (!player) return;

      if (phaseRef.current === 'running') {
        const difficulty = Math.min(1, distanceRef.current / 12000);
        const speed = (BASE_SPEED + difficulty * 5) * step;

        player.update(GRAVITY, step);
        distanceRef.current += speed;

        // Scroll + cull obstacles.
        for (const obstacle of obstaclesRef.current) {
          obstacle.update(speed);
        }
        const before = obstaclesRef.current.length;
        obstaclesRef.current = obstaclesRef.current.filter((o) => {
          if (o.isOffscreen()) return false;
          return true;
        });
        const cleared = before - obstaclesRef.current.length;
        if (cleared > 0) game.addScore(cleared);

        game.addDistance(speed);

        // Spawn when the world has scrolled far enough.
        if (distanceRef.current >= nextSpawnAtRef.current) {
          const obstacle = spawnObstacle(
            {
              groundY: groundYRef.current,
              spawnX: sizeRef.current.width + 40,
              difficulty,
            },
            gameChapterIds,
            spawnCountRef.current,
            seenChaptersRef.current,
          );
          spawnCountRef.current += 1;
          obstaclesRef.current.push(obstacle);

          // Occasionally spawn a tight second obstacle right behind the first
          // for a "combo" challenge: two hazards close enough that the player
          // must commit to a single, well-timed jump. After a combo we always
          // give a full-width gap before the next spawn so it stays fair.
          let comboSpawned = false;
          if (Math.random() < COMBO_CHANCE) {
            const tightGap = 60 + Math.random() * 30;
            const second = spawnObstacle(
              {
                groundY: groundYRef.current,
                spawnX: obstacle.x + obstacle.width + tightGap,
                difficulty,
              },
              gameChapterIds,
              spawnCountRef.current,
              seenChaptersRef.current,
            );
            spawnCountRef.current += 1;
            obstaclesRef.current.push(second);
            comboSpawned = true;
          }

          // Widen the gap after a combo so back-to-back combos never wall off
          // the player.
          nextSpawnAtRef.current =
            distanceRef.current + nextSpacing(difficulty) + (comboSpawned ? 160 : 0);
        }

        // Collision → hit phase.
        for (const obstacle of obstaclesRef.current) {
          if (checkCollision(player, obstacle)) {
            seenChaptersRef.current.add(obstacle.chapterId);
            game.hit(obstacle.chapterId);
            break;
          }
        }
      }

      draw();
    },
    [draw, game],
  );

  const loop = useGameLoop(onFrame);

  // Start/stop the rAF loop in lockstep with the phase.
  useEffect(() => {
    if (game.phase === 'running' && !loop.isRunning) {
      loop.start();
    } else if (game.phase !== 'running' && loop.isRunning) {
      loop.pause();
      draw(); // paint one final frame so overlays sit over the frozen world
    }
  }, [game.phase, loop, draw]);

  // Once assets are loaded and canvas is sized, initialise the world and draw
  // a single frame so the game scene (ground, clouds, hills, player) is visible
  // behind the transparent "TAP TO RUN" overlay.
  useEffect(() => {
    if (assetsReady && game.phase === 'idle' && !playerRef.current) {
      resize();
      initWorld();
      draw();
    }
  }, [assetsReady, game.phase, resize, initWorld, draw]);

  // Repaint when the theme changes so a frozen frame (idle/paused/hit) adopts
  // the new palette immediately rather than waiting for the next run.
  useEffect(() => {
    draw();
  }, [theme, draw]);

  const handleStart = useCallback(() => {
    resize();
    initWorld();
    game.start();
    forceTick((n) => n + 1);
  }, [game, initWorld, resize]);

  // Jump input: space / tap / click. Active only while running.
  // Also starts the game when idle.
  const handleJump = useCallback(() => {
    if (phaseRef.current === 'running') {
      playerRef.current?.jump();
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (phaseRef.current === 'idle') {
          handleStart();
        } else {
          handleJump();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleJump, handleStart]);

  const activeChapter =
    gameChapters.find((c) => c.id === game.hitChapterId) ??
    gameChapters[game.currentChapterIndex % gameChapters.length] ??
    gameChapters[0];

  // The chapter the player just solved before resuming — the one *before* the
  // current index. Clamped so a fresh resume (index 0) surfaces the first
  // chapter, which is what the result screen marks complete.
  const completedChapterIndex = Math.max(0, game.currentChapterIndex - 1);
  const completedChapter =
    gameChapters[completedChapterIndex % gameChapters.length] ?? gameChapters[0];

  // Dismiss the celebration and kick off the run.
  const handleClearedDone = useCallback(() => {
    setShowCleared(false);
    handleStart();
  }, [handleStart]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        background: 'var(--color-bg)',
        touchAction: 'manipulation',
      }}
      onPointerDown={handleJump}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {game.phase === 'running' && <GameHUD score={game.score} distance={game.distance} />}

      {game.phase === 'idle' && assetsReady && !showCleared && (
        <StartScreen onStart={handleStart} />
      )}

      {game.phase === 'idle' && assetsReady && showCleared && (
        <ObstacleCleared chapterTitle={completedChapter.title} onDone={handleClearedDone} />
      )}

      {game.phase === 'hit' && (
        <HitInterstitial
          title={activeChapter.title}
          situation={activeChapter.situation}
          chapterId={activeChapter.id}
        />
      )}
    </div>
  );
}
