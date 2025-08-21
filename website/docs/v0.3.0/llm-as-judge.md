---
title: "LLM as Judge"
section: "Advanced Features"
slug: "llm-as-judge"
order: 6
description: "AI-powered quality assessment"
---

# LLM as Judge

LLM as Judge is one of EvalGate v0.3.0's most powerful features, enabling AI-powered quality assessment for complex criteria that traditional metrics can't capture. Use GPT-4, Claude, or other language models to evaluate content quality, appropriateness, accuracy, and domain-specific requirements.

## Why LLM as Judge?

### Traditional Metrics Fall Short

**Deterministic evaluators are great for:**
- Format validation (JSON schema)
- Exact matching (categories, labels)  
- Performance metrics (latency, cost)

**But they can't evaluate:**
- Content quality and coherence
- Tone and appropriateness
- Factual accuracy
- Complex domain expertise
- Subjective criteria

### LLM Evaluators Excel At

✅ **Subjective Quality Assessment**
- Writing quality and clarity
- Professional tone and appropriateness
- User experience and helpfulness

✅ **Complex Reasoning**
- Logical consistency
- Argument structure
- Cause-and-effect relationships

✅ **Domain Expertise**
- Technical accuracy
- Industry-specific requirements
- Regulatory compliance

✅ **Contextual Understanding**
- Cultural sensitivity
- Situational appropriateness
- User intent alignment

## Quick Setup

### 1. Install with LLM Support

```bash
# Install EvalGate with LLM dependencies
pip install evalgate[llm]

# Or with uv
uvx --from evalgate[llm] evalgate
```

### 2. Create Evaluation Prompt

Create `eval/prompts/quality_judge.txt`:

```
You are evaluating customer service responses for quality and helpfulness.

INPUT (Customer message):
{input}

EXPECTED (Ideal response):
{expected}

OUTPUT (AI response to evaluate):
{output}

Rate the OUTPUT on these criteria:
- Accuracy: Does it correctly address the customer's need?
- Helpfulness: Does it provide useful information or next steps?
- Professionalism: Is the tone appropriate for customer service?
- Completeness: Does it fully address the customer's question?

Provide a score from 0.0 to 1.0 where:
- 1.0 = Excellent response that meets all criteria
- 0.8 = Good response with minor issues
- 0.6 = Adequate response with some problems
- 0.4 = Poor response with major issues
- 0.0 = Completely inappropriate or wrong

Score: [your score]
Reasoning: [brief explanation]
```

### 3. Configure Evaluator

Add to `.github/evalgate.yml`:

```yaml
evaluators:
  - name: response_quality
    type: llm
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/quality_judge.txt
    api_key_env_var: OPENAI_API_KEY
    weight: 0.4
    min_score: 0.75
```

Key parameters:

- `provider`: LLM service (`openai`, `anthropic`, `azure`, `local`)
- `model`: model name or deployment identifier
- `prompt_path`: path to the evaluation prompt template
- `api_key_env_var`: environment variable holding your API key
- `base_url`: custom endpoint for Azure or local providers
- `weight`: relative contribution to the overall score
- `min_score`: minimum score required to pass

### 4. Set API Key

```bash
export OPENAI_API_KEY=your_api_key_here
```

### 5. Run Evaluation

```bash
evalgate run --config .github/evalgate.yml
```

## Supported Providers

### OpenAI
```yaml
- name: openai_judge
  type: llm
  provider: openai
  model: gpt-4                    # gpt-4, gpt-4-turbo, gpt-3.5-turbo
  api_key_env_var: OPENAI_API_KEY
  temperature: 0.1                # Optional: control randomness
  max_tokens: 200                 # Optional: response length limit
```

### Anthropic (Claude)
```yaml
- name: claude_judge
  type: llm
  provider: anthropic
  model: claude-3-sonnet-20240229  # claude-3-opus, claude-3-sonnet, claude-3-haiku
  api_key_env_var: ANTHROPIC_API_KEY
  temperature: 0.1
  max_tokens: 200
```

