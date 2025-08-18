"""Template loading utilities for EvalGate."""

from __future__ import annotations
import json
from pathlib import Path
from typing import Dict, Any


def get_template_dir() -> Path:
    """Get the path to the templates directory."""
    return Path(__file__).parent / "templates"


def load_template(name: str) -> str:
    """Load a template file as a string."""
    template_path = get_template_dir() / name
    try:
        return template_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise FileNotFoundError(f"Template '{name}' not found at {template_path}")


def load_json_template(name: str) -> Dict[str, Any]:
    """Load a JSON template file and parse it."""
    content = load_template(name)
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in template '{name}': {e}")


# Convenience functions for common templates
def load_default_config() -> str:
    """Load the default configuration YAML."""
    return load_template("default_config.yml")


def load_schema_example() -> Dict[str, Any]:
    """Load the example JSON schema."""
    return load_json_template("schema_example.json")


def load_fixture_example() -> Dict[str, Any]:
    """Load the example fixture JSON."""
    return load_json_template("fixture_example.json")


def load_quality_judge_prompt() -> str:
    """Load the quality judge LLM prompt template."""
    return load_template("quality_judge.txt")


def load_sentiment_judge_prompt() -> str:
    """Load the sentiment judge LLM prompt template."""
    return load_template("sentiment_judge.txt")
