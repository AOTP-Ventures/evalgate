import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import { PreviousNext } from '@/components/docs/PreviousNext';
import { getDocContent, getAllDocSlugs } from '@/lib/docs';

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  // Filter out empty slugs since they're handled by /docs/page.tsx
  return slugs.filter(slug => slug.length > 0).map((slug) => ({ slug }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.join('/') || '';
  const doc = getDocContent(slug);

  if (!doc) {
    notFound();
  }

  return (
    <DocLayout>
      <div className="max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/docs" className="hover:text-violet-600">Docs</Link>
          {resolvedParams.slug?.map((segment, index) => {
            const isLast = index === resolvedParams.slug!.length - 1;
            const displayName = segment.replace(/-/g, ' ');
            
            return (
              <span key={segment} className="flex items-center">
                <span className="mx-2">/</span>
                <span className={isLast ? 'text-gray-900 font-medium capitalize' : 'text-gray-500 capitalize'}>
                  {displayName}
                </span>
              </span>
            );
          })}
        </nav>

        {/* Content */}
        <article className="prose prose-gray max-w-none prose-violet">
          <doc.component />
        </article>

        {/* Navigation */}
        <PreviousNext currentSlug={slug} />
      </div>
    </DocLayout>
  );
}
