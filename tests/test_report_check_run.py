import json
import urllib.request

from evalgate.cli import report


def test_report_creates_check_run(tmp_path, monkeypatch):
    data = {"overall": 0.5, "gate": {"passed": True, "min_overall_score": 0.0, "allow_regression": True}, "failures": ["fx1: bad"], "scores": [], "evaluator_errors": []}
    p = tmp_path / "results.json"
    p.write_text(json.dumps(data))
    monkeypatch.setenv("GITHUB_TOKEN", "t")
    monkeypatch.setenv("GITHUB_SHA", "sha")
    monkeypatch.setenv("GITHUB_REPOSITORY", "o/r")
    captured = {}

    def fake_urlopen(req):
        captured["url"] = req.full_url
        captured["payload"] = json.loads(req.data.decode())
        class Resp:
            pass
        return Resp()

    monkeypatch.setattr(urllib.request, "urlopen", fake_urlopen)
    report(pr=False, summary=False, artifact=str(p), max_failures=20, check_run=True)
    assert captured["url"].endswith("/repos/o/r/check-runs")
    ann = captured["payload"]["output"]["annotations"][0]
    assert ann["path"] == "eval/fixtures/fx1.json"
    assert ann["annotation_level"] == "failure"
