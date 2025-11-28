import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import { TournamentState, Theme } from '../state/types';
import { MOCK_STATE } from '../state/mock';

interface GameContextType {
  state: TournamentState | null;
  isConnected: boolean;
  refreshState: () => Promise<void>;
  startMatch: (matchId: string) => Promise<void>;
  setTheme: (matchId: string, theme?: Theme, disabled?: Theme[]) => Promise<void>;
  submitChallenge: (matchId: string, team: 'A' | 'B', result: 'correct' | 'wrong' | 'timeout') => Promise<void>;
  advanceMatch: (matchId: string, winnerId: string) => Promise<void>;
  playSfx: (event: string) => Promise<void>;
  overrideScore: (matchId: string, updates: { teamAScore?: number; teamBScore?: number }) => Promise<void>;
  lastSfx: string | null;
  resetMatch: (matchId: string) => Promise<void>;
  resetTournament: () => Promise<void>;
  submitRound: (matchId: string, teamA: 'correct' | 'wrong' | 'timeout', teamB: 'correct' | 'wrong' | 'timeout') => Promise<void>;
  resetRound: (matchId: string) => Promise<void>;
  nextChallenge: (matchId: string) => Promise<void>;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

// Dynamically determine backend URL based on current host (for network access)
const getBackendUrl = () => {
  // In production/Docker, backend serves the frontend, so use same host
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:8000';
};

const BACKEND_URL = getBackendUrl();

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TournamentState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSfx, setLastSfx] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const refreshState = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/state`);
      if (!res.ok) throw new Error('Backend not available');
      const data = await res.json();
      setState(data);
    } catch (err) {
      console.warn('Failed to fetch state, using mock data:', err);
      setState(MOCK_STATE);
    }
  }, []);

  useEffect(() => {
    const wsUrl = BACKEND_URL.replace('http', 'ws') + '/ws';
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case 'state:update':
            setState(message.data as TournamentState);
            break;
          case 'sfx':
            setLastSfx(`${message.event}-${Date.now()}`);
            break;
          case 'match:start':
          case 'challenge:new':
          case 'score:update':
          case 'match:advance':
            // State updates follow; rely on state:update
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    refreshState();

    return () => {
      ws.close();
    };
  }, [refreshState]);

  const startMatch = async (matchId: string) => {
    await fetch(`${BACKEND_URL}/start-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId }),
    });
  };

  // Auto-select next available match when none active
  useEffect(() => {
    if (!state || state.currentMatchId) return;
    const next = state.bracket.find((m) => m.status === 'in_progress');
    if (next) {
      startMatch(next.id).catch(() => undefined);
      return;
    }
    const pending = state.bracket.find((m) => m.status === 'pending' && m.teamA && m.teamB);
    if (pending) {
      startMatch(pending.id).catch(() => undefined);
    }
  }, [state]);

  const setTheme = async (matchId: string, theme?: Theme, disabled?: Theme[]) => {
    await fetch(`${BACKEND_URL}/theme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, theme, disabled }),
    });
  };

  const submitChallenge = async (matchId: string, team: 'A' | 'B', result: 'correct' | 'wrong' | 'timeout') => {
    await fetch(`${BACKEND_URL}/submit-challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, team, result }),
    });
  };

  const advanceMatch = async (matchId: string, winnerId: string) => {
    await fetch(`${BACKEND_URL}/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, winnerId }),
    });
  };

  const playSfx = async (event: string) => {
    await fetch(`${BACKEND_URL}/sfx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event }),
    });
  };

  const overrideScore = async (matchId: string, updates: { teamAScore?: number; teamBScore?: number }) => {
    await fetch(`${BACKEND_URL}/override-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, ...updates }),
    });
  };

  const submitRound = async (
    matchId: string,
    teamA: 'correct' | 'wrong' | 'timeout',
    teamB: 'correct' | 'wrong' | 'timeout',
  ) => {
    await fetch(`${BACKEND_URL}/submit-round`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, teamA, teamB }),
    });
  };

  const resetMatch = async (matchId: string) => {
    await fetch(`${BACKEND_URL}/reset-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId }),
    });
  };

  const resetRound = async (matchId: string) => {
    await fetch(`${BACKEND_URL}/reset-round`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId }),
    });
  };

  const nextChallenge = async (matchId: string) => {
    await fetch(`${BACKEND_URL}/next-challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId }),
    });
  };

  const resetTournament = async () => {
    if (!confirm('Are you sure you want to reset the ENTIRE tournament? This cannot be undone.')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  return (
    <GameContext.Provider
      value={{
        state,
        isConnected,
        refreshState,
        startMatch,
        setTheme,
        submitChallenge,
        advanceMatch,
        playSfx,
        overrideScore,
        lastSfx,
        resetMatch,
        resetTournament,
        submitRound,
        resetRound,
        nextChallenge,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
