
from __future__ import annotations
from typing import Dict, Any, List, Tuple

from .base import register

def evaluate(outputs: Dict[str, Dict[str, Any]],
             fixtures: Dict[str, Dict[str, Any]],
             expected_field: str) -> Tuple[float, List[str]]:
    considered = 0
    hits = 0
    fails: List[str] = []
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


@register("category")
def run(cfg, ev, outputs, fixtures):
    score, fails = evaluate(outputs, fixtures, ev.expected_field or "")
    label_set: set[str] = set()
    matrix: dict[str, dict[str, int]] = {}
    names = sorted(set(fixtures.keys()) & set(outputs.keys()))
    for n in names:
        exp_val = fixtures.get(n, {}).get("expected", {}).get(ev.expected_field or "")
        if exp_val is None:
            continue
        got_val = outputs.get(n, {}).get(ev.expected_field or "")
        exp_label = str(exp_val)
        got_label = str(got_val)
        label_set.update([exp_label, got_label])
        matrix.setdefault(exp_label, {}).setdefault(got_label, 0)
        matrix[exp_label][got_label] += 1
    labels = sorted(label_set)
    headers = ["exp\\pred"] + labels
    rows = []
    for exp_label in labels:
        row = [exp_label]
        for pred_label in labels:
            row.append(matrix.get(exp_label, {}).get(pred_label, 0))
        rows.append(row)
    table = {
        "title": f"Confusion Matrix ({ev.name})",
        "headers": headers,
        "rows": rows,
    }
    return score, fails, {"table": table}
