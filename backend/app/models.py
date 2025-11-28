from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Literal

Theme = Literal["lyrics", "scene", "emoji", "trivia"]


class Team(BaseModel):
    id: str
    name: str
    players: List[str]
    score: int = 0


class MatchScore(BaseModel):
    teamA: int = 0
    teamB: int = 0
    bestOf: int = 5
    currentChallenge: int = 0


class Challenge(BaseModel):
    id: str
    theme: Theme
    prompt: str
    answer: str
    metadata: Dict[str, str] | None = None


class Match(BaseModel):
    id: str
    label: str
    teamA: Optional[Team]
    teamB: Optional[Team]
    sourceA: Optional[str] = None
    sourceB: Optional[str] = None
    winnerId: Optional[str] = None
    loserId: Optional[str] = None
    score: MatchScore = Field(default_factory=MatchScore)
    status: Literal["pending", "in_progress", "completed"] = "pending"
    currentChallenge: Optional[Challenge] = None
    activeTheme: Optional[Theme] = None
    usedChallengeIds: List[str] = Field(default_factory=list)
    disabledThemes: List[Theme] = Field(default_factory=list)


class Settings(BaseModel):
    timers: Dict[Theme, int]
    scoring: Dict[str, int]


class TournamentState(BaseModel):
    bracket: List[Match]
    leaderboard: List[Team]
    settings: Settings
    currentMatchId: Optional[str] = None
