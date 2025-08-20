import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.evaluators import classification_metrics as cm


def test_single_label_metrics():
    outputs = {
        "a": {"label": "cat"},
        "b": {"label": "dog"},
        "c": {"label": "cat"},
    }
    fixtures = {
        "a": {"expected": {"label": "cat"}},
        "b": {"expected": {"label": "cat"}},
        "c": {"expected": {"label": "dog"}},
    }
    f1, fails, metrics = cm.evaluate(outputs, fixtures, field="label")
    assert round(metrics["precision"], 3) == 0.333
    assert round(metrics["recall"], 3) == 0.333
    assert round(f1, 3) == 0.333
    assert len(fails) == 2


def test_multi_label_metrics():
    outputs = {
        "a": {"labels": ["cat", "pet"]},
        "b": {"labels": ["car"]},
    }
    fixtures = {
        "a": {"expected": {"labels": ["cat", "feline"]}},
        "b": {"expected": {"labels": ["car", "vehicle"]}},
    }
    f1, fails, metrics = cm.evaluate(outputs, fixtures, field="labels", multi_label=True)
    assert round(metrics["precision"], 3) == 0.667
    assert round(metrics["recall"], 3) == 0.5
    assert round(f1, 3) == 0.571
    assert len(fails) == 2

def test_missing_labels_are_skipped():
    outputs = {"a": {}, "b": {"label": "cat"}}
    fixtures = {
        "a": {"expected": {"label": "dog"}},
        "b": {"expected": {"label": "cat"}},
    }
    f1, fails, metrics = cm.evaluate(outputs, fixtures, field="label")
    assert f1 == 1.0
    assert fails == []


def test_empty_outputs_return_perfect_score():
    f1, fails, metrics = cm.evaluate({}, {"x": {"expected": {"label": "cat"}}}, field="label")
    assert f1 == 1.0
    assert metrics["precision"] == 1.0
    assert fails == []
