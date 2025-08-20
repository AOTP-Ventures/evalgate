
from __future__ import annotations
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class Budgets(BaseModel):
    p95_latency_ms: int = Field(..., ge=1)
    max_cost_usd_per_item: float = Field(..., ge=0)

class Fixtures(BaseModel):
    path: str  # glob

class Outputs(BaseModel):
    path: str  # glob

class EvaluatorCfg(BaseModel):
    name: str
    type: str  # "schema" | "category" | "budgets" | "llm" | "embedding" | "regex" | "rouge_bleu" | "classification"
    weight: float = 1.0
    schema_path: Optional[str] = None
    expected_field: Optional[str] = None
    threshold: Optional[float] = 0.8  # cosine similarity threshold for embedding evaluator
    metric: Optional[str] = None  # metric for rouge_bleu evaluator: "bleu" | "rouge1" | "rouge2" | "rougeL"
    pattern_field: Optional[str] = None  # name of expected field containing regex
    pattern_path: Optional[str] = None  # path to JSON mapping of name->regex
    multi_label: Optional[bool] = False  # treat field as list of labels
    # LLM-specific fields
    provider: Optional[str] = None  # "openai" | "anthropic" | "azure" | "local"
    model: Optional[str] = None  # e.g. "gpt-4", "claude-3-5-sonnet-20241022" or embedding model name
    prompt_path: Optional[str] = None  # path to prompt template file
    api_key_env_var: Optional[str] = None  # env var name for API key
    base_url: Optional[str] = None  # for local/custom endpoints
    temperature: Optional[float] = 0.1  # for consistent evaluation
    max_tokens: Optional[int] = 1000  # response length limit
    enabled: bool = True

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

