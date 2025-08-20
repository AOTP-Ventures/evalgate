import { FileText, Code, Target, CheckCircle, AlertTriangle, Folder } from 'lucide-react';
import Link from 'next/link';
import { CodeBlock } from '../CodeBlock';

export function TestFixtures() {
  const basicFixture = `{
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

  const chatbotFixture = `{
  "input": {
    "message": "My order hasn&apos;t arrived yet, can you help?",
    "user_context": {
      "order_id": "ORD-123456",
      "status": "shipped",
      "days_since_order": 7
    }
  },
  "expected": {
    "response": "I'll help you track your order. Let me check the status...",
    "intent": "order_inquiry",
    "next_action": "check_shipping_status",
    "sentiment": "helpful"
  },
  "meta": {
    "latency_ms": 1200,
    "cost_usd": 0.008
  }
}`;

  const classificationFixture = `{
  "input": {
    "text": "This movie was absolutely terrible. Waste of money.",
    "context": "movie_review"
  },
  "expected": {
    "sentiment": "negative",
    "confidence": 0.92,
    "categories": ["entertainment", "review"]
  },
  "meta": {
    "latency_ms": 340,
    "cost_usd": 0.002
  }
}`;

  const ragFixture = `{
  "input": {
    "query": "What are the benefits of renewable energy?",
    "context_docs": [
      "doc_123",
      "doc_456"
    ]
  },
  "expected": {
    "answer": "Renewable energy sources like solar and wind offer several key benefits...",
    "sources": ["doc_123", "doc_456"],
    "confidence": 0.89,
    "answer_type": "factual"
  },
  "meta": {
    "latency_ms": 2100,
    "cost_usd": 0.045
  }
}`;

  const outputExample = `{
  "priority": "P1",
  "tags": ["billing", "refunds"],
  "assignee": "queue:finance",
  "confidence": 0.94,
  "created_at": "2024-01-15T10:30:00Z"
}`;

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Fixtures</h1>
      <p className="text-xl text-gray-600 mb-12">
        Learn how to create and organize test fixtures that define the input/expected output pairs for evaluating your AI system.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">What are Test Fixtures?</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">🎯 Core Concept</h3>
          <p className="text-blue-800 text-sm">
            Test fixtures are JSON files that define specific test cases for your AI system. Each fixture contains 
            the input to your system, the expected output, and optional metadata for performance tracking.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 border border-gray-200 rounded-lg text-center">
            <Code className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Input</h3>
            <p className="text-gray-600 text-sm">Data fed to your AI system</p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Expected</h3>
            <p className="text-gray-600 text-sm">Desired output for evaluation</p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg text-center">
            <FileText className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Meta</h3>
            <p className="text-gray-600 text-sm">Performance metrics (optional)</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Basic Fixture Structure</h4>
          <CodeBlock
            code={basicFixture}
            language="json"
            filename="eval/fixtures/cx_001.json"
          />
        </div>
      </section>

      {/* Fixture Structure */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Fixture Structure</h2>
        
        <div className="space-y-8">
          {/* Input Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Code className="h-6 w-6 text-green-600 mr-3" />
              Input Section
            </h3>
            <p className="text-gray-600 mb-4">
              The <code>input</code> section contains the data that will be fed to your AI system. 
              Structure this exactly as your system expects it.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Guidelines</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Match your API or function signature exactly</li>
                <li>• Include all required fields your system needs</li>
                <li>• Use realistic data that represents actual usage</li>
                <li>• Consider edge cases and boundary conditions</li>
                <li>• Keep data consistent with your domain</li>
              </ul>
            </div>
          </div>

          {/* Expected Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Target className="h-6 w-6 text-blue-600 mr-3" />
              Expected Section
            </h3>
            <p className="text-gray-600 mb-4">
              The <code>expected</code> section defines the ideal output your system should produce. 
              This is used by evaluators to measure accuracy and quality.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Best Practices</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Define clear, unambiguous expected outputs</li>
                <li>• Include all fields that evaluators will check</li>
                <li>• Use consistent formatting and data types</li>
                <li>• Consider multiple valid answers when appropriate</li>
                <li>• Focus on fields critical to your use case</li>
              </ul>
            </div>
          </div>

          {/* Meta Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 text-purple-600 mr-3" />
              Meta Section (Optional)
            </h3>
            <p className="text-gray-600 mb-4">
              The <code>meta</code> section contains performance metrics used by budget evaluators 
              to monitor latency and cost.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Available Metrics</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <code>latency_ms</code>: Response time in milliseconds</li>
                <li>• <code>cost_usd</code>: API cost per request in USD</li>
                <li>• Add custom metrics as needed for your evaluators</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Case Examples */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Use Case Examples</h2>
        
        <div className="space-y-8">
          {/* Chatbot */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Chatbot/Assistant</h3>
            <p className="text-gray-600 mb-4">
              For conversational AI systems that respond to user messages.
            </p>
            <CodeBlock
              code={chatbotFixture}
              language="json"
              filename="eval/fixtures/chatbot_001.json"
            />
          </div>

          {/* Classification */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Text Classification</h3>
            <p className="text-gray-600 mb-4">
              For systems that categorize or classify text content.
            </p>
            <CodeBlock
              code={classificationFixture}
              language="json"
              filename="eval/fixtures/classify_001.json"
            />
          </div>

          {/* RAG */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">RAG (Retrieval-Augmented Generation)</h3>
            <p className="text-gray-600 mb-4">
              For question-answering systems that retrieve and synthesize information.
            </p>
            <CodeBlock
              code={ragFixture}
              language="json"
              filename="eval/fixtures/rag_001.json"
            />
          </div>
        </div>
      </section>

      {/* File Organization */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">File Organization</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Folder className="h-6 w-6 text-yellow-600 mr-3" />
              Directory Structure
            </h3>
            <CodeBlock
              code={`eval/
├── fixtures/
│   ├── customer_support/
│   │   ├── urgent_001.json
│   │   ├── urgent_002.json
│   │   └── routine_001.json
│   ├── classification/
│   │   ├── positive_001.json
│   │   ├── negative_001.json
│   │   └── neutral_001.json
│   └── edge_cases/
│       ├── empty_input_001.json
│       └── malformed_001.json
└── schemas/
    └── queue_item.json`}
              language="text"
              filename="Directory structure"
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Naming Conventions</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">💡 Recommended Patterns</h4>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• Use descriptive prefixes: <code>urgent_001.json</code>, <code>routine_001.json</code></li>
                <li>• Group by category: <code>billing/</code>, <code>support/</code>, <code>sales/</code></li>
                <li>• Number sequentially: <code>001</code>, <code>002</code>, <code>003</code></li>
                <li>• Include test type: <code>edge_case_001.json</code>, <code>happy_path_001.json</code></li>
                <li>• Match output filenames exactly for correlation</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Configuration</h3>
            <p className="text-gray-600 mb-4">
              EvalGate uses glob patterns to find your fixtures. Configure the path in your <code>.github/evalgate.yml</code>:
            </p>
            <CodeBlock
              code={`fixtures:
  path: "eval/fixtures/**/*.json"  # Finds all JSON files recursively`}
              language="yaml"
              filename=".github/evalgate.yml"
            />
          </div>
        </div>
      </section>

      {/* Output Files */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Generated Outputs</h2>
        
        <p className="text-gray-600 mb-6">
          Your prediction script reads fixtures and generates corresponding output files. 
          These outputs are compared against the expected values in fixtures.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Output Structure</h3>
            <p className="text-gray-600 mb-4">
              Output files should contain only the generated response from your AI system:
            </p>
            <CodeBlock
              code={outputExample}
              language="json"
              filename=".evalgate/outputs/cx_001.json"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h4 className="font-semibold text-amber-900 mb-3">⚠️ Critical Requirements</h4>
            <ul className="text-amber-800 text-sm space-y-2">
              <li>• Output filename must match fixture filename exactly</li>
              <li>• <code>cx_001.json</code> fixture → <code>cx_001.json</code> output</li>
              <li>• Files must be in the configured outputs directory</li>
              <li>• Only include generated data, not the original input</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Practices</h2>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Quality Fixtures
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Start with 10-20 representative examples</li>
              <li>• Cover happy path, edge cases, and error conditions</li>
              <li>• Use real-world data patterns and language</li>
              <li>• Include diverse examples across your use cases</li>
              <li>• Update fixtures as your system evolves</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Target className="h-5 w-5 text-blue-600 mr-2" />
              Evaluation Strategy
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Define clear success criteria in expected outputs</li>
              <li>• Focus on business-critical fields and metrics</li>
              <li>• Balance precision with realistic expectations</li>
              <li>• Consider multiple valid answers when appropriate</li>
              <li>• Document any special evaluation logic needed</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              Common Pitfalls
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Mismatched fixture and output filenames</li>
              <li>• Overly strict expected outputs that don&apos;t allow variation</li>
              <li>• Including input data in output files</li>
              <li>• Not testing edge cases and error conditions</li>
              <li>• Fixtures that don&apos;t represent real usage patterns</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testing Your Fixtures */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Testing Your Fixtures</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Local Validation</h3>
            <p className="text-gray-600 mb-4">
              Test your fixtures locally before committing to ensure they work correctly:
            </p>
            <CodeBlock
              code={`# 1. Generate outputs from fixtures
python scripts/predict.py --in eval/fixtures --out .evalgate/outputs

# 2. Run EvalGate evaluation
uvx --from evalgate evalgate run --config .github/evalgate.yml

# 3. Check results
uvx --from evalgate evalgate report --summary --artifact ./.evalgate/results.json`}
              language="bash"
              filename="Local testing commands"
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-900 mb-3">✅ Validation Checklist</h4>
            <ul className="text-green-800 text-sm space-y-2">
              <li>• All fixture files are valid JSON</li>
              <li>• Input structure matches your system&apos;s API</li>
              <li>• Expected outputs are realistic and achievable</li>
              <li>• Output files are generated with matching names</li>
              <li>• Evaluators run without configuration errors</li>
              <li>• Overall scores meet your quality thresholds</li>
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
            <p className="text-gray-600 text-sm mb-3">Learn how to configure EvalGate to work with your fixtures and evaluation needs.</p>
            <Link href="/docs/concepts/configuration" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
              Configure EvalGate →
            </Link>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg hover:border-violet-300 transition-colors">
            <h3 className="font-semibold text-gray-900 mb-2">🔍 Evaluators Guide</h3>
            <p className="text-gray-600 text-sm mb-3">Understand how different evaluators use your fixtures to assess AI system quality.</p>
            <Link href="/docs/concepts/evaluators" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
              Learn evaluators →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Keep the old export name for backward compatibility
export { TestFixtures as BasicSetup };
