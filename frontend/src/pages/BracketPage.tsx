import React from 'react';
import { BracketView } from '../components/bracket/BracketView';

export const BracketPage: React.FC = () => {
  return (
    <div className="flex flex-col pb-8">
      <div className="text-center mb-2 sm:mb-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white">Couples Clash Gauntlet</h1>
        <p className="text-sm sm:text-base text-white/50">The road to Half-Birthday glory</p>
      </div>
      <div className="bg-black/20 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/10">
        <BracketView />
      </div>
    </div>
  );
};
