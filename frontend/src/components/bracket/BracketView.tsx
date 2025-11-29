import React from 'react';
import { useGame } from '../../hooks/useGame';
import { MatchCard } from './MatchCard';

// Unified Connector Component
const BracketConnector: React.FC<{
  type: 'merge' | 'single';
  height?: string;
  width?: string;
}> = ({ type, height = 'h-full', width = 'w-16' }) => {
  return (
    <div className={`relative flex items-center ${height} ${width}`}>
      {/* CSS Implementation with SVG Arrow */}
      {type === 'merge' ? (
        <div className="w-full h-full flex flex-col">
          {/* Top Half - Connects top-left to center */}
          <div className="flex-1 flex relative">
             {/* The box sits in the bottom-right quadrant of the top half */}
             <div className="absolute bottom-0 right-1/2 w-1/2 h-1/2 border-t-2 border-r-2 border-gold rounded-tr-xl drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
          </div>
          {/* Bottom Half - Connects bottom-left to center */}
          <div className="flex-1 flex relative">
             {/* The box sits in the top-right quadrant of the bottom half */}
             <div className="absolute top-0 right-1/2 w-1/2 h-1/2 border-b-2 border-r-2 border-gold rounded-br-xl drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
          </div>
          {/* Horizontal line extension with arrow */}
          <div className="absolute top-1/2 right-0 w-1/2 h-0.5 bg-gold -translate-y-1/2 flex items-center justify-end drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]">
             {/* Arrowhead */}
             <div className="translate-x-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" className="text-gold fill-current">
                   <path d="M0,0 L10,6 L0,12 Z" />
                </svg>
             </div>
          </div>
        </div>
      ) : (
        // Single straight line
        <div className="w-full h-full flex items-center justify-center relative">
           <div className="w-full h-0.5 bg-gold flex items-center justify-end drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]">
              <div className="translate-x-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" className="text-gold fill-current">
                   <path d="M0,0 L10,6 L0,12 Z" />
                </svg>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export const BracketView: React.FC = () => {
  const { state, startMatch, playSfx } = useGame();

  if (!state) return <div className="text-white p-4">Loading bracket...</div>;

  const { bracket, currentMatchId } = state;

  const lookup = (id: string) => bracket.find((m) => m.id === id);
  const final = lookup('final') || bracket.find((m) => m.label?.toLowerCase().includes('final'));
  const thirdPlace = lookup('third') || bracket.find((m) => m.label?.toLowerCase().includes('third'));
  const groupStage = (() => {
    const ordered = ['g1', 'g2', 'g3', 'g4', 'group1', 'group2', 'group3', 'group4', 'qf1', 'qf2', 'qf3', 'qf4']
      .map(lookup)
      .filter(Boolean);
    if (ordered.length) return ordered;
    return bracket.filter((m) => !m.sourceA && !m.sourceB && m.id !== final?.id && m.id !== thirdPlace?.id);
  })();
  const semis = (() => {
    const byId = ['sf1', 'sf2'].map(lookup).filter(Boolean);
    if (byId.length) return byId;
    return bracket.filter((m) => m.label?.toLowerCase().includes('semi') || m.id.toLowerCase().includes('sf'));
  })();

  const handleMatchClick = (matchId: string) => {
    playSfx('start');
    startMatch(matchId);
  };

  return (
    <div className="p-2 md:p-4">
      {/* Mobile View - Stacked */}
      <div className="lg:hidden space-y-4">
        {/* Group Stage */}
        <div className="space-y-2">
          <h3 className="text-center text-white/50 font-display tracking-widest text-xs uppercase">Group Stage</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {groupStage.map((match) =>
              match ? (
                <MatchCard
                  key={match.id}
                  match={match}
                  isActive={match.id === currentMatchId}
                  onClick={() => handleMatchClick(match.id)}
                />
              ) : null
            )}
          </div>
        </div>

        {/* Semi Finals */}
        <div className="space-y-2">
          <h3 className="text-center text-white/50 font-display tracking-widest text-xs uppercase">Semi Finals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {semis.map((match) =>
              match ? (
                <MatchCard
                  key={match.id}
                  match={match}
                  isActive={match.id === currentMatchId}
                  onClick={() => handleMatchClick(match.id)}
                />
              ) : null
            )}
          </div>
        </div>

        {/* Grand Finale */}
        <div className="space-y-3">
          <h3 className="text-center text-gold text-lg font-display font-bold tracking-widest">🏆 GRAND FINALE 🏆</h3>
          {final && (
            <div className="flex justify-center">
              <MatchCard
                match={final}
                isActive={final.id === currentMatchId}
                onClick={() => handleMatchClick(final.id)}
              />
            </div>
          )}
        </div>

        {/* 3rd Place - Played AFTER Finals */}
        {thirdPlace && (
          <div className="space-y-3">
            <h3 className="text-center text-amber-500 text-base font-display font-semibold tracking-widest">🥉 3RD PLACE MATCH 🥉</h3>
            <div className="flex justify-center">
              <MatchCard
                match={thirdPlace}
                isActive={thirdPlace.id === currentMatchId}
                onClick={() => handleMatchClick(thirdPlace.id)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop View - Horizontal Bracket with CSS Connectors */}
      <div className="hidden lg:flex lg:items-center lg:justify-center mx-auto h-full">
        <div className="flex items-stretch justify-center scale-[0.85] xl:scale-90 2xl:scale-100 origin-center">
          
          {/* ROUND 1: Group Stage */}
          <div className="flex flex-col">
            <h3 className="text-center text-white/50 font-display tracking-widest text-sm mb-4">Group Stage</h3>
            
            {/* Top bracket (GS1 + GS2 → SF1) */}
            <div className="flex items-center">
              {/* GS1 & GS2 matches */}
              <div className="flex flex-col gap-4">
                {groupStage.slice(0, 2).map((match) =>
                  match ? (
                    <MatchCard
                      key={match.id}
                      match={match}
                      isActive={match.id === currentMatchId}
                      onClick={() => handleMatchClick(match.id)}
                    />
                  ) : null
                )}
              </div>
              
              {/* Connector: GS1+GS2 → SF1 */}
              <BracketConnector type="merge" width="w-20" />
              
              {/* SF1 */}
              <div>
                {semis[0] && (
                  <MatchCard
                    match={semis[0]}
                    isActive={semis[0].id === currentMatchId}
                    onClick={() => semis[0] && handleMatchClick(semis[0].id)}
                  />
                )}
              </div>
            </div>
            
            {/* Spacer between top and bottom bracket */}
            <div className="h-12" />
            
            {/* Bottom bracket (GS3 + GS4 → SF2) */}
            <div className="flex items-center">
              {/* GS3 & GS4 matches */}
              <div className="flex flex-col gap-4">
                {groupStage.slice(2, 4).map((match) =>
                  match ? (
                    <MatchCard
                      key={match.id}
                      match={match}
                      isActive={match.id === currentMatchId}
                      onClick={() => handleMatchClick(match.id)}
                    />
                  ) : null
                )}
              </div>
              
              {/* Connector: GS3+GS4 → SF2 */}
              <BracketConnector type="merge" width="w-20" />
              
              {/* SF2 */}
              <div>
                {semis[1] && (
                  <MatchCard
                    match={semis[1]}
                    isActive={semis[1].id === currentMatchId}
                    onClick={() => semis[1] && handleMatchClick(semis[1].id)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ROUND 2: SF → Finals Connector */}
          <div className="flex flex-col justify-center mx-2">
            {/* This connects the entire SF column to Finals */}
            <div className="flex items-center h-full">
              <BracketConnector type="merge" width="w-24" />
            </div>
          </div>

          {/* FINALS COLUMN */}
          <div className="flex flex-col justify-center">
            <div>
              <h3 className="text-center text-gold text-xl font-display font-bold tracking-widest mb-4">🏆 GRAND FINALE 🏆</h3>
              {final && (
                <MatchCard
                  match={final}
                  isActive={final.id === currentMatchId}
                  onClick={() => handleMatchClick(final.id)}
                />
              )}
            </div>
          </div>

          {/* 3RD PLACE - Separate section after Finals */}
          {thirdPlace && (
            <>
              <div className="w-12" /> {/* Spacer */}
              <div className="flex flex-col justify-center">
                <div>
                  <h3 className="text-center text-amber-500 text-lg font-display font-semibold tracking-widest mb-4">🥉 3RD PLACE 🥉</h3>
                  <MatchCard
                    match={thirdPlace}
                    isActive={thirdPlace.id === currentMatchId}
                    onClick={() => handleMatchClick(thirdPlace.id)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
