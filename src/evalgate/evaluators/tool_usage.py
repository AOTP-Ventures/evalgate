from __future__ import annotations

from typing import Any, Dict, List, Tuple

from .base import register


def evaluate(
    outputs: Dict[str, Dict[str, Any]],
    expected: Dict[str, List[Dict[str, Any]]],
) -> Tuple[float, List[str]]:
    """Compare logged tool calls against expected sequences."""
    considered = 0
    hits = 0
    fails: List[str] = []
    for name, exp_calls in expected.items():
        out = outputs.get(name, {})
        calls = out.get("tool_calls") if isinstance(out, dict) else []
        if not isinstance(calls, list):
            calls = []
        considered += 1
        if len(calls) != len(exp_calls):
            fails.append(
                f"{name}: expected {len(exp_calls)} calls but got {len(calls)}"
            )
            continue
        mismatch = False
        for i, (exp, got) in enumerate(zip(exp_calls, calls)):
            if exp.get("name") != got.get("name"):
                fails.append(
                    f"{name}[{i}]: expected tool {exp.get('name')!r} got {got.get('name')!r}"
                )
                mismatch = True
                break
            if exp.get("args") != got.get("args"):
                fails.append(
                    f"{name}[{i}]: expected args {exp.get('args')!r} got {got.get('args')!r}"
                )
                mismatch = True
                break
        if not mismatch:
            hits += 1
    total = considered or 1
    return hits / total, fails


@register("tool_usage")
def run(cfg, ev, outputs, fixtures):
    expected = ev.expected_tool_calls
    if not expected:
        raise ValueError("expected_tool_calls must be provided")
    score, fails = evaluate(outputs, expected)
    return score, fails, {}
