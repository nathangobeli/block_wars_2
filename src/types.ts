export type StandardBlockType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';
export type SpecialBlockType = 'BOMB' | 'GIGANTO_BOMB' | 'DRILL' | 'GARBAGE_SENDER';
export type BlockType = StandardBlockType | SpecialBlockType;

export interface Cell {
  type: BlockType | 'GARBAGE';
  color: string;
  isSpecial?: boolean;
  specialType?: SpecialBlockType;
  glowing?: boolean;
}

export type Grid = (Cell | null)[][];

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  type: BlockType;
  shape: number[][];
  color: string;
  x: number;
  y: number;
  rotation: number; // 0: 0°, 1: 90°, 2: 180°, 3: 270°
  isSpecial?: boolean;
  specialName?: string;
}

export type GameMode = 'versus' | 'war' | 'score_attack' | 'survival' | 'wacky_chaos';
export type ViewMode = 'arena_split' | 'tabletop_duel';
export type MatchPlayerMode = 'p1_vs_p2' | 'p1_vs_ai' | 'ai_vs_ai';
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type AbilityType = 'aegis_shield' | 'board_push' | 'mirage_cloak' | 'plasma_push';

export interface AbilityInfo {
  id: AbilityType;
  name: string;
  cost: number; // War meter cost (e.g. 100)
  icon: string;
  description: string;
  color: string;
}

export type WackyEventType = 'control_reversal' | 'giganto_bomb' | 'quake' | 'blackout';

export interface ActiveWackyEvent {
  type: WackyEventType;
  turnsRemaining: number;
  title: string;
  description: string;
  icon: string;
}

export interface BlastEffect {
  id: string;
  centerX: number;
  centerY: number;
  radius: number; // 1 for 3x3, 3 for 6x6
  color: string;
  isGiganto?: boolean;
  timestamp: number;
}

export interface PlayerStats {
  score: number;
  linesCleared: number;
  quads: number;
  abilitiesUsed: number;
  highestCombo: number;
  piecesDropped: number;
  specialBlocksTriggered: number;
  actionsCount: number;
}

export interface PlayerState {
  id: 'p1' | 'p2';
  name: string;
  isAI: boolean;
  aiDifficulty: AIDifficulty;
  grid: Grid;
  activePiece: Piece | null;
  ghostY: number;
  isReady: boolean;
  score: number;
  lines: number;
  combo: number;
  warMeter: number; // 0 - 100
  pendingGarbage: number; // Lines waiting to appear
  shieldActive: boolean; // Aegis shield
  cloakedTurns: number; // Mirage cloak (invisible piece)
  invertedControlsTurns: number; // Wacky event
  blackoutTurns: number; // Wacky event
  stats: PlayerStats;
  dangerFlash: boolean;
  aiThinking: boolean;
  blastEffects?: BlastEffect[];
}

export interface GameState {
  mode: GameMode;
  viewMode: ViewMode;
  matchMode: MatchPlayerMode;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  winner: 'p1' | 'p2' | 'tie' | null;
  turnCount: number;
  scoreAttackLimit: number; // e.g. 25, 50, 100 pieces
  piecesPlacedCount: number;
  nextPiece: Piece | null;
  blitzTimerEnabled: boolean;
  blitzDuration: number; // 3, 5, 8, or 10 seconds
  blitzTimeRemaining: number; // ms
  activeWackyEvent: ActiveWackyEvent | null;
  clashBalance: number; // -100 to 100 (relative advantage)
  startTime: number;
  elapsedTime: number;
}

export interface FloatingCombatText {
  id: string;
  text: string;
  playerId: 'p1' | 'p2';
  x: number;
  y: number;
  color: string;
  fontSize?: number;
  duration?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type?: 'spark' | 'smoke' | 'ring' | 'beam';
}

export interface SoundSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  muted: boolean;
  musicEnabled: boolean;
}
