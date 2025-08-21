---
title: "GitHub Integration"
section: "Advanced Features"
slug: "github-integration"
order: 7
description: "CI/CD workflows and Automation"
---

# GitHub Actions Integration

Automate AI evaluation in your CI/CD pipeline with comprehensive GitHub Actions workflows.

## Why GitHub Actions?

🚀 Automated Quality Gates
EvalGate integrates seamlessly with GitHub Actions to automatically evaluate every pull request, preventing quality regressions and ensuring consistent AI performance across your team.

✅ Key Benefits

* Automatic evaluation on every PR
* Baseline comparison and regression detection
* Detailed PR comments with scores and insights
* Zero-setup LLM evaluation with secure API keys
* Multi-model and matrix testing support

🔄 Workflow Types

* Basic: Simple PR evaluation
* Advanced: Caching, artifacts, baseline updates
* Matrix: Multi-model testing
* Reusable: Shared workflows across repos
* Monorepo: Service-specific evaluation
* Scheduled: Periodic baseline updates

## Quick Setup

### 1. Add EvalGate to Your Repository

```bash
# Install EvalGate in your project
npm install -D evalgate
# or
pip install evalgate
```

### 2. Create Configuration File

Create `.github/evalgate.yml`:

```yaml
# EvalGate Configuration
evaluators:
  - name: response_quality
    type: llm
    provider: openai
    model: gpt-4
    weight: 0.4
    min_score: 0.75
    prompt_path: eval/prompts/quality.txt
    api_key_env_var: OPENAI_API_KEY

  - name: json_structure
    type: json_schema
    weight: 0.3
    min_score: 1.0
    schema_path: eval/schemas/response.json

  - name: performance
    type: latency
    weight: 0.3
    max_latency_ms: 500

fixtures_path: eval/fixtures
output_path: eval/results
cache_llm_responses: true
```

### 3. Add GitHub Actions Workflow

Create `.github/workflows/evalgate.yml`:

```yaml
name: EvalGate AI Evaluation

on:
  pull_request:
    types: [opened, synchronize, reopened]
    paths:
      - 'src/**'
      - 'eval/**'
      - '.github/evalgate.yml'

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for baseline comparison
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install EvalGate
        run: pip install evalgate[all]
      
      - name: Run Evaluation
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          evalgate run \
            --config .github/evalgate.yml \
            --baseline-ref origin/main \
            --github-token ${{ secrets.GITHUB_TOKEN }} \
            --pr-comment \
            --fail-on-regression
```

### 4. Set Up API Keys

Add your API keys as GitHub Secrets:

1. Go to **Settings → Secrets and variables → Actions**
2. Add secrets:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `ANTHROPIC_API_KEY` - Your Anthropic API key (if using Claude)
   - `AZURE_OPENAI_API_KEY` - Azure OpenAI key (if using Azure)

## Workflow Examples

### Basic PR Evaluation

```yaml
name: AI Quality Check

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  evalgate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install and Run EvalGate
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          pip install evalgate[llm]
          evalgate run --config .github/evalgate.yml
```

### Advanced with Caching and Artifacts

```yaml
name: Advanced EvalGate Evaluation

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Cache EvalGate Dependencies
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}
      
      - name: Cache LLM Responses
        uses: actions/cache@v3
        with:
          path: .evalgate/cache
          key: evalgate-llm-cache-${{ hashFiles('eval/fixtures/**') }}
      
      - name: Install EvalGate
        run: |
          pip install evalgate[all]
          evalgate --version
      
      - name: Run Evaluation with Baseline
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # Run evaluation with baseline comparison
          evalgate run \
            --config .github/evalgate.yml \
            --baseline-ref origin/main \
            --github-token $GITHUB_TOKEN \
            --pr-comment \
            --fail-on-regression \
            --cache-llm-responses \
            --verbose
      
      - name: Upload Results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: evalgate-results
          path: |
            eval/results/
            .evalgate/logs/
          retention-days: 30
      
      - name: Update Baseline (on merge to main)
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          evalgate baseline update \
            --config .github/evalgate.yml \
            --commit-sha ${{ github.sha }}
```

### Matrix Testing (Multiple Models)

