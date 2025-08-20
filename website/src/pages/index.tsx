import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Head from '@docusaurus/Head';
import { CheckCircle, Zap, CheckSquare } from 'lucide-react';

export default function Home(): ReactNode {
  return (
    <>
      <Head>
        <title>EvalGate - Stop LLM regressions before they merge</title>
        <meta name="description" content="Get guardrails for your AI features without the support burden. EvalGate runs deterministic evaluations as GitHub PR checks—zero infrastructure, local-only by default." />
      </Head>
      
      <div className="bg-gradient-to-br from-slate-50 via-violet-50 to-purple-100">
        {/* Header */}
        <header className="relative px-6 lg:px-8 py-6">
          <nav className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EvalGate</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/docs/intro" className="text-gray-700 hover:text-violet-600 transition-colors">Documentation</Link>
              <a 
                href="https://github.com/aotp-ventures/evalgate" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="px-6 lg:px-8 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-violet-100 text-violet-800 mb-8">
              <Zap className="h-4 w-4 mr-2" />
              Ship AI features with confidence
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Stop LLM regressions{" "}
              <span className="text-violet-600">before they merge</span>
            </h1>
            <div className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-green-100 text-green-800 mb-6">
              <span className="text-green-600 mr-2">🎉</span>
              Open Source & MIT Licensed
            </div>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Get guardrails for your AI features without the support burden. EvalGate runs deterministic evaluations 
              as GitHub PR checks—zero infrastructure, local-only by default, setup in under 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://github.com/aotp-ventures/evalgate" className="bg-violet-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-violet-700 transition-colors shadow-lg inline-block text-center">
                Get Started on GitHub
              </a>
              <Link to="/docs/intro" className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-block text-center">
                View Documentation
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Key Features */}
      <section className="px-6 lg:px-8 py-16 bg-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Catch AI regressions before they ship
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Run automated evaluations on every PR. Start with deterministic checks, 
            then add LLM-based evaluation when you're ready.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Deterministic Checks</h3>
              <p className="text-gray-600">JSON validation, exact matches, latency & cost budgets. Fast, reliable, zero-cost evaluation.</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-8">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">LLM-as-Judge</h3>
              <p className="text-gray-600">Evaluate quality, tone, accuracy, and domain-specific criteria using GPT-4, Claude, or local models.</p>
            </div>
          </div>
          
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-violet-600 mb-2">&lt;10 min</div>
                <div className="text-sm text-gray-600">Setup time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-violet-600 mb-2">Zero</div>
                <div className="text-sm text-gray-600">Infrastructure</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-violet-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Open source</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 lg:px-8 py-20 bg-violet-600">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to stop LLM regressions?
          </h2>
          <p className="text-xl text-violet-100 mb-8">
            Get started in less than 10 minutes. Zero infrastructure required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://github.com/aotp-ventures/evalgate" className="bg-white text-violet-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg inline-block">
              Get Started on GitHub
            </a>
            <Link to="/docs/intro" className="border border-violet-400 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-violet-700 transition-colors inline-block">
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-8 py-12 bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EvalGate</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a href="https://github.com/aotp-ventures/evalgate" className="text-gray-400 hover:text-white transition-colors">
                GitHub Repository
              </a>
              <a href="https://github.com/aotp-ventures/evalgate/issues" className="text-gray-400 hover:text-white transition-colors">
                Report Issues
              </a>
              <Link to="/docs/intro" className="text-gray-400 hover:text-white transition-colors">
                Documentation
              </Link>
            </div>
            <div className="text-gray-400 text-sm text-center md:text-right">
              <div className="mb-1">Open Source • MIT Licensed</div>
              <div>© 2025 AOTP Ventures</div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
