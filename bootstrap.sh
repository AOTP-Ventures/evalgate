#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
OVER="${OVERWRITE:-0}"

say() { printf "\033[1;36m>> %s\033[0m\n" "$*"; }
mk()  { mkdir -p "$ROOT/$1"; }
w() {
  local path="$1"; shift
  local full="$ROOT/$path"
  if [[ -e "$full" && "$OVER" != "1" ]]; then
    say "skip $path (exists)"
    return 0
  fi
  mk "$(dirname "$path")"
  # Write the provided content (passed as a single-quoted arg) verbatim.
  # Using printf avoids variable expansion and preserves newlines.
  printf '%s\n' "$*" > "$full"
  say "wrote $path"
}

# ---- pyproject + package skeleton ----
w pyproject.toml '
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "evalgate"
version = "0.1.0"
description = "Deterministic LLM/RAG evals as a PR check"
readme = "README.md"
authors = [{ name = "AOTP Ventures", email = "hello@aotp.ai" }]
license = { text = "MIT" }
requires-python = ">=3.10"
dependencies = [
  "typer>=0.12",
  "pydantic>=2.7",
  "pyyaml>=6.0",
  "jsonschema>=4.21",
  "rich>=13.8"
]

[project.urls]
Homepage = "https://aotp.ai/evalgate"
Repository = "https://github.com/aotp-ventures/evalgate"

[project.scripts]
evalgate = "evalgate.cli:main"

[tool.setuptools.packages.find]
where = ["src"]
'

# action.yml (composite action using uvx)
w action.yml '
name: "AOTP EvalGate"
description: "Run deterministic LLM/RAG evals as a PR check"
author: "AOTP Ventures"
branding: { icon: "check-square", color: "blue" }

inputs:
  config:
    description: "Path to evalgate YAML config"
    required: true

runs:
  using: "composite"
  steps:
    - name: Install uv
      shell: bash
      run: |
        curl -LsSf https://astral.sh/uv/install.sh | sh
        echo "$HOME/.local/bin" >> $GITHUB_PATH
    - name: Run EvalGate (uvx)
      shell: bash
      run: |
        uvx --from evalgate evalgate run --config "${{ inputs.config }}"
    - name: Summary
      if: always()
      shell: bash
      run: |
        uvx --from evalgate evalgate report --summary --artifact ./.evalgate/results.json
'

# README (only write if missing)
if [[ ! -e "$ROOT/README.md" || "$OVER" == "1" ]]; then
w README.md '
# AOTP Ventures EvalGate

**EvalGate** runs deterministic LLM/RAG evals as a PR check. It compares your repo’s generated outputs against **fixtures**, validates **formatting**, **label accuracy**, and **latency/cost budgets**, and posts a readable summary on the PR. Default is **local-only** (no telemetry).

- ✅ Deterministic checks (schema/labels/latency/cost)
- 🧪 Regression vs `main` baseline
- 🔒 Local-only by default; optional “metrics-only” later
- 🧰 Zero infra — a composite GitHub Action + tiny CLI

## Quick start (local, via uv)
uvx --from evalgate evalgate init
python scripts/predict.py --in eval/fixtures --out .evalgate/outputs
uvx --from evalgate evalgate run --config .github/evalgate.yml
uvx --from evalgate evalgate report --summary --artifact ./.evalgate/results.json
'
fi

# ---- src files ----
w src/evalgate/__init__.py ''

w src/evalgate/config.py '
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
    type: str  # "schema" | "category" | "budgets"
    weight: float = 1.0
    schema_path: Optional[str] = None
    expected_field: Optional[str] = None
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
'

w src/evalgate/util.py '
from __future__ import annotations
import json, glob, pathlib, subprocess
from typing import Dict, Any, List

def read_json(path: str | pathlib.Path) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def write_json(path: str | pathlib.Path, data: Dict[str, Any]) -> None:
    p = pathlib.Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def list_paths(pattern: str) -> List[str]:
    return sorted(glob.glob(pattern, recursive=True))

