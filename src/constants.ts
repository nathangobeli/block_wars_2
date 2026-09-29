import { BlockType, AbilityInfo, AbilityType } from './types';

export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;

export const BLOCK_SHAPES: Record<BlockType, number[][]> = {
  // Standard Pieces
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  // Special Blocks (15% weighted bag injection)
  BOMB: [
    [1, 1],
    [1, 1],
  ],
  GIGANTO_BOMB: [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
  DRILL: [
    [1],
    [1],
    [1],
  ],
  GARBAGE_SENDER: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
};

export const BLOCK_COLORS: Record<BlockType | 'GARBAGE', string> = {
  I: '#00f3ff', // Cyan
  J: '#0088ff', // Electric Blue
  L: '#ffaa00', // Neon Orange
  O: '#ffe600', // Golden Yellow
  S: '#00ff75', // Emerald Green
  T: '#bc13fe', // High-tech Purple
  Z: '#ff2a55', // Crimson
  // Special
  BOMB: '#ff4400', // Molten Fiery Orange-Red
  GIGANTO_BOMB: '#ff00aa', // Hyper-nova Magenta/Violet
  DRILL: '#00f7ff', // Plasma Laser Cyan
  GARBAGE_SENDER: '#39ff14', // Radioactive Acid Green
  GARBAGE: '#475569', // Cyber Slate Metal
};

export const SPECIAL_BLOCK_INFO: Record<string, { name: string; desc: string; badge: string; icon: string }> = {
  BOMB: {
    name: 'Bomb Block',
    desc: 'Detonates a 3x3 blast radius upon locking in',
    badge: '3x3 BLAST',
    icon: 'Bomb',
  },
  GIGANTO_BOMB: {
    name: 'Giganto-Bomb',
    desc: 'Cataclysmic 6x6 nuclear shockwave explosion',
    badge: '6x6 CATACLYSM',
    icon: 'Flame',
  },
  DRILL: {
    name: 'Drill Block',
    desc: 'Piercing laser drill that disintegrates target column',
    badge: 'COL-PIERCE',
    icon: 'Zap',
  },
  GARBAGE_SENDER: {
    name: 'Garbage Sender',
    desc: 'Surges +2 bonus garbage lines to enemy on line clears',
    badge: '+2 GARBAGE',
    icon: 'Skull',
  },
};

export const ABILITIES: Record<AbilityType, AbilityInfo> = {
  aegis_shield: {
    id: 'aegis_shield',
    name: 'Aegis Shield',
    cost: 100,
    icon: 'ShieldAlert',
    description: 'Deploys an energy barrier absorbing the next incoming garbage attack.',
    color: '#00f3ff',
  },
  board_push: {
    id: 'board_push',
    name: 'Board Push',
    cost: 100,
    icon: 'ArrowDownToLine',
    description: 'Gravity Inversion: Pushes your entire stack down 3 rows toward safety.',
    color: '#00ff75',
  },
  mirage_cloak: {
    id: 'mirage_cloak',
    name: 'Mirage Cloak',
    cost: 100,
    icon: 'EyeOff',
    description: 'Cloaks opponent field, rendering their active piece invisible next turn.',
    color: '#bc13fe',
  },
  plasma_push: {
    id: 'plasma_push',
    name: 'Plasma Garbage',
    cost: 100,
    icon: 'Radiation',
    description: 'Overcharges reactor: Instantly fires 3 dense garbage rows into enemy field.',
    color: '#ff2a55',
  },
};

export const GAME_MODES = [
  {
    id: 'versus',
    title: 'Versus Duel',
    tagline: 'Classic Competitive Duel',
    description: 'Standard competitive battle. Clearing 2+ lines sends retaliatory garbage with random gaps to overwhelm opponent.',
    icon: 'Swords',
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400',
  },
  {
    id: 'war',
    title: 'War Mode',
    tagline: 'Tactical Overdrive Combat',
    description: 'Line clears charge your WAR METER (0–100%). Deploy Aegis Shield, Board Push, Mirage Cloak, or Plasma Push.',
    icon: 'Flame',
    color: 'from-amber-500/20 to-red-500/10 border-amber-500/40 text-amber-400',
  },
  {
    id: 'score_attack',
    title: 'Score Attack',
    tagline: 'Synchronized Piece Limit',
    description: 'Fixed piece limit (25, 50, or 100 identical pieces). Maximise combos and Quad clears for ultimate high score.',
    icon: 'Trophy',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
  },
  {
    id: 'survival',
    title: 'Endurance Survival',
    tagline: 'Rising Hazard Waves',
    description: 'Unforgiving pressure. Rising radioactive garbage waves emerge every 5 synchronized turns.',
    icon: 'Activity',
    color: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-400',
  },
  {
    id: 'wacky_chaos',
    title: 'Wacky Chaos',
    tagline: 'Unpredictable Glitches',
    description: 'Reality fractures every 5 turns: Inverted Steering, Giganto-Bombs, Field Quakes, or Blackout sensor jam.',
    icon: 'Sparkles',
    color: 'from-pink-500/20 to-yellow-500/10 border-pink-500/40 text-pink-400',
  },
] as const;

// Wall Kick Offsets (Standard SRS)
export const SRS_KICKS_JLSTZ: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

export const SRS_KICKS_I: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};
