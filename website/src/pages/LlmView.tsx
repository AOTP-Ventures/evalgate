import { useLoaderData } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import type { LlmLoaderData } from '@/routes';
import NotFound from './NotFound';

// In-app plain-text view of all docs for a version (the "LLM View"). The same
// content is also served as a raw text/plain file at /docs/:version/llm.txt
// (emitted to public/docs/<version>/llm.txt by the content build).
export default function LlmView() {
  const { version, text } = useLoaderData() as LlmLoaderData;

  if (!text) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{`LLM View - EvalGate ${version} Documentation`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-sm font-medium text-gray-500">
            EvalGate {version} — combined documentation
          </h1>
          <a
            href={`/docs/${version}/llm.txt`}
            className="text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            Raw .txt →
          </a>
        </div>
        <pre className="whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-800">
          {text}
        </pre>
      </div>
    </div>
  );
}
