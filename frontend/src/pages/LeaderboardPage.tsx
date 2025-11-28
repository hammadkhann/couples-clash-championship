import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useGame } from '../hooks/useGame';
import { Medal, Crown, Star } from 'lucide-react';

// Celebration confetti
const fireCelebrationConfetti = () => {
  const duration = 15000;
  const end = Date.now() + duration;
  const colors = ['#fbbf24', '#fcd34d', '#d97706', '#ffffff', '#1e3a8a', '#10b981'];

  // Initial massive burst
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.4, x: Math.random() },
        colors,
        scalar: 1.8,
      });
    }, i * 400);
  }

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    requestAnimationFrame(frame);
  };

  frame();
};

export const LeaderboardPage: React.FC = () => {
  const { state, playSfx } = useGame();
  const [searchParams] = useSearchParams();
  const [showCelebration, setShowCelebration] = useState(false);
  const [revealedRows, setRevealedRows] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const celebrationTriggered = useRef(false);

  const isCelebrationMode = searchParams.get('celebrate') === 'true';
  const isTournamentComplete = state?.bracket.every((match) => match.status === 'completed') ?? false;
  const shouldCelebrate = isCelebrationMode || isTournamentComplete;

  useEffect(() => {
    if (!state) return;

    const totalRows = state.leaderboard.length;

    if (!shouldCelebrate) {
      setShowCelebration(false);
      setRevealedRows(totalRows);
      celebrationTriggered.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    setShowCelebration(true);

    if (celebrationTriggered.current) {
      if (!isCelebrationMode) {
        setRevealedRows(totalRows);
      }
      return;
    }

    celebrationTriggered.current = true;

    if (!isCelebrationMode) {
      setRevealedRows(totalRows);
      return;
    }

    // Play celebration music
    try {
      audioRef.current = new Audio('/sfx/win.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {
        // Fallback: play win sfx
        playSfx('win');
      });
    } catch {
      playSfx('win');
    }

    // Fire confetti
    fireCelebrationConfetti();

    // Reveal rows one by one
    const baseDelay = 250;
    const stepDelay = 200;
    for (let order = 0; order < totalRows; order++) {
      setTimeout(() => {
        setRevealedRows(order + 1);
        if (order === totalRows - 1) {
          // Extra confetti when champions reveal
          confetti({
            particleCount: 200,
            spread: 180,
            origin: { y: 0.3 },
            colors: ['#fbbf24', '#fcd34d', '#ffffff'],
            scalar: 2,
          });
        }
      }, baseDelay + order * stepDelay);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [state, shouldCelebrate, isCelebrationMode, playSfx]);

  if (!state) return <div className="text-white text-center mt-20">Loading leaderboard...</div>;

  const { leaderboard } = state;
  
  // Sort leaderboard by score descending
  const sortedLeaderboard = [...leaderboard].sort((a, b) => (b.score || 0) - (a.score || 0));

  // Calculate which rows should be visible (for animation effect)
  // But we always render all rows - just control their opacity/visibility with CSS
  const getRowVisibility = (index: number) => {
    if (!showCelebration) return true;
    // In celebration mode, rows reveal from bottom to top
    // index 0 = 1st place (revealed last), index 7 = 8th place (revealed first)
    const revealOrder = sortedLeaderboard.length - 1 - index;
    return revealedRows > revealOrder;
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 pb-12 relative">
      {/* Celebration background effects */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-10 left-10 text-6xl animate-float opacity-50">⭐</div>
          <div className="absolute top-20 right-20 text-5xl animate-float opacity-50" style={{ animationDelay: '1s' }}>🎉</div>
          <div className="absolute bottom-40 left-20 text-4xl animate-float opacity-50" style={{ animationDelay: '0.5s' }}>🎊</div>
          <div className="absolute bottom-20 right-10 text-6xl animate-float opacity-50" style={{ animationDelay: '1.5s' }}>✨</div>
          <div className="absolute top-1/3 left-1/4 text-3xl animate-float opacity-30" style={{ animationDelay: '2s' }}>🏆</div>
          <div className="absolute top-1/2 right-1/4 text-4xl animate-float opacity-30" style={{ animationDelay: '0.8s' }}>👑</div>
        </div>
      )}

      <div className="text-center mb-6 sm:mb-8 md:mb-12 relative z-10">
        {showCelebration && (
          <div className="mb-4 animate-bounce">
            <span className="text-6xl sm:text-8xl">🎉</span>
          </div>
        )}
        <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold mb-2 sm:mb-4 ${showCelebration ? 'animate-glow' : ''}`}>
          {showCelebration ? 'FINAL STANDINGS' : 'LEADERBOARD'}
        </h1>
        <p className="text-white/60 text-sm sm:text-base md:text-lg">
          {showCelebration ? '🏆 The Bash is Complete! 🏆' : 'Who will take home the birthday crown?'}
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative z-10">
        <div className="grid grid-cols-12 gap-2 sm:gap-4 p-3 sm:p-4 md:p-6 bg-white/5 border-b border-white/10 text-gold font-bold uppercase tracking-wider text-xs sm:text-sm md:text-base">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">Team</div>
          <div className="col-span-4 text-right">Score</div>
        </div>

        <div className="divide-y divide-white/5">
          {sortedLeaderboard.map((team, index) => {
            const isVisible = getRowVisibility(index);
            return (
              <div 
                key={team.id} 
                className={`grid grid-cols-12 gap-2 sm:gap-4 p-4 sm:p-5 md:p-6 lg:p-8 items-center transition-all duration-500 hover:bg-white/5 active:bg-white/10 ${
                  index === 0 ? 'bg-gradient-to-r from-gold/20 via-gold/10 to-transparent' : 
                  index === 1 ? 'bg-gradient-to-r from-gray-400/10 via-transparent to-transparent' :
                  index === 2 ? 'bg-gradient-to-r from-amber-700/10 via-transparent to-transparent' : ''
                } ${showCelebration && isVisible ? 'animate-slide-up' : ''} ${
                  showCelebration && !isVisible ? 'opacity-0' : 'opacity-100'
                }`}
                style={showCelebration && isVisible ? { animationDelay: `${index * 0.1}s` } : {}}
              >
              <div className="col-span-2 flex justify-center">
                {index === 0 ? (
                  <div className="relative">
                    <Crown className={`text-gold w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${showCelebration ? 'animate-bounce' : 'animate-bounce-slow'}`} />
                    {showCelebration && (
                      <div className="absolute -top-2 -right-2">
                        <Star className="w-4 h-4 text-gold animate-pulse" fill="currentColor" />
                      </div>
                    )}
                  </div>
                ) : index === 1 ? (
                  <Medal className="text-gray-300 w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10" />
                ) : index === 2 ? (
                  <Medal className="text-amber-600 w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10" />
                ) : (
                  <span className="text-white/50 font-mono text-lg sm:text-xl md:text-2xl lg:text-3xl">#{index + 1}</span>
                )}
              </div>
              
              <div className="col-span-6">
                <h3 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate ${
                  index === 0 ? 'text-gold' : 'text-white'
                }`}>
                  {team.name}
                  {index === 0 && showCelebration && <span className="ml-2">👑</span>}
                </h3>
                <div className="text-white/50 text-sm sm:text-base md:text-lg mt-0.5 sm:mt-1 truncate">
                  {team.players.join(' & ')}
                </div>
              </div>
              
              <div className="col-span-4 text-right">
                <span className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold ${
                  index === 0 ? 'text-gold' : 'text-gold/80'
                }`}>
                  {team.score || 0}
                </span>
                <span className="text-xs sm:text-sm text-white/30 block uppercase tracking-widest">Points</span>
              </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thank you message */}
      {showCelebration && revealedRows >= sortedLeaderboard.length && (
        <div className="text-center mt-8 sm:mt-12 animate-fade-in">
          <div className="inline-block p-6 sm:p-8 rounded-2xl bg-white/5 border border-gold/30">
            <p className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gold mb-2">
              🎂 Happy Half Birthday, Raamiz! 🎂
            </p>
            <p className="text-white/60 text-base sm:text-lg">
              Thanks everyone for playing!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
