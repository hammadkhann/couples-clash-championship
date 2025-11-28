# Couples Clash Championship

## Run locally (uv + npm)
- Backend:
  1) `cd backend`
  2) `uv venv`
  3) `source .venv/bin/activate` (or `Scripts\\activate` on Windows)
  4) `uv pip install fastapi "uvicorn[standard]" pydantic python-multipart`
  5) `uv run uvicorn app.main:app --reload`
- Frontend: `cd frontend && npm install && npm run dev`
- Open http://localhost:5173 (frontend expects backend at http://localhost:8000)

## Docker
- `docker-compose up --build`

## Structure
- `frontend/` Vite React TS app
- `backend/` FastAPI app
- `content/` seed challenge JSON (lyrics, scenes, emojis, trivia)
- `state/` runtime state snapshot (gitignored)

## API (host-driven)
- `GET /state` → full tournament state
- `POST /reset` {teams?, settings?} → new bracket
- `POST /teams` [ {id?, name, players[]} ] → update names/players
- `POST /start-match` {matchId}
- `POST /theme` {matchId, theme?, disabled?}
- `POST /submit-challenge` {matchId, team:"A"|"B", result:"correct"|"wrong"|"timeout"}
- `POST /submit-round` {matchId, teamA:"correct|wrong|timeout", teamB:"correct|wrong|timeout"}
- `POST /override-score` {matchId, teamAScore?, teamBScore?, leaderboardDelta?}
- `POST /advance` {matchId, winnerId} → manual advance
- `POST /reset-match` {matchId} → clear scores/winner and downstream matches
- `POST /reset-round` {matchId} → clear current question so a new one can be drawn
- `POST /export` → snapshot JSON
- `POST /sfx` {event} → broadcast sound trigger
- WebSocket `/ws` → receives `state:update`, `match:start`, `challenge:new`, `score:update`, `match:advance`, `sfx`

## Notes
- Default teams are the guest couples (hosts not competing); update via `/reset` or `/teams`.
- SFX: drop `start.mp3`, `correct.mp3`, `timeout.mp3`, `wrong.mp3`, `win.mp3` into `frontend/public/sfx/`. The app will prefer these; otherwise it falls back to generated tones.