### Azure OpenAI
```yaml
- name: azure_judge
  type: llm
  provider: azure
  model: gpt-4                    # Your deployment name
  api_key_env_var: AZURE_OPENAI_API_KEY
  base_url: "https://your-resource.openai.azure.com/"
```

EvalGate uses the provider's default API version; override only if you need a specific version.

### Local/Self-Hosted Models
```yaml
- name: local_judge
  type: llm
  provider: local
  model: llama-7b-chat           # Your model identifier
  base_url: "http://localhost:8000/v1"
  api_key_env_var: LOCAL_API_KEY # Optional
```

## Prompt Engineering Best Practices

### Effective Prompt Structure

**1. Clear Context**
```
You are an expert {domain} evaluator.
You will rate {specific_task} outputs for {criteria}.
```

**2. Input Template Variables**
```
INPUT: {input}
EXPECTED: {expected}  
OUTPUT: {output}
CONTEXT: {context}    # Optional additional context
```

**3. Specific Criteria**
```
Evaluate on these specific criteria:
1. Accuracy (40%): Factual correctness
2. Clarity (30%): Easy to understand  
3. Completeness (30%): Addresses all aspects
```

**4. Clear Scoring Scale**
```
Score from 0.0 to 1.0:
- 1.0: Exceptional - exceeds all requirements
- 0.8: Good - meets requirements with minor issues
- 0.6: Acceptable - meets basic requirements
- 0.4: Poor - significant issues present
- 0.0: Unacceptable - fails basic requirements
```

**5. Output Format**
```
Provide your evaluation as:
Score: [0.0-1.0]
Reasoning: [2-3 sentence explanation]
```

### Domain-Specific Prompt Examples

#### Customer Service Quality
```
You are evaluating customer service responses.

INPUT (Customer inquiry): {input}
OUTPUT (Agent response): {output}

Rate the response on:
1. Empathy: Shows understanding of customer concern
2. Helpfulness: Provides useful information or solutions
3. Professionalism: Maintains appropriate tone
4. Accuracy: Information provided is correct

Score: [0.0-1.0]
```

#### Content Generation Quality
```
You are a content quality expert evaluating {content_type}.

TOPIC: {input}
GENERATED CONTENT: {output}
TARGET AUDIENCE: {audience}

Evaluate for:
1. Relevance: Content matches the topic (25%)
2. Accuracy: Information is factually correct (25%)  
3. Engagement: Content is interesting and readable (25%)
4. Structure: Well-organized and coherent (25%)

Score: [0.0-1.0]
```

#### Code Review
```
You are evaluating code quality and correctness.

REQUIREMENT: {input}
CODE: {output}

Assess:
1. Correctness: Code solves the problem correctly
2. Style: Follows best practices and conventions
3. Efficiency: Reasonable performance characteristics
4. Readability: Clear and well-documented

Score: [0.0-1.0]
```

#### Medical/Healthcare
```
You are a medical expert evaluating patient communication.

PATIENT QUESTION: {input}
AI RESPONSE: {output}

Evaluate for:
1. Medical Accuracy: Information is medically sound
2. Appropriateness: Suitable for patient communication
3. Safety: Does not provide dangerous advice
4. Empathy: Shows understanding of patient concerns

IMPORTANT: Deduct points for any unsafe medical advice.

Score: [0.0-1.0]
```

## Advanced Configuration

### Multiple LLM Judges

Use different models for different aspects:

```yaml
evaluators:
  # Fast screening with smaller model
  - name: basic_quality
    type: llm
    provider: openai
    model: gpt-3.5-turbo
    prompt_path: eval/prompts/basic_quality.txt
    weight: 0.2
    min_score: 0.6
    
  # Detailed analysis with premium model
  - name: expert_review
    type: llm
    provider: anthropic
    model: claude-3-opus-20240229
    prompt_path: eval/prompts/expert_review.txt
    weight: 0.3
    min_score: 0.8
    
  # Domain expertise
  - name: technical_accuracy
    type: llm
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/technical_judge.txt
    weight: 0.3
```

