import { BlockType, Piece, StandardBlockType, SpecialBlockType } from '../types';
import { BLOCK_SHAPES, BLOCK_COLORS, SPECIAL_BLOCK_INFO, GRID_WIDTH } from '../constants';

const STANDARD_PIECES: StandardBlockType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
const SPECIAL_PIECES: SpecialBlockType[] = ['BOMB', 'GIGANTO_BOMB', 'DRILL', 'GARBAGE_SENDER'];

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createPiece(type: BlockType): Piece {
  const shape = BLOCK_SHAPES[type].map(row => [...row]);
  const isSpecial = type in SPECIAL_BLOCK_INFO;
  const specialName = isSpecial ? SPECIAL_BLOCK_INFO[type].name : undefined;

  // Center horizontally
  const shapeWidth = shape[0].length;
  const x = Math.floor((GRID_WIDTH - shapeWidth) / 2);
  const y = 0;

  return {
    type,
    shape,
    color: BLOCK_COLORS[type],
    x,
    y,
    rotation: 0,
    isSpecial,
    specialName,
  };
}

export class SharedBagGenerator {
  private queue: Piece[] = [];
  private specialChance: number;

  constructor(specialChance: number = 0.15) {
    this.specialChance = specialChance;
    this.refill();
  }

  private refill() {
    const bag: BlockType[] = shuffle(STANDARD_PIECES);

    // 15% weighted bag injection: roll to inject a special block into the 7-bag
    if (Math.random() < this.specialChance * 2.5) {
      const specialType = SPECIAL_PIECES[Math.floor(Math.random() * SPECIAL_PIECES.length)];
      // Insert at a random position in the bag
      const insertIdx = Math.floor(Math.random() * bag.length);
      bag.splice(insertIdx, 0, specialType);
    }

    for (const type of bag) {
      this.queue.push(createPiece(type));
    }
  }

  public getNextPiece(): Piece {
    if (this.queue.length < 5) {
      this.refill();
    }
    const piece = this.queue.shift()!;
    // Clone piece fresh with initial coordinates
    return createPiece(piece.type);
  }

  public peekNextPiece(): Piece {
    if (this.queue.length === 0) {
      this.refill();
    }
    return createPiece(this.queue[0].type);
  }

  public reset() {
    this.queue = [];
    this.refill();
  }
}
