import { useEffect, useRef } from 'react';
import { useLoaderData, useNavigate, Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { DocLayout } from '@/components/docs/DocLayout';
import { PreviousNext } from '@/components/docs/PreviousNext';
import type { DocLoaderData } from '@/routes';
import NotFound from './NotFound';

// Preserved verbatim from the old app/docs/[version]/[slug]/page.tsx so the
// rendered markdown keeps identical typography.
const PROSE_CLASSES = `prose prose-slate max-w-none prose-lg
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
  prose-td:text-gray-700 prose-td:border prose-td:border-gray-200 prose-td:p-3`;

export default function DocPage() {
  const data = useLoaderData() as DocLoaderData;
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const html = data.page?.html;

  // Re-bind interactivity to the freshly injected HTML on every page change.
  // Replaces the old inline <script> (which only fired on the initial load).
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !html) return;

    // Click any code block to copy its contents.
    const onPreClick = (event: Event) => {
      const pre = event.currentTarget as HTMLElement;
      const code = pre.querySelector('code');
      if (code?.textContent) {
        void navigator.clipboard.writeText(code.textContent).then(() => {
          pre.setAttribute('data-copied', 'true');
          window.setTimeout(() => pre.removeAttribute('data-copied'), 2000);
        });
      }
    };
    const pres = Array.from(el.querySelectorAll('pre'));
    pres.forEach((pre) => {
      (pre as HTMLElement).style.cursor = 'pointer';
      pre.addEventListener('click', onPreClick);
    });

    // Intercept same-origin in-content links so they navigate via the SPA
    // router instead of triggering a full page reload.
    const onLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const anchor = (event.target as HTMLElement).closest('a');
      const href = anchor?.getAttribute('href');
      if (!anchor || !href || anchor.target === '_blank') return;
      // Only intercept internal path links; leave hashes and external URLs alone.
      if (href.startsWith('/') && !href.startsWith('//')) {
        event.preventDefault();
        navigate(href);
      }
    };
    el.addEventListener('click', onLinkClick);

    return () => {
      pres.forEach((pre) => pre.removeEventListener('click', onPreClick));
      el.removeEventListener('click', onLinkClick);
    };
  }, [html, navigate]);

  if (data.notFound || !data.page) {
    return <NotFound />;
  }

  const { page, version, slug } = data;
  const { title, description, section } = page.frontmatter;
  const pageTitle = `${title} - EvalGate ${version} Documentation`;

  // Breadcrumbs mirror the old getBreadcrumbs() output.
  const crumbs: { label: string; href?: string }[] = [
    { label: 'Documentation', href: '/docs' },
    { label: version, href: `/docs/${version}` },
    ...(section && section !== title ? [{ label: section }] : []),
    { label: title },
  ];

  return (
    <DocLayout version={version}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
      </Head>
      <div className="max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          {crumbs.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              {index > 0 && <span>/</span>}
              {item.href ? (
                <Link to={item.href} className="text-gray-900 font-medium hover:text-violet-600">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Content */}
        <article className={PROSE_CLASSES}>
          <div ref={containerRef} dangerouslySetInnerHTML={{ __html: page.html }} />
        </article>

        {/* Navigation */}
        <PreviousNext currentSlug={slug} version={version} />
      </div>
    </DocLayout>
  );
}
