import { notFound } from 'next/navigation';
import { DocLayout } from '@/components/docs/DocLayout';
import { PreviousNext } from '@/components/docs/PreviousNext';
import { renderMarkdownToHTML } from '@/lib/markdown';
import { 
  getAvailableVersions, 
  getPageContent, 
  getBreadcrumbs,
  getVersionMarkdownFiles,
  getPageMetadata
} from '@/lib/navigation';
import type { Metadata } from 'next';

export default async function DocPageBySlug({ 
  params 
}: { 
  params: Promise<{ version: string; slug: string }> 
}) {
  const { version, slug } = await params;
  
  // Validate version format
  if (!/^v\d+\.\d+\.\d+$/.test(version)) {
    notFound();
  }
  
  // Check if version exists
  const availableVersions = getAvailableVersions();
  if (!availableVersions.includes(version)) {
    notFound();
  }
  
  // Get the page content by slug
  const pageContent = getPageContent(version, slug);
  
  if (!pageContent) {
    notFound();
  }
  
  const breadcrumbs = getBreadcrumbs(version, slug);
  
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

        {/* Content - TOC and layout structure handled by rehype-toc */}
        <article className="prose prose-slate max-w-none prose-lg 
          prose-headings:scroll-mt-20 prose-headings:font-display 
          prose-h1:text-4xl prose-h1:font-bold prose-h1:tracking-tight prose-h1:text-gray-900 prose-h1:mt-0 prose-h1:mb-8
          prose-h2:text-3xl prose-h2:font-semibold prose-h2:text-gray-900 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-4 prose-h2:mb-6 prose-h2:mt-12 
          prose-h3:text-2xl prose-h3:font-medium prose-h3:text-gray-900 prose-h3:mt-8 prose-h3:mb-4
          prose-h4:text-xl prose-h4:font-medium prose-h4:text-gray-900 prose-h4:mt-6 prose-h4:mb-3
          prose-p:text-gray-700 prose-p:leading-7 prose-p:mb-4
          prose-strong:text-gray-900 prose-strong:font-semibold 
          prose-code:text-violet-600 prose-code:bg-violet-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none 
          prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-800 prose-pre:shadow-lg prose-pre:rounded-lg
          prose-a:text-violet-600 prose-a:font-medium prose-a:no-underline hover:prose-a:text-violet-700 hover:prose-a:underline 
          prose-blockquote:border-l-violet-500 prose-blockquote:border-l-4 prose-blockquote:bg-violet-50/50 prose-blockquote:text-gray-800 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg
          prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-li:mb-2
          prose-table:text-sm prose-th:bg-gray-50 prose-th:font-semibold prose-th:text-gray-900 prose-th:border prose-th:border-gray-200 prose-th:p-3
          prose-td:text-gray-700 prose-td:border prose-td:border-gray-200 prose-td:p-3">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: await renderMarkdownToHTML(pageContent.content) 
            }} 
          />
          
          {/* Add click-to-copy functionality for code blocks */}
          <script dangerouslySetInnerHTML={{
            __html: `
              // Add click-to-copy functionality for code blocks
              document.addEventListener('DOMContentLoaded', function() {
                const preElements = document.querySelectorAll('pre');
                preElements.forEach(function(pre) {
                  pre.style.cursor = 'pointer';
                  pre.addEventListener('click', function() {
                    const code = pre.querySelector('code');
                    if (code) {
                      navigator.clipboard.writeText(code.textContent).then(function() {
                        const originalAfter = pre.style.setProperty('--copied', 'true');
                        setTimeout(function() {
                          pre.style.removeProperty('--copied');
                        }, 2000);
                      });
                    }
                  });
                });
              `
          }} />
        </article>

        {/* Navigation */}
        <PreviousNext currentSlug={slug} version={version} />
      </div>
    </DocLayout>
  );
}

export function generateStaticParams() {
  const versions = getAvailableVersions();
  const params: { version: string; slug: string }[] = [];
  
  for (const version of versions) {
    const markdownFiles = getVersionMarkdownFiles(version);
    
    for (const file of markdownFiles) {
      params.push({
        version,
        slug: file.frontmatter.slug
      });
    }
  }
  
  return params;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ version: string; slug: string }> 
}): Promise<Metadata> {
  const { version, slug } = await params;
  
  const metadata = getPageMetadata(version, slug);
  
  if (!metadata) {
    return {
      title: 'Page Not Found - EvalGate Documentation',
      description: 'The requested documentation page could not be found.'
    };
  }
  
  return {
    title: metadata.title,
    description: metadata.description,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: 'article',
      url: metadata.canonicalUrl
    },
    twitter: {
      card: 'summary',
      title: metadata.title,
      description: metadata.description
    }
  };
}
