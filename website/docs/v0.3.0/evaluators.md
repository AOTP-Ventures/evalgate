---
title: "Evaluators"
section: "Core Concepts"
slug: "evaluators"
order: 3
description: "Understanding evaluation types"
---

# Evaluators

EvalGate v0.3.0 provides 10+ specialized evaluator types to comprehensively validate your AI systems. Each evaluator focuses on specific aspects of AI behavior, from basic format validation to advanced semantic quality assessment.

## Evaluator Categories

### 🔧 **Deterministic Evaluators**
Fast, reliable validation with consistent results:
- **JSON Schema** - Structure and format validation
- **Category Match** - Exact label/classification matching  
- **Required Fields** - Field presence validation
- **Regex Match** - Pattern-based text validation
- **Latency/Cost** - Performance budget enforcement

### 🧠 **AI-Powered Evaluators**
Intelligent evaluation using machine learning:
- **LLM as Judge** - Quality assessment via GPT-4, Claude, etc.
- **Embedding Similarity** - Semantic similarity scoring
- **Classification Metrics** - ML metrics with confusion matrices

### 📝 **Text Quality Evaluators**  
Specialized for natural language generation:
- **ROUGE/BLEU** - Standard text generation metrics
- **Conversation Flow** - Multi-turn dialogue validation

### 🤖 **Specialized Evaluators**
For advanced AI systems and workflows:
- **Tool Usage** - Agent function call validation
- **Workflow DAG** - State machine and process validation

## Choosing the Right Evaluators

### For Classification Tasks
```yaml
evaluators:
  # Exact matching for critical labels
  - name: label_accuracy
    type: category
    expected_field: "sentiment"
    weight: 0.3
    
  # Comprehensive ML metrics
  - name: classification_metrics
    type: classification
    expected_field: "sentiment"
    multi_label: false
    weight: 0.4
    
  # Semantic understanding
  - name: embedding_similarity
    type: embedding
    expected_field: "content"
    threshold: 0.8
    weight: 0.3
```

### For Content Generation
```yaml
evaluators:
  # Structure validation
  - name: json_format
    type: schema
    schema_path: "eval/schemas/content.json"
    weight: 0.2
    
  # Text quality metrics
  - name: text_quality
    type: rouge_bleu
    expected_field: "generated_text"
    metric: "bleu"
    weight: 0.3
    
  # AI-powered quality assessment
  - name: content_quality
    type: llm
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/quality_judge.txt
    min_score: 0.75
    weight: 0.5
```

### For AI Agents
```yaml
evaluators:
  # Function call validation
  - name: tool_usage
    type: tool_usage
    expected_tool_calls:
      booking_example:
        - name: search_flights
          args: {from: "NYC", to: "LAX"}
        - name: book_flight
          args: {flight_id: "AA123"}
    weight: 0.4
    
  # Workflow validation
  - name: workflow_steps
    type: workflow
    workflow_path: "eval/workflows/agent_flow.yaml"
    weight: 0.3
    
  # Final output quality
  - name: response_quality
    type: llm
    provider: anthropic
    model: claude-3-sonnet-20240229
    prompt_path: eval/prompts/agent_judge.txt
    weight: 0.3
```

### For Conversational AI
```yaml
evaluators:
  # Conversation flow validation
  - name: dialogue_flow
    type: conversation
    expected_final_field: "content"
    max_turns: 8
    weight: 0.3
    
  # Response appropriateness
  - name: response_quality
    type: llm
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/conversation_judge.txt
    weight: 0.4
    
  # Required conversation elements (specified in each fixture's expected block)
  - name: conversation_fields
    type: required_fields
    weight: 0.3
```

## Evaluator Configuration Patterns

### Basic Configuration
Every evaluator requires these fields:
```yaml
- name: my_evaluator      # Unique identifier
  type: schema            # Evaluator type
  weight: 0.3            # Relative importance (0.0-1.0)
  enabled: true          # Optional: enable/disable
```

### Advanced Configuration
Many evaluators support additional options:
```yaml
- name: advanced_evaluator
  type: classification
  expected_field: "category"
  multi_label: true
  weight: 0.4
  min_score: 0.8         # Fail if score < threshold
  enabled: true
```

### Performance Tuning
Control evaluation behavior:
```yaml
- name: performance_sensitive
  type: embedding
  model: "sentence-transformers/all-MiniLM-L6-v2"  # Faster model
  threshold: 0.75        # Lower threshold for speed
  weight: 0.2
  
- name: high_quality
  type: llm
  provider: openai
  model: gpt-4           # Higher quality, slower
  temperature: 0.1       # More deterministic
  weight: 0.5
  min_score: 0.9         # Strict quality gate
```

