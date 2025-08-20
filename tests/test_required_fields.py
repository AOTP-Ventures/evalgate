import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.evaluators import required_fields as rf


def test_required_fields_scoring():
    outputs = {"a": {"x": 1}, "b": {"x": 1}}
    fixtures = {
        "a": {"expected": {"x": 0}},
        "b": {"expected": {"x": 0, "y": 0}},
    }
    score, fails = rf.evaluate(outputs, fixtures)
    assert round(score, 2) == 0.67
    assert len(fails) == 1


def test_required_fields_missing_output_field():
    outputs = {"a": {}}
    fixtures = {"a": {"expected": {"x": 0}}}
    score, fails = rf.evaluate(outputs, fixtures)
    assert score == 0.0
    assert len(fails) == 1
