
from __future__ import annotations

import json
import os
import pathlib
import random
import yaml
import typer
from pydantic import ValidationError
from rich import print as rprint

from .config import Config
from .evaluators import category_match as ev_cat
from .evaluators import embedding_similarity as ev_embed
from .evaluators import json_schema as ev_schema
from .evaluators import latency_cost as ev_budget
from .evaluators import llm_judge as ev_llm
from .evaluators import regex_match as ev_regex
from .evaluators import rouge_bleu as ev_rb
from .evaluators import classification_metrics as ev_cls
from .util import list_paths, read_json, write_json
from .fixture_generator import generate_suite
from .store import load_baseline
from .report import render_markdown
from .templates import (
    load_default_config,
    load_schema_example, 
    load_fixture_example,
    load_quality_judge_prompt,
    load_sentiment_judge_prompt
)

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
    (root / ".github" / "evalgate.yml").write_text(load_default_config(), encoding="utf-8")
    (root / "eval" / "schemas" / "queue_item.json").write_text(
        json.dumps(load_schema_example(), indent=2), encoding="utf-8")
    (root / "eval" / "fixtures" / "cx_001.json").write_text(
        json.dumps(load_fixture_example(), indent=2), encoding="utf-8")
    
    # Create example LLM prompt templates
    (root / "eval" / "prompts" / "quality_judge.txt").write_text(
        load_quality_judge_prompt(), encoding="utf-8")
    
    (root / "eval" / "prompts" / "sentiment_judge.txt").write_text(
        load_sentiment_judge_prompt(), encoding="utf-8")
    rprint("[green]Initialized example EvalGate files.[/green]")


