import { Grid, Piece, AIDifficulty } from '../types';
import { GRID_WIDTH, GRID_HEIGHT } from '../constants';
import { checkCollision, rotateMatrixCW } from './srsRotation';

interface MoveEvaluation {
  rotation: number;
  shape: number[][];
  x: number;
  y: number;
  score: number;
}

// Column height helper
function getColumnHeights(grid: Grid): number[] {
  const heights = new Array(GRID_WIDTH).fill(0);
  for (let c = 0; c < GRID_WIDTH; c++) {
    for (let r = 0; r < GRID_HEIGHT; r++) {
      if (grid[r][c] !== null) {
        heights[c] = GRID_HEIGHT - r;
        break;
      }
    }
  }
  return heights;
}

// Holes count helper
function getHoleCount(grid: Grid): number {
  let holes = 0;
  for (let c = 0; c < GRID_WIDTH; c++) {
    let blockFound = false;
    for (let r = 0; r < GRID_HEIGHT; r++) {
      if (grid[r][c] !== null) {
        blockFound = true;
      } else if (blockFound) {
        holes++;
      }
    }
  }
  return holes;
}

// Bumpiness helper
function getBumpiness(heights: number[]): number {
  let bumpiness = 0;
  for (let i = 0; i < heights.length - 1; i++) {
    bumpiness += Math.abs(heights[i] - heights[i + 1]);
  }
  return bumpiness;
}

// Simulate placing piece on grid and count cleared lines
function simulatePlacement(grid: Grid, shape: number[][], x: number, y: number): { grid: Grid; linesCleared: number } {
  const simGrid: Grid = grid.map(row => [...row]);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const by = y + r;
        const bx = x + c;
        if (by >= 0 && by < GRID_HEIGHT && bx >= 0 && bx < GRID_WIDTH) {
          simGrid[by][bx] = { type: 'I', color: '#fff' };
        }
      }
    }
  }

  let linesCleared = 0;
  for (let r = 0; r < GRID_HEIGHT; r++) {
    if (simGrid[r].every(cell => cell !== null)) {
      linesCleared++;
    }
  }

  return { grid: simGrid, linesCleared };
}

export function computeBestMove(
  grid: Grid,
  piece: Piece,
  difficulty: AIDifficulty
): { x: number; rotation: number; dropDelayMs: number } {
  const possibleMoves: MoveEvaluation[] = [];

  // Weights
  const weights = {
    easy: { height: -0.25, lines: 1.2, holes: -0.6, bumpiness: -0.08 },
    medium: { height: -0.55, lines: 7.5, holes: -3.8, bumpiness: -0.28 },
    hard: { height: -0.65, lines: 9.2, holes: -5.5, bumpiness: -0.35 },
  }[difficulty];

  // Test rotations (0, 1, 2, 3)
  let curShape = piece.shape;
  for (let rot = 0; rot < 4; rot++) {
    const shapeWidth = curShape[0].length;

    // Test each horizontal column
    for (let x = -2; x <= GRID_WIDTH; x++) {
      // Find drop Y
      let y = 0;
      if (checkCollision(grid, curShape, x, y)) {
        continue;
      }
      while (!checkCollision(grid, curShape, x, y + 1)) {
        y++;
      }

      // Special Block heuristic considerations
      let specialBonus = 0;
      if (piece.type === 'BOMB' || piece.type === 'GIGANTO_BOMB') {
        // Count surrounding occupied cells to maximize blast impact
        const radius = piece.type === 'GIGANTO_BOMB' ? 3 : 2;
        let blastCount = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const checkY = y + dy;
            const checkX = x + dx;
            if (checkY >= 0 && checkY < GRID_HEIGHT && checkX >= 0 && checkX < GRID_WIDTH) {
              if (grid[checkY][checkX] !== null) blastCount++;
            }
          }
        }
        specialBonus = blastCount * 4;
      } else if (piece.type === 'DRILL') {
        // Target column with highest height
        const heights = getColumnHeights(grid);
        specialBonus = (heights[Math.min(GRID_WIDTH - 1, Math.max(0, x))] || 0) * 3;
      }

      const { grid: simGrid, linesCleared } = simulatePlacement(grid, curShape, x, y);
      const heights = getColumnHeights(simGrid);
      const aggregateHeight = heights.reduce((a, b) => a + b, 0);
      const holes = getHoleCount(simGrid);
      const bumpiness = getBumpiness(heights);

      // Aggressive line clearing bonus for Medium and Hard
      const lineClearBonus =
        difficulty === 'easy'
          ? (linesCleared > 0 ? 5 : 0)
          : linesCleared > 0
          ? (linesCleared >= 4 ? 40 : linesCleared * 10)
          : 0;

      const score =
        weights.height * aggregateHeight +
        weights.lines * linesCleared * linesCleared +
        weights.holes * holes +
        weights.bumpiness * bumpiness +
        specialBonus +
        lineClearBonus;

      possibleMoves.push({
        rotation: rot,
        shape: curShape,
        x,
        y,
        score,
      });
    }

    curShape = rotateMatrixCW(curShape);
  }

  if (possibleMoves.length === 0) {
    return { x: piece.x, rotation: 0, dropDelayMs: 300 };
  }

  // Sort descending by score
  possibleMoves.sort((a, b) => b.score - a.score);

  let chosenMove = possibleMoves[0];

  if (difficulty === 'easy') {
    // 35% chance to pick random move from top 10 (very forgiving)
    if (Math.random() < 0.35 && possibleMoves.length > 1) {
      const idx = Math.floor(Math.random() * Math.min(10, possibleMoves.length));
      chosenMove = possibleMoves[idx];
    }
  } else if (difficulty === 'medium') {
    // 6% chance to pick 2nd best move
    if (Math.random() < 0.06 && possibleMoves.length > 1) {
      chosenMove = possibleMoves[1];
    }
  }

  const dropDelayMs = {
    easy: 700 + Math.random() * 350,
    medium: 240 + Math.random() * 130, // Fast and aggressive builder
    hard: 130 + Math.random() * 90,
  }[difficulty];

  return {
    x: chosenMove.x,
    rotation: chosenMove.rotation,
    dropDelayMs,
  };
}