## Evaluator Types Deep Dive

### JSON Schema Evaluator
Validates output structure and data types.

**Configuration:**
```yaml
- name: json_structure
  type: schema
  schema_path: "eval/schemas/output.json"
  weight: 0.2
```

**Schema Example:**
```json
{
  "type": "object",
  "required": ["sentiment", "confidence"],
  "properties": {
    "sentiment": {
      "type": "string", 
      "enum": ["positive", "negative", "neutral"]
    },
    "confidence": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0
    }
  }
}
```

**Use Cases:** Format validation, data type checking, required field enforcement

### Category Match Evaluator
Exact matching for categorical outputs.

**Configuration:**
```yaml
- name: label_match
  type: category
  expected_field: "sentiment"
  weight: 0.3
```

**Use Cases:** Classification accuracy, exact label matching, binary decisions

### Classification Metrics Evaluator
Comprehensive ML evaluation metrics.

**Configuration:**
```yaml
- name: ml_metrics
  type: classification
  expected_field: "category"
  multi_label: true      # For multi-label classification
  weight: 0.4
```

**Output:** Precision, recall, F1-score, confusion matrix

**Use Cases:** ML model evaluation, performance analysis, multi-class problems

### LLM as Judge Evaluator
AI-powered quality assessment using language models.

**Configuration:**
```yaml
- name: quality_judge
  type: llm
  provider: openai
  model: gpt-4
  prompt_path: eval/prompts/quality.txt
  api_key_env_var: OPENAI_API_KEY
  base_url: https://custom-endpoint.example.com/v1  # Optional: custom endpoint
  max_tokens: 200                                   # Optional: limit response length
  transcript_field: messages                        # Optional: evaluate streamed transcripts
  per_turn_scoring: true                            # Optional: score each turn separately
  temperature: 0.1
  min_score: 0.75
  weight: 0.5
```

**Use Cases:** Content quality, appropriateness, complex criteria, subjective evaluation

Optional fields help adapt the evaluator to specific scenarios:
- `base_url` points to a custom endpoint such as Azure or a local model.
- `max_tokens` caps the judge's response length.
- `transcript_field` references a field containing streamed transcripts.
- `per_turn_scoring` enables scoring each conversation turn individually.
Use them when working with non-default endpoints, streaming transcripts, or multi-turn evaluations.

### Embedding Similarity Evaluator
Semantic similarity using sentence transformers.

**Configuration:**
```yaml
- name: semantic_similarity
  type: embedding
  expected_field: "response"
  model: "sentence-transformers/all-MiniLM-L6-v2"
  threshold: 0.8
  weight: 0.3
```

**Use Cases:** Semantic correctness, paraphrasing evaluation, content similarity

### ROUGE/BLEU Evaluator
Standard text generation quality metrics.

**Configuration:**
```yaml
- name: text_quality
  type: rouge_bleu
  expected_field: "generated_text"
  metric: "bleu"         # or "rouge1", "rouge2", "rougeL"
  weight: 0.3
```

**Use Cases:** Text generation, summarization, translation quality

### Conversation Flow Evaluator
Multi-turn dialogue validation.

**Configuration:**
```yaml
- name: conversation_flow
  type: conversation
  expected_final_field: "content"
  max_turns: 10
  weight: 0.3
```

**Use Cases:** Chatbots, dialogue systems, conversational AI

### Tool Usage Evaluator
Agent function call and tool validation.

Model outputs should include a `tool_calls` list that logs each tool invocation in order. Each entry records the tool `name` and its input `args`.

```json
{
  "output": "...",
  "tool_calls": [
    {"name": "search_flights", "args": {"from": "NYC", "to": "LAX"}},
    {"name": "book_flight", "args": {"flight_id": "AA123"}}
  ]
}
```

**Configuration:**
```yaml
- name: agent_tools
  type: tool_usage
  expected_tool_calls:
    booking_example:
      - name: search_flights
        args: {from: "NYC", to: "LAX"}
      - name: book_flight
        args: {flight_id: "AA123"}
  weight: 0.4
```

**Use Cases:** AI agents, function calling, tool-using systems

### Workflow DAG Evaluator
State machine and workflow process validation.

**Configuration:**
```yaml
- name: process_flow
  type: workflow
  workflow_path: "eval/workflows/process.yaml"
  weight: 0.3
```

**Edges Definition Example:**
Edges define valid transitions between workflow states.

```yaml
edges:
  - from: start
    to: gather_info
  - from: gather_info
    to: review
  - from: review
    to: end
```

```json
{
  "edges": [
    {"from": "start", "to": "gather_info"},
    {"from": "gather_info", "to": "review"},
    {"from": "review", "to": "end"}
  ]
}
```

