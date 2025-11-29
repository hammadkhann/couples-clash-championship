import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Music, Music2 } from 'lucide-react';

export const BackgroundMusic: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackCtx = useRef<AudioContext | null>(null);
  const fallbackInterval = useRef<number | null>(null);

  const stopFallback = useCallback(() => {
    if (fallbackInterval.current) {
      clearInterval(fallbackInterval.current);
      fallbackInterval.current = null;
    }
    if (fallbackCtx.current) {
      fallbackCtx.current.close().catch(() => undefined);
      fallbackCtx.current = null;
    }
    setUsingFallback(false);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const startFallback = useCallback(() => {
    stopFallback();
    try {
      const ctx = new AudioContext();
      fallbackCtx.current = ctx;

      const blip = (freq: number, start: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.05, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.65);
      };

      const playPattern = () => {
        const now = ctx.currentTime;
        blip(420, now + 0);
        blip(520, now + 0.4);
        blip(660, now + 0.8);
        blip(520, now + 1.2);
      };

      playPattern();
      fallbackInterval.current = window.setInterval(playPattern, 4000);
      setUsingFallback(true);
    } catch {
      setUsingFallback(false);
    }
  }, [stopFallback]);

  const startAudio = useCallback(async () => {
    if (!audioRef.current) {
      const audio = new Audio('/sfx/bg.mp3');
      audio.loop = true;
      audio.volume = 0.18;
      audioRef.current = audio;
    }
    try {
      await audioRef.current.play();
      setUsingFallback(false);
      return true;
    } catch {
      return false;
    }
  }, []);

  const toggleMusic = useCallback(async () => {
    if (enabled) {
      stopAudio();
      stopFallback();
      setEnabled(false);
      return;
    }
    const ok = await startAudio();
    if (!ok) {
      startFallback();
    }
    setEnabled(true);
  }, [enabled, startAudio, startFallback, stopAudio, stopFallback]);

  useEffect(() => {
    return () => {
      stopAudio();
      stopFallback();
    };
  }, [stopAudio, stopFallback]);

  return (
    <button
      type="button"
      onClick={toggleMusic}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm border transition-all ${
        enabled
          ? 'border-gold text-gold bg-white/5 hover:bg-white/10'
          : 'border-white/10 text-white/60 hover:text-white hover:border-white/30'
      }`}
      title={enabled ? 'Pause background music' : 'Play background music'}
    >
      {enabled ? <Music2 size={16} /> : <Music size={16} />}
      <span className="hidden sm:inline">{enabled ? (usingFallback ? 'Chiptune On' : 'Music On') : 'Music Off'}</span>
    </button>
  );
};
