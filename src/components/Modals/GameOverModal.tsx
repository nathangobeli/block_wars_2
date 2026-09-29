import React, { useEffect } from 'react';
import { PlayerState, GameState } from '../../types';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Swords, Award, Zap, Flame } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  winner: 'p1' | 'p2' | 'tie' | null;
  p1: PlayerState;
  p2: PlayerState;
  gameState: GameState;
  onRematch: () => void;
  onReturnMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  p1,
  p2,
  gameState,
  onRematch,
  onReturnMenu,
}) => {
  useEffect(() => {
    if (isOpen && winner && winner !== 'tie') {
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00f3ff', '#bc13fe', '#ffaa00'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff007f', '#00ff75', '#ffffff'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen, winner]);

  if (!isOpen) return null;

  const getWinnerText = () => {
    if (winner === 'tie') return 'STALEMATE // SIMULTANEOUS LOCKOUT';
    if (winner === 'p1') return `${p1.name} VICTORIOUS!`;
    return `${p2.name} VICTORIOUS!`;
  };

  const isP1Win = winner === 'p1';

  // Duration in mm:ss
  const minutes = Math.floor(gameState.elapsedTime / 60);
  const seconds = gameState.elapsedTime % 60;
  const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // APM Calculation
  const minutesPlayed = Math.max(0.1, gameState.elapsedTime / 60);
  const p1Apm = Math.round((p1.stats.piecesDropped * 4) / minutesPlayed);
  const p2Apm = Math.round((p2.stats.piecesDropped * 4) / minutesPlayed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-2xl bg-slate-900/95 border-2 border-cyan-400 shadow-[0_0_60px_rgba(0,243,255,0.4)] text-slate-100 flex flex-col items-center">
        {/* Victory Icon & Title */}
        <div className="p-3 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_20px_#00f3ff] mb-3 animate-bounce">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-1">
          MATCH CONCLUDED // COMBAT PROTOCOL CEASED
        </div>

        <h2
          className={`text-2xl sm:text-4xl font-orbitron font-black tracking-wider text-center mb-6 uppercase ${
            winner === 'tie'
              ? 'text-amber-400'
              : isP1Win
              ? 'text-cyan-400 neon-glow-cyan'
              : 'text-pink-400 neon-glow-magenta'
          }`}
        >
          {getWinnerText()}
        </h2>

        {/* Head-to-Head Stats Comparison Grid */}
        <div className="w-full bg-slate-950/80 rounded-xl border border-slate-800 p-4 mb-6">
          {/* Header Row */}
          <div className="grid grid-cols-3 text-xs font-orbitron font-bold border-b border-slate-800 pb-2 mb-2 text-center">
            <span className="text-cyan-400">{p1.name}</span>
            <span className="text-slate-400">TELEMETRY</span>
            <span className="text-pink-400">{p2.name}</span>
          </div>

          {/* Stat Rows */}
          <div className="space-y-2 text-xs font-mono">
            <div className="grid grid-cols-3 items-center text-center">
              <span className="font-bold text-sm text-cyan-300">{p1.score.toLocaleString()}</span>
              <span className="text-slate-400">FINAL SCORE</span>
              <span className="font-bold text-sm text-pink-300">{p2.score.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-3 items-center text-center">
              <span className="text-slate-200">{p1.lines}</span>
              <span className="text-slate-400">LINES CLEARED</span>
              <span className="text-slate-200">{p2.lines}</span>
            </div>

            <div className="grid grid-cols-3 items-center text-center">
              <span className="text-slate-200">{p1.stats.quads}</span>
              <span className="text-slate-400">SYNCHRO-QUADS</span>
              <span className="text-slate-200">{p2.stats.quads}</span>
            </div>

            <div className="grid grid-cols-3 items-center text-center">
              <span className="text-slate-200">{p1.stats.highestCombo}x</span>
              <span className="text-slate-400">MAX COMBO</span>
              <span className="text-slate-200">{p2.stats.highestCombo}x</span>
            </div>

            <div className="grid grid-cols-3 items-center text-center">
              <span className="text-slate-200">{p1.stats.specialBlocksTriggered}</span>
              <span className="text-slate-400">SPECIAL BLOCKS</span>
              <span className="text-slate-200">{p2.stats.specialBlocksTriggered}</span>
            </div>

            <div className="grid grid-cols-3 items-center text-center">
              <span className="text-slate-200">{p1.stats.abilitiesUsed}</span>
              <span className="text-slate-400">WAR ABILITIES</span>
              <span className="text-slate-200">{p2.stats.abilitiesUsed}</span>
            </div>

            <div className="grid grid-cols-3 items-center text-center">
              <span className="text-slate-200">{p1Apm}</span>
              <span className="text-slate-400">EST. APM</span>
              <span className="text-slate-200">{p2Apm}</span>
            </div>

            <div className="grid grid-cols-3 items-center text-center pt-2 border-t border-slate-900">
              <span className="text-slate-400 col-span-3 text-center">
                DURATION: <strong className="text-slate-200">{formattedDuration}</strong> // TURNS: <strong className="text-slate-200">{gameState.turnCount}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full justify-center">
          <button
            onClick={onRematch}
            className="flex-1 max-w-[200px] py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-orbitron font-extrabold text-sm tracking-wider shadow-[0_0_20px_rgba(0,243,255,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REMATCH</span>
          </button>

          <button
            onClick={onReturnMenu}
            className="flex-1 max-w-[200px] py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-orbitron font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
