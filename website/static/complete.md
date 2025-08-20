# EvalGate Complete Documentation

**EvalGate** is an open-source tool that runs deterministic LLM/RAG evaluations as GitHub PR checks.

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


---


# Configuration Reference

EvalGate uses a YAML configuration file (typically `.github/evalgate.yml`) to define evaluations.

## Complete Example

```yaml
# Performance budgets
budgets:
  p95_latency_ms: 1200
  max_cost_usd_per_item: 0.03

# Input fixtures
fixtures:
  path: "eval/fixtures/**/*.json"

# Model outputs
outputs:
  path: ".evalgate/outputs/**/*.json"

# Evaluators to run
evaluators:
  - name: json_formatting
    type: json_schema
    schema_path: "eval/schemas/response.json"
    weight: 0.4
  
  - name: priority_accuracy
    type: category_match
    expected_field: "priority"
    weight: 0.4
  
  - name: latency_cost
    type: latency_cost
    weight: 0.2

# Gate configuration
gate:
  min_overall_score: 0.90
  allow_regression: false

# Reporting options
report:
  pr_comment: true
  artifact_path: ".evalgate/results.json"

# Baseline comparison
baseline:
  ref: "origin/main"

# Privacy settings
telemetry:
  mode: "local_only"
```

## Configuration Sections

### Budgets

Define performance and cost constraints for your model.

```yaml
budgets:
  p95_latency_ms: 1200           # 95th percentile latency limit
  max_cost_usd_per_item: 0.03    # Maximum cost per evaluation
  avg_latency_ms: 800            # Average latency limit (optional)
  max_latency_ms: 5000           # Hard latency limit (optional)
```

### Fixtures & Outputs

Specify where to find test data and model outputs.

```yaml
fixtures:
  path: "eval/fixtures/**/*.json"
  encoding: "utf-8"              # Optional, default: utf-8

outputs:
  path: ".evalgate/outputs/**/*.json"
  encoding: "utf-8"              # Optional, default: utf-8
```

### Evaluators

Configure the evaluation pipeline. Each evaluator has:
- `name`: Unique identifier
- `type`: Evaluator type (see [Evaluator Types](/docs/evaluators))
- `weight`: Relative importance (0.0-1.0)
- Type-specific configuration

```yaml
evaluators:
  # JSON Schema validation
  - name: schema_check
    type: json_schema
    schema_path: "eval/schemas/output.json"
    weight: 0.3
    strict: true                 # Optional, fail on any schema violation

  # Category matching
  - name: category_check
    type: category_match
    expected_field: "category"
    weight: 0.3
    case_sensitive: false        # Optional, default: false

  # LLM Judge
  - name: quality_judge
    type: llm_judge
    provider: openai             # openai, anthropic, azure, local
    model: gpt-4
    prompt_path: eval/prompts/judge.txt
    api_key_env_var: OPENAI_API_KEY
    weight: 0.4
    min_score: 0.75             # Optional, minimum acceptable score
    cache_responses: true        # Optional, default: true
```

### Gate Configuration

Control when evaluations should pass or fail.

```yaml
gate:
  min_overall_score: 0.90       # Minimum weighted average score
  allow_regression: false       # Allow scores to drop vs baseline
  max_violations: 0             # Maximum number of violations allowed
  required_evaluators:          # Optional, specific evaluators that must pass
    - json_formatting
    - priority_accuracy
```

### Reporting

Configure how results are reported and stored.

```yaml
report:
  pr_comment: true              # Post results as PR comment
  artifact_path: ".evalgate/results.json"
  format: "detailed"            # "summary" or "detailed"
  include_violations: true      # Include violation details
  max_comment_length: 65536     # Optional, truncate long comments
```

### Baseline Comparison

Compare current results against a baseline (usually main branch).

```yaml
baseline:
  ref: "origin/main"            # Git reference for baseline
  file_path: ".evalgate/results.json"  # Optional, custom baseline file
  auto_update: false            # Optional, auto-update baseline on main
```

### Telemetry & Privacy

Control data collection and sharing.

```yaml
telemetry:
  mode: "local_only"            # "local_only", "metrics_only", "full"
  endpoint: ""                  # Optional, custom telemetry endpoint
```

## Environment Variables

Some configuration can be overridden with environment variables:

