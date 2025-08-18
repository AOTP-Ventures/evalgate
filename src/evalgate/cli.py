
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
from .evaluators import llm_judge as ev_llm
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
    (root / "eval" / "prompts").mkdir(parents=True, exist_ok=True)
    (root / ".evalgate" / "outputs").mkdir(parents=True, exist_ok=True)
    (root / ".github" / "evalgate.yml").write_text("""# See README for full reference
budgets: { p95_latency_ms: 1200, max_cost_usd_per_item: 0.03 }
fixtures: { path: "eval/fixtures/**/*.json" }
outputs:  { path: ".evalgate/outputs/**/*.json" }
evaluators:
  - { name: json_formatting, type: schema, schema_path: "eval/schemas/queue_item.json", weight: 0.3 }
  - { name: priority_accuracy, type: category, expected_field: "priority", weight: 0.3 }
  - { name: latency_cost, type: budgets, weight: 0.2 }
  # Uncomment and configure with your API key to enable LLM evaluation:
  # - { name: content_quality, type: llm, provider: openai, model: "gpt-4", prompt_path: "eval/prompts/quality_judge.txt", api_key_env_var: "OPENAI_API_KEY", weight: 0.2 }
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
        "additionalProperties": True
    }, indent=2), encoding="utf-8")
    (root / "eval" / "fixtures" / "cx_001.json").write_text(json.dumps({
        "input":{"email_html":"<p>URGENT—refund needed before Friday</p>","thread_context":[]},
        "expected":{"priority":"P1","tags":["billing","refunds"],"assignee":"queue:finance"},
        "meta":{"latency_ms":950,"cost_usd":0.021}
    }, indent=2), encoding="utf-8")
    
    # Create example LLM prompt templates
    (root / "eval" / "prompts" / "quality_judge.txt").write_text("""
You are an expert evaluator assessing the quality of customer support ticket classification.

Evaluate the generated output based on these criteria:
1. Accuracy of priority assignment
2. Relevance of assigned tags
3. Appropriateness of assignee selection
4. Overall coherence and completeness

INPUT:
{input}

EXPECTED OUTPUT:
{expected}

GENERATED OUTPUT:
{output}

Provide a score from 0.0 to 1.0 where:
- 1.0 = Perfect match with expected output, excellent quality
- 0.8 = Very good, minor differences acceptable
- 0.6 = Good, some issues but generally correct
- 0.4 = Fair, several problems but salvageable
- 0.2 = Poor, major issues
- 0.0 = Completely incorrect or missing

Score: [your score]

Justification: [brief explanation of your score]
""", encoding="utf-8")
    
    (root / "eval" / "prompts" / "sentiment_judge.txt").write_text("""
You are evaluating whether the generated customer support response appropriately matches the sentiment and urgency of the customer's request.

INPUT REQUEST:
{input}

GENERATED RESPONSE:
{output}

EXPECTED CHARACTERISTICS:
{expected}

Rate the response on a scale of 0.0 to 1.0 based on:
- Sentiment appropriateness
- Urgency recognition
- Professional tone
- Accuracy of information

Score: [your score between 0.0 and 1.0]
""", encoding="utf-8")
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
        elif ev.type == "llm":
            if not ev.prompt_path:
                rprint(f"[red]prompt_path required for LLM evaluator: {ev.name}[/red]")
                continue
            if not ev.provider:
                rprint(f"[red]provider required for LLM evaluator: {ev.name}[/red]")
                continue
            if not ev.model:
                rprint(f"[red]model required for LLM evaluator: {ev.name}[/red]")
                continue
            
            try:
                s, v = ev_llm.evaluate(
                    outputs=o_map,
                    fixtures=f_map,
                    provider=ev.provider,
                    model=ev.model,
                    prompt_path=ev.prompt_path,
                    api_key_env_var=ev.api_key_env_var,
                    base_url=ev.base_url,
                    temperature=ev.temperature or 0.1,
                    max_tokens=ev.max_tokens or 1000
                )
            except Exception as e:
                rprint(f"[red]LLM evaluator {ev.name} failed: {e}[/red]")
                continue
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

