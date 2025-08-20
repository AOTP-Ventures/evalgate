from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List, Tuple


def evaluate(
    outputs: Dict[str, Dict[str, Any]],
    fixtures: Dict[str, Dict[str, Any]],
    field: str,
    multi_label: bool = False,
) -> Tuple[float, List[str], Dict[str, Any]]:
    """Compute precision/recall/F1 for classification outputs.

    Parameters
    ----------
    outputs: mapping of fixture name to predicted output
    fixtures: mapping of fixture name to fixture with ``expected`` values
    field: name of field containing the label(s)
    multi_label: if True, treat labels as lists and compute multi-label metrics

    Returns
    -------
    Tuple containing overall F1 score, list of failures, and metrics dict with
    precision, recall, F1, and the confusion matrix.
    """
    if not outputs:
        return 1.0, [], {"precision": 1.0, "recall": 1.0, "f1": 1.0, "confusion_matrix": {}}

    confusion: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
    fails: List[str] = []
    tp = fp = fn = 0

    for name, out in outputs.items():
        exp_val = fixtures.get(name, {}).get("expected", {}).get(field)
        pred_val = out.get(field)
        if exp_val is None or pred_val is None:
            # skip items without ground truth or prediction
            continue

        if multi_label:
            exp_set = set(exp_val)
            pred_set = set(pred_val)
            for lbl in exp_set:
                if lbl in pred_set:
                    confusion[lbl][lbl] += 1
                else:
                    confusion[lbl]["__none__"] += 1
            for lbl in pred_set - exp_set:
                confusion["__none__"][lbl] += 1
            tp += len(exp_set & pred_set)
            fp += len(pred_set - exp_set)
            fn += len(exp_set - pred_set)
            if exp_set != pred_set:
                fails.append(
                    f"{name}: expected {sorted(exp_set)}, got {sorted(pred_set)}"
                )
        else:
            exp_label = exp_val
            pred_label = pred_val
            confusion[exp_label][pred_label] += 1
            if exp_label != pred_label:
                fails.append(f"{name}: expected {exp_label!r}, got {pred_label!r}")
                fp += 1
                fn += 1
            else:
                tp += 1

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0

    metrics = {
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "confusion_matrix": {exp: dict(preds) for exp, preds in confusion.items()},
    }
    return f1, fails, metrics
