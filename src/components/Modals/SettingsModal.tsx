import React from 'react';
import { ViewMode } from '../../types';
import { X, Volume2, VolumeX, Sliders, Monitor, Eye } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  isMuted: boolean;
  musicEnabled: boolean;
  blitzEnabled: boolean;
  blitzDuration: number;
  viewMode: ViewMode;
  onClose: () => void;
  onSetMasterVolume: (val: number) => void;
  onSetSfxVolume: (val: number) => void;
  onSetMusicVolume: (val: number) => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleBlitz: () => void;
  onSetBlitzDuration: (val: number) => void;
  onSetViewMode: (val: ViewMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  masterVolume,
  sfxVolume,
  musicVolume,
  isMuted,
  musicEnabled,
  blitzEnabled,
  blitzDuration,
  viewMode,
  onClose,
  onSetMasterVolume,
  onSetSfxVolume,
  onSetMusicVolume,
  onToggleMute,
  onToggleMusic,
  onToggleBlitz,
  onSetBlitzDuration,
  onSetViewMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_40px_rgba(0,243,255,0.25)] text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-orbitron font-bold tracking-wider text-cyan-300">
              AUDIO & SYSTEM CONFIG
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Master Volume */}
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span>MASTER GAIN</span>
              <span>{Math.round(masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => onSetMasterVolume(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-950 rounded cursor-pointer"
            />
          </div>

          {/* SFX Volume */}
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span>SFX VOLUME</span>
              <span>{Math.round(sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sfxVolume}
              onChange={(e) => onSetSfxVolume(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-950 rounded cursor-pointer"
            />
          </div>

          {/* Music Volume */}
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span>PROCEDURAL SYNTHWAVE MUSIC</span>
              <span>{Math.round(musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(e) => onSetMusicVolume(parseFloat(e.target.value))}
              className="w-full accent-purple-400 h-1.5 bg-slate-950 rounded cursor-pointer"
            />
          </div>

          {/* Audio Toggles */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onToggleMute}
              className={`p-2.5 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                isMuted
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
            </button>

            <button
              onClick={onToggleMusic}
              className={`p-2.5 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                musicEnabled
                  ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(188,19,254,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span>{musicEnabled ? 'SYNTH MUSIC: ON' : 'SYNTH MUSIC: OFF'}</span>
            </button>
          </div>

          {/* View Mode Configuration */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs font-orbitron font-bold text-slate-300 mb-2">
              DISPLAY LAYOUT
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSetViewMode('arena_split')}
                className={`p-2 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-1.5 ${
                  viewMode === 'arena_split'
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>ARENA SPLIT</span>
              </button>

              <button
                onClick={() => onSetViewMode('tabletop_duel')}
                className={`p-2 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-1.5 ${
                  viewMode === 'tabletop_duel'
                    ? 'bg-pink-950/80 border-pink-400 text-pink-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>TABLETOP DUEL</span>
              </button>
            </div>
          </div>

          {/* Blitz Timer Config */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-orbitron font-bold text-slate-300">BLITZ TIMER PROTOCOL</span>
              <button
                onClick={onToggleBlitz}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  blitzEnabled
                    ? 'bg-rose-950/80 border border-rose-500 text-rose-300'
                    : 'bg-slate-950 border border-slate-800 text-slate-500'
                }`}
              >
                {blitzEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {blitzEnabled && (
              <div className="grid grid-cols-4 gap-1">
                {[3, 5, 8, 10].map(s => (
                  <button
                    key={s}
                    onClick={() => onSetBlitzDuration(s)}
                    className={`py-1 rounded text-xs font-mono font-bold ${
                      blitzDuration === s
                        ? 'bg-rose-500/20 border border-rose-400 text-rose-300'
                        : 'bg-slate-950/40 border border-slate-800 text-slate-500'
                    }`}
                  >
                    {s} SEC
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-bold text-xs tracking-wider transition-all"
          >
            CONFIRM & RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
