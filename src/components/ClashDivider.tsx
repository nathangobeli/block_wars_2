import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface ClashDividerProps {
  clashBalance: number; // -100 (P1 advantage) to +100 (P2 advantage)
  orientation: 'vertical' | 'horizontal';
  lastAttacker: 'p1' | 'p2' | null;
}

export const ClashDivider: React.FC<ClashDividerProps> = ({
  clashBalance,
  orientation,
  lastAttacker,
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (lastAttacker) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [lastAttacker]);

  // Normalized shift: -50% to +50%
  const normalizedBalance = Math.max(-50, Math.min(50, clashBalance / 2));

  if (orientation === 'vertical') {
    return (
      <div className="relative flex flex-col items-center justify-between h-full w-8 sm:w-12 select-none mx-1 py-4">
        {/* Top Node Emitter */}
        <div className="w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_#00f3ff] flex items-center justify-center animate-pulse z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>

        {/* Central High-Voltage Plasma Laser Beam */}
        <div className="relative w-2 sm:w-2.5 h-[80%] my-2 bg-slate-900 rounded-full overflow-hidden flex items-center justify-center">
          {/* Laser Core */}
          <div
            className={`absolute inset-0 transition-all duration-300 ${
              pulse ? 'scale-x-150 brightness-150' : ''
            }`}
            style={{
              background: 'linear-gradient(180deg, #00f3ff 0%, #ffffff 50%, #ff007f 100%)',
              boxShadow: pulse
                ? '0 0 25px #ffffff, 0 0 40px #00f3ff, 0 0 40px #ff007f'
                : '0 0 15px #00f3ff, 0 0 15px #ff007f',
            }}
          />

          {/* Traveling Voltage Pulse */}
          <div className="absolute w-full h-8 bg-white blur-[2px] opacity-80 animate-laser-flow" />

          {/* Clash Point Marker (shifts based on clashBalance) */}
          <div
            className="absolute w-4 h-4 rounded-full bg-white border border-cyan-300 shadow-[0_0_12px_#ffffff] transition-all duration-500 flex items-center justify-center z-10"
            style={{
              top: `${50 + normalizedBalance}%`,
              transform: 'translateY(-50%)',
            }}
          >
            <Zap className="w-2.5 h-2.5 text-cyan-500 fill-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Voltage Readout Indicator */}
        <div className="text-[9px] font-mono font-bold tracking-wider text-slate-400 text-center uppercase rotate-90 my-2">
          <span className="text-cyan-400">{Math.round(50 - normalizedBalance)}</span>
          <span className="text-slate-600 mx-0.5">/</span>
          <span className="text-pink-400">{Math.round(50 + normalizedBalance)}</span>
        </div>

        {/* Bottom Node Emitter */}
        <div className="w-5 h-5 rounded-full bg-pink-500 border-2 border-white shadow-[0_0_15px_#ff007f] flex items-center justify-center animate-pulse z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      </div>
    );
  }

  // Horizontal for Tabletop Duel
  return (
    <div className="relative flex items-center justify-between w-full h-8 sm:h-12 select-none px-4 my-1">
      {/* Left Node */}
      <div className="w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_#00f3ff] flex items-center justify-center animate-pulse z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>

      {/* Laser Beam */}
      <div className="relative h-2 sm:h-2.5 w-[80%] mx-2 bg-slate-900 rounded-full overflow-hidden flex items-center justify-center">
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            pulse ? 'scale-y-150 brightness-150' : ''
          }`}
          style={{
            background: 'linear-gradient(90deg, #00f3ff 0%, #ffffff 50%, #ff007f 100%)',
            boxShadow: pulse
              ? '0 0 25px #ffffff, 0 0 40px #00f3ff, 0 0 40px #ff007f'
              : '0 0 15px #00f3ff, 0 0 15px #ff007f',
          }}
        />

        <div
          className="absolute h-4 w-4 rounded-full bg-white border border-cyan-300 shadow-[0_0_12px_#ffffff] transition-all duration-500 flex items-center justify-center z-10"
          style={{
            left: `${50 + normalizedBalance}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <Zap className="w-2.5 h-2.5 text-cyan-500 fill-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      {/* Right Node */}
      <div className="w-5 h-5 rounded-full bg-pink-500 border-2 border-white shadow-[0_0_15px_#ff007f] flex items-center justify-center animate-pulse z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>
    </div>
  );
};
