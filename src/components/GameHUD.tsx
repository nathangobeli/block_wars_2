import React from 'react';
import { PlayerState, Piece, GameState, AbilityType } from '../types';
import { ABILITIES, SPECIAL_BLOCK_INFO } from '../constants';
import { Flame, Shield, ArrowDownToLine, EyeOff, Radiation, Timer, Zap, Trophy, Sparkles } from 'lucide-react';

interface GameHUDProps {
  p1: PlayerState;
  p2: PlayerState;
  gameState: GameState;
  onActivateAbility: (playerId: 'p1' | 'p2', ability: AbilityType) => void;
  onOpenSettings: () => void;
  onTogglePause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  p1,
  p2,
  gameState,
  onActivateAbility,
  onOpenSettings,
  onTogglePause,
}) => {
  const { nextPiece, blitzTimerEnabled, blitzDuration, blitzTimeRemaining, mode, activeWackyEvent } = gameState;

  // Render mini preview matrix for next piece
  const renderNextPiecePreview = (piece: Piece | null) => {
    if (!piece) return null;
    const isSpecial = piece.isSpecial;
    const shape = piece.shape;

    return (
      <div className="flex flex-col items-center">
        <div
          className="grid gap-[2px] p-2 rounded bg-slate-950/80 border border-slate-800 shadow-inner"
          style={{
            gridTemplateRows: `repeat(${shape.length}, 1fr)`,
            gridTemplateColumns: `repeat(${shape[0].length}, 1fr)`,
          }}
        >
          {shape.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[2px]"
                style={{
                  backgroundColor: val ? piece.color : 'transparent',
                  boxShadow: val ? `0 0 6px ${piece.color}80` : 'none',
                }}
              />
            ))
          )}
        </div>

        {/* Special piece badge */}
        {isSpecial && piece.type in SPECIAL_BLOCK_INFO && (
          <div className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-orbitron font-bold tracking-wider bg-rose-950/90 border border-rose-500 text-rose-300 animate-pulse text-center">
            {SPECIAL_BLOCK_INFO[piece.type].badge}
          </div>
        )}
      </div>
    );
  };

  // Render ability button
  const renderAbilityButton = (player: PlayerState, abilityKey: AbilityType) => {
    const ability = ABILITIES[abilityKey];
    const canUse = player.warMeter >= ability.cost && gameState.isPlaying && !gameState.isGameOver;
    const isP1 = player.id === 'p1';

    const getHotkey = () => {
      if (isP1) {
        if (abilityKey === 'aegis_shield') return 'Q';
        if (abilityKey === 'plasma_push') return 'E';
      } else {
        if (abilityKey === 'plasma_push') return '/';
      }
      return null;
    };

    const hotkey = getHotkey();

    const getIcon = () => {
      switch (abilityKey) {
        case 'aegis_shield':
          return <Shield className="w-3.5 h-3.5" />;
        case 'board_push':
          return <ArrowDownToLine className="w-3.5 h-3.5" />;
        case 'mirage_cloak':
          return <EyeOff className="w-3.5 h-3.5" />;
        case 'plasma_push':
          return <Radiation className="w-3.5 h-3.5" />;
      }
    };

    return (
      <button
        key={abilityKey}
        disabled={!canUse}
        onClick={() => onActivateAbility(player.id, abilityKey)}
        title={`${ability.name} (${hotkey ? `Hotkey: ${hotkey} • ` : ''}${ability.cost}% War Meter): ${ability.description}`}
        className={`px-1.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
          canUse
            ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(255,170,0,0.4)] hover:bg-amber-500/40 hover:scale-105 active:scale-95 animate-pulse'
            : 'bg-slate-900/60 border border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
        }`}
      >
        {getIcon()}
        <span className="hidden sm:inline">{ability.name.split(' ')[0]}</span>
        {hotkey && (
          <span className="ml-0.5 px-1 py-0.2 rounded bg-slate-800 text-[8px] text-amber-400 border border-amber-500/30">
            {hotkey}
          </span>
        )}
      </button>
    );
  };

  const blitzProgress = blitzTimerEnabled
    ? Math.max(0, Math.min(100, (blitzTimeRemaining / (blitzDuration * 1000)) * 100))
    : 100;

  return (
    <div className="w-full max-w-5xl mx-auto px-2 select-none">
      {/* Active Wacky Glitch Event Banner */}
      {activeWackyEvent && (
        <div className="mb-2 py-1 px-3 rounded-lg bg-pink-950/80 border border-pink-500 shadow-[0_0_15px_rgba(255,0,127,0.4)] flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
            <span className="text-xs font-orbitron font-bold text-pink-300">
              GLITCH: {activeWackyEvent.title.toUpperCase()}
            </span>
            <span className="text-[11px] font-mono text-pink-200 hidden md:inline">
              — {activeWackyEvent.description}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-pink-400 bg-pink-900/60 px-2 py-0.5 rounded border border-pink-700">
            {activeWackyEvent.turnsRemaining} TURNS REMAINING
          </span>
        </div>
      )}

      {/* Blitz Countdown Bar */}
      {blitzTimerEnabled && (
        <div className="mb-2 w-full bg-slate-950/90 rounded-full h-2 border border-slate-800 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-100 ${
              blitzProgress < 30
                ? 'bg-rose-500 shadow-[0_0_10px_#ff2a55]'
                : blitzProgress < 60
                ? 'bg-amber-400 shadow-[0_0_10px_#ffaa00]'
                : 'bg-cyan-400 shadow-[0_0_10px_#00f3ff]'
            }`}
            style={{ width: `${blitzProgress}%` }}
          />
        </div>
      )}

      {/* Main HUD Row */}
      <div className="grid grid-cols-3 items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-2xl">
        {/* Player 1 Stats */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <div className="text-sm sm:text-base font-orbitron font-extrabold text-cyan-400">
              {p1.score.toLocaleString()}
            </div>
            {p1.combo > 1 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400 text-amber-300 text-[10px] font-bold animate-bounce">
                COMBO x{p1.combo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>LINES: <strong className="text-slate-200">{p1.lines}</strong></span>
            {mode === 'score_attack' && (
              <span>PIECE: <strong className="text-cyan-300">{p1.stats.piecesDropped}/{gameState.scoreAttackLimit}</strong></span>
            )}
          </div>

          {/* P1 War Meter (Visible in both War and Versus Duel) */}
          {(mode === 'war' || mode === 'versus') && (
            <div className="w-full max-w-[170px] mt-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400 mb-0.5">
                <span title="Clear lines to charge War Meter and deploy tactical combat abilities">
                  WAR METER
                </span>
                <span className={p1.warMeter >= 100 ? 'text-amber-400 font-bold animate-pulse' : ''}>
                  {p1.warMeter}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    p1.warMeter >= 100
                      ? 'bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_8px_#ffaa00] animate-pulse'
                      : 'bg-cyan-500'
                  }`}
                  style={{ width: `${p1.warMeter}%` }}
                />
              </div>
              {/* P1 Abilities */}
              <div className="flex gap-1 mt-1 flex-wrap">
                {(['aegis_shield', 'plasma_push'] as AbilityType[]).map(key =>
                  renderAbilityButton(p1, key)
                )}
              </div>
            </div>
          )}
        </div>

        {/* Center: Synchro Next Piece & Blitz Timer */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-[10px] font-orbitron tracking-widest text-slate-400 uppercase mb-1">
            SYNCHRO NEXT
          </div>
          {renderNextPiecePreview(nextPiece)}

          {blitzTimerEnabled && (
            <div className="flex items-center gap-1 mt-1 text-xs font-mono text-cyan-400">
              <Timer className="w-3.5 h-3.5" />
              <span>{(blitzTimeRemaining / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>

        {/* Player 2 Stats */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            {p2.combo > 1 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400 text-amber-300 text-[10px] font-bold animate-bounce">
                COMBO x{p2.combo}
              </span>
            )}
            <div className="text-sm sm:text-base font-orbitron font-extrabold text-pink-400">
              {p2.score.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>LINES: <strong className="text-slate-200">{p2.lines}</strong></span>
            {mode === 'score_attack' && (
              <span>PIECE: <strong className="text-pink-300">{p2.stats.piecesDropped}/{gameState.scoreAttackLimit}</strong></span>
            )}
          </div>

          {/* P2 War Meter (Visible in both War and Versus Duel) */}
          {(mode === 'war' || mode === 'versus') && (
            <div className="w-full max-w-[170px] mt-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-pink-400 mb-0.5">
                <span title="Clear lines to charge War Meter and deploy tactical combat abilities">
                  WAR METER
                </span>
                <span className={p2.warMeter >= 100 ? 'text-amber-400 font-bold animate-pulse' : ''}>
                  {p2.warMeter}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    p2.warMeter >= 100
                      ? 'bg-gradient-to-r from-amber-400 to-pink-500 shadow-[0_0_8px_#ff007f] animate-pulse'
                      : 'bg-pink-500'
                  }`}
                  style={{ width: `${p2.warMeter}%` }}
                />
              </div>
              {/* P2 Abilities */}
              {!p2.isAI && (
                <div className="flex gap-1 mt-1 justify-end flex-wrap">
                  {(['aegis_shield', 'plasma_push'] as AbilityType[]).map(key =>
                    renderAbilityButton(p2, key)
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
