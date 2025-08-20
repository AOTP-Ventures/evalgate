import pathlib
import sys
from types import SimpleNamespace
import pytest

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.evaluators import embedding_similarity as es


class DummyModel:
    def encode(self, texts, normalize_embeddings=True):
        if texts[1] == "match":
            return [[1.0, 0.0], [1.0, 0.0]]
        return [[1.0, 0.0], [0.0, 1.0]]


class DummyNumpy(SimpleNamespace):
    @staticmethod
    def dot(a, b):
        return sum(x * y for x, y in zip(a, b))


def test_embedding_similarity_scoring(monkeypatch):
    monkeypatch.setattr(es, "_get_model", lambda name: DummyModel())
    monkeypatch.setitem(sys.modules, "numpy", DummyNumpy())
    outputs = {"a": {"text": "match"}, "b": {"text": "mismatch"}}
    fixtures = {
        "a": {"expected": {"text": "match"}},
        "b": {"expected": {"text": "match"}},
    }
    score, fails = es.evaluate(outputs, fixtures, field="text", model_name="dummy", threshold=0.8)
    assert round(score, 2) == 0.5
    assert len(fails) == 1


def test_embedding_similarity_dependency_error(monkeypatch):
    def raiser(name):
        raise ImportError("sentence-transformers package required")
    monkeypatch.setattr(es, "_get_model", raiser)
    with pytest.raises(ImportError):
        es.evaluate({"a": {"text": "x"}}, {"a": {"expected": {"text": "x"}}}, field="text", model_name="dummy", threshold=0.5)
