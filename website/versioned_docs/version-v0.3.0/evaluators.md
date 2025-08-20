---
sidebar_position: 3
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
