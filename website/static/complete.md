# EvalGate v0.3.0 - Complete Documentation

**EvalGate** is an open-source tool that runs deterministic LLM/RAG evaluations as GitHub PR checks. It compares generated outputs against fixtures, validates formatting, accuracy, latency/cost budgets, and can use LLMs as judges for complex criteria.

## Quick Start

### Installation
```bash
# Initialize EvalGate in your project
uvx --from evalgate evalgate init

# Generate your model's outputs
python scripts/predict.py --in eval/fixtures --out .evalgate/outputs

# Run evaluation
uvx --from evalgate evalgate run --config .github/evalgate.yml

# View results summary
uvx --from evalgate evalgate report --summary --artifact .evalgate/results.json
```

### GitHub Actions Integration
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
      - name: Generate outputs
        run: python scripts/predict.py --in eval/fixtures --out .evalgate/outputs
      - uses: aotp-ventures/evalgate@main
        with:
          config: .github/evalgate.yml
          check_run: true
```

## Configuration Reference

EvalGate uses YAML configuration (typically `.github/evalgate.yml`):

```yaml
# Performance budgets
budgets:
  p95_latency_ms: 1200
  max_cost_usd_per_item: 0.03

# Input fixtures and outputs
fixtures:
  path: "eval/fixtures/**/*.json"
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

# Reporting and baseline
report:
  pr_comment: true
  artifact_path: ".evalgate/results.json"
baseline:
  ref: "origin/main"
telemetry:
  mode: "local_only"
```

## All Evaluator Types

### Core Evaluators

**json_schema** - JSON structure validation
```yaml
- name: schema_check
  type: json_schema
  schema_path: "eval/schemas/output.json"
  weight: 0.3
```

**category_match** - Categorical field validation
```yaml
- name: category_check
  type: category_match
  expected_field: "category"
  weight: 0.3
```

**latency_cost** - Performance and cost validation
```yaml
- name: performance_check
  type: latency_cost
  weight: 0.3
```

### Advanced Evaluators

**llm_judge** - LLM-based evaluation
```yaml
- name: quality_judge
  type: llm_judge
  provider: openai  # openai, anthropic, azure, local
  model: gpt-4
  prompt_path: eval/prompts/judge.txt
  api_key_env_var: OPENAI_API_KEY
  weight: 0.4
  min_score: 0.75
```

**conversation_flow** - Multi-turn conversation validation
```yaml
- name: conversation_check
  type: conversation_flow
  expected_final_field: content
  max_turns: 5
  weight: 0.3
```

**tool_usage** - AI agent tool usage validation
```yaml
- name: tool_validation
  type: tool_usage
  expected_tool_calls: true
  weight: 0.2
```

### Text Analysis Evaluators

**regex_match** - Pattern-based validation
```yaml
- name: format_check
  type: regex_match
  pattern: "^[A-Z]{2,3}-\\d{3,4}$"
  weight: 0.2
```

**rouge_bleu** - Text similarity metrics
```yaml
- name: text_similarity
  type: rouge_bleu
  metrics: ["rouge-l", "bleu"]
  weight: 0.3
```

**embedding_similarity** - Semantic similarity
```yaml
- name: semantic_similarity
  type: embedding_similarity
  model: "all-MiniLM-L6-v2"
  threshold: 0.8
  weight: 0.4
```

### Utility Evaluators

**required_fields** - Field presence validation
```yaml
- name: field_presence
  type: required_fields
  required_fields: ["id", "status", "priority"]
  weight: 0.2
```

**classification_metrics** - Precision/recall/F1 scores
```yaml
- name: classification_eval
  type: classification_metrics
  label_field: "category"
  weight: 0.3
```

**workflow_dag** - Complex workflow validation
```yaml
- name: workflow_validation
  type: workflow_dag
  dag_file: "eval/workflows/process.yaml"
  weight: 0.3
```

## CLI Commands

**evalgate init** - Initialize EvalGate in project
```bash
uvx --from evalgate evalgate init
```

**evalgate run** - Run evaluation suite
```bash
uvx --from evalgate evalgate run --config .github/evalgate.yml
```

**evalgate report** - Generate reports
```bash
uvx --from evalgate evalgate report --summary --artifact .evalgate/results.json
```

**evalgate baseline** - Update baseline
```bash
uvx --from evalgate evalgate baseline update --config .github/evalgate.yml
```

## Fixture Format

Standard fixture format:
```json
{
  "input": {
    "message": "What is the weather today?",
    "context": {}
  },
  "expected": {
    "category": "weather",
    "priority": "low"
  },
  "meta": {
    "latency_ms": 800,
    "cost_usd": 0.02
  }
}
```

Conversation fixture format:
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" },
    {
      "role": "assistant",
      "content": "Hi there!",
      "tool_calls": [
        { "name": "search", "arguments": { "query": "Hello!" } }
      ]
    }
  ]
}
```

## Output Format

Standard output format:
```json
{
  "category": "weather",
  "priority": "low",
  "response": "Today is sunny with 75°F",
  "confidence": 0.95
}
```

With tool calls:
```json
{
  "output": "Flight booked successfully",
  "tool_calls": [
    {"name": "search", "args": {"query": "flights"}},
    {"name": "book", "args": {"flight_id": "FL123"}}
  ]
}
```

## Common Use Cases

### Customer Support Chatbot
- Evaluate response quality, tone, accuracy
- Use `llm_judge` for quality assessment
- Use `category_match` for priority/sentiment
- Use `latency_cost` for performance