```yaml
name: Multi-Model Evaluation

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        model: ["gpt-4", "gpt-3.5-turbo", "claude-3-sonnet"]
        include:
          - model: "gpt-4"
            provider: "openai"
            api_key: "OPENAI_API_KEY"
          - model: "gpt-3.5-turbo"
            provider: "openai"
            api_key: "OPENAI_API_KEY"
          - model: "claude-3-sonnet"
            provider: "anthropic"
            api_key: "ANTHROPIC_API_KEY"
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install EvalGate
        run: pip install evalgate[all]
      
      - name: Create Model-Specific Config
        run: |
          # Create config for this matrix job
          sed 's/MODEL_PLACEHOLDER/${{ matrix.model }}/g' \
            .github/evalgate.template.yml > evalgate-${{ matrix.model }}.yml
      
      - name: Run Evaluation
        env:
          API_KEY: ${{ secrets[matrix.api_key] }}
        run: |
          evalgate run \
            --config evalgate-${{ matrix.model }}.yml \
            --output-suffix "-${{ matrix.model }}"
      
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: results-${{ matrix.model }}
          path: eval/results/*-${{ matrix.model }}.*
```

### Reusable Workflow

Create `.github/workflows/evalgate-reusable.yml`:

```yaml
name: Reusable EvalGate Workflow

on:
  workflow_call:
    inputs:
      config_path:
        required: false
        type: string
        default: '.github/evalgate.yml'
      python_version:
        required: false
        type: string
        default: '3.11'
      fail_on_regression:
        required: false
        type: boolean
        default: true
    secrets:
      OPENAI_API_KEY:
        required: false
      ANTHROPIC_API_KEY:
        required: false

jobs:
  evalgate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: actions/setup-python@v4
        with:
          python-version: ${{ inputs.python_version }}
      
      - name: Install EvalGate
        run: pip install evalgate[all]
      
      - name: Run Evaluation
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          evalgate run \
            --config ${{ inputs.config_path }} \
            --baseline-ref origin/main \
            --github-token $GITHUB_TOKEN \
            --pr-comment \
            ${{ inputs.fail_on_regression && '--fail-on-regression' || '' }}
```

Then use it in other repos:

```yaml
# .github/workflows/ai-quality.yml
name: AI Quality Check

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  evaluate:
    uses: ./.github/workflows/evalgate-reusable.yml
    with:
      config_path: '.github/evalgate.yml'
      fail_on_regression: true
    secrets:
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### Monorepo Support

```yaml
name: Monorepo EvalGate Evaluation

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      services: ${{ steps.changes.outputs.services }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          list-files: json
          filters: |
            user-service:
              - 'services/user-service/**'
              - 'shared/**'
            order-service:
              - 'services/order-service/**'
              - 'shared/**'
            notification-service:
              - 'services/notification-service/**'
              - 'shared/**'

  evaluate:
    needs: detect-changes
    runs-on: ubuntu-latest
    if: ${{ needs.detect-changes.outputs.services != '[]' }}
    strategy:
      matrix:
        service: ${{ fromJson(needs.detect-changes.outputs.services) }}
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install EvalGate
        run: pip install evalgate[all]
      
      - name: Run Service Evaluation
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          cd services/${{ matrix.service }}
          evalgate run \
            --config .evalgate.yml \
            --baseline-ref origin/main \
            --github-token $GITHUB_TOKEN \
            --pr-comment \
            --comment-prefix "[${{ matrix.service }}]" \
            --fail-on-regression
```

### Scheduled Baseline Updates

```yaml
name: Update EvalGate Baselines

on:
  schedule:
    # Run every Sunday at 2 AM UTC
    - cron: '0 2 * * 0'
  workflow_dispatch:  # Allow manual trigger

jobs:
  update-baselines:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install EvalGate
        run: pip install evalgate[all]
      
      - name: Update Baselines
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          # Run full evaluation suite
          evalgate run --config .github/evalgate.yml
          
          # Update baselines with latest results
          evalgate baseline update \
            --config .github/evalgate.yml \
            --commit-sha ${{ github.sha }} \
            --force
      
      - name: Commit Updated Baselines
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add eval/baselines/
          git diff --staged --quiet || git commit -m "chore: update EvalGate baselines [skip ci]"
          git push
```

## Advanced Features

### Custom GitHub Check Runs

```yaml
- name: Create Check Run
  uses: actions/github-script@v6
  if: always()
  with:
    script: |
      const fs = require('fs');
      const results = JSON.parse(fs.readFileSync('eval/results/summary.json', 'utf8'));
      
      await github.rest.checks.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        name: 'EvalGate AI Evaluation',
        head_sha: context.sha,
        status: 'completed',
        conclusion: results.passed ? 'success' : 'failure',
        output: {
          title: `EvalGate Evaluation ${results.passed ? 'Passed' : 'Failed'}`,
          summary: `Overall Score: ${results.overall_score.toFixed(3)}\n\n` +
                   `Evaluators: ${results.evaluator_count}\n` +
                   `Fixtures: ${results.fixture_count}\n` +
                   `Regressions: ${results.regressions || 0}`,
          text: results.details
        }
      });
