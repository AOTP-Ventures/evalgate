from __future__ import annotations
from typing import Dict, Any, List, Tuple

_model_cache: dict[str, Any] = {}

def _get_model(name: str):
    """Lazily load and cache a sentence embedding model."""
    if name in _model_cache:
        return _model_cache[name]
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError as e:
        raise ImportError(
            "sentence-transformers package required for embedding evaluator."
            " Install with: pip install sentence-transformers"
        ) from e
    model = SentenceTransformer(name)
    _model_cache[name] = model
    return model

def evaluate(outputs: Dict[str, Dict[str, Any]],
             fixtures: Dict[str, Dict[str, Any]],
             field: str,
             model_name: str,
             threshold: float) -> Tuple[float, List[str]]:
    """Evaluate embedding similarity between output and expected text."""
    if not outputs:
        return 1.0, []
    model = _get_model(model_name)
    try:
        import numpy as np
    except ImportError as e:
        raise ImportError(
            "numpy package required for embedding evaluator."
            " Install with: pip install numpy"
        ) from e
    scores: List[float] = []
    fails: List[str] = []
    for name, out in outputs.items():
        exp = fixtures.get(name, {}).get("expected", {})
        exp_text = exp.get(field)
        out_text = out.get(field)
        if exp_text is None or out_text is None:
            continue
        vectors = model.encode([exp_text, out_text], normalize_embeddings=True)
        sim = float(np.dot(vectors[0], vectors[1]))
        scores.append(sim)
        if sim < threshold:
            fails.append(f"{name}: similarity {sim:.2f} below threshold {threshold:.2f}")
    avg = sum(scores) / len(scores) if scores else 1.0
    return avg, fails
