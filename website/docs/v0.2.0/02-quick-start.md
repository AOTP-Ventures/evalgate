# Quick Start Guide

Get EvalGate running in your project in under 10 minutes. Zero infrastructure required.

⚡ **Estimated time: 8 minutes**

This guide assumes you have a GitHub repository and can run Python scripts.

## Step 1: Test EvalGate locally

Before setting up CI, let's make sure EvalGate works with your project locally.

```bash
uvx --from evalgate evalgate init
ls -la  # Check that .github/evalgate.yml was created
```

**Note:** The `init` command creates a basic configuration. We'll customize it in the next steps.

## Step 2: Create test fixtures

Create example inputs and expected outputs for your AI system.

```bash
mkdir -p eval/fixtures
```

Create `eval/fixtures/cx_001.json`:

```json
{
  "input": { 
    "email_html": "<p>URGENT—refund needed before Friday</p>", 
    "thread_context": [] 
  },
  "expected": { 
    "priority": "P1", 
    "tags": ["billing", "refunds"], 
    "assignee": "queue:finance" 
  },
  "meta": { 
    "latency_ms": 950, 
    "cost_usd": 0.021 
  }
}
```

**Customize this:** Replace this example with your actual input/output structure. The `meta` section with latency and cost is optional.

## Step 3: Generate outputs

Create a script that reads your fixtures and generates outputs using your AI system.

```bash
mkdir -p .evalgate/outputs
python scripts/predict.py --in eval/fixtures --out .evalgate/outputs
```

**Your script here:** `scripts/predict.py` should read from `eval/fixtures` and write JSON outputs to `.evalgate/outputs`. Each output file should match a fixture filename (e.g., `cx_001.json`).

## Step 4: Configure EvalGate

Update `.github/evalgate.yml` with your evaluation rules:

```yaml
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
# EvalGate never collects telemetry
# telemetry: { mode: "local_only" }  # Not needed - EvalGate has zero telemetry
```

## Step 5: Test locally

Run EvalGate locally to make sure everything works:

```bash
uvx --from evalgate evalgate run --config .github/evalgate.yml
uvx --from evalgate evalgate report --summary --artifact ./.evalgate/results.json
```

✅ **Success!** If this runs without errors, you're ready for the next step.

## Step 6: Establish baseline

Commit your configuration and run it on your main branch to establish a baseline:

```bash
git add .github/evalgate.yml eval/ scripts/predict.py
git commit -m "Add EvalGate evaluation setup"
git push origin main
```

## Step 7: Set up GitHub Actions

EvalGate automatically creates a GitHub Action workflow. Verify it was created:

```bash
ls -la .github/workflows/evalgate.yml
```

If the file doesn't exist, create it manually:

```yaml
name: EvalGate Evaluation
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  evalgate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Generate AI outputs
        run: |
          python scripts/predict.py --in eval/fixtures --out .evalgate/outputs
      
      - name: Run EvalGate
        uses: AOTP-Ventures/evalgate@v0.2.0
        with:
          config-path: '.github/evalgate.yml'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Step 8: Test with a PR

Create a test PR to see EvalGate in action:

```bash
git checkout -b test-evalgate
# Make a small change to your AI system
git add .
git commit -m "Test EvalGate evaluation"
git push origin test-evalgate
```

Open the PR in GitHub and watch for EvalGate's evaluation comment!

## What's Next?

- [Learn about different evaluators](03-evaluators.md)
- [Set up LLM-as-Judge evaluation](04-llm-as-judge.md)
- [Configure advanced settings](05-configuration.md)
