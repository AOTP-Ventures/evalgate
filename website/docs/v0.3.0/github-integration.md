---
title: "GitHub Integration"
section: "Advanced Features"
slug: "github-integration"
order: 7
description: "CI/CD workflows and Automation"
---

# GitHub Actions Integration

Automate AI evaluation in your CI/CD pipeline with EvalGate.

## Why GitHub Actions?

🚀 Automated Quality Gates  
EvalGate integrates seamlessly with GitHub Actions to evaluate every pull request and catch regressions.

✅ Key Benefits

- Automatic evaluation on every PR
- Baseline comparison and regression detection
- Detailed PR comments with scores and insights
- Zero-setup LLM evaluation with secure API keys

## Quick Setup

### 1. Install EvalGate

```bash
pip install evalgate
# or use the GitHub Action:
# uses: aotp-ventures/evalgate@v0
```

### 2. Create Configuration File

Create `.github/evalgate.yml`:

```yaml
# EvalGate Configuration
evaluators:
  - name: quality
    type: llm
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/quality.txt
    api_key_env_var: OPENAI_API_KEY
    weight: 0.7

  - name: structure
    type: schema
    schema_path: eval/schemas/response.json
    weight: 0.2

  - name: performance
    type: budgets
    weight: 0.1

fixtures:
  path: eval/fixtures/**/*.json

outputs:
  path: .evalgate/outputs/**/*.json

baseline:
  ref: origin/main
```

### 3. Run Evaluation

```bash
evalgate run --config .github/evalgate.yml
# Optional:
# evalgate run --config .github/evalgate.yml --output .evalgate/results.json --clear-cache
```

To update the stored baseline after changing fixtures or evaluators:

```bash
evalgate baseline update --config .github/evalgate.yml
```

### 4. GitHub Actions Workflow

```yaml
name: EvalGate

on:
  pull_request:
    paths:
      - 'src/**'
      - 'eval/**'
      - '.github/evalgate.yml'

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aotp-ventures/evalgate@v0
        with:
          config: .github/evalgate.yml
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}

  update-baseline:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          pip install evalgate
          evalgate baseline update --config .github/evalgate.yml
```

## Next Steps

- [Set Up LLM Evaluation](llm-as-judge.md)
- [Configure Baseline Management](configuration.md#baselines)
- [Create Custom Evaluators](evaluators.md)

---

*EvalGate's GitHub Actions integration provides production-ready AI evaluation workflows that scale from individuals to large teams.*

