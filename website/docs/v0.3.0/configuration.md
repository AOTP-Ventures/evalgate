---
title: "Configuration"
section: "Core Concepts"
slug: "configuration"
order: 4
description: "Config file structure and options"
---

# Configuration Reference

The EvalGate configuration file (`.github/evalgate.yml`) controls evaluation behavior. This reference covers all supported configuration options in v0.3.0.

## Configuration Structure

```yaml
budgets: { ... }   # Performance budgets
fixtures: { ... }  # Input data paths
outputs: { ... }   # Generated output paths
gate: { ... }      # Quality gates
report: { ... }    # Reporting behavior
baseline: { ... }  # Baseline comparison
telemetry: { ... } # Telemetry configuration
```

## Complete Configuration Example

```yaml
budgets:
  p95_latency_ms: 1000
  max_cost_usd_per_item: 0.02

fixtures:
  path: "eval/fixtures/**/*.json"

outputs:
  path: ".evalgate/outputs/**/*.json"

gate:
  min_overall_score: 0.85
  allow_regression: false

report:
  pr_comment: true
  artifact_path: ".evalgate/results.json"

baseline:
  ref: "origin/main"

telemetry:
  mode: "local_only"
```

## Option Details

### budgets

- `p95_latency_ms` – Maximum allowed 95th percentile latency per item in milliseconds.
- `max_cost_usd_per_item` – Maximum allowed cost per item in USD.

### fixtures

- `path` – Glob pattern locating fixture files.

### outputs

- `path` – Glob pattern locating generated outputs.

### gate

- `min_overall_score` – Minimum evaluation score required to pass.
- `allow_regression` – When `true`, permits regressions compared to baseline.

### report

- `pr_comment` – When `true`, posts a summary comment on the pull request.
- `artifact_path` – File path where evaluation results are written.

### baseline

- `ref` – Git reference used to fetch baseline results for comparison.

### telemetry

- `mode` – Controls telemetry behavior. See [Telemetry Modes](#telemetry-modes).

## Telemetry Modes

`telemetry.mode` has two possible values:

- `local_only` – Default. No telemetry leaves your machine.
- `metrics_only` – Sends anonymized usage metrics.

---

*The configuration file is the heart of EvalGate—master these options to build evaluation strategies that scale with your AI systems.*

