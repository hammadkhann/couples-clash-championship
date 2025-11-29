import json
import random
import uuid
from pathlib import Path
from typing import Dict, List, Optional

from .content_loader import load_all
from .models import Challenge, Match, MatchScore, Settings, Team, Theme, TournamentState

STATE_PATH = Path(__file__).resolve().parents[2] / "state" / "tournament.json"

DEFAULT_TIMERS = {
    "lyrics": 10,
    "scene": 15,
    "emoji": 25,
    "trivia": 15,
}

DEFAULT_SETTINGS = Settings(
    timers=DEFAULT_TIMERS,
    scoring={"perCorrect": 1, "winBonus": 2},
)

def _fresh_default_teams() -> List[Team]:
    # Return new Team objects so reset doesn't reuse mutated defaults
    return [Team(id=t.id, name=t.name, players=list(t.players), score=0) for t in DEFAULT_TEAMS]

DEFAULT_TEAMS = [
    Team(id=str(uuid.uuid4()), name="Manaal & Ahmed", players=["Manaal", "Ahmed"]),
    Team(id=str(uuid.uuid4()), name="Samia & Rafay", players=["Samia", "Rafay"]),
    Team(id=str(uuid.uuid4()), name="Shahir & Laibah", players=["Shahir", "Laibah"]),
    Team(id=str(uuid.uuid4()), name="Rafay & Anum", players=["Rafay", "Anum"]),
    Team(id=str(uuid.uuid4()), name="Sadia & Daniyaal", players=["Sadia", "Daniyaal"]),
    Team(id=str(uuid.uuid4()), name="Maaz & Misbah", players=["Maaz", "Misbah"]),
    Team(id=str(uuid.uuid4()), name="Javeria & Osama", players=["Javeria", "Osama"]),
    Team(id=str(uuid.uuid4()), name="Dua & Amal", players=["Dua", "Amal"]),
]


def _make_match(match_id: str, label: str, teamA: Optional[Team], teamB: Optional[Team], sourceA: Optional[str], sourceB: Optional[str]) -> Match:
    return Match(
        id=match_id,
        label=label,
        teamA=teamA,
        teamB=teamB,
        sourceA=sourceA,
        sourceB=sourceB,
        status="pending",
        score=MatchScore(bestOf=5),
    )


