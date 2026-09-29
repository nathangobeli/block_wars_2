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

  const btnSize = compact
    ? 'w-8 h-8 min-w-[32px] sm:w-9 sm:h-9 rounded-lg'
    : 'w-10 h-10 sm:w-12 sm:h-12 rounded-xl';
  const iconSize = compact ? 'w-4 h-4' : 'w-5 h-5';
  const hardDropIconSize = compact ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className={`flex items-center justify-between ${compact ? 'gap-1.5 max-w-[280px] px-1 py-0.5' : 'gap-2 sm:gap-3 max-w-[340px] px-2 py-1'} w-full select-none touch-none`}>
      {/* Directional Pad */}
      <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onMoveLeft, 12)}
          className={`${btnSize} border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center font-bold transition-all active:scale-90 disabled:opacity-40 shadow-sm`}
          aria-label="Move Left"
        >
          <ArrowLeft className={iconSize} />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onMoveRight, 12)}
          className={`${btnSize} border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center font-bold transition-all active:scale-90 disabled:opacity-40 shadow-sm`}
          aria-label="Move Right"
        >
          <ArrowRight className={iconSize} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onRotate, 20)}
          className={`${btnSize} border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center font-bold transition-all active:scale-90 disabled:opacity-40 shadow-sm`}
          aria-label="Rotate"
        >
          <RotateCw className={iconSize} />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onDrop, 25)}
          className={`${btnSize} border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center font-bold transition-all active:scale-90 disabled:opacity-40 shadow-sm`}
          aria-label="Soft Drop"
        >
          <ArrowDown className={iconSize} />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleAction(onHardDrop, 35)}
          className={`${btnSize} border ${borderCol} ${bgCol} ${textCol} ${glow} flex items-center justify-center font-bold transition-all active:scale-90 disabled:opacity-40 shadow-sm`}
          aria-label="Hard Drop / Lock"
        >
          <ChevronsDown className={hardDropIconSize} />
        </button>
      </div>
    </div>
  );
};
