
from __future__ import annotations
import json, glob, pathlib, subprocess
from typing import Dict, Any, List

def read_json(path: str | pathlib.Path) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def write_json(path: str | pathlib.Path, data: Dict[str, Any]) -> None:
    p = pathlib.Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def list_paths(pattern: str) -> List[str]:
    return sorted(glob.glob(pattern, recursive=True))

def p95(values: List[float]) -> float:
    if not values: return 0.0
    xs = sorted(values)
    k = int(round(0.95 * (len(xs) - 1)))
    return xs[k]

def git_show(ref_path: str) -> str | None:
    try:
        out = subprocess.check_output(
            ["git", "show", ref_path],
            text=True,
            stderr=subprocess.DEVNULL,  # silence first-run git warnings
        )
        return out
    except Exception:
        return None

