import React, { useState, useEffect, useCallback } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { GameMode, MatchPlayerMode, AIDifficulty, ViewMode, Piece, PlayerState } from './types';
import { soundEngine } from './audio/SoundEngine';
import { FXCanvas } from './components/FXCanvas';
import { Playfield } from './components/Playfield';
import { ClashDivider } from './components/ClashDivider';
import { GameHUD } from './components/GameHUD';
import { VirtualControls } from './components/VirtualControls';
import { StartMenu } from './components/Modals/StartMenu';
import { SettingsModal } from './components/Modals/SettingsModal';
import { RulesModal } from './components/Modals/RulesModal';
import { GameOverModal } from './components/Modals/GameOverModal';
import { Settings, BookOpen, Volume2, VolumeX, Pause, Play, RefreshCw, Home, Shield, Swords, Zap } from 'lucide-react';

export function App() {
  const {
    gameState,
    p1,
    p2,
    lastAttacker,
    registerFXTriggers,
    startMatch,
    movePiece,
    rotatePiece,
    softDrop,
    lockInPiece,
    activateAbility,
    togglePause,
  } = useGameEngine();

  // Menu & Setup Options
  const [selectedMode, setSelectedMode] = useState<GameMode>('versus');
  const [matchMode, setMatchMode] = useState<MatchPlayerMode>('p1_vs_ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [viewMode, setViewMode] = useState<ViewMode>('tabletop_duel');
  const [blitzEnabled, setBlitzEnabled] = useState<boolean>(false);
  const [blitzDuration, setBlitzDuration] = useState<number>(5);
  const [scoreAttackLimit, setScoreAttackLimit] = useState<number>(50);

  // Audio state
  const [masterVolume, setMasterVolume] = useState<number>(0.8);
  const [sfxVolume, setSfxVolume] = useState<number>(0.8);
  const [musicVolume, setMusicVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(true);

  // Modals
  const [isStartMenuOpen, setIsStartMenuOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

  // Audio Handlers
  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const handleToggleMusic = useCallback(() => {
    setMusicEnabled(prev => {
      const next = !prev;
      soundEngine.toggleMusic(next);
      return next;
    });
  }, []);

  const handleSetMasterVolume = useCallback((val: number) => {
    setMasterVolume(val);
    soundEngine.setMasterVolume(val);
  }, []);

  const handleSetSfxVolume = useCallback((val: number) => {
    setSfxVolume(val);
    soundEngine.setSfxVolume(val);
  }, []);

  const handleSetMusicVolume = useCallback((val: number) => {
    setMusicVolume(val);
    soundEngine.setMusicVolume(val);
  }, []);

  // Launch Game
  const handleStartGame = useCallback(() => {
    setIsStartMenuOpen(false);
    startMatch(
      selectedMode,
      matchMode,
      aiDifficulty,
      viewMode,
      blitzEnabled,
      blitzDuration,
      scoreAttackLimit
    );
    if (musicEnabled) {
      soundEngine.toggleMusic(true);
    }
  }, [
    selectedMode,
    matchMode,
    aiDifficulty,
    viewMode,
    blitzEnabled,
    blitzDuration,
    scoreAttackLimit,
    musicEnabled,
    startMatch,
  ]);

  const handleRematch = useCallback(() => {
    handleStartGame();
  }, [handleStartGame]);

  const handleReturnMenu = useCallback(() => {
    setIsStartMenuOpen(true);
  }, []);

  // Keyboard Event Listeners for Dual Desktop Control
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on arrows/space
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      // Player 1 Keys (WASD + Space + Q/E)
      if (!p1.isAI) {
        if (e.code === 'KeyA') movePiece('p1', -1);
        else if (e.code === 'KeyD') movePiece('p1', 1);
        else if (e.code === 'KeyW') rotatePiece('p1');
        else if (e.code === 'KeyS') softDrop('p1');
        else if (e.code === 'Space') lockInPiece('p1');
        else if (e.code === 'KeyQ') activateAbility('p1', 'aegis_shield');
        else if (e.code === 'KeyE') activateAbility('p1', 'plasma_push');
      }

      // Player 2 Keys (Arrows + Enter + Shift + /)
      if (!p2.isAI) {
        if (e.code === 'ArrowLeft') movePiece('p2', -1);
        else if (e.code === 'ArrowRight') movePiece('p2', 1);
        else if (e.code === 'ArrowUp') rotatePiece('p2');
        else if (e.code === 'ArrowDown') softDrop('p2');
        else if (e.code === 'Enter' || e.code === 'ShiftRight') lockInPiece('p2');
        else if (e.code === 'Slash' || e.code === 'Period') activateAbility('p2', 'plasma_push');
      }

      // Quick pause shortcut
      if (e.code === 'Escape' || e.code === 'KeyP') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState.isPlaying,
    gameState.isPaused,
    gameState.isGameOver,
    p1.isAI,
    p2.isAI,
    movePiece,
    rotatePiece,
    softDrop,
    lockInPiece,
    activateAbility,
    togglePause,
  ]);

  // Mini Next Piece Preview for Tabletop Hub
  const renderMiniNext = (piece: Piece | null) => {
    if (!piece) return null;
    const shape = piece.shape;
    return (
      <div
        className="grid gap-[1px] p-1 rounded bg-slate-950/90 border border-slate-700 shadow-inner"
        style={{
          gridTemplateRows: `repeat(${shape.length}, 1fr)`,
          gridTemplateColumns: `repeat(${shape[0].length}, 1fr)`,
        }}
      >
        {shape.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-[1px]"
              style={{
                backgroundColor: val ? piece.color : 'transparent',
                boxShadow: val ? `0 0 4px ${piece.color}` : 'none',
              }}
            />
          ))
        )}
      </div>
    );
  };

  // Tabletop Player Telemetry Sidecard - Matches Board Height & Fills Flank Screenspace
  const renderTabletopSidecard = (player: PlayerState) => {
    const isP1 = player.id === 'p1';
    const textColor = isP1 ? 'text-cyan-400' : 'text-pink-400';
    const borderColor = isP1 ? 'border-cyan-500/30' : 'border-pink-500/30';
    const glow = isP1 ? 'shadow-[0_0_12px_rgba(0,243,255,0.2)]' : 'shadow-[0_0_12px_rgba(255,0,127,0.2)]';
    const bgHeader = isP1 ? 'bg-cyan-950/60 text-cyan-300' : 'bg-pink-950/60 text-pink-300';

    return (
      <div
        className={`flex flex-col justify-between h-[clamp(225px,37dvh,355px)] sm:h-[clamp(260px,38dvh,420px)] py-1.5 px-2 rounded-lg bg-slate-950/90 border ${borderColor} ${glow} text-[10px] font-mono w-[105px] sm:w-[125px] shrink-0 select-none backdrop-blur-sm`}
      >
        {/* Top: Score & Stats */}
        <div>
          <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800">
            <span className={`px-1 py-0.2 rounded text-[8px] font-orbitron font-bold uppercase truncate max-w-[70px] ${bgHeader}`}>
              {player.name}
            </span>
            <span className="text-[8px] text-slate-500 font-bold">
              LV.{Math.floor(player.lines / 10) + 1}
            </span>
          </div>

          <div className="text-[8px] font-orbitron text-slate-400 uppercase tracking-wider">SCORE</div>
          <div className={`font-orbitron font-extrabold text-sm sm:text-base ${textColor} tracking-tight leading-none mb-1 truncate`}>
            {player.score.toLocaleString()}
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-400">
            <span>LINES</span>
            <strong className="text-slate-200 font-bold">{player.lines}</strong>
          </div>

          {player.combo > 1 && (
            <div className="text-[8px] text-amber-300 font-bold bg-amber-950/80 border border-amber-500/50 px-1 py-0.5 rounded mt-1 text-center animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              🔥 STREAK x{player.combo}
            </div>
          )}

          {player.pendingGarbage > 0 && (
            <div className="text-[8px] text-rose-300 font-bold bg-rose-950/90 border border-rose-500/60 px-1 py-0.5 rounded mt-1 text-center animate-bounce shadow-[0_0_8px_rgba(244,63,94,0.4)]">
              ⚠️ +{player.pendingGarbage} INCOMING
            </div>
          )}
        </div>

        {/* Bottom: Cyber War Ability Deck */}
        {gameState.mode === 'war' ? (
          <div className="mt-1 pt-1.5 border-t border-slate-800">
            <div className="flex justify-between items-center text-[8px] text-slate-400 mb-1">
              <span className="font-orbitron font-bold">WAR ENERGY</span>
              <span className={`font-bold ${player.warMeter >= 100 ? 'text-amber-400 animate-pulse' : textColor}`}>
                {player.warMeter}%
              </span>
            </div>

            {/* Glowing segmented meter */}
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden p-[1px] border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  player.warMeter >= 100
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_8px_#ffaa00] animate-pulse'
                    : isP1
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_6px_#00f3ff]'
                    : 'bg-gradient-to-r from-pink-600 to-pink-400 shadow-[0_0_6px_#ff007f]'
                }`}
                style={{ width: `${player.warMeter}%` }}
              />
            </div>

            {player.warMeter >= 100 ? (
              <div className="flex flex-col gap-1 mt-1.5">
                <button
                  type="button"
                  onClick={() => activateAbility(player.id, 'aegis_shield')}
                  className="w-full py-1 px-1 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 text-[8px] font-bold active:scale-95 shadow-[0_0_8px_rgba(0,243,255,0.4)] hover:bg-cyan-900 transition-colors flex items-center justify-center gap-1 cursor-pointer touch-manipulation"
                >
                  <Shield className="w-2.5 h-2.5 text-cyan-400" />
                  <span>AEGIS SHIELD</span>
                </button>
                <button
                  type="button"
                  onClick={() => activateAbility(player.id, 'plasma_push')}
                  className="w-full py-1 px-1 rounded bg-rose-950 border border-rose-400 text-rose-300 text-[8px] font-bold active:scale-95 shadow-[0_0_8px_rgba(244,63,94,0.4)] hover:bg-rose-900 transition-colors flex items-center justify-center gap-1 cursor-pointer touch-manipulation"
                >
                  <Zap className="w-2.5 h-2.5 text-rose-400" />
                  <span>PLASMA STRIKE</span>
                </button>
              </div>
            ) : (
              <div className="text-[7px] text-slate-500 text-center mt-1 uppercase font-bold tracking-tight">
                CLEAR LINES TO CHARGE
              </div>
            )}
          </div>
        ) : (
          <div className="mt-1 pt-1 border-t border-slate-800 text-[8px] text-slate-500 text-center font-orbitron">
            ARCADE DUEL
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] w-full bg-[#08090E] text-slate-100 flex flex-col justify-between overflow-hidden select-none touch-none">
      {/* Perspective Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-70 pointer-events-none" />

      {/* Global Particle & FX Canvas Overlay */}
      <FXCanvas onRegisterTriggers={registerFXTriggers} />

      {/* Top Cyber Navigation Bar (Only for Arena Split, or Collapsed in Tabletop) */}
      {viewMode === 'arena_split' ? (
        <header className="relative z-30 w-full px-3 py-1.5 h-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReturnMenu}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-pink-500 p-[1px] shadow-[0_0_8px_rgba(0,243,255,0.4)]">
                <div className="w-full h-full bg-slate-950 rounded flex items-center justify-center">
                  <Swords className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              </div>
              <span className="font-orbitron font-extrabold text-xs sm:text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                SYNCHROBLOCK
              </span>
            </button>
            <span className="hidden md:inline-block px-1.5 py-0.2 rounded text-[9px] font-orbitron uppercase bg-slate-900 border border-slate-700 text-slate-300 ml-1">
              {gameState.mode.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {gameState.isPlaying && (
              <button
                onClick={togglePause}
                className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300"
                title="Pause Game"
              >
                {gameState.isPaused ? <Play className="w-3.5 h-3.5 text-cyan-400" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            )}
            <button
              onClick={handleToggleMusic}
              className={`p-1.5 rounded border transition-all ${
                musicEnabled ? 'bg-purple-950/60 border-purple-500/50 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title="Toggle Synthwave Music"
            >
              {musicEnabled ? <Volume2 className="w-3.5 h-3.5 text-purple-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsRulesOpen(true)}
              className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300"
              title="Rules"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReturnMenu}
              className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-pink-400"
              title="Menu"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      ) : null}

      {/* Main Duel Playing Area - 100% Fit, Zero Scroll */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-between p-1 w-full h-full overflow-hidden max-w-4xl mx-auto">
        {/* VIEW MODE 1: ARENA SPLIT (Side-by-Side) */}
        {viewMode === 'arena_split' && (
          <div className="flex-1 flex flex-col items-center justify-between w-full h-full overflow-hidden">
            {/* Top HUD */}
            <div className="w-full shrink-0">
              <GameHUD
                p1={p1}
                p2={p2}
                gameState={gameState}
                onActivateAbility={activateAbility}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onTogglePause={togglePause}
              />
            </div>

            {/* Side-by-side Boards */}
            <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-4 w-full my-auto overflow-hidden">
              {/* P1 Board */}
              <div className="flex flex-col items-center justify-center max-w-[46vw]">
                <Playfield player={p1} viewMode="arena_split" />
                <div className="mt-1 block w-full">
                  <VirtualControls
                    compact
                    playerId="p1"
                    themeColor="cyan"
                    onMoveLeft={() => movePiece('p1', -1)}
                    onMoveRight={() => movePiece('p1', 1)}
                    onRotate={() => rotatePiece('p1')}
                    onDrop={() => softDrop('p1')}
                    onHardDrop={() => lockInPiece('p1')}
                    disabled={p1.isAI || p1.isReady || !gameState.isPlaying || gameState.isPaused}
                  />
                </div>
              </div>

              {/* Vertical Laser Divider */}
              <div className="h-[75%] flex items-center">
                <ClashDivider
                  clashBalance={gameState.clashBalance}
                  orientation="vertical"
                  lastAttacker={lastAttacker}
                />
              </div>

              {/* P2 Board */}
              <div className="flex flex-col items-center justify-center max-w-[46vw]">
                <Playfield player={p2} isOpponent viewMode="arena_split" />
                {!p2.isAI ? (
                  <div className="mt-1 block w-full">
                    <VirtualControls
                      compact
                      playerId="p2"
                      themeColor="pink"
                      onMoveLeft={() => movePiece('p2', -1)}
                      onMoveRight={() => movePiece('p2', 1)}
                      onRotate={() => rotatePiece('p2')}
                      onDrop={() => softDrop('p2')}
                      onHardDrop={() => lockInPiece('p2')}
                      disabled={p2.isReady || !gameState.isPlaying || gameState.isPaused}
                    />
                  </div>
                ) : (
                  <div className="mt-1 py-1 text-center text-[10px] font-mono text-slate-500">
                    // CYBER-AI //
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: TABLETOP DUEL (Head-to-Head Clash for 2 Players on Same Phone) */}
        {viewMode === 'tabletop_duel' && (
          <div className="flex-1 flex flex-col justify-between items-center w-full h-full max-w-md mx-auto py-0.5 overflow-hidden">
            {/* --- TOP HALF: PLAYER 2 (Inverted 180° for Opponent) --- */}
            <div className="rotate-180 flex-1 min-h-0 flex flex-col items-center justify-between w-full py-0.5">
              {/* P2 Virtual Controls (Right under P2 thumbs at the top edge) */}
              {!p2.isAI ? (
                <div className="shrink-0 mb-0.5 w-full flex justify-center">
                  <VirtualControls
                    compact
                    playerId="p2"
                    themeColor="pink"
                    onMoveLeft={() => movePiece('p2', -1)}
                    onMoveRight={() => movePiece('p2', 1)}
                    onRotate={() => rotatePiece('p2')}
                    onDrop={() => softDrop('p2')}
                    onHardDrop={() => lockInPiece('p2')}
                    disabled={p2.isReady || !gameState.isPlaying || gameState.isPaused}
                  />
                </div>
              ) : (
                <div className="text-[9px] font-mono text-pink-400 py-0.5 text-center shrink-0">
                  // AI ALPHA ACTIVE //
                </div>
              )}

              {/* P2 Board + Side Command Deck */}
              <div className="flex-1 min-h-0 flex items-center justify-center gap-1.5 sm:gap-2.5 my-auto">
                {renderTabletopSidecard(p2)}
                <Playfield compact player={p2} isOpponent viewMode="tabletop_duel" />
              </div>
            </div>

            {/* --- CENTER CLASH DIVIDER & SYNCHRO INFORMATION HUB --- */}
            <div className="relative w-full flex items-center justify-between px-2 my-0.5 shrink-0 z-30 h-8 sm:h-9">
              {/* Left Plasma Laser */}
              <div className="flex-1 h-1.5 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full shadow-[0_0_8px_#00f3ff]" />

              {/* Center Synchro Preview & Controls Capsule */}
              <div className="mx-2 px-2.5 py-0.5 rounded-full bg-slate-950/95 border border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.8)] flex items-center gap-2">
                {/* Floating Fast Utilities */}
                <button
                  onClick={togglePause}
                  className="p-1 rounded-full text-slate-400 hover:text-cyan-400 transition-colors"
                  title="Pause"
                >
                  {gameState.isPaused ? <Play className="w-3.5 h-3.5 text-cyan-400" /> : <Pause className="w-3.5 h-3.5" />}
                </button>

                {/* Synchro Next Piece Preview */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-orbitron font-bold text-slate-400">NEXT:</span>
                  {renderMiniNext(gameState.nextPiece)}
                </div>

                {/* Blitz Countdown */}
                {gameState.blitzTimerEnabled && (
                  <span className="text-[9px] font-mono font-bold text-cyan-400 animate-pulse">
                    {(gameState.blitzTimeRemaining / 1000).toFixed(1)}s
                  </span>
                )}

                <button
                  onClick={handleToggleMusic}
                  className="p-1 rounded-full text-slate-400 hover:text-purple-400 transition-colors"
                  title="Sound"
                >
                  {musicEnabled ? <Volume2 className="w-3.5 h-3.5 text-purple-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleReturnMenu}
                  className="p-1 rounded-full text-slate-400 hover:text-pink-400 transition-colors"
                  title="Menu"
                >
                  <Home className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Right Plasma Laser */}
              <div className="flex-1 h-1.5 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full shadow-[0_0_8px_#ff007f]" />
            </div>

            {/* --- BOTTOM HALF: PLAYER 1 (Facing Player 1) --- */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-between w-full py-0.5">
              {/* P1 Board + Side Command Deck */}
              <div className="flex-1 min-h-0 flex items-center justify-center gap-1.5 sm:gap-2.5 my-auto">
                <Playfield compact player={p1} viewMode="tabletop_duel" />
                {renderTabletopSidecard(p1)}
              </div>

              {/* P1 Virtual Controls (Right under P1 thumbs at bottom edge) */}
              <div className="shrink-0 mt-0.5 w-full flex justify-center">
                <VirtualControls
                  compact
                  playerId="p1"
                  themeColor="cyan"
                  onMoveLeft={() => movePiece('p1', -1)}
                  onMoveRight={() => movePiece('p1', 1)}
                  onRotate={() => rotatePiece('p1')}
                  onDrop={() => softDrop('p1')}
                  onHardDrop={() => lockInPiece('p1')}
                  disabled={p1.isAI || p1.isReady || !gameState.isPlaying || gameState.isPaused}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer (Only rendered on desktop / larger screens to save mobile height) */}
      <footer className="hidden sm:flex relative z-20 w-full px-4 py-1 border-t border-slate-900 bg-slate-950/80 text-[10px] font-mono text-slate-500 items-center justify-between">
        <div>
          <span>SYNCHROBLOCK DUEL // PROTOCOL: {gameState.mode.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>P1: [W/A/S/D + SPACE]</span>
          <span className="hidden md:inline">P2: [ARROWS + ENTER]</span>
          <span className="text-cyan-400 font-bold">ZERO SCROLL // 100% VIEWPORT</span>
        </div>
      </footer>

      {/* Modals */}
      <StartMenu
        isOpen={isStartMenuOpen}
        selectedMode={selectedMode}
        matchMode={matchMode}
        aiDifficulty={aiDifficulty}
        viewMode={viewMode}
        blitzEnabled={blitzEnabled}
        blitzDuration={blitzDuration}
        scoreAttackLimit={scoreAttackLimit}
        isMuted={isMuted}
        musicEnabled={musicEnabled}
        onSelectMode={setSelectedMode}
        onSelectMatchMode={setMatchMode}
        onSelectDifficulty={setAiDifficulty}
        onSelectViewMode={setViewMode}
        onToggleBlitz={() => setBlitzEnabled(prev => !prev)}
        onSelectBlitzDuration={setBlitzDuration}
        onSelectScoreAttackLimit={setScoreAttackLimit}
        onToggleMute={handleToggleMute}
        onToggleMusic={handleToggleMusic}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onStartGame={handleStartGame}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        masterVolume={masterVolume}
        sfxVolume={sfxVolume}
        musicVolume={musicVolume}
        isMuted={isMuted}
        musicEnabled={musicEnabled}
        blitzEnabled={blitzEnabled}
        blitzDuration={blitzDuration}
        viewMode={viewMode}
        onClose={() => setIsSettingsOpen(false)}
        onSetMasterVolume={handleSetMasterVolume}
        onSetSfxVolume={handleSetSfxVolume}
        onSetMusicVolume={handleSetMusicVolume}
        onToggleMute={handleToggleMute}
        onToggleMusic={handleToggleMusic}
        onToggleBlitz={() => setBlitzEnabled(prev => !prev)}
        onSetBlitzDuration={setBlitzDuration}
        onSetViewMode={setViewMode}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <GameOverModal
        isOpen={gameState.isGameOver}
        winner={gameState.winner}
        p1={p1}
        p2={p2}
        gameState={gameState}
        onRematch={handleRematch}
        onReturnMenu={handleReturnMenu}
      />
    </div>
  );
}

export default App;
