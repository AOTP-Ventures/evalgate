from __future__ import annotations

from typing import Any, Dict, List, Tuple

from .base import register


def evaluate(
    outputs: Dict[str, Dict[str, Any]],
    fixtures: Dict[str, Dict[str, Any]],
    expected_field: str,
    max_turns: int | None = None,
) -> Tuple[float, List[str]]:
    """Validate conversation flow and final message content.

    Parameters
    ----------
    outputs:
        Mapping of item name to output data containing ``messages`` list.
    fixtures:
        Mapping of item name to fixture data with ``expected`` section.
    expected_field:
        Field in final message to compare against the expected value.
    max_turns:
        Optional maximum number of allowed messages in the conversation.
    """
    considered = 0
    hits = 0
    failures: List[str] = []
    for name, out in outputs.items():
        msgs = out.get("messages")
        if not isinstance(msgs, list) or not msgs:
            failures.append(f"{name}: missing messages")
            considered += 1
            continue
        if max_turns is not None and len(msgs) > max_turns:
            failures.append(
                f"{name}: expected <= {max_turns} turns, got {len(msgs)}"
            )
        exp_val = fixtures.get(name, {}).get("expected", {}).get(expected_field)
        if exp_val is None:
            # No ground truth provided; do not include in score
            continue
        considered += 1
        got_val = msgs[-1].get(expected_field)
        if got_val == exp_val and (
            max_turns is None or len(msgs) <= max_turns
        ):
            hits += 1
        else:
            if got_val != exp_val:
                failures.append(
                    f"{name}: expected final {expected_field}={exp_val!r}, got {got_val!r}"
                )
    total = considered or 1
    return hits / total, failures


@register("conversation")
def run(cfg, ev, outputs, fixtures):
    if ev.expected_final_field is None:
        raise ValueError("expected_final_field is required for conversation evaluator")
    score, fails = evaluate(
        outputs,
        fixtures,
        expected_field=ev.expected_final_field,
        max_turns=ev.max_turns,
    )
    return score, fails, {}
