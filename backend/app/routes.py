import uuid
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .models import Settings, Team, TournamentState, Theme
from .state import GameState
from .ws import ConnectionManager


class TeamInput(BaseModel):
    id: Optional[str] = None
    name: str
    players: List[str] = []

    def to_team(self) -> Team:
        return Team(id=self.id or str(uuid.uuid4()), name=self.name, players=self.players, score=0)


class ResetRequest(BaseModel):
    teams: Optional[List[TeamInput]] = None
    settings: Optional[Settings] = None


class StartMatchRequest(BaseModel):
    matchId: str


class ThemeRequest(BaseModel):
    matchId: str
    theme: Optional[Theme] = None
    disabled: Optional[List[Theme]] = None


class SubmitChallengeRequest(BaseModel):
    matchId: str
    team: str  # "A" or "B"
    result: str  # correct|wrong|timeout


class SubmitRoundRequest(BaseModel):
    matchId: str
    teamA: str  # correct|wrong|timeout
    teamB: str  # correct|wrong|timeout


class NextChallengeRequest(BaseModel):
    matchId: str


class OverrideScoreRequest(BaseModel):
    matchId: str
    teamAScore: Optional[int] = None
    teamBScore: Optional[int] = None
    leaderboardDelta: Optional[dict] = None


class AdvanceRequest(BaseModel):
    matchId: str
    winnerId: str


class ResetMatchRequest(BaseModel):
    matchId: str


class ResetRoundRequest(BaseModel):
    matchId: str


class SfxRequest(BaseModel):
    event: str


class ResetMatchRequest(BaseModel):
    matchId: str


def create_router(game: GameState, manager: ConnectionManager) -> APIRouter:
    router = APIRouter()

    async def broadcast_state():
        await manager.broadcast({"type": "state:update", "data": game.get_state().model_dump()})

    @router.get("/state", response_model=TournamentState)
    async def get_state():
        return game.get_state()

    @router.post("/reset", response_model=TournamentState)
    async def reset(payload: ResetRequest):
        teams = [t.to_team() for t in payload.teams] if payload.teams else None
        state = game.reset(teams=teams, settings=payload.settings)
        await broadcast_state()
        return state

    @router.post("/teams", response_model=TournamentState)
    async def set_teams(payload: List[TeamInput]):
        teams = [t.to_team() for t in payload]
        state = game.set_teams(teams)
        await broadcast_state()
        return state

    @router.post("/start-match")
    async def start_match(payload: StartMatchRequest):
        try:
            match = game.start_match(payload.matchId)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await manager.broadcast({"type": "match:start", "matchId": match.id, "challenge": match.currentChallenge.model_dump() if match.currentChallenge else None})
        await broadcast_state()
        return match

    @router.post("/theme")
    async def set_theme(payload: ThemeRequest):
        try:
            challenge = game.set_theme(payload.matchId, payload.theme, payload.disabled)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await manager.broadcast({"type": "challenge:new", "matchId": payload.matchId, "challenge": challenge.model_dump()})
        await broadcast_state()
        return challenge

    @router.post("/submit-challenge")
    async def submit_challenge(payload: SubmitChallengeRequest):
        try:
            match = game.submit_challenge(payload.matchId, payload.team, payload.result)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await manager.broadcast({"type": "score:update", "matchId": match.id, "score": match.score.model_dump(), "challenge": match.currentChallenge.model_dump() if match.currentChallenge else None})
        if match.status == "completed":
            await manager.broadcast({"type": "match:advance", "matchId": match.id, "winnerId": match.winnerId, "loserId": match.loserId})
        await broadcast_state()
        return match

    @router.post("/submit-round")
    async def submit_round(payload: SubmitRoundRequest):
        try:
            match = game.submit_round(payload.matchId, payload.teamA, payload.teamB)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await manager.broadcast({"type": "score:update", "matchId": match.id, "score": match.score.model_dump(), "challenge": match.currentChallenge.model_dump() if match.currentChallenge else None})
        if match.status == "completed":
            await manager.broadcast({"type": "match:advance", "matchId": match.id, "winnerId": match.winnerId, "loserId": match.loserId})
        await broadcast_state()
        return match

    @router.post("/next-challenge")
    async def next_challenge(payload: NextChallengeRequest):
        try:
            match = game.next_challenge(payload.matchId)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await manager.broadcast({"type": "challenge:new", "matchId": match.id, "challenge": match.currentChallenge.model_dump() if match.currentChallenge else None})
        await broadcast_state()
        return match

    @router.post("/override-score", response_model=TournamentState)
    async def override_score(payload: OverrideScoreRequest):
        state = game.override_score(payload.matchId, payload.teamAScore, payload.teamBScore, payload.leaderboardDelta)
        await broadcast_state()
        return state

    @router.post("/advance", response_model=TournamentState)
    async def advance(payload: AdvanceRequest):
        try:
            state = game.advance_manual(payload.matchId, payload.winnerId)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await broadcast_state()
        return state

    @router.post("/reset-match", response_model=TournamentState)
    async def reset_match(payload: ResetMatchRequest):
        try:
            state = game.reset_match(payload.matchId)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await broadcast_state()
        return state

    @router.post("/reset-round")
    async def reset_round(payload: ResetRoundRequest):
        try:
            match = game.reset_round(payload.matchId)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await manager.broadcast({"type": "challenge:new", "matchId": payload.matchId, "challenge": None})
        await broadcast_state()
        return match

    @router.post("/export")
    async def export_state():
        return {"state": game.export_state()}

    @router.post("/sfx")
    async def sfx(payload: SfxRequest):
        await manager.broadcast({"type": "sfx", "event": payload.event})
        return {"ok": True}

    @router.post("/reset-match")
    async def reset_match(payload: ResetMatchRequest):
        try:
            match = game.reset_match(payload.matchId)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        await manager.broadcast({"type": "match:start", "matchId": match.id, "challenge": None}) # effectively resets view
        await broadcast_state()
        return match

    return router
