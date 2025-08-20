---
sidebar_position: 1
---

# Quick Start

Get started with **EvalGate in less than 10 minutes**.

EvalGate runs deterministic LLM/RAG evaluations as GitHub PR checks. It compares your generated outputs against fixtures, validates formatting, accuracy, latency/cost budgets, and can use LLMs as judges for complex criteria.

## Installation

EvalGate works with Python 3.10+ and requires no additional infrastructure.

### Initialize EvalGate in your project

```bash
# Initialize EvalGate in your project
uvx --from evalgate evalgate init

# This creates:
# - .github/evalgate.yml (configuration)
# - eval/fixtures/ (test data with expected outputs)
# - eval/schemas/ (JSON schemas for validation)
```

### Generate Your Model's Outputs

```bash
# Run your model/system to generate outputs for the fixtures
# (Replace with your actual prediction script)
python scripts/predict.py --in eval/fixtures --out .evalgate/outputs
```

### Run Evaluation

```bash
# Run the evaluation suite
uvx --from evalgate evalgate run --config .github/evalgate.yml

# View results summary
uvx --from evalgate evalgate report --summary --artifact .evalgate/results.json
```

## GitHub Actions Integration

Add this workflow to `.github/workflows/evalgate.yml`:

```yaml
name: EvalGate
on: [pull_request]

jobs:
  evalgate:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      checks: write
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      # Generate your model outputs
      - name: Generate outputs
        run: python scripts/predict.py --in eval/fixtures --out .evalgate/outputs

      # Run EvalGate
      - uses: aotp-ventures/evalgate@main
        with:
          config: .github/evalgate.yml
          check_run: true
```

## What's Next?

- **[Configuration Reference](/docs/configuration)** - Learn about all available evaluators and options
- **[Evaluator Types](/docs/evaluators)** - Explore the 13+ built-in evaluator types
- **[GitHub Actions Integration](/docs/github-actions)** - Advanced CI/CD setup
- **[Examples](/docs/examples)** - Real-world usage examples
