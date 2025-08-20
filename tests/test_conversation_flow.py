import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.evaluators import conversation_flow as cf


def test_conversation_flow_scoring_and_turns():
    outputs = {
        "a": {"messages": [
            {"role": "user", "content": "hi"},
            {"role": "assistant", "content": "bye"},
        ]},
        "b": {"messages": [
            {"role": "user", "content": "hi"},
            {"role": "assistant", "content": "nope"},
        ]},
        "c": {"messages": [
            {"role": "user", "content": "hi"},
            {"role": "assistant", "content": "ok"},
            {"role": "user", "content": "more"},
            {"role": "assistant", "content": "final"},
        ]},
    }
    fixtures = {
        "a": {"expected": {"content": "bye"}},
        "b": {"expected": {"content": "bye"}},
        "c": {"expected": {"content": "final"}},
    }
    score, fails = cf.evaluate(outputs, fixtures, "content", max_turns=3)
    assert round(score, 2) == 0.33
    assert any("expected final content='bye'" in f for f in fails)
    assert any("expected <= 3 turns" in f for f in fails)


def test_conversation_flow_missing_messages():
    outputs = {"a": {}}
    fixtures = {"a": {"expected": {"content": "x"}}}
    score, fails = cf.evaluate(outputs, fixtures, "content")
    assert score == 0.0
    assert len(fails) == 1
