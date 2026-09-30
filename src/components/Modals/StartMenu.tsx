import React, { useState } from 'react';
import { GameMode, MatchPlayerMode, AIDifficulty, ViewMode } from '../../types';
import { GAME_MODES } from '../../constants';
import { Swords, Flame, Trophy, Activity, Sparkles, User, Users, Cpu, Settings, BookOpen, Volume2, VolumeX, Play, X, AlertTriangle, RotateCcw } from 'lucide-react';

interface StartMenuProps {
  isOpen: boolean;
  isGameActive?: boolean;
  selectedMode: GameMode;
  matchMode: MatchPlayerMode;
  aiDifficulty: AIDifficulty;
  viewMode: ViewMode;
  blitzEnabled: boolean;
  blitzDuration: number;
  scoreAttackLimit: number;
  isMuted: boolean;
  musicEnabled: boolean;
  onResumeGame?: () => void;
  onSelectMode: (mode: GameMode) => void;
  onSelectMatchMode: (matchMode: MatchPlayerMode) => void;
  onSelectDifficulty: (diff: AIDifficulty) => void;
  onSelectViewMode: (viewMode: ViewMode) => void;
  onToggleBlitz: () => void;
  onSelectBlitzDuration: (duration: number) => void;
  onSelectScoreAttackLimit: (limit: number) => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onStartGame: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  isGameActive = false,
  selectedMode,
  matchMode,
  aiDifficulty,
  viewMode,
  blitzEnabled,
  blitzDuration,
  scoreAttackLimit,
  isMuted,
  musicEnabled,
  onResumeGame,
  onSelectMode,
  onSelectMatchMode,
  onSelectDifficulty,
  onSelectViewMode,
  onToggleBlitz,
  onSelectBlitzDuration,
  onSelectScoreAttackLimit,
  onToggleMute,
  onToggleMusic,
  onOpenRules,
  onOpenSettings,
  onStartGame,
}) => {
  const [showConfirmRestart, setShowConfirmRestart] = useState<boolean>(false);

  if (!isOpen) return null;
  const getModeIcon = (id: string) => {
    switch (id) {
      case 'versus':
        return <Swords className="w-5 h-5" />;
      case 'war':
        return <Flame className="w-5 h-5" />;
      case 'score_attack':
        return <Trophy className="w-5 h-5" />;
      case 'survival':
        return <Activity className="w-5 h-5" />;
      case 'wacky_chaos':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Swords className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07080D]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      {/* Decorative Cyber Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,243,255,0.1)_0%,transparent_60%),radial-gradient(ellipse_at_bottom,rgba(255,0,127,0.1)_0%,transparent_60%)] pointer-events-none" />

      {/* Top Header Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {isGameActive && onResumeGame && (
          <button
            onClick={onResumeGame}
            aria-label="Resume Battle"
            className="p-2 px-3 rounded-lg bg-cyan-950/90 border border-cyan-400 text-cyan-300 hover:bg-cyan-900 shadow-[0_0_15px_rgba(0,243,255,0.4)] text-xs font-mono font-bold flex items-center gap-1.5 transition-all animate-pulse"
          >
            <Play className="w-3.5 h-3.5 fill-cyan-400" />
            <span>RESUME</span>
          </button>
        )}

        <button
          onClick={onToggleMusic}
          className={`p-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
            musicEnabled
              ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(188,19,254,0.3)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}
          title="Toggle Procedural Synthwave Music"
        >
          {musicEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">SYNTH MUSIC</span>
        </button>

        <button
          onClick={onOpenRules}
          className="p-2 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5 text-xs font-mono"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">INTEL / RULES</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>

        {isGameActive && onResumeGame && (
          <button
            onClick={onResumeGame}
            aria-label="Close Menu and Resume"
            className="p-2 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-rose-400 text-slate-400 hover:text-rose-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative w-full max-w-4xl my-auto flex flex-col items-center z-10">
        {/* Game Title */}
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-0.5 rounded-full text-[11px] font-mono tracking-widest uppercase bg-cyan-950/80 border border-cyan-400 text-cyan-300 mb-2 shadow-[0_0_12px_rgba(0,243,255,0.4)]">
            OVERDRIVE EDITION // BLOCK WARS 2
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-orbitron font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-500 neon-glow-cyan">
            SYNCHROBLOCK DUEL
          </h1>
          <p className="text-xs sm:text-sm font-rajdhani font-semibold tracking-widest text-slate-400 uppercase mt-1">
            Simultaneous Competitive Cyberpunk Neon Block Battle
          </p>
        </div>

        {/* Section 1: Game Modes Grid */}
        <div className="w-full mb-6">
          <div className="text-xs font-orbitron font-bold tracking-wider text-slate-400 uppercase mb-2 px-1 flex items-center justify-between">
            <span>SELECT DUEL PROTOCOL:</span>
            <span className="text-cyan-400 font-mono text-[11px]">{GAME_MODES.find(m => m.id === selectedMode)?.tagline}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {GAME_MODES.map((m) => {
              const isSelected = selectedMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMode(m.id as GameMode)}
                  className={`relative p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 ${
                    isSelected
                      ? `bg-slate-900/90 border-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.35)] scale-[1.02]`
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900 text-slate-400'}`}>
                        {getModeIcon(m.id)}
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f3ff]" />
                      )}
                    </div>
                    <div className="font-orbitron font-bold text-sm text-slate-100">{m.title}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {m.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Player & Match Setup */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {/* Match Opponent */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs font-orbitron font-bold text-slate-300 mb-2 uppercase">
              Combatants
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'p1_vs_ai', label: '1P vs AI', icon: <User className="w-3.5 h-3.5" /> },
                { id: 'p1_vs_p2', label: '2P Local', icon: <Users className="w-3.5 h-3.5" /> },
                { id: 'ai_vs_ai', label: 'AI vs AI', icon: <Cpu className="w-3.5 h-3.5" /> },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSelectMatchMode(opt.id as MatchPlayerMode)}
                  className={`p-2 rounded-lg border text-xs font-mono font-bold flex flex-col items-center gap-1 transition-all ${
                    matchMode === opt.id
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,243,255,0.3)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* AI Difficulty Selector (if AI involved) */}
            {matchMode !== 'p1_vs_p2' && (
              <div className="mt-3 pt-2.5 border-t border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 mb-1.5 flex justify-between">
                  <span>AI DIFFICULTY:</span>
                  <span className="text-cyan-400 font-bold">{aiDifficulty.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => onSelectDifficulty(diff)}
                      className={`py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                        aiDifficulty === diff
                          ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                          : 'bg-slate-950/40 border border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View Mode Architecture */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs font-orbitron font-bold text-slate-300 mb-2 uppercase">
              Field Orientation
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectViewMode('tabletop_duel')}
                className={`p-2.5 rounded-lg border text-xs font-mono font-bold flex flex-col items-center gap-1 text-center transition-all ${
                  viewMode === 'tabletop_duel'
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,243,255,0.3)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-orbitron">TABLETOP DUEL</span>
                <span className="text-[10px] text-cyan-400 font-normal">Head-to-Head (Default)</span>
              </button>

              <button
                onClick={() => onSelectViewMode('arena_split')}
                className={`p-2.5 rounded-lg border text-xs font-mono font-bold flex flex-col items-center gap-1 text-center transition-all ${
                  viewMode === 'arena_split'
                    ? 'bg-pink-950/80 border-pink-400 text-pink-300 shadow-[0_0_12px_rgba(255,0,127,0.3)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-orbitron">ARENA SPLIT</span>
                <span className="text-[10px] text-slate-400 font-normal">Side-by-Side (Desktop)</span>
              </button>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-2">
              {viewMode === 'tabletop_duel'
                ? 'Head-to-head opposing clash: Player 2 inverted 180° for 2 players facing each other on one phone or tablet.'
                : 'Standard side-by-side vertical drop boards with central laser clash HUD.'}
            </div>
          </div>

          {/* Mode-Specific Modifiers */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs font-orbitron font-bold text-slate-300 mb-2 uppercase">
              Modifiers & Pacing
            </div>

            {/* Blitz Timer */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-300">BLITZ TIMER (5s)</span>
              <button
                onClick={onToggleBlitz}
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                  blitzEnabled
                    ? 'bg-rose-950/90 border border-rose-500 text-rose-300 shadow-[0_0_8px_#ff2a55]'
                    : 'bg-slate-950 border border-slate-800 text-slate-500'
                }`}
              >
                {blitzEnabled ? 'ACTIVE' : 'OFF'}
              </button>
            </div>

            {blitzEnabled && (
              <div className="grid grid-cols-4 gap-1 mb-2">
                {[3, 5, 8, 10].map(s => (
                  <button
                    key={s}
                    onClick={() => onSelectBlitzDuration(s)}
                    className={`py-0.5 rounded text-[10px] font-mono font-bold ${
                      blitzDuration === s
                        ? 'bg-rose-500/20 border border-rose-400 text-rose-300'
                        : 'bg-slate-950/40 border border-slate-800 text-slate-500'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            )}

            {/* Score Attack Piece Limit */}
            {selectedMode === 'score_attack' && (
              <div className="mt-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">PIECE QUOTA:</span>
                <div className="grid grid-cols-3 gap-1">
                  {[25, 50, 100].map(limit => (
                    <button
                      key={limit}
                      onClick={() => onSelectScoreAttackLimit(limit)}
                      className={`py-0.5 rounded text-[10px] font-mono font-bold ${
                        scoreAttackLimit === limit
                          ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                          : 'bg-slate-950/40 border border-slate-800 text-slate-500'
                      }`}
                    >
                      {limit} PIECES
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Launch / Resume / Restart Actions */}
        {isGameActive ? (
          showConfirmRestart ? (
            <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-950/95 border border-rose-500/70 shadow-[0_0_30px_rgba(244,63,94,0.3)] max-w-md w-full animate-fadeIn">
              <div className="flex items-center gap-2 text-rose-400 font-orbitron font-bold text-xs uppercase">
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>QUIT CURRENT DUEL & RESTART?</span>
              </div>
              <p className="text-xs font-mono text-slate-300 text-center">
                An active duel is currently paused. Starting a new match will reset all progress and board states.
              </p>
              <div className="flex items-center gap-3 w-full justify-center mt-1">
                <button
                  onClick={() => {
                    setShowConfirmRestart(false);
                    onStartGame();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-orbitron font-bold text-xs tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                >
                  CONFIRM NEW MATCH
                </button>
                <button
                  onClick={() => setShowConfirmRestart(false)}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-orbitron font-bold text-xs tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg justify-center">
              {onResumeGame && (
                <button
                  onClick={onResumeGame}
                  className="w-full sm:w-auto flex-1 group relative px-7 py-3.5 rounded-xl font-orbitron font-black text-sm sm:text-base tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 shadow-[0_0_30px_rgba(0,243,255,0.6)] hover:shadow-[0_0_50px_rgba(0,243,255,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>RESUME BATTLE</span>
                </button>
              )}

              <button
                onClick={() => setShowConfirmRestart(true)}
                className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-xl font-orbitron font-bold text-xs sm:text-sm tracking-wider text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-pink-500 hover:text-pink-300 shadow-md hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-pink-400" />
                <span>NEW MATCH</span>
              </button>
            </div>
          )
        ) : (
          <button
            onClick={onStartGame}
            className="group relative px-8 py-3.5 rounded-xl font-orbitron font-black text-lg tracking-wider text-slate-900 bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-400 shadow-[0_0_30px_rgba(0,243,255,0.6)] hover:shadow-[0_0_50px_rgba(255,0,127,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>ENGAGE BATTLE</span>
          </button>
        )}
      </div>
    </div>
  );
};
