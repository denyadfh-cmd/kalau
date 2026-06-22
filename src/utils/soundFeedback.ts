/**
 * Web Audio API Sound Synthesizer for retro 8-bit game feel
 */

function getAudioContext(): AudioContext | null {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    return new AudioCtx();
  } catch (e) {
    console.warn("AudioContext tidak didukung di web browser ini.", e);
    return null;
  }
}

export function playClickSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.error("Gagal memainkan suara click:", error);
  }
}

export function playCorrectSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 (Major Arpeggio)
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = freq;
      osc.type = "sine";
      
      const startTime = ctx.currentTime + i * 0.08;
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
      
      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  } catch (error) {
    console.error("Gagal memainkan suara benar:", error);
  }
}

export function playWrongSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (error) {
    console.error("Gagal memainkan suara salah:", error);
  }
}

export function playLevelUpSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const freqs = [523.25, 587.33, 659.25, 698.46, 783.99]; // C5, D5, E5, F5, G5
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "triangle";
      osc.frequency.value = freq;
      
      const startTime = ctx.currentTime + i * 0.1;
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  } catch (error) {
    console.error("Gagal memainkan suara Level Up:", error);
  }
}
export function playQuestCompleteSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // Victory!
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + i * 0.12;
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
      
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  } catch (error) {
    console.error("Gagal memainkan suara Quest Selesai:", error);
  }
}