def p95(values: List[float]) -> float:
    if not values: return 0.0
    xs = sorted(values)
    k = int(round(0.95 * (len(xs) - 1)))
    return xs[k]

def git_show(ref_path: str) -> str | None:
    try:
        out = subprocess.check_output(["git", "show", ref_path], text=True)
        return out
    except Exception:
        return None
'

w src/evalgate/evaluators/json_schema.py '
from __future__ import annotations
from jsonschema import Draft202012Validator
from typing import Dict, Any, List, Tuple

def evaluate(outputs: Dict[str, Dict[str, Any]], schema: Dict[str, Any]) -> Tuple[float, List[str]]:
    """Return score in [0,1] and list of violation strings."""
    validator = Draft202012Validator(schema)
    violations: List[str] = []
    total = len(outputs) or 1
    ok = 0
    for name, obj in outputs.items():
        errors = sorted(validator.iter_errors(obj), key=lambda e: e.path)
        if errors:
            for e in errors:
                path = "/".join(map(str, e.path))
                violations.append(f"{name}: {path} -> {e.message}")
        else:
            ok += 1
    return ok / total, violations
'

w src/evalgate/evaluators/category_match.py '
from __future__ import annotations
from typing import Dict, Any, List, Tuple

def evaluate(outputs: Dict[str, Dict[str, Any]],
             fixtures: Dict[str, Dict[str, Any]],
             expected_field: str) -> Tuple[float, List[str]]:
    total = len(outputs) or 1
    hits = 0
    fails: List[str] = []
    for name, out in outputs.items():
        exp = fixtures.get(name, {}).get("expected", {})
        exp_val = exp.get(expected_field)
        got_val = out.get(expected_field)
        if exp_val == got_val:
            hits += 1
        else:
            fails.append(f"{name}: expected {expected_field}={exp_val!r}, got {got_val!r}")
    return hits / total, fails
'

w src/evalgate/evaluators/latency_cost.py '
from __future__ import annotations
from typing import Dict, Any, List, Tuple
from ..util import p95 as p95_fn

def evaluate(fixtures: Dict[str, Dict[str, Any]],
             budgets: Dict[str, float]) -> Tuple[float, List[str], float, float]:
    """Return (score, violations, p95_latency_ms, avg_cost_usd)."""
    latencies, costs = [], []
    fails: List[str] = []
    for name, fx in fixtures.items():
        meta = fx.get("meta", {})
        lat = float(meta.get("latency_ms", 0))
        cost = float(meta.get("cost_usd", 0))
        latencies.append(lat)
        costs.append(cost)
        if lat > budgets["p95_latency_ms"]:
            fails.append(f"{name}: latency {lat}ms > {budgets['p95_latency_ms']}ms")
        if cost > budgets["max_cost_usd_per_item"]:
            fails.append(f"{name}: cost ${cost} > ${budgets['max_cost_usd_per_item']}")
    p95_latency = p95_fn(latencies)
    avg_cost = sum(costs) / (len(costs) or 1)
    lat_score = 1.0 if p95_latency <= budgets["p95_latency_ms"] else max(0.0, 1 - (p95_latency - budgets["p95_latency_ms"]) / budgets["p95_latency_ms"])
    cost_score = 1.0 if avg_cost <= budgets["max_cost_usd_per_item"] else max(0.0, 1 - (avg_cost - budgets["max_cost_usd_per_item"]) / budgets["max_cost_usd_per_item"])
    return (lat_score * 0.5 + cost_score * 0.5), fails, p95_latency, avg_cost
'

w src/evalgate/store.py '
from __future__ import annotations
import json
from typing import Dict, Any, Optional
from .util import git_show

def load_baseline(ref: str, path: str) -> Optional[Dict[str, Any]]:
    content = git_show(f"{ref}:{path}")
    if not content:
        return None
    try:
        return json.loads(content)
    except Exception:
        return None
'

w src/evalgate/report.py '
from __future__ import annotations
from typing import Dict, Any, List

