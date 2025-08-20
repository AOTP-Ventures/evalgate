from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Dict, Optional

CACHE_PATH = Path('.evalgate/cache.json')
_cache: Dict[str, str] | None = None

def _load() -> Dict[str, str]:
    global _cache
    if _cache is None:
        if CACHE_PATH.exists():
            try:
                _cache = json.loads(CACHE_PATH.read_text(encoding='utf-8'))
            except Exception:
                _cache = {}
        else:
            _cache = {}
    return _cache

def _save() -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(_load(), indent=2), encoding='utf-8')

def _key(model: str, prompt: str) -> str:
    h = hashlib.sha256()
    h.update(model.encode('utf-8'))
    h.update(b'\x00')
    h.update(prompt.encode('utf-8'))
    return h.hexdigest()

def get(model: str, prompt: str) -> Optional[str]:
    return _load().get(_key(model, prompt))

def set(model: str, prompt: str, response: str) -> None:
    cache = _load()
    cache[_key(model, prompt)] = response
    _save()

def clear() -> None:
    global _cache
    _cache = {}
    if CACHE_PATH.exists():
        CACHE_PATH.unlink()
