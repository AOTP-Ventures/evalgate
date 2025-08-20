import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.evaluators import tool_usage as tu


def test_tool_usage_match():
    outputs = {
        "a": {
            "tool_calls": [
                {"name": "search", "args": {"q": "1"}},
                {"name": "lookup", "args": {"id": 2}},
            ]
        }
    }
    expected = {
        "a": [
            {"name": "search", "args": {"q": "1"}},
            {"name": "lookup", "args": {"id": 2}},
        ]
    }
    score, fails = tu.evaluate(outputs, expected)
    assert score == 1.0
    assert fails == []


def test_tool_usage_mismatch_args():
    outputs = {
        "a": {
            "tool_calls": [
                {"name": "search", "args": {"q": "1"}},
                {"name": "lookup", "args": {"id": 2}},
            ]
        }
    }
    expected = {
        "a": [
            {"name": "search", "args": {"q": "1"}},
            {"name": "lookup", "args": {"id": 3}},
        ]
    }
    score, fails = tu.evaluate(outputs, expected)
    assert score == 0.0
    assert any("expected args" in f for f in fails)


def test_tool_usage_mismatch_name():
    outputs = {"a": {"tool_calls": [{"name": "search", "args": {}}]}}
    expected = {"a": [{"name": "lookup", "args": {}}]}
    score, fails = tu.evaluate(outputs, expected)
    assert score == 0.0
    assert any("expected tool" in f for f in fails)