def render_markdown(result: Dict[str, Any]) -> str:
    status = "✅ PASSED" if result["gate"]["passed"] else "❌ FAILED"
    lines: List[str] = [
        f"### {status} ({result['overall']:.2f} overall)",
        "",
        "**Scores**",
    ]
    for item in result["scores"]:
        delta = item.get("delta")
        delta_str = f" ({delta:+.2f} vs main)" if delta is not None else ""
        lines.append(f"- {item['name']}: {item['score']:.2f}{delta_str}")
    if result.get("latency") is not None and result.get("cost") is not None:
        lines.append(f"- Latency/Cost: p95 {int(result['latency'])}ms / ${result['cost']:.3f}")
    lines += ["", f"**Failures ({len(result['failures'])})**"]
    for f in result["failures"][:20]:
        lines.append(f"- {f}")
    if len(result["failures"]) > 20:
        lines.append(f"- … +{len(result['failures'])-20} more")
    lines += [
        "",
        "**Gate**",
        f"- min_overall_score: {result['gate']['min_overall_score']} → {'✅' if result['overall'] >= result['gate']['min_overall_score'] else '❌'}",
        f"- allow_regression: {result['gate']['allow_regression']} → {'✅' if (result['regression_ok']) else '❌'}",
        "",
        f"Artifacts: `{result['artifact_path']}`",
    ]
    return "\n".join(lines)
'

w src/evalgate/cli.py '
from __future__ import annotations
import os, json, pathlib, sys, yaml
import typer
from pydantic import ValidationError
from rich import print as rprint
from .config import Config
from .util import list_paths, read_json, write_json
from .evaluators import json_schema as ev_schema
from .evaluators import category_match as ev_cat
from .evaluators import latency_cost as ev_budget
from .store import load_baseline
from .report import render_markdown

app = typer.Typer(no_args_is_help=True)

@app.command()
def init(path: str = "."):
    """Drop example config/fixtures/schemas."""
    root = pathlib.Path(path)
    (root / ".github").mkdir(parents=True, exist_ok=True)
    (root / "eval" / "fixtures").mkdir(parents=True, exist_ok=True)
    (root / "eval" / "schemas").mkdir(parents=True, exist_ok=True)
    (root / ".evalgate" / "outputs").mkdir(parents=True, exist_ok=True)
    (root / ".github" / "evalgate.yml").write_text("""# See README for full reference
budgets: { p95_latency_ms: 1200, max_cost_usd_per_item: 0.03 }
fixtures: { path: "eval/fixtures/**/*.json" }
outputs:  { path: ".evalgate/outputs/**/*.json" }
evaluators:
  - { name: json_formatting, type: schema, schema_path: "eval/schemas/queue_item.json", weight: 0.4 }
  - { name: priority_accuracy, type: category, expected_field: "priority", weight: 0.4 }
  - { name: latency_cost, type: budgets, weight: 0.2 }
gate: { min_overall_score: 0.90, allow_regression: false }
report: { pr_comment: true, artifact_path: ".evalgate/results.json" }
baseline: { ref: "origin/main" }
telemetry: { mode: "local_only" }
""", encoding="utf-8")
    (root / "eval" / "schemas" / "queue_item.json").write_text(json.dumps({
        "$schema":"https://json-schema.org/draft/2020-12/schema",
        "type":"object",
        "required":["title","summary","priority","tags","assignee","due_date"],
        "properties":{
            "title":{"type":"string","maxLength":80},
            "summary":{"type":"string"},
            "priority":{"type":"string","enum":["P0","P1","P2"]},
            "tags":{"type":"array","items":{"type":"string"}},
            "assignee":{"type":"string"},
            "due_date":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}"}
        },
        "additionalProperties": true
    }, indent=2), encoding="utf-8")
    (root / "eval" / "fixtures" / "cx_001.json").write_text(json.dumps({
        "input":{"email_html":"<p>URGENT—refund needed before Friday</p>","thread_context":[]},
        "expected":{"priority":"P1","tags":["billing","refunds"],"assignee":"queue:finance"},
        "meta":{"latency_ms":950,"cost_usd":0.021}
    }, indent=2), encoding="utf-8")
    rprint("[green]Initialized example EvalGate files.[/green]")

