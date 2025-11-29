# Couples Clash Championship

## Run locally (development)

### Option 1: Separate processes (recommended for development)
Run backend and frontend in two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
pip install -e .  # or: pip install fastapi "uvicorn[standard]" pydantic python-multipart
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 - Vite proxies API requests to the backend automatically.

### Option 2: Docker Compose (production-like)
```bash
docker-compose up --build
```
Open http://localhost:8000

## Deploy on Render
The app is configured for Render via `render.yaml`. Push to main branch and Render will auto-deploy.

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
