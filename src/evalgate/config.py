
from __future__ import annotations
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

class Budgets(BaseModel):
    p95_latency_ms: int = Field(..., ge=1)
    max_cost_usd_per_item: float = Field(..., ge=0)

class Fixtures(BaseModel):
    path: str  # glob

class Outputs(BaseModel):
    path: str  # glob


class EvaluatorType(str, Enum):
    SCHEMA = "schema"
    CATEGORY = "category"
    BUDGETS = "budgets"
    LLM = "llm"
    EMBEDDING = "embedding"
    REGEX = "regex"
    ROUGE_BLEU = "rouge_bleu"
    REQUIRED_FIELDS = "required_fields"
    CLASSIFICATION = "classification"
    WORKFLOW = "workflow"
    TOOL_USAGE = "tool_usage"
    CONVERSATION = "conversation"


class EvaluatorCfg(BaseModel):
    name: str
    type: EvaluatorType
    weight: float = 1.0
    min_score: float | None = None
    schema_path: Optional[str] = None
    expected_field: Optional[str] = None
    expected_final_field: Optional[str] = None
    max_turns: Optional[int] = None
    threshold: Optional[float] = 0.8  # cosine similarity threshold for embedding evaluator
    metric: Optional[str] = None  # metric for rouge_bleu evaluator: "bleu" | "rouge1" | "rouge2" | "rougeL"
    pattern_field: Optional[str] = None  # name of expected field containing regex
    pattern_path: Optional[str] = None  # path to JSON mapping of name->regex
    multi_label: Optional[bool] = False  # treat field as list of labels
    expected_tool_calls: Optional[Dict[str, List[Dict[str, Any]]]] = None  # expected tool call sequence
    # LLM-specific fields
    provider: Optional[str] = None  # "openai" | "anthropic" | "azure" | "local"
    model: Optional[str] = None  # e.g. "gpt-4", "claude-3-5-sonnet-20241022" or embedding model name
    prompt_path: Optional[str] = None  # path to prompt template file
    api_key_env_var: Optional[str] = None  # env var name for API key
    base_url: Optional[str] = None  # for local/custom endpoints
    temperature: Optional[float] = 0.1  # for consistent evaluation
    max_tokens: Optional[int] = 1000  # response length limit
    transcript_field: Optional[str] = None  # field with conversation transcript
    per_turn_scoring: Optional[bool] = False  # score each turn individually
    workflow_path: Optional[str] = None  # path to JSON or YAML workflow DAG spec
    enabled: bool = True

    @field_validator("type", mode="before")
    @classmethod
    def _parse_type(cls, v):
        if isinstance(v, str):
            try:
                return EvaluatorType[v.upper()]
            except KeyError:
                try:
                    return EvaluatorType(v.lower())
                except ValueError as exc:
                    raise ValueError(f"invalid evaluator type: {v}") from exc
        return v

    @field_validator("weight")
    @classmethod
    def _w(cls, v: float):
        if v < 0 or v > 1:
            raise ValueError("weight must be between 0 and 1")
        return v

class Gate(BaseModel):
    min_overall_score: float = 0.9
    allow_regression: bool = False

class ReportCfg(BaseModel):
    pr_comment: bool = True
    artifact_path: str = ".evalgate/results.json"

class BaselineCfg(BaseModel):
    ref: str = "origin/main"

class TelemetryCfg(BaseModel):
    mode: str = "local_only"  # "local_only" | "metrics_only"

class Config(BaseModel):
    budgets: Budgets
    fixtures: Fixtures
    outputs: Outputs
    evaluators: List[EvaluatorCfg]
    gate: Gate = Gate()
    report: ReportCfg = ReportCfg()
    baseline: BaselineCfg = BaselineCfg()
    telemetry: TelemetryCfg = TelemetryCfg()