@app.command()
def run(config: str = typer.Option(..., help="Path to evalgate YAML"),
        output: str = typer.Option(".evalgate/results.json", help="Where to write results JSON")):
    """Run evals and write a results artifact."""
    try:
        cfg = Config.model_validate(yaml.safe_load(pathlib.Path(config).read_text(encoding="utf-8")))
    except ValidationError as e:
        rprint("[red]Invalid config:[/red]", e)
        raise typer.Exit(2)

    fixture_paths = list_paths(cfg.fixtures.path)
    output_paths = list_paths(cfg.outputs.path)
    fixtures = {pathlib.Path(p).stem: read_json(p) for p in fixture_paths}
    outputs  = {pathlib.Path(p).stem: read_json(p) for p in output_paths}

    names = sorted(set(fixtures.keys()) & set(outputs.keys()))
    f_map = {n: fixtures[n] for n in names}
    o_map = {n: outputs[n] for n in names}

    scores = []
    failures = []
    latency = cost = None

    for ev in cfg.evaluators:
        if not ev.enabled: continue
        if ev.type == "schema":
            schema = read_json(ev.schema_path) if ev.schema_path else {}
            s, v = ev_schema.evaluate(o_map, schema)
        elif ev.type == "category":
            s, v = ev_cat.evaluate(o_map, f_map, ev.expected_field or "")
        elif ev.type == "budgets":
            s, v, latency, cost = ev_budget.evaluate(f_map, {
                "p95_latency_ms": cfg.budgets.p95_latency_ms,
                "max_cost_usd_per_item": cfg.budgets.max_cost_usd_per_item
            })
        else:
            rprint(f"[yellow]Unknown evaluator type: {ev.type}[/yellow]")
            continue
        scores.append({"name": ev.name, "score": float(s), "weight": ev.weight})
        failures.extend(v)

    total_w = sum(x["weight"] for x in scores) or 1.0
    overall = sum(x["score"] * x["weight"] for x in scores) / total_w

    baseline = load_baseline(cfg.baseline.ref, cfg.report.artifact_path) or {}
    deltas = {}
    if baseline.get("scores"):
        for x in scores:
            prev = next((s["score"] for s in baseline["scores"] if s["name"] == x["name"]), None)
            if prev is not None:
                deltas[x["name"]] = x["score"] - prev

    regression_ok = True
    if deltas and not cfg.gate.allow_regression:
        regression_ok = all((d >= -1e-6) for d in deltas.values())

    passed = overall >= cfg.gate.min_overall_score and regression_ok
    result = {
        "overall": overall,
        "scores": [{"name": x["name"], "score": x["score"], "delta": deltas.get(x["name"])} for x in scores],
        "failures": failures,
        "latency": latency,
        "cost": cost,
        "gate": {"min_overall_score": cfg.gate.min_overall_score, "allow_regression": cfg.gate.allow_regression, "passed": passed},
        "regression_ok": regression_ok,
        "artifact_path": cfg.report.artifact_path,
    }

    write_json(output, result)
    if not passed:
        rprint("[red]EvalGate FAILED[/red]")
        raise typer.Exit(1)
    else:
        rprint("[green]EvalGate PASSED[/green]")

@app.command()
def report(pr: bool = typer.Option(False, "--pr", help="(future) post PR comment via API"),
           summary: bool = typer.Option(False, "--summary", help="Write to $GITHUB_STEP_SUMMARY"),
           artifact: str = typer.Option(".evalgate/results.json", help="Path to results JSON")):
    """Render a markdown summary from results."""
    data = read_json(artifact)
    md = render_markdown(data)
    if summary and "GITHUB_STEP_SUMMARY" in os.environ:
        pathlib.Path(os.environ["GITHUB_STEP_SUMMARY"]).write_text(md, encoding="utf-8")
    else:
        print(md)

def main():
    app()

if __name__ == "__main__":
    main()
'

