// Audio & Haptic Feedback Utility for School Assessment Platform

export function isAudioMuted(): boolean {
  try {
    const saved = localStorage.getItem('school_app_muted');
    if (saved !== null) return JSON.parse(saved);
  } catch (e) {
    // default to false
  }
  return false;
}

export function setAudioMuted(muted: boolean): void {
  try {
    localStorage.setItem('school_app_muted', JSON.stringify(muted));
  } catch (e) {
    // ignore
  }
}

/**
 * Triggers crisp haptic vibration pattern on supporting mobile/touch devices
 */
export function triggerVibration(pattern: number[] = [60, 40, 80]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // ignore silently if vibration is restricted
    }
  }
}

/**
 * Plays a cheerful dual-tone success chime (E5 -> A5) and triggers vibration
 * Triggered upon successfully saving a new assessment record.
 */
export function playSuccessSoundAndVibrate(): void {
  triggerVibration([60, 40, 80]);

  if (isAudioMuted()) return;

  try {
    const AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);

    // Note 2: A5 (880.00 Hz) - Bright ascending resolution
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.09);
    gain2.gain.setValueAtTime(0.22, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.35);
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}

/**
 * Plays a distinct double warning alert tone (F5 -> D5) and triggers vibration
 * Triggered for system alerts regarding overdue or skipped assessments.
 */
export function playAlertSoundAndVibrate(): void {
  triggerVibration([100, 50, 100]);

  if (isAudioMuted()) return;

  try {
    const AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Warning Tone 1: F5 (698.46 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(698.46, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Warning Tone 2: D5 (587.33 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(587.33, now + 0.13);
    gain2.gain.setValueAtTime(0.22, now + 0.13);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.13);
    osc2.stop(now + 0.38);
  } catch (e) {
    console.warn('Alert audio error:', e);
  }
}