@app.command("generate-fixtures")
def generate_fixtures(
    schema: str = typer.Option(..., help="Path to JSON schema"),
    output: str = typer.Option("eval/fixtures", help="Directory to write fixtures"),
    count: int = typer.Option(10, help="Number of fixtures to generate"),
    seed_data: str | None = typer.Option(None, help="Optional seed data JSON file"),
    seed: int | None = typer.Option(None, help="Random seed"),
):
    """Generate randomized fixtures from a schema."""
    schema_data = read_json(schema)
    seed_dict = read_json(seed_data) if seed_data else None
    if seed is not None:
        random.seed(seed)
    fixtures = generate_suite(schema_data, count, seed_dict)
    outdir = pathlib.Path(output)
    outdir.mkdir(parents=True, exist_ok=True)
    for i, fx in enumerate(fixtures, start=1):
        write_json(outdir / f"fixture_{i:03}.json", fx)
    rprint(f"[green]Generated {count} fixture(s) in {outdir}[/green]")

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
    evaluator_errors = []  # Track configuration/runtime errors separately
    latency = cost = None
    tables: list[dict[str, object]] = []
    plots: list[dict[str, str]] = []

    for ev in cfg.evaluators:
        if not ev.enabled:
            continue

        # Check for missing required fields upfront
        if ev.type == "llm":
            if not ev.prompt_path:
                evaluator_errors.append(f"Evaluator '{ev.name}' missing required field: prompt_path")
                continue
            if not ev.provider:
                evaluator_errors.append(f"Evaluator '{ev.name}' missing required field: provider")
                continue
            if not ev.model:
                evaluator_errors.append(f"Evaluator '{ev.name}' missing required field: model")
                continue
        if ev.type in ("embedding", "rouge_bleu", "classification") and not ev.expected_field:
            evaluator_errors.append(f"Evaluator '{ev.name}' missing required field: expected_field")
            continue
        if ev.type == "regex" and not (ev.pattern_field or ev.pattern_path):
            evaluator_errors.append(f"Evaluator '{ev.name}' missing pattern_field or pattern_path")
            continue
        
        extra = {}
        if ev.type == "schema":
            schema = read_json(ev.schema_path) if ev.schema_path else {}
            s, v = ev_schema.evaluate(o_map, schema)
        elif ev.type == "category":
            s, v = ev_cat.evaluate(o_map, f_map, ev.expected_field or "")
            # Build confusion matrix for classification results
            label_set: set[str] = set()
            matrix: dict[str, dict[str, int]] = {}
            for n in names:
                exp_val = f_map.get(n, {}).get("expected", {}).get(ev.expected_field or "")
                if exp_val is None:
                    continue
                got_val = o_map.get(n, {}).get(ev.expected_field or "")
                exp_label = str(exp_val)
                got_label = str(got_val)
                label_set.update([exp_label, got_label])
                matrix.setdefault(exp_label, {}).setdefault(got_label, 0)
                matrix[exp_label][got_label] += 1
            labels = sorted(label_set)
            headers = ["exp\\pred"] + labels
            rows = []
            for exp_label in labels:
                row = [exp_label]
                for pred_label in labels:
                    row.append(matrix.get(exp_label, {}).get(pred_label, 0))
                rows.append(row)
            tables.append({
                "title": f"Confusion Matrix ({ev.name})",
                "headers": headers,
                "rows": rows,
            })
        elif ev.type == "budgets":
            s, v, latency, cost = ev_budget.evaluate(f_map, {
                "p95_latency_ms": cfg.budgets.p95_latency_ms,
                "max_cost_usd_per_item": cfg.budgets.max_cost_usd_per_item
            })
        elif ev.type == "regex":
            patterns = {}
            if ev.pattern_path:
                patterns.update(read_json(ev.pattern_path))
            if ev.pattern_field:
                for n, fx in f_map.items():
                    patt = fx.get("expected", {}).get(ev.pattern_field)
                    if patt is not None:
                        patterns[n] = patt
            s, v = ev_regex.evaluate(o_map, f_map, patterns)
        elif ev.type == "llm":
            # Required field validation already done above
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
                # Track this as an evaluator error, not just a low score
                evaluator_errors.append(f"Evaluator '{ev.name}' failed to run: {str(e)}")
                # Don't add to scores - failed evaluators shouldn't contribute to scoring
                continue
        elif ev.type == "rouge_bleu":
            try:
                s, v = ev_rb.evaluate(
                    outputs=o_map,
                    fixtures=f_map,
                    field=ev.expected_field or "",
                    metric=ev.metric or "bleu",
                )
            except Exception as e:
                rprint(f"[red]ROUGE/BLEU evaluator {ev.name} failed: {e}[/red]")
                evaluator_errors.append(f"Evaluator '{ev.name}' failed to run: {str(e)}")
                continue
        elif ev.type == "embedding":
            try:
                s, v = ev_embed.evaluate(
                    outputs=o_map,
                    fixtures=f_map,
                    field=ev.expected_field or "",
                    model_name=ev.model or "sentence-transformers/all-MiniLM-L6-v2",
                    threshold=ev.threshold or 0.8,
                )
            except Exception as e:
                rprint(f"[red]Embedding evaluator {ev.name} failed: {e}[/red]")
                evaluator_errors.append(f"Evaluator '{ev.name}' failed to run: {str(e)}")
                continue
        elif ev.type == "classification":
            try:
                s, v, m = ev_cls.evaluate(
                    outputs=o_map,
                    fixtures=f_map,
                    field=ev.expected_field or "",
                    multi_label=ev.multi_label or False,
                )
                extra["metrics"] = m
            except Exception as e:
                rprint(f"[red]Classification evaluator {ev.name} failed: {e}[/red]")
                evaluator_errors.append(f"Evaluator '{ev.name}' failed to run: {str(e)}")
                continue
        else:
            rprint(f"[yellow]Unknown evaluator type: {ev.type}[/yellow]")
            continue
        scores.append({"name": ev.name, "score": float(s), "weight": ev.weight, **extra})
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

    # Fail the gate if any evaluators failed to run
    evaluators_ok = len(evaluator_errors) == 0
    if not evaluators_ok:
        rprint(f"[red]Gate failed: {len(evaluator_errors)} evaluator(s) failed to run[/red]")
    
    passed = overall >= cfg.gate.min_overall_score and regression_ok and evaluators_ok
    score_items = []
    for x in scores:
        item = {"name": x["name"], "score": x["score"], "delta": deltas.get(x["name"])}
        if "metrics" in x:
            item["metrics"] = x["metrics"]
        score_items.append(item)
    result = {
        "overall": overall,
        "scores": score_items,
        "failures": failures,
        "evaluator_errors": evaluator_errors,  # Separate from test failures
        "latency": latency,
        "cost": cost,
        "gate": {"min_overall_score": cfg.gate.min_overall_score, "allow_regression": cfg.gate.allow_regression, "passed": passed},
        "regression_ok": regression_ok,
        "evaluators_ok": evaluators_ok,
        "artifact_path": cfg.report.artifact_path,
        "tables": tables,
        "plots": plots,
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

