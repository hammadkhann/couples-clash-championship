import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { Trophy, Swords, List, Play, PartyPopper } from 'lucide-react';
import { RulesPanel } from '../components/shared/RulesPanel';
import confetti from 'canvas-confetti';

export const Home: React.FC = () => {
  const { state, playSfx } = useGame();

  useEffect(() => {
    // Trigger confetti on load
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, 
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, 
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleNavSound = () => playSfx('start');

  const currentMatch = state?.bracket.find(m => m.id === state.currentMatchId);

  return (
    <div className="flex flex-col items-center justify-start py-4 md:py-8 space-y-6 md:space-y-8 text-center px-2 pb-8">
      <div className="space-y-3 md:space-y-4 animate-fade-in relative">
        <div className="absolute -top-10 -left-10 animate-bounce-slow hidden md:block">
          <span className="text-6xl">🎈</span>
        </div>
        <div className="absolute -top-10 -right-10 animate-bounce-slow hidden md:block" style={{ animationDelay: '1s' }}>
          <span className="text-6xl">🎈</span>
        </div>
        
        <div className="inline-block p-3 md:p-4 rounded-full bg-gradient-to-r from-gold/20 to-gold-dark/20 mb-1 md:mb-2 animate-pulse-fast border border-gold/30 backdrop-blur-sm">
          <span className="text-4xl md:text-6xl">👶👑</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-display font-bold text-white leading-tight drop-shadow-lg">
          Happy <span className="text-gold">1/2</span> Birthday <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-white to-gold animate-glow">
            Raamiz!
          </span>
        </h1>
        <div className="flex items-center justify-center gap-2 text-gold-light font-bold text-lg md:text-xl uppercase tracking-widest">
          <PartyPopper size={24} />
          <span>6 Months of Cuteness</span>
          <PartyPopper size={24} />
        </div>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto px-4 font-light">
          Welcome to the <span className="font-bold text-gold">Couples Clash Championship</span>. 
          <br/>Test your knowledge, speed, and synergy!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-6xl px-2 sm:px-4">
        <Link
          to="/bracket"
          onClick={handleNavSound}
          className="group relative overflow-hidden p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <List size={60} className="md:hidden" />
            <List size={100} className="hidden md:block" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gold mb-2">Tournament Bracket</h3>
          <p className="text-sm md:text-base text-white/60">View the matchups and progress.</p>
        </Link>

        <Link
          to="/duel"
          onClick={handleNavSound}
          className="group relative overflow-hidden p-6 md:p-8 rounded-2xl bg-gradient-to-br from-royal-blue to-deep-blue border-2 border-gold/50 hover:border-gold transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:shadow-[0_0_50px_rgba(251,191,36,0.4)]"
        >
          <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Swords size={60} className="md:hidden" />
            <Swords size={100} className="hidden md:block" />
          </div>
          <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse-fast" />
          
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
            Enter the Arena <Swords className="text-gold" />
          </h3>
          <p className="text-sm md:text-base text-white/80 mb-4">
            {currentMatch ? (
              <span className="text-gold font-bold bg-black/30 px-3 py-1 rounded-full">
                LIVE: {currentMatch.teamA?.name} vs {currentMatch.teamB?.name}
              </span>
            ) : (
              "Go to current match"
            )}
          </p>
          <div className="inline-flex items-center gap-2 bg-gold text-deep-blue px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-sm shadow-lg group-hover:bg-white transition-colors">
            Play Now <Play size={16} fill="currentColor" />
          </div>
        </Link>

        <Link
          to="/leaderboard"
          onClick={handleNavSound}
          className="group relative overflow-hidden p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy size={60} className="md:hidden" />
            <Trophy size={100} className="hidden md:block" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gold mb-2">Leaderboard</h3>
          <p className="text-sm md:text-base text-white/60">Check the standings and scores.</p>
        </Link>
      </div>

      <div className="w-full max-w-6xl px-2 sm:px-4">
        <RulesPanel />
      </div>
    </div>
  );
};
