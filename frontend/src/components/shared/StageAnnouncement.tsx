import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface StageAnnouncementProps {
  stage: 'semifinal' | 'final' | 'third' | 'champion' | 'tournament-end';
  teamA?: string;
  teamB?: string;
  winnerName?: string;
  onComplete: () => void;
}

const fireGrandConfetti = () => {
  const duration = 6000;
  const end = Date.now() + duration;
  const colors = ['#fbbf24', '#fcd34d', '#d97706', '#ffffff', '#1e3a8a', '#10b981', '#ef4444'];

  // Multiple bursts
  const burstConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { y: 0.6 },
      colors,
      scalar: 1.5,
    });
  };

  burstConfetti();
  setTimeout(burstConfetti, 500);
  setTimeout(burstConfetti, 1000);

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    requestAnimationFrame(frame);
  };

  frame();
};

const fireChampionConfetti = () => {
  const duration = 10000;
  const end = Date.now() + duration;
  const colors = ['#fbbf24', '#fcd34d', '#d97706', '#ffffff'];

  // Massive initial burst
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 180,
        origin: { y: 0.5, x: Math.random() },
        colors,
        scalar: 2,
      });
    }, i * 300);
  }

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 8,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.6 },
      colors,
      scalar: 1.5,
    });
    confetti({
      particleCount: 8,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.6 },
      colors,
      scalar: 1.5,
    });

    requestAnimationFrame(frame);
  };

  frame();
};

export const StageAnnouncement: React.FC<StageAnnouncementProps> = ({
  stage,
  teamA,
  teamB,
  winnerName,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'intro' | 'teams' | 'ready'>('intro');

  useEffect(() => {
    if (stage === 'champion' || stage === 'tournament-end') {
      fireChampionConfetti();
    } else if (stage === 'final') {
      fireGrandConfetti();
    }

    // Phase timing
    const timer1 = setTimeout(() => setPhase('teams'), 1500);
    const timer2 = setTimeout(() => setPhase('ready'), 3500);
    const timer3 = setTimeout(onComplete, stage === 'champion' || stage === 'tournament-end' ? 8000 : 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [stage, onComplete]);

  const getStageContent = () => {
    switch (stage) {
      case 'semifinal':
        return {
          icon: '⚔️',
          title: 'SEMI-FINALS',
          subtitle: 'The Battle Intensifies',
          color: 'from-blue-400 to-blue-600',
        };
      case 'final':
        return {
          icon: '👑',
          title: 'THE GRAND FINALE',
          subtitle: 'Couples Clash Showdown',
          color: 'from-gold via-gold-light to-gold',
        };
      case 'third':
        return {
          icon: '🥉',
          title: '3RD PLACE MATCH',
          subtitle: 'Battle for Bronze',
          color: 'from-amber-600 to-amber-800',
        };
      case 'champion':
        return {
          icon: '🏆',
          title: 'BASH CHAMPIONS!',
          subtitle: winnerName || 'The Winners',
          color: 'from-gold via-yellow-300 to-gold',
        };
      case 'tournament-end':
        return {
          icon: '🎉',
          title: 'THE BASH IS COMPLETE!',
          subtitle: 'Thank you for playing!',
          color: 'from-gold via-gold-light to-gold',
        };
      default:
        return { icon: '🎮', title: 'MATCH', subtitle: '', color: 'from-gold to-gold-dark' };
    }
  };

  const content = getStageContent();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
      {/* Animated background rays */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vmax] h-[200vmax] animate-spin-slow">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-1/2 origin-bottom bg-gradient-to-t from-gold/20 to-transparent"
              style={{ transform: `rotate(${i * 30}deg)` }}
            />
          ))}
        </div>
      </div>

      <div className="relative text-center space-y-8 p-8 max-w-4xl">
        {/* Icon */}
        <div
          className={`text-8xl sm:text-9xl md:text-[12rem] transition-all duration-700 ${
            phase === 'intro' ? 'scale-150 animate-bounce' : 'scale-100'
          }`}
        >
          {content.icon}
        </div>

        {/* Title */}
        <h1
          className={`text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tight transition-all duration-500 ${
            phase !== 'intro' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${content.color}`}>
            {content.title}
          </span>
        </h1>

        {/* Subtitle / Teams */}
        <div
          className={`transition-all duration-500 delay-200 ${
            phase === 'teams' || phase === 'ready' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {stage === 'champion' ? (
            <div className="space-y-4">
              <p className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white animate-pulse">
                {winnerName}
              </p>
              <p className="text-lg sm:text-2xl text-white/60">🎊 Congratulations! 🎊</p>
            </div>
          ) : stage === 'tournament-end' ? (
            <p className="text-xl sm:text-3xl text-white/80">{content.subtitle}</p>
          ) : teamA && teamB ? (
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              <span className="text-xl sm:text-3xl md:text-4xl font-bold text-white">{teamA}</span>
              <span className="text-2xl sm:text-4xl md:text-5xl text-gold font-display">VS</span>
              <span className="text-xl sm:text-3xl md:text-4xl font-bold text-white">{teamB}</span>
            </div>
          ) : (
            <p className="text-xl sm:text-3xl text-white/80">{content.subtitle}</p>
          )}
        </div>

        {/* Ready indicator */}
        {phase === 'ready' && stage !== 'champion' && stage !== 'tournament-end' && (
          <div className="animate-pulse">
            <p className="text-lg sm:text-2xl text-gold uppercase tracking-widest">Get Ready...</p>
          </div>
        )}

        {/* Skip button for champion/tournament-end */}
        {(stage === 'champion' || stage === 'tournament-end') && (
          <button
            onClick={onComplete}
            className="btn-primary text-lg sm:text-xl px-8 py-4 mt-8 animate-bounce"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
};
