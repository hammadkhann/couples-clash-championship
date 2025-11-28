import React from 'react';
import { Match } from '../../state/types';
import { clsx } from 'clsx';

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
        'relative w-full sm:w-72 lg:w-80 xl:w-96 p-4 sm:p-5 lg:p-6 rounded-xl border-2 transition-all cursor-pointer active:scale-95',
        isActive ? 'border-gold bg-royal-blue shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-100 sm:scale-105' : 'border-white/20 bg-deep-blue/50 hover:bg-white/5',
        isCompleted && 'opacity-75'
      )}
    >
      {/* Status Badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        {inProgress && (
          <span className="px-2 py-0.5 bg-gold text-deep-blue text-xs font-bold rounded-full animate-pulse">
            LIVE
          </span>
        )}
        {isCompleted && (
          <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
            DONE
          </span>
        )}
      </div>

      <div className="space-y-2 sm:space-y-3">
        <div className="text-xs sm:text-sm lg:text-base uppercase tracking-widest text-white/40 truncate text-center">
          {match.label || 'Match'}
        </div>
        {/* Team A */}
        <div className={clsx(
          'flex justify-between items-center p-3 lg:p-4 rounded text-base lg:text-lg',
          match.winnerId === match.teamA?.id ? 'bg-gold/20 text-gold font-bold' : 'text-white',
          match.loserId === match.teamA?.id && 'opacity-50'
        )}>
          <span className="truncate">{match.teamA?.name || 'TBD'}</span>
          <span className="font-mono text-xl lg:text-2xl">{match.score.teamA}</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Team B */}
        <div className={clsx(
          'flex justify-between items-center p-3 lg:p-4 rounded text-base lg:text-lg',
          match.winnerId === match.teamB?.id ? 'bg-gold/20 text-gold font-bold' : 'text-white',
          match.loserId === match.teamB?.id && 'opacity-50'
        )}>
          <span className="truncate">{match.teamB?.name || 'TBD'}</span>
          <span className="font-mono text-xl lg:text-2xl">{match.score.teamB}</span>
        </div>
      </div>
    </div>
  );
};