- `EVALGATE_CONFIG` - Path to configuration file
- `EVALGATE_FIXTURES_PATH` - Override fixtures path
- `EVALGATE_OUTPUTS_PATH` - Override outputs path
- `EVALGATE_TELEMETRY_MODE` - Override telemetry mode

## Advanced Configuration

### Multiple Configuration Files

You can split configuration across multiple files:

```yaml
# .github/evalgate.yml
extends: 
  - eval/base-config.yml
  - eval/llm-judges.yml

# Override specific settings
gate:
  min_overall_score: 0.95
```

### Conditional Evaluators

Run different evaluators based on conditions:

```yaml
evaluators:
  - name: basic_validation
    type: json_schema
    schema_path: "eval/schemas/basic.json"
    weight: 0.5
    
  - name: advanced_validation
    type: llm_judge
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/advanced.txt
    weight: 0.5
    enabled_when: ${{ github.event_name == 'pull_request' }}
```

### Custom Scoring

Override default scoring behavior:

```yaml
scoring:
  method: "weighted_average"     # "weighted_average", "minimum", "product"
  normalize_scores: true         # Optional, normalize to 0-1 range
  penalty_weight: 0.1           # Optional, penalty for violations
```

## Validation

Validate your configuration:

```bash
uvx --from evalgate evalgate validate --config .github/evalgate.yml
```

## Next Steps

- **[Evaluator Types](/docs/evaluators)** - Learn about all available evaluators
- **[Examples](/docs/examples)** - See real-world configurations
- **[GitHub Actions](/docs/github-actions)** - CI/CD integration


---


# Evaluator Types

EvalGate includes 13+ built-in evaluator types to comprehensively test your AI systems.

## Core Evaluators

### JSON Schema Validation
Validates that outputs conform to expected JSON structure and data types.

```yaml
evaluators:
  - name: json_formatting
    type: json_schema
    schema_path: "eval/schemas/response.json"
    weight: 0.3
```

### Category Match
Checks if categorical fields (like labels, priorities, classifications) match expected values.

```yaml
evaluators:
  - name: priority_accuracy
    type: category_match
    expected_field: "priority"
    weight: 0.4
```

### Latency & Cost Budgets
Ensures your model meets performance and cost requirements.

```yaml
evaluators:
  - name: performance_check
    type: latency_cost
    weight: 0.3
```

## Advanced Evaluators

### LLM Judge
Use language models to evaluate complex criteria like quality, tone, and accuracy.

```yaml
evaluators:
  - name: content_quality
    type: llm_judge
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/quality_judge.txt
    weight: 0.4
    min_score: 0.75
```

### Conversation Flow
Validate multi-turn conversations and dialogue systems.

```yaml
evaluators:
  - name: conversation_check
    type: conversation_flow
    expected_final_field: content
    max_turns: 5
    weight: 0.3
```

### Tool Usage
Validate that AI agents use tools correctly and in the right sequence.

```yaml
evaluators:
  - name: tool_validation
    type: tool_usage
    expected_tool_calls: true
    weight: 0.2
```

## Text Analysis Evaluators

### Regex Match
Pattern-based text validation for specific formats or content requirements.

```yaml
evaluators:
  - name: format_check
    type: regex_match
    pattern: "^[A-Z]{2,3}-\\d{3,4}$"
    weight: 0.2
```

### ROUGE & BLEU Scores
Text similarity metrics for content generation tasks.

```yaml
evaluators:
  - name: text_similarity
    type: rouge_bleu
    metrics: ["rouge-l", "bleu"]
    weight: 0.3
```

### Embedding Similarity
Semantic similarity using sentence transformers.

```yaml
evaluators:
  - name: semantic_similarity
    type: embedding_similarity
    model: "all-MiniLM-L6-v2"
    threshold: 0.8
    weight: 0.4
```

## Utility Evaluators

### Required Fields
Ensure all necessary fields are present in outputs.

```yaml
evaluators:
  - name: field_presence
    type: required_fields
    required_fields: ["id", "status", "priority"]
    weight: 0.2
```

### Classification Metrics
Calculate precision, recall, and F1 scores for classification tasks.

```yaml
evaluators:
  - name: classification_eval
    type: classification_metrics
    label_field: "category"
    weight: 0.3
```

### Workflow DAG
Validate complex multi-step workflows and dependencies.

```yaml
evaluators:
  - name: workflow_validation
    type: workflow_dag
    dag_file: "eval/workflows/process.yaml"
    weight: 0.3
```

## Custom Evaluators

Create your own evaluators by extending the base evaluator class:

