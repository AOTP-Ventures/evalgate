import json
from evalgate.fixture_generator import generate_fixture
from jsonschema import validate

CONVERSATION_SCHEMA = {
    "type": "object",
    "properties": {
        "messages": {
            "type": "array",
            "minItems": 2,
            "maxItems": 2,
            "items": {
                "type": "object",
                "properties": {
                    "role": {"type": "string", "enum": ["system", "user", "assistant", "tool"]},
                    "content": {"type": "string"},
                    "tool_calls": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "arguments": {
                                    "type": "object",
                                    "properties": {"query": {"type": "string"}},
                                    "required": ["query"],
                                },
                            },
                            "required": ["name", "arguments"],
                        },
                    },
                },
                "required": ["role", "content"],
            },
        }
    },
    "required": ["messages"],
}


def test_nested_seed_generation():
    seed = {
        "messages": [
            {"role": "user", "content": "hi"},
            {
                "role": "assistant",
                "tool_calls": [{"name": "search", "arguments": {"query": "hi"}}],
            },
        ]
    }
    fixture = generate_fixture(CONVERSATION_SCHEMA, seed)

    assert len(fixture["messages"]) == 2
    assert fixture["messages"][0]["role"] == "user"
    assert fixture["messages"][0]["content"] == "hi"
    assert fixture["messages"][1]["role"] == "assistant"
    assert "content" in fixture["messages"][1]
    tc = fixture["messages"][1]["tool_calls"][0]
    assert tc["name"] == "search"
    assert tc["arguments"]["query"] == "hi"
    validate(fixture, CONVERSATION_SCHEMA)


def test_sample_fixture_loads(tmp_path):
    with open("tests/fixtures/conversation.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    validate(data, CONVERSATION_SCHEMA)
    assert data["messages"][1]["tool_calls"][0]["name"] == "search"
