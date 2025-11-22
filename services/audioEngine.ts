
// Singleton Audio Engine for Procedural Sci-Fi Sounds & External Assets

class AudioEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  
  // Ambience nodes
  ambienceSource: AudioBufferSourceNode | null = null;
  ambienceGain: GainNode | null = null;
  
  isMuted: boolean = false;
  isInitialized: boolean = false;
  userVolume: number = 0.5; // Default user volume preference

  // Assets
  ambienceBuffer: AudioBuffer | null = null;
  warpBuffer: AudioBuffer | null = null;

  // URLs
  private readonly AMBIENCE_URL = 'https://claim.monad.xyz/sounds/sign-in-loop.mp3';
  private readonly WARP_URL = 'https://claim.monad.xyz/sounds/enter-the-portal.mp3';

  constructor() {
    // Lazy initialization handled in init()
  }

  init() {
    if (this.isInitialized) return;
    
    try {
      const CtxClass = (window.AudioContext || (window as any).webkitAudioContext);
      this.ctx = new CtxClass();
      
      if (!this.ctx) return;

      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.userVolume;

      this.isInitialized = true;

      // Start loading assets immediately
      this.loadAssets().then(() => {
          // Start ambience only if we are still in a valid state
          if (!this.isMuted) {
              this.startAmbience();
          }
      });

    } catch (e) {
      console.error("Audio Engine failed to initialize", e);
    }
  }

  async loadAssets() {
      if (!this.ctx) return;

      const loadBuffer = async (url: string): Promise<AudioBuffer | null> => {
          try {
              const response = await fetch(url);
              const arrayBuffer = await response.arrayBuffer();
              return await this.ctx!.decodeAudioData(arrayBuffer);
          } catch (e) {
              console.error(`Failed to load audio: ${url}`, e);
              return null;
          }
      };

      const [amb, warp] = await Promise.all([
          loadBuffer(this.AMBIENCE_URL),
          loadBuffer(this.WARP_URL)
      ]);

      this.ambienceBuffer = amb;
      this.warpBuffer = warp;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(value: number) {
    this.userVolume = Math.max(0, Math.min(1, value));
    if (this.masterGain && !this.isMuted) {
      // Smooth transition
      this.masterGain.gain.setTargetAtTime(this.userVolume, this.ctx!.currentTime, 0.1);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      // Smooth mute transition
      const now = this.ctx!.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.userVolume, now + 0.2);
      
      if (!this.isMuted) {
          // If unmuting, ensure ambience is running
          this.startAmbience();
      } else {
          // Optional: stop ambience to save resources, or just let gain handle silence
      }
    }
    return this.isMuted;
  }

  // --- Sound Generators ---

  playHover() {
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // High tech chirp
    osc.type = 'sine';
    // Randomize pitch slightly for organic feel
    const startFreq = 800 + Math.random() * 200;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2, t + 0.05);
    
    gain.gain.setValueAtTime(0.05 * this.userVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playScroll() {
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;

    // Low frequency "thrum" for movement - VOLUMIZED
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.15);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, t);
    filter.frequency.linearRampToValueAtTime(50, t + 0.15);

    // UPDATED: Increased gain from 0.1 to 0.8
    gain.gain.setValueAtTime(0.8 * this.userVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playClick() {
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;

    // 1. Low thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    gain.gain.setValueAtTime(0.15 * this.userVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.1);

    // 2. High frequency "click" noise simulation (short sine burst)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2000, t);
    gain2.gain.setValueAtTime(0.05 * this.userVolume, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc2.connect(gain2);
    gain2.connect(this.masterGain!);
    osc2.start(t);
    osc2.stop(t + 0.03);
  }

  playOpen() {
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    
    // "Swish" sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.value = 100;
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.linearRampToValueAtTime(2000, t + 0.2);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1 * this.userVolume, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  playWarp() {
    if (this.isMuted || !this.ctx) return;
    
    if (this.warpBuffer) {
        // Use loaded asset
        const source = this.ctx.createBufferSource();
        source.buffer = this.warpBuffer;
        
        const gain = this.ctx.createGain();
        gain.gain.value = 0.9 * this.userVolume; // High volume for impact
        
        source.connect(gain);
        gain.connect(this.masterGain!);
        source.start();
    } else {
        // Fallback procedural if not loaded yet
        const t = this.ctx.currentTime;
        const duration = 2.0;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(8000, t + duration);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2 * this.userVolume, t + duration * 0.5);
        gain.gain.linearRampToValueAtTime(0, t + duration);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(t);
        osc.stop(t + duration);
    }
  }

  startAmbience() {
    // If playing already or missing deps, abort
    if (this.ambienceSource || !this.ctx || !this.ambienceBuffer) return;

    const t = this.ctx.currentTime;

    this.ambienceSource = this.ctx.createBufferSource();
    this.ambienceSource.buffer = this.ambienceBuffer;
    this.ambienceSource.loop = true;

    this.ambienceGain = this.ctx.createGain();
    
    // Fade in the loop
    this.ambienceGain.gain.setValueAtTime(0, t);
    this.ambienceGain.gain.linearRampToValueAtTime(0.3 * this.userVolume, t + 3.0);

    this.ambienceSource.connect(this.ambienceGain);
    this.ambienceGain.connect(this.masterGain!);
    
    this.ambienceSource.start(t);
  }

  stopAmbience() {
    if (this.ambienceSource) {
        try {
            this.ambienceSource.stop();
        } catch(e) {
            // ignore if already stopped
        }
        this.ambienceSource.disconnect();
        this.ambienceSource = null;
    }
    if (this.ambienceGain) {
        this.ambienceGain.disconnect();
        this.ambienceGain = null;
    }
  }
}

export const audio = new AudioEngine();