```python
from evalgate.evaluators import BaseEvaluator
from evalgate.plugins import registry

@registry.evaluator("my_custom")
class MyCustomEvaluator(BaseEvaluator):
    def evaluate(self, outputs, fixtures, **kwargs):
        score = 1.0  # your scoring logic here
        violations: list[str] = []
        return score, violations
```

Then use it in your configuration:

```yaml
evaluators:
  - name: custom_check
    type: my_custom
    weight: 0.5
```

## Next Steps

- **[Configuration Reference](/docs/configuration)** - Complete YAML configuration options
- **[Examples](/docs/examples)** - Real-world usage examples
- **[GitHub Actions](/docs/github-actions)** - CI/CD integration


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


---


# Examples

Real-world EvalGate configurations for different AI use cases.

## Customer Support Chatbot

Evaluate response quality, accuracy, and tone for customer support responses.

### Configuration

```yaml
# .github/evalgate.yml
budgets:
  p95_latency_ms: 2000
  max_cost_usd_per_item: 0.05

fixtures:
  path: "eval/fixtures/support/*.json"

outputs:
  path: ".evalgate/outputs/support/*.json"

evaluators:
  # Ensure proper JSON structure
  - name: response_format
    type: json_schema
    schema_path: "eval/schemas/support_response.json"
    weight: 0.2

  # Check sentiment/priority classification
  - name: priority_accuracy
    type: category_match
    expected_field: "priority"
    weight: 0.3

  # Use GPT-4 to judge response quality
  - name: response_quality
    type: llm_judge
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/support_quality.txt
    weight: 0.4
    min_score: 0.8

  # Performance requirements
  - name: performance
    type: latency_cost
    weight: 0.1

gate:
  min_overall_score: 0.85
  allow_regression: false
```

### Sample Fixture

```json
{
  "input": {
    "message": "My order #12345 hasn't arrived yet. I'm getting frustrated!",
    "customer_id": "cust_789",
    "order_date": "2024-01-15"
  },
  "expected": {
    "priority": "medium",
    "sentiment": "frustrated",
    "resolution_type": "order_tracking"
  },
  "meta": {
    "latency_ms": 1200,
    "cost_usd": 0.03
  }
}
```

### LLM Judge Prompt

```text
# eval/prompts/support_quality.txt
You are evaluating customer support responses for quality and appropriateness.

CUSTOMER MESSAGE:
{input.message}

EXPECTED HANDLING:
- Priority: {expected.priority}
- Sentiment: {expected.sentiment}
- Resolution Type: {expected.resolution_type}

AI RESPONSE:
{output}

Rate the response from 0.0 to 1.0 based on:
- Appropriateness to customer sentiment
- Accuracy of priority assessment
- Helpfulness and clarity
- Professional tone

Score: [your score]
Reasoning: [brief explanation]
```

## RAG Document Q&A System

Evaluate retrieval accuracy, answer quality, and source attribution.

### Configuration

```yaml
budgets:
  p95_latency_ms: 3000
  max_cost_usd_per_item: 0.08

fixtures:
  path: "eval/fixtures/qa/*.json"

outputs:
  path: ".evalgate/outputs/qa/*.json"

evaluators:
  # Ensure all required fields are present
  - name: required_fields
    type: required_fields
    required_fields: ["answer", "sources", "confidence"]
    weight: 0.2

  # Check answer accuracy with embedding similarity
  - name: answer_similarity
    type: embedding_similarity
    model: "all-MiniLM-L6-v2"
    threshold: 0.8
    weight: 0.4

  # Validate source attribution
  - name: source_accuracy
    type: category_match
    expected_field: "primary_source"
    weight: 0.2

  # Use LLM to judge overall quality
  - name: qa_quality
    type: llm_judge
    provider: anthropic
    model: claude-3-sonnet
    prompt_path: eval/prompts/qa_judge.txt
    weight: 0.2

gate:
  min_overall_score: 0.80
```

### Sample Fixture

```json
{
  "input": {
    "question": "What is the refund policy for software purchases?",
    "context": ["policy_doc_1", "faq_doc_3"]
  },
  "expected": {
    "answer": "Software purchases can be refunded within 30 days of purchase if unused.",
    "primary_source": "policy_doc_1",
    "confidence": 0.95
  }
}
```

## Code Generation Assistant

Evaluate generated code for correctness, style, and security.

### Configuration

