export { GameCanvas } from './components/GameCanvas';

export { HitInterstitial } from './components/HitInterstitial';
export type { HitInterstitialProps } from './components/HitInterstitial';

export { StartScreen } from './components/StartScreen';
export type { StartScreenProps } from './components/StartScreen';

export { GameHUD } from './components/GameHUD';
export type { GameHUDProps } from './components/GameHUD';

export { useGameLoop } from './hooks/useGameLoop';
export type { GameLoop, FrameCallback } from './hooks/useGameLoop';

export { useGameState } from './hooks/useGameState';
export type { GameState, GamePhase, GameStateSnapshot } from './hooks/useGameState';

export { Player } from './lib/player';
export { Obstacle, spawnObstacle, nextSpacing } from './lib/obstacle';
export type { ObstacleType, ObstacleData, SpawnConfig } from './lib/obstacle';
export { checkCollision } from './lib/collision';
export type { Rect } from './lib/collision';
export { gameChapters, gameChapterIds } from './lib/chapters';
export type { GameChapter } from './lib/chapters';
