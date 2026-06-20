import json
import pathlib
import sys

import yaml
from typer.testing import CliRunner

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.cli import app  # noqa: E402


def test_run_lists_evaluators(tmp_path):
    fixtures_dir = tmp_path / "fixtures"
    outputs_dir = tmp_path / "outputs"
    fixtures_dir.mkdir()
    outputs_dir.mkdir()

    (fixtures_dir / "item.json").write_text(
        json.dumps({"expected": {"foo": 1}}), encoding="utf-8"
    )
    (outputs_dir / "item.json").write_text(
        json.dumps({"foo": "bar"}), encoding="utf-8"
    )

    cfg = {
        "budgets": {"p95_latency_ms": 1, "max_cost_usd_per_item": 0},
        "fixtures": {"path": str(fixtures_dir / "*.json")},
        "outputs": {"path": str(outputs_dir / "*.json")},
        "evaluators": [{"name": "fields", "type": "required_fields"}],
        "gate": {"min_overall_score": 0.0, "allow_regression": True},
        "report": {
            "pr_comment": False,
            "artifact_path": str(tmp_path / "results.json"),
        },
        "baseline": {"ref": "HEAD"},
        "telemetry": {"mode": "local_only"},
    }
    config_path = tmp_path / "config.yml"
    config_path.write_text(yaml.safe_dump(cfg), encoding="utf-8")

    runner = CliRunner()
    result = runner.invoke(app, ["run", "--config", str(config_path)])
    assert result.exit_code == 0
    assert "Evaluators in use" in result.stdout
    assert "fields (required_fields)" in result.stdout
