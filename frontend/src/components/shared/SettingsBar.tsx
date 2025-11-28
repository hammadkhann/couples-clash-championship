import React from 'react';
import { useGame } from '../../hooks/useGame';
import { RefreshCw, Trash2 } from 'lucide-react';

export const SettingsBar: React.FC = () => {
  const { isConnected, refreshState, resetTournament, playSfx } = useGame();

  const handleRefresh = () => {
    playSfx('start');
    refreshState();
  };

  const handleReset = () => {
    playSfx('start');
    resetTournament();
  };

  return (
    <div className="h-10 sm:h-12 bg-deep-blue border-t border-white/10 flex items-center justify-between px-3 sm:px-6 text-xs sm:text-sm shrink-0 z-50 relative">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-white/50 hidden sm:inline">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <button onClick={handleRefresh} className="text-white/50 hover:text-white active:text-white flex items-center gap-1.5 sm:gap-2 touch-manipulation">
          <RefreshCw size={14} /> <span className="hidden sm:inline">Refresh</span>
        </button>
        <button onClick={handleReset} className="text-red-500/50 hover:text-red-500 active:text-red-500 flex items-center gap-1.5 sm:gap-2 ml-2 sm:ml-4 touch-manipulation">
          <Trash2 size={14} /> <span className="hidden sm:inline">Reset App</span>
        </button>
      </div>
    </div>
  );
};
