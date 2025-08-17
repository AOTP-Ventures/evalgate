from __future__ import annotations
from typing import Dict, Any, List
import subprocess

def git_show(ref_path: str) -> str | None:
    try:
        out = subprocess.check_output(
            ["git", "show", ref_path],
            text=True,
            stderr=subprocess.DEVNULL,  # silence "fatal: invalid object name" on first run
        )
        return out
    except Exception:
        return None

def evaluate(outputs: Dict[str, Dict[str, Any]],
             fixtures: Dict[str, Dict[str, Any]],
             expected_field: str) -> tuple[float, list[str]]:
    considered = 0
    hits = 0
    fails: list[str] = []
    for name, out in outputs.items():
        exp = fixtures.get(name, {}).get("expected", {})
        exp_val = exp.get(expected_field, None)
        if exp_val is None:
            # no ground truth for this fixture; skip from scoring
            continue
        considered += 1
        got_val = out.get(expected_field)
        if exp_val == got_val:
            hits += 1
        else:
            fails.append(f"{name}: expected {expected_field}={exp_val!r}, got {got_val!r}")
    total = considered or 1
    return hits / total, fails