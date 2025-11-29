import React, { useEffect, useMemo, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../hooks/useGame';
import { Timer } from '../shared/Timer';
import { StageAnnouncement } from '../shared/StageAnnouncement';
import { Theme } from '../../state/types';

type AnswerResult = 'correct' | 'wrong' | null;
type AnnouncementStage = 'semifinal' | 'final' | 'third' | 'champion' | 'tournament-end' | null;

// Confetti celebration function
const fireConfetti = (side: 'left' | 'right' | 'both') => {
  const duration = 5000;
  const end = Date.now() + duration;

  const colors = ['#fbbf24', '#fcd34d', '#d97706', '#ffffff', '#1e3a8a'];

  const frame = () => {
    if (Date.now() > end) return;

    if (side === 'left' || side === 'both') {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
        scalar: 1.2,
      });
    }
    if (side === 'right' || side === 'both') {
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
        scalar: 1.2,
      });
    }

    requestAnimationFrame(frame);
  };

  // Initial burst
  if (side === 'left' || side === 'both') {
    confetti({
      particleCount: 150,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.7 },
      colors,
      scalar: 1.5,
    });
  }
  if (side === 'right' || side === 'both') {
    confetti({
      particleCount: 150,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.7 },
      colors,
      scalar: 1.5,
    });
  }

  frame();
};

