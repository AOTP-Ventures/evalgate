# AOTP Ventures EvalGate

**EvalGate** runs deterministic LLM/RAG evals as a PR check. It compares your repo’s generated outputs against **fixtures**, validates **formatting**, **label accuracy**, and **latency/cost budgets**, and posts a readable summary on the PR. Default is **local-only** (no telemetry).

- ✅ Deterministic checks (schema/labels/latency/cost)
- 🧪 Regression vs `main` baseline
- 🔒 Local-only by default; optional “metrics-only” later
- 🧰 Zero infra — a composite GitHub Action + tiny CLI

## Quick start (local, via uv)

```
    uvx --from evalgate evalgate init
    python scripts/predict.py --in eval/fixtures --out .evalgate/outputs
    uvx --from evalgate evalgate run --config .github/evalgate.yml
    uvx --from evalgate evalgate report --summary --artifact ./.evalgate/results.json
```
