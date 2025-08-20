---
sidebar_position: 4
---

# GitHub Actions Integration

EvalGate integrates seamlessly with GitHub Actions to run evaluations on every pull request.

## Quick Setup

### 1. Composite Action (Recommended)

The easiest way to integrate EvalGate is using our composite action:

```yaml
# .github/workflows/evalgate.yml
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

### 2. Direct Integration

For more control, integrate EvalGate directly:

```yaml
name: EvalGate
on: [pull_request]

jobs:
  evalgate:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      checks: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      - name: Install uv
        run: |
          curl -LsSf https://astral.sh/uv/install.sh | sh
          echo "$HOME/.local/bin" >> $GITHUB_PATH

      - name: Generate outputs
        run: python scripts/predict.py --in eval/fixtures --out .evalgate/outputs

      - name: Run EvalGate
        id: evalgate
        run: uvx --from evalgate evalgate run --config .github/evalgate.yml

      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: evalgate-results
          path: .evalgate/results.json
```

## LLM Judge Integration

When using LLM judges, you'll need to provide API keys:

### With Composite Action

```yaml
- uses: aotp-ventures/evalgate@main
  with:
    config: .github/evalgate.yml
    openai_api_key: ${{ secrets.OPENAI_API_KEY }}
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    check_run: true
```

### With Direct Integration

```yaml
- name: Run EvalGate with LLM judge
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: uvx --from evalgate[llm] evalgate run --config .github/evalgate.yml
```

### Setting Up API Keys

1. Go to your repository settings
2. Navigate to **Secrets and variables** → **Actions**
3. Add your API keys:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `ANTHROPIC_API_KEY` - Your Anthropic API key

## Advanced Configuration

### Matrix Testing

Test across multiple Python versions or configurations:

```yaml
jobs:
  evalgate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
        config: ["basic.yml", "advanced.yml"]
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
      - name: Run EvalGate
        run: uvx --from evalgate evalgate run --config .github/${{ matrix.config }}
```

### Conditional Execution

Run evaluations only under certain conditions:

```yaml
- name: Run EvalGate
  if: ${{ contains(github.event.pull_request.labels.*.name, 'needs-eval') }}
  run: uvx --from evalgate evalgate run --config .github/evalgate.yml
```

### Custom Output Handling

Process EvalGate results in subsequent steps:

```yaml
- name: Run EvalGate
  id: evalgate
  run: |
    uvx --from evalgate evalgate run --config .github/evalgate.yml
    total_score=$(jq -r '.overall' .evalgate/results.json)
    passed=$(jq -r '.gate.passed' .evalgate/results.json)
    echo "total_score=$total_score" >> "$GITHUB_OUTPUT"
    echo "passed=$passed" >> "$GITHUB_OUTPUT"

- name: Post results to Slack
  if: ${{ steps.evalgate.outputs.passed == 'false' }}
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"EvalGate failed with score ${{ steps.evalgate.outputs.total_score }}"}' \
      ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Outputs

The composite action provides these outputs:

- `total_score` - Overall evaluation score (0.0-1.0)
- `passed` - Whether the evaluation passed the gate (true/false)
- `violations` - Number of violations found
- `results_path` - Path to the detailed results JSON file

Example usage:

```yaml
jobs:
  evalgate:
    outputs:
      score: ${{ steps.evalgate.outputs.total_score }}
      passed: ${{ steps.evalgate.outputs.passed }}
    steps:
      - uses: aotp-ventures/evalgate@main
        id: evalgate
        with:
          config: .github/evalgate.yml

  deploy:
    needs: evalgate
    if: ${{ needs.evalgate.outputs.passed == 'true' }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: echo "Deploying with score ${{ needs.evalgate.outputs.score }}"
```

## Troubleshooting

### Common Issues

**Permission Denied**
```yaml
permissions:
  contents: read
  checks: write      # Required for check runs
  pull-requests: write  # Required for PR comments
```

**API Rate Limits**
```yaml
- name: Run EvalGate with backoff
  run: |
    uvx --from evalgate evalgate run --config .github/evalgate.yml \
      --llm-retry-attempts 3 \
      --llm-retry-delay 30
```

**Large Outputs**
```yaml
- name: Run EvalGate
  run: uvx --from evalgate evalgate run --config .github/evalgate.yml --max-output-size 1000
```

### Debug Mode

Enable debug logging:

```yaml
- name: Run EvalGate (Debug)
  env:
    EVALGATE_LOG_LEVEL: DEBUG
  run: uvx --from evalgate evalgate run --config .github/evalgate.yml --verbose
```

## Examples

- **[Basic Setup](https://github.com/aotp-ventures/evalgate/tree/main/examples/basic)**
- **[LLM Judge](https://github.com/aotp-ventures/evalgate/tree/main/examples/llm-judge)**
- **[Multi-Model](https://github.com/aotp-ventures/evalgate/tree/main/examples/multi-model)**

## Next Steps

- **[Configuration Reference](/docs/configuration)** - Complete YAML options
- **[Evaluator Types](/docs/evaluators)** - All available evaluators
- **[Examples](/docs/examples)** - Real-world usage examples
