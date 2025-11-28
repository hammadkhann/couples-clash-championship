import React, { useEffect } from 'react';
import { useGame } from '../../hooks/useGame';

// Fallback generated tones so the app works without assets.
const SFX_CONFIG: Record<string, { freq: number; duration: number }> = {
  start: { freq: 880, duration: 0.25 },
  correct: { freq: 1320, duration: 0.2 },
  timeout: { freq: 240, duration: 0.4 },
  wrong: { freq: 320, duration: 0.3 },
  win: { freq: 1040, duration: 0.5 },
};

const playTone = (event: string) => {
  const cfg = SFX_CONFIG[event];
  if (!cfg) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = cfg.freq;
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + cfg.duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + cfg.duration);
};

export const SfxController: React.FC = () => {
  const { lastSfx } = useGame();

  useEffect(() => {
    if (!lastSfx) return;
    const [event] = lastSfx.split('-');
    const audioPath = `/sfx/${event}.mp3`;

    const audio = new Audio(audioPath);
    audio.play().catch(() => playTone(event));
  }, [lastSfx]);

  return null;
};
