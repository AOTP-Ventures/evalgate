
export function Introduction() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-8 mb-12 border border-purple-200">
        <div className="text-center">
          <div className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-violet-200 text-violet-800 mb-4">
            ⚡ Zero Infrastructure Required
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Stop AI Regressions Before They Ship
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Automated evaluation for your AI features. Catch quality, cost, and performance 
            issues in pull requests—before they reach production.
          </p>
        </div>
      </div>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">The Problem</h2>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-red-900 mb-4">🚨 AI Features Break in Production</h3>
          <div className="space-y-3 text-red-800">
            <p>• Your LLM starts generating malformed JSON after a prompt change</p>
            <p>• Response quality degrades but you only notice after customer complaints</p>
            <p>• Latency spikes from 200ms to 2s, breaking your user experience</p>
            <p>• A model update changes behavior in subtle ways you didn&apos;t test for</p>
          </div>
        </div>

        <p className="text-lg text-gray-800 mb-6">
          <strong>Sound familiar?</strong> Most teams rely on manual testing or basic unit tests for AI features. 
          But AI systems fail in ways traditional software doesn&apos;t—and those failures are expensive.
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Why EvalGate?</h2>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-green-900 mb-4">✅ Catch AI Regressions Before They Ship</h3>
          <p className="text-green-800">
            EvalGate runs comprehensive evaluations on every PR, so you know exactly how your changes 
            affect AI quality, cost, and performance—before they reach production.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Before/After Comparison */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm mr-2">Before</span>
              Without EvalGate
            </h4>
            <ul className="space-y-2 text-gray-800">
              <li>• Manual testing on a few examples</li>
              <li>• Hope nothing breaks in production</li>
              <li>• Debug issues after customers complain</li>
              <li>• No visibility into cost/latency changes</li>
              <li>• Afraid to update prompts or models</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-2">After</span>
              With EvalGate
            </h4>
            <ul className="space-y-2 text-gray-800">
              <li>• Automated evaluation on every PR</li>
              <li>• Catch regressions before they merge</li>
              <li>• Clear reports on what changed</li>
              <li>• Budget enforcement for cost/latency</li>
              <li>• Ship AI features with confidence</li>
            </ul>
          </div>
        </div>
      </section>

      {/* What Makes It Different */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">What Makes EvalGate Different?</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">🎯 Simple Tool, Not a Platform</h3>
          <p className="text-blue-800">
            EvalGate isn&apos;t another heavyweight platform to learn and manage. It&apos;s a simple,
            <strong>open source</strong> CLI tool that works exactly where you already do—in GitHub PRs, 
            with your existing workflow.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="text-xl mr-2">⚡</span>
              Works Where You Already Are
            </h4>
            <p className="text-gray-800">
              No new platforms to learn. Runs in your existing GitHub PRs, posts results as comments, 
              integrates with your current code review process. It feels native.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="text-xl mr-2">🎈</span>
              Lightweight by Design
            </h4>
            <p className="text-gray-800">
              No servers, no databases, no dashboards to maintain. Just a CLI tool that runs when you need it. 
              Your team can start using it in 10 minutes without any infrastructure changes.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="text-xl mr-2">🧠</span>
              Start Simple, Scale Sophisticated
            </h4>
            <p className="text-gray-800">
              Begin with basic JSON validation and exact matches. Add LLM-powered evaluation 
              when you&apos;re ready. No big upfront commitment or complex setup.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="text-xl mr-2">🔒</span>
              Your Code, Your Environment
            </h4>
            <p className="text-gray-800">
              Everything runs in your GitHub Actions. Your prompts, data, and results never leave 
              your environment. No vendor lock-in, no external dependencies.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center">
              <span className="text-xl mr-2">🔓</span>
              Fully Open Source
            </h4>
            <p className="text-green-700">
              Complete transparency with MIT license. Audit every line of code, contribute improvements, 
              or fork it for your needs. No black boxes, no hidden telemetry.
            </p>
          </div>
        </div>
      </section>



    </div>
  );
}
