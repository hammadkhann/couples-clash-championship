import json
from pathlib import Path
from typing import Dict, List
from .models import Theme, Challenge

CONTENT_DIR = Path(__file__).resolve().parents[2] / "content"


def load_theme(theme: Theme) -> List[Challenge]:
    file_map = {
        "lyrics": "lyrics.json",
        "scene": "scenes.json",
        "emoji": "emojis.json",
        "trivia": "trivia.json",
    }
    path = CONTENT_DIR / file_map[theme]
    data = json.loads(path.read_text()) if path.exists() else []
    return [Challenge(**item) for item in data]


def load_all() -> Dict[Theme, List[Challenge]]:
    return {theme: load_theme(theme) for theme in ["lyrics", "scene", "emoji", "trivia"]}
