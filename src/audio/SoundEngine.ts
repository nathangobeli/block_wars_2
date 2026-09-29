/**
 * SoundEngine.ts - High-Performance Procedural Web Audio API Synthesizer
 * Zero external audio assets. 100% procedural synthesizers, noise generators,
 * harmonic chimes, sub-bass impacts, and dynamic synthwave arpeggiators.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private isMuted: boolean = false;
  private masterVolume: number = 0.8;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.5;

  // Music Generator State
  private isMusicPlaying: boolean = false;
  private musicIntervalId: number | null = null;
  private musicStep: number = 0;
  private isDangerMusic: boolean = false;
  private currentBpm: number = 124;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();

          // Master Chain
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);

          // SFX Bus
          this.sfxGain = this.ctx.createGain();
          this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
          this.sfxGain.connect(this.masterGain);

          // Music Bus
          this.musicGain = this.ctx.createGain();
          this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
          this.musicGain.connect(this.masterGain);
        }
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (err) {
      console.warn('AudioContext init error:', err);
    }
  }

  public resume() {
    this.initContext();
  }

  // --- Volume & Settings Controls ---
  public setMasterVolume(val: number) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.masterGain && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  // --- Sound Effects (SFX) ---

  /** Short crisp high-frequency tick for piece lateral shift */
  public playMove() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.03);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /** Quick resonant pitch-bend whoosh for piece rotation */
  public playRotate() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.07);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.Q.setValueAtTime(4, now);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  /** Deep mechanical thud with sub-bass resonance for piece lock/drop */
  public playDrop() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    
    // Sub bass transient
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.14);

    subGain.gain.setValueAtTime(0.4, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    subOsc.start(now);
    subOsc.stop(now + 0.16);

    // Mechanical click top
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(480, now);
    clickOsc.frequency.exponentialRampToValueAtTime(90, now + 0.04);
    clickGain.gain.setValueAtTime(0.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    clickOsc.connect(clickGain);
    clickGain.connect(this.sfxGain);

    clickOsc.start(now);
    clickOsc.stop(now + 0.05);
  }

  /** Ascending harmonic synth chime scaling with line count */
  public playLineClear(count: number) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    if (count >= 4) {
      this.playSynchroQuad();
      return;
    }

    const baseFrequencies = [
      [523.25, 659.25], // C5, E5 (Single)
      [523.25, 659.25, 783.99], // C5, E5, G5 (Double)
      [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6 (Triple)
    ];

    const notes = baseFrequencies[Math.max(0, Math.min(count - 1, 2))];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = now + idx * 0.04;
      const duration = 0.28;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, startTime + duration);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    });
  }

  /** Glorious triumphant arpeggio with stereo chorus for SynchroQuad */
  public playSynchroQuad() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5 to G6
    const now = this.ctx.currentTime;

    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();
      const noteTime = now + idx * 0.055;
      const duration = 0.45;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(freq * 1.008, noteTime); // subtle chorus detune

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, noteTime);
      filter.Q.setValueAtTime(3, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(noteTime);
      osc2.start(noteTime);
      osc.stop(noteTime + duration);
      osc2.stop(noteTime + duration);
    });
  }

  /** Deep noise burst, exponential pitch drop, and sub-bass rumble for Bombs */
  public playExplosion(isGiganto: boolean = false) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const duration = isGiganto ? 0.85 : 0.45;

    // White Noise buffer
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isGiganto ? 1200 : 800, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isGiganto ? 0.6 : 0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration);

    // Deep sub drop
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(isGiganto ? 160 : 110, now);
    sub.frequency.exponentialRampToValueAtTime(25, now + duration);

    subGain.gain.setValueAtTime(isGiganto ? 0.55 : 0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);

    sub.start(now);
    sub.stop(now + duration);
  }

  /** High-frequency buzzing plasma laser sweep for Drill Block */
  public playDrill() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.35);

    // LFO buzz
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(45, now);
    lfoGain.gain.setValueAtTime(150, now);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(5, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.4);
    osc.stop(now + 0.4);
  }

  /** Sci-fi charging powerup sound for War Ability activation */
  public playAbility() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(3800, now + 0.3);
    filter.Q.setValueAtTime(6, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  /** Warning klaxon beep when garbage is pending */
  public playGarbageAlert() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.setValueAtTime(420, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /** Digital glitch artifact for Wacky Chaos events */
  public playGlitch() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(880, now + 0.04);
    osc.frequency.setValueAtTime(110, now + 0.09);
    osc.frequency.setValueAtTime(1400, now + 0.14);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  /** Lock-in confirmation chime */
  public playLock() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, now); // G5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.06); // C6

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // --- Dynamic Procedural Synthwave Music Generator ---

  public toggleMusic(enable?: boolean): boolean {
    const targetState = enable !== undefined ? enable : !this.isMusicPlaying;
    if (targetState) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.isMusicPlaying;
  }

  public setDangerMode(isDanger: boolean) {
    if (this.isDangerMusic !== isDanger) {
      this.isDangerMusic = isDanger;
      this.currentBpm = isDanger ? 146 : 124;
      if (this.isMusicPlaying) {
        // Restart sequencer at new tempo
        this.startSequencer();
      }
    }
  }

  private startMusic() {
    this.initContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.startSequencer();
  }

  private stopMusic() {
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    this.isMusicPlaying = false;
  }

  private startSequencer() {
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
    }

    // 16th note interval
    const stepDurationMs = (60 / this.currentBpm / 4) * 1000;
    this.musicIntervalId = window.setInterval(() => {
      this.tickSequencerStep();
    }, stepDurationMs);
  }

  private tickSequencerStep() {
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    const step = this.musicStep % 16;
    const bar = Math.floor(this.musicStep / 16) % 4;
    const now = this.ctx.currentTime;

    // Cyberpunk Synth Minor Chord Progression:
    // Bar 0: D minor (D3, F3, A3, D4)
    // Bar 1: Bb Major (Bb2, D3, F3, Bb3)
    // Bar 2: F Major (F2, A2, C3, F3)
    // Bar 3: C Major / A minor (C3, E3, G3, C4)
    const chordProgressions = [
      [146.83, 174.61, 220.00, 293.66], // Dm
      [116.54, 146.83, 174.61, 233.08], // Bb
      [174.61, 220.00, 261.63, 349.23], // F
      [130.81, 164.81, 196.00, 261.63], // C
    ];

    const currentChord = chordProgressions[bar];
    const bassNote = currentChord[0];

    // Driving Bassline (8th notes: steps 0, 2, 4, 6, 8, 10, 12, 14)
    if (step % 2 === 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassFilter = this.ctx.createBiquadFilter();
      const bassGain = this.ctx.createGain();

      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassNote / 2, now);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(this.isDangerMusic ? 600 : 350, now);
      bassFilter.Q.setValueAtTime(2.5, now);

      bassGain.gain.setValueAtTime(0.2, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.musicGain);

      bassOsc.start(now);
      bassOsc.stop(now + 0.14);
    }

    // High Arpeggiator Lead (16th notes with rhythmic accent pattern)
    const arpPattern = [0, 2, 1, 3, 2, 1, 3, 1, 0, 2, 3, 2, 1, 2, 0, 3];
    const noteIdx = arpPattern[step];
    const leadFreq = currentChord[noteIdx] * (this.isDangerMusic ? 2.0 : 1.0);

    const leadOsc = this.ctx.createOscillator();
    const leadFilter = this.ctx.createBiquadFilter();
    const leadGain = this.ctx.createGain();

    leadOsc.type = step % 4 === 0 ? 'square' : 'triangle';
    leadOsc.frequency.setValueAtTime(leadFreq, now);

    leadFilter.type = 'lowpass';
    const cutoff = this.isDangerMusic ? 2800 : 1400;
    leadFilter.frequency.setValueAtTime(cutoff, now);
    leadFilter.Q.setValueAtTime(3.5, now);

    const noteVolume = (step % 4 === 0) ? 0.14 : 0.08;
    leadGain.gain.setValueAtTime(noteVolume, now);
    leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    leadOsc.connect(leadFilter);
    leadFilter.connect(leadGain);
    leadGain.connect(this.musicGain);

    leadOsc.start(now);
    leadOsc.stop(now + 0.11);

    // Subtle 4-on-the-floor cyber kick (steps 0, 4, 8, 12)
    if (step % 4 === 0) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(110, now);
      kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

      kickGain.gain.setValueAtTime(0.25, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      kickOsc.connect(kickGain);
      kickGain.connect(this.musicGain);

      kickOsc.start(now);
      kickOsc.stop(now + 0.1);
    }

    this.musicStep++;
  }
}

export const soundEngine = new SoundEngine();
