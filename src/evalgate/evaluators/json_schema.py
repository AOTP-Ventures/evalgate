
from __future__ import annotations
from jsonschema import Draft202012Validator
from typing import Dict, Any, List, Tuple

def evaluate(outputs: Dict[str, Dict[str, Any]], schema: Dict[str, Any]) -> Tuple[float, List[str]]:
    """Return score in [0,1] and list of violation strings."""
    validator = Draft202012Validator(schema)
    violations: List[str] = []
    total = len(outputs) or 1
    ok = 0
    for name, obj in outputs.items():
        errors = sorted(validator.iter_errors(obj), key=lambda e: e.path)
        if errors:
            for e in errors:
                path = "/".join(map(str, e.path))
                violations.append(f"{name}: {path} -> {e.message}")
        else:
            ok += 1
    return ok / total, violations