```

### Slack/Teams Notifications

```yaml
- name: Notify on Regression
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: |
      🚨 EvalGate detected AI quality regressions in PR #${{ github.event.number }}
      
      Repository: ${{ github.repository }}
      Author: ${{ github.event.pull_request.user.login }}
      
      Please review the evaluation results and address the issues.
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Environment-Specific Configs

```yaml
- name: Select Config Based on Environment
  run: |
    if [[ "${{ github.base_ref }}" == "main" ]]; then
      CONFIG_FILE=".github/evalgate-production.yml"
    elif [[ "${{ github.base_ref }}" == "staging" ]]; then
      CONFIG_FILE=".github/evalgate-staging.yml"
    else
      CONFIG_FILE=".github/evalgate-dev.yml"
    fi
    echo "CONFIG_FILE=$CONFIG_FILE" >> $GITHUB_ENV

- name: Run Environment-Specific Evaluation
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  run: |
    evalgate run --config $CONFIG_FILE
```

## Troubleshooting

### Common Issues

**API Rate Limits:**
```yaml
- name: Handle Rate Limits
  run: |
    evalgate run \
      --config .github/evalgate.yml \
      --rate-limit-delay 1.0 \
      --max-retries 3 \
      --exponential-backoff
```

**Large Fixture Sets:**
```yaml
- name: Run with Sampling
  run: |
    evalgate run \
      --config .github/evalgate.yml \
      --sample-size 100 \
      --sample-strategy balanced
```

**Memory Issues:**
```yaml
- name: Run with Batching
  run: |
    evalgate run \
      --config .github/evalgate.yml \
      --batch-size 10 \
      --parallel-workers 2
```

### Debug Mode

```yaml
- name: Debug Evaluation
  env:
    EVALGATE_DEBUG: true
    EVALGATE_LOG_LEVEL: debug
  run: |
    evalgate run \
      --config .github/evalgate.yml \
      --verbose \
      --debug-output eval/debug/
```

## Security Best Practices

### API Key Management

1. **Use GitHub Secrets** - Never commit API keys to your repository
2. **Rotate Keys Regularly** - Update API keys periodically
3. **Limit Scope** - Use API keys with minimal required permissions
4. **Monitor Usage** - Track API usage to detect anomalies

### Data Privacy

```yaml
# Avoid logging sensitive data
- name: Run with Privacy Mode
  run: |
    evalgate run \
      --config .github/evalgate.yml \
      --no-log-fixtures \
      --no-log-outputs \
      --redact-api-keys
```

### Access Control

```yaml
# Limit to specific branches
on:
  pull_request:
    branches: [main, develop]
    types: [opened, synchronize]

# Require approval for external contributors
  evaluate:
    if: github.event.pull_request.head.repo.full_name == github.repository
    # ... rest of job
  
  evaluate-fork:
    if: github.event.pull_request.head.repo.full_name != github.repository
    environment: external-evaluation  # Requires manual approval
    # ... rest of job
```

## Next Steps

Once you have GitHub Actions integration working:

1. **[Set Up LLM Evaluation](llm-as-judge.md)** - Add AI-powered quality assessment
2. **[Configure Baseline Management](configuration.md#baselines)** - Set up regression detection
3. **[Create Custom Evaluators](evaluators.md)** - Build domain-specific validators
4. **[Optimize Performance](configuration.md#performance)** - Scale for larger teams

---

*EvalGate's GitHub Actions integration provides production-ready AI evaluation workflows that scale from individual developers to large engineering teams, ensuring consistent AI quality across all your releases.*

