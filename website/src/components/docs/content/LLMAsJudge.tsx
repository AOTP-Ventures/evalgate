import { Brain, Key, Code, CheckCircle, AlertTriangle, Zap, Globe, Server, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { CodeBlock, TerminalBlock } from '../CodeBlock';

export function LLMAsJudge() {
  const basicConfig = `# Basic LLM Evaluator Configuration
evaluators:
  - name: content_quality
    type: llm
    provider: openai
    model: "gpt-4"
    prompt_path: "eval/prompts/quality_judge.txt"
    api_key_env_var: "OPENAI_API_KEY"
    temperature: 0.1
    max_tokens: 1000
    weight: 0.3
    enabled: true`;

  const qualityPrompt = `You are an expert evaluator assessing the quality of customer support ticket classification.

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

  const sentimentPrompt = `You are evaluating whether the generated customer support response appropriately matches the sentiment and urgency of the customer's request.

INPUT REQUEST:
{input}

GENERATED RESPONSE:
{output}

EXPECTED CHARACTERISTICS:
{expected}

Rate the response on a scale of 0.0 to 1.0 based on:
- Sentiment appropriateness
- Urgency recognition
- Professional tone
- Accuracy of information

Score: [your score between 0.0 and 1.0]`;

  const multiProviderConfig = `# Multiple LLM Evaluators with Different Providers
evaluators:
  # Quality evaluation with OpenAI
  - name: content_quality
    type: llm
    provider: openai
    model: "gpt-4"
    prompt_path: "eval/prompts/quality_judge.txt"
    api_key_env_var: "OPENAI_API_KEY"
    weight: 0.3

  # Sentiment evaluation with Anthropic
  - name: sentiment_check
    type: llm
    provider: anthropic
    model: "claude-3-5-sonnet-20241022"
    prompt_path: "eval/prompts/sentiment_judge.txt"
    api_key_env_var: "ANTHROPIC_API_KEY"
    weight: 0.2

  # Local model evaluation
  - name: tone_analysis
    type: llm
    provider: local
    model: "llama2-7b"
    base_url: "http://localhost:8000/v1"
    prompt_path: "eval/prompts/tone_judge.txt"
    weight: 0.15`;

  const githubActionsSetup = `# GitHub Actions with LLM API Keys
name: EvalGate with LLM Evaluation
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

      - name: Run EvalGate with LLM evaluation
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: uvx --from evalgate[llm] evalgate run --config .github/evalgate.yml

      - name: Report results
        if: always()
        run: uvx --from evalgate evalgate report --summary --artifact ./.evalgate/results.json`;

  const customPromptExample = `You are evaluating the quality of a chatbot response for an e-commerce platform.

Evaluate the response based on these specific criteria:
1. **Helpfulness**: Does it solve the customer's problem?
2. **Accuracy**: Is the information provided correct?
3. **Tone**: Is it friendly, professional, and appropriate?
4. **Completeness**: Does it address all aspects of the query?
5. **Upselling**: Does it appropriately suggest relevant products when suitable?

CUSTOMER QUERY:
{input}

EXPECTED RESPONSE CHARACTERISTICS:
{expected}

GENERATED CHATBOT RESPONSE:
{output}

## Evaluation Instructions

For each criterion, consider:
- **1.0**: Exceptional - exceeds expectations
- **0.8**: Good - meets expectations with minor room for improvement
- **0.6**: Satisfactory - adequate but with noticeable issues
- **0.4**: Below expectations - significant problems
- **0.2**: Poor - major issues that need addressing
- **0.0**: Unacceptable - completely fails the criterion

Provide your overall score as the average of the five criteria.

## Response Format
Score: [your final score from 0.0 to 1.0]

Breakdown:
- Helpfulness: [score]/1.0 - [brief comment]
- Accuracy: [score]/1.0 - [brief comment]
- Tone: [score]/1.0 - [brief comment]
- Completeness: [score]/1.0 - [brief comment]
- Upselling: [score]/1.0 - [brief comment]

Justification: [2-3 sentence summary of your evaluation]`;

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">LLM as Judge</h1>
      <p className="text-xl text-gray-600 mb-12">
        Use AI models to evaluate complex, subjective criteria that traditional evaluators can&apos;t handle effectively.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Why LLM as Judge?</h2>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-purple-900 mb-3">🧠 Beyond Deterministic Evaluation</h3>
          <p className="text-purple-800 text-sm">
            While schema and category evaluators excel at checking structure and exact matches, 
            LLM evaluators can assess nuanced qualities like tone, helpfulness, coherence, and domain expertise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">✅ Perfect For</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Content quality and coherence</li>
              <li>• Tone and sentiment appropriateness</li>
              <li>• Helpfulness and completeness</li>
              <li>• Domain-specific expertise</li>
              <li>• Creative and subjective outputs</li>
              <li>• Multi-criteria complex evaluation</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">⚠️ Limitations</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Slower than deterministic evaluators</li>
              <li>• Requires API calls (costs money)</li>
              <li>• Some variability in scoring</li>
              <li>• Needs well-designed prompts</li>
              <li>• Depends on model capabilities</li>
              <li>• Rate limits and potential failures</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3">💡 Best Practice</h4>
          <p className="text-blue-800 text-sm">
            Use LLM evaluators alongside deterministic ones. Let schema/category evaluators catch obvious issues quickly, 
            then use LLM evaluators for nuanced quality assessment.
          </p>
        </div>
      </section>

      {/* Getting Started */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Getting Started</h2>
        
        <div className="space-y-8">
          {/* Installation */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Zap className="h-6 w-6 text-yellow-600 mr-3" />
              1. Install with LLM Support
            </h3>
            <p className="text-gray-600 mb-4">
              EvalGate requires additional dependencies for LLM providers:
            </p>
            <TerminalBlock
              commands={[
                '# Install with LLM dependencies',
                'pip install evalgate[llm]',
                '',
                '# Or with uv',
                'uvx --from evalgate[llm] evalgate --help'
              ]}
              className="mb-4"
            />
          </div>

          {/* API Keys */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Key className="h-6 w-6 text-green-600 mr-3" />
              2. Set Up API Keys
            </h3>
            <p className="text-gray-600 mb-4">
              Configure API keys for your chosen LLM provider:
            </p>
            <TerminalBlock
              commands={[
                '# OpenAI',
                'export OPENAI_API_KEY="your-api-key-here"',
                '',
                '# Anthropic',
                'export ANTHROPIC_API_KEY="your-api-key-here"',
                '',
                '# Azure OpenAI',
                'export AZURE_API_KEY="your-api-key-here"'
              ]}
              className="mb-4"
            />
          </div>

          {/* Basic Configuration */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Code className="h-6 w-6 text-blue-600 mr-3" />
              3. Configure Evaluator
            </h3>
            <p className="text-gray-600 mb-4">
              Add an LLM evaluator to your <code>.github/evalgate.yml</code>:
            </p>
            <CodeBlock
              code={basicConfig}
              language="yaml"
              filename=".github/evalgate.yml"
            />
          </div>

          {/* Create Prompt */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Brain className="h-6 w-6 text-purple-600 mr-3" />
              4. Create Prompt Template
            </h3>
            <p className="text-gray-600 mb-4">
              Create a prompt template that defines your evaluation criteria:
            </p>
            <CodeBlock
              code={qualityPrompt}
              language="text"
              filename="eval/prompts/quality_judge.txt"
            />
          </div>
        </div>
      </section>

      {/* Supported Providers */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Supported Providers</h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Globe className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Cloud Providers</h3>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">OpenAI</h4>
                <p className="text-gray-600 text-sm mb-2">GPT-4, GPT-3.5 Turbo, GPT-4 Turbo</p>
                <code className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded">provider: openai</code>
              </div>
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">Anthropic</h4>
                <p className="text-gray-600 text-sm mb-2">Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku</p>
                <code className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded">provider: anthropic</code>
              </div>
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">Azure OpenAI</h4>
                <p className="text-gray-600 text-sm mb-2">Your deployed Azure models</p>
                <code className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded">provider: azure</code>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-6">
              <Server className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Self-Hosted</h3>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">Local Models</h4>
                <p className="text-gray-600 text-sm mb-2">Ollama, vLLM, text-generation-inference</p>
                <code className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded">provider: local</code>
              </div>
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">Key Benefits</h4>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
                    No API costs
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
                    Complete privacy
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
                    No rate limits
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
                    OpenAI-compatible API required
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Multi-Provider Configuration Example</h4>
          <CodeBlock
            code={multiProviderConfig}
            language="yaml"
            filename="Multiple providers in .github/evalgate.yml"
          />
        </div>
      </section>

      {/* Prompt Engineering */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Prompt Engineering</h2>
        
        <p className="text-gray-600 mb-6">
          The quality of your LLM evaluation depends heavily on your prompt design. 
          Here are best practices and examples for effective prompts.
        </p>

        <div className="space-y-8">
          {/* Template Variables */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Template Variables</h3>
            <p className="text-gray-600 mb-4">
              EvalGate automatically substitutes these variables in your prompts:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="text-sm text-gray-600 space-y-3">
                <li>• <code className="bg-white px-2 py-1 rounded">{`{input}`}</code> - The input data from your fixture</li>
                <li>• <code className="bg-white px-2 py-1 rounded">{`{expected}`}</code> - The expected output from your fixture</li>
                <li>• <code className="bg-white px-2 py-1 rounded">{`{output}`}</code> - The generated output from your AI system</li>
              </ul>
            </div>
          </div>

          {/* Prompt Best Practices */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Best Practices</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-green-200 bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 mb-3">✅ Do</h4>
                <ul className="text-green-800 text-sm space-y-2">
                  <li>• Be specific about scoring criteria</li>
                  <li>• Provide clear score ranges (0.0-1.0)</li>
                  <li>• Ask for score first, then justification</li>
                  <li>• Include examples when possible</li>
                  <li>• Test prompts manually before deployment</li>
                  <li>• Use consistent temperature (0.1)</li>
                </ul>
              </div>
              <div className="border border-red-200 bg-red-50 rounded-lg p-6">
                <h4 className="font-semibold text-red-900 mb-3">❌ Don&apos;t</h4>
                <ul className="text-red-800 text-sm space-y-2">
                  <li>• Make prompts too long or complex</li>
                  <li>• Use ambiguous evaluation criteria</li>
                  <li>• Forget to specify output format</li>
                  <li>• Use high temperature (&gt; 0.3)</li>
                  <li>• Rely on single-word responses</li>
                  <li>• Skip validation and testing</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Advanced Prompt Example */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Advanced Prompt Example</h3>
            <p className="text-gray-600 mb-4">
              A comprehensive prompt for evaluating e-commerce chatbot responses:
            </p>
            <CodeBlock
              code={customPromptExample}
              language="text"
              filename="eval/prompts/ecommerce_chatbot_judge.txt"
            />
          </div>

          {/* Score Extraction */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Score Extraction</h3>
            <p className="text-gray-600 mb-4">
              EvalGate automatically extracts numerical scores from LLM responses using pattern matching:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">Supported Score Formats</h4>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• <code>Score: 0.85</code> or <code>Score 0.85</code></li>
                <li>• <code>Rating: 4/5</code> or <code>8.5/10</code></li>
                <li>• <code>85%</code> (converted to 0.85)</li>
                <li>• Standalone numbers: <code>0.75</code></li>
                <li>• Sentiment words: &quot;excellent&quot;, &quot;good&quot;, &quot;poor&quot;</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* GitHub Actions Integration */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">GitHub Actions Integration</h2>
        
        <p className="text-gray-600 mb-6">
          Set up LLM evaluation in your CI/CD pipeline with secure API key management:
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">1. Add Repository Secrets</h3>
            <p className="text-gray-600 mb-4">
              Go to your GitHub repository Settings → Secrets and variables → Actions:
            </p>
            <ul className="text-gray-600 space-y-2 mb-4">
              <li>• <code>OPENAI_API_KEY</code> - Your OpenAI API key</li>
              <li>• <code>ANTHROPIC_API_KEY</code> - Your Anthropic API key</li>
              <li>• <code>AZURE_API_KEY</code> - Your Azure API key (if using Azure)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">2. GitHub Actions Workflow</h3>
            <CodeBlock
              code={githubActionsSetup}
              language="yaml"
              filename=".github/workflows/evalgate.yml"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h4 className="font-semibold text-amber-900 mb-3">🔒 Security Note</h4>
            <p className="text-amber-800 text-sm">
              API keys are handled securely as GitHub secrets and never exposed in logs. 
              EvalGate processes happen entirely in your CI environment.
            </p>
          </div>
        </div>
      </section>

      {/* Example Templates */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Example Templates</h2>
        
        <p className="text-gray-600 mb-6">
          Here are production-ready prompt templates for common use cases:
        </p>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Sentiment Analysis</h3>
            <p className="text-gray-600 mb-4">
              Evaluate if responses match appropriate sentiment and tone:
            </p>
            <CodeBlock
              code={sentimentPrompt}
              language="text"
              filename="eval/prompts/sentiment_judge.txt"
            />
          </div>
        </div>
      </section>

      {/* Performance & Cost */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Performance & Cost Considerations</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              Cost Management
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• OpenAI GPT-4: ~$0.03 per evaluation</li>
              <li>• OpenAI GPT-3.5: ~$0.002 per evaluation</li>
              <li>• Anthropic Claude: ~$0.015 per evaluation</li>
              <li>• Local models: $0 per evaluation</li>
              <li>• Use <code>max_tokens</code> to limit response length</li>
              <li>• Consider cheaper models for simpler tasks</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Zap className="h-5 w-5 text-yellow-600 mr-2" />
              Performance Tips
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Use low temperature (0.1) for consistency</li>
              <li>• LLM evaluators run in parallel when possible</li>
              <li>• Typical evaluation: 2-10 seconds per fixture</li>
              <li>• Consider local models for large test suites</li>
              <li>• Balance LLM vs deterministic evaluator weights</li>
              <li>• Start small, scale gradually</li>
            </ul>
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
              Common Issues
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>API key not found:</strong> Check environment variable name matches config</li>
              <li>• <strong>Import error:</strong> Install with <code>pip install evalgate[llm]</code></li>
              <li>• <strong>Score extraction failed:</strong> Ensure prompt asks for clear numeric score</li>
              <li>• <strong>Rate limits:</strong> Add delays or use multiple API keys</li>
              <li>• <strong>Azure setup:</strong> Specify <code>base_url</code> for Azure endpoint</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Debugging Tips
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Test prompts manually with your LLM before deployment</li>
              <li>• Start with a single fixture to validate setup</li>
              <li>• Use <code>enabled: false</code> to temporarily disable evaluators</li>
              <li>• Check EvalGate logs for detailed error messages</li>
              <li>• Validate JSON in your prompt template variables</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg hover:border-violet-300 transition-colors">
            <h3 className="font-semibold text-gray-900 mb-2">⚙️ Configuration Reference</h3>
            <p className="text-gray-600 text-sm mb-3">Complete guide to all LLM evaluator configuration options and parameters.</p>
            <Link href="/docs/concepts/configuration" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
              View configuration →
            </Link>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg hover:border-violet-300 transition-colors">
            <h3 className="font-semibold text-gray-900 mb-2">🔧 GitHub Actions Integration</h3>
            <p className="text-gray-600 text-sm mb-3">Learn how to set up LLM evaluation in your CI/CD pipeline with GitHub Actions.</p>
            <Link href="/docs/advanced/github-actions" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
              Setup CI/CD →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
