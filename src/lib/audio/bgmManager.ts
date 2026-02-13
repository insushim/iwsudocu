/**
 * BGM Manager - Procedural ambient background music using Web Audio API.
 *
 * Generates a calming, lofi-style loop with:
 *  - Pentatonic-based chord progressions (Am - F - C - G feel)
 *  - Gentle sine/triangle pad layers
 *  - Subtle arpeggios
 *  - Random high-frequency "sparkle" notes
 *
 * No external audio files are required.
 */

class BgmManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled = false;
  private playing = false;
  private volume = 0.1; // 0.08 – 0.12 range default
  private chordIndex = 0;
  private chordTimer: ReturnType<typeof setTimeout> | null = null;
  private sparkleTimer: ReturnType<typeof setTimeout> | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];

  // -------------------------------------------------------------------
  // Chord definitions (frequencies in Hz)
  // Using pentatonic-flavoured voicings for a calming feel.
  //  Am  -> A3  C4  E4
  //  F   -> F3  A3  C4
  //  C   -> C3  E3  G3
  //  G   -> G3  B3  D4
  // -------------------------------------------------------------------
  private readonly chords: number[][] = [
    [220.0, 261.63, 329.63],  // Am
    [174.61, 220.0, 261.63],  // F
    [130.81, 164.81, 196.0],  // C
    [196.0, 246.94, 293.66],  // G
  ];

  // Arpeggio notes per chord (pentatonic scale relatives)
  private readonly arpeggios: number[][] = [
    [440, 523.25, 659.25, 523.25],  // Am arp
    [349.23, 440, 523.25, 440],     // F  arp
    [261.63, 329.63, 392, 329.63],  // C  arp
    [392, 493.88, 587.33, 493.88],  // G  arp
  ];

  // Sparkle pool – high pentatonic notes
  private readonly sparkleNotes: number[] = [
    880, 987.77, 1174.66, 1318.51, 1479.98, 1760,
  ];

  private readonly CHORD_DURATION = 4; // seconds per chord

  // -------------------------------------------------------------------
  // Audio context helpers
  // -------------------------------------------------------------------

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  private getMasterGain(): GainNode {
    if (!this.masterGain) {
      const ctx = this.getContext();
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain;
  }

  // -------------------------------------------------------------------
  // Internal – play a single pad chord with smooth fade-in / fade-out
  // -------------------------------------------------------------------

  private playPadChord() {
    if (!this.playing || !this.enabled) return;

    const ctx = this.getContext();
    const master = this.getMasterGain();
    const now = ctx.currentTime;
    const dur = this.CHORD_DURATION;
    const fadeIn = 0.8;
    const fadeOut = 1.0;

    const chord = this.chords[this.chordIndex];

    chord.forEach((freq) => {
      // --- Layer 1: Sine pad ---
      const osc1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      // Slow vibrato
      osc1.frequency.setValueAtTime(freq, now);
      osc1.frequency.linearRampToValueAtTime(freq + 0.5, now + dur / 2);
      osc1.frequency.linearRampToValueAtTime(freq, now + dur);
      g1.gain.setValueAtTime(0, now);
      g1.gain.linearRampToValueAtTime(0.35, now + fadeIn);
      g1.gain.linearRampToValueAtTime(0.35, now + dur - fadeOut);
      g1.gain.linearRampToValueAtTime(0, now + dur);
      osc1.connect(g1);
      g1.connect(master);
      osc1.start(now);
      osc1.stop(now + dur + 0.05);
      this.activeOscillators.push(osc1);
      this.activeGains.push(g1);

      // --- Layer 2: Triangle pad (one octave lower, quieter) ---
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq / 2, now);
      g2.gain.setValueAtTime(0, now);
      g2.gain.linearRampToValueAtTime(0.18, now + fadeIn);
      g2.gain.linearRampToValueAtTime(0.18, now + dur - fadeOut);
      g2.gain.linearRampToValueAtTime(0, now + dur);
      osc2.connect(g2);
      g2.connect(master);
      osc2.start(now);
      osc2.stop(now + dur + 0.05);
      this.activeOscillators.push(osc2);
      this.activeGains.push(g2);
    });

    // Arpeggios – staggered plucks
    const arpNotes = this.arpeggios[this.chordIndex];
    arpNotes.forEach((freq, i) => {
      const offset = i * 0.9 + 0.3; // spread across the chord duration
      if (offset + 0.6 > dur) return;

      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + offset);
      g.gain.setValueAtTime(0, now + offset);
      g.gain.linearRampToValueAtTime(0.12, now + offset + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.6);
      osc.connect(g);
      g.connect(master);
      osc.start(now + offset);
      osc.stop(now + offset + 0.65);
      this.activeOscillators.push(osc);
      this.activeGains.push(g);
    });

    // Advance to next chord and schedule
    this.chordIndex = (this.chordIndex + 1) % this.chords.length;

    this.chordTimer = setTimeout(() => {
      this.cleanupStoppedNodes();
      this.playPadChord();
    }, dur * 1000);
  }

  // -------------------------------------------------------------------
  // Internal – random sparkle notes
  // -------------------------------------------------------------------

  private scheduleSparkle() {
    if (!this.playing || !this.enabled) return;

    // Random interval between 2 and 6 seconds
    const delay = 2000 + Math.random() * 4000;

    this.sparkleTimer = setTimeout(() => {
      if (!this.playing || !this.enabled) return;

      const ctx = this.getContext();
      const master = this.getMasterGain();
      const now = ctx.currentTime;

      const freq = this.sparkleNotes[Math.floor(Math.random() * this.sparkleNotes.length)];
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.06, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + 0.85);
      this.activeOscillators.push(osc);
      this.activeGains.push(g);

      this.scheduleSparkle();
    }, delay);
  }

  // -------------------------------------------------------------------
  // Cleanup helpers
  // -------------------------------------------------------------------

  private cleanupStoppedNodes() {
    // Remove ended oscillators from tracking arrays
    this.activeOscillators = this.activeOscillators.filter((o) => {
      try {
        // If the oscillator context time has passed its stop time it is dead.
        // We just keep a bounded list; old refs get GC'd.
        return true;
      } catch {
        return false;
      }
    });
    // Keep arrays bounded
    if (this.activeOscillators.length > 60) {
      this.activeOscillators = this.activeOscillators.slice(-30);
    }
    if (this.activeGains.length > 60) {
      this.activeGains = this.activeGains.slice(-30);
    }
  }

  private stopAllNodes() {
    const ctx = this.audioContext;
    if (!ctx) return;

    const now = ctx.currentTime;
    // Quickly fade out all active gains
    this.activeGains.forEach((g) => {
      try {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0, now + 0.3);
      } catch {
        // node may already be disconnected
      }
    });

    // Stop oscillators after fade
    setTimeout(() => {
      this.activeOscillators.forEach((o) => {
        try {
          o.stop();
        } catch {
          // already stopped
        }
      });
      this.activeOscillators = [];
      this.activeGains = [];
    }, 350);
  }

  // -------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------

  play() {
    if (this.playing || !this.enabled) return;

    try {
      this.getContext(); // Ensure context exists
      this.playing = true;
      this.chordIndex = 0;
      this.playPadChord();
      this.scheduleSparkle();
    } catch {
      // Web Audio not available
    }
  }

  stop() {
    this.playing = false;

    if (this.chordTimer) {
      clearTimeout(this.chordTimer);
      this.chordTimer = null;
    }
    if (this.sparkleTimer) {
      clearTimeout(this.sparkleTimer);
      this.sparkleTimer = null;
    }

    this.stopAllNodes();
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.audioContext) {
      const now = this.audioContext.currentTime;
      this.masterGain.gain.setValueAtTime(this.volume, now);
    }
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on && this.playing) {
      this.stop();
    }
  }

  isPlaying(): boolean {
    return this.playing;
  }
}

export const bgmManager = new BgmManager();
