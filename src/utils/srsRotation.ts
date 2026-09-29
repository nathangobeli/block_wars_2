import { Piece, Grid } from '../types';
import { GRID_WIDTH, GRID_HEIGHT, SRS_KICKS_JLSTZ, SRS_KICKS_I } from '../constants';

/** Rotate an N x M or N x N 2D matrix clockwise */
export function rotateMatrixCW(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated: number[][] = [];

  for (let c = 0; c < cols; c++) {
    const newRow: number[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      newRow.push(matrix[r][c]);
    }
    rotated.push(newRow);
  }
  return rotated;
}

/** Check if piece collides with walls or existing cells */
export function checkCollision(grid: Grid, shape: number[][], x: number, y: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const boardX = x + c;
        const boardY = y + r;

        // Boundaries
        if (boardX < 0 || boardX >= GRID_WIDTH || boardY >= GRID_HEIGHT) {
          return true;
        }

        // Allowed to be above ceiling (boardY < 0) during spawn
        if (boardY >= 0 && grid[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }
  return false;
}

/** Calculate ghost piece Y landing position */
export function calculateGhostY(grid: Grid, piece: Piece): number {
  let ghostY = piece.y;
  while (!checkCollision(grid, piece.shape, piece.x, ghostY + 1)) {
    ghostY++;
  }
  return ghostY;
}

/** Attempt to rotate piece using SRS Wall & Floor Kicks */
export function attemptRotation(
  grid: Grid,
  piece: Piece,
  direction: 'CW' | 'CCW' = 'CW'
): { rotated: boolean; newPiece: Piece } {
  // O pieces and 1x1 don't need rotation
  if (piece.type === 'O') {
    return { rotated: false, newPiece: piece };
  }

  const currentRot = piece.rotation;
  const nextRot = direction === 'CW' ? (currentRot + 1) % 4 : (currentRot + 3) % 4;
  const rotatedShape = rotateMatrixCW(piece.shape);

  // Kicks key
  const kickKey = `${currentRot}->${nextRot}`;
  const kickTable = piece.type === 'I' ? SRS_KICKS_I[kickKey] : SRS_KICKS_JLSTZ[kickKey];
  const kicks = kickTable || [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [kx, ky] of kicks) {
    const testX = piece.x + kx;
    const testY = piece.y - ky; // SRS standard convention: positive Y is up

    if (!checkCollision(grid, rotatedShape, testX, testY)) {
      return {
        rotated: true,
        newPiece: {
          ...piece,
          shape: rotatedShape,
          x: testX,
          y: testY,
          rotation: nextRot,
        },
      };
    }
  }

  return { rotated: false, newPiece: piece };
}
