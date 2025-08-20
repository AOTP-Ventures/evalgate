from __future__ import annotations
from typing import Dict, Any, List, Tuple

def evaluate(outputs: Dict[str, Dict[str, Any]],
             fixtures: Dict[str, Dict[str, Any]],
             field: str,
             metric: str = "bleu") -> Tuple[float, List[str]]:
    """Evaluate text quality using BLEU or ROUGE metrics.

    Args:
        outputs: mapping of fixture name to generated output dict.
        fixtures: mapping of fixture name to fixture dict containing ``expected``.
        field: name of field within each dict that holds the text to compare.
        metric: which metric to compute; ``"bleu"`` or ``"rouge1"``,
            ``"rouge2"`` or ``"rougeL"``.

    Returns:
        Average score across examples (between 0 and 1) and a list of per-example
        scores for debugging.
    """
    pairs: List[Tuple[str, str, str]] = []  # (name, reference, hypothesis)
    for name, out in outputs.items():
        exp = fixtures.get(name, {}).get("expected", {})
        ref = exp.get(field)
        hyp = out.get(field)
        if ref is None or hyp is None:
            continue
        pairs.append((name, str(ref), str(hyp)))

    if not pairs:
        return 1.0, []

    metric_lower = metric.lower()
    scores: List[float] = []
    fails: List[str] = []

    if metric_lower == "bleu":
        try:
            import sacrebleu
        except ImportError as e:
            raise ImportError(
                "sacrebleu package required for BLEU evaluator."
                " Install with: pip install sacrebleu"
            ) from e
        for name, ref, hyp in pairs:
            s = sacrebleu.sentence_bleu(hyp, [ref]).score / 100.0
            scores.append(s)
            fails.append(f"{name}: BLEU={s:.4f}")
    elif metric_lower in {"rouge1", "rouge2", "rougel"}:
        try:
            from rouge_score import rouge_scorer
        except ImportError as e:
            raise ImportError(
                "rouge-score package required for ROUGE evaluator."
                " Install with: pip install rouge-score"
            ) from e
        scorer = rouge_scorer.RougeScorer([metric_lower], use_stemmer=True)
        for name, ref, hyp in pairs:
            result = scorer.score(ref, hyp)[metric_lower]
            s = result.fmeasure
            scores.append(s)
            fails.append(f"{name}: {metric_upper(metric_lower)}={s:.4f}")
    else:
        raise ValueError(f"Unsupported metric: {metric}")

    avg = sum(scores) / len(scores) if scores else 1.0
    return avg, fails


def metric_upper(m: str) -> str:
    """Return upper-case metric name preserving trailing letters."""
    return m.upper()
