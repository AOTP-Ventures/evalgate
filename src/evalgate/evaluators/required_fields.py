from __future__ import annotations
from typing import Dict, Any, List, Tuple


def evaluate(outputs: Dict[str, Dict[str, Any]],
             fixtures: Dict[str, Dict[str, Any]]) -> Tuple[float, List[str]]:
    """Verify required fields are present with non-empty values.

    Each fixture may list fields under ``expected``. For every listed field, the
    corresponding output must contain the field with a non-empty value. The
    evaluator returns a tuple of ``(score, failures)`` where ``score`` is the
    fraction of required fields present and ``failures`` details missing or
    empty fields.
    """
    total = 0
    ok = 0
    failures: List[str] = []
    for name, out in outputs.items():
        required = fixtures.get(name, {}).get("expected", {})
        if not required:
            continue  # nothing to validate for this fixture
        for field in required.keys():
            total += 1
            val = out.get(field)
            if val is None or val == "" or val == [] or val == {}:
                failures.append(f"{name}: missing or empty field '{field}'")
            else:
                ok += 1
    total = total or 1
    return ok / total, failures
