import os
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .routes import create_router
from .state import GameState
from .ws import ConnectionManager

app = FastAPI(title="Couples Clash Championship")
manager = ConnectionManager()
game = GameState()

# Determine frontend dist path (works in Docker and local dev)
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend_dist"
PUBLIC_DIR = Path(__file__).resolve().parent.parent.parent / "public"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(create_router(game, manager))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    await websocket.send_json({"type": "state:update", "data": game.get_state().model_dump()})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/health")
@app.head("/health")
def health():
    return {"status": "ok"}


# Serve frontend static files (must be after API routes)
if FRONTEND_DIST.exists():
    # Serve static assets (JS, CSS, images, etc.)
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

# Serve public folder assets (sfx, content, etc.)
if PUBLIC_DIR.exists():
    if (PUBLIC_DIR / "sfx").exists():
        app.mount("/sfx", StaticFiles(directory=PUBLIC_DIR / "sfx"), name="sfx")
    if (PUBLIC_DIR / "content").exists():
        app.mount("/content", StaticFiles(directory=PUBLIC_DIR / "content"), name="content")

# Catch-all route for SPA - serve index.html for all non-API routes
if FRONTEND_DIST.exists():
    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    async def serve_spa(full_path: str):
        # Check if file exists in frontend_dist
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        # Otherwise serve index.html for SPA routing
        return FileResponse(FRONTEND_DIST / "index.html")