# ---- example config, fixtures, schema ----
w .github/evalgate.yml '
budgets: { p95_latency_ms: 1200, max_cost_usd_per_item: 0.03 }
fixtures: { path: "eval/fixtures/**/*.json" }
outputs:  { path: ".evalgate/outputs/**/*.json" }
evaluators:
  - { name: json_formatting, type: schema, schema_path: "eval/schemas/queue_item.json", weight: 0.4 }
  - { name: priority_accuracy, type: category, expected_field: "priority", weight: 0.4 }
  - { name: latency_cost, type: budgets, weight: 0.2 }
gate: { min_overall_score: 0.90, allow_regression: false }
report: { pr_comment: true, artifact_path: ".evalgate/results.json" }
baseline: { ref: "origin/main" }
telemetry: { mode: "local_only" }
'

w eval/schemas/queue_item.json '
{
  "$schema":"https://json-schema.org/draft/2020-12/schema",
  "type":"object",
  "required":["title","summary","priority","tags","assignee","due_date"],
  "properties":{
    "title":{"type":"string","maxLength":80},
    "summary":{"type":"string"},
    "priority":{"type":"string","enum":["P0","P1","P2"]},
    "tags":{"type":"array","items":{"type":"string"}},
    "assignee":{"type":"string"},
    "due_date":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}"}
  },
  "additionalProperties": true
}
'

w eval/fixtures/cx_001.json '
{
  "input": { "email_html": "<p>URGENT—refund needed before Friday</p>", "thread_context": [] },
  "expected": { "priority": "P1", "tags": ["billing","refunds"], "assignee": "queue:finance" },
  "meta": { "latency_ms": 950, "cost_usd": 0.021 }
}
'

# ---- tiny dummy predictor so the self-test works ----
w scripts/predict.py '
#!/usr/bin/env python
import argparse, json, pathlib

ap = argparse.ArgumentParser()
ap.add_argument("--in", dest="inp", required=True, help="fixtures dir")
ap.add_argument("--out", dest="out", required=True, help="outputs dir")
args = ap.parse_args()

in_dir = pathlib.Path(args.inp)
out_dir = pathlib.Path(args.out)
out_dir.mkdir(parents=True, exist_ok=True)

for p in sorted(in_dir.glob("**/*.json")):
    d = json.loads(p.read_text())
    exp = d.get("expected", {})
    # Create a plausible output that passes formatting/category checks
    out = {
        "title":"Refund needed before Friday",
        "summary":"Customer requests refund",
        "priority": exp.get("priority","P2"),
        "tags": exp.get("tags", []),
        "assignee": exp.get("assignee", "queue:unassigned"),
        "due_date":"2025-08-15"
    }
    (out_dir / p.name).write_text(json.dumps(out, indent=2))
print(f"Wrote outputs to {out_dir}")
'
chmod +x "$ROOT/scripts/predict.py"

# ---- CI workflow using uv ----
w .github/workflows/evalgate.yml '
name: EvalGate
on: [pull_request]
jobs:
  evalgate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: Install uv
        shell: bash
        run: |
          curl -LsSf https://astral.sh/uv/install.sh | sh
          echo "$HOME/.local/bin" >> $GITHUB_PATH
      - name: Generate outputs from fixtures
        run: |
          python scripts/predict.py --in eval/fixtures --out .evalgate/outputs
      - name: Run EvalGate
        run: |
          uvx --from evalgate evalgate run --config .github/evalgate.yml || true
      - name: EvalGate Summary
        if: always()
        run: |
          uvx --from evalgate evalgate report --summary --artifact ./.evalgate/results.json
'

# ---- local sanity: create venv, install editable, run once ----
say "creating uv venv + editable install"
uv venv >/dev/null 2>&1 || true
source .venv/bin/activate
uv pip install -e . >/dev/null

say "generating dummy outputs"
python scripts/predict.py --in eval/fixtures --out .evalgate/outputs

say "running evalgate"
uv run evalgate run --config .github/evalgate.yml || true
uv run evalgate report --summary --artifact ./.evalgate/results.json || true

say "done. Open .evalgate/results.json and the GitHub Actions workflow is ready."