import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';

interface TimerProps {
  duration: number; // in seconds
  isRunning: boolean;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ duration, isRunning, onComplete, onTick }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          onTick?.(newTime);
          if (newTime <= 0) {
            clearInterval(interval);
            onComplete?.();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete, onTick]);

  const ratio = duration > 0 ? Math.max(0, Math.min(timeLeft / duration, 1)) : 0;
  const progress = ratio * 100;
  const colorState = ratio > 0.5 ? 'safe' : ratio > 0.25 ? 'warn' : 'danger';
  const ringColor =
    colorState === 'safe'
      ? 'stroke-emerald-400'
      : colorState === 'warn'
        ? 'stroke-amber-400'
        : 'stroke-red-500';
  const textColor =
    colorState === 'safe'
      ? 'text-emerald-300'
      : colorState === 'warn'
        ? 'text-amber-300'
        : 'text-red-400';
  const shouldPulse = colorState === 'danger';

  return (
    <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 flex items-center justify-center">
      {/* SVG Ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 192 192">
        <circle
          cx="96"
          cy="96"
          r="88"
          className="stroke-white/10 fill-none"
          strokeWidth="12"
        />
        <circle
          cx="96"
          cy="96"
          r="88"
          className={clsx(
            "fill-none transition-all duration-1000 ease-linear",
            ringColor
          )}
          strokeWidth="12"
          strokeDasharray={553} // 2 * pi * 88
          strokeDashoffset={553 - (553 * progress) / 100}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Time Text */}
      <div className={clsx(
        "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-mono font-bold tabular-nums",
        textColor,
        shouldPulse && "animate-pulse"
      )}>
        {timeLeft}
      </div>
    </div>
  );
};
