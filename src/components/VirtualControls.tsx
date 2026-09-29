import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, ChevronsDown, Shield } from 'lucide-react';

interface VirtualControlsProps {
  playerId: 'p1' | 'p2';
  themeColor: 'cyan' | 'pink';
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onDrop: () => void;
  onHardDrop: () => void;
  onAbility?: () => void;
  disabled?: boolean;
  compact?: boolean;
  layout?: 'horizontal' | 'side-pad';
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  playerId,
  themeColor,
  onMoveLeft,
  onMoveRight,
  onRotate,
  onDrop,
  onHardDrop,
  onAbility,
  disabled = false,
  compact = false,
  layout = 'horizontal',
}) => {
  const triggerHaptic = (ms: number = 15) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {}
    }
  };

  const isCyan = themeColor === 'cyan';
  const borderCol = isCyan ? 'border-cyan-500/40' : 'border-pink-500/40';
  const textCol = isCyan ? 'text-cyan-400' : 'text-pink-400';
  const bgCol = isCyan ? 'bg-cyan-950/40 active:bg-cyan-500/30' : 'bg-pink-950/40 active:bg-pink-500/30';
  const glow = isCyan ? 'shadow-[0_0_12px_rgba(0,243,255,0.2)]' : 'shadow-[0_0_12px_rgba(255,0,127,0.2)]';

  const handleAction = (action: () => void, hapticMs: number = 15) => {
    if (disabled) return;
    triggerHaptic(hapticMs);
    action();
  };

  if (layout === 'side-pad') {
    return (
      <div className="flex flex-col gap-1.5 w-full select-none touch-none mt-1">
        {/* Row 1: Steering (Left, Rotate, Right) */}
        <div className="grid grid-cols-3 gap-1.5 w-full">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleAction(onMoveLeft, 12)}
            className={`h-10 sm:h-11 rounded-lg border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center font-bold transition-all active:scale-90 active:bg-opacity-90 disabled:opacity-30 shadow-md touch-manipulation cursor-pointer`}
            aria-label="Move Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => handleAction(onRotate, 20)}
            className={`h-10 sm:h-11 rounded-lg border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center font-bold transition-all active:scale-90 active:bg-opacity-90 disabled:opacity-30 shadow-md touch-manipulation cursor-pointer`}
            aria-label="Rotate"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => handleAction(onMoveRight, 12)}
            className={`h-10 sm:h-11 rounded-lg border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center font-bold transition-all active:scale-90 active:bg-opacity-90 disabled:opacity-30 shadow-md touch-manipulation cursor-pointer`}
            aria-label="Move Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Row 2: Soft Drop */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onDrop, 25)}
          className={`w-full h-8 sm:h-9 rounded-lg border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center gap-1 font-mono text-[10px] font-bold tracking-wider transition-all active:scale-95 active:bg-opacity-90 disabled:opacity-30 shadow-sm touch-manipulation cursor-pointer`}
          aria-label="Soft Drop"
        >
          <ArrowDown className="w-4 h-4" />
          <span>SOFT DROP</span>
        </button>

        {/* Row 3: Hard Drop / Lock-In */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onHardDrop, 35)}
          className={`w-full h-10 sm:h-11 rounded-lg border-2 ${
            isCyan
              ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow-[0_0_12px_rgba(0,243,255,0.35)]'
              : 'border-pink-400 bg-pink-950/80 text-pink-300 shadow-[0_0_12px_rgba(255,0,127,0.35)]'
          } flex items-center justify-center gap-1.5 font-orbitron text-xs font-extrabold tracking-wider transition-all active:scale-95 disabled:opacity-30 shadow-md touch-manipulation cursor-pointer`}
          aria-label="Hard Drop / Lock"
        >
          <ChevronsDown className="w-5 h-5" />
          <span>LOCK IN</span>
        </button>
      </div>
    );
  }

  const btnSize = compact
    ? 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl'
    : 'w-11 h-11 sm:w-12 sm:h-12 rounded-xl';
  const iconSize = compact ? 'w-4.5 h-4.5 sm:w-5 sm:h-5' : 'w-5 h-5 sm:w-6 sm:h-6';
  const hardDropIconSize = compact ? 'w-5 h-5 sm:w-5.5 sm:h-5.5' : 'w-6 h-6 sm:w-7 sm:h-7';

  return (
    <div
      className={`flex items-center justify-between ${
        compact
          ? 'gap-2 max-w-[360px] sm:max-w-[420px] px-2 sm:px-4 py-0.5'
          : 'gap-2 sm:gap-3 max-w-[360px] sm:max-w-[420px] px-2 py-1'
      } w-full select-none touch-none`}
    >
      {/* Directional Pad */}
      <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onMoveLeft, 12)}
          className={`${btnSize} border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center font-bold transition-all active:scale-90 active:bg-opacity-90 disabled:opacity-30 shadow-md touch-manipulation cursor-pointer`}
          aria-label="Move Left"
        >
          <ArrowLeft className={iconSize} />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onMoveRight, 12)}
          className={`${btnSize} border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center font-bold transition-all active:scale-90 active:bg-opacity-90 disabled:opacity-30 shadow-md touch-manipulation cursor-pointer`}
          aria-label="Move Right"
        >
          <ArrowRight className={iconSize} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onRotate, 20)}
          className={`${btnSize} border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center font-bold transition-all active:scale-90 active:bg-opacity-90 disabled:opacity-30 shadow-md touch-manipulation cursor-pointer`}
          aria-label="Rotate"
        >
          <RotateCw className={iconSize} />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onDrop, 25)}
          className={`${btnSize} border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center font-bold transition-all active:scale-90 active:bg-opacity-90 disabled:opacity-30 shadow-md touch-manipulation cursor-pointer`}
          aria-label="Soft Drop"
        >
          <ArrowDown className={iconSize} />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onHardDrop, 35)}
          className={`${btnSize} border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center font-bold transition-all active:scale-90 active:bg-opacity-90 disabled:opacity-30 shadow-md touch-manipulation cursor-pointer`}
          aria-label="Hard Drop / Lock"
        >
          <ChevronsDown className={hardDropIconSize} />
        </button>
      </div>
    </div>
  );
};
