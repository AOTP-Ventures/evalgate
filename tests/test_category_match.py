import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.evaluators import category_match as cm


def test_category_match_happy_and_failures():
    outputs = {"a": {"category": "x"}, "b": {"category": "y"}}
    fixtures = {
        "a": {"expected": {"category": "x"}},
        "b": {"expected": {"category": "x"}},
    }
    score, fails = cm.evaluate(outputs, fixtures, "category")
    assert score == 0.5
    assert len(fails) == 1


def test_missing_expected_field_results_zero_score():
    outputs = {"a": {"category": "x"}}
    fixtures = {"a": {"expected": {}}}
    score, fails = cm.evaluate(outputs, fixtures, "category")
    assert score == 0.0
    assert fails == []


def test_missing_output_field_fails():
    outputs = {"a": {}}
    fixtures = {"a": {"expected": {"category": "x"}}}
    score, fails = cm.evaluate(outputs, fixtures, "category")
    assert score == 0.0
    assert len(fails) == 1
