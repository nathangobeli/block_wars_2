import React from 'react';
import { X, Swords, Flame, Trophy, Activity, Sparkles, Bomb, Zap, Skull, Shield, ArrowDownToLine, EyeOff, Radiation, Keyboard, Smartphone } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_50px_rgba(0,243,255,0.2)] text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-orbitron font-extrabold tracking-wider text-cyan-300">
              OPERATIONAL PROTOCOLS & FIELD MANUAL
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm">
          {/* Core Synchronous Mechanism */}
          <section className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-orbitron font-bold text-cyan-400 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              SYNCHRONIZED HEAD-TO-HEAD BATTLE
            </h3>
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
              Both combatants receive the <strong>EXACT SAME</strong> tetromino sequence each turn. Both players maneuver simultaneously.
              When a player locks in, they enter <em>READY</em> state. Once both players lock in (or the adrenaline blitz timer expires), the turn resolves simultaneously.
            </p>
          </section>

          {/* Controls Matrix */}
          <section>
            <h3 className="font-orbitron font-bold text-slate-200 mb-2 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              INPUT MATRIX (DESKTOP & TOUCH)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-500/30">
                <div className="font-bold text-cyan-400 mb-1 uppercase">Player 1 Controls</div>
                <ul className="space-y-1 text-slate-300">
                  <li><span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">W</span> — Rotate Piece (SRS Kicks)</li>
                  <li><span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">A</span> / <span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">D</span> — Shift Left / Right</li>
                  <li><span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">S</span> — Soft Drop</li>
                  <li><span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">SPACE</span> — Hard Drop / Lock In</li>
                  <li><span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">Q</span> / <span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">E</span> — War Ability Hotkeys</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-pink-500/30">
                <div className="font-bold text-pink-400 mb-1 uppercase">Player 2 Controls</div>
                <ul className="space-y-1 text-slate-300">
                  <li><span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">UP ARROW</span> — Rotate Piece (SRS Kicks)</li>
                  <li><span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">LEFT</span> / <span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">RIGHT</span> — Shift Left / Right</li>
                  <li><span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">DOWN</span> — Soft Drop</li>
                  <li><span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">ENTER</span> — Hard Drop / Lock In</li>
                  <li><span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">/</span> — War Ability Hotkey</li>
                </ul>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-slate-400 text-xs font-mono">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mobile & iPad: Full on-screen virtual gamepads with haptic feedback vibrations.</span>
            </div>
          </section>

          {/* Special Blocks Protocol (15% Weighted Injection) */}
          <section>
            <h3 className="font-orbitron font-bold text-slate-200 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              SPECIAL BLOCKS (15% WEIGHTED BAG INJECTION)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-rose-500/30 flex items-start gap-2.5">
                <Bomb className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-400 font-orbitron">BOMB BLOCK (3x3)</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Detonates an explosive fiery shockwave clearing a 3x3 radius upon locking into the stack.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-pink-500/30 flex items-start gap-2.5">
                <Flame className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-pink-400 font-orbitron">GIGANTO-BOMB (6x6)</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Massive cataclysmic nuclear explosion obliterating a wide 6x6 area upon detonation.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-cyan-500/30 flex items-start gap-2.5">
                <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-cyan-400 font-orbitron">DRILL BLOCK (COLUMN PIERCE)</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    High-energy plasma laser drill piercing completely through the target column from top to bottom.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-emerald-500/30 flex items-start gap-2.5">
                <Skull className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-400 font-orbitron">GARBAGE SENDER (+2)</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Surges +2 additional dense retaliatory garbage rows directly into opponent field when cleared.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* War Mode Abilities */}
          <section>
            <h3 className="font-orbitron font-bold text-slate-200 mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              TACTICAL WAR ABILITIES (100% WAR METER)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-cyan-500/30 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-cyan-400">AEGIS SHIELD</div>
                  <div className="text-slate-400 text-[11px]">Deploy kinetic barrier neutralizing the next incoming garbage salvo.</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-emerald-500/30 flex items-start gap-2.5">
                <ArrowDownToLine className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-400">BOARD PUSH</div>
                  <div className="text-slate-400 text-[11px]">Gravity Inversion: Pushes stack down 3 rows, evacuating critical red zone.</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-purple-500/30 flex items-start gap-2.5">
                <EyeOff className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-purple-400">MIRAGE CLOAK</div>
                  <div className="text-slate-400 text-[11px]">Sensor Jammer: Renders opponent's active piece invisible for next turn.</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-rose-500/30 flex items-start gap-2.5">
                <Radiation className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-400">PLASMA PUSH</div>
                  <div className="text-slate-400 text-[11px]">Instant Reactor Surge: Launches 3 dense garbage rows into enemy field.</div>
                </div>
              </div>
            </div>
          </section>

          {/* Wacky Chaos Glitches */}
          <section>
            <h3 className="font-orbitron font-bold text-slate-200 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              WACKY CHAOS REALITY GLITCHES
            </h3>
            <p className="text-slate-400 text-xs mb-2">
              Every 5 turns in Chaos Mode, a reality rupture triggers:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              <li><strong>Control Reversal</strong>: Steering inverted (Left is Right, Right is Left).</li>
              <li><strong>Giganto-Bomb Injection</strong>: Both players receive a massive 3x3 block detonating a 6x6 blast!</li>
              <li><strong>Field Quake</strong>: Tremor shatters random blocks across both stacks.</li>
              <li><strong>Blackout</strong>: Tactical sensor blackout where only active piece / ghost illuminates.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-bold text-xs tracking-wider transition-all"
          >
            ACKNOWLEDGE & RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
