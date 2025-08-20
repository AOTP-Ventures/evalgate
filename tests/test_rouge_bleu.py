import pathlib
import sys
import builtins
import pytest

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.evaluators import rouge_bleu as rb


def test_bleu_scoring():
    outputs = {"a": {"text": "hello world"}}
    fixtures = {"a": {"expected": {"text": "hello world"}}}
    score, fails = rb.evaluate(outputs, fixtures, field="text", metric="bleu")
    assert round(score, 2) == 1.0
    assert "BLEU" in fails[0]


def test_rouge_dependency_error(monkeypatch):
    orig_import = builtins.__import__

    def fake_import(name, *args, **kwargs):
        if name == "rouge_score":
            raise ImportError("missing")
        return orig_import(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__", fake_import)
    with pytest.raises(ImportError):
        rb.evaluate({"a": {"text": "a"}}, {"a": {"expected": {"text": "b"}}}, field="text", metric="rouge1")


def test_rouge_bleu_missing_fields_skip():
    score, fails = rb.evaluate({}, {}, field="text", metric="bleu")
    assert score == 1.0
    assert fails == []
