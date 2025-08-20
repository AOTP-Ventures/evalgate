import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "src"))

from evalgate.evaluators import json_schema as js


def test_json_schema_valid_and_invalid():
    schema = {
        "type": "object",
        "properties": {"age": {"type": "number"}},
        "required": ["age"],
    }
    outputs = {"a": {"age": 5}, "b": {}}
    score, violations = js.evaluate(outputs, schema)
    assert score == 0.5
    assert len(violations) == 1


def test_json_schema_missing_field_violation():
    schema = {"type": "object", "required": ["name"]}
    outputs = {"a": {}}
    score, violations = js.evaluate(outputs, schema)
    assert score == 0.0
    assert violations
