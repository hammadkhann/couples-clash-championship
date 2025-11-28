import React from 'react';
import { DuelPanel } from '../components/duel/DuelPanel';

export const DuelPage: React.FC = () => {
  return (
    <div className="pb-8">
      <div className="bg-gradient-to-b from-royal-blue/10 to-transparent rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-sm min-h-[70vh]">
        <DuelPanel />
      </div>
    </div>
  );
};
