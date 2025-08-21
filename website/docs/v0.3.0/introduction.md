---
title: "Introduction"
section: "Overview"
slug: "introduction"
order: 1
description: "What is EvalGate and why use it"
---

# EvalGate Documentation

⚡ **Zero Infrastructure Required**

# Stop AI Regressions Before They Ship

Automated evaluation for your AI features. Catch quality, cost, and performance issues in pull requests—before they reach production.

## What's New in v0.3.0

🎉 **Major Release** - EvalGate v0.3.0 brings powerful new evaluation capabilities, advanced GitHub integration, and production-ready workflow management.

### 🔥 New Evaluator Types

**Advanced AI Evaluation:**
- **🧠 LLM as Judge** - GPT-4, Claude, or local models for quality evaluation
- **📊 Classification Metrics** - Precision, recall, F1 with confusion matrices
- **🎯 Embedding Similarity** - Semantic similarity using sentence transformers
- **📝 ROUGE/BLEU** - Text quality metrics for generation tasks

**Specialized Use Cases:**
- **💬 Conversation Flow** - Multi-turn conversation validation
- **🔧 Tool Usage** - Agent behavior and function call validation  
- **🔄 Workflow DAG** - State machine and workflow validation
- **🔍 Regex Match** - Advanced pattern-based validation
- **✅ Required Fields** - Comprehensive field presence validation

### 🚀 Enhanced CLI & Automation

**New Commands:**
- `evalgate generate-fixtures` - Auto-generate test data from schemas
- `evalgate baseline update` - Sophisticated baseline management
- Enhanced reporting with GitHub check runs

**Improved Workflows:**
- **Conversation fixtures** for chat-based models
- **LLM response caching** to avoid repeat API calls
- **Progressive baseline updates** for continuous quality improvement
- **Advanced error handling** with detailed diagnostics

## The Problem

🚨 **AI Features Break in Production**

• Your LLM starts generating malformed JSON after a prompt change
• Response quality degrades but you only notice after customer complaints  
• Latency spikes from 200ms to 2s, breaking your user experience
• A model update changes behavior in subtle ways you didn't test for
• **New in v0.3.0:** Complex agent workflows fail silently with no visibility into tool usage patterns

**Sound familiar?** Most teams rely on manual testing or basic unit tests for AI features. But AI systems fail in ways traditional software doesn't—and those failures are expensive.

## Why EvalGate?

✅ **Catch AI Regressions Before They Ship**

EvalGate runs comprehensive evaluations on every PR, so you know exactly how your changes affect AI quality, cost, and performance—before they reach production.

### Before/After Comparison

**Before (Without EvalGate)**
• Manual testing on a few examples
• Hope nothing breaks in production
• Debug issues after customers complain
• No visibility into cost/latency changes
• Afraid to update prompts or models
• **New:** No way to validate complex AI workflows

**After (With EvalGate)**
• Automated evaluation on every PR
• Catch regressions before they merge
• Clear reports on what changed
• Budget enforcement for cost/latency
• Ship AI features with confidence
• **New:** Comprehensive validation for agents, conversations, and workflows

## What Makes EvalGate Different?

🎯 **Simple Tool, Not a Platform**

EvalGate isn't another heavyweight platform to learn and manage. It's a simple, **open source** CLI tool that works exactly where you already do—in GitHub PRs, with your existing workflow.

### Key Features

⚡ **Works Where You Already Are**
No new platforms to learn. Runs in your existing GitHub PRs, posts results as comments, integrates with your current code review process. It feels native.

🎈 **Lightweight by Design**
No servers, no databases, no dashboards to maintain. Just a CLI tool that runs when you need it. Your team can start using it in 10 minutes without any infrastructure changes.

🧠 **Start Simple, Scale Sophisticated**
Begin with basic JSON validation and exact matches. Add classification metrics, semantic similarity, or LLM-powered evaluation when you're ready. No big upfront commitment or complex setup.

**New in v0.3.0:** Choose from 10+ specialized evaluator types, from deterministic validation to advanced AI-powered quality assessment.

🔒 **Your Code, Your Environment**
Everything runs in your GitHub Actions. Your prompts, data, and results never leave your environment. No vendor lock-in, no external dependencies.

🔓 **Fully Open Source**
Complete transparency with MIT license. Audit every line of code, contribute improvements, or fork it for your needs. No black boxes, no hidden telemetry.

## v0.3.0 Evaluation Types at a Glance

### Deterministic Evaluators
- **JSON Schema** - Structure and format validation
- **Category Match** - Exact label matching
- **Regex Match** - Pattern-based validation
- **Required Fields** - Field presence checking
- **Latency/Cost** - Performance budget enforcement

### AI-Powered Evaluators  
- **LLM as Judge** - Quality assessment using GPT-4, Claude, etc.
- **Embedding Similarity** - Semantic similarity scoring
- **Classification Metrics** - ML evaluation with precision/recall/F1

### Text Quality Evaluators
- **ROUGE/BLEU** - Standard NLG quality metrics
- **Conversation Flow** - Multi-turn dialogue validation

### Specialized Evaluators
- **Tool Usage** - Agent function call validation
- **Workflow DAG** - State machine flow validation

## Production-Ready Workflows

EvalGate v0.3.0 includes battle-tested patterns for:

- **Multi-evaluator setups** combining deterministic and AI-powered validation
- **Progressive quality improvement** with baseline ratcheting
- **GitHub Actions integration** with proper check runs and error reporting
- **Team collaboration** with clear PR feedback and debugging information
- **Cost optimization** through LLM response caching and smart evaluation strategies

## Use Cases

**🤖 AI Agents & Tool Use**
- Validate function call sequences and parameters
- Ensure proper workflow state transitions  
- Monitor tool usage patterns and success rates

**💬 Conversational AI**
- Multi-turn conversation quality
- Dialogue flow validation
- Response appropriateness and tone

**📝 Content Generation**
- Text quality with ROUGE/BLEU metrics
- Semantic similarity to expected outputs
- Style and format consistency

**🏷️ Classification & Extraction**
- Precision, recall, and F1 scoring
- Confusion matrix analysis
- Multi-label classification support

**⚡ Performance & Cost**
- Latency budget enforcement
- API cost tracking and limits
- Regression detection for speed/cost

---

*EvalGate v0.3.0 represents a major step forward in AI evaluation capabilities while maintaining the same zero-infrastructure, developer-friendly approach that makes it easy to adopt and integrate into existing workflows.*
