import { CheckCircle, GitBranch, FileText, Cpu } from 'lucide-react';
import Link from 'next/link';
import { CodeBlock } from '../CodeBlock';

export function HowItWorks() {
  const evaluationFlow = `1. Your PR triggers GitHub Actions
2. Actions runs your prediction script
3. EvalGate compares outputs to fixtures
4. Results posted as PR comment
5. Gate blocks merge if score too low`;

  const exampleFlow = `# Your test case
{
  "input": {"query": "refund please"},
  "expected": {"priority": "P1", "category": "billing"}
}

# Your model output  
{"priority": "P2", "category": "billing"}

# EvalGate evaluation
✅ Category match: 100%
❌ Priority match: 0% 
📊 Overall score: 50%`;

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h1>
      <p className="text-xl text-gray-600 mb-12">
        Understanding EvalGate&apos;s architecture, evaluation flow, and how it fits into your development workflow.
      </p>

      {/* Architecture Overview */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Architecture Overview</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-4">🏗️ Zero Infrastructure Design</h3>
          <p className="text-blue-800">
            EvalGate runs entirely in your GitHub Actions. No servers to manage, no databases to maintain, 
            no external services to depend on. Everything happens in your CI environment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 border border-gray-200 rounded-lg">
            <FileText className="h-8 w-8 text-violet-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Test Fixtures</h4>
            <p className="text-gray-600 text-sm">JSON files with input/expected output pairs</p>
          </div>
          <div className="text-center p-6 border border-gray-200 rounded-lg">
            <Cpu className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Your Model</h4>
            <p className="text-gray-600 text-sm">Generate outputs from fixture inputs</p>
          </div>
          <div className="text-center p-6 border border-gray-200 rounded-lg">
            <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">EvalGate</h4>
            <p className="text-gray-600 text-sm">Compare outputs to expected results</p>
          </div>
        </div>
      </section>

      {/* Evaluation Flow */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Evaluation Flow</h2>
        
        <div className="space-y-8">
          {/* Step by step flow */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
              <div>
                <h4 className="font-semibold text-gray-900">PR Created → GitHub Actions Triggered</h4>
                <p className="text-gray-600">When you create a PR, GitHub Actions runs your evaluation workflow.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
              <div>
                <h4 className="font-semibold text-gray-900">Generate Outputs</h4>
                <p className="text-gray-600">Your prediction script reads test fixtures and generates outputs using your AI model.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
              <div>
                <h4 className="font-semibold text-gray-900">Run Evaluations</h4>
                <p className="text-gray-600">EvalGate compares your outputs against expected results using configured evaluators.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-semibold">4</div>
              <div>
                <h4 className="font-semibold text-gray-900">Compare to Baseline</h4>
                <p className="text-gray-600">Scores are compared to main branch to detect regressions.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-semibold">5</div>
              <div>
                <h4 className="font-semibold text-gray-900">Report & Gate Decision</h4>
                <p className="text-gray-600">Results posted to PR. Merge blocked if score below threshold.</p>
              </div>
            </div>
          </div>

          {/* Visual flow */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Evaluation Flow Summary</h4>
            <CodeBlock
              code={evaluationFlow}
              language="text"
              filename="Evaluation Flow"
            />
          </div>
        </div>
      </section>

      {/* Example Walkthrough */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Example Walkthrough</h2>
        
        <p className="text-gray-600 mb-6">
          Let&apos;s trace through a simple example to see how EvalGate evaluates your AI system:
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <CodeBlock
            code={exampleFlow}
            language="text"
            filename="Example Evaluation"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">✅ What Passed</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Category classification correct</li>
              <li>• JSON schema valid</li>
              <li>• Response latency acceptable</li>
            </ul>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">❌ What Failed</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Priority wrong (P2 vs P1)</li>
              <li>• Overall score below threshold</li>
              <li>• Regression vs main branch</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Gate Decision</h4>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Score: 50% (need 90%)</li>
              <li>• PR merge blocked</li>
              <li>• Clear feedback provided</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Types of Evaluations */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Evaluations</h2>
        
        <p className="text-gray-600 mb-6">
          EvalGate supports multiple evaluation types, each serving different purposes:
        </p>

        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Deterministic Evaluations
            </h4>
            <p className="text-gray-600 mb-3">Fast, reliable checks that catch obvious problems</p>
            <div className="text-sm text-gray-500">
              • JSON Schema validation • Exact field matching • Category accuracy • Budget limits
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="text-purple-600 mr-2">🧠</span>
              LLM-as-Judge Evaluations
            </h4>
            <p className="text-gray-600 mb-3">AI-powered evaluation for complex, subjective criteria</p>
            <div className="text-sm text-gray-500">
              • Content quality • Tone assessment • Domain expertise • Nuanced scoring
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <GitBranch className="h-5 w-5 text-blue-600 mr-2" />
              Regression Detection
            </h4>
            <p className="text-gray-600 mb-3">Compare against baseline to catch quality degradation</p>
            <div className="text-sm text-gray-500">
              • Main branch comparison • Statistical significance • Trend analysis • Alert thresholds
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Why This Architecture Works</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">For Developers</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• No infrastructure to maintain</li>
              <li>• Runs in familiar GitHub environment</li>
              <li>• Results integrated with PR workflow</li>
              <li>• Easy to debug and iterate</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">For Organizations</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Zero operational overhead</li>
              <li>• Complete data privacy</li>
              <li>• Scales with your team</li>
              <li>• Auditable and transparent</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section className="mb-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-4">💡 Common Questions</h3>
          <div className="space-y-4 text-blue-800">
            <div>
              <p className="font-medium">Q: How does EvalGate know what to evaluate?</p>
              <p className="text-sm">A: You provide test fixtures (input/expected output pairs) and EvalGate compares your model&apos;s outputs to the expected results.</p>
            </div>
            <div>
              <p className="font-medium">Q: What if my model is non-deterministic?</p>
              <p className="text-sm">A: EvalGate focuses on evaluating quality patterns, not exact matches. LLM-as-judge evaluators are perfect for non-deterministic outputs.</p>
            </div>
            <div>
              <p className="font-medium">Q: Can I run this locally for debugging?</p>
              <p className="text-sm">A: Yes! EvalGate runs the same way locally as in CI, making debugging easy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg hover:border-violet-300 transition-colors">
            <h3 className="font-semibold text-gray-900 mb-2">🔧 Learn About Evaluators</h3>
            <p className="text-gray-600 text-sm mb-3">Deep dive into the different types of evaluations you can configure.</p>
            <Link href="/docs/concepts/evaluators" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
              Explore evaluators →
            </Link>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg hover:border-violet-300 transition-colors">
            <h3 className="font-semibold text-gray-900 mb-2">⚙️ Configuration Options</h3>
            <p className="text-gray-600 text-sm mb-3">Understand all the configuration options and how to customize them.</p>
            <Link href="/docs/concepts/configuration" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
              Learn configuration →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
