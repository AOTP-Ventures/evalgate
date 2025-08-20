
from __future__ import annotations

import json
import os
import pathlib
import random
import subprocess
import urllib.error
import urllib.request
import yaml
import typer
from pydantic import ValidationError
from rich import print as rprint

from .config import Config
from .evaluators.base import registry
from .evaluators import (
    category_match as _category_match,  # noqa: F401
    embedding_similarity as _embedding_similarity,  # noqa: F401
    json_schema as _json_schema,  # noqa: F401
    latency_cost as _latency_cost,  # noqa: F401
    llm_judge as _llm_judge,  # noqa: F401
    regex_match as _regex_match,  # noqa: F401
    rouge_bleu as _rouge_bleu,  # noqa: F401
    required_fields as _required_fields,  # noqa: F401
    classification_metrics as _classification_metrics,  # noqa: F401
)
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

        func = registry.get(ev.type)
        if func is None:
            rprint(f"[yellow]Unknown evaluator type: {ev.type}[/yellow]")
            continue
        try:
            s, v, extra = func(cfg, ev, o_map, f_map)
        except Exception as e:
            rprint(f"[red]{ev.type} evaluator {ev.name} failed: {e}[/red]")
            evaluator_errors.append(f"Evaluator '{ev.name}' failed to run: {str(e)}")
            continue
        if extra.get("latency") is not None:
            latency = extra["latency"]
        if extra.get("cost") is not None:
            cost = extra["cost"]
        if extra.get("table") is not None:
            tables.append(extra["table"])
        if extra.get("plot") is not None:
            plots.append(extra["plot"])
        score_item = {"name": ev.name, "score": float(s), "weight": ev.weight}
        if extra.get("metrics") is not None:
            score_item["metrics"] = extra["metrics"]
        scores.append(score_item)
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

baseline_app = typer.Typer(help="Manage baseline results", no_args_is_help=True)
app.add_typer(baseline_app, name="baseline")

@baseline_app.command("update")
def baseline_update(config: str = typer.Option(..., help="Path to evalgate YAML"),
                    message: str = typer.Option("Update EvalGate baseline", help="Commit message")):
    """Run evals and commit results to the baseline ref."""
    try:
        cfg = Config.model_validate(yaml.safe_load(pathlib.Path(config).read_text(encoding="utf-8")))
    except ValidationError as e:
        rprint("[red]Invalid config:[/red]", e)
        raise typer.Exit(2)
    typer.invoke(run, config=config, output=cfg.report.artifact_path)
    ref = cfg.baseline.ref
    artifact = cfg.report.artifact_path
    remote, branch = (ref.split("/", 1) if "/" in ref else (None, ref))
    current = subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"], text=True).strip()
    if remote:
        subprocess.check_call(["git", "fetch", remote, branch])
    subprocess.check_call(["git", "checkout", branch])
    subprocess.check_call(["git", "add", artifact])
    subprocess.check_call(["git", "commit", "-m", message])
    if remote:
        subprocess.check_call(["git", "push", remote, branch])
    subprocess.check_call(["git", "checkout", current])
    rprint(f"[green]Committed {artifact} to {ref}[/green]")

@app.command()
def report(
    pr: bool = typer.Option(False, "--pr", help="(future) post PR comment via API"),
    summary: bool = typer.Option(False, "--summary", help="Write to $GITHUB_STEP_SUMMARY"),
    artifact: str = typer.Option(".evalgate/results.json", help="Path to results JSON"),
    max_failures: int = typer.Option(20, "--max-failures", help="Max failures to show"),
    check_run: bool = typer.Option(
        False,
        "--check-run",
        help="Create a GitHub check run with summary and annotations",
    ),
):
    """Render a markdown summary from results."""
    data = read_json(artifact)
    md = render_markdown(data, max_failures=max_failures)
    if summary and "GITHUB_STEP_SUMMARY" in os.environ:
        pathlib.Path(os.environ["GITHUB_STEP_SUMMARY"]).write_text(md, encoding="utf-8")
    else:
        print(md)
    if check_run:
        token = os.environ.get('GITHUB_TOKEN')
        sha = os.environ.get('GITHUB_SHA')
        repo = os.environ.get('GITHUB_REPOSITORY')
        if not (token and sha and repo):
            rprint('[yellow]Missing GITHUB_TOKEN, GITHUB_SHA, or GITHUB_REPOSITORY for check run[/yellow]')
        else:
            annotations = []
            for fail in data.get('failures', [])[:50]:
                path = ''
                msg = fail
                if ':' in fail:
                    name, msg_part = fail.split(':', 1)
                    path = f'eval/fixtures/{name}.json'
                    msg = msg_part.strip()
                annotations.append({
                    'path': path,
                    'start_line': 1,
                    'end_line': 1,
                    'annotation_level': 'failure',
                    'message': msg[:1000],
                })
            payload = {
                'name': 'EvalGate',
                'head_sha': sha,
                'status': 'completed',
                'conclusion': 'success' if data.get('gate', {}).get('passed') else 'failure',
                'output': {
                    'title': 'EvalGate',
                    'summary': md[:65535],
                    'annotations': annotations,
                },
            }
            req = urllib.request.Request(
                f'https://api.github.com/repos/{repo}/check-runs',
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {token}',
                    'Accept': 'application/vnd.github+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'evalgate',
                },
                method='POST',
            )
            try:
                urllib.request.urlopen(req)
            except urllib.error.URLError as e:
                rprint(f'[yellow]Failed to create check run: {e}[/yellow]')

def main():
    app()

if __name__ == "__main__":
    main()

