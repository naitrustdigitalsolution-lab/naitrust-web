/**
 * Sound notification utilities
 * Provides audio feedback for messaging events
 */

class SoundManager {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;
  
    constructor() {
      // Check if user has enabled sounds (default: true)
      const savedPreference = localStorage.getItem('naitrust_sounds_enabled');
      this.enabled = savedPreference === null ? true : savedPreference === 'true';
    }
  
    /**
     * Initialize audio context (must be called after user interaction)
     */
    private initAudioContext() {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return this.audioContext;
    }
  
    /**
     * Play a beep tone for message sent confirmation
     */
    playMessageSent() {
      if (!this.enabled) return;
  
      try {
        const ctx = this.initAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
  
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
  
        // Soft, pleasant tone for sent message
        oscillator.frequency.value = 800; // Higher pitch
        oscillator.type = 'sine';
  
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
      } catch (error) {
        console.warn('Failed to play sent sound:', error);
      }
    }
  
    /**
     * Play notification sound for incoming message
     */
    playMessageReceived() {
      if (!this.enabled) return;
  
      try {
        const ctx = this.initAudioContext();
        
        // Create a more noticeable notification sound (two-tone)
        this.playTone(ctx, 600, 0, 0.08);
        this.playTone(ctx, 800, 0.1, 0.08);
      } catch (error) {
        console.warn('Failed to play received sound:', error);
      }
    }
  
    /**
     * Helper to play a single tone
     */
    private playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
  
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
  
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
  
      const start = ctx.currentTime + startTime;
      const end = start + duration;
  
      gainNode.gain.setValueAtTime(0.15, start);
      gainNode.gain.exponentialRampToValueAtTime(0.01, end);
  
      oscillator.start(start);
      oscillator.stop(end);
    }
  
    /**
     * Enable/disable sounds
     */
    setEnabled(enabled: boolean) {
      this.enabled = enabled;
      localStorage.setItem('naitrust_sounds_enabled', enabled.toString());
    }
  
    /**
     * Check if sounds are enabled
     */
    isEnabled(): boolean {
      return this.enabled;
    }
  }
  
  // Export singleton instance
  export const soundManager = new SoundManager();
  