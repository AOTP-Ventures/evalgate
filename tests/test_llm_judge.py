import pathlib
import sys
import pytest

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.evaluators import llm_judge as lj


def test_llm_judge_happy(monkeypatch, tmp_path):
    prompt = tmp_path / "prompt.txt"
    prompt.write_text("{input}\n{output}")
    monkeypatch.setattr(lj, "_call_openai", lambda *a, **k: "Score: 0.8")
    monkeypatch.setenv("OPENAI_KEY", "x")
    outputs = {"a": {"text": "hi"}}
    fixtures = {"a": {"input": {"q": "?"}, "expected": {"text": "hi"}}}
    score, details = lj.evaluate(
        outputs,
        fixtures,
        provider="openai",
        model="gpt",
        prompt_path=str(prompt),
        api_key_env_var="OPENAI_KEY",
    )
    assert score == 0.8
    assert details == []


def test_llm_judge_missing_api_key(tmp_path):
    prompt = tmp_path / "p.txt"
    prompt.write_text("test")
    outputs = {"a": {}}
    fixtures = {"a": {}}
    with pytest.raises(ValueError):
        lj.evaluate(outputs, fixtures, provider="openai", model="gpt", prompt_path=str(prompt), api_key_env_var="MISSING")


def test_llm_judge_dependency_error(monkeypatch, tmp_path):
    prompt = tmp_path / "p.txt"
    prompt.write_text("test")
    def raiser(*args, **kwargs):
        raise ImportError("openai missing")
    monkeypatch.setattr(lj, "_call_openai", raiser)
    monkeypatch.setenv("OPENAI_KEY", "x")
    score, details = lj.evaluate(
        {"a": {}},
        {"a": {}},
        provider="openai",
        model="gpt",
        prompt_path=str(prompt),
        api_key_env_var="OPENAI_KEY",
    )
    assert score == 0.0
    assert "Evaluation failed" in details[0]


def test_llm_judge_transcript(monkeypatch, tmp_path):
    prompt = tmp_path / "p.txt"
    prompt.write_text("{transcript}")
    captured = []

    def fake_call(model, prompt, *_, **__):
        captured.append(prompt)
        return "Score: 0.9"

    monkeypatch.setattr(lj, "_call_openai", fake_call)
    monkeypatch.setenv("OPENAI_KEY", "x")
    outputs = {
        "a": {
            "transcript": [
                {"role": "user", "content": "hi"},
                {"role": "assistant", "content": "hello"},
            ]
        }
    }
    score, details = lj.evaluate(
        outputs,
        {"a": {}},
        provider="openai",
        model="gpt",
        prompt_path=str(prompt),
        api_key_env_var="OPENAI_KEY",
        transcript_field="transcript",
    )
    assert score == 0.9
    assert details == []
    assert captured[0] == "user: hi\nassistant: hello"


def test_llm_judge_per_turn_scoring(monkeypatch, tmp_path):
    prompt = tmp_path / "p.txt"
    prompt.write_text("{transcript}")
    calls = []

    def fake_call(model, prompt, *_, **__):
        calls.append(prompt)
        return "Score: 0.5" if "hi" in prompt else "Score: 1.0"

    monkeypatch.setattr(lj, "_call_openai", fake_call)
    monkeypatch.setenv("OPENAI_KEY", "x")
    outputs = {
        "a": {
            "transcript": [
                {"role": "assistant", "content": "hi"},
                {"role": "assistant", "content": "bye"},
            ]
        }
    }
    score, details = lj.evaluate(
        outputs,
        {"a": {}},
        provider="openai",
        model="gpt",
        prompt_path=str(prompt),
        api_key_env_var="OPENAI_KEY",
        transcript_field="transcript",
        per_turn_scoring=True,
    )
    assert score == pytest.approx((0.5 + 1.0) / 2)
    assert len(details) == 1 and "a[0]" in details[0]
    assert calls == ["assistant: hi", "assistant: bye"]
