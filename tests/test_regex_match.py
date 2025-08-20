import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.evaluators import regex_match as rm


def test_regex_match_scoring():
    outputs = {"a": "hello world", "b": {"output": "foo"}}
    patterns = {"a": "hello", "b": "bar"}
    score, fails = rm.evaluate(outputs, {}, patterns)
    assert score == 0.5
    assert len(fails) == 1


def test_regex_match_missing_pattern_skipped():
    score, fails = rm.evaluate({"a": "hi"}, {}, {})
    assert score == 0.0
    assert fails == []
