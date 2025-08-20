---
sidebar_position: 2
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
