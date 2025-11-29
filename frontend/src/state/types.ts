export type Theme = 'lyrics' | 'scene' | 'emoji' | 'trivia';

export interface Team {
  id: string;
  name: string;
  players: string[];
  score?: number; // cumulative leaderboard
}

export interface Challenge {
  id: string;
  theme: Theme;
  prompt: string;
  answer: string;
  metadata?: Record<string, string>;
}

export interface MatchScore {
  teamA: number;
  teamB: number;
  bestOf: number;
  currentChallenge: number;
}

export interface Match {
  id: string;
  label?: string;
  teamA: Team | null;
  teamB: Team | null;
  winnerId?: string;
  loserId?: string;
  score: MatchScore;
  status: 'pending' | 'in_progress' | 'completed';
  currentChallenge?: Challenge;
  activeTheme?: Theme;
  usedChallengeIds?: string[];
  disabledThemes?: Theme[];
  sourceA?: string | null;
  sourceB?: string | null;
}

export interface Settings {
  timers: {
    lyrics: number;
    scene: number;
    emoji: number;
    trivia: number;
  };
  scoring: {
    perCorrect: number;
    winBonus: number;
  };
}

export interface TournamentState {
  bracket: Match[];
  leaderboard: Team[];
  settings: Settings;
  currentMatchId?: string;
  globalUsedChallengeIds?: string[];  // Track used challenges across all matches
}
