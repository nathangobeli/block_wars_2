import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  PlayerState,
  GameMode,
  ViewMode,
  MatchPlayerMode,
  AIDifficulty,
  AbilityType,
  Piece,
  Grid,
  Cell,
  WackyEventType,
  ActiveWackyEvent,
} from '../types';
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  ABILITIES,
} from '../constants';
import { SharedBagGenerator, createPiece } from '../utils/bagGenerator';
import { checkCollision, calculateGhostY, attemptRotation } from '../utils/srsRotation';
import { computeBestMove } from '../utils/aiController';
import { soundEngine } from '../audio/SoundEngine';
import { FXTriggerMethods } from '../components/FXCanvas';

const createEmptyGrid = (): Grid =>
  Array.from({ length: GRID_HEIGHT }, () => new Array(GRID_WIDTH).fill(null));

const createInitialPlayerState = (
  id: 'p1' | 'p2',
  name: string,
  isAI: boolean = false,
  aiDifficulty: AIDifficulty = 'medium'
): PlayerState => ({
  id,
  name,
  isAI,
  aiDifficulty,
  grid: createEmptyGrid(),
  activePiece: null,
  ghostY: 0,
  isReady: false,
  score: 0,
  lines: 0,
  combo: 0,
  warMeter: 0,
  pendingGarbage: 0,
  shieldActive: false,
  cloakedTurns: 0,
  invertedControlsTurns: 0,
  blackoutTurns: 0,
  stats: {
    score: 0,
    linesCleared: 0,
    quads: 0,
    abilitiesUsed: 0,
    highestCombo: 0,
    piecesDropped: 0,
    specialBlocksTriggered: 0,
  },
  dangerFlash: false,
  aiThinking: false,
});

