import { CheckCircle, Brain, DollarSign, FileCheck, Settings, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { CodeBlock } from '../CodeBlock';

export function Evaluators() {
  const schemaEvaluatorExample = `# Schema evaluator validates JSON structure
evaluators:
  - name: json_formatting
    type: schema
    schema_path: "eval/schemas/queue_item.json"
    weight: 0.3
    enabled: true`;

  const categoryEvaluatorExample = `# Category evaluator checks exact field matches
evaluators:
  - name: priority_accuracy
    type: category
    expected_field: "priority"  # Field to compare
    weight: 0.4
    enabled: true`;

  const budgetEvaluatorExample = `# Budget evaluator monitors performance
budgets: 
  p95_latency_ms: 1200
  max_cost_usd_per_item: 0.03

evaluators:
  - name: latency_cost
    type: budgets
    weight: 0.2
    enabled: true`;

  const llmEvaluatorExample = `# LLM evaluator uses AI for complex criteria
evaluators:
  - name: content_quality
    type: llm
    provider: openai         # openai | anthropic | azure | local
    model: "gpt-4"           # Model to use
    prompt_path: "eval/prompts/quality_judge.txt"
    api_key_env_var: "OPENAI_API_KEY"
    temperature: 0.1         # Consistent evaluation
    max_tokens: 1000         # Response limit
    weight: 0.3
    enabled: true`;

  const examplePrompt = `You are evaluating the quality of customer support ticket classification.

Evaluate the generated output based on these criteria:
1. Accuracy of priority assignment
2. Relevance of assigned tags
3. Appropriateness of assignee selection
4. Overall coherence and completeness

INPUT:
{input}

EXPECTED OUTPUT:
{expected}

GENERATED OUTPUT:
{output}

Provide a score from 0.0 to 1.0 where:
- 1.0 = Perfect match with expected output, excellent quality
- 0.8 = Very good, minor differences acceptable
- 0.6 = Good, some issues but generally correct
- 0.4 = Fair, several problems but salvageable
- 0.2 = Poor, major issues
- 0.0 = Completely incorrect or missing

Score: [your score]

Justification: [brief explanation of your score]`;

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Evaluators</h1>
      <p className="text-xl text-gray-600 mb-12">
        Understanding the four types of evaluators available in EvalGate and how to configure them for your use case.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Evaluator Types</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <FileCheck className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="font-semibold text-gray-900">Schema</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">Validates JSON structure and data types</p>
            <div className="text-xs text-gray-500">Fast • Deterministic • Catches format errors</div>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="font-semibold text-gray-900">Category</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">Exact field matching for classification tasks</p>
            <div className="text-xs text-gray-500">Fast • Deterministic • Perfect for labels</div>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <DollarSign className="h-6 w-6 text-yellow-600 mr-3" />
              <h3 className="font-semibold text-gray-900">Budgets</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">Monitors latency and cost performance</p>
            <div className="text-xs text-gray-500">Fast • Deterministic • Performance gates</div>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <Brain className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="font-semibold text-gray-900">LLM</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">AI-powered evaluation for complex criteria</p>
            <div className="text-xs text-gray-500">Flexible • Subjective • Quality assessment</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Evaluation Strategy</h3>
          <p className="text-blue-800 text-sm">
            Use deterministic evaluators (schema, category, budgets) for fast, reliable checks that catch obvious problems. 
            Add LLM evaluators for nuanced quality assessment that requires human-like judgment.
          </p>
        </div>
      </section>

      {/* Schema Evaluator */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Schema Evaluator</h2>
        
        <p className="text-gray-600 mb-6">
          Validates that your outputs conform to a JSON Schema. Perfect for ensuring data structure consistency.
        </p>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Configuration</h4>
            <CodeBlock
              code={schemaEvaluatorExample}
              language="yaml"
              filename=".github/evalgate.yml"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">✅ What it checks</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Required fields are present</li>
                <li>• Data types match (string, number, array)</li>
                <li>• Value constraints (min/max, enum values)</li>
                <li>• Array item structure</li>
                <li>• String patterns and formats</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">⚙️ Configuration options</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <code>schema_path</code>: Path to JSON Schema file</li>
                <li>• <code>weight</code>: Importance in overall score</li>
                <li>• <code>enabled</code>: Enable/disable evaluator</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Category Evaluator */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Category Evaluator</h2>
        
        <p className="text-gray-600 mb-6">
          Compares a specific field in your output against the expected value from fixtures. 
          Ideal for classification tasks.
        </p>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Configuration</h4>
            <CodeBlock
              code={categoryEvaluatorExample}
              language="yaml"
              filename=".github/evalgate.yml"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Example: Priority Classification</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700 mb-2">Expected (from fixture):</div>
                <code className="text-green-700 bg-green-100 px-2 py-1 rounded">{"\"priority\": \"P1\""}</code>
              </div>
              <div>
                <div className="font-medium text-gray-700 mb-2">Generated output:</div>
                <code className="text-blue-700 bg-blue-100 px-2 py-1 rounded">{"\"priority\": \"P1\""}</code>
              </div>
            </div>
            <div className="mt-3 text-green-600 font-medium">✅ Match! Score: 1.0</div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">🎯 Best for</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Priority/urgency classification</li>
                <li>• Category assignment</li>
                <li>• Status determination</li>
                <li>• Binary yes/no decisions</li>
                <li>• Routing decisions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">⚙️ Configuration options</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <code>expected_field</code>: Field name to compare</li>
                <li>• <code>weight</code>: Importance in overall score</li>
                <li>• <code>enabled</code>: Enable/disable evaluator</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Budget Evaluator */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Budget Evaluator</h2>
        
        <p className="text-gray-600 mb-6">
          Monitors performance metrics from the <code>meta</code> section of your fixtures. 
          Ensures your system stays within latency and cost budgets.
        </p>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Configuration</h4>
            <CodeBlock
              code={budgetEvaluatorExample}
              language="yaml"
              filename=".github/evalgate.yml"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h4 className="font-semibold text-amber-900 mb-3">📊 How it works</h4>
            <div className="text-amber-800 text-sm space-y-2">
              <div>• <strong>Latency:</strong> Calculates P95 latency from all fixtures</div>
              <div>• <strong>Cost:</strong> Calculates average cost per item</div>
              <div>• <strong>Scoring:</strong> Degrades gracefully if budgets are exceeded</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">📈 Metrics tracked</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <code>latency_ms</code>: Response time in milliseconds</li>
                <li>• <code>cost_usd</code>: API cost per request</li>
                <li>• P95 latency calculation</li>
                <li>• Average cost calculation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">⚙️ Budget limits</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <code>p95_latency_ms</code>: Max acceptable P95 latency</li>
                <li>• <code>max_cost_usd_per_item</code>: Max cost per request</li>
                <li>• Scores degrade if limits exceeded</li>
                <li>• Prevents performance regressions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* LLM Evaluator */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">LLM Evaluator</h2>
        
        <p className="text-gray-600 mb-6">
          Uses AI models to evaluate complex, subjective criteria that deterministic evaluators can&apos;t handle.
          Perfect for quality, tone, and nuanced assessments.
        </p>

        <div className="space-y-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Configuration</h4>
            <CodeBlock
              code={llmEvaluatorExample}
              language="yaml"
              filename=".github/evalgate.yml"
            />
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Prompt Template</h4>
            <CodeBlock
              code={examplePrompt}
              language="text"
              filename="eval/prompts/quality_judge.txt"
            />
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h4 className="font-semibold text-purple-900 mb-3">🧠 Supported Providers</h4>
            <div className="grid md:grid-cols-2 gap-4 text-purple-800 text-sm">
              <div>
                <div className="font-medium mb-1">Cloud Providers:</div>
                <ul className="space-y-1">
                  <li>• OpenAI (gpt-4, gpt-3.5-turbo)</li>
                  <li>• Anthropic (claude-3-5-sonnet, etc.)</li>
                  <li>• Azure OpenAI</li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Self-hosted:</div>
                <ul className="space-y-1">
                  <li>• Local endpoints (OpenAI-compatible)</li>
                  <li>• Custom base URLs</li>
                  <li>• No API key required</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">🎯 Best for</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Content quality assessment</li>
                <li>• Tone and sentiment appropriateness</li>
                <li>• Coherence and completeness</li>
                <li>• Domain-specific expertise</li>
                <li>• Subjective criteria</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">⚙️ Configuration options</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <code>provider</code>: openai, anthropic, azure, local</li>
                <li>• <code>model</code>: Model name (gpt-4, claude-3.5-sonnet)</li>
                <li>• <code>prompt_path</code>: Path to prompt template</li>
                <li>• <code>api_key_env_var</code>: Environment variable for API key</li>
                <li>• <code>temperature</code>: Sampling temperature (default: 0.1)</li>
                <li>• <code>max_tokens</code>: Response length limit</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Practices</h2>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Settings className="h-5 w-5 text-blue-600 mr-2" />
              Evaluator Weights
            </h4>
            <p className="text-gray-600 text-sm mb-3">
              Balance fast deterministic checks with thorough LLM evaluation:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Schema validation: 20-30% (catch format errors early)</li>
              <li>• Category matching: 30-40% (core accuracy)</li>
              <li>• Budget monitoring: 10-20% (performance gates)</li>
              <li>• LLM evaluation: 20-40% (quality assessment)</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              Performance Considerations
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Schema & Category:</strong> Run instantly, no API calls</li>
              <li>• <strong>Budgets:</strong> Fast calculation from fixture metadata</li>
              <li>• <strong>LLM:</strong> Requires API calls, takes longer, costs money</li>
              <li>• <strong>Tip:</strong> Use LLM evaluators selectively for most important criteria</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Brain className="h-5 w-5 text-purple-600 mr-2" />
              LLM Prompt Design
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Be specific about scoring criteria and scale</li>
              <li>• Include examples of good vs. bad outputs</li>
              <li>• Ask for score first, then justification</li>
              <li>• Use consistent temperature (0.1) for reproducible results</li>
              <li>• Test prompts manually before deploying</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg hover:border-violet-300 transition-colors">
            <h3 className="font-semibold text-gray-900 mb-2">⚙️ Configuration Guide</h3>
            <p className="text-gray-600 text-sm mb-3">Learn about all configuration options and how to structure your evalgate.yml file.</p>
            <Link href="/docs/concepts/configuration" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
              View configuration →
            </Link>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg hover:border-violet-300 transition-colors">
            <h3 className="font-semibold text-gray-900 mb-2">🧠 LLM as Judge Guide</h3>
            <p className="text-gray-600 text-sm mb-3">Deep dive into LLM evaluators with examples and best practices.</p>
            <Link href="/docs/advanced/llm-as-judge" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
              Learn LLM evaluation →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
