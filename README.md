# AOTP Ventures EvalGate

**EvalGate** runs deterministic LLM/RAG evals as a PR check. It compares your repo's generated outputs against **fixtures**, validates **formatting**, **label accuracy**, **latency/cost budgets**, and can use **LLMs as judges** for complex criteria. It posts a readable summary on the PR. Default is **local-only** (no telemetry).

- ✅ Deterministic checks (schema/labels/latency/cost)
- 🧠 LLM-based evaluation for complex criteria
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

## LLM as Judge

EvalGate can use LLMs to evaluate outputs for complex criteria beyond simple schema validation.

### 1. Install with LLM support
```bash
# Install with LLM dependencies
pip install evalgate[llm]
# Or with uv
uvx --from evalgate[llm] evalgate
```

### 2. Create a prompt template
Create an evaluation prompt in `eval/prompts/quality_judge.txt`:
```
You are evaluating the quality of customer support responses.

INPUT:
{input}

EXPECTED:
{expected}

OUTPUT:
{output}

Rate from 0.0 to 1.0 based on accuracy, helpfulness, and tone.
Score: [your score]
```

### 3. Configure your evaluator
In `.github/evalgate.yml`:
```yaml
evaluators:
  # Your existing evaluators...
  - name: content_quality
    type: llm
    provider: openai  # or anthropic, azure, local
    model: gpt-4      # or other models
    prompt_path: eval/prompts/quality_judge.txt
    api_key_env_var: OPENAI_API_KEY
    weight: 0.3
```

### 4. Set your API key
```bash
export OPENAI_API_KEY=your_api_key_here
```

### 5. Run evaluation
```bash
evalgate run --config .github/evalgate.yml
```

### GitHub Actions Integration with API Keys

Add your API keys as repository secrets in GitHub, then use them in your workflow:

```yaml
# Optional: Validate API key is set (fail fast with clear message)
- name: Validate OpenAI API Key  
  run: |
    if [ -z "${{ secrets.OPENAI_API_KEY }}" ]; then
      echo "❌ OPENAI_API_KEY secret is not set"
      echo "Please add your OpenAI API key as a repository secret named 'OPENAI_API_KEY'"
      echo "Go to: Settings > Secrets and variables > Actions > New repository secret"
      exit 1
    fi

- name: Run EvalGate with LLM judge
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: uvx --from evalgate[llm] evalgate run --config .github/evalgate.yml
```

Or with the composite action:

```yaml
- uses: aotp-ventures/evalgate@main
  with:
    config: .github/evalgate.yml
    openai_api_key: ${{ secrets.OPENAI_API_KEY }}
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
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
  run: uvx --from evalgate evalgate report --summary --artifact ./.evalgate/results.json

# Optional: Upload detailed results for debugging
- name: Upload EvalGate Results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: evalgate-results
    path: .evalgate/results.json
    retention-days: 30
```
