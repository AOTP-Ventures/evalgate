"""Generate randomized fixtures from JSON schemas."""

from __future__ import annotations

import random
import uuid
from typing import Any, Dict, List


def _generate_from_schema(schema: Dict[str, Any]) -> Any:
    """Recursively produce data matching a JSON schema."""
    if "enum" in schema:
        return random.choice(schema["enum"])
    if "const" in schema:
        return schema["const"]

    typ = schema.get("type")
    if typ == "object":
        props = schema.get("properties", {})
        required = set(schema.get("required", []))
        result: Dict[str, Any] = {}
        for key, subschema in props.items():
            if key in required or random.random() < 0.75:
                result[key] = _generate_from_schema(subschema)
        return result
    if typ == "array":
        item_schema = schema.get("items", {})
        min_items = schema.get("minItems", 1)
        max_items = schema.get("maxItems", min_items + 2)
        length = random.randint(min_items, max_items)
        return [_generate_from_schema(item_schema) for _ in range(length)]
    if typ == "string":
        fmt = schema.get("format")
        if fmt == "uuid":
            return str(uuid.uuid4())
        min_len = schema.get("minLength", 1)
        max_len = schema.get("maxLength", max(min_len, min_len + 8))
        letters = "abcdefghijklmnopqrstuvwxyz"
        return "".join(random.choice(letters) for _ in range(random.randint(min_len, max_len)))
    if typ in ("integer", "number"):
        minimum = int(schema.get("minimum", 0))
        maximum = int(schema.get("maximum", minimum + 100))
        return random.randint(minimum, maximum)
    if typ == "boolean":
        return bool(random.getrandbits(1))
    return None


def _merge_seed(data: Any, seed: Any) -> Any:
    """Merge generated data with seed data recursively."""
    if seed is None:
        return data
    if isinstance(seed, dict) and isinstance(data, dict):
        merged = data.copy()
        for k, v in seed.items():
            merged[k] = _merge_seed(data.get(k), v) if k in data else v
        return merged
    if isinstance(seed, list) and isinstance(data, list):
        merged_list: List[Any] = []
        max_len = max(len(seed), len(data))
        for i in range(max_len):
            if i < len(seed) and i < len(data):
                merged_list.append(_merge_seed(data[i], seed[i]))
            elif i < len(seed):
                merged_list.append(seed[i])
            else:
                merged_list.append(data[i])
        return merged_list
    return seed


def generate_fixture(schema: Dict[str, Any], seed: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """Generate a single fixture instance."""
    data = _generate_from_schema(schema)
    if seed:
        data = _merge_seed(data, seed)
    return data


def generate_suite(schema: Dict[str, Any], count: int, seed: Dict[str, Any] | None = None) -> List[Dict[str, Any]]:
    """Generate multiple fixtures from a schema."""
    return [generate_fixture(schema, seed) for _ in range(count)]
