import React, { useState, useEffect, useCallback } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { GameMode, MatchPlayerMode, AIDifficulty, ViewMode } from './types';
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
import { Settings, BookOpen, Volume2, VolumeX, Pause, Play, RefreshCw, Home, Shield, Swords } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<ViewMode>('arena_split');
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

  return (
    <div className="relative min-h-screen w-full bg-[#08090E] text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Perspective Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-70 pointer-events-none" />

      {/* Global Particle & FX Canvas Overlay */}
      <FXCanvas onRegisterTriggers={registerFXTriggers} />

      {/* Top Cyber Navigation Bar */}
      <header className="relative z-30 w-full px-3 py-2 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReturnMenu}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-pink-500 p-[1.5px] shadow-[0_0_12px_rgba(0,243,255,0.4)]">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                <Swords className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-orbitron font-extrabold text-sm sm:text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                SYNCHROBLOCK
              </span>
              <span className="text-[10px] font-mono text-cyan-400/80 block -mt-1 tracking-widest">
                OVERDRIVE // B2
              </span>
            </div>
          </button>

          <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-orbitron uppercase bg-slate-900 border border-slate-700 text-slate-300 ml-2">
            {gameState.mode.replace('_', ' ')}
          </span>
        </div>

        {/* Center: Turn Counter */}
        {gameState.isPlaying && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-cyan-400 font-bold">TURN {gameState.turnCount}</span>
            {gameState.isPaused && (
              <span className="text-amber-400 font-bold ml-2 animate-pulse">[PAUSED]</span>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {gameState.isPlaying && (
            <button
              onClick={togglePause}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-all"
              title="Pause Game (Esc / P)"
            >
              {gameState.isPaused ? <Play className="w-4 h-4 text-cyan-400" /> : <Pause className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={handleToggleMusic}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
              musicEnabled
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle Procedural Synthwave Music"
          >
            {musicEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsRulesOpen(true)}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-all"
            title="Rules & Intel"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-all"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={handleReturnMenu}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-pink-400 transition-all"
            title="Return to Menu"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Duel Playing Area */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-2 sm:p-4 max-w-7xl mx-auto w-full">
        {/* Game HUD Panel */}
        <div className="w-full mb-3">
          <GameHUD
            p1={p1}
            p2={p2}
            gameState={gameState}
            onActivateAbility={activateAbility}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onTogglePause={togglePause}
          />
        </div>

        {/* View Mode 1: Arena Split (Side-by-Side Vertical Boards) */}
        {viewMode === 'arena_split' && (
          <div className="relative flex items-center justify-center gap-1 sm:gap-4 w-full">
            {/* Player 1 Board */}
            <div className="flex flex-col items-center">
              <Playfield player={p1} viewMode="arena_split" />
              {/* Virtual Controls for Player 1 (Desktop can also click, mobile touch) */}
              <div className="mt-2 block">
                <VirtualControls
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

            {/* Central Electric High-Voltage Plasma Laser Clash Divider */}
            <ClashDivider
              clashBalance={gameState.clashBalance}
              orientation="vertical"
              lastAttacker={lastAttacker}
            />

            {/* Player 2 Board */}
            <div className="flex flex-col items-center">
              <Playfield player={p2} isOpponent viewMode="arena_split" />
              {/* Virtual Controls for Player 2 (if 2P Local mode) */}
              {!p2.isAI ? (
                <div className="mt-2 block">
                  <VirtualControls
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
                <div className="mt-2 py-3 text-center text-xs font-mono text-slate-500">
                  // CYBER-AI CONTROLLER ENGAGED //
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Mode 2: Tabletop Duel (Opposing Head-to-Head Clash for iPad/Tablet) */}
        {viewMode === 'tabletop_duel' && (
          <div className="relative flex flex-col items-center justify-center gap-2 w-full max-w-lg">
            {/* Player 2 (Top, Inverted 180°) */}
            <div className="flex flex-col items-center">
              {!p2.isAI && (
                <div className="mb-2 block rotate-180">
                  <VirtualControls
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
              )}
              <Playfield player={p2} isOpponent viewMode="tabletop_duel" isP2Tabletop />
            </div>

            {/* Horizontal Clash Laser Line */}
            <ClashDivider
              clashBalance={gameState.clashBalance}
              orientation="horizontal"
              lastAttacker={lastAttacker}
            />

            {/* Player 1 (Bottom) */}
            <div className="flex flex-col items-center">
              <Playfield player={p1} viewMode="tabletop_duel" />
              <div className="mt-2 block">
                <VirtualControls
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

      {/* Cyberpunk Footer Status Bar */}
      <footer className="relative z-20 w-full px-4 py-1.5 border-t border-slate-900 bg-slate-950/80 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <div>
          <span>SYNCHROBLOCK DUEL // PROTOCOL: {gameState.mode.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>P1: [W/A/S/D + SPACE]</span>
          <span className="hidden sm:inline">P2: [ARROWS + ENTER]</span>
          <span className="text-cyan-400 font-bold">WEB AUDIO API NATIVE</span>
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
