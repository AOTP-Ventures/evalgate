---
title: "Introduction"
section: "Overview"
slug: "introduction"
order: 1
description: "What is EvalGate and why use it"
---

## Stop AI Regressions Before They Ship

Automated evaluation for your AI features. Catch quality, cost, and performance issues in pull requests—before they reach production.

⚡ **Zero Infrastructure Required**

## The Problem

**🚨 AI Features Break in Production**
 
* ⛔ Your LLM starts generating malformed JSON after a prompt change
* 😞 Response quality degrades but you only notice after customer complaints  
* ⛔ Latency spikes from 200ms to 2s, breaking your user experience
* 😩 A model update changes behavior in subtle ways you didn't test for
* ❤️‍🩹 Complex agent workflows fail silently with no visibility into tool usage patterns

Sound familiar? Many teams rely on manual testing or basic unit tests for AI features. But AI systems fail in ways traditional software doesn't—and those failures are expensive.

## Why EvalGate?

✅ Catch AI Regressions Before They Ship

EvalGate runs comprehensive evaluations on every PR, so you know exactly how your changes affect AI quality, cost, and performance—before they reach production.

### Before/After Comparison

**Before (Without EvalGate)**
* Manual testing on a few examples
* Hope nothing breaks in production
* Debug issues after customers complain
* No visibility into cost/latency changes
* Afraid to update prompts or models
* No easy way to validate complex AI workflows

**After (With EvalGate)**
* Automated evaluation on every PR
* Catch regressions before they merge
* Clear reports on what changed
* Budget enforcement for cost/latency
* Ship AI features with confidence
* Comprehensive validation for agents, conversations, and workflows

## What Makes EvalGate Different?

### Simple Tool, Not a _Platform_
 
EvalGate isn't another heavyweight platform to learn and manage. It's a simple, **open source** CLI tool that works exactly where you already do—in GitHub PRs, with your existing workflow.

### Key Features

⚡ **Works Where You Already Are**
No new platforms to learn. Runs in your existing GitHub PRs, posts results as comments, integrates with your current code review process. It feels native.

🎈 **Lightweight by Design**
No servers, no databases, no dashboards to maintain. Just a CLI tool that runs when you need it. Your team can start using it in 10 minutes without any infrastructure changes.

🧠 **Start Simple, Scale Sophisticated**
Begin with basic JSON validation and exact matches. Add classification metrics, semantic similarity, or LLM-powered evaluation when you're ready. No big upfront commitment or complex setup.

🔒 **Your Code, _Your Environment_**
Everything runs in your GitHub Actions. Your prompts, data, and results never leave your environment. No vendor lock-in, no external dependencies.

🔓 **Open Source**
Complete transparency with an MIT license. Audit every line of code, contribute improvements, or fork it for your needs. No black boxes, no hidden telemetry.