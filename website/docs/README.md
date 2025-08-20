# EvalGate Documentation

This directory contains versioned documentation for EvalGate.

## Available Versions

### v0.2.0 (Current)
- **Location:** `v0.2.0/`
- **Combined LLM Document:** [`v0.2.0/COMPLETE.md`](v0.2.0/COMPLETE.md)
- **Individual Files:**
  - [Introduction](v0.2.0/01-introduction.md)
  - [Quick Start Guide](v0.2.0/02-quick-start.md)

## For LLM Context

Each version includes a `COMPLETE.md` file that combines all documentation into a single, LLM-readable document. Use this for comprehensive AI assistant context.

**Generate combined documentation:**
```bash
python3 scripts/combine-docs.py v0.2.0
```

## Structure

```
docs/
├── README.md              # This file
├── v0.2.0/               # Version 0.2.0 docs
│   ├── 01-introduction.md
│   ├── 02-quick-start.md
│   └── COMPLETE.md       # Auto-generated combined file
└── vX.Y.Z/              # Future versions...
```