export function useGameEngine() {
  const bagGenRef = useRef<SharedBagGenerator>(new SharedBagGenerator());
  const fxTriggersRef = useRef<FXTriggerMethods | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    mode: 'versus',
    viewMode: 'tabletop_duel',
    matchMode: 'p1_vs_ai',
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    winner: null,
    turnCount: 0,
    scoreAttackLimit: 50,
    piecesPlacedCount: 0,
    nextPiece: null,
    blitzTimerEnabled: false,
    blitzDuration: 5,
    blitzTimeRemaining: 5000,
    activeWackyEvent: null,
    clashBalance: 0,
    startTime: 0,
    elapsedTime: 0,
  });

  const [p1, setP1] = useState<PlayerState>(createInitialPlayerState('p1', 'Player 1', false));
  const [p2, setP2] = useState<PlayerState>(createInitialPlayerState('p2', 'Cyber-AI', true, 'medium'));

  const [lastAttacker, setLastAttacker] = useState<'p1' | 'p2' | null>(null);

  const registerFXTriggers = useCallback((triggers: FXTriggerMethods) => {
    fxTriggersRef.current = triggers;
  }, []);

  // Check stack height danger (>75% height)
  const isPlayerInDanger = (grid: Grid): boolean => {
    for (let r = 0; r < 5; r++) {
      if (grid[r].some(cell => cell !== null)) {
        return true;
      }
    }
    return false;
  };

  // Start new match
  const startMatch = useCallback(
    (
      mode: GameMode,
      matchMode: MatchPlayerMode,
      aiDifficulty: AIDifficulty,
      viewMode: ViewMode,
      blitzEnabled: boolean,
      blitzDuration: number,
      scoreAttackLimit: number
    ) => {
      soundEngine.resume();
      bagGenRef.current.reset();

      const firstPiece = bagGenRef.current.getNextPiece();
      const upcomingPiece = bagGenRef.current.peekNextPiece();

      const isP1AI = matchMode === 'ai_vs_ai';
      const isP2AI = matchMode !== 'p1_vs_p2';

      const newP1 = createInitialPlayerState('p1', isP1AI ? 'AI Alpha' : 'Player 1', isP1AI, aiDifficulty);
      const newP2 = createInitialPlayerState('p2', isP2AI ? 'Cyber-AI' : 'Player 2', isP2AI, aiDifficulty);

      newP1.activePiece = { ...firstPiece };
      newP1.ghostY = calculateGhostY(newP1.grid, firstPiece);

      newP2.activePiece = { ...firstPiece };
      newP2.ghostY = calculateGhostY(newP2.grid, firstPiece);

      setP1(newP1);
      setP2(newP2);

      setGameState({
        mode,
        viewMode,
        matchMode,
        isPlaying: true,
        isPaused: false,
        isGameOver: false,
        winner: null,
        turnCount: 1,
        scoreAttackLimit,
        piecesPlacedCount: 0,
        nextPiece: upcomingPiece,
        blitzTimerEnabled: blitzEnabled,
        blitzDuration,
        blitzTimeRemaining: blitzDuration * 1000,
        activeWackyEvent: null,
        clashBalance: 0,
        startTime: Date.now(),
        elapsedTime: 0,
      });

      soundEngine.setDangerMode(false);
    },
    []
  );

  // Player movement handlers
  const movePiece = useCallback(
    (playerId: 'p1' | 'p2', dx: number) => {
      if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return;

      const updatePlayer = (player: PlayerState): PlayerState => {
        if (!player.activePiece || player.isReady) return player;

        // Inverted controls wacky glitch
        const effectiveDx = player.invertedControlsTurns > 0 ? -dx : dx;
        const targetX = player.activePiece.x + effectiveDx;

        if (!checkCollision(player.grid, player.activePiece.shape, targetX, player.activePiece.y)) {
          soundEngine.playMove();
          const newPiece = { ...player.activePiece, x: targetX };
          const ghostY = calculateGhostY(player.grid, newPiece);
          return { ...player, activePiece: newPiece, ghostY };
        }
        return player;
      };

      if (playerId === 'p1') setP1(updatePlayer);
      else setP2(updatePlayer);
    },
    [gameState.isPlaying, gameState.isPaused, gameState.isGameOver]
  );

  const rotatePiece = useCallback(
    (playerId: 'p1' | 'p2') => {
      if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return;

      const updatePlayer = (player: PlayerState): PlayerState => {
        if (!player.activePiece || player.isReady) return player;

        const { rotated, newPiece } = attemptRotation(player.grid, player.activePiece, 'CW');
        if (rotated) {
          soundEngine.playRotate();
          const ghostY = calculateGhostY(player.grid, newPiece);
          return { ...player, activePiece: newPiece, ghostY };
        }
        return player;
      };

      if (playerId === 'p1') setP1(updatePlayer);
      else setP2(updatePlayer);
    },
    [gameState.isPlaying, gameState.isPaused, gameState.isGameOver]
  );

  const softDrop = useCallback(
    (playerId: 'p1' | 'p2') => {
      if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return;

      const updatePlayer = (player: PlayerState): PlayerState => {
        if (!player.activePiece || player.isReady) return player;

        const nextY = player.activePiece.y + 1;
        if (!checkCollision(player.grid, player.activePiece.shape, player.activePiece.x, nextY)) {
          soundEngine.playMove();
          return {
            ...player,
            activePiece: { ...player.activePiece, y: nextY },
          };
        }
        return player;
      };

      if (playerId === 'p1') setP1(updatePlayer);
      else setP2(updatePlayer);
    },
    [gameState.isPlaying, gameState.isPaused, gameState.isGameOver]
  );

  const lockInPiece = useCallback(
    (playerId: 'p1' | 'p2') => {
      if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return;

      const updatePlayer = (player: PlayerState): PlayerState => {
        if (!player.activePiece || player.isReady) return player;

        const ghostY = calculateGhostY(player.grid, player.activePiece);
        const lockedPiece = { ...player.activePiece, y: ghostY };
        soundEngine.playDrop();
        soundEngine.playLock();

        return {
          ...player,
          activePiece: lockedPiece,
          isReady: true,
          stats: {
            ...player.stats,
            piecesDropped: player.stats.piecesDropped + 1,
          },
        };
      };

      if (playerId === 'p1') setP1(updatePlayer);
      else setP2(updatePlayer);
    },
    [gameState.isPlaying, gameState.isPaused, gameState.isGameOver]
  );

  // Activate War Ability
  const activateAbility = useCallback(
    (playerId: 'p1' | 'p2', ability: AbilityType) => {
      if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return;

      const targetPlayer = playerId === 'p1' ? p1 : p2;
      const abilityInfo = ABILITIES[ability];

      if (targetPlayer.warMeter < abilityInfo.cost) return;

      soundEngine.playAbility();
      if (fxTriggersRef.current) {
        fxTriggersRef.current.addFloatingText(
          `${abilityInfo.name.toUpperCase()}!`,
          playerId === 'p1' ? 180 : 620,
          200,
          abilityInfo.color
        );
        fxTriggersRef.current.triggerScreenShake(10);
      }

      if (ability === 'aegis_shield') {
        const updater = (p: PlayerState) => ({
          ...p,
          shieldActive: true,
          warMeter: p.warMeter - abilityInfo.cost,
          stats: { ...p.stats, abilitiesUsed: p.stats.abilitiesUsed + 1 },
        });
        if (playerId === 'p1') setP1(updater);
        else setP2(updater);
      } else if (ability === 'board_push') {
        // Gravity Inversion: Pushes stack down 3 rows
        const updater = (p: PlayerState) => {
          const newGrid: Grid = createEmptyGrid();
          // Shift rows down by 3
          for (let r = 0; r < GRID_HEIGHT - 3; r++) {
            newGrid[r + 3] = [...p.grid[r]];
          }
          return {
            ...p,
            grid: newGrid,
            warMeter: p.warMeter - abilityInfo.cost,
            stats: { ...p.stats, abilitiesUsed: p.stats.abilitiesUsed + 1 },
          };
        };
        if (playerId === 'p1') setP1(updater);
        else setP2(updater);
      } else if (ability === 'mirage_cloak') {
        // Cloaks opponent field
        const opponentUpdater = (p: PlayerState) => ({
          ...p,
          cloakedTurns: 1,
        });
        const userUpdater = (p: PlayerState) => ({
          ...p,
          warMeter: p.warMeter - abilityInfo.cost,
          stats: { ...p.stats, abilitiesUsed: p.stats.abilitiesUsed + 1 },
        });

        if (playerId === 'p1') {
          setP2(opponentUpdater);
          setP1(userUpdater);
        } else {
          setP1(opponentUpdater);
          setP2(userUpdater);
        }
      } else if (ability === 'plasma_push') {
        // Immediately fires 3 dense garbage rows into enemy field
        const opponentUpdater = (p: PlayerState) => {
          if (p.shieldActive) {
            soundEngine.playAbility();
            return { ...p, shieldActive: false };
          }
          return { ...p, pendingGarbage: p.pendingGarbage + 3 };
        };
        const userUpdater = (p: PlayerState) => ({
          ...p,
          warMeter: p.warMeter - abilityInfo.cost,
          stats: { ...p.stats, abilitiesUsed: p.stats.abilitiesUsed + 1 },
        });

        setLastAttacker(playerId);
        if (playerId === 'p1') {
          setP2(opponentUpdater);
          setP1(userUpdater);
        } else {
          setP1(opponentUpdater);
          setP2(userUpdater);
        }
      }
    },
    [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, p1, p2]
  );

  // Turn Resolution Engine: Triggered when BOTH players are ready
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isGameOver) return;
    if (!p1.isReady || !p2.isReady) return;

    // Both players locked in! Resolve simultaneously
    const resolveSynchronizedTurn = () => {
      let p1Grid = p1.grid.map(row => [...row]);
      let p2Grid = p2.grid.map(row => [...row]);

      let p1SpecialTriggers = 0;
      let p2SpecialTriggers = 0;

      // 1. Stamp Active Pieces into Grids
      const stampPiece = (grid: Grid, piece: Piece) => {
        const shape = piece.shape;
        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] !== 0) {
              const by = piece.y + r;
              const bx = piece.x + c;
              if (by >= 0 && by < GRID_HEIGHT && bx >= 0 && bx < GRID_WIDTH) {
                grid[by][bx] = {
                  type: piece.type,
                  color: piece.color,
                  isSpecial: piece.isSpecial,
                };
              }
            }
          }
        }
      };

      if (p1.activePiece) stampPiece(p1Grid, p1.activePiece);
      if (p2.activePiece) stampPiece(p2Grid, p2.activePiece);

      // 2. Special Block Trigger Resolution
      const resolveSpecialBlock = (
        grid: Grid,
        piece: Piece | null,
        isP1: boolean
      ): { grid: Grid; bonusGarbage: number } => {
        let bonusGarbage = 0;
        if (!piece || !piece.isSpecial) return { grid, bonusGarbage };

        const centerX = piece.x + Math.floor(piece.shape[0].length / 2);
        const centerY = piece.y + Math.floor(piece.shape.length / 2);
        const screenX = isP1 ? 180 : 620;
        const screenY = centerY * 24 + 100;

        if (piece.type === 'BOMB') {
          // 3x3 blast radius
          soundEngine.playExplosion(false);
          if (fxTriggersRef.current) {
            fxTriggersRef.current.addExplosion(screenX, screenY, false);
            fxTriggersRef.current.addFloatingText('3x3 BLAST!', screenX, screenY - 20, '#ff4400');
          }
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const by = centerY + dy;
              const bx = centerX + dx;
              if (by >= 0 && by < GRID_HEIGHT && bx >= 0 && bx < GRID_WIDTH) {
                grid[by][bx] = null;
              }
            }
          }
          if (isP1) p1SpecialTriggers++;
          else p2SpecialTriggers++;
        } else if (piece.type === 'GIGANTO_BOMB') {
          // 6x6 cataclysmic explosion
          soundEngine.playExplosion(true);
          if (fxTriggersRef.current) {
            fxTriggersRef.current.addExplosion(screenX, screenY, true);
            fxTriggersRef.current.addFloatingText('6x6 GIGANTO BLAST!', screenX, screenY - 20, '#ff00aa');
          }
          for (let dy = -3; dy <= 3; dy++) {
            for (let dx = -3; dx <= 3; dx++) {
              const by = centerY + dy;
              const bx = centerX + dx;
              if (by >= 0 && by < GRID_HEIGHT && bx >= 0 && bx < GRID_WIDTH) {
                grid[by][bx] = null;
              }
            }
          }
          if (isP1) p1SpecialTriggers++;
          else p2SpecialTriggers++;
        } else if (piece.type === 'DRILL') {
          // Pierce entire column
          soundEngine.playDrill();
          if (fxTriggersRef.current) {
            fxTriggersRef.current.addDrillBeam(screenX, 500);
            fxTriggersRef.current.addFloatingText('COLUMN PIERCED!', screenX, screenY - 20, '#00f3ff');
          }
          for (let r = 0; r < GRID_HEIGHT; r++) {
            if (centerX >= 0 && centerX < GRID_WIDTH) {
              grid[r][centerX] = null;
            }
          }
          if (isP1) p1SpecialTriggers++;
          else p2SpecialTriggers++;
        } else if (piece.type === 'GARBAGE_SENDER') {
          bonusGarbage = 2;
          if (fxTriggersRef.current) {
            fxTriggersRef.current.addFloatingText('+2 GARBAGE ACTIVE!', screenX, screenY - 20, '#39ff14');
          }
          if (isP1) p1SpecialTriggers++;
          else p2SpecialTriggers++;
        }

        return { grid, bonusGarbage };
      };

      const p1Special = resolveSpecialBlock(p1Grid, p1.activePiece, true);
      p1Grid = p1Special.grid;

      const p2Special = resolveSpecialBlock(p2Grid, p2.activePiece, false);
      p2Grid = p2Special.grid;

      // 3. Line Clear Evaluation
      const evaluateLines = (
        grid: Grid,
        isP1: boolean
      ): { newGrid: Grid; linesCleared: number; clearedIndices: number[] } => {
        const clearedIndices: number[] = [];
        const survivingRows: (Cell | null)[][] = [];

        for (let r = 0; r < GRID_HEIGHT; r++) {
          if (grid[r].every(cell => cell !== null)) {
            clearedIndices.push(r);
          } else {
            survivingRows.push(grid[r]);
          }
        }

        const linesCleared = clearedIndices.length;
        const newRowsNeeded = GRID_HEIGHT - survivingRows.length;
        const emptyRows = Array.from({ length: newRowsNeeded }, () => new Array(GRID_WIDTH).fill(null));
        const newGrid = [...emptyRows, ...survivingRows];

        return { newGrid, linesCleared, clearedIndices };
      };

      const p1Eval = evaluateLines(p1Grid, true);
      p1Grid = p1Eval.newGrid;

      const p2Eval = evaluateLines(p2Grid, false);
      p2Grid = p2Eval.newGrid;

      // Line clear particle & sound feedback
      if (p1Eval.linesCleared > 0) {
        soundEngine.playLineClear(p1Eval.linesCleared);
        if (fxTriggersRef.current) {
          fxTriggersRef.current.addSparks(180, 300, '#00f3ff', p1Eval.linesCleared * 20);
          if (p1Eval.linesCleared >= 4) {
            fxTriggersRef.current.addFloatingText('SYNCHRO-QUAD!', 180, 260, '#00f3ff');
          }
        }
      }
      if (p2Eval.linesCleared > 0) {
        soundEngine.playLineClear(p2Eval.linesCleared);
        if (fxTriggersRef.current) {
          fxTriggersRef.current.addSparks(620, 300, '#ff007f', p2Eval.linesCleared * 20);
          if (p2Eval.linesCleared >= 4) {
            fxTriggersRef.current.addFloatingText('SYNCHRO-QUAD!', 620, 260, '#ff007f');
          }
        }
      }

      // 4. Calculate Garbage Sent
      const calculateGarbage = (lines: number, combo: number, bonusGarbage: number): number => {
        if (lines === 0) return 0;
        let garbage = lines === 2 ? 1 : lines === 3 ? 2 : lines >= 4 ? 4 : 0;
        if (combo >= 2) garbage += 1;
        if (combo >= 4) garbage += 1;
        if (lines > 0) garbage += bonusGarbage;
        return garbage;
      };

      const p1Combo = p1Eval.linesCleared > 0 ? p1.combo + 1 : 0;
      const p2Combo = p2Eval.linesCleared > 0 ? p2.combo + 1 : 0;

      const p1GarbageSent = calculateGarbage(p1Eval.linesCleared, p1Combo, p1Special.bonusGarbage);
      const p2GarbageSent = calculateGarbage(p2Eval.linesCleared, p2Combo, p2Special.bonusGarbage);

      if (p1GarbageSent > 0) setLastAttacker('p1');
      if (p2GarbageSent > 0) setLastAttacker('p2');

      // Garbage Canceling & Assignment
      let p1Incoming = p1.pendingGarbage;
      let p2Incoming = p2.pendingGarbage;

      // P1 counters p1Incoming first with p1GarbageSent
      let p1NetSent = p1GarbageSent;
      if (p1Incoming > 0) {
        const cancelled = Math.min(p1Incoming, p1NetSent);
        p1Incoming -= cancelled;
        p1NetSent -= cancelled;
      }

      // P2 counters p2Incoming first with p2GarbageSent
      let p2NetSent = p2GarbageSent;
      if (p2Incoming > 0) {
        const cancelled = Math.min(p2Incoming, p2NetSent);
        p2Incoming -= cancelled;
        p2NetSent -= cancelled;
      }

      // Route remaining attacks
      if (p1NetSent > 0) {
        if (p2.shieldActive) {
          soundEngine.playAbility();
          if (fxTriggersRef.current) {
            fxTriggersRef.current.addFloatingText('SHIELDED!', 620, 240, '#00f3ff');
          }
          // Shield absorbed attack
        } else {
          p2Incoming += p1NetSent;
          soundEngine.playGarbageAlert();
        }
      }

      if (p2NetSent > 0) {
        if (p1.shieldActive) {
          soundEngine.playAbility();
          if (fxTriggersRef.current) {
            fxTriggersRef.current.addFloatingText('SHIELDED!', 180, 240, '#00f3ff');
          }
        } else {
          p1Incoming += p2NetSent;
          soundEngine.playGarbageAlert();
        }
      }

      // 5. Apply Rising Pending Garbage into Grids
      const applyGarbage = (grid: Grid, count: number): Grid => {
        if (count <= 0) return grid;
        const newGrid = grid.slice(count); // remove top rows
        for (let i = 0; i < count; i++) {
          const gap = Math.floor(Math.random() * GRID_WIDTH);
          const garbageRow: (Cell | null)[] = Array.from({ length: GRID_WIDTH }, (_, c) =>
            c === gap ? null : { type: 'GARBAGE', color: '#475569' }
          );
          newGrid.push(garbageRow);
        }
        return newGrid;
      };

      // In versus/war, pending garbage arrives after turn resolves
      const p1GarbageToApply = p1.pendingGarbage;
      const p2GarbageToApply = p2.pendingGarbage;

      p1Grid = applyGarbage(p1Grid, p1GarbageToApply);
      p2Grid = applyGarbage(p2Grid, p2GarbageToApply);

      // Score additions
      const calcScore = (lines: number, combo: number) => {
        const base = lines === 1 ? 100 : lines === 2 ? 300 : lines === 3 ? 500 : lines >= 4 ? 1000 : 0;
        return base * Math.max(1, combo);
      };

      const p1ScoreAdd = calcScore(p1Eval.linesCleared, p1Combo);
      const p2ScoreAdd = calcScore(p2Eval.linesCleared, p2Combo);

      // War meter increment
      const p1WarAdd = p1Eval.linesCleared * 15 + (p1Eval.linesCleared >= 4 ? 15 : 0);
      const p2WarAdd = p2Eval.linesCleared * 15 + (p2Eval.linesCleared >= 4 ? 15 : 0);

      // 6. Next Piece Setup
      const nextSynchroPiece = bagGenRef.current.getNextPiece();
      const peekAhead = bagGenRef.current.peekNextPiece();

      // Check Danger zone
      const p1Danger = isPlayerInDanger(p1Grid);
      const p2Danger = isPlayerInDanger(p2Grid);
      soundEngine.setDangerMode(p1Danger || p2Danger);

      // 7. Check Top-Out Game Over
      const p1ToppedOut = checkCollision(p1Grid, nextSynchroPiece.shape, nextSynchroPiece.x, nextSynchroPiece.y);
      const p2ToppedOut = checkCollision(p2Grid, nextSynchroPiece.shape, nextSynchroPiece.x, nextSynchroPiece.y);

      let winner: 'p1' | 'p2' | 'tie' | null = null;
      let isGameOver = false;

      if (p1ToppedOut && p2ToppedOut) {
        winner = 'tie';
        isGameOver = true;
      } else if (p1ToppedOut) {
        winner = 'p2';
        isGameOver = true;
      } else if (p2ToppedOut) {
        winner = 'p1';
        isGameOver = true;
      }

      // Score Attack quota check
      const newPiecesPlaced = gameState.piecesPlacedCount + 1;
      if (gameState.mode === 'score_attack' && newPiecesPlaced >= gameState.scoreAttackLimit) {
        isGameOver = true;
        const finalP1Score = p1.score + p1ScoreAdd;
        const finalP2Score = p2.score + p2ScoreAdd;
        winner = finalP1Score > finalP2Score ? 'p1' : finalP2Score > finalP1Score ? 'p2' : 'tie';
      }

      // Wacky Chaos Glitch Trigger every 5 turns
      let nextWackyEvent: ActiveWackyEvent | null = gameState.activeWackyEvent;
      if (gameState.mode === 'wacky_chaos' && gameState.turnCount % 5 === 0 && !isGameOver) {
        const glitchTypes: WackyEventType[] = ['control_reversal', 'giganto_bomb', 'quake', 'blackout'];
        const chosenGlitch = glitchTypes[Math.floor(Math.random() * glitchTypes.length)];
        soundEngine.playGlitch();

        if (chosenGlitch === 'control_reversal') {
          nextWackyEvent = {
            type: 'control_reversal',
            turnsRemaining: 3,
            title: 'Control Reversal',
            description: 'Steering controls inverted for 3 turns!',
            icon: 'AlertTriangle',
          };
          if (fxTriggersRef.current) {
            fxTriggersRef.current.addFloatingText('GLITCH: CONTROLS INVERTED!', 400, 200, '#ff00aa');
          }
        } else if (chosenGlitch === 'giganto_bomb') {
          // Force next piece to be a Giganto-Bomb
          nextSynchroPiece.type = 'GIGANTO_BOMB';
          nextSynchroPiece.shape = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
          ];
          nextSynchroPiece.color = '#ff00aa';
          nextSynchroPiece.isSpecial = true;
          nextSynchroPiece.specialName = 'Giganto-Bomb';
          nextWackyEvent = {
            type: 'giganto_bomb',
            turnsRemaining: 1,
            title: 'Giganto-Bomb Incoming',
            description: 'Cataclysmic 6x6 nuclear bomb loaded!',
            icon: 'Flame',
          };
          if (fxTriggersRef.current) {
            fxTriggersRef.current.addFloatingText('GLITCH: GIGANTO-BOMB INJECTED!', 400, 200, '#ff00aa');
          }
        } else if (chosenGlitch === 'quake') {
          // Shatters random blocks
          if (fxTriggersRef.current) {
            fxTriggersRef.current.triggerScreenShake(20);
            fxTriggersRef.current.addFloatingText('GLITCH: FIELD QUAKE!', 400, 200, '#ffaa00');
          }
          for (let r = 5; r < GRID_HEIGHT; r++) {
            for (let c = 0; c < GRID_WIDTH; c++) {
              if (Math.random() < 0.25) {
                p1Grid[r][c] = null;
                p2Grid[r][c] = null;
              }
            }
          }
        } else if (chosenGlitch === 'blackout') {
          nextWackyEvent = {
            type: 'blackout',
            turnsRemaining: 3,
            title: 'Sensory Blackout',
            description: 'Visual sensors jammed for 3 turns!',
            icon: 'EyeOff',
          };
          if (fxTriggersRef.current) {
            fxTriggersRef.current.addFloatingText('GLITCH: SENSORY BLACKOUT!', 400, 200, '#bc13fe');
          }
        }
      } else if (nextWackyEvent) {
        nextWackyEvent = {
          ...nextWackyEvent,
          turnsRemaining: nextWackyEvent.turnsRemaining - 1,
        };
        if (nextWackyEvent.turnsRemaining <= 0) {
          nextWackyEvent = null;
        }
      }

      // Update Player 1
      setP1(prev => ({
        ...prev,
        grid: p1Grid,
        activePiece: isGameOver ? null : { ...nextSynchroPiece },
        ghostY: isGameOver ? 0 : calculateGhostY(p1Grid, nextSynchroPiece),
        isReady: false,
        score: prev.score + p1ScoreAdd,
        lines: prev.lines + p1Eval.linesCleared,
        combo: p1Combo,
        warMeter: Math.min(100, prev.warMeter + p1WarAdd),
        pendingGarbage: p1Incoming,
        shieldActive: prev.shieldActive && p2NetSent === 0,
        cloakedTurns: Math.max(0, prev.cloakedTurns - 1),
        invertedControlsTurns: nextWackyEvent?.type === 'control_reversal' ? 3 : Math.max(0, prev.invertedControlsTurns - 1),
        blackoutTurns: nextWackyEvent?.type === 'blackout' ? 3 : Math.max(0, prev.blackoutTurns - 1),
        dangerFlash: p1Danger,
        aiThinking: false,
        stats: {
          ...prev.stats,
          score: prev.score + p1ScoreAdd,
          linesCleared: prev.stats.linesCleared + p1Eval.linesCleared,
          quads: prev.stats.quads + (p1Eval.linesCleared >= 4 ? 1 : 0),
          highestCombo: Math.max(prev.stats.highestCombo, p1Combo),
          specialBlocksTriggered: prev.stats.specialBlocksTriggered + p1SpecialTriggers,
        },
      }));

      // Update Player 2
      setP2(prev => ({
        ...prev,
        grid: p2Grid,
        activePiece: isGameOver ? null : { ...nextSynchroPiece },
        ghostY: isGameOver ? 0 : calculateGhostY(p2Grid, nextSynchroPiece),
        isReady: false,
        score: prev.score + p2ScoreAdd,
        lines: prev.lines + p2Eval.linesCleared,
        combo: p2Combo,
        warMeter: Math.min(100, prev.warMeter + p2WarAdd),
        pendingGarbage: p2Incoming,
        shieldActive: prev.shieldActive && p1NetSent === 0,
        cloakedTurns: Math.max(0, prev.cloakedTurns - 1),
        invertedControlsTurns: nextWackyEvent?.type === 'control_reversal' ? 3 : Math.max(0, prev.invertedControlsTurns - 1),
        blackoutTurns: nextWackyEvent?.type === 'blackout' ? 3 : Math.max(0, prev.blackoutTurns - 1),
        dangerFlash: p2Danger,
        aiThinking: false,
        stats: {
          ...prev.stats,
          score: prev.score + p2ScoreAdd,
          linesCleared: prev.stats.linesCleared + p2Eval.linesCleared,
          quads: prev.stats.quads + (p2Eval.linesCleared >= 4 ? 1 : 0),
          highestCombo: Math.max(prev.stats.highestCombo, p2Combo),
          specialBlocksTriggered: prev.stats.specialBlocksTriggered + p2SpecialTriggers,
        },
      }));

      // Calculate clash balance shift
      const scoreDiff = (p1.score + p1ScoreAdd) - (p2.score + p2ScoreAdd);
      const clashShift = Math.max(-100, Math.min(100, scoreDiff / 40));

      setGameState(prev => ({
        ...prev,
        turnCount: prev.turnCount + 1,
        piecesPlacedCount: newPiecesPlaced,
        nextPiece: peekAhead,
        blitzTimeRemaining: prev.blitzDuration * 1000,
        activeWackyEvent: nextWackyEvent,
        clashBalance: clashShift,
        isGameOver,
        winner,
      }));
    };

    resolveSynchronizedTurn();
  }, [p1.isReady, p2.isReady, gameState.isPlaying, gameState.isGameOver]);

  // AI Maneuver Simulator
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return;

    const runAI = (player: PlayerState, setPlayer: React.Dispatch<React.SetStateAction<PlayerState>>) => {
      if (!player.isAI || player.isReady || !player.activePiece || player.aiThinking) return;

      // Mark thinking
      setPlayer(p => ({ ...p, aiThinking: true }));

      // Evaluate best move
      const best = computeBestMove(player.grid, player.activePiece, player.aiDifficulty);

      // Emulate human latency
      const timer = setTimeout(() => {
        setPlayer(p => {
          if (!p.activePiece || p.isReady) return p;

          // Apply rotation
          let piece = { ...p.activePiece };
          for (let r = 0; r < best.rotation; r++) {
            const rot = attemptRotation(p.grid, piece, 'CW');
            if (rot.rotated) piece = rot.newPiece;
          }

          // Apply X translation
          if (!checkCollision(p.grid, piece.shape, best.x, piece.y)) {
            piece.x = best.x;
          }

          // Smart Ability Deployment for AI
          if (p.warMeter >= 100 && gameState.mode === 'war') {
            if (p.pendingGarbage > 2) {
              activateAbility(p.id, 'aegis_shield');
            } else if (Math.random() < 0.5) {
              activateAbility(p.id, 'plasma_push');
            }
          }

          // Drop & Lock In
          const ghostY = calculateGhostY(p.grid, piece);
          soundEngine.playDrop();
          soundEngine.playLock();

          return {
            ...p,
            activePiece: { ...piece, y: ghostY },
            isReady: true,
            aiThinking: false,
            stats: {
              ...p.stats,
              piecesDropped: p.stats.piecesDropped + 1,
            },
          };
        });
      }, best.dropDelayMs);

      return () => clearTimeout(timer);
    };

    if (p1.isAI && !p1.isReady) {
      runAI(p1, setP1);
    }
    if (p2.isAI && !p2.isReady) {
      runAI(p2, setP2);
    }
  }, [
    p1.isAI,
    p1.isReady,
    p1.activePiece,
    p1.aiThinking,
    p2.isAI,
    p2.isReady,
    p2.activePiece,
    p2.aiThinking,
    gameState.isPlaying,
    gameState.isPaused,
    gameState.isGameOver,
    gameState.mode,
    activateAbility,
  ]);

  // Blitz Timer Interval (Tick every 100ms)
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver || !gameState.blitzTimerEnabled) {
      return;
    }

    const interval = setInterval(() => {
      setGameState(prev => {
        const nextTime = prev.blitzTimeRemaining - 100;
        if (nextTime <= 0) {
          // Timer expired! Auto-drop any unready player
          if (!p1.isReady) lockInPiece('p1');
          if (!p2.isReady) lockInPiece('p2');
          return { ...prev, blitzTimeRemaining: prev.blitzDuration * 1000 };
        }
        return { ...prev, blitzTimeRemaining: nextTime };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [
    gameState.isPlaying,
    gameState.isPaused,
    gameState.isGameOver,
    gameState.blitzTimerEnabled,
    p1.isReady,
    p2.isReady,
    lockInPiece,
  ]);

  // Match Duration Timer (1 second interval)
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return;

    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        elapsedTime: Math.floor((Date.now() - prev.startTime) / 1000),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver]);

  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  return {
    gameState,
    p1,
    p2,
    lastAttacker,
    registerFXTriggers,
    startMatch,
    movePiece,
    rotatePiece,
    softDrop,
    lockInPiece,
    activateAbility,
    togglePause,
    setGameState,
  };
}
