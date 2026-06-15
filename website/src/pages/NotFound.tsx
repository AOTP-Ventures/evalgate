import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { CheckSquare } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-100 flex items-center justify-center px-6">
      <Head>
        <title>Page Not Found - EvalGate</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="text-center max-w-lg">
        <div className="mx-auto h-12 w-12 rounded-lg bg-violet-600 flex items-center justify-center mb-6">
          <CheckSquare className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          We couldn&apos;t find the page you were looking for.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition-colors">
            Back home
          </Link>
          <Link to="/docs" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            View documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
