import React from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { Trophy, Swords, List, Play } from 'lucide-react';
import { RulesPanel } from '../components/shared/RulesPanel';

export const Home: React.FC = () => {
  const { state, playSfx } = useGame();

  const handleNavSound = () => playSfx('start');

  const currentMatch = state?.bracket.find(m => m.id === state.currentMatchId);

  return (
    <div className="flex flex-col items-center justify-start py-4 md:py-8 space-y-6 md:space-y-8 text-center px-2 pb-8">
      <div className="space-y-3 md:space-y-4 animate-fade-in">
        <div className="inline-block p-2 md:p-3 rounded-full bg-gold/10 mb-1 md:mb-2 animate-pulse-fast">
          <span className="text-3xl md:text-5xl">🎂</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold text-white leading-tight">
          Welcome to <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold">
            Raamiz's Half Birthday Bash
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/60 max-w-2xl mx-auto px-4">
          The ultimate couples showdown. Test your knowledge, speed, and synergy!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-6xl px-2 sm:px-4">
        <Link
          to="/bracket"
          onClick={handleNavSound}
          className="group relative overflow-hidden p-5 md:p-8 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <List size={60} className="md:hidden" />
            <List size={100} className="hidden md:block" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gold mb-1 md:mb-2">Couples Clash Gauntlet</h3>
          <p className="text-sm md:text-base text-white/60">View the matchups and progress.</p>
        </Link>

        <Link
          to="/duel"
          onClick={handleNavSound}
          className="group relative overflow-hidden p-5 md:p-8 rounded-xl md:rounded-2xl bg-gradient-to-br from-royal-blue/40 to-deep-blue border border-white/10 hover:from-royal-blue/50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(30,58,138,0.3)]"
        >
          <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Swords size={60} className="md:hidden" />
            <Swords size={100} className="hidden md:block" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Enter the Arena</h3>
          <p className="text-sm md:text-base text-white/60 mb-2 md:mb-4">
            {currentMatch ? (
              <span className="text-gold font-bold">
                Live: {currentMatch.teamA?.name} vs {currentMatch.teamB?.name}
              </span>
            ) : (
              "Go to current match"
            )}
          </p>
          <div className="inline-flex items-center gap-2 text-gold font-bold uppercase tracking-wider text-xs sm:text-sm">
            Play Now <Play size={14} className="sm:hidden" /><Play size={16} className="hidden sm:block" />
          </div>
        </Link>

        <Link
          to="/leaderboard"
          onClick={handleNavSound}
          className="group relative overflow-hidden p-5 md:p-8 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy size={60} className="md:hidden" />
            <Trophy size={100} className="hidden md:block" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gold mb-1 md:mb-2">Leaderboard</h3>
          <p className="text-sm md:text-base text-white/60">Check the standings and scores.</p>
        </Link>
      </div>

      <div className="w-full max-w-6xl px-2 sm:px-4">
        <RulesPanel />
      </div>
    </div>
  );
};