```yaml
budgets:
  p95_latency_ms: 5000
  max_cost_usd_per_item: 0.12

fixtures:
  path: "eval/fixtures/code/*.json"

outputs:
  path: ".evalgate/outputs/code/*.json"

evaluators:
  # Check if code matches expected patterns
  - name: code_structure
    type: regex_match
    pattern: "^(def|class|import).*"
    weight: 0.2

  # Validate function signatures and outputs
  - name: function_validation
    type: json_schema
    schema_path: "eval/schemas/code_output.json"
    weight: 0.2

  # Use LLM to judge code quality
  - name: code_quality
    type: llm_judge
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/code_judge.txt
    weight: 0.4
    min_score: 0.75

  # Check for required security practices
  - name: security_check
    type: regex_match
    pattern: "(?!.*(eval|exec|os\\.system))"  # Avoid dangerous functions
    weight: 0.2

gate:
  min_overall_score: 0.80
```

## Multi-Agent Workflow

Evaluate complex agent interactions and tool usage.

### Configuration

```yaml
budgets:
  p95_latency_ms: 10000
  max_cost_usd_per_item: 0.25

fixtures:
  path: "eval/fixtures/workflow/*.json"

outputs:
  path: ".evalgate/outputs/workflow/*.json"

evaluators:
  # Validate the workflow structure
  - name: workflow_structure
    type: workflow_dag
    dag_file: "eval/workflows/expected_flow.yaml"
    weight: 0.3

  # Check tool usage patterns
  - name: tool_usage
    type: tool_usage
    expected_tool_calls: true
    weight: 0.3

  # Validate conversation flow
  - name: conversation_flow
    type: conversation_flow
    expected_final_field: "result"
    max_turns: 10
    weight: 0.2

  # Overall task completion quality
  - name: task_completion
    type: llm_judge
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/workflow_judge.txt
    weight: 0.2

gate:
  min_overall_score: 0.75
```

### Sample Fixture

```json
{
  "input": {
    "task": "Research and book a flight to Paris for next month",
    "user_preferences": {
      "budget": "under $800",
      "airline_preference": "any",
      "departure_city": "New York"
    }
  },
  "expected": {
    "tool_calls": [
      {"name": "search_flights", "args": {"from": "NYC", "to": "CDG"}},
      {"name": "filter_flights", "args": {"max_price": 800}},
      {"name": "book_flight", "args": {"flight_id": "..."}},
      {"name": "send_confirmation", "args": {"booking_ref": "..."}}
    ],
    "result": "Flight booked successfully"
  }
}
```

## Classification Model

Evaluate classification accuracy with precision/recall metrics.

### Configuration

```yaml
fixtures:
  path: "eval/fixtures/classification/*.json"

outputs:
  path: ".evalgate/outputs/classification/*.json"

evaluators:
  # Standard classification metrics
  - name: classification_metrics
    type: classification_metrics
    label_field: "category"
    weight: 0.6

  # Ensure confidence scores are reasonable
  - name: confidence_validation
    type: json_schema
    schema_path: "eval/schemas/classification.json"
    weight: 0.2

  # Check for required fields
  - name: required_outputs
    type: required_fields
    required_fields: ["category", "confidence", "reasoning"]
    weight: 0.2

gate:
  min_overall_score: 0.85
  required_evaluators:
    - classification_metrics
```

## Performance Testing

Focus on latency and cost optimization.

### Configuration

```yaml
budgets:
  p95_latency_ms: 500
  max_cost_usd_per_item: 0.01
  avg_latency_ms: 300

fixtures:
  path: "eval/fixtures/performance/*.json"

outputs:
  path: ".evalgate/outputs/performance/*.json"

evaluators:
  # Primary focus on performance
  - name: performance_check
    type: latency_cost
    weight: 0.8

  # Basic functionality check
  - name: basic_validation
    type: json_schema
    schema_path: "eval/schemas/basic_output.json"
    weight: 0.2

gate:
  min_overall_score: 0.90
  max_violations: 0  # No performance violations allowed
```

## Next Steps

- **[Configuration Reference](/docs/configuration)** - Complete YAML options
- **[Evaluator Types](/docs/evaluators)** - All available evaluators  
- **[GitHub Actions](/docs/github-actions)** - CI/CD integration

## More Examples

Find complete working examples in our GitHub repository:
- [EvalGate Examples](https://github.com/aotp-ventures/evalgate/tree/main/examples)
