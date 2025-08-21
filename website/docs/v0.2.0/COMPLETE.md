# EvalGate Documentation v0.2.0

This is the complete EvalGate documentation for LLM reference.

## Table of Contents

1. [EvalGate Documentation](#evalgate-documentation)
2. [Quick Start Guide](#quick-start-guide)

---

## 1. EvalGate Documentation

*Source: 01-introduction.md*

⚡ **Zero Infrastructure Required**

# Stop AI Regressions Before They Ship

Automated evaluation for your AI features. Catch quality, cost, and performance issues in pull requests—before they reach production.

## The Problem

🚨 **AI Features Break in Production**

• Your LLM starts generating malformed JSON after a prompt change
• Response quality degrades but you only notice after customer complaints  
• Latency spikes from 200ms to 2s, breaking your user experience
• A model update changes behavior in subtle ways you didn't test for

**Sound familiar?** Most teams rely on manual testing or basic unit tests for AI features. But AI systems fail in ways traditional software doesn't—and those failures are expensive.

## Why EvalGate?

✅ **Catch AI Regressions Before They Ship**

EvalGate runs comprehensive evaluations on every PR, so you know exactly how your changes affect AI quality, cost, and performance—before they reach production.

### Before/After Comparison

**Before (Without EvalGate)**
• Manual testing on a few examples
• Hope nothing breaks in production
• Debug issues after customers complain
• No visibility into cost/latency changes
• Afraid to update prompts or models

**After (With EvalGate)**
• Automated evaluation on every PR
• Catch regressions before they merge
• Clear reports on what changed
• Budget enforcement for cost/latency
• Ship AI features with confidence

## What Makes EvalGate Different?

🎯 **Simple Tool, Not a Platform**

EvalGate isn't another heavyweight platform to learn and manage. It's a simple, **open source** CLI tool that works exactly where you already do—in GitHub PRs, with your existing workflow.

### Key Features

⚡ **Works Where You Already Are**
No new platforms to learn. Runs in your existing GitHub PRs, posts results as comments, integrates with your current code review process. It feels native.

🎈 **Lightweight by Design**
No servers, no databases, no dashboards to maintain. Just a CLI tool that runs when you need it. Your team can start using it in 10 minutes without any infrastructure changes.

🧠 **Start Simple, Scale Sophisticated**
Begin with basic JSON validation and exact matches. Add LLM-powered evaluation when you're ready. No big upfront commitment or complex setup.

🔒 **Your Code, Your Environment**
Everything runs in your GitHub Actions. Your prompts, data, and results never leave your environment. No vendor lock-in, no external dependencies.

🔓 **Fully Open Source**
Complete transparency with MIT license. Audit every line of code, contribute improvements, or fork it for your needs. No black boxes, no hidden telemetry.

---

## 2. Quick Start Guide

*Source: 02-quick-start.md*

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

---
