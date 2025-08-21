---
title: "Evaluators Reference"
section: "Reference"
slug: "evaluators-reference"
order: 9
description: "Complete reference guide for all evaluator types in EvalGate v0.3.0 with configuration options and examples."
---

# Evaluators Reference

Complete reference for all evaluator types available in EvalGate v0.3.0. Each evaluator includes configuration options, examples, use cases, and troubleshooting guidance.

## Quick Reference

| Evaluator | Type | Purpose | Speed | Complexity |
|-----------|------|---------|--------|------------|
| [JSON Schema](#json-schema-evaluator) | `schema` | Structure validation | ⚡ Fast | 🟢 Simple |
| [Category Match](#category-match-evaluator) | `category` | Exact label matching | ⚡ Fast | 🟢 Simple |
| [Required Fields](#required-fields-evaluator) | `required_fields` | Field presence | ⚡ Fast | 🟢 Simple |
| [Regex Match](#regex-match-evaluator) | `regex` | Pattern validation | ⚡ Fast | 🟡 Medium |
| [Latency/Cost](#latencycost-evaluator) | `budgets` | Performance limits | ⚡ Fast | 🟢 Simple |
| [Classification](#classification-evaluator) | `classification` | ML metrics | ⚡ Fast | 🟡 Medium |
| [LLM as Judge](#llm-as-judge-evaluator) | `llm` | AI quality assessment | 🐌 Slow | 🔴 Complex |
| [Embedding](#embedding-similarity-evaluator) | `embedding` | Semantic similarity | 🐌 Slow | 🟡 Medium |
| [ROUGE/BLEU](#rougebleu-evaluator) | `rouge_bleu` | Text quality | 🟡 Medium | 🟡 Medium |
| [Conversation](#conversation-flow-evaluator) | `conversation` | Dialogue validation | ⚡ Fast | 🟡 Medium |
| [Tool Usage](#tool-usage-evaluator) | `tool_usage` | Agent function calls | ⚡ Fast | 🟡 Medium |
| [Workflow DAG](#workflow-dag-evaluator) | `workflow` | State machine validation | ⚡ Fast | 🟡 Medium |

---

## JSON Schema Evaluator

**Type:** `schema`  
**Purpose:** Validate output structure and data types against JSON Schema  
**Speed:** ⚡ Very Fast  
**Dependencies:** None

### Configuration

```yaml
- name: json_validation
  type: schema
  schema_path: "eval/schemas/output.json"
  weight: 0.2
```

### Schema Example

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
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
    },
    "categories": {
      "type": "array",
      "items": {"type": "string"},
      "minItems": 1,
      "maxItems": 5
    }
  },
  "additionalProperties": false
}
```

### Use Cases
- ✅ API response validation
- ✅ Data format enforcement
- ✅ Type safety verification
- ✅ Required field validation

### Common Errors
```
Schema validation failed: 'sentiment' is a required property
Schema validation failed: 0.95 is not of type 'string'
```

---

## Category Match Evaluator

**Type:** `category`  
**Purpose:** Exact matching for categorical/classification outputs  
**Speed:** ⚡ Very Fast  
**Dependencies:** None

### Configuration

```yaml
- name: sentiment_accuracy
  type: category
  expected_field: "sentiment"
  weight: 0.3
```

### Example Data

**Fixture:**
```json
{
  "input": {"text": "I love this product!"},
  "expected": {"sentiment": "positive"}
}
```

**Output:**
```json
{"sentiment": "positive", "confidence": 0.95}
```

**Result:** ✅ Pass (exact match)

### Use Cases
- ✅ Classification accuracy
- ✅ Label validation
- ✅ Binary decisions (yes/no, true/false)
- ✅ Status validation

### Scoring
- **1.0:** Exact match
- **0.0:** No match

---

## Required Fields Evaluator

**Type:** `required_fields`  
**Purpose:** Verify presence of required output fields  
**Speed:** ⚡ Very Fast  
**Dependencies:** None

### Configuration

```yaml
- name: field_completeness
  type: required_fields
  weight: 0.1
```

Required keys come from each fixture's `expected` block.

### Example

**Output with all required fields:**
```json
{
  "id": "req_123",
  "timestamp": "2024-01-15T10:30:00Z",
  "result": "processed",
  "confidence": 0.87,
  "metadata": {"optional": "field"}
}
```

**Result:** ✅ Pass (all required fields present)

### Use Cases
- ✅ Data completeness validation
- ✅ API contract enforcement  
- ✅ Critical field verification
- ✅ Output format validation

### Scoring
- **Score = (present_fields / required_fields)**
- Example: 3/4 required fields present = 0.75

---

## Regex Match Evaluator

**Type:** `regex`  
**Purpose:** Pattern-based validation using regular expressions  
**Speed:** ⚡ Fast  
**Dependencies:** None

### Configuration

```yaml
- name: phone_validation
  type: regex
  pattern_field: "phone_pattern"   # Read pattern from each fixture's expected block
  pattern_path: "eval/patterns.json"  # Or load patterns from file
  weight: 0.2
```

`pattern_field` looks for a pattern in each fixture's `expected` block. `pattern_path`
should point to a JSON file mapping fixture names to regex strings.

### Pattern Examples

**Phone Numbers:**
```regex
^\\+?1?-?\\(?\\d{3}\\)?[\\s-]?\\d{3}[\\s-]?\\d{4}$
```

**Email Addresses:**
```regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$
```

**URLs:**
```regex
^https?://[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-.,@?^=%&:/~+#]*[\\w\\-@?^=%&/~+#])?$
```

**Credit Card Numbers:**
```regex
^\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}$
```

### Use Cases
- ✅ Format validation
- ✅ Data extraction verification  
- ✅ Structured text validation
- ✅ Compliance checking

### Scoring
- **1.0:** Pattern matches
- **0.0:** Pattern doesn't match

---

## Latency/Cost Evaluator

**Type:** `budgets`  
**Purpose:** Enforce performance and cost budgets  
**Speed:** ⚡ Very Fast  
**Dependencies:** None

### Configuration

```yaml
- name: performance_budgets
  type: budgets
  weight: 0.1
```

### Budget Configuration

```yaml
budgets:
  p95_latency_ms: 1000        # Max 95th percentile latency
  max_cost_usd_per_item: 0.02 # Max average cost per item
```

### Example Output

**Output with performance metadata:**
```json
{
  "result": "processed",
  "meta": {
    "latency_ms": 850,
    "cost_usd": 0.015
  }
}
```

### Use Cases
- ✅ SLA enforcement
- ✅ Cost control
- ✅ Performance monitoring
- ✅ Resource optimization

### Scoring
- **Budget met:** 1.0
- **Budget exceeded:** 0.0 (with failure details)

---

## Classification Evaluator

**Type:** `classification`  
**Purpose:** Comprehensive ML metrics for classification tasks  
**Speed:** ⚡ Fast  
**Dependencies:** None

### Configuration

```yaml
- name: ml_metrics
  type: classification
  expected_field: "category"
  multi_label: false         # Set true for multi-label classification
  weight: 0.4
```

### Single-Label Example

**Fixtures and Outputs:**
```json
// Fixture 1
{"expected": {"category": "spam"}}
{"category": "spam"}     // Correct

// Fixture 2  
{"expected": {"category": "ham"}}
{"category": "spam"}     // Incorrect

// Fixture 3
{"expected": {"category": "ham"}}
{"category": "ham"}      // Correct
```

**Results:**
```json
{
  "precision": 0.67,
  "recall": 0.67,
  "f1": 0.67,
  "confusion_matrix": {
    "spam": {"spam": 1, "ham": 0},
    "ham": {"spam": 1, "ham": 1}
  }
}
```

### Multi-Label Example

```yaml
multi_label: true
```

**Fixtures and Outputs:**
```json
// Fixture
{"expected": {"categories": ["tech", "news"]}}
{"categories": ["tech", "business"]}  // Partial match
```

### Use Cases
- ✅ ML model evaluation
- ✅ Classification accuracy
- ✅ Multi-class problems
- ✅ Performance analysis

### Scoring
- **Score:** F1-score (0.0 to 1.0)
- **Metrics:** Precision, recall, F1, confusion matrix

---

## LLM as Judge Evaluator

**Type:** `llm`  
**Purpose:** AI-powered quality assessment using language models  
**Speed:** 🐌 Slow (API calls)  
**Dependencies:** OpenAI/Anthropic API keys

### Configuration

```yaml
- name: content_quality
  type: llm
  provider: openai           # openai, anthropic, azure, local
  model: gpt-4
  prompt_path: eval/prompts/quality_judge.txt
  api_key_env_var: OPENAI_API_KEY
  base_url: null             # Optional: custom API base URL
  temperature: 0.1           # Optional: control randomness
  max_tokens: 200            # Optional: response length
  min_score: 0.75           # Optional: minimum passing score
  transcript_field: null     # Optional: field containing conversation transcript
  per_turn_scoring: false    # Optional: score each turn
  weight: 0.4
```

### Prompt Template

```
You are evaluating customer service responses for quality.

INPUT: {input}
EXPECTED: {expected}
OUTPUT: {output}

Rate the OUTPUT from 0.0 to 1.0 on:
- Accuracy: Addresses the customer's need
- Helpfulness: Provides useful information
- Professionalism: Appropriate tone

Score: [your score]
```

### Use Cases
- ✅ Content quality assessment
- ✅ Tone and appropriateness
- ✅ Complex subjective criteria
- ✅ Domain expertise validation

### Scoring
- **Score:** Parsed from LLM response (0.0 to 1.0)
- **Caching:** Automatic response caching
- **Retries:** Configurable retry logic

**See [LLM as Judge Guide](llm-as-judge.md) for detailed documentation.**

---

## Embedding Similarity Evaluator

**Type:** `embedding`  
**Purpose:** Semantic similarity using sentence transformers  
**Speed:** 🐌 Slow (model inference)  
**Dependencies:** `sentence-transformers`, `numpy`

### Installation

```bash
pip install sentence-transformers numpy
# or
uvx --from evalgate[embedding] evalgate
```

### Configuration

```yaml
- name: semantic_similarity
  type: embedding
  expected_field: "response"
  model: "sentence-transformers/all-MiniLM-L6-v2"
  threshold: 0.8             # Optional: similarity threshold
  weight: 0.3
```

### Model Options

**Fast Models:**
- `all-MiniLM-L6-v2` - Good balance of speed/quality
- `all-MiniLM-L12-v2` - Slightly better quality

**High-Quality Models:**
- `all-mpnet-base-v2` - Best overall quality
- `all-roberta-large-v1` - High-quality, larger

### Example

**Fixture:**
```json
{
  "expected": {
    "response": "I can help you with your order status."
  }
}
```

**Output:**
```json
{
  "response": "I'd be happy to check your order for you."
}
```

**Similarity Score:** 0.87 (high semantic similarity)

### Use Cases
- ✅ Semantic correctness
- ✅ Paraphrasing validation
- ✅ Content similarity
- ✅ Translation quality

### Scoring
- **Score:** Cosine similarity (0.0 to 1.0)
- **Threshold:** Optional minimum similarity

---

## ROUGE/BLEU Evaluator

**Type:** `rouge_bleu`  
**Purpose:** Standard text generation quality metrics  
**Speed:** 🟡 Medium  
**Dependencies:** `sacrebleu`, `rouge-score`

### Installation

```bash
pip install sacrebleu rouge-score
# or
uvx --from evalgate[nlp] evalgate
```

### Configuration

```yaml
- name: text_quality
  type: rouge_bleu
  expected_field: "generated_text"
  metric: "bleu"             # bleu, rouge1, rouge2, rougeL
  weight: 0.3
```

### Metric Options

**BLEU (Bilingual Evaluation Understudy):**
- Good for translation and generation
- Measures n-gram overlap
- Range: 0.0 to 1.0

**ROUGE-1:**
- Unigram overlap
- Good for content coverage

**ROUGE-2:**
- Bigram overlap  
- Better for fluency

**ROUGE-L:**
- Longest common subsequence
- Good for order preservation

### Example

**Fixture:**
```json
{
  "expected": {
    "generated_text": "The weather today is sunny and warm with temperatures reaching 75 degrees."
  }
}
```

**Output:**
```json
{
  "generated_text": "Today's weather is warm and sunny, with temps around 75°F."
}
```

**BLEU Score:** 0.45 (moderate overlap)

### Use Cases
- ✅ Text generation quality
- ✅ Summarization evaluation
- ✅ Translation quality
- ✅ Content generation

---

## Conversation Flow Evaluator

**Type:** `conversation`  
**Purpose:** Multi-turn dialogue validation  
**Speed:** ⚡ Fast  
**Dependencies:** None

### Configuration

```yaml
- name: dialogue_validation
  type: conversation
  expected_final_field: "content"
  max_turns: 10              # Optional: maximum conversation length
  weight: 0.3
```

### Conversation Format

**Fixture:**
```json
{
  "messages": [
    {"role": "user", "content": "I need help with my order"},
    {"role": "assistant", "content": "I'd be happy to help. What's your order number?"}
  ],
  "expected": {
    "content": "I'd be happy to help. What's your order number?",
    "helpful": true
  }
}
```

**Output:**
```json
{
  "messages": [
    {"role": "user", "content": "I need help with my order"},
    {"role": "assistant", "content": "Sure, I can help with that. What's your order number?"}
  ]
}
```

### Use Cases
- ✅ Chatbot validation
- ✅ Dialogue systems
- ✅ Conversation AI
- ✅ Multi-turn interactions

### Scoring
- **Final message match:** Compares last message content
- **Turn limit:** Penalizes excessive turns

---

## Tool Usage Evaluator

**Type:** `tool_usage`  
**Purpose:** Validate AI agent function calls and tool usage  
**Speed:** ⚡ Fast  
**Dependencies:** None

### Configuration

```yaml
- name: agent_tool_validation
  type: tool_usage
  expected_tool_calls:
    flight_booking:
      - name: search_flights
        args: {from: "NYC", to: "LAX", date: "2024-01-26"}
      - name: book_flight
        args: {flight_id: "AA123"}
  weight: 0.4
```

`expected_tool_calls` maps fixture names to their expected tool call sequences.

### Example

**Fixture `flight_booking.json`:**
```json
{
  "input": {"user_request": "Book a flight from NYC to LAX"}
}
```

**Output:**
```json
{
  "tool_calls": [
    {"name": "search_flights", "args": {"from": "NYC", "to": "LAX", "date": "2024-01-26"}},
    {"name": "book_flight", "args": {"flight_id": "AA123"}}
  ]
}
```

### Use Cases
- ✅ AI agent validation
- ✅ Function calling systems
- ✅ Tool-using AI
- ✅ Workflow automation

### Scoring
- **Tool call accuracy:** Correct function names and arguments in order

---

## Workflow DAG Evaluator

**Type:** `workflow`  
**Purpose:** Validate state machine and workflow execution  
**Speed:** ⚡ Fast  
**Dependencies:** None

### Configuration

```yaml
- name: workflow_validation
  type: workflow
  workflow_path: "eval/workflows/process.yaml"
  weight: 0.3
```

### Workflow Definition

**File: `eval/workflows/process.yaml`**
```yaml
edges:
  start: [validate_input, reject_input]
  validate_input: [process_data]
  process_data: [generate_response, handle_error]
  generate_response: [end]
  handle_error: [retry_process, end]
  retry_process: [process_data]
  reject_input: [end]
```

### Example Usage

**Output:**
```json
{
  "calls": ["start", "validate_input", "process_data", "generate_response", "end"]
}
```

**Validation:**
- ✅ Each transition is valid according to the DAG
- ✅ No invalid state transitions
- ✅ Workflow follows defined paths

### Use Cases
- ✅ State machine validation
- ✅ Process flow verification
- ✅ Workflow compliance
- ✅ Business logic validation

### Scoring
- **Valid workflow:** 1.0
- **Invalid transitions:** 0.0 (with detailed errors)

---

## Evaluator Selection Guide

### By Use Case

**Classification Tasks:**
- Primary: `classification` (ML metrics)
- Secondary: `category` (exact matching)
- Quality: `llm` (subjective assessment)

**Content Generation:**
- Structure: `schema` (format validation)
- Quality: `rouge_bleu` (text metrics)
- Semantics: `embedding` (similarity)
- Assessment: `llm` (comprehensive quality)

**Conversational AI:**
- Flow: `conversation` (dialogue validation)  
- Quality: `llm` (response appropriateness)
- Requirements: `required_fields` (message structure)

**AI Agents:**
- Functions: `tool_usage` (function calls)
- Workflow: `workflow` (state transitions)
- Results: `category` (final outcomes)

**Performance Monitoring:**
- Budgets: `budgets` (latency/cost)
- Format: `regex` (structured outputs)
- Completeness: `required_fields` (data presence)

### By Speed Requirements

**Fast Feedback (< 1s per evaluation):**
- `schema`, `category`, `required_fields`, `regex`, `budgets`, `conversation`, `tool_usage`, `workflow`

**Medium Speed (1-10s per evaluation):**
- `classification`, `rouge_bleu`

**Slow but Comprehensive (10s+ per evaluation):**
- `llm`, `embedding`

### By Complexity

**Simple Setup:**
- `schema`, `category`, `required_fields`, `budgets`

**Medium Setup:**
- `regex`, `classification`, `rouge_bleu`, `conversation`, `tool_usage`, `workflow`  

**Complex Setup:**
- `llm` (prompt engineering), `embedding` (model selection)

---

## Best Practices

### 🎯 **Evaluator Combinations**

**Layered Approach:**
```yaml
evaluators:
  # Layer 1: Fast validation
  - {name: structure, type: schema, weight: 0.1}
  - {name: required, type: required_fields, weight: 0.1}
  
  # Layer 2: Functional testing  
  - {name: accuracy, type: category, weight: 0.3}
  
  # Layer 3: Quality assessment
  - {name: quality, type: llm, weight: 0.4, min_score: 0.8}
  
  # Layer 4: Performance
  - {name: performance, type: budgets, weight: 0.1}
```

### ⚡ **Performance Optimization**

**Fail Fast:**
```yaml
# Put fast, strict evaluators first
- {name: required_fields, type: required_fields, weight: 0.1, min_score: 1.0}
- {name: expensive_llm, type: llm, weight: 0.5}  # Only runs if required_fields passes
```

**Conditional Evaluation:**
```yaml
# Only run expensive evaluation on high-priority items  
- name: detailed_analysis
  type: llm
  fixture_filter: "meta.priority == 'high'"
```

### 🔧 **Debugging Tips**

**Verbose Output:**
```bash
EVALGATE_LOG_LEVEL=DEBUG evalgate run --config .github/evalgate.yml
```

**Single Evaluator Testing:**
```yaml
evaluators:
  - name: test_evaluator
    type: llm
    enabled: true
  # Disable others for isolated testing
  - name: other_evaluator
    enabled: false
```

## Next Steps

- **[Examples](examples.md)** - Real-world evaluator combinations
- **[Best Practices](best-practices.md)** - Production deployment strategies
- **[CLI Reference](cli-reference.md)** - Command-line usage
- **[Troubleshooting](troubleshooting.md)** - Debug common issues

---

*This reference covers all evaluator types in EvalGate v0.3.0. Each evaluator is designed for specific use cases and can be combined to create comprehensive evaluation strategies.*
