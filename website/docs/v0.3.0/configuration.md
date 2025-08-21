---
title: "Configuration"
section: "Core Concepts"
slug: "configuration"
order: 4
description: "Config file structure and options"
---

# Configuration Reference

The EvalGate configuration file (`.github/evalgate.yml`) controls all aspects of evaluation behavior. This reference covers every configuration option in v0.3.0.

## Configuration Structure

```yaml
# Performance budgets
budgets: { ... }

# Input/output paths
fixtures: { ... }
outputs: { ... }

# Evaluation strategy
evaluators: [ ... ]

# Quality gates
gate: { ... }

# Reporting
report: { ... }

# Baseline comparison
baseline: { ... }
```

## Complete Configuration Example

```yaml
# Performance monitoring budgets
budgets:
  p95_latency_ms: 1000
  max_cost_usd_per_item: 0.02
  p50_latency_ms: 500          # Optional: median latency
  max_memory_mb: 512           # Optional: memory usage limit

# Test data and output paths
fixtures:
  path: "eval/fixtures/**/*.json"
  encoding: "utf-8"            # Optional: file encoding (default: utf-8)

outputs:
  path: ".evalgate/outputs/**/*.json"
  encoding: "utf-8"            # Optional: file encoding

# Multi-evaluator setup
evaluators:
  # Schema validation
  - name: json_structure
    type: schema
    schema_path: "eval/schemas/output.json"
    weight: 0.15
    enabled: true              # Optional: enable/disable evaluator
    
  # Field requirements
  - name: required_fields
    type: required_fields
    required: ["sentiment", "confidence", "categories"]
    weight: 0.1
    
  # Exact matching
  - name: sentiment_accuracy
    type: category
    expected_field: "sentiment"
    weight: 0.2
    
  # ML metrics
  - name: classification_metrics
    type: classification
    expected_field: "sentiment"
    multi_label: false
    weight: 0.2
    
  # AI quality assessment
  - name: content_quality
    type: llm
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/quality_judge.txt
    api_key_env_var: OPENAI_API_KEY
    temperature: 0.1
    max_tokens: 100
    min_score: 0.75
    weight: 0.2
    
  # Semantic similarity
  - name: embedding_similarity
    type: embedding
    expected_field: "content"
    model: "sentence-transformers/all-MiniLM-L6-v2"
    threshold: 0.8
    weight: 0.1
    
  # Performance budgets
  - name: performance
    type: budgets
    weight: 0.05

# Quality gate configuration
gate:
  min_overall_score: 0.85
  allow_regression: false
  fail_on_evaluator_error: true  # Optional: fail if evaluator crashes

# Reporting configuration  
report:
  pr_comment: true
  artifact_path: ".evalgate/results.json"
  max_failures_shown: 50       # Optional: limit failure details
  include_metrics: true        # Optional: include detailed metrics
  
# Baseline comparison
baseline:
  ref: "origin/main"
  artifact_path: ".evalgate/results.json"  # Optional: override artifact path
```

## Section-by-Section Reference

### Budgets Section

Define performance limits for latency and cost monitoring.

```yaml
budgets:
  # Latency budgets (in milliseconds)
  p95_latency_ms: 1000         # 95th percentile latency limit
  p50_latency_ms: 500          # Optional: median latency limit
  p99_latency_ms: 2000         # Optional: 99th percentile limit
  max_latency_ms: 5000         # Optional: absolute maximum
  
  # Cost budgets (in USD)
  max_cost_usd_per_item: 0.02  # Maximum cost per evaluation item
  total_cost_budget_usd: 10.0  # Optional: total run budget
  
  # Memory budgets (in MB)
  max_memory_mb: 512           # Optional: memory usage limit
  
  # Token budgets (for LLM APIs)
  max_tokens_per_request: 4000 # Optional: token limit per API call
```

**Usage:** Referenced by the `budgets` evaluator type.

### Fixtures Section

Configure test data input paths and options.

```yaml
fixtures:
  path: "eval/fixtures/**/*.json"    # Required: glob pattern for fixture files
  encoding: "utf-8"                  # Optional: file encoding (default: utf-8)
  validation: true                   # Optional: validate fixture format (default: true)
```

**Supported Path Patterns:**
- `eval/fixtures/*.json` - All JSON files in fixtures directory
- `eval/fixtures/**/*.json` - Recursive search for JSON files
- `eval/{test1,test2}/*.json` - Multiple specific directories
- `eval/fixtures/critical_*.json` - Pattern matching

### Outputs Section

Configure generated output paths and options.

