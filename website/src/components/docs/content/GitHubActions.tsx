import { GitBranch, Shield, AlertCircle, CheckCircle, Settings, Lock, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { CodeBlock, TerminalBlock } from '../CodeBlock';

export function GitHubActions() {
  const basicWorkflow = `name: EvalGate
on: [pull_request]

jobs:
  evalgate:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      - name: Generate outputs
        run: python scripts/predict.py --in eval/fixtures --out .evalgate/outputs

      - name: Run EvalGate
        run: uvx --from evalgate evalgate run --config .github/evalgate.yml

      - name: Report results
        if: always()
        run: uvx --from evalgate evalgate report --summary --artifact ./.evalgate/results.json`;

  const advancedWorkflow = `name: EvalGate with Advanced Features
on:
  pull_request:
    types: [opened, synchronize, ready_for_review]
  push:
    branches: [main]  # Update baseline on main

env:
  PYTHON_VERSION: '3.11'
  UV_CACHE_DIR: /tmp/.uv-cache

jobs:
  evalgate:
    runs-on: ubuntu-latest
    if: github.event.pull_request.draft == false  # Skip draft PRs
    permissions:
      contents: read
      pull-requests: write
      checks: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for baseline comparison
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: \${{ env.PYTHON_VERSION }}

      - name: Install and configure uv
        run: |
          curl -LsSf https://astral.sh/uv/install.sh | sh
          echo "$HOME/.local/bin" >> $GITHUB_PATH

      - name: Cache uv
        uses: actions/cache@v3
        with:
          path: /tmp/.uv-cache
          key: uv-\${{ runner.os }}-\${{ hashFiles('**/pyproject.toml', '**/requirements.txt') }}
          restore-keys: |
            uv-\${{ runner.os }}-

      - name: Install dependencies
        run: |
          uv pip install --system -r requirements.txt

      - name: Generate AI outputs
        run: |
          python scripts/predict.py \
            --input eval/fixtures \
            --output .evalgate/outputs \
            --model-config config/model.yaml

      - name: Run EvalGate evaluation
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          uvx --from evalgate[llm] evalgate run \
            --config .github/evalgate.yml \
            --output-dir .evalgate \
            --verbose

      - name: Upload evaluation artifacts
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: evalgate-results-\${{ github.event.number }}
          path: |
            .evalgate/results.json
            .evalgate/detailed-report.html
          retention-days: 30

      - name: Generate and post PR comment
        if: github.event_name == 'pull_request'
        run: |
          uvx --from evalgate evalgate report \
            --format github-comment \
            --artifact .evalgate/results.json \
            --pr-number \${{ github.event.number }} \
            --repo \${{ github.repository }}

      - name: Update baseline (main branch only)
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          cp .evalgate/results.json .evalgate/baseline.json
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .evalgate/baseline.json
          git diff --staged --quiet || git commit -m "Update EvalGate baseline [skip ci]"
          git push`;

  const matrixWorkflow = `name: EvalGate Multi-Model Testing
on: [pull_request]

jobs:
  evalgate:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    strategy:
      matrix:
        model: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet']
        include:
          - model: 'gpt-4'
            config: '.github/evalgate-gpt4.yml'
          - model: 'gpt-3.5-turbo'
            config: '.github/evalgate-gpt35.yml'
          - model: 'claude-3-sonnet'
            config: '.github/evalgate-claude.yml'
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      - name: Generate outputs for \${{ matrix.model }}
        run: |
          python scripts/predict.py \
            --model \${{ matrix.model }} \
            --input eval/fixtures \
            --output .evalgate/outputs-\${{ matrix.model }}

      - name: Run EvalGate for \${{ matrix.model }}
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          uvx --from evalgate[llm] evalgate run \
            --config \${{ matrix.config }} \
            --output-dir .evalgate/results-\${{ matrix.model }}

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: evalgate-\${{ matrix.model }}
          path: .evalgate/results-\${{ matrix.model }}/`;

  const reusableWorkflow = `# .github/workflows/evalgate-reusable.yml
name: Reusable EvalGate Workflow

on:
  workflow_call:
    inputs:
      config-file:
        required: true
        type: string
        description: 'Path to EvalGate config file'
      model-name:
        required: false
        type: string
        default: 'default'
        description: 'Model name for output directory'
      python-version:
        required: false
        type: string
        default: '3.11'
    secrets:
      OPENAI_API_KEY:
        required: false
      ANTHROPIC_API_KEY:
        required: false

jobs:
  evalgate:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: \${{ inputs.python-version }}

      - name: Generate outputs
        run: |
          python scripts/predict.py \
            --model \${{ inputs.model-name }} \
            --input eval/fixtures \
            --output .evalgate/outputs

      - name: Run EvalGate
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          uvx --from evalgate[llm] evalgate run \
            --config \${{ inputs.config-file }}

      - name: Report results
        if: always()
        run: |
          uvx --from evalgate evalgate report \
            --format github-comment \
            --artifact .evalgate/results.json`;

  const callerWorkflow = `# Main workflow using the reusable workflow
name: EvalGate
on: [pull_request]

jobs:
  production-model:
    uses: ./.github/workflows/evalgate-reusable.yml
    with:
      config-file: '.github/evalgate-prod.yml'
      model-name: 'gpt-4'
    secrets:
      OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}

  experimental-model:
    uses: ./.github/workflows/evalgate-reusable.yml
    with:
      config-file: '.github/evalgate-experimental.yml'
      model-name: 'claude-3-sonnet'
    secrets:
      ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}`;

  const monorepoWorkflow = `name: EvalGate Monorepo
on:
  pull_request:
    paths:
      - 'services/chatbot/**'
      - 'services/classifier/**'
      - 'eval/**'
      - '.github/evalgate*.yml'

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      chatbot: \${{ steps.changes.outputs.chatbot }}
      classifier: \${{ steps.changes.outputs.classifier }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            chatbot:
              - 'services/chatbot/**'
            classifier:
              - 'services/classifier/**'

  evalgate-chatbot:
    needs: detect-changes
    if: needs.detect-changes.outputs.chatbot == 'true'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      
      - name: Generate chatbot outputs
        run: |
          python services/chatbot/predict.py \
            --input eval/fixtures/chatbot \
            --output .evalgate/outputs/chatbot
      
      - name: Run EvalGate for chatbot
        run: |
          uvx --from evalgate[llm] evalgate run \
            --config .github/evalgate-chatbot.yml

  evalgate-classifier:
    needs: detect-changes
    if: needs.detect-changes.outputs.classifier == 'true'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      
      - name: Generate classifier outputs
        run: |
          python services/classifier/predict.py \
            --input eval/fixtures/classifier \
            --output .evalgate/outputs/classifier
      
      - name: Run EvalGate for classifier
        run: |
          uvx --from evalgate[llm] evalgate run \
            --config .github/evalgate-classifier.yml`;

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">GitHub Actions Integration</h1>
      <p className="text-xl text-gray-600 mb-12">
        Automate AI evaluation in your CI/CD pipeline with comprehensive GitHub Actions workflows.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Why GitHub Actions?</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">🚀 Automated Quality Gates</h3>
          <p className="text-blue-800 text-sm">
            EvalGate integrates seamlessly with GitHub Actions to automatically evaluate every pull request, 
            preventing quality regressions and ensuring consistent AI performance across your team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">✅ Key Benefits</h3>
            <ul className="text-gray-600 space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Automatic evaluation on every PR
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Baseline comparison and regression detection
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Detailed PR comments with scores and insights
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Zero-setup LLM evaluation with secure API keys
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Multi-model and matrix testing support
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">🔄 Workflow Types</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• <strong>Basic:</strong> Simple PR evaluation</li>
              <li>• <strong>Advanced:</strong> Caching, artifacts, baseline updates</li>
              <li>• <strong>Matrix:</strong> Multi-model testing</li>
              <li>• <strong>Reusable:</strong> Shared workflows across repos</li>
              <li>• <strong>Monorepo:</strong> Service-specific evaluation</li>
              <li>• <strong>Scheduled:</strong> Periodic baseline updates</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Quick Setup */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Setup</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <GitBranch className="h-6 w-6 text-green-600 mr-3" />
              1. Basic Workflow
            </h3>
            <p className="text-gray-600 mb-4">
              Create <code>.github/workflows/evalgate.yml</code> for automatic PR evaluation:
            </p>
            <CodeBlock
              code={basicWorkflow}
              language="yaml"
              filename=".github/workflows/evalgate.yml"
            />
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-green-900 mb-2">✨ What this does:</h4>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Triggers on every pull request</li>
                <li>• Generates AI outputs from your fixtures</li>
                <li>• Runs EvalGate evaluation with baseline comparison</li>
                <li>• Posts detailed results as a PR comment</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Settings className="h-6 w-6 text-blue-600 mr-3" />
              2. Required Permissions
            </h3>
            <p className="text-gray-600 mb-4">
              Your workflow needs these permissions to function properly:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="text-sm text-gray-600 space-y-3">
                <li>• <code className="bg-white px-2 py-1 rounded">contents: read</code> - Access repository files</li>
                <li>• <code className="bg-white px-2 py-1 rounded">pull-requests: write</code> - Post PR comments</li>
                <li>• <code className="bg-white px-2 py-1 rounded">checks: write</code> - Create status checks (optional)</li>
                <li>• <code className="bg-white px-2 py-1 rounded">fetch-depth: 0</code> - Full git history for baseline comparison</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Lock className="h-6 w-6 text-yellow-600 mr-3" />
              3. API Keys Setup
            </h3>
            <p className="text-gray-600 mb-4">
              Add your LLM provider API keys as repository secrets:
            </p>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">Repository Settings → Secrets and variables → Actions</h4>
                <ul className="text-amber-800 text-sm space-y-1">
                  <li>• <code>OPENAI_API_KEY</code> - Your OpenAI API key</li>
                  <li>• <code>ANTHROPIC_API_KEY</code> - Your Anthropic API key</li>
                  <li>• <code>AZURE_API_KEY</code> - Your Azure OpenAI key (if using)</li>
                </ul>
              </div>
              <TerminalBlock
                commands={[
                  '# Test API keys locally first',
                  'export OPENAI_API_KEY="your-key-here"',
                  'uvx --from evalgate[llm] evalgate run --config .github/evalgate.yml'
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Workflows */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Workflows</h2>
        
        <div className="space-y-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Production-Ready Workflow</h3>
            <p className="text-gray-600 mb-4">
              Enhanced workflow with caching, artifacts, baseline management, and performance optimizations:
            </p>
            <CodeBlock
              code={advancedWorkflow}
              language="yaml"
              filename=".github/workflows/evalgate-advanced.yml"
            />
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🎯 Advanced Features</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Skip draft PRs</li>
                  <li>• UV package manager caching</li>
                  <li>• Artifact upload for debugging</li>
                  <li>• Automatic baseline updates on main</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">⚡ Performance</h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• Cached dependencies</li>
                  <li>• Parallel LLM evaluation</li>
                  <li>• Optimized checkout</li>
                  <li>• Efficient baseline comparison</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-Model Testing Pattern</h3>
            <p className="text-gray-600 mb-4">
              You can use GitHub Actions matrix strategy to test different models separately. 
              Each matrix job runs EvalGate independently with different model outputs:
            </p>
            <CodeBlock
              code={matrixWorkflow}
              language="yaml"
              filename=".github/workflows/evalgate-matrix.yml"
            />
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-purple-900 mb-2">🔬 Matrix Strategy Benefits</h4>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• Test multiple models in parallel using GitHub Actions</li>
                <li>• Each model gets its own EvalGate configuration and evaluation</li>
                <li>• Separate pass/fail status for each model variant</li>
                <li>• Individual PR comments and artifacts per model</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-amber-900 mb-2">⚠️ Important Note</h4>
              <p className="text-amber-800 text-sm">
                This matrix approach runs separate EvalGate evaluations for each model. 
                Each evaluation is independent - EvalGate doesn&apos;t currently provide built-in model comparison features.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reusable Workflows</h3>
            <p className="text-gray-600 mb-4">
              Create shared workflows to maintain consistency across multiple repositories:
            </p>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Reusable Workflow Definition</h4>
                <CodeBlock
                  code={reusableWorkflow}
                  language="yaml"
                  filename=".github/workflows/evalgate-reusable.yml"
                />
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Using the Reusable Workflow</h4>
                <CodeBlock
                  code={callerWorkflow}
                  language="yaml"
                  filename=".github/workflows/evalgate.yml"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Monorepo & Path-Based Triggers</h3>
            <p className="text-gray-600 mb-4">
              Smart evaluation that only runs when relevant services change:
            </p>
            <CodeBlock
              code={monorepoWorkflow}
              language="yaml"
              filename=".github/workflows/evalgate-monorepo.yml"
            />
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">🏗️ Monorepo Strategy</h4>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Path-based change detection</li>
                <li>• Service-specific evaluations</li>
                <li>• Conditional job execution</li>
                <li>• Independent baseline tracking per service</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Practices</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="border border-green-200 bg-green-50 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Performance Optimization
              </h3>
              <ul className="text-green-800 text-sm space-y-2">
                <li>• Use <code>uv</code> for faster Python package management</li>
                <li>• Cache dependencies with <code>actions/cache</code></li>
                <li>• Skip draft PRs with conditional triggers</li>
                <li>• Use <code>if: always()</code> for result reporting</li>
                <li>• Minimize <code>fetch-depth</code> when possible</li>
                <li>• Upload artifacts only when needed</li>
              </ul>
            </div>
            
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security & Secrets
              </h3>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• Never commit API keys to code</li>
                <li>• Use repository secrets for sensitive data</li>
                <li>• Rotate API keys regularly</li>
                <li>• Limit workflow permissions to minimum required</li>
                <li>• Use <code>GITHUB_TOKEN</code> for GitHub API calls</li>
                <li>• Validate secret availability in workflows</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-6">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Baseline Management
              </h3>
              <ul className="text-amber-800 text-sm space-y-2">
                <li>• Update baselines automatically on main branch</li>
                <li>• Consider manual baseline updates for major changes</li>
                <li>• Use <code>[skip ci]</code> to avoid recursive triggers</li>
                <li>• Track baseline history with git commits</li>
                <li>• Set appropriate <code>allow_regression</code> policies</li>
                <li>• Monitor baseline drift over time</li>
              </ul>
            </div>
            
            <div className="border border-purple-200 bg-purple-50 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Cost Management
              </h3>
              <ul className="text-purple-800 text-sm space-y-2">
                <li>• Monitor LLM API usage and costs</li>
                <li>• Use cheaper models for quick feedback</li>
                <li>• Implement job timeouts to prevent runaway costs</li>
                <li>• Consider local models for high-volume testing</li>
                <li>• Cache expensive evaluations when possible</li>
                <li>• Set up cost alerts and budgets</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Troubleshooting</h2>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              Common Issues
            </h4>
            <div className="space-y-4 text-sm">
              <div>
                <strong className="text-gray-900">Workflow not triggering:</strong>
                <ul className="text-gray-600 mt-1 space-y-1">
                  <li>• Check file path: must be <code>.github/workflows/evalgate.yml</code></li>
                  <li>• Verify YAML syntax with online validators</li>
                  <li>• Ensure correct branch permissions and triggers</li>
                </ul>
              </div>
              <div>
                <strong className="text-gray-900">Permission errors:</strong>
                <ul className="text-gray-600 mt-1 space-y-1">
                  <li>• Add <code>pull-requests: write</code> permission</li>
                  <li>• Check repository settings allow GitHub Actions</li>
                  <li>• Verify token scopes for private repositories</li>
                </ul>
              </div>
              <div>
                <strong className="text-gray-900">API key issues:</strong>
                <ul className="text-gray-600 mt-1 space-y-1">
                  <li>• Ensure secrets are set in repository settings</li>
                  <li>• Check secret names match environment variables</li>
                  <li>• Test API keys locally before committing workflow</li>
                </ul>
              </div>
              <div>
                <strong className="text-gray-900">Baseline comparison failures:</strong>
                <ul className="text-gray-600 mt-1 space-y-1">
                  <li>• Use <code>fetch-depth: 0</code> for full git history</li>
                  <li>• Ensure baseline exists on main branch</li>
                  <li>• Check <code>.evalgate/baseline.json</code> file format</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Debugging Steps
            </h4>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>1. <strong>Test locally first:</strong> Run EvalGate on your machine before pushing</li>
              <li>2. <strong>Check workflow logs:</strong> Review detailed GitHub Actions logs for errors</li>
              <li>3. <strong>Validate configuration:</strong> Ensure <code>.github/evalgate.yml</code> is valid</li>
              <li>4. <strong>Verify file paths:</strong> Check that fixture and output paths exist</li>
              <li>5. <strong>Test API connectivity:</strong> Verify LLM provider API access</li>
              <li>6. <strong>Start minimal:</strong> Begin with basic workflow, add complexity gradually</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg hover:border-violet-300 transition-colors">
            <h3 className="font-semibold text-gray-900 mb-2">⚙️ Configuration Reference</h3>
            <p className="text-gray-600 text-sm mb-3">Complete guide to EvalGate configuration options and evaluator settings.</p>
            <Link href="/docs/concepts/configuration" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
              Explore configuration →
            </Link>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg hover:border-violet-300 transition-colors">
            <h3 className="font-semibold text-gray-900 mb-2">🧠 LLM as Judge</h3>
            <p className="text-gray-600 text-sm mb-3">Set up AI-powered evaluation for complex, subjective quality criteria.</p>
            <Link href="/docs/advanced/llm-as-judge" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
              Learn LLM evaluation →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
