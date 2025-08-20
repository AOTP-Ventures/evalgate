import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.evaluators import latency_cost as lc


def test_latency_cost_scoring_and_fails():
    fixtures = {
        "a": {"meta": {"latency_ms": 80, "cost_usd": 0.1}},
        "b": {"meta": {"latency_ms": 120, "cost_usd": 0.2}},
    }
    budgets = {"p95_latency_ms": 100, "max_cost_usd_per_item": 0.15}
    score, fails, p95, avg = lc.evaluate(fixtures, budgets)
    assert round(score, 2) == 0.9
    assert len(fails) == 2
    assert p95 == 120
    assert round(avg, 2) == 0.15


def test_latency_cost_missing_meta_defaults_zero():
    fixtures = {"a": {}}
    budgets = {"p95_latency_ms": 100, "max_cost_usd_per_item": 1.0}
    score, fails, p95, avg = lc.evaluate(fixtures, budgets)
    assert score == 1.0
    assert fails == []
    assert p95 == 0.0
    assert avg == 0.0
