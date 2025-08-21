import { notFound } from 'next/navigation';
import { DocLayout } from '@/components/docs/DocLayout';
import { PreviousNext } from '@/components/docs/PreviousNext';
import { renderMarkdownToHTML } from '@/lib/markdown';
import { 
  getAvailableVersions, 
  getDefaultPage, 
  getBreadcrumbs 
} from '@/lib/navigation';

export default async function VersionedDocsPage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  
  // Validate version format
  if (!/^v\d+\.\d+\.\d+$/.test(version)) {
    notFound();
  }
  
  // Check if version exists
  const availableVersions = getAvailableVersions();
  if (!availableVersions.includes(version)) {
    notFound();
  }
  
  // Get the default page (lowest order) for this version
  const defaultPage = getDefaultPage(version);
  
  if (!defaultPage) {
    return (
      <DocLayout version={version}>
        <div className="max-w-4xl">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <span className="text-gray-900 font-medium">Docs</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{version}</span>
          </nav>

          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              No Documentation Found
            </h1>
            <p className="text-gray-600">
              No markdown files found for version {version}.
            </p>
          </div>
        </div>
      </DocLayout>
    );
  }
  
  const breadcrumbs = getBreadcrumbs(version, defaultPage.frontmatter.slug);
  
  return (
    <DocLayout version={version}>
      <div className="max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              {index > 0 && <span>/</span>}
              {item.href ? (
                <a href={item.href} className="text-gray-900 font-medium hover:text-blue-600">
                  {item.label}
                </a>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Content */}
        <article className="prose prose-slate max-w-none prose-lg">
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ 
              __html: await renderMarkdownToHTML(defaultPage.content) 
            }} 
          />
        </article>

        {/* Navigation */}
        <PreviousNext currentSlug={defaultPage.frontmatter.slug} version={version} />
      </div>
    </DocLayout>
  );
}

export function generateStaticParams() {
  return getAvailableVersions().map(version => ({ version }));
}