export const DuelPanel: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    setTheme,
    submitRound,
    playSfx,
    resetMatch,
    resetRound,
    nextChallenge,
    overrideScore,
    startMatch,
  } = useGame();

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [editTeamAScore, setEditTeamAScore] = useState('');
  const [editTeamBScore, setEditTeamBScore] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWinnerCelebration, setShowWinnerCelebration] = useState(false);
  const [winnerCelebrationData, setWinnerCelebrationData] = useState<{ name: string; matchType: string; scoreA: number; scoreB: number } | null>(null);
  const [stageAnnouncement, setStageAnnouncement] = useState<AnnouncementStage>(null);
  const [announcedMatches, setAnnouncedMatches] = useState<Set<string>>(new Set());
  const [lastCompletedMatch, setLastCompletedMatch] = useState<{ name: string; matchType: string; scoreA: number; scoreB: number } | null>(null);
  const [showTournamentEnd, setShowTournamentEnd] = useState(false);
  const [pendingNextMatch, setPendingNextMatch] = useState<string | null>(null); // matchId of next match to start
  
  // Track selected answers for each team
  const [teamAAnswer, setTeamAAnswer] = useState<AnswerResult>(null);
  const [teamBAnswer, setTeamBAnswer] = useState<AnswerResult>(null);
  const [timeoutPending, setTimeoutPending] = useState(false);
  
  // Track the last active match to detect completions
  const [lastActiveMatchId, setLastActiveMatchId] = useState<string | null>(null);

  const currentMatch = useMemo(() => state?.bracket.find((m) => m.id === state.currentMatchId), [state]);
  const challenge = currentMatch?.currentChallenge;
  const timerDuration = useMemo(() => {
    const defaults: Record<Theme, number> = {
      lyrics: 10,
      scene: 15,
      emoji: 25,
      trivia: 15,
    };
    if (challenge?.theme) {
      const fromState = state?.settings?.timers?.[challenge.theme];
      return fromState ?? defaults[challenge.theme];
    }
    return defaults.lyrics;
  }, [challenge?.theme, state?.settings?.timers]);

  // Find the match that just completed (for celebration)
  const completedMatch = useMemo(() => {
    if (!state || !lastActiveMatchId) return null;
    const match = state.bracket.find(m => m.id === lastActiveMatchId);
    if (match?.status === 'completed' && match.winnerId) {
      return match;
    }
    return null;
  }, [state, lastActiveMatchId]);
  
  // Track when we have an active match
  useEffect(() => {
    if (currentMatch?.id && currentMatch.status === 'in_progress') {
      setLastActiveMatchId(currentMatch.id);
    }
  }, [currentMatch?.id, currentMatch?.status]);

  const roundsPlayed = currentMatch?.score.currentChallenge ?? 0;
  const bestOf = currentMatch?.score.bestOf ?? 5;
  const matchCompleted = currentMatch?.status === 'completed';
  const hasChallenge = !!challenge;

  // Determine match type for announcements
  const matchType = useMemo(() => {
    if (!currentMatch) return null;
    const id = currentMatch.id;
    if (id === 'final') return 'final';
    if (id === 'third') return 'third';
    if (id.startsWith('sf')) return 'semifinal';
    return null;
  }, [currentMatch]);

  // Check if tournament is complete
  const isTournamentComplete = useMemo(() => {
    if (!state) return false;
    const finalMatch = state.bracket.find(m => m.id === 'final');
    const thirdMatch = state.bracket.find(m => m.id === 'third');
    return finalMatch?.status === 'completed' && thirdMatch?.status === 'completed';
  }, [state]);

  // Show stage announcement when entering a special match
  useEffect(() => {
    if (!currentMatch || !matchType) return;
    if (announcedMatches.has(currentMatch.id)) return;
    if (currentMatch.status !== 'in_progress') return;
    
    // Show announcement for semi-finals, finals, and 3rd place
    setStageAnnouncement(matchType as AnnouncementStage);
    setAnnouncedMatches(prev => new Set([...prev, currentMatch.id]));
  }, [currentMatch, matchType, announcedMatches]);
  
  // Determine winner - check if match is completed and has a winnerId
  const winnerTeam = useMemo(() => {
    if (!currentMatch) return null;
    if (currentMatch.status !== 'completed') return null;
    if (!currentMatch.winnerId) return null;
    // Determine which side won
    if (currentMatch.teamA?.id === currentMatch.winnerId) return 'A';
    if (currentMatch.teamB?.id === currentMatch.winnerId) return 'B';
    return null;
  }, [currentMatch]);

  const winnerName = useMemo(() => {
    if (winnerCelebrationData) return winnerCelebrationData.name;
    if (!currentMatch || !winnerTeam) return null;
    return winnerTeam === 'A' ? currentMatch.teamA?.name : currentMatch.teamB?.name;
  }, [currentMatch, winnerTeam, winnerCelebrationData]);

  // Show celebration when match is won
  useEffect(() => {
    // Use completedMatch which tracks the last active match even after currentMatchId is cleared
    const matchToCheck = completedMatch || currentMatch;
    if (!matchToCheck) return;
    if (matchToCheck.status !== 'completed') return;
    if (!matchToCheck.winnerId) return;
    if (showWinnerCelebration) return;
    
    // Determine match type
    const mType = matchToCheck.id === 'final' ? 'final' : 
                  matchToCheck.id === 'third' ? 'third' : 
                  matchToCheck.id.startsWith('sf') ? 'semifinal' : 'match';
    
    // Determine winner side
    const side = matchToCheck.teamA?.id === matchToCheck.winnerId ? 'A' : 'B';
    const winnerTeamName = side === 'A' ? matchToCheck.teamA?.name : matchToCheck.teamB?.name;
    const celebrationPayload = {
      name: winnerTeamName || 'Winner',
      matchType: mType,
      scoreA: matchToCheck.score.teamA,
      scoreB: matchToCheck.score.teamB,
    };
    
    // Small delay to ensure UI is ready
    const timer = setTimeout(() => {
      setWinnerCelebrationData(celebrationPayload);
      setShowWinnerCelebration(true);
      playSfx('win');
      
      // Fire confetti from both sides for celebration
      fireConfetti('both');
    }, 100);
    
    // Save match info for display after match ends
    setLastCompletedMatch(celebrationPayload);
    
    // For finals, show champion celebration
    if (mType === 'final') {
      setStageAnnouncement('champion');
    }
    
    return () => clearTimeout(timer);
  }, [completedMatch, currentMatch, showWinnerCelebration, playSfx]);

  useEffect(() => {
    setIsTimerRunning(false);
    setShowAnswer(false);
    setIsSubmitting(false);
    setTeamAAnswer(null);
    setTeamBAnswer(null);
    setTimeoutPending(false);
    setEditTeamAScore(currentMatch ? String(currentMatch.score.teamA) : '');
    setEditTeamBScore(currentMatch ? String(currentMatch.score.teamB) : '');
  }, [challenge?.id, currentMatch?.id]);

  // Reset celebration when match changes
  useEffect(() => {
    if (currentMatch?.status === 'in_progress') {
      setShowWinnerCelebration(false);
    }
  }, [currentMatch?.id, currentMatch?.status]);

  // Buttons disabled if match completed, no challenge, or submitting
  // Note: Timer is optional - buttons work even without starting timer
  const disableAnswerButtons = matchCompleted || !hasChallenge || isSubmitting;
  const disableActions = matchCompleted || !hasChallenge || isSubmitting;

  const handleRandomize = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentMatch) return;
    try {
      await setTheme(currentMatch.id, undefined);
    } catch (err) {
      console.error('Failed to set theme:', err);
    }
  }, [currentMatch, setTheme]);

  // Select answer for a team (doesn't submit yet)
  const selectTeamAnswer = useCallback((team: 'A' | 'B', result: 'correct' | 'wrong') => {
    setTimeoutPending(false);
    if (team === 'A') {
      setTeamAAnswer(prev => prev === result ? null : result);
    } else {
      setTeamBAnswer(prev => prev === result ? null : result);
    }
  }, []);

  // Auto-reveal answer when both teams have submitted their answers
  useEffect(() => {
    if (teamAAnswer !== null && teamBAnswer !== null && !showAnswer) {
      setShowAnswer(true);
    }
  }, [teamAAnswer, teamBAnswer, showAnswer]);

  // Submit both answers and advance to next question
  const confirmAnswers = useCallback(async () => {
    if (!challenge || !currentMatch || isSubmitting || teamAAnswer === null || teamBAnswer === null) return;
    setIsSubmitting(true);
    setIsTimerRunning(false);
    setTimeoutPending(false);
    setTimeoutPending(false);
    try {
      if (teamAAnswer === 'correct' || teamBAnswer === 'correct') playSfx('correct');
      else playSfx('wrong');
      await submitRound(currentMatch.id, teamAAnswer, teamBAnswer);
    } catch (err) {
      console.error('Submit round failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [challenge, currentMatch, isSubmitting, teamAAnswer, teamBAnswer, playSfx, submitRound]);

  const submitBoth = useCallback(async (resultA: 'correct' | 'wrong' | 'timeout', resultB: 'correct' | 'wrong' | 'timeout') => {
    if (!challenge || !currentMatch || disableActions) return;
    setIsSubmitting(true);
    setIsTimerRunning(false);
    try {
      if (resultA === 'correct' || resultB === 'correct') playSfx('correct');
      else if (resultA === 'timeout' || resultB === 'timeout') playSfx('timeout');
      else playSfx('wrong');
      await submitRound(currentMatch.id, resultA, resultB);
    } catch (err) {
      console.error('Submit round failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [challenge, currentMatch, disableActions, playSfx, submitRound]);

  const handleTimeout = useCallback(() => {
    setIsTimerRunning(false);
    setShowAnswer(true);
    setTeamAAnswer(null);
    setTeamBAnswer(null);
    setTimeoutPending(true);
    playSfx('timeout');
  }, [playSfx]);

  const handleStartTimer = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTimerRunning(true);
    playSfx('start');
  }, [playSfx]);

  const handlePauseTimer = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTimerRunning(false);
  }, []);

  const handleNextChallenge = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentMatch || matchCompleted || !hasChallenge || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (timeoutPending) {
        await submitRound(currentMatch.id, 'timeout', 'timeout');
        setTimeoutPending(false);
      } else {
        await nextChallenge(currentMatch.id);
      }
    } catch (err) {
      console.error('Next challenge failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentMatch, matchCompleted, hasChallenge, isSubmitting, nextChallenge, submitRound, timeoutPending]);

  const handleResetMatch = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentMatch) return;
    await resetMatch(currentMatch.id);
  }, [currentMatch, resetMatch]);

  const handleResetRound = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentMatch) return;
    await resetRound(currentMatch.id);
  }, [currentMatch, resetRound]);

  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case 'lyrics': return '🎵';
      case 'scene': return '🎬';
      case 'emoji': return '🧩';
      case 'trivia': return '❓';
      default: return '🎲';
    }
  };

  const applyScoreEdit = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentMatch) return;
    const aVal = editTeamAScore.trim();
    const bVal = editTeamBScore.trim();
    const a = aVal === '' ? undefined : Number(aVal);
    const b = bVal === '' ? undefined : Number(bVal);
    const payload: { teamAScore?: number; teamBScore?: number } = {};
    if (a !== undefined && !Number.isNaN(a)) payload.teamAScore = a;
    if (b !== undefined && !Number.isNaN(b)) payload.teamBScore = b;
    if (Object.keys(payload).length) {
      await overrideScore(currentMatch.id, payload);
    }
  }, [editTeamAScore, editTeamBScore, currentMatch, overrideScore]);

  // Check if all matches are complete for tournament end
  const allMatchesComplete = useMemo(() => {
    if (!state) return false;
    return state.bracket.every(m => m.status === 'completed');
  }, [state]);

  // Show tournament end screen when no current match and all complete
  useEffect(() => {
    if (!currentMatch && allMatchesComplete && !showTournamentEnd) {
      setShowTournamentEnd(true);
      // Fire massive celebration
      const colors = ['#fbbf24', '#fcd34d', '#d97706', '#ffffff', '#1e3a8a', '#10b981'];
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 180,
            origin: { y: 0.5, x: Math.random() },
            colors,
            scalar: 2,
          });
        }, i * 300);
      }
      playSfx('win');
    }
  }, [currentMatch, allMatchesComplete, showTournamentEnd, playSfx]);

    // If showing celebration, render it regardless of currentMatch state
  if (showWinnerCelebration && winnerCelebrationData) {
    return (
      <div className="w-full flex flex-col gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 relative">
        {/* Winner Celebration Overlay */}
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-deep-blue/95 backdrop-blur-md animate-fade-in">
          <div className="text-center space-y-6 sm:space-y-8 p-8 sm:p-12 animate-scale-in">
            <div className="text-6xl sm:text-8xl md:text-9xl animate-bounce">
              {winnerCelebrationData.matchType === 'final' ? '👑' : winnerCelebrationData.matchType === 'third' ? '🥉' : '🏆'}
            </div>
            <div className="space-y-4">
              <div className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-gold animate-pulse">
                {winnerCelebrationData.matchType === 'final' ? 'CHAMPIONS!' : winnerCelebrationData.matchType === 'third' ? '3RD PLACE!' : 'WINNER!'}
              </div>
              <div className="text-4xl sm:text-6xl md:text-7xl font-display font-black text-white">
                {winnerCelebrationData.name}
              </div>
              <div className="text-lg sm:text-2xl text-white/70">
                Final Score: {winnerCelebrationData.scoreA} - {winnerCelebrationData.scoreB}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                // Check if tournament is complete
                const finalMatch = state?.bracket.find(m => m.id === 'final');
                const thirdMatch = state?.bracket.find(m => m.id === 'third');
                const bothComplete = finalMatch?.status === 'completed' && thirdMatch?.status === 'completed';
                
                if (bothComplete) {
                  navigate('/leaderboard?celebrate=true');
                  return;
                }
                
                // Find next match
                const nextMatch = state?.bracket.find(m => 
                  m.id !== completedMatch?.id && 
                  (m.status === 'pending' || m.status === 'in_progress') &&
                  m.teamA && m.teamB
                );
                
                // Transition to pre-match screen (don't auto-start)
                setShowWinnerCelebration(false);
                setWinnerCelebrationData(null);
                setLastActiveMatchId(null);
                
                if (nextMatch) {
                  // Set pending match to show pre-match screen
                  setPendingNextMatch(nextMatch.id);
                } else {
                  navigate('/leaderboard?celebrate=true');
                }
              }}
              className="btn-primary px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl mt-4"
            >
              {isTournamentComplete ? 'View Final Standings →' : 'Next Duel →'}
            </button>
          </div>
        </div>
      </div>
    );
  }


  // Pre-match screen - show next match teams with Start button
  if (pendingNextMatch) {
    const nextMatchData = state?.bracket.find(m => m.id === pendingNextMatch);
    if (nextMatchData && nextMatchData.teamA && nextMatchData.teamB) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-4 md:p-8">
          <div className="text-center space-y-8 md:space-y-12 animate-fade-in max-w-4xl">
            <div className="text-2xl md:text-4xl text-white/60 uppercase tracking-widest font-medium">
              {nextMatchData.label || 'Next Match'}
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
              {/* Team A */}
              <div className="text-center space-y-3 flex-1">
                <div className="text-5xl md:text-7xl lg:text-8xl">🔥</div>
                <div className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white">
                  {nextMatchData.teamA.name}
                </div>
              </div>
              
              {/* VS */}
              <div className="text-4xl md:text-6xl font-display font-black text-gold animate-pulse">
                VS
              </div>
              
              {/* Team B */}
              <div className="text-center space-y-3 flex-1">
                <div className="text-5xl md:text-7xl lg:text-8xl">⚡</div>
                <div className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white">
                  {nextMatchData.teamB.name}
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setPendingNextMatch(null);
                startMatch(pendingNextMatch).catch(console.error);
              }}
              className="btn-primary px-12 md:px-20 py-4 md:py-6 text-xl md:text-3xl animate-bounce-slow"
            >
              🎮 Start Match! 🎮
            </button>
          </div>
        </div>
      );
    }
  }

  if (!currentMatch) {
    // Tournament complete - show grand finale
    if (allMatchesComplete || showTournamentEnd) {
      const finalMatch = state?.bracket.find(m => m.id === 'final');
      const champion = finalMatch?.winnerId === finalMatch?.teamA?.id 
        ? finalMatch?.teamA?.name 
        : finalMatch?.teamB?.name;
      
      return (
        <div className="h-full flex flex-col items-center justify-center p-4 md:p-8">
            <div className="text-center space-y-6 md:space-y-10 animate-scale-in">
            <div className="text-8xl md:text-[10rem] lg:text-[14rem] animate-bounce">👑</div>
            <div className="space-y-4 md:space-y-6">
              <div className="text-3xl md:text-5xl lg:text-7xl font-display font-bold text-gold animate-pulse">
                BASH CHAMPIONS!
              </div>
              <div className="text-5xl md:text-7xl lg:text-9xl font-display font-black text-white animate-glow">
                {champion || 'Champions'}
              </div>
              <div className="text-xl md:text-3xl text-white/60 mt-4">
                🎉 Congratulations! 🎉
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/leaderboard?celebrate=true')}
              className="btn-primary px-10 md:px-16 py-4 md:py-6 text-xl md:text-3xl mt-8"
            >
              🏆 View Final Standings 🏆
            </button>
          </div>
        </div>
      );
    }

    // Show last winner if we have one
    if (lastCompletedMatch) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-4 md:p-8">
          <div className="text-center space-y-6 md:space-y-8 animate-fade-in">
            <div className="text-6xl md:text-8xl lg:text-9xl">
              {lastCompletedMatch.matchType === 'final' ? '👑' : lastCompletedMatch.matchType === 'third' ? '🥉' : '🏆'}
            </div>
            <div className="space-y-4">
              <div className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-gold">
                {lastCompletedMatch.matchType === 'final' ? 'CHAMPIONS!' : 
                 lastCompletedMatch.matchType === 'third' ? '3RD PLACE!' : 'MATCH WINNER!'}
              </div>
              <div className="text-4xl md:text-6xl lg:text-8xl font-display font-black text-white">
                {lastCompletedMatch.name}
              </div>
              <div className="text-lg md:text-2xl text-white/70">
                Score: {lastCompletedMatch.scoreA} - {lastCompletedMatch.scoreB}
              </div>
            </div>
            <div className="text-white/50 text-base md:text-xl mt-8">
              Waiting for next match...
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex items-center justify-center text-white/50 text-xl md:text-3xl lg:text-4xl p-4 text-center">
        Select a match from the bracket to begin
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 relative">
      {/* Stage Announcement Overlay */}
      {stageAnnouncement && stageAnnouncement !== 'champion' && (
        <StageAnnouncement
          stage={stageAnnouncement}
          teamA={currentMatch?.teamA?.name}
          teamB={currentMatch?.teamB?.name}
          onComplete={() => setStageAnnouncement(null)}
        />
      )}

      {/* Champion Celebration (separate from regular winner) */}
      {stageAnnouncement === 'champion' && winnerName && (
        <StageAnnouncement
          stage="champion"
          winnerName={winnerName}
          onComplete={() => {
            setStageAnnouncement(null);
          }}
        />
      )}
      {/* Score Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center glass p-4 sm:p-6 rounded-2xl gap-4 sm:gap-8">
        <div className="text-center w-full sm:w-1/3 order-2 sm:order-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 truncate tracking-wide">{currentMatch.teamA?.name}</h2>
          <div className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-gold drop-shadow-lg">{currentMatch.score.teamA}</div>
        </div>
        <div className="text-center space-y-2 order-1 sm:order-2 w-full sm:w-auto flex flex-col items-center">
          <div className="text-xs uppercase tracking-[0.2em] text-white/60 font-medium">{currentMatch.label || 'Match'}</div>
          <div className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80">
            Best of {bestOf}
          </div>
          <div className="flex items-center gap-4 justify-center pt-2">
            <button 
              type="button"
              onClick={handleResetMatch} 
              className="text-xs text-white/40 hover:text-gold transition-colors uppercase tracking-wider"
            >
              Reset Match
            </button>
            <div className="w-px h-3 bg-white/20"></div>
            <button 
              type="button"
              onClick={handleResetRound} 
              className="text-xs text-white/40 hover:text-gold transition-colors uppercase tracking-wider"
            >
              Reset Round
            </button>
          </div>
        </div>
        <div className="text-center w-full sm:w-1/3 order-3">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 truncate tracking-wide">{currentMatch.teamB?.name}</h2>
          <div className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-gold drop-shadow-lg">{currentMatch.score.teamB}</div>
        </div>
      </div>

      {/* Challenge Area */}
      <div className="flex-1 min-h-0 panel flex flex-col items-center justify-center relative overflow-visible mt-4">
        {!challenge ? (
          <div className="text-center space-y-6 sm:space-y-8 z-10 w-full max-w-2xl px-2 animate-fade-in">
            <div className="relative inline-block">
              <div className="text-6xl sm:text-8xl animate-bounce-slow">🎲</div>
              <div className="absolute -top-2 -right-2 bg-gold text-deep-blue text-xs font-bold px-2 py-0.5 rounded-full border border-white/20 shadow-sm animate-pulse">
                Ready?
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-2">
              Next Challenge Awaits!
            </h3>
            <p className="text-white/60 text-lg">
              Spin the wheel to determine the category.
            </p>
            <div className="mt-8">
              <button 
                type="button"
                onClick={handleRandomize} 
                className="btn-primary w-full sm:w-auto px-12 py-4 text-lg sm:text-xl touch-manipulation shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]"
              >
                🎰 Spin for Theme
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-7xl flex flex-col gap-2 sm:gap-3 md:gap-4 z-10">
            {/* Theme and Controls Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gold text-deep-blue font-bold rounded-full text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
                {getThemeIcon(challenge.theme)} {challenge.theme}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
                {!isTimerRunning ? (
                  <button
                    type="button"
                    onClick={handleStartTimer}
                    className="btn-primary px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base touch-manipulation"
                    disabled={disableActions}
                  >
                    ▶ Start
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePauseTimer}
                    className="btn-secondary px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-red-500/20 border-red-500/50 hover:bg-red-500/30 touch-manipulation"
                  >
                    ⏸ Pause
                  </button>
                )}
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleTimeout(); }} 
                  className="btn-secondary px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base touch-manipulation" 
                  disabled={disableActions}
                >
                  ⏱ Timeout
                </button>
                <button
                  type="button"
                  onClick={handleNextChallenge}
                  className="btn-secondary px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base touch-manipulation"
                  disabled={matchCompleted || !hasChallenge || isSubmitting}
                >
                  ➡ Next
                </button>
              </div>
            </div>

            {/* Challenge Content with Timer */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 lg:gap-10">
              <div className="flex-1 space-y-2 sm:space-y-3 md:space-y-4 text-center md:text-left order-2 md:order-1">
                <div className="text-white/60 text-xs sm:text-sm uppercase tracking-widest">Round {Math.min(roundsPlayed + 1, bestOf)} of {bestOf}</div>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight break-words">
                  {challenge.prompt}
                </div>
                {challenge.metadata?.hint && (
                  <div className="text-sm sm:text-base md:text-lg text-white/60 italic">Hint: {challenge.metadata.hint}</div>
                )}
                <div className="text-center md:text-left">
                  {showAnswer ? (
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gold font-bold animate-bounce-slow">
                      {challenge.answer}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAnswer(true)}
                      className="text-white/40 hover:text-white active:text-white transition-colors text-[10px] sm:text-xs uppercase tracking-widest touch-manipulation"
                    >
                      (Reveal Answer)
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 order-1 md:order-2">
                <Timer
                  key={challenge.id}
                  duration={timerDuration}
                  isRunning={isTimerRunning}
                  onComplete={handleTimeout}
                />
              </div>
            </div>

            {/* Team Scoring Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="glass p-6 rounded-xl space-y-4 transition-all hover:bg-white/10">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50 text-center">{currentMatch.teamA?.name || 'Team A'}</div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); selectTeamAnswer('A', 'correct'); }} 
                    className={`flex-1 py-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-all ${
                      teamAAnswer === 'correct' 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' 
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30'
                    } ${disableAnswerButtons ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={disableAnswerButtons}
                  >
                    Correct
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); selectTeamAnswer('A', 'wrong'); }} 
                    className={`flex-1 py-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-all ${
                      teamAAnswer === 'wrong' 
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105' 
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30'
                    } ${disableAnswerButtons ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={disableAnswerButtons}
                  >
                    Wrong
                  </button>
                </div>
              </div>
              <div className="glass p-6 rounded-xl space-y-4 transition-all hover:bg-white/10">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50 text-center">{currentMatch.teamB?.name || 'Team B'}</div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); selectTeamAnswer('B', 'correct'); }} 
                    className={`flex-1 py-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-all ${
                      teamBAnswer === 'correct' 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' 
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30'
                    } ${disableAnswerButtons ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={disableAnswerButtons}
                  >
                    Correct
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); selectTeamAnswer('B', 'wrong'); }} 
                    className={`flex-1 py-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-all ${
                      teamBAnswer === 'wrong' 
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105' 
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30'
                    } ${disableAnswerButtons ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={disableAnswerButtons}
                  >
                    Wrong
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm Button - only shows when both teams have selections */}
            {(teamAAnswer !== null || teamBAnswer !== null) && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmAnswers(); }}
                  disabled={teamAAnswer === null || teamBAnswer === null || isSubmitting}
                  className={`px-12 py-4 text-lg font-bold rounded-full uppercase tracking-widest transition-all touch-manipulation shadow-xl ${
                    teamAAnswer !== null && teamBAnswer !== null
                      ? 'bg-gold text-deep-blue hover:bg-white hover:scale-105 active:scale-95 animate-pulse-fast'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {teamAAnswer !== null && teamBAnswer !== null 
                    ? 'Confirm & Next' 
                    : `Select ${teamAAnswer === null ? (teamBAnswer === null ? 'both teams' : 'Team A') : 'Team B'}`}
                </button>
              </div>
            )}

            {/* Advanced Controls Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="text-white/60 hover:text-white active:text-white text-xs sm:text-sm underline touch-manipulation"
              >
                {showAdvanced ? 'Hide advanced controls' : 'Show advanced controls'}
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); submitBoth('correct', 'correct'); }} 
                    className="btn-secondary text-xs sm:text-sm touch-manipulation" 
                    disabled={disableActions}
                  >
                    Both Correct
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); submitBoth('wrong', 'wrong'); }} 
                    className="btn-secondary text-xs sm:text-sm touch-manipulation" 
                    disabled={disableActions}
                  >
                    Both Wrong
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); submitBoth('correct', 'wrong'); }} 
                    className="btn-secondary text-xs sm:text-sm touch-manipulation" 
                    disabled={disableActions}
                  >
                    A ✓ / B ✗
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); submitBoth('wrong', 'correct'); }} 
                    className="btn-secondary text-xs sm:text-sm touch-manipulation" 
                    disabled={disableActions}
                  >
                    A ✗ / B ✓
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="text-[10px] sm:text-xs text-white/60">Score {currentMatch.teamA?.name || 'A'}</label>
                    <input
                      className="w-full mt-1 rounded-md bg-white/10 border border-white/20 px-2 sm:px-3 py-1.5 sm:py-2 text-white text-sm"
                      value={editTeamAScore}
                      onChange={(e) => setEditTeamAScore(e.target.value)}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs text-white/60">Score {currentMatch.teamB?.name || 'B'}</label>
                    <input
                      className="w-full mt-1 rounded-md bg-white/10 border border-white/20 px-2 sm:px-3 py-1.5 sm:py-2 text-white text-sm"
                      value={editTeamBScore}
                      onChange={(e) => setEditTeamBScore(e.target.value)}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button 
                      type="button"
                      onClick={applyScoreEdit} 
                      className="btn-primary px-3 sm:px-4 text-xs sm:text-sm touch-manipulation"
                    >
                      Update Scores
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