### Ensemble Evaluation

Combine multiple LLM judgments:

```yaml
evaluators:
  # Judge 1: GPT-4 perspective
  - name: gpt4_judge
    type: llm
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/quality.txt
    weight: 0.2
    
  # Judge 2: Claude perspective
  - name: claude_judge
    type: llm
    provider: anthropic
    model: claude-3-sonnet-20240229
    prompt_path: eval/prompts/quality.txt
    weight: 0.2
    
  # Combine with deterministic metrics
  - name: factual_accuracy
    type: category
    expected_field: "category"
    weight: 0.3
```

### Conditional Evaluation

Use different prompts based on context:

```yaml
evaluators:
  - name: context_aware_judge
    type: llm
    provider: openai
    model: gpt-4
    prompt_path: eval/prompts/customer_service.txt  # Default
    prompt_conditions:
      - condition: "input.type == 'complaint'"
        prompt_path: eval/prompts/complaint_handling.txt
      - condition: "input.priority == 'urgent'"
        prompt_path: eval/prompts/urgent_response.txt
    weight: 0.4
```

### Performance Optimization

```yaml
evaluators:
  - name: optimized_judge
    type: llm
    provider: openai
    model: gpt-3.5-turbo        # Faster, cheaper model
    temperature: 0.0            # Deterministic responses
    max_tokens: 50              # Concise responses
    timeout_seconds: 10         # Fail fast
    retry_attempts: 2           # Limited retries
    weight: 0.3
```

## Response Caching

EvalGate automatically caches LLM responses to avoid repeat API calls:

### Cache Behavior
- Responses cached by prompt + input hash
- Cache persists across runs
- Saves API costs and improves speed
- Cache stored in `.evalgate/cache.json`

### Cache Management
```bash
# Clear cache for fresh evaluation
evalgate run --config .github/evalgate.yml --clear-cache

# View cache statistics
cat .evalgate/cache.json | jq '.cache_stats'
```

### Cache Configuration
```yaml
evaluators:
  - name: cached_judge
    type: llm
    provider: openai
    model: gpt-4
    cache_ttl_hours: 24         # Optional: cache expiration
    cache_key_fields: ["input", "expected"]  # Optional: custom cache key
```

## Error Handling and Reliability

### Robust Configuration
```yaml
evaluators:
  - name: reliable_judge
    type: llm
    provider: openai
    model: gpt-4
    timeout_seconds: 30         # Request timeout
    retry_attempts: 3           # Retry failed requests
    retry_delay_seconds: 1      # Delay between retries
    fallback_score: 0.5         # Score if all retries fail
    fail_on_error: false        # Continue evaluation on failure
```

### Error Scenarios

**API Rate Limits:**
```yaml
retry_attempts: 5
retry_delay_seconds: 5
backoff_multiplier: 2.0  # Exponential backoff
```

**Model Unavailable:**
```yaml
fallback_provider: anthropic
fallback_model: claude-3-sonnet-20240229
```

**Malformed Responses:**
```yaml
response_validation: strict   # Validate score format
default_score_on_error: 0.0   # Conservative default
```

## GitHub Actions Integration

### Environment Variables

Add API keys as repository secrets:

```yaml
# .github/workflows/evalgate.yml
- name: Run EvalGate with LLM judges
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    AZURE_OPENAI_API_KEY: ${{ secrets.AZURE_OPENAI_API_KEY }}
  run: |
    uvx --from evalgate[llm] evalgate run --config .github/evalgate.yml
```

### API Key Validation

```yaml
- name: Validate API Keys
  run: |
    if [ -z "${{ secrets.OPENAI_API_KEY }}" ]; then
      echo "❌ OPENAI_API_KEY secret not set"
      exit 1
    fi
    echo "✅ API keys configured"
```

### Cost Monitoring

```yaml
- name: Monitor API Costs
  run: |
    cost=$(jq -r '.cost' .evalgate/results.json)
    if (( $(echo "$cost > 1.00" | bc -l) )); then
      echo "⚠️ High API cost: $cost USD"
    fi
```