### RAG Q&A System  
- Use `embedding_similarity` for answer accuracy
- Use `required_fields` for source attribution
- Use `llm_judge` for overall quality
- Use `category_match` for source validation

### Code Generation
- Use `regex_match` for code structure
- Use `json_schema` for output validation
- Use `llm_judge` for code quality
- Use security patterns in regex

### Multi-Agent Workflow
- Use `workflow_dag` for process validation
- Use `tool_usage` for agent interactions
- Use `conversation_flow` for dialogue
- Use `llm_judge` for task completion

### Classification Model
- Use `classification_metrics` for accuracy
- Use `json_schema` for output structure
- Use `required_fields` for completeness

## LLM Judge Configuration

### OpenAI Setup
```yaml
- name: quality_judge
  type: llm_judge
  provider: openai
  model: gpt-4
  prompt_path: eval/prompts/judge.txt
  api_key_env_var: OPENAI_API_KEY
  weight: 0.4
  min_score: 0.75
```

### Anthropic Setup
```yaml
- name: quality_judge
  type: llm_judge
  provider: anthropic
  model: claude-3-sonnet
  prompt_path: eval/prompts/judge.txt
  api_key_env_var: ANTHROPIC_API_KEY
  weight: 0.4
```

### Prompt Template Format
```text
You are evaluating AI responses for quality.

INPUT:
{input}

EXPECTED:
{expected}

OUTPUT:
{output}

Rate from 0.0 to 1.0 based on accuracy and helpfulness.
Score: [your score]
```

## GitHub Actions Advanced Setup

### With LLM Judges
```yaml
- uses: aotp-ventures/evalgate@main
  with:
    config: .github/evalgate.yml
    openai_api_key: ${{ secrets.OPENAI_API_KEY }}
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    check_run: true
```

### Direct Integration
```yaml
- name: Run EvalGate
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  run: uvx --from evalgate[llm] evalgate run --config .github/evalgate.yml
```

### Matrix Testing
```yaml
strategy:
  matrix:
    config: ["basic.yml", "advanced.yml"]
steps:
  - name: Run EvalGate
    run: uvx --from evalgate evalgate run --config .github/${{ matrix.config }}
```

## Custom Evaluators

Create custom evaluators by extending the base class:

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

Use in configuration:
```yaml
evaluators:
  - name: custom_check
    type: my_custom
    weight: 0.5
```

## Installation Options

### Basic Installation
```bash
uvx --from evalgate evalgate
```

### With LLM Support
```bash
uvx --from evalgate[llm] evalgate
pip install evalgate[llm]
```

### With Embeddings Support
```bash
pip install evalgate[embedding]
```

### Development Installation
```bash
pip install evalgate[dev]
```

## Environment Variables

- `EVALGATE_CONFIG` - Path to configuration file
- `EVALGATE_FIXTURES_PATH` - Override fixtures path
- `EVALGATE_OUTPUTS_PATH` - Override outputs path
- `EVALGATE_TELEMETRY_MODE` - Override telemetry mode
- `OPENAI_API_KEY` - OpenAI API key for LLM judges
- `ANTHROPIC_API_KEY` - Anthropic API key for LLM judges

## Troubleshooting

### Common Issues

**Permission errors in GitHub Actions:**
```yaml
permissions:
  contents: read
  checks: write
  pull-requests: write
```

**LLM API rate limits:**
```bash
uvx --from evalgate evalgate run --llm-retry-attempts 3 --llm-retry-delay 30
```

**Large output handling:**
```bash
uvx --from evalgate evalgate run --max-output-size 1000
```

**Debug mode:**
```bash
EVALGATE_LOG_LEVEL=DEBUG uvx --from evalgate evalgate run --verbose
```

## Performance Budgets

Set performance constraints:
```yaml
budgets:
  p95_latency_ms: 1200       # 95th percentile latency
  max_cost_usd_per_item: 0.03 # Maximum cost per item
  avg_latency_ms: 800        # Average latency
  max_latency_ms: 5000       # Hard latency limit
```

## Gate Configuration Options

```yaml
gate:
  min_overall_score: 0.90     # Minimum weighted average score
  allow_regression: false     # Allow scores to drop vs baseline
  max_violations: 0           # Maximum violations allowed
  required_evaluators:        # Specific evaluators that must pass
    - json_formatting
    - priority_accuracy
```

## Repository Structure

```
project/
├── .github/
│   └── evalgate.yml          # Configuration
├── eval/
│   ├── fixtures/             # Test data
│   │   └── *.json
│   ├── schemas/              # JSON schemas
│   │   └── *.json
│   └── prompts/              # LLM judge prompts
│       └── *.txt
├── .evalgate/
│   ├── outputs/              # Generated outputs
│   ├── results.json          # Evaluation results
│   └── cache.json           # LLM response cache
└── scripts/
    └── predict.py           # Your model script
```

## Schema Example

```json
{
  "type": "object",
  "properties": {
    "category": {"type": "string"},
    "priority": {"type": "string", "enum": ["low", "medium", "high"]},
    "confidence": {"type": "number", "minimum": 0, "maximum": 1}
  },
  "required": ["category", "priority", "confidence"]
}
```

## License and Repository

- **License:** MIT 
- **Repository:** https://github.com/aotp-ventures/evalgate
- **Issues:** https://github.com/aotp-ventures/evalgate/issues
- **Documentation:** https://evalgate.aotp.ai

This documentation covers EvalGate v0.3.0. For the latest updates, visit the GitHub repository.
