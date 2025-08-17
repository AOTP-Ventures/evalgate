
from __future__ import annotations
import json
from typing import Dict, Any, Optional
from .util import git_show

def load_baseline(ref: str, path: str) -> Optional[Dict[str, Any]]:
    content = git_show(f"{ref}:{path}")
    if not content:
        return None
    try:
        return json.loads(content)
    except Exception:
        return None