```yaml
outputs:
  path: ".evalgate/outputs/**/*.json"  # Required: glob pattern for output files
  encoding: "utf-8"                    # Optional: file encoding
  validation: true                     # Optional: validate output format
```

**File Matching:** Output files must match fixture files by name (e.g., `test_001.json` fixture → `test_001.json` output).

### Evaluators Section

Define your evaluation strategy with multiple evaluators.

#### Common Evaluator Fields

Every evaluator supports these fields:

```yaml
- name: evaluator_name        # Required: unique identifier
  type: evaluator_type        # Required: evaluator type
  weight: 0.3                # Required: relative importance (0.0-1.0)
  enabled: true              # Optional: enable/disable (default: true)
  min_score: 0.8             # Optional: minimum score threshold
```

#### Schema Evaluator

```yaml
- name: json_validation
  type: schema
  schema_path: "eval/schemas/output.json"  # Required: path to JSON schema
  weight: 0.2
  strict_mode: true                        # Optional: strict validation
```

#### Category Evaluator

```yaml
- name: label_matching
  type: category
  expected_field: "sentiment"             # Required: field to compare
  weight: 0.3
  case_sensitive: false                   # Optional: case sensitivity
```

#### Classification Evaluator

```yaml
- name: ml_metrics
  type: classification
  expected_field: "category"              # Required: field to evaluate
  multi_label: false                      # Optional: multi-label mode
  weight: 0.4
  average: "weighted"                     # Optional: averaging method
```

#### LLM Evaluator

```yaml
- name: ai_judge
  type: llm
  provider: openai                        # Required: openai, anthropic, azure, local
  model: gpt-4                           # Required: model name
  prompt_path: eval/prompts/judge.txt     # Required: prompt template path
  api_key_env_var: OPENAI_API_KEY        # Required: env var with API key
  temperature: 0.1                       # Optional: sampling temperature
  max_tokens: 200                        # Optional: response length limit
  timeout_seconds: 30                    # Optional: request timeout
  weight: 0.5
  min_score: 0.75
```

**Supported Providers:**
- `openai` - OpenAI models (GPT-3.5, GPT-4)
- `anthropic` - Anthropic models (Claude)
- `azure` - Azure OpenAI Service
- `local` - Local/self-hosted models

#### Embedding Evaluator

```yaml
- name: semantic_similarity
  type: embedding
  expected_field: "response"              # Required: field to compare
  model: "sentence-transformers/all-MiniLM-L6-v2"  # Optional: model name
  threshold: 0.8                          # Optional: similarity threshold
  weight: 0.3
  normalize: true                         # Optional: normalize embeddings
```

#### ROUGE/BLEU Evaluator

```yaml
- name: text_quality
  type: rouge_bleu
  expected_field: "generated_text"        # Required: field to evaluate
  metric: "bleu"                         # Required: bleu, rouge1, rouge2, rougeL
  weight: 0.3
  use_stemmer: true                      # Optional: for ROUGE metrics
```

#### Conversation Evaluator

```yaml
- name: dialogue_flow
  type: conversation
  expected_final_field: "content"         # Required: field in final message
  max_turns: 10                          # Optional: maximum conversation length
  weight: 0.3
  validate_roles: true                   # Optional: validate message roles
```

#### Tool Usage Evaluator

```yaml
- name: agent_tools
  type: tool_usage
  expected_tool_calls: true               # Optional: expect tool calls
  validate_args: true                    # Optional: validate call arguments
  weight: 0.4
  strict_order: false                    # Optional: require exact call order
```

#### Workflow Evaluator

```yaml
- name: process_validation
  type: workflow
  workflow_path: "eval/workflows/flow.yaml"  # Required: workflow definition
  weight: 0.3
  allow_extra_steps: false               # Optional: allow additional steps
```

#### Regex Evaluator

```yaml
- name: format_check
  type: regex
  expected_field: "phone_number"          # Required: field to validate
  pattern: "^\\+?1?-?\\(?\\d{3}\\)?[\\s-]?\\d{3}[\\s-]?\\d{4}$"  # Required: regex
  weight: 0.2
  flags: ["IGNORECASE"]                  # Optional: regex flags
```

#### Required Fields Evaluator

```yaml
- name: field_presence
  type: required_fields
  required: ["id", "timestamp", "result"] # Required: list of required fields
  weight: 0.1
  allow_null: false                      # Optional: allow null values
```

#### Budgets Evaluator

```yaml
- name: performance_check
  type: budgets
  weight: 0.1
  fail_on_budget_exceeded: true          # Optional: fail gate on budget violation
```

