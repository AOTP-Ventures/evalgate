---
title: "Quick Start"
section: "Get Started"
slug: "quick-start"
order: 3
description: "Get running in under 10 minutes"
---

# Quick Start Guide

Get EvalGate v0.3.0 running in your project in under 10 minutes. Zero infrastructure required.

This guide assumes you have a GitHub repository and can run Python scripts.

## What You'll Build

By the end of this guide, you'll have:
- ✅ EvalGate configuration with multiple evaluator types
- ✅ Test fixtures (manually created or auto-generated)
- ✅ A working evaluation pipeline
- ✅ GitHub Actions integration with check runs
- ✅ Baseline management workflow

## Step 1: Install and Initialize

Install EvalGate and create your initial configuration:

```bash
# Initialize EvalGate in your project
uvx --from evalgate evalgate init

# Check what was created
ls -la .github/evalgate.yml
ls -la eval/
```

**✨ What's New in v0.3.0:** The `init` command now creates example LLM judge prompts and a more comprehensive configuration.

**Files Created:**
- `.github/evalgate.yml` - Main configuration
- `eval/fixtures/cx_001.json` - Example test fixture  
- `eval/schemas/queue_item.json` - JSON schema example
- `eval/prompts/quality_judge.txt` - LLM evaluation prompt
- `eval/prompts/sentiment_judge.txt` - Sentiment analysis prompt

## Step 2: Choose Your Fixture Strategy

### Option A: Manual Fixtures (Recommended for Starting)

Create `eval/fixtures/example_001.json` for your specific use case:

**For Classification Tasks:**
```json
{
  "input": {
    "text": "This product is amazing! Love the quality and fast shipping."
  },
  "expected": {
    "sentiment": "positive",
    "confidence": 0.95,
    "categories": ["product_quality", "shipping"]
  },
  "meta": {
    "latency_ms": 150,
    "cost_usd": 0.002
  }
}
```

**For Conversational AI:**
```json
{
  "messages": [
    {"role": "user", "content": "I need help with my order"},
    {"role": "assistant", "content": "I'd be happy to help with your order. Can you provide your order number?"}
  ],
  "expected": {
    "content": "I'd be happy to help with your order. Can you provide your order number?",
    "helpful": true,
    "professional_tone": true
  }
}
```

**For Agent/Tool Use:**
```json
{
  "input": {
    "user_request": "Book a flight from NYC to LAX for next Friday"
  },
  "expected": {
    "tool_calls": [
      {"name": "search_flights", "args": {"from": "NYC", "to": "LAX", "date": "2024-01-26"}},
      {"name": "book_flight", "args": {"flight_id": "AA123"}}
    ],
    "final_response": "I've found and booked your flight AA123 from NYC to LAX on Friday, January 26th."
  }
}
```

### Option B: Auto-Generated Fixtures (New in v0.3.0)

Generate fixtures automatically from your JSON schema:

```bash
# Generate 20 test fixtures from a schema
evalgate generate-fixtures \
  --schema eval/schemas/queue_item.json \
  --output eval/fixtures \
  --count 20 \
  --seed 42
```

**With Seed Data for More Realistic Fixtures:**
```bash
# Create seed data file
cat > eval/seed_data.json << EOF
{
  "common_categories": ["billing", "technical", "sales"],
  "priority_patterns": ["urgent", "asap", "critical"],
  "sample_emails": [
    "Need help with billing issue",
    "Product not working properly",
    "When will my order ship?"
  ]
}
EOF

# Generate fixtures using seed data
evalgate generate-fixtures \
  --schema eval/schemas/queue_item.json \
  --seed-data eval/seed_data.json \
  --count 50
```

## Step 3: Create Your Prediction Script

Fixtures in `eval/fixtures/` are JSON files that include an `input` object used for inference and an optional `expected` object used by evaluators. A prediction script reads each fixture, sends the `input` to your model, then writes a JSON file with the model's output to `.evalgate/outputs/` using the same filename.

Here's a minimal template:

```python
# scripts/predict.py
import argparse
import json
from pathlib import Path


def run_model(data: dict) -> dict:
    """Replace this function with your model's inference logic."""
    return {"sentiment": "positive"}


def main(input_dir: str, output_dir: str) -> None:
    inputs = Path(input_dir)
    outputs = Path(output_dir)
    outputs.mkdir(parents=True, exist_ok=True)

    for fixture_path in inputs.glob("*.json"):
        fixture = json.loads(fixture_path.read_text())
        result = run_model(fixture.get("input", {}))
        (outputs / fixture_path.name).write_text(json.dumps(result, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--in", dest="input_dir", required=True)
    parser.add_argument("--out", dest="output_dir", required=True)
    args = parser.parse_args()
    main(args.input_dir, args.output_dir)
```

Customize the `run_model` function to call your AI system. The output JSON can include additional fields (like latency or cost under a `meta` key) as long as it matches the evaluators' expectations.

## Step 4: Configure Evaluators

Update `.github/evalgate.yml` with your evaluation strategy. Here's a comprehensive v0.3.0 example:

