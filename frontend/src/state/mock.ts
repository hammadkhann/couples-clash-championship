import { TournamentState, Team, Match } from './types';

const teams: Team[] = [
  { id: 't1', name: 'Manaal & Ahmed', players: ['Manaal', 'Ahmed'], score: 0 },
  { id: 't2', name: 'Samia & Rafay', players: ['Samia', 'Rafay'], score: 0 },
  { id: 't3', name: 'Shahir & Laibah', players: ['Shahir', 'Laibah'], score: 0 },
  { id: 't4', name: 'Rafay & Anum', players: ['Rafay', 'Anum'], score: 0 },
  { id: 't5', name: 'Sadia & Daniyaal', players: ['Sadia', 'Daniyaal'], score: 0 },
  { id: 't6', name: 'Maaz & Misbah', players: ['Maaz', 'Misbah'], score: 0 },
  { id: 't7', name: 'Javeria & Osama', players: ['Javeria', 'Osama'], score: 0 },
  { id: 't8', name: 'Dua & Amal', players: ['Dua', 'Amal'], score: 0 },
];

const createMatch = (id: string, tA: Team | null, tB: Team | null): Match => ({
  id,
  teamA: tA,
  teamB: tB,
  score: { teamA: 0, teamB: 0, bestOf: 5, currentChallenge: 0 },
  status: 'pending',
});

export const MOCK_STATE: TournamentState = {
  settings: {
    timers: { lyrics: 20, scene: 25, emoji: 15, trivia: 20 },
    scoring: { perCorrect: 1, winBonus: 2 },
  },
  leaderboard: teams,
  bracket: [
    // Quarter Finals
    createMatch('m1', teams[0], teams[1]),
    createMatch('m2', teams[2], teams[3]),
    createMatch('m3', teams[4], teams[5]),
    createMatch('m4', teams[6], teams[7]),
    // Semi Finals
    createMatch('m5', null, null),
    createMatch('m6', null, null),
    // Finals
    createMatch('m7', null, null),
    // 3rd Place
    createMatch('m8', null, null),
  ],
  currentMatchId: 'm1',
};
