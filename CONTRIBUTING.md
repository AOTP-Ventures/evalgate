# Contributing to EvalGate

Thank you for your interest in contributing to EvalGate! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Style](#code-style)
- [Project Structure](#project-structure)
- [Release Process](#release-process)

## Getting Started

### Prerequisites

- Python 3.10 or higher
- [uv](https://docs.astral.sh/uv/) package manager
- Git

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/evalgate.git
   cd evalgate
   ```

2. **Set up the development environment:**
   ```bash
   # Create virtual environment and install dependencies
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   uv pip install -e .
   
   # Install development dependencies
   uv pip install pytest black isort mypy
   ```

3. **Verify the setup:**
   ```bash
   # Run the self-test
   python scripts/predict.py --in eval/fixtures --out .evalgate/outputs
   evalgate run --config .github/evalgate.yml
   evalgate report --summary --artifact .evalgate/results.json
   ```

## Making Changes

### Before You Start

1. **Check existing issues** to see if your idea is already being discussed
2. **Open an issue** for new features or significant changes to discuss the approach
3. **Create a branch** from `main` for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Types of Contributions

We welcome several types of contributions:

- **Bug fixes** - Fix issues in existing functionality
- **New evaluators** - Add new evaluation types (schema, category, budgets, etc.)
- **Features** - Add new functionality to the CLI or action
- **Documentation** - Improve README, add examples, fix typos
- **Tests** - Add test coverage for existing functionality
- **Performance** - Optimize existing code

### Development Guidelines

1. **Follow the existing code structure** in `src/evalgate/`
2. **Add tests** for new functionality
3. **Update documentation** when adding features
4. **Keep changes focused** - one feature/fix per PR
5. **Write clear commit messages** describing what and why

## Testing

### Running Tests Locally

```bash
# Run the basic self-test
python scripts/predict.py --in eval/fixtures --out .evalgate/outputs
evalgate run --config .github/evalgate.yml

# The selftest should pass with a score of 1.0
```

### Adding New Tests

When adding new evaluators or features:

1. **Add test fixtures** in `eval/fixtures/` if needed
2. **Update schemas** in `eval/schemas/` if needed  
3. **Test edge cases** like missing fields, invalid JSON, etc.
4. **Verify the results** in `.evalgate/results.json`

### Testing GitHub Actions

The project includes GitHub Actions that run automatically:

- **Selftest** (`selftest.yml`) - Runs on push to `main` using local code
- **EvalGate** (`evalgate.yml`) - Runs on PRs using published package

## Submitting Changes

### Pull Request Process

1. **Ensure tests pass** locally
2. **Update documentation** if needed
3. **Push your branch** and create a pull request
4. **Fill out the PR template** with:
   - Description of changes
   - Type of change (bug fix, feature, docs, etc.)
   - Testing performed
   - Breaking changes (if any)

### PR Requirements

- [ ] Code follows project style guidelines
- [ ] Self-test passes (`evalgate run` succeeds)
- [ ] Documentation updated (if applicable)
- [ ] Commit messages are clear and descriptive
- [ ] No merge conflicts with `main`

### Review Process

1. **Automated checks** must pass (GitHub Actions)
2. **Code review** by maintainers
3. **Testing** of new functionality
4. **Merge** after approval

## Code Style

### Python Code Style

- **Follow PEP 8** for Python code style
- **Use type hints** for function parameters and return values
- **Import organization:**
  ```python
  # Standard library
  import json, pathlib
  
  # Third party
  from pydantic import BaseModel
  
  # Local imports
  from .config import Config
  ```

### File Organization

```
src/evalgate/
├── __init__.py
├── cli.py              # Main CLI commands
├── config.py           # Configuration models
├── util.py             # Shared utilities
├── store.py            # Baseline loading/storage
├── report.py           # Markdown report generation
└── evaluators/         # Evaluation modules
    ├── json_schema.py
    ├── category_match.py
    └── latency_cost.py
```

### Adding New Evaluators

To add a new evaluator type:

1. **Create a new module** in `src/evalgate/evaluators/`
2. **Implement the `evaluate` function:**
   ```python
   def evaluate(outputs, fixtures=None, **kwargs) -> Tuple[float, List[str]]:
       """Return (score, violations) where score is 0.0-1.0"""
       # Your evaluation logic here
       return score, violations
   ```
3. **Import and use** in `cli.py`
4. **Add configuration** options in `config.py` if needed
5. **Update documentation** and examples

## Project Structure

### Key Files

- `src/evalgate/` - Main Python package
- `action.yml` - GitHub composite action
- `.github/workflows/` - CI/CD workflows
- `eval/` - Example fixtures and schemas
- `scripts/predict.py` - Example prediction script
- `pyproject.toml` - Package configuration

### Configuration

EvalGate uses YAML configuration files (typically `.github/evalgate.yml`):

```yaml
budgets: { p95_latency_ms: 1200, max_cost_usd_per_item: 0.03 }
fixtures: { path: "eval/fixtures/**/*.json" }
outputs: { path: ".evalgate/outputs/**/*.json" }
evaluators:
  - { name: json_formatting, type: schema, schema_path: "eval/schemas/queue_item.json", weight: 0.4 }
  - { name: priority_accuracy, type: category, expected_field: "priority", weight: 0.4 }
  - { name: latency_cost, type: budgets, weight: 0.2 }
gate: { min_overall_score: 0.90, allow_regression: false }
```

## Release Process

### For Maintainers

1. **Update version** in `pyproject.toml`
2. **Update CHANGELOG** (if we add one)
3. **Create release PR** with version bump
4. **Tag release** after merge:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```
5. **Build and publish:**
   ```bash
   uv build
   uv publish
   ```

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** - Breaking changes
- **MINOR** - New features, backward compatible
- **PATCH** - Bug fixes, backward compatible

## Getting Help

- **Issues** - Open an issue for bugs or feature requests
- **Discussions** - Use GitHub Discussions for questions
- **Email** - Contact team@aotp.ventures for private matters

## Code of Conduct

Please be respectful and constructive in all interactions. We're building this tool to help the community create better AI systems through rigorous evaluation.

## License

By contributing to EvalGate, you agree that your contributions will be licensed under the MIT License.
