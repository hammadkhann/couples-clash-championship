import React from 'react';
import { Match } from '../../state/types';
import { clsx } from 'clsx';
import { Crown } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  isActive?: boolean;
  onClick?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, isActive, onClick }) => {
  const isCompleted = match.status === 'completed';
  const inProgress = match.status === 'in_progress';

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative w-full sm:w-72 lg:w-80 xl:w-96 p-1 rounded-xl transition-all cursor-pointer active:scale-95 group',
        isActive ? 'scale-100 sm:scale-105 z-10' : 'hover:scale-[1.02] z-0'
      )}
    >
      {/* Gradient Border */}
      <div className={clsx(
        "absolute inset-0 rounded-xl bg-gradient-to-br opacity-50 transition-opacity",
        isActive ? "from-gold via-white to-gold opacity-100 animate-pulse-fast" : "from-white/20 to-white/5 group-hover:opacity-100"
      )} />

      {/* Status Badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
        {inProgress && (
          <span className="px-3 py-1 bg-gold text-deep-blue text-xs font-bold rounded-full animate-pulse shadow-lg border border-white/20">
            LIVE
          </span>
        )}
        {isCompleted && (
          <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg border border-white/20">
            DONE
          </span>
        )}
      </div>

      <div className={clsx(
        "relative h-full bg-deep-blue rounded-[10px] p-4 sm:p-5 lg:p-6 overflow-hidden",
        isActive ? "bg-royal-blue/80" : "bg-deep-blue/90"
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

        <div className="space-y-2 sm:space-y-3 relative z-10">
          <div className="text-xs sm:text-sm lg:text-base uppercase tracking-widest text-white/40 truncate text-center font-display">
            {match.label || 'Match'}
          </div>
          
          {/* Team A */}
          <div className={clsx(
            'flex justify-between items-center p-3 lg:p-4 rounded-lg transition-colors',
            match.winnerId === match.teamA?.id ? 'bg-gold/20 text-gold font-bold border border-gold/30' : 'bg-white/5 text-white border border-white/5',
            match.loserId === match.teamA?.id && 'opacity-50 grayscale'
          )}>
            <div className="flex items-center gap-2 min-w-0">
              {match.winnerId === match.teamA?.id && <Crown size={16} className="text-gold shrink-0" fill="currentColor" />}
              <span className="truncate">{match.teamA?.name || 'TBD'}</span>
            </div>
            <span className="font-mono text-xl lg:text-2xl font-bold">{match.score.teamA}</span>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center gap-2 opacity-30">
            <div className="h-px w-full bg-white" />
            <span className="text-xs font-bold">VS</span>
            <div className="h-px w-full bg-white" />
          </div>

          {/* Team B */}
          <div className={clsx(
            'flex justify-between items-center p-3 lg:p-4 rounded-lg transition-colors',
            match.winnerId === match.teamB?.id ? 'bg-gold/20 text-gold font-bold border border-gold/30' : 'bg-white/5 text-white border border-white/5',
            match.loserId === match.teamB?.id && 'opacity-50 grayscale'
          )}>
            <div className="flex items-center gap-2 min-w-0">
              {match.winnerId === match.teamB?.id && <Crown size={16} className="text-gold shrink-0" fill="currentColor" />}
              <span className="truncate">{match.teamB?.name || 'TBD'}</span>
            </div>
            <span className="font-mono text-xl lg:text-2xl font-bold">{match.score.teamB}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
