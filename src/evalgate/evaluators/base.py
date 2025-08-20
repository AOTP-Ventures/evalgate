from __future__ import annotations

from typing import Any, Callable, Dict, List, Protocol, Tuple

from ..config import Config, EvaluatorCfg


class Evaluator(Protocol):
    """Callable protocol for evaluator implementations."""

    def __call__(
        self,
        cfg: Config,
        ev: EvaluatorCfg,
        outputs: Dict[str, Dict[str, Any]],
        fixtures: Dict[str, Dict[str, Any]],
    ) -> Tuple[float, List[str], Dict[str, Any]]:
        """Run evaluation and return score, failures and extra data."""
        ...


registry: Dict[str, Evaluator] = {}


def register(name: str) -> Callable[[Evaluator], Evaluator]:
    """Decorator to register evaluator implementations."""

    def decorator(func: Evaluator) -> Evaluator:
        registry[name] = func
        return func

    return decorator
