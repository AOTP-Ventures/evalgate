from __future__ import annotations

import json
from typing import Any, Dict, List, Tuple

import yaml

from .base import register


def load_workflow(path: str) -> Dict[str, List[str]]:
    """Load workflow DAG edges from JSON or YAML file."""
    with open(path, "r", encoding="utf-8") as f:
        if path.endswith((".yaml", ".yml")):
            data = yaml.safe_load(f)
        else:
            data = json.load(f)
    edges = data.get("edges", {})
    return edges


def evaluate(outputs: Dict[str, Any], edges: Dict[str, List[str]]) -> Tuple[float, List[str]]:
    """Verify that observed steps follow DAG edges.

    Returns score and list of failures."""
    nodes = set(edges.keys()) | {n for dests in edges.values() for n in dests}
    observed_nodes = set()
    fails: List[str] = []
    for name, out in outputs.items():
        seq: List[str] = []
        if isinstance(out, dict):
            seq = out.get("calls") or out.get("states") or []
        if not isinstance(seq, list):
            fails.append(f"{name}: missing calls/states list")
            continue
        for step in seq:
            if step not in nodes:
                fails.append(f"{name}: extra step {step}")
        for a, b in zip(seq, seq[1:]):
            if b not in edges.get(a, []):
                fails.append(f"{name}: invalid transition {a}->{b}")
        observed_nodes.update(seq)
    missing = nodes - observed_nodes
    for step in sorted(missing):
        fails.append(f"missing step {step}")
    score = 1.0 if not fails else 0.0
    return score, fails


@register("workflow")
def run(cfg, ev, outputs, fixtures):
    if not ev.workflow_path:
        raise ValueError("workflow_path is required")
    edges = load_workflow(ev.workflow_path)
    score, fails = evaluate(outputs, edges)
    return score, fails, {}
