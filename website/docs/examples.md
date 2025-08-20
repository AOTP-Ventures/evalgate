---
sidebar_position: 5
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
