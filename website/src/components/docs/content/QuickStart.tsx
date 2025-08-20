import { CheckCircle, Clock } from 'lucide-react';
import { CodeBlock, TerminalBlock } from '../CodeBlock';

export function QuickStart() {
  const fixtureExample = `{
  "input": { 
    "email_html": "<p>URGENT—refund needed before Friday</p>", 
    "thread_context": [] 
  },
  "expected": { 
    "priority": "P1", 
    "tags": ["billing", "refunds"], 
    "assignee": "queue:finance" 
  },
  "meta": { 
    "latency_ms": 950, 
    "cost_usd": 0.021 
  }
}`;

  const configExample = `budgets: { p95_latency_ms: 1200, max_cost_usd_per_item: 0.03 }
fixtures: { path: "eval/fixtures/**/*.json" }
outputs:  { path: ".evalgate/outputs/**/*.json" }
evaluators:
  - { name: json_formatting, type: schema, schema_path: "eval/schemas/queue_item.json", weight: 0.4 }
  - { name: priority_accuracy, type: category, expected_field: "priority", weight: 0.4 }
  - { name: latency_cost, type: budgets, weight: 0.2 }
gate: { min_overall_score: 0.90, allow_regression: false }
report: { pr_comment: true, artifact_path: ".evalgate/results.json" }
baseline: { ref: "origin/main" }
# EvalGate never collects telemetry
# telemetry: { mode: "local_only" }  # Not needed - EvalGate has zero telemetry`;

  return (
    <div>
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Quick Start Guide</h1>
        <p className="text-xl text-gray-600">
          Get EvalGate running in your project in under 10 minutes. Zero infrastructure required.
        </p>
      </div>

      {/* Time estimate */}
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-6 mb-8">
        <div className="flex items-center mb-3">
          <Clock className="h-5 w-5 text-violet-600 mr-2" />
          <h2 className="font-semibold text-violet-900">⚡ Estimated time: 8 minutes</h2>
        </div>
        <p className="text-violet-800">
          This guide assumes you have a GitHub repository and can run Python scripts.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-12">
        {/* Step 1 */}
        <section>
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">1</div>
            <h2 className="text-2xl font-bold text-gray-900">Test EvalGate locally</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Before setting up CI, let&apos;s make sure EvalGate works with your project locally.
          </p>
          
          <TerminalBlock
            commands={[
              'uvx --from evalgate evalgate init',
              'ls -la  # Check that .github/evalgate.yml was created'
            ]}
            className="mb-4"
          />
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The <code>init</code> command creates a basic configuration. 
              We&apos;ll customize it in the next steps.
            </p>
          </div>
        </section>

        {/* Step 2 */}
        <section>
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">2</div>
            <h2 className="text-2xl font-bold text-gray-900">Create test fixtures</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Create example inputs and expected outputs for your AI system.
          </p>
          
          <TerminalBlock
            commands={['mkdir -p eval/fixtures']}
            className="mb-4"
          />
          
          <p className="text-gray-600 mb-4">
            Create <code>eval/fixtures/cx_001.json</code>:
          </p>
          
          <CodeBlock
            code={fixtureExample}
            language="json"
            filename="eval/fixtures/cx_001.json"
            className="mb-4"
          />
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Customize this:</strong> Replace this example with your actual input/output structure.
              The <code>meta</code> section with latency and cost is optional.
            </p>
          </div>
        </section>

        {/* Step 3 */}
        <section>
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">3</div>
            <h2 className="text-2xl font-bold text-gray-900">Generate outputs</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Create a script that reads your fixtures and generates outputs using your AI system.
          </p>
          
          <TerminalBlock
            commands={[
              'mkdir -p .evalgate/outputs',
              'python scripts/predict.py --in eval/fixtures --out .evalgate/outputs'
            ]}
            className="mb-4"
          />
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Your script here:</strong> <code>scripts/predict.py</code> should read from 
              <code>eval/fixtures</code> and write JSON outputs to <code>.evalgate/outputs</code>. 
              Each output file should match a fixture filename (e.g., <code>cx_001.json</code>).
            </p>
          </div>
        </section>

        {/* Step 4 */}
        <section>
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">4</div>
            <h2 className="text-2xl font-bold text-gray-900">Configure EvalGate</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Update <code>.github/evalgate.yml</code> with your evaluation rules:
          </p>
          
          <CodeBlock
            code={configExample}
            language="yaml"
            filename=".github/evalgate.yml"
            className="mb-4"
          />
        </section>

        {/* Step 5 */}
        <section>
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">5</div>
            <h2 className="text-2xl font-bold text-gray-900">Test locally</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Run EvalGate locally to make sure everything works:
          </p>
          
          <TerminalBlock
            commands={[
              'uvx --from evalgate evalgate run --config .github/evalgate.yml',
              'uvx --from evalgate evalgate report --summary --artifact ./.evalgate/results.json'
            ]}
            className="mb-4"
          />
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-sm text-green-800">
                <strong>Success!</strong> If this runs without errors, you&apos;re ready for the next step.
              </p>
            </div>
          </div>
        </section>

        {/* Step 6 */}
        <section>
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">6</div>
            <h2 className="text-2xl font-bold text-gray-900">Establish baseline</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Commit your changes to main branch to establish the performance baseline. Future PRs will be compared against this.
          </p>
          
          <TerminalBlock
            commands={[
              'git add .',
              'git commit -m "Add EvalGate evaluation system"',
              'git push origin main'
            ]}
            className="mb-4"
          />
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> EvalGate compares PR results against the main branch baseline. 
              Setting <code>allow_regression: false</code> means PRs will be blocked if any evaluator scores drop, 
              preventing quality degradation over time.
            </p>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-900 mb-2">💡 Pro Tip: Progressive Quality Improvements</h4>
            <p className="text-sm text-emerald-800 mb-2">
              You can continuously raise the quality bar over time:
            </p>
            <ul className="text-sm text-emerald-800 space-y-1">
              <li>• <strong>Update baseline:</strong> When a PR achieves better scores, include the new results in that PR to raise the bar for future PRs</li>
              <li>• <strong>Quality ratcheting:</strong> Each improvement becomes the new minimum standard</li>
              <li>• <strong>Flexible approach:</strong> Or update baselines periodically by running evaluations on main branch</li>
            </ul>
          </div>
        </section>

        {/* Step 7 */}
        <section>
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">7</div>
            <h2 className="text-2xl font-bold text-gray-900">Add GitHub Actions</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Create <code>.github/workflows/evalgate.yml</code>:
          </p>
          
          <CodeBlock
            code={`name: EvalGate
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

      - name: Install uv
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Generate outputs
        run: |
          python scripts/predict.py --in eval/fixtures --out .evalgate/outputs

      - name: Run EvalGate
        run: |
          uvx --from evalgate evalgate run --config .github/evalgate.yml

      - name: Report results
        if: always()
        run: |
          uvx --from evalgate evalgate report --summary --artifact ./.evalgate/results.json`}
            language="yaml"
            filename=".github/workflows/evalgate.yml"
            className="mb-6"
          />
        </section>
      </div>

      {/* Success section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-8 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🎉 You&apos;re all set!</h2>
        <p className="text-gray-600">
          Create a PR and EvalGate will automatically evaluate your changes against the baseline, 
          posting a detailed summary comment with scores and any failures.
        </p>
      </div>
    </div>
  );
}