## Cost Optimization Strategies

### 1. Model Selection
```yaml
# Development: Fast and cheap
model: gpt-3.5-turbo
max_tokens: 100

# Production: High quality
model: gpt-4
max_tokens: 200
```

### 2. Batch Processing
```yaml
# Process in batches to reduce API overhead
batch_size: 10
concurrent_requests: 3
```

### 3. Selective Evaluation
```yaml
# Only run expensive LLM evaluation on high-priority fixtures
evaluators:
  - name: expensive_judge
    type: llm
    fixture_filter: "meta.priority == 'high'"
    provider: openai
    model: gpt-4
```

### 4. Tiered Evaluation
```yaml
evaluators:
  # Cheap first pass
  - name: screening
    type: category
    weight: 0.3
    min_score: 0.8
    
  # Expensive detailed evaluation only if screening passes
  - name: detailed_quality
    type: llm
    provider: openai
    model: gpt-4
    enabled_if: "screening.passed"
    weight: 0.7
```

## Quality Assurance for LLM Judges

### Prompt Testing
```bash
# Test prompts with sample data
python scripts/test_llm_prompts.py \
  --prompt eval/prompts/quality.txt \
  --samples eval/fixtures/sample_*.json \
  --model gpt-4
```

### Judge Consistency
```python
# scripts/validate_judge_consistency.py
# Run same evaluation multiple times to check consistency
consistency_scores = []
for i in range(5):
    result = evaluate_with_llm(prompt, input_data)
    consistency_scores.append(result.score)

variance = np.var(consistency_scores)
if variance > 0.1:
    print(f"⚠️ High variance in LLM judge: {variance}")
```

### Human Validation
```python
# Compare LLM scores with human ratings
human_scores = load_human_ratings("eval/human_ratings.json")
llm_scores = load_llm_ratings(".evalgate/results.json")

correlation = pearsonr(human_scores, llm_scores)
print(f"Human-LLM correlation: {correlation[0]:.3f}")
```

## Troubleshooting

### Common Issues

**LLM returns non-numeric scores:**
```
Error: Could not parse score from LLM response
Solution: Update prompt to require explicit "Score: X.X" format
```

**High API costs:**
```
Solution: Use smaller models, reduce max_tokens, cache responses
```

**Inconsistent evaluations:**
```
Solution: Lower temperature, provide more specific criteria, use examples
```

**Rate limit errors:**
```
Solution: Increase retry_delay_seconds, reduce concurrent_requests
```

### Debug Mode

```bash
# Run with debug logging
EVALGATE_LOG_LEVEL=DEBUG evalgate run --config .github/evalgate.yml
```

## Best Practices Summary

### ✅ **Do:**
- Use specific, measurable criteria
- Provide clear scoring scales
- Test prompts with sample data
- Cache responses to save costs
- Set appropriate min_score thresholds
- Monitor API costs and consistency

### ❌ **Don't:**
- Use vague or subjective criteria
- Rely solely on LLM judges for critical decisions
- Skip human validation of LLM evaluations
- Ignore API cost implications
- Use overly complex prompts

### 🎯 **Golden Rules:**
1. **Start simple** - Basic prompts work better than complex ones
2. **Be specific** - Exact criteria beat general quality assessment
3. **Validate constantly** - Compare LLM scores with human judgment
4. **Control costs** - Monitor and optimize API usage
5. **Cache everything** - Avoid redundant API calls

## Next Steps

- **[GitHub Integration](07-github-integration.md)** - Advanced CI/CD patterns
- **[Baseline Management](08-baseline-management.md)** - Progressive quality improvement
- **[Examples](10-examples.md)** - Real-world LLM judge implementations
- **[Best Practices](11-best-practices.md)** - Production deployment strategies

---

*LLM as Judge transforms evaluation from rigid rule-checking to nuanced quality assessment, enabling evaluation of complex criteria that traditional metrics cannot capture.*
