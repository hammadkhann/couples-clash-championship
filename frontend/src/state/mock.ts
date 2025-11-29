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

const createMatch = (id: string, label: string, tA: Team | null, tB: Team | null, sourceA: string | null = null, sourceB: string | null = null): Match => ({
  id,
  label,
  teamA: tA,
  teamB: tB,
  sourceA,
  sourceB,
  score: { teamA: 0, teamB: 0, bestOf: 5, currentChallenge: 0 },
  status: 'pending',
});

export const MOCK_STATE: TournamentState = {
  settings: {
    timers: { lyrics: 10, scene: 15, emoji: 25, trivia: 15 },
    scoring: { perCorrect: 1, winBonus: 2 },
  },
  leaderboard: teams,
  bracket: [
    // Group Stage
    createMatch('qf1', 'Group Stage 1', teams[0], teams[1]),
    createMatch('qf2', 'Group Stage 2', teams[2], teams[3]),
    createMatch('qf3', 'Group Stage 3', teams[4], teams[5]),
    createMatch('qf4', 'Group Stage 4', teams[6], teams[7]),
    // Semi Finals
    createMatch('sf1', 'Semifinal 1', null, null, 'qf1', 'qf2'),
    createMatch('sf2', 'Semifinal 2', null, null, 'qf3', 'qf4'),
    // Finals
    createMatch('final', 'Final', null, null, 'sf1', 'sf2'),
    // 3rd Place
    createMatch('third', 'Third Place', null, null, 'sf1', 'sf2'),
  ],
  currentMatchId: 'qf1',
};
