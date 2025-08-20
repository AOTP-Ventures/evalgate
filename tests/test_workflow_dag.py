import pathlib
import sys
import yaml

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.evaluators import workflow_dag as wd


def load_edges():
    path = pathlib.Path(__file__).parent / "data" / "workflow_dag.yaml"
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)["edges"]


def test_workflow_valid():
    edges = load_edges()
    outputs = {"sample": {"calls": ["start", "step1", "step2"]}}
    score, fails = wd.evaluate(outputs, edges)
    assert score == 1.0
    assert fails == []


def test_workflow_invalid():
    edges = load_edges()
    outputs = {"sample": {"calls": ["start", "step2"]}}
    score, fails = wd.evaluate(outputs, edges)
    assert score == 0.0
    assert any("invalid transition" in f for f in fails)
    assert any("missing step step1" in f for f in fails)
