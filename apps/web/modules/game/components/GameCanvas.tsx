'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Player } from '../lib/player';
import { Obstacle, spawnObstacle, nextSpacing } from '../lib/obstacle';
import { checkCollision } from '../lib/collision';
import { gameChapters, gameChapterIds } from '../lib/chapters';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameState } from '../hooks/useGameState';
import { GameHUD } from './GameHUD';
import { HitInterstitial } from './HitInterstitial';
import { StartScreen } from './StartScreen';

const BG = '#0D0D0D';
const GROUND_FRACTION = 0.82; // ground line as a fraction of canvas height
const GRAVITY = 0.8; // px/frame^2
const BASE_SPEED = 6; // px/frame at difficulty 0
const TARGET_FRAME_MS = 1000 / 60; // physics tuned for 60fps; delta-scaled below

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
  const spawnCountRef = useRef(0);
  const nextSpawnAtRef = useRef(0); // distance threshold for the next spawn
  const groundYRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0 });

  const game = useGameState();
  // Mirror the phase into a ref so the frame callback reads the live value.
  const phaseRef = useRef(game.phase);
  useEffect(() => {
    phaseRef.current = game.phase;
  }, [game.phase]);

  const [, forceTick] = useState(0);

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

  const initWorld = useCallback(() => {
    const groundY = groundYRef.current || sizeRef.current.height * GROUND_FRACTION;
    playerRef.current = new Player({ groundY });
    obstaclesRef.current = [];
    distanceRef.current = 0;
    spawnCountRef.current = 0;
    nextSpawnAtRef.current = nextSpacing(0);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const { width, height } = sizeRef.current;
    const groundY = groundYRef.current;

    // Background
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, width, height);

    // Ground line
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Obstacles
    for (const obstacle of obstaclesRef.current) {
      obstacle.draw(ctx);
    }

    // Player
    playerRef.current?.draw(ctx, distanceRef.current);
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

        player.update(GRAVITY * step * step);
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
          );
          spawnCountRef.current += 1;
          obstaclesRef.current.push(obstacle);
          nextSpawnAtRef.current = distanceRef.current + nextSpacing(difficulty);
        }

        // Collision → hit phase.
        for (const obstacle of obstaclesRef.current) {
          if (checkCollision(player, obstacle)) {
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

  const handleStart = useCallback(() => {
    resize();
    initWorld();
    game.start();
    forceTick((n) => n + 1);
  }, [game, initWorld, resize]);

  // Jump input: space / tap / click. Active only while running.
  const handleJump = useCallback(() => {
    if (phaseRef.current === 'running') {
      playerRef.current?.jump();
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleJump]);

  const activeChapter =
    gameChapters[game.currentChapterIndex % gameChapters.length] ?? gameChapters[0];

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        background: BG,
        touchAction: 'manipulation',
      }}
      onPointerDown={handleJump}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {game.phase === 'running' && <GameHUD score={game.score} distance={game.distance} />}

      {game.phase === 'idle' && <StartScreen onStart={handleStart} />}

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
