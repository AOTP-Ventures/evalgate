
from __future__ import annotations
from typing import Dict, Any, List, Tuple
from ..util import p95 as p95_fn

def evaluate(fixtures: Dict[str, Dict[str, Any]],
             budgets: Dict[str, float]) -> Tuple[float, List[str], float, float]:
    """Return (score, violations, p95_latency_ms, avg_cost_usd)."""
    latencies, costs = [], []
    fails: List[str] = []
    for name, fx in fixtures.items():
        meta = fx.get("meta", {})
        lat = float(meta.get("latency_ms", 0))
        cost = float(meta.get("cost_usd", 0))
        latencies.append(lat)
        costs.append(cost)
        if lat > budgets["p95_latency_ms"]:
            fails.append(f"{name}: latency {lat}ms > {budgets[p95_latency_ms]}ms")
        if cost > budgets["max_cost_usd_per_item"]:
            fails.append(f"{name}: cost ${cost} > ${budgets[max_cost_usd_per_item]}")
    p95_latency = p95_fn(latencies)
    avg_cost = sum(costs) / (len(costs) or 1)
    lat_score = 1.0 if p95_latency <= budgets["p95_latency_ms"] else max(0.0, 1 - (p95_latency - budgets["p95_latency_ms"]) / budgets["p95_latency_ms"])
    cost_score = 1.0 if avg_cost <= budgets["max_cost_usd_per_item"] else max(0.0, 1 - (avg_cost - budgets["max_cost_usd_per_item"]) / budgets["max_cost_usd_per_item"])
    return (lat_score * 0.5 + cost_score * 0.5), fails, p95_latency, avg_cost

