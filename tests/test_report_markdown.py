import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.report import render_markdown


def test_render_markdown_max_failures_and_plots():
    result = {
        "overall": 0.9,
        "scores": [
            {
                "name": "metric1",
                "score": 0.9,
                "delta": 0.1,
                "passed": True,
                "min_score": 0.5,
            }
        ],
        "failures": [f"f{i}" for i in range(6)],
        "evaluator_errors": [],
        "latency": None,
        "cost": None,
        "gate": {"min_overall_score": 0.5, "allow_regression": True, "passed": True},
        "regression_ok": True,
        "evaluators_ok": True,
        "scores_ok": True,
        "plots": [{"title": "trend", "sparkline": "s.png", "url": "p.png"}],
    }
    md = render_markdown(result, max_failures=5)
    assert "… +1 more" in md
    assert "| Metric | Δ vs baseline |" in md
    assert "[![trend](s.png)](p.png)" in md
    assert "- metric1: 0.90 (+0.10 vs main) → ✅ (min 0.50)" in md
