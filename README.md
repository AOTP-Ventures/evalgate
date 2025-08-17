# AOTP Ventures EvalGate

**EvalGate** runs deterministic LLM/RAG evals as a PR check. It compares your repo’s generated outputs against **fixtures**, validates **formatting**, **label accuracy**, and **latency/cost budgets**, and posts a readable summary on the PR. Default is **local-only** (no telemetry).

- ✅ Deterministic checks (schema/labels/latency/cost)
- 🧪 Regression vs `main` baseline
- 🔒 Local-only by default; optional “metrics-only” later
- 🧰 Zero infra — a composite GitHub Action + tiny CLI

## Quick Start

### 1. Install and Initialize
```bash
# Initialize EvalGate in your project
uvx --from evalgate evalgate init

# This creates:
# - .github/evalgate.yml (configuration)
# - eval/fixtures/ (test data with expected outputs)
# - eval/schemas/ (JSON schemas for validation)
```

### 2. Generate Your Model's Outputs
```bash
# Run your model/system to generate outputs for the fixtures
# (Replace with your actual prediction script)
python scripts/predict.py --in eval/fixtures --out .evalgate/outputs
```

### 3. Run Evaluation
```bash
# Run the evaluation suite
uvx --from evalgate evalgate run --config .github/evalgate.yml

# View results summary
uvx --from evalgate evalgate report --summary --artifact .evalgate/results.json
```

## GitHub Actions Integration

### Option 1: Use the Composite Action
Add this to your `.github/workflows/` directory:

```yaml
name: EvalGate
on: [pull_request]

jobs:
  evalgate:
    runs-on: ubuntu-latest
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
```

### Option 2: Direct Integration
Or integrate directly in your existing workflow:

```yaml
- name: Install uv
  run: |
    curl -LsSf https://astral.sh/uv/install.sh | sh
    echo "$HOME/.local/bin" >> $GITHUB_PATH

- name: Run EvalGate
  run: uvx --from evalgate evalgate run --config .github/evalgate.yml

- name: EvalGate Summary
  if: always()
  run: uvx --from evalgate evalgate report --summary --artifact .evalgate/results.json
```