class GameState:
    def __init__(self):
        self.content: Dict[Theme, List[Challenge]] = load_all()
        saved = self._load()
        if saved:
            self.state = saved
            self._normalize_bracket_labels()
            self._normalize_settings()
        else:
            self.state = self._bootstrap(DEFAULT_TEAMS, DEFAULT_SETTINGS)
            self._persist()

    # persistence helpers
    def _load(self) -> Optional[TournamentState]:
        if not STATE_PATH.exists():
            return None
        data = json.loads(STATE_PATH.read_text())
        try:
            return TournamentState.model_validate(data)
        except Exception:
            return None

    def _persist(self) -> None:
        STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
        STATE_PATH.write_text(self.state.model_dump_json(indent=2))

    def _normalize_bracket_labels(self) -> None:
        label_map = {
            "qf1": "Group Stage 1",
            "qf2": "Group Stage 2",
            "qf3": "Group Stage 3",
            "qf4": "Group Stage 4",
            "sf1": "Semifinal 1",
            "sf2": "Semifinal 2",
            "final": "Final",
            "third": "Third Place",
        }
        changed = False
        for match in self.state.bracket:
            if match.id in label_map and match.label != label_map[match.id]:
                match.label = label_map[match.id]
                changed = True
        if changed:
            self._persist()

    def _normalize_settings(self) -> None:
        changed = False
        timers = self.state.settings.timers
        for theme, value in DEFAULT_TIMERS.items():
            if timers.get(theme) != value:
                timers[theme] = value
                changed = True
        if changed:
            self._persist()

    # setup helpers
    def _bootstrap(self, teams: List[Team], settings: Settings) -> TournamentState:
        if len(teams) < 8:
            raise ValueError("Need at least 8 teams to seed bracket")
        seeded = teams[:8]
        bracket = [
            _make_match("qf1", "Group Stage 1", seeded[0], seeded[1], None, None),
            _make_match("qf2", "Group Stage 2", seeded[2], seeded[3], None, None),
            _make_match("qf3", "Group Stage 3", seeded[4], seeded[5], None, None),
            _make_match("qf4", "Group Stage 4", seeded[6], seeded[7], None, None),
            _make_match("sf1", "Semifinal 1", None, None, "qf1", "qf2"),
            _make_match("sf2", "Semifinal 2", None, None, "qf3", "qf4"),
            _make_match("final", "Final", None, None, "sf1", "sf2"),
            _make_match("third", "Third Place", None, None, "sf1", "sf2"),
        ]
        leaderboard = [team for team in seeded]
        return TournamentState(bracket=bracket, leaderboard=leaderboard, settings=settings, currentMatchId=None)

    def reset(self, teams: Optional[List[Team]] = None, settings: Optional[Settings] = None) -> TournamentState:
        new_settings = settings or self.state.settings or DEFAULT_SETTINGS
        new_teams = teams or _fresh_default_teams()
        self.state = self._bootstrap(new_teams, new_settings)
        self._persist()
        return self.state

    # utilities
    def _find_match(self, match_id: str) -> Match:
        for match in self.state.bracket:
            if match.id == match_id:
                return match
        raise ValueError(f"Match {match_id} not found")

    def _find_team(self, team_id: str) -> Optional[Team]:
        for team in self.state.leaderboard:
            if team.id == team_id:
                return team
        return None

    def _resolve_sources(self, match: Match) -> None:
        # For matches with sources, fetch winner/loser assignments
        if match.teamA is None and match.sourceA:
            source_match = self._find_match(match.sourceA)
            if source_match.winnerId and match.id != "third":
                match.teamA = self._find_team(source_match.winnerId)
            elif source_match.loserId and match.id == "third":
                match.teamA = self._find_team(source_match.loserId)
        if match.teamB is None and match.sourceB:
            source_match = self._find_match(match.sourceB)
            if source_match.winnerId and match.id != "third":
                match.teamB = self._find_team(source_match.winnerId)
            elif source_match.loserId and match.id == "third":
                match.teamB = self._find_team(source_match.loserId)

    def _advance(self, match: Match) -> None:
        if not match.winnerId or not match.loserId:
            return
        winner_team = self._find_team(match.winnerId)
        loser_team = self._find_team(match.loserId)
        next_map = {
            "qf1": ("sf1", "A"),
            "qf2": ("sf1", "B"),
            "qf3": ("sf2", "A"),
            "qf4": ("sf2", "B"),
            "g1": ("sf1", "A"),
            "g2": ("sf1", "B"),
            "g3": ("sf2", "A"),
            "g4": ("sf2", "B"),
            "sf1": ("final", "A"),
            "sf2": ("final", "B"),
        }
        third_map = {
            "sf1": ("third", "A"),
            "sf2": ("third", "B"),
        }
        if match.id in next_map:
            target_id, slot = next_map[match.id]
            target = self._find_match(target_id)
            if slot == "A":
                target.teamA = winner_team
            else:
                target.teamB = winner_team
        if match.id in third_map and loser_team:
            target_id, slot = third_map[match.id]
            target = self._find_match(target_id)
            if slot == "A":
                target.teamA = loser_team
            else:
                target.teamB = loser_team

    def _update_leaderboard_score(self, team_id: str, delta: int) -> None:
        team = self._find_team(team_id)
        if team:
            team.score = max(0, team.score + delta)
        # also ensure bracket team objects reflect latest score/name
        for match in self.state.bracket:
            if match.teamA and match.teamA.id == team_id:
                match.teamA.score = team.score
            if match.teamB and match.teamB.id == team_id:
                match.teamB.score = team.score

    def _draw_challenge(self, match: Match, theme: Theme) -> Challenge:
        pool = self.content.get(theme, [])
        # Exclude challenges used globally across all matches in the tournament
        global_used = set(self.state.globalUsedChallengeIds)
        available = [c for c in pool if c.id not in global_used]
        selection_pool = available if available else pool  # Fallback to all if exhausted
        if not selection_pool:
            raise ValueError(f"No challenges available for theme {theme}")
        challenge = random.choice(selection_pool)
        # Track in both match-level and global lists
        match.usedChallengeIds.append(challenge.id)
        self.state.globalUsedChallengeIds.append(challenge.id)
        match.currentChallenge = challenge
        match.activeTheme = theme
        return challenge

    def _pick_random_theme(self, match: Match, exclude: Optional[Theme] = None) -> Theme:
        disabled = set(match.disabledThemes or [])
        usable_themes = [t for t in self.content.keys() if t not in disabled]
        if not usable_themes:
            usable_themes = list(self.content.keys())
        if exclude and len(usable_themes) > 1 and exclude in usable_themes:
            usable_themes = [t for t in usable_themes if t != exclude]
        return random.choice(usable_themes)

    def _clear_match(self, match: Match, clear_teams: bool = False) -> None:
        if match.winnerId:
            self._update_leaderboard_score(match.winnerId, -self.state.settings.scoring.get("winBonus", 2))
        match.winnerId = None
        match.loserId = None
        match.status = "pending"
        match.currentChallenge = None
        match.activeTheme = None
        match.usedChallengeIds = []
        match.score.teamA = 0
        match.score.teamB = 0
        match.score.currentChallenge = 0
        if clear_teams:
            match.teamA = None
            match.teamB = None

    def reset_match(self, match_id: str) -> TournamentState:
        match = self._find_match(match_id)
        self._clear_match(match, clear_teams=False)

        # Clear downstream matches that depended on this match's result
        self._clear_dependents(match_id)
        self._persist()
        return self.state

    def _clear_dependents(self, source_match_id: str) -> None:
        for m in self.state.bracket:
            if m.sourceA == source_match_id:
                self._clear_match(m, clear_teams=True)
                self._clear_dependents(m.id)
            if m.sourceB == source_match_id:
                self._clear_match(m, clear_teams=True)
                self._clear_dependents(m.id)

    def reset_round(self, match_id: str) -> Match:
        match = self._find_match(match_id)
        # Remove last used challenge so it can be redrawn
        if match.usedChallengeIds:
            match.usedChallengeIds.pop()
        match.currentChallenge = None
        self._persist()
        return match

    # public actions
    def get_state(self) -> TournamentState:
        return self.state

    def set_teams(self, teams: List[Team]) -> TournamentState:
        if len(teams) < 8:
            raise ValueError("Need at least 8 teams")
        # preserve scores if ids match
        score_map = {t.id: t.score for t in self.state.leaderboard}
        for t in teams:
            t.score = score_map.get(t.id, 0)
        self.state.leaderboard = teams[:]
        # update bracket references
        for match in self.state.bracket:
            if match.teamA:
                repl = next((t for t in teams if t.id == match.teamA.id), None)
                if repl:
                    match.teamA = repl
            if match.teamB:
                repl = next((t for t in teams if t.id == match.teamB.id), None)
                if repl:
                    match.teamB = repl
        self._persist()
        return self.state

    def start_match(self, match_id: str) -> Match:
        match = self._find_match(match_id)
        self._resolve_sources(match)
        match.status = "in_progress"
        self.state.currentMatchId = match.id
        match.activeTheme = self._pick_random_theme(match)
        self._draw_challenge(match, match.activeTheme)
        self._persist()
        return match

    def set_theme(self, match_id: str, theme: Optional[Theme], disabled: Optional[List[Theme]] = None) -> Challenge:
        match = self._find_match(match_id)
        if disabled:
            match.disabledThemes = disabled
        chosen = theme or self._pick_random_theme(match, exclude=match.activeTheme)
        challenge = self._draw_challenge(match, chosen)
        self._persist()
        return challenge

    def submit_challenge(self, match_id: str, team_side: str, result: str) -> Match:
        match = self._find_match(match_id)
        if match.status != "in_progress":
            raise ValueError("Match not in progress")
        if team_side not in ("A", "B"):
            raise ValueError("team must be 'A' or 'B'")

        score = match.score
        score.currentChallenge += 1
        if result == "correct":
            if team_side == "A":
                score.teamA += self.state.settings.scoring.get("perCorrect", 1)
            else:
                score.teamB += self.state.settings.scoring.get("perCorrect", 1)

        winner_side = self._check_winner(score)
        if winner_side:
            self._end_match(match, winner_side)
        else:
            # draw a new challenge with a new random theme
            next_theme = self._pick_random_theme(match, exclude=match.activeTheme)
            match.activeTheme = next_theme
            self._draw_challenge(match, next_theme)
        
        self._persist()
        return match

    def submit_round(self, match_id: str, result_a: str, result_b: str) -> Match:
        match = self._find_match(match_id)
        if match.status != "in_progress":
            raise ValueError("Match not in progress")

        match.score.currentChallenge += 1
        if result_a == "correct":
            match.score.teamA += self.state.settings.scoring.get("perCorrect", 1)
        if result_b == "correct":
            match.score.teamB += self.state.settings.scoring.get("perCorrect", 1)

        winner_side = self._check_winner(match.score)
        if winner_side:
            self._end_match(match, winner_side)
        else:
            next_theme = self._pick_random_theme(match, exclude=match.activeTheme)
            match.activeTheme = next_theme
            self._draw_challenge(match, next_theme)

        self._persist()
        return match

    def next_challenge(self, match_id: str) -> Match:
        match = self._find_match(match_id)
        if match.status != "in_progress":
            raise ValueError("Match not in progress")
        # Just draw a new challenge with a fresh random theme; do not increment score counter
        next_theme = self._pick_random_theme(match, exclude=match.activeTheme)
        match.activeTheme = next_theme
        self._draw_challenge(match, next_theme)

        self._persist()
        return match

    def _end_match(self, match: Match, winner_side: str) -> None:
        match.status = "completed"
        winner_team = match.teamA if winner_side == "A" else match.teamB
        loser_team = match.teamB if winner_side == "A" else match.teamA
        if winner_team:
            match.winnerId = winner_team.id
            self._update_leaderboard_score(winner_team.id, self.state.settings.scoring.get("winBonus", 2))
        if loser_team:
            match.loserId = loser_team.id
        self._advance(match)
        self.state.currentMatchId = None
        match.currentChallenge = None

    def _check_winner(self, score: MatchScore) -> Optional[str]:
        """Only finish once the scheduled number of rounds have been played."""
        if score.currentChallenge < score.bestOf:
            return None

        if score.teamA > score.teamB:
            return "A"
        if score.teamB > score.teamA:
            return "B"

        # Play sudden-death overtime until someone pulls ahead.
        return None

    def override_score(
        self,
        match_id: str,
        teamA_score: Optional[int] = None,
        teamB_score: Optional[int] = None,
        leaderboard_delta: Optional[Dict[str, int]] = None,
    ) -> TournamentState:
        match = self._find_match(match_id)
        if teamA_score is not None:
            match.score.teamA = teamA_score
        if teamB_score is not None:
            match.score.teamB = teamB_score
        if leaderboard_delta:
            for tid, delta in leaderboard_delta.items():
                self._update_leaderboard_score(tid, delta)
        self._persist()
        return self.state

    def advance_manual(self, match_id: str, winner_id: str) -> TournamentState:
        match = self._find_match(match_id)
        if not match.teamA or not match.teamB:
            raise ValueError("Cannot advance without two teams")
        match.winnerId = winner_id
        match.loserId = match.teamB.id if match.teamA.id == winner_id else match.teamA.id
        match.status = "completed"
        self._update_leaderboard_score(winner_id, self.state.settings.scoring.get("winBonus", 2))
        self._advance(match)
        self._persist()
        return self.state

    def export_state(self) -> str:
        return self.state.model_dump_json(indent=2)

    def reset_match(self, match_id: str) -> Match:
        match = self._find_match(match_id)
        match.score = MatchScore(bestOf=match.score.bestOf)
        match.status = "pending"
        match.currentChallenge = None
        match.winnerId = None
        match.loserId = None
        # Note: We do not clear usedChallengeIds to avoid repeats if possible, 
        # but if a full reset is desired, we could clear it. 
        # For now, let's keep used IDs so we don't see same questions immediately.
        
        self._persist()
        return match
