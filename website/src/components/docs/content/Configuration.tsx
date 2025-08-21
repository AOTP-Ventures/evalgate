import { Settings, FileText, Target, GitBranch, BarChart3, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { CodeBlock } from '../CodeBlock';

export function Configuration() {
  const basicConfig = `# Basic EvalGate Configuration
budgets:
  p95_latency_ms: 1200
  max_cost_usd_per_item: 0.03

fixtures:
  path: "eval/fixtures/**/*.json"

outputs:
  path: ".evalgate/outputs/**/*.json"

evaluators:
  - name: json_formatting
    type: schema
    schema_path: "eval/schemas/queue_item.json"
    weight: 0.4
    enabled: true
  
  - name: priority_accuracy
    type: category
    expected_field: "priority"
    weight: 0.4
    enabled: true
  
  - name: latency_cost
    type: budgets
    weight: 0.2
    enabled: true

gate:
  min_overall_score: 0.90
  allow_regression: false

report:
  pr_comment: true
  artifact_path: ".evalgate/results.json"

baseline:
  ref: "origin/main"

telemetry:
  mode: "local_only"`;

  const llmConfig = `# LLM Evaluator Configuration
evaluators:
  - name: content_quality
    type: llm
    provider: openai        # openai | anthropic | azure | local
    model: "gpt-4"          # Model name
    prompt_path: "eval/prompts/quality_judge.txt"
    api_key_env_var: "OPENAI_API_KEY"
    base_url: null          # For custom endpoints
    temperature: 0.1        # Consistent evaluation
    max_tokens: 1000        # Response length limit
    weight: 0.3
    enabled: true`;

  const gateConfig = `# Gate Configuration Examples

# Strict quality gate
gate:
  min_overall_score: 0.95
  allow_regression: false

# Lenient gate for development
gate:
  min_overall_score: 0.70
  allow_regression: true

# Production-ready gate
gate:
  min_overall_score: 0.90
  allow_regression: false`;

  const multiEnvConfig = `# Multi-Environment Configuration
# Production config
budgets:
  p95_latency_ms: 500      # Strict latency
  max_cost_usd_per_item: 0.01  # Cost control

gate:
  min_overall_score: 0.95
  allow_regression: false

# Development config  
# budgets:
#   p95_latency_ms: 2000   # Relaxed for dev
#   max_cost_usd_per_item: 0.05
# gate:
#   min_overall_score: 0.75
#   allow_regression: true`;

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Configuration</h1>
      <p className="text-xl text-gray-600 mb-12">
        Complete reference for configuring EvalGate with all available options and best practices.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Configuration Overview</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">📝 Configuration File</h3>
          <p className="text-blue-800 text-sm">
            EvalGate uses a YAML configuration file located at <code>.github/evalgate.yml</code>. 
            This file defines all evaluation rules, thresholds, and behavior settings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <Target className="h-6 w-6 text-violet-600 mr-3" />
              <h3 className="font-semibold text-gray-900">Required Sections</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code>budgets</code> - Performance limits</li>
              <li>• <code>fixtures</code> - Test data location</li>
              <li>• <code>outputs</code> - Generated results location</li>
              <li>• <code>evaluators</code> - Evaluation rules</li>
            </ul>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <Settings className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="font-semibold text-gray-900">Optional Sections</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code>gate</code> - Quality thresholds (has defaults)</li>
              <li>• <code>report</code> - Output settings (has defaults)</li>
              <li>• <code>baseline</code> - Comparison reference (has defaults)</li>
              <li>• <code>telemetry</code> - Data collection (has defaults)</li>
            </ul>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Complete Example</h4>
          <CodeBlock
            code={basicConfig}
            language="yaml"
            filename=".github/evalgate.yml"
          />
        </div>
      </section>

      {/* Section Reference */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Section Reference</h2>
        
        {/* Budgets */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-6 w-6 text-yellow-600 mr-3" />
            Budgets
          </h3>
          <p className="text-gray-600 mb-4">
            Define performance limits for latency and cost. These are used by the budget evaluator.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <CodeBlock
              code={`budgets:
  p95_latency_ms: 1200        # P95 latency limit in milliseconds
  max_cost_usd_per_item: 0.03 # Maximum cost per request in USD`}
              language="yaml"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Parameters</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <code>p95_latency_ms</code>: Maximum acceptable P95 latency (integer, ≥ 1)</li>
                <li>• <code>max_cost_usd_per_item</code>: Maximum cost per evaluation (float, ≥ 0)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Usage</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Referenced by budget evaluator</li>
                <li>• Scores degrade gracefully when exceeded</li>
                <li>• Prevents performance regressions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Fixtures & Outputs */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-3" />
            Fixtures & Outputs
          </h3>
          <p className="text-gray-600 mb-4">
            Specify where to find test fixtures and generated outputs using glob patterns.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <CodeBlock
              code={`fixtures:
  path: "eval/fixtures/**/*.json"  # Glob pattern for fixture files

outputs:
  path: ".evalgate/outputs/**/*.json"  # Glob pattern for output files`}
              language="yaml"
            />
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              <strong>Important:</strong> Output filenames must match fixture filenames (e.g., <code>cx_001.json</code>) 
              for EvalGate to correlate them correctly.
            </p>
          </div>
        </div>

        {/* Evaluators */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            Evaluators
          </h3>
          <p className="text-gray-600 mb-4">
            Define the evaluation rules that will assess your outputs. Each evaluator has a type and specific configuration.
          </p>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Common Parameters</h4>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• <code>name</code>: Unique identifier for the evaluator (required)</li>
                  <li>• <code>type</code>: Evaluator type - &quot;schema&quot;, &quot;category&quot;, &quot;budgets&quot;, or &quot;llm&quot; (required)</li>
                  <li>• <code>weight</code>: Importance in overall score, 0.0-1.0 (default: 1.0)</li>
                  <li>• <code>enabled</code>: Whether to run this evaluator (default: true)</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Type-Specific Parameters</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Schema Evaluator</h5>
                  <ul className="text-gray-600 space-y-1">
                    <li>• <code>schema_path</code>: Path to JSON Schema file</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Category Evaluator</h5>
                  <ul className="text-gray-600 space-y-1">
                    <li>• <code>expected_field</code>: Field name to compare</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Budget Evaluator</h5>
                  <ul className="text-gray-600 space-y-1">
                    <li>• No additional parameters</li>
                    <li>• Uses budgets section</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">LLM Evaluator</h5>
                  <ul className="text-gray-600 space-y-1">
                    <li>• <code>provider</code>: openai, anthropic, azure, local</li>
                    <li>• <code>model</code>: Model name (e.g., &quot;gpt-4&quot;)</li>
                    <li>• <code>prompt_path</code>: Path to prompt template</li>
                    <li>• <code>api_key_env_var</code>: Environment variable name</li>
                    <li>• <code>base_url</code>: Custom endpoint URL (optional)</li>
                    <li>• <code>temperature</code>: Sampling temperature (default: 0.1)</li>
                    <li>• <code>max_tokens</code>: Response limit (default: 1000)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">LLM Evaluator Example</h4>
            <CodeBlock
              code={llmConfig}
              language="yaml"
              filename="LLM evaluator configuration"
            />
          </div>
        </div>

        {/* Gate */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="h-6 w-6 text-red-600 mr-3" />
            Gate
          </h3>
          <p className="text-gray-600 mb-4">
            Configure quality gates that determine when to block PR merges.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <CodeBlock
              code={`gate:
  min_overall_score: 0.90    # Minimum weighted average score (0.0-1.0)
  allow_regression: false    # Whether to allow score decreases vs baseline`}
              language="yaml"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Parameters</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <code>min_overall_score</code>: Minimum weighted average score (default: 0.9)</li>
                <li>• <code>allow_regression</code>: Allow scores to decrease vs baseline (default: false)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Behavior</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• PR blocked if overall score &lt; minimum</li>
                <li>• PR blocked if any evaluator regresses (when allow_regression: false)</li>
                <li>• Both conditions must pass</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Gate Configuration Examples</h4>
            <CodeBlock
              code={gateConfig}
              language="yaml"
              filename="Different gate configurations"
            />
          </div>
        </div>

        {/* Report */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="h-6 w-6 text-purple-600 mr-3" />
            Report
          </h3>
          <p className="text-gray-600 mb-4">
            Configure how EvalGate reports results and where to store artifacts.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <CodeBlock
              code={`report:
  pr_comment: true                      # Post results as PR comment
  artifact_path: ".evalgate/results.json"  # Where to store detailed results`}
              language="yaml"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Parameters</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <code>pr_comment</code>: Post summary to PR (default: true)</li>
                <li>• <code>artifact_path</code>: Results JSON location (default: &quot;.evalgate/results.json&quot;)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Artifacts</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• JSON contains detailed scores and failures</li>
                <li>• Used for baseline comparisons</li>
                <li>• Can be uploaded as GitHub Actions artifact</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Baseline */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <GitBranch className="h-6 w-6 text-blue-600 mr-3" />
            Baseline
          </h3>
          <p className="text-gray-600 mb-4">
            Configure which branch/commit to compare against for regression detection.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <CodeBlock
              code={`baseline:
  ref: "origin/main"  # Git reference to compare against`}
              language="yaml"
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>How it works:</strong> EvalGate loads the results.json file from the specified Git reference 
              and compares current scores against those baseline scores to detect regressions.
            </p>
          </div>
        </div>

        {/* Telemetry */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-6 w-6 text-gray-600 mr-3" />
            Telemetry
          </h3>
          <p className="text-gray-600 mb-4">
            EvalGate has zero telemetry by default. This section exists for completeness but isn&apos;t needed.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <CodeBlock
              code={`telemetry:
  mode: "local_only"  # Always local_only - no data is ever sent`}
              language="yaml"
            />
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              <strong>🔒 Privacy:</strong> EvalGate never collects or transmits any data. 
              Everything runs locally in your CI environment with complete privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Patterns */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Patterns</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-Environment Configuration</h3>
            <p className="text-gray-600 mb-4">
              Use different settings for different environments by maintaining separate config files or using comments.
            </p>
            <CodeBlock
              code={multiEnvConfig}
              language="yaml"
              filename="Multi-environment setup"
            />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Weight Distribution Best Practices</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">💡 Recommended Weight Distribution</h4>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• <strong>Schema validation:</strong> 20-30% (catch format errors early)</li>
                <li>• <strong>Category accuracy:</strong> 30-40% (core business logic)</li>
                <li>• <strong>Budget monitoring:</strong> 10-20% (performance gates)</li>
                <li>• <strong>LLM evaluation:</strong> 20-40% (quality assessment)</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Progressive Quality Gates</h3>
            <p className="text-gray-600 mb-4">
              Start with lenient gates and progressively tighten them as your system improves.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Phase 1: Initial</h4>
                <code className="text-gray-600">min_overall_score: 0.70</code>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Phase 2: Stable</h4>
                <code className="text-gray-600">min_overall_score: 0.85</code>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Phase 3: Production</h4>
                <code className="text-gray-600">min_overall_score: 0.95</code>
              </div>
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
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              Common Configuration Errors
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Weight validation:</strong> Evaluator weights must be between 0.0 and 1.0</li>
              <li>• <strong>Missing schema file:</strong> Check that schema_path points to an existing file</li>
              <li>• <strong>Glob pattern issues:</strong> Ensure fixture/output paths use correct glob syntax</li>
              <li>• <strong>LLM API key:</strong> Verify environment variable is set and accessible</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Validation Tips
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Run <code>evalgate run --config .github/evalgate.yml</code> locally to test</li>
              <li>• Check YAML syntax with online validators</li>
              <li>• Start with a minimal config and add complexity gradually</li>
              <li>• Use descriptive evaluator names for easier debugging</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg hover:border-violet-300 transition-colors">
            <h3 className="font-semibold text-gray-900 mb-2">📝 Test Fixtures Guide</h3>
            <p className="text-gray-600 text-sm mb-3">Learn how to create and organize test fixtures with input/expected/meta structure.</p>
            <Link href="/docs/concepts/fixtures" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
              Explore fixtures →
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