**Use Cases:** Complex workflows, state machines, process validation

### Regex Match Evaluator
Pattern-based text validation. Patterns can be provided either via:

1. `pattern_path` – a JSON file mapping fixture names to regex patterns
2. `pattern_field` – a field inside each fixture's `expected` block

If both are supplied, patterns from the JSON file are loaded first and then
overridden by per-fixture patterns.

**Configuration:**
```yaml
- name: format_validation
  type: regex
  pattern_field: "phone_regex"
  pattern_path: eval/patterns.json
  weight: 0.2
```

**Fixture Example:**
```yaml
fixtures:
  phone_case:
    inputs:
      phone_number: "555-123-4567"
    expected:
      phone_regex: "^\\+?1?-?\\(?\\d{3}\\)?[\\s-]?\\d{3}[\\s-]?\\d{4}$"
```

**Patterns JSON Example (`eval/patterns.json`):**
```json
{
  "phone_case": "^\\+?1?-?\\(?\\d{3}\\)?[\\s-]?\\d{3}[\\s-]?\\d{4}$"
}
```

**Use Cases:** Format validation, structured text, data extraction

### Required Fields Evaluator
Field presence validation. This evaluator checks that any keys listed under each
fixture's `expected` object appear in the model output.

**Configuration:**
```yaml
- name: field_check
  type: required_fields
  weight: 0.1
```

**Use Cases:** Data completeness, API response validation, field requirements

### Latency/Cost Evaluator
Performance budget enforcement.

**Configuration:**
```yaml
- name: performance
  type: budgets
  weight: 0.1
```

**Budget Configuration:**
```yaml
budgets:
  p95_latency_ms: 500
  max_cost_usd_per_item: 0.01
```

**Use Cases:** Performance monitoring, cost control, SLA enforcement

## Multi-Evaluator Strategies

### Layered Validation
Combine multiple evaluator types for comprehensive validation:

```yaml
evaluators:
  # Layer 1: Basic validation (fast, fails early)
  - { name: structure, type: schema, schema_path: "eval/schemas/output.json", weight: 0.1 }
  - { name: required, type: required_fields, weight: 0.1 }
  
  # Layer 2: Functional validation 
  - { name: accuracy, type: category, expected_field: "sentiment", weight: 0.3 }
  - { name: metrics, type: classification, expected_field: "sentiment", weight: 0.2 }
  
  # Layer 3: Quality validation (slower, comprehensive)
  - { name: quality, type: llm, provider: openai, model: gpt-4, 
      prompt_path: eval/prompts/quality.txt, weight: 0.2, min_score: 0.8 }
  
  # Layer 4: Performance validation
  - { name: performance, type: budgets, weight: 0.1 }
```

### Domain-Specific Combinations
Tailor evaluator combinations to your specific use case:

**Customer Service Bot:**
- Conversation flow validation
- Sentiment appropriateness  
- Response helpfulness (LLM judge)
- Required fields (ticket ID, status)

**Content Generation:**
- Schema validation
- ROUGE/BLEU scores
- Embedding similarity
- Content quality (LLM judge)

**AI Agent:**
- Tool usage validation
- Workflow DAG compliance
- Final result accuracy
- Performance budgets

## Best Practices

### 🎯 **Start Simple, Add Complexity**
1. Begin with deterministic evaluators (schema, category)
2. Add AI-powered evaluators for quality assessment
3. Include specialized evaluators for your domain
4. Monitor performance and adjust weights

### ⚖️ **Balance Speed vs. Quality**
- Use lightweight evaluators (schema, category) for fast feedback
- Reserve expensive evaluators (LLM, embedding) for critical validation
- Cache LLM responses to avoid repeat API calls
- Consider model size vs. quality tradeoffs

### 📊 **Weight Configuration**
- Assign higher weights to business-critical evaluators
- Use lower weights for nice-to-have validation
- Ensure weights sum to approximately 1.0 per category
- Test different weight combinations to find optimal balance

### 🔧 **Debugging and Monitoring**
- Start with `min_score` thresholds slightly below current performance
- Monitor evaluator failure patterns over time
- Use detailed error messages to identify improvement areas
- Regularly review and update evaluation criteria

## Next Steps

- **[Configuration Reference](configuration.md)** - Complete configuration options
- **[Evaluators Reference](evaluators-reference.md)** - Detailed specifications for each type
- **[Examples](examples.md)** - Real-world evaluator combinations
- **[Best Practices](best-practices.md)** - Production deployment patterns

---

*EvalGate's evaluator system provides the flexibility to validate any aspect of AI behavior while maintaining the simplicity needed for practical adoption.*