```yaml
# Performance budgets
budgets:
  p95_latency_ms: 500
  max_cost_usd_per_item: 0.01

# Input/output paths  
fixtures: { path: "eval/fixtures/**/*.json" }
outputs: { path: ".evalgate/outputs/**/*.json" }

# Multi-evaluator setup (new in v0.3.0)
evaluators:
  # Deterministic validation
  - name: json_structure
    type: schema
    schema_path: "eval/schemas/queue_item.json"
    weight: 0.15
    
  - name: required_fields
    type: required_fields
    required: ["sentiment", "confidence"]
    weight: 0.1
    
  - name: category_accuracy
    type: category
    expected_field: "sentiment"
    weight: 0.15
    
  # Advanced AI evaluation (v0.3.0)
  - name: classification_metrics
    type: classification
    expected_field: "sentiment"
    weight: 0.2
    
  - name: content_quality
    type: llm
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/quality_judge.txt
    api_key_env_var: OPENAI_API_KEY
    weight: 0.2
    min_score: 0.75
    
  - name: semantic_similarity
    type: embedding  
    expected_field: "content"
    model: "sentence-transformers/all-MiniLM-L6-v2"
    threshold: 0.8
    weight: 0.1
    
  # Performance monitoring
  - name: performance
    type: budgets
    weight: 0.1

# Gate configuration
gate:
  min_overall_score: 0.85
  allow_regression: false

# Reporting
report:
  pr_comment: true
  artifact_path: ".evalgate/results.json"

# Baseline comparison
baseline:
  ref: "origin/main"
```

## Step 5: Generate Outputs and Test

Generate outputs and run your first evaluation:

```bash
# Generate AI outputs
python scripts/predict.py --in eval/fixtures --out .evalgate/outputs

# Run evaluation
evalgate run --config .github/evalgate.yml

# View detailed results
evalgate report --summary --artifact .evalgate/results.json
```

✅ **Success Indicators:**
- All evaluators run without errors
- Overall score meets your minimum threshold  
- No critical failures in required fields

🔧 **Common Issues:**
- **Missing fields**: Update your prediction script to include all expected outputs
- **Schema validation failures**: Check that your output format matches the schema
- **LLM evaluator errors**: Verify API keys and model availability

## Step 6: Set Up Baseline (New Workflow in v0.3.0)

Establish your quality baseline for future comparisons:

```bash
# Commit your configuration
git add .github/evalgate.yml eval/ scripts/predict.py
git commit -m "Add EvalGate v0.3.0 evaluation setup"

# Generate baseline results and update main branch
evalgate baseline update --config .github/evalgate.yml --message "Establish EvalGate v0.3.0 baseline"
```

**💡 Pro Tip - Progressive Quality Improvement:**
The baseline system in v0.3.0 enables "quality ratcheting":
- Each PR that improves scores can update the baseline
- Future PRs must meet or exceed the new higher bar
- Prevents quality regression while encouraging improvement

## Step 7: GitHub Actions Integration

Create `.github/workflows/evalgate.yml` with v0.3.0 features:

```yaml
name: EvalGate v0.3.0
on: [pull_request]

jobs:
  evalgate:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      checks: write  # New: for check runs
    
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      - name: Install uv
        run: |
          curl -LsSf https://astral.sh/uv/install.sh | sh
          echo "$HOME/.local/bin" >> $GITHUB_PATH

      # Optional: Install LLM dependencies if using LLM evaluators
      - name: Install EvalGate with LLM support
        if: contains(github.event.pull_request.body, '[llm]') 
        run: echo "Using LLM evaluators"

      - name: Generate AI outputs
        run: |
          python scripts/predict.py --in eval/fixtures --out .evalgate/outputs

      - name: Run EvalGate evaluation
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          uvx --from evalgate evalgate run --config .github/evalgate.yml

      # New in v0.3.0: Enhanced reporting with check runs
      - name: Report results with check run
        if: always()
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          uvx --from evalgate evalgate report \
            --summary \
            --check-run \
            --artifact .evalgate/results.json

      # Optional: Upload detailed results for debugging
      - name: Upload evaluation artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: evalgate-results
          path: |
            .evalgate/results.json
            .evalgate/cache.json
          retention-days: 30
```

## Step 8: Test with a Pull Request

Create a test PR to see EvalGate v0.3.0 in action:

```bash
# Create test branch
git checkout -b test-evalgate-v3

# Make a small change (e.g., update a prompt or model parameter)
echo "# Test change for EvalGate" >> README.md
git add README.md
git commit -m "Test EvalGate v0.3.0 evaluation"
git push origin test-evalgate-v3
```

**What You'll See:**
- ✅ **Check run** with pass/fail status
- 📊 **Detailed PR comment** with score breakdown
- 📈 **Regression analysis** vs. baseline
- 🔍 **Per-evaluator results** and failure details
- ⚡ **Performance metrics** (latency, cost)

🎉 **Congratulations!** You now have a comprehensive AI evaluation pipeline with EvalGate v0.3.0.

## Quick Reference

**Essential Commands:**
```bash
# Initialize project
evalgate init

# Generate test fixtures  
evalgate generate-fixtures --schema PATH --count N

# Run evaluation
evalgate run --config .github/evalgate.yml

# Update baseline
evalgate baseline update --config .github/evalgate.yml

# Generate reports
evalgate report --summary --check-run --artifact .evalgate/results.json
```

**Key Files:**
- `.github/evalgate.yml` - Main configuration
- `eval/fixtures/` - Test data
- `eval/schemas/` - JSON schemas for validation
- `eval/prompts/` - LLM evaluation prompts
- `.evalgate/outputs/` - Generated outputs
- `.evalgate/results.json` - Evaluation results
- `.evalgate/cache.json` - LLM response cache

---

*Ready to catch AI regressions before they ship? Your v0.3.0 setup gives you production-ready evaluation with minimal maintenance overhead.*
