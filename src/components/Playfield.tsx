import React from 'react';
import { PlayerState, Piece, Cell, SpecialBlockType } from '../types';
import { GRID_WIDTH, GRID_HEIGHT, BLOCK_COLORS } from '../constants';
import { Shield, EyeOff, AlertTriangle, Cpu, CheckCircle2, Flame, Zap, Skull, Bomb } from 'lucide-react';

interface PlayfieldProps {
  player: PlayerState;
  isOpponent?: boolean;
  viewMode: 'arena_split' | 'tabletop_duel';
  isP2Tabletop?: boolean;
  compact?: boolean;
}

export const Playfield: React.FC<PlayfieldProps> = ({
  player,
  isOpponent = false,
  viewMode,
  isP2Tabletop = false,
  compact = false,
}) => {
  const {
    grid,
    activePiece,
    ghostY,
    isReady,
    pendingGarbage,
    shieldActive,
    cloakedTurns,
    invertedControlsTurns,
    blackoutTurns,
    dangerFlash,
    aiThinking,
    id,
    name,
  } = player;

  // Build rendered cell matrix combining grid + active piece + ghost piece
  const displayCells: {
    cell: Cell | null;
    isGhost: boolean;
    isActive: boolean;
  }[][] = Array.from({ length: GRID_HEIGHT }, (_, r) =>
    Array.from({ length: GRID_WIDTH }, (_, c) => ({
      cell: grid[r][c],
      isGhost: false,
      isActive: false,
    }))
  );

  // Overlay Ghost Piece
  if (activePiece && !isReady && cloakedTurns === 0) {
    const shape = activePiece.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const gy = ghostY + r;
          const gx = activePiece.x + c;
          if (gy >= 0 && gy < GRID_HEIGHT && gx >= 0 && gx < GRID_WIDTH) {
            if (!displayCells[gy][gx].cell) {
              displayCells[gy][gx] = {
                cell: {
                  type: activePiece.type,
                  color: activePiece.color,
                  isSpecial: activePiece.isSpecial,
                  specialType: activePiece.isSpecial ? (activePiece.type as SpecialBlockType) : undefined,
                },
                isGhost: true,
                isActive: false,
              };
            }
          }
        }
      }
    }
  }

  // Overlay Active Piece (unless cloaked)
  if (activePiece && !isReady && cloakedTurns === 0) {
    const shape = activePiece.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const ay = activePiece.y + r;
          const ax = activePiece.x + c;
          if (ay >= 0 && ay < GRID_HEIGHT && ax >= 0 && ax < GRID_WIDTH) {
            displayCells[ay][ax] = {
              cell: {
                type: activePiece.type,
                color: activePiece.color,
                isSpecial: activePiece.isSpecial,
                specialType: activePiece.isSpecial ? (activePiece.type as SpecialBlockType) : undefined,
              },
              isGhost: false,
              isActive: true,
            };
          }
        }
      }
    }
  }

  const isPlayer1 = id === 'p1';
  const themeBorderColor = isPlayer1 ? 'border-cyan-500/30' : 'border-pink-500/30';
  const themeGlow = isPlayer1 ? 'shadow-[0_0_15px_rgba(0,243,255,0.15)]' : 'shadow-[0_0_15px_rgba(255,0,127,0.15)]';

  const isTabletop = viewMode === 'tabletop_duel' || compact;

  // Responsive Board Size: exact 1:2 aspect ratio (10 cols : 20 rows)
  const boardHeightClass = isTabletop
    ? 'h-[25vh] max-h-[210px] sm:max-h-[300px]'
    : 'h-[42vh] sm:h-[48vh] max-h-[460px]';

  return (
    <div
      className={`relative flex flex-col items-center transition-transform duration-300 ${
        isP2Tabletop ? 'rotate-180' : ''
      }`}
    >
      {/* Player Header Banner */}
      <div className={`flex items-center justify-between w-full px-1.5 ${isTabletop ? 'py-0.5 mb-0.5 text-[10px]' : 'py-1 mb-1 text-xs'} font-mono`}>
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${
              isPlayer1 ? 'bg-cyan-400 shadow-[0_0_6px_#00f3ff]' : 'bg-pink-500 shadow-[0_0_6px_#ff007f]'
            }`}
          />
          <span className="font-bold tracking-wider text-slate-200 uppercase truncate max-w-[90px] sm:max-w-none">{name}</span>
          {player.isAI && (
            <span className="flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] bg-slate-800 border border-slate-700 text-slate-300">
              <Cpu className="w-2.5 h-2.5 text-cyan-400" />
              {player.aiDifficulty[0].toUpperCase()}
            </span>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-1">
          {shieldActive && (
            <span className="flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] bg-cyan-950/80 border border-cyan-400 text-cyan-300 animate-pulse">
              <Shield className="w-2.5 h-2.5" /> AEGIS
            </span>
          )}
          {invertedControlsTurns > 0 && (
            <span className="flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] bg-amber-950/80 border border-amber-400 text-amber-300 animate-bounce">
              <AlertTriangle className="w-2.5 h-2.5" /> INVERT
            </span>
          )}
          {cloakedTurns > 0 && (
            <span className="flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] bg-purple-950/80 border border-purple-400 text-purple-300 animate-pulse">
              <EyeOff className="w-2.5 h-2.5" /> CLOAK
            </span>
          )}
          {isReady && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950/90 border border-emerald-400 text-emerald-400 shadow-[0_0_8px_#00ff75]">
              <CheckCircle2 className="w-2.5 h-2.5" /> LOCKED
            </span>
          )}
        </div>
      </div>

      {/* Main Grid Wrapper with Threat Meter */}
      <div className={`relative flex items-center ${boardHeightClass}`}>
        {/* Threat Meter: Glowing Garbage Preview Column */}
        <div className={`relative ${isTabletop ? 'w-1.5' : 'w-2 sm:w-2.5'} h-full bg-slate-950/80 rounded-l border-y border-l border-slate-800 mr-0.5 overflow-hidden flex flex-col-reverse p-[1px]`}>
          {Array.from({ length: 20 }, (_, idx) => (
            <div
              key={idx}
              className={`w-full h-1 my-0.5 rounded-sm transition-all duration-300 ${
                idx < pendingGarbage
                  ? 'bg-rose-500 shadow-[0_0_6px_#ff2a55]'
                  : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* The 10x20 Playfield Board */}
        <div
          className={`relative h-full aspect-[1/2] rounded-lg border-2 ${themeBorderColor} ${themeGlow} bg-[#06070B] overflow-hidden ${
            dangerFlash ? 'ring-4 ring-rose-500 ring-opacity-70 animate-pulse' : ''
          }`}
          style={{
            display: 'grid',
            gridTemplateRows: `repeat(${GRID_HEIGHT}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))`,
          }}
        >
          {/* Cyber Grid Lines Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10%_5%] pointer-events-none" />

          {/* Danger Zone Line (Row 4/5) */}
          <div className="absolute top-[20%] left-0 right-0 h-0.5 bg-rose-500/25 border-t border-dashed border-rose-500/40 pointer-events-none" />

          {/* Cells Rendering */}
          {displayCells.map((row, r) =>
            row.map((item, c) => {
              const { cell, isGhost, isActive } = item;

              if (!cell) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className="w-full h-full border-[0.5px] border-slate-900/30"
                  />
                );
              }

              // Special Icon helper
              const renderSpecialIcon = () => {
                if (!cell.isSpecial) return null;
                switch (cell.type) {
                  case 'BOMB':
                    return <Bomb className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white animate-spin" style={{ animationDuration: '6s' }} />;
                  case 'GIGANTO_BOMB':
                    return <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-pulse" />;
                  case 'DRILL':
                    return <Zap className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" />;
                  case 'GARBAGE_SENDER':
                    return <Skull className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />;
                  default:
                    return null;
                }
              };

              // Ghost Piece: Wireframe Neon Outline
              if (isGhost) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className="w-full h-full p-0.5 flex items-center justify-center"
                  >
                    <div
                      className="w-full h-full rounded-sm border-2 animate-pulse"
                      style={{
                        borderColor: cell.color,
                        backgroundColor: `${cell.color}15`,
                        boxShadow: `0 0 6px ${cell.color}40`,
                      }}
                    />
                  </div>
                );
              }

              // Solid Block / Special Block
              const isGarbage = cell.type === 'GARBAGE';

              return (
                <div
                  key={`${r}-${c}`}
                  className="w-full h-full p-[1px] flex items-center justify-center relative"
                >
                  <div
                    className={`block-cell w-full h-full rounded-sm flex items-center justify-center overflow-hidden transition-all duration-100 ${
                      isActive ? 'scale-[1.02] z-10' : ''
                    }`}
                    style={{
                      backgroundColor: cell.color,
                      boxShadow: isGarbage
                        ? 'inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.8)'
                        : `0 0 8px ${cell.color}60, inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.7)`,
                      border: isGarbage
                        ? '1px solid #334155'
                        : `1px solid ${cell.color}`,
                    }}
                  >
                    {renderSpecialIcon()}
                  </div>
                </div>
              );
            })
          )}

          {/* Blackout Fog of War Glitch */}
          {blackoutTurns > 0 && (
            <div className="absolute inset-0 bg-black/90 pointer-events-none backdrop-blur-sm flex items-center justify-center">
              <span className="text-xs font-mono font-bold tracking-widest text-slate-500 animate-pulse">
                // SENSOR JAMMED //
              </span>
            </div>
          )}

          {/* Aegis Shield Bubble Overlay */}
          {shieldActive && (
            <div className="absolute inset-0 pointer-events-none border-2 border-cyan-400 bg-cyan-500/10 shadow-[inset_0_0_30px_rgba(0,243,255,0.3)] animate-pulse" />
          )}

          {/* AI Thinking Overlay */}
          {aiThinking && !isReady && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/90 border border-cyan-500/50 text-[10px] font-mono text-cyan-300 flex items-center gap-1 shadow-md">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>AI CALC...</span>
            </div>
          )}

          {/* Locked-In Ready Badge Overlay */}
          {isReady && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center z-20 pointer-events-none">
              <div className="px-3 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-400 shadow-[0_0_20px_#00ff75] text-center transform scale-105 transition-transform">
                <div className="text-emerald-400 font-orbitron font-extrabold text-sm tracking-widest">
                  LOCKED IN
                </div>
                <div className="text-[10px] font-mono text-emerald-200 opacity-80">
                  WAITING FOR SYNCHRO
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
