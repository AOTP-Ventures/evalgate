---
title: "How it Works"
description: "Architecture and evaluation flow"
section: "Get Started"
slug: "how-it-works"
order: 2
---

# How It Works

Understanding EvalGate's architecture, evaluation flow, and how it fits into your development workflow.

## Architecture Overview

### 🏗️ Zero Infrastructure Design

EvalGate runs entirely in your GitHub Actions. No servers to manage, no databases to maintain, no external services to depend on. Everything happens in your CI environment.

**Core Components:**

1. **Test Fixtures** - JSON files with input/expected output pairs
2. **Your Model** - Generate outputs from fixture inputs
3. **EvalGate** - Compare outputs to expected results

## Evaluation Flow

Here's how EvalGate works step by step:

### 1. PR Created → GitHub Actions Triggered
When you create a PR, GitHub Actions runs your evaluation workflow.

### 2. Generate Outputs
Your prediction script reads test fixtures and generates outputs using your AI model.

### 3. Run Evaluations
EvalGate compares your outputs against expected results using configured evaluators.

### 4. Compare to Baseline
Scores are compared to main branch to detect regressions.

### 5. Report & Gate Decision
Results posted to PR. Merge blocked if score below threshold.

**Evaluation Flow Summary:**
```
1. Your PR triggers GitHub Actions
2. Actions runs your prediction script
3. EvalGate compares outputs to fixtures
4. Results posted as PR comment
5. Gate blocks merge if score too low
```

## Example Walkthrough

Let's trace through a simple example to see how EvalGate evaluates your AI system:

```
# Your test case
{
  "input": {"query": "refund please"},
  "expected": {"priority": "P1", "category": "billing"}
}

# Your model output  
{"priority": "P2", "category": "billing"}

# EvalGate evaluation
✅ Category match: 100%
❌ Priority match: 0% 
📊 Overall score: 50%
```

**Result Analysis:**

✅ **What Passed:**
- Category classification correct
- JSON schema valid
- Response latency acceptable

❌ **What Failed:**
- Priority wrong (P2 vs P1)
- Overall score below threshold
- Regression vs main branch

⚠️ **Gate Decision:**
- Score: 50% (need 90%)
- PR merge blocked
- Clear feedback provided

## Types of Evaluations

EvalGate supports multiple evaluation types, each serving different purposes:

### ✅ Deterministic Evaluations
Fast, reliable checks that catch obvious problems

- **JSON Schema validation** - Ensure output structure
- **Exact field matching** - Verify specific values
- **Category accuracy** - Classification correctness
- **Budget limits** - Cost and latency constraints

### 🧠 LLM-as-Judge Evaluations  
AI-powered evaluation for complex, subjective criteria

- **Content quality** - Writing clarity and coherence
- **Tone assessment** - Appropriateness and style
- **Domain expertise** - Technical accuracy
- **Nuanced scoring** - Complex reasoning evaluation

### 🔄 Regression Detection
Compare against baseline to catch quality degradation

- **Main branch comparison** - Detect changes vs baseline
- **Statistical significance** - Meaningful difference detection
- **Trend analysis** - Quality trajectory monitoring
- **Alert thresholds** - Configurable sensitivity

## Why This Architecture Works

### For Developers
- **No infrastructure to maintain** - Just GitHub Actions
- **Familiar environment** - Runs where you already work
- **Integrated results** - PR comments and check runs
- **Easy debugging** - Same locally as in CI

### For Organizations
- **Zero operational overhead** - No services to manage
- **Complete data privacy** - Everything in your environment
- **Scales with team** - GitHub Actions handles scaling
- **Auditable and transparent** - Full visibility into process

## Common Questions

**Q: How does EvalGate know what to evaluate?**
A: You provide test fixtures (input/expected output pairs) and EvalGate compares your model's outputs to the expected results.

**Q: What if my model is non-deterministic?**
A: EvalGate focuses on evaluating quality patterns, not exact matches. LLM-as-judge evaluators are perfect for non-deterministic outputs.

**Q: Can I run this locally for debugging?**
A: Yes! EvalGate runs the same way locally as in CI, making debugging easy.

**Q: How do I handle different types of AI outputs?**
A: EvalGate supports multiple evaluator types - from strict JSON schema validation to flexible LLM-based quality assessment.

**Q: What about API costs for LLM evaluation?**
A: EvalGate includes response caching and sampling strategies to minimize costs while maintaining evaluation quality.

## Integration Points

EvalGate integrates at multiple points in your workflow:

### Development Time
- **Local testing** - Run evaluations before pushing
- **IDE integration** - Quick feedback during development
- **Fixture management** - Version control your test cases

### CI/CD Pipeline
- **PR evaluation** - Automatic quality gates
- **Baseline updates** - Progressive quality improvement
- **Deployment gates** - Block bad releases

### Monitoring & Analysis
- **Trend tracking** - Quality over time
- **Regression alerts** - Immediate notification
- **Performance analysis** - Cost and latency monitoring

---

*EvalGate's zero-infrastructure architecture makes AI evaluation accessible to any team, regardless of their operational complexity or scale.*
