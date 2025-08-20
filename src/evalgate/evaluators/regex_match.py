from __future__ import annotations
import re
from typing import Dict, Any, List, Tuple


def evaluate(outputs: Dict[str, Any],
             fixtures: Dict[str, Dict[str, Any]],
             patterns: Dict[str, str]) -> Tuple[float, List[str]]:
    """Check whether each output matches a given regex pattern.

    Returns a tuple of (score, failures)."""
    considered = 0
    hits = 0
    fails: List[str] = []
    for name, out in outputs.items():
        pattern = patterns.get(name)
        if pattern is None:
            # no pattern for this fixture; skip from scoring
            continue
        considered += 1
        text = out if isinstance(out, str) else out.get("output", "") if isinstance(out, dict) else str(out)
        if re.search(pattern, text):
            hits += 1
        else:
            fails.append(f"{name}: pattern {pattern!r} not found in output")
    total = considered or 1
    return hits / total, fails
