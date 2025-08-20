import { DocLayout } from '@/components/docs/DocLayout';
import { Introduction } from '@/components/docs/content/Introduction';
import { PreviousNext } from '@/components/docs/PreviousNext';

export default function Docs() {
  return (
    <DocLayout>
      <div className="max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span className="text-gray-900 font-medium">Docs</span>
        </nav>

        {/* Content */}
        <article className="prose prose-gray max-w-none prose-violet">
          <Introduction />
        </article>

        {/* Navigation */}
        <PreviousNext currentSlug="" />
      </div>
    </DocLayout>
  );
}