### Gate Section

Configure quality gate behavior and thresholds.

```yaml
gate:
  min_overall_score: 0.85                # Required: minimum weighted average score
  allow_regression: false                # Required: allow score decreases vs baseline
  fail_on_evaluator_error: true         # Optional: fail if evaluator crashes (default: true)
  require_all_evaluators: true          # Optional: require all enabled evaluators to run
  min_evaluator_count: 3                # Optional: minimum number of evaluators
```

**Gate Behavior:**
- **Pass:** Overall score ≥ `min_overall_score` AND no regression (if disabled) AND all evaluators pass their `min_score` thresholds
- **Fail:** Any condition above is not met OR evaluator errors occur (if enabled)

### Report Section

Configure output reporting and artifact generation.

```yaml
report:
  pr_comment: true                       # Optional: post GitHub PR comment (default: false)
  artifact_path: ".evalgate/results.json"  # Optional: results JSON location
  max_failures_shown: 50                # Optional: limit failure details in reports
  include_metrics: true                 # Optional: include detailed metrics (default: true)
  include_confusion_matrix: true        # Optional: include classification matrices
  summary_format: "markdown"            # Optional: markdown, json, text (default: markdown)
```

### Baseline Section  

Configure baseline comparison for regression detection.

```yaml
baseline:
  ref: "origin/main"                     # Required: git reference for baseline
  artifact_path: ".evalgate/results.json"  # Optional: baseline artifact path
  compare_method: "score"               # Optional: score, detailed (default: score)
  tolerance: 0.001                      # Optional: regression tolerance (default: 1e-6)
```

## Environment Variables

EvalGate supports environment variable substitution in configuration:

```yaml
evaluators:
  - name: ai_judge
    type: llm
    model: ${LLM_MODEL:-gpt-4}           # Default to gpt-4 if not set
    api_key_env_var: ${API_KEY_VAR:-OPENAI_API_KEY}
    temperature: ${LLM_TEMPERATURE:-0.1}
```

## Configuration Validation

EvalGate validates configuration at startup. Common validation errors:

### Required Fields Missing
```
Error: evaluator 'my_evaluator' missing required field 'expected_field'
```

### Invalid Weights
```
Error: evaluator weights should be between 0.0 and 1.0, got 1.5
```

### File Not Found
```
Error: schema file 'eval/schemas/missing.json' not found
```

### Invalid Evaluator Type
```
Error: unknown evaluator type 'invalid_type'
```

## Configuration Tips

### 🎯 **Performance Optimization**

```yaml
# Fast feedback loop
evaluators:
  - name: quick_checks
    type: required_fields
    required: ["result"]
    weight: 0.1
    
  - name: format_check  
    type: schema
    schema_path: eval/schemas/simple.json
    weight: 0.2
    
  # Expensive evaluators with lower weights
  - name: detailed_quality
    type: llm
    provider: openai
    model: gpt-4
    weight: 0.3
    min_score: 0.8
```

### 📊 **Balanced Evaluation Strategy**

```yaml
evaluators:
  # Deterministic validation (40% total weight)
  - { name: structure, type: schema, weight: 0.2 }
  - { name: fields, type: required_fields, weight: 0.1 }
  - { name: categories, type: category, weight: 0.1 }
  
  # AI-powered evaluation (50% total weight)  
  - { name: quality, type: llm, weight: 0.3, min_score: 0.8 }
  - { name: similarity, type: embedding, weight: 0.2 }
  
  # Performance monitoring (10% total weight)
  - { name: performance, type: budgets, weight: 0.1 }
```

### 🔧 **Development vs Production**

**Development config:**
```yaml
gate:
  min_overall_score: 0.7      # Lower threshold for development
  allow_regression: true      # Allow temporary regressions
  
report:
  max_failures_shown: 100     # More detailed debugging
```

**Production config:**
```yaml
gate:
  min_overall_score: 0.9      # High quality bar
  allow_regression: false     # Strict regression prevention
  
report:
  max_failures_shown: 10      # Concise reports
```

## Next Steps

- **[Fixtures & Data](05-fixtures.md)** - Test data creation and management
- **[Evaluators Reference](09-evaluators-reference.md)** - Detailed evaluator specifications  
- **[Examples](10-examples.md)** - Real-world configuration examples
- **[Troubleshooting](13-troubleshooting.md)** - Debug configuration issues

---

*The configuration file is the heart of EvalGate - master these options to build evaluation strategies that scale with your AI systems.*
