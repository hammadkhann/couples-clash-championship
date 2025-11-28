# Couples Clash Championship – Build Plan

## Objectives & Scope
- Build a TV-style tournament game for 8 couples (includes Hammad & Shazma) with single-elim bracket, 3rd-place match, best-of-5 challenges per matchup.
- One-screen experience (host uses laptop to control; same view cast to TV) with bold blue/gold game-show styling, animations, and sfx.
- Backend: FastAPI with in-memory state + JSON persistence; WebSockets for live updates; Dockerized for easy deploy.
- Frontend: React (Vite + TS) consuming REST + WS; resilient to refresh via state restore.

## Cast & Teams
- Hosts: Raamiz (MC), Shazma, Hammad (not competing).
- Competitors: Manaal & Ahmed, Samia & Rafay, Shahir & Laiba, Rafay & Anum, Sadia & Daniyaal, Maaz & Misbah, Javeria & Osama, Dua & Amal.
- Host can edit team names mid-tournament without resetting scores.

## Game Flow & Rules
- Bracket: 8 teams → quarters → semis → finals + 3rd-place. No byes.
- Match: best-of-5 mini-challenges; first to 3 wins. If 2–2 and final round ties, run sudden-death extra challenge (timer applies).
- Themes: Finish the Song Lyrics, Speed Tap, Bollywood Scene Guess, Emoji Decode, Bollywood Trivia. Equal weight random draw; host can disable themes per match or pick manually.
- Scoring: +1 per correct challenge; +2 match win bonus; no penalties for wrong/timeout. Cumulative leaderboard across tournament.
- Timers (host adjustable defaults): Lyrics 20s, Scene Guess 25s, Emoji Decode 15s, Speed Tap 10s. Timeout auto-fails challenge.
- Host actions: start/pause timers, mark correct/incorrect, override scores, randomize/choose theme, advance bracket, play sfx, export state.

## UX & Visual Direction
- Single responsive layout for laptop/TV: left—bracket; right—current duel panel with timer, prompts, controls; footer—cumulative leaderboard + sfx buttons.
- Game-show vibe: blue/gold palette; sharp sans + display font pairing; confetti/win stinger animations; buzzer, chime, applause sounds.
- Content reveal: host-only answers; prompts visible to all; clear timer ring/bar; large tap areas for controls.

## Architecture Overview
- Frontend (Vite React TS): renders bracket, duel panel, scoreboard; subscribes to WS for live state; uses REST for mutations; sfx/animation triggers on events.
- Backend (FastAPI): REST endpoints for host actions; WS broadcasts for state changes; in-memory state with JSON snapshot on each write; loads snapshot on start; content loader for themes.
- Shared: content JSON files for prompts; state snapshot in `state/tournament.json` (gitignored); Dockerfile builds frontend then serves via backend.

## Data Model (initial)
- Theme: `lyrics | speedtap | scene | emoji`.
- Team: `{ id, name, players[], score }` (score = cumulative points).
- Challenge: `{ id, theme, prompt, answer, metadata? }`.
- MatchScore: `{ teamA, teamB, bestOf, currentChallenge }` counts per match.
- Match: `{ id, teamA?, teamB?, winnerId?, loserId?, score, status: pending|in_progress|completed, currentChallenge? }`.
- Settings: `{ timers: {theme->seconds}, scoring: { perCorrect, winBonus } }`.
- TournamentState: `{ bracket[], leaderboard[], settings, currentMatchId? }` + derived next matches.

## Backend API & Events (planned)
- REST (host-driven):
  - `GET /state` → full TournamentState.
  - `POST /reset` (optional body: teams/settings) → new bracket.
  - `POST /teams` (add/update names/players) → updates state.
  - `POST /start-match` {matchId} → sets current match, status in_progress, draws initial challenge.
  - `POST /theme` {matchId, theme?, randomize?:bool, disable?:Theme[]} → sets/draws theme.
  - `POST /submit-challenge` {matchId, result: "correct"|"wrong"|"timeout"} → increments scores, win bonus if match ends, triggers next challenge or completion.
  - `POST /override-score` {matchId, teamAScore?, teamBScore?, leaderboardDelta?} → manual adjust.
  - `POST /advance` {matchId, winnerId} → advances bracket, seeds next round/3rd-place.
  - `POST /export` → returns snapshot JSON (also saved locally).
  - `POST /sfx` {event:"start"|"correct"|"timeout"|"win"} → triggers frontend playback.
- WebSocket events (server → client):
  - `state:update` full or diff after any change.
  - `challenge:new` {matchId, challenge, theme}.
  - `timer` {matchId, status:"started"|"paused"|"timeout", remaining}.
  - `score:update` {matchId, score, leaderboard}.
  - `match:advance` {fromMatchId, toMatchId, winnerId, bracket}.
  - `sfx` {event} for client playback.

## Frontend UI Map (components)
- App shell: layout + theme provider (blue/gold), global WS listener, toast for events.
- BracketView: renders rounds + 3rd-place; highlights current match; clickable to open.
- DuelPanel: shows teams, best-of-5 progress, current challenge prompt/answer (answer masked), timer controls, correct/incorrect buttons, manual theme picker/randomizer, override input.
- Timer: ring/bar with time left; start/pause/timeout states.
- Scoreboard/Leaderboard: per-match scores + cumulative leaderboard with win bonus applied.
- SfxController: loads audio, responds to `sfx` events.
- SettingsBar: adjust timers and scoring (host only), export snapshot.

## Content & SFX
- Content JSONs: `lyrics.json`, `scenes.json`, `emojis.json`, `speedtap.json`, `trivia.json`; include English/Roman Urdu prompts + answers; ensure id/theme per item.
- Random selection: equal weight; avoid repeats within a match; allow host to disable themes per match.
- SFX files: start chime, correct ding, timeout buzzer, win stinger/applause stored under `public/sfx/`.

## Persistence & Config
- State snapshot: `state/tournament.json` auto-saved after every mutating action; loaded on boot. Export endpoint for manual backup.
- Environment/config: ports, CORS, content path, default timers/scoring; future `.env` for overrides.

## Deployment & Dev
- Local dev: `npm install && npm run dev` in `frontend/`; `uvicorn app.main:app --reload` in `backend/`.
- Docker: multi-stage build (frontend → backend runtime); `docker-compose up --build` mounts `content/` + `state/`.
- Future deploy: container to Vercel/Runway; statics served by backend; WS exposed on same origin.

## Testing Plan
- Backend: unit tests for bracket seeding/advance, scoring, sudden-death handling, persistence save/load, content loader.
- Frontend: component tests for bracket render, timer behavior, score updates on mocked WS events.
- Integration: mock WS/REST to simulate full match flow (best-of-5 + tie-break).

## Risks / Notes
- Timer accuracy in browser vs backend events—decide authority (frontend-controlled timer with backend acknowledgments).
- Content sufficiency: need enough prompts to avoid repeats; seed more items.
- Refresh resilience: ensure state reload + reconnect works cleanly.

## Next Implementation Steps
1) Backend: wire router and WS manager into `main.py`; implement state initialization, content loading, and REST/WS flows per above.
2) Frontend: add WS client + context, build BracketView + DuelPanel with timer controls, hook REST mutations.
3) Populate content JSONs and add sfx assets; style with blue/gold game-show theme.
4) Add tests (backend bracket/score, frontend WS-driven updates) and refine README with run commands.
