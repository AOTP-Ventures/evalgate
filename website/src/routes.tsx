import type { RouteRecord } from 'vite-react-ssg';
import type { LoaderFunctionArgs } from 'react-router-dom';
import type { PageData } from './content/types';
import {
  getDefaultSlug,
  hasVersion,
  hasPage,
  loadPage,
  loadLlm,
  allVersionPaths,
  allLlmPaths,
  allPagePaths,
} from './content';
import Home from './pages/Home';
import DocsIndex from './pages/DocsIndex';
import DocPage from './pages/DocPage';
import LlmView from './pages/LlmView';
import NotFound from './pages/NotFound';

export interface DocLoaderData {
  version: string;
  slug: string;
  page: PageData | null;
  notFound: boolean;
}

export interface LlmLoaderData {
  version: string;
  text: string | null;
}

// Loaders run at build time (vite-react-ssg prerender) AND on client navigation
// (React Router data router). Their JSON-serializable return is baked into the
// prerendered HTML and reused on hydration.
async function docLoader({ params }: LoaderFunctionArgs): Promise<DocLoaderData> {
  const version = params.version as string;
  const slug = (params.slug as string | undefined) ?? getDefaultSlug(version) ?? '';

  if (!hasVersion(version) || !slug || !hasPage(version, slug)) {
    return { version, slug, page: null, notFound: true };
  }
  const page = await loadPage(version, slug);
  return { version, slug, page, notFound: !page };
}

async function llmLoader({ params }: LoaderFunctionArgs): Promise<LlmLoaderData> {
  const version = params.version as string;
  if (!hasVersion(version)) return { version, text: null };
  return { version, text: await loadLlm(version) };
}

export const routes: RouteRecord[] = [
  { path: '/', element: <Home /> },
  { path: '/docs', element: <DocsIndex /> },
  {
    path: '/docs/:version',
    element: <DocPage />,
    loader: docLoader,
    getStaticPaths: allVersionPaths,
  },
  {
    path: '/docs/:version/llm',
    element: <LlmView />,
    loader: llmLoader,
    getStaticPaths: allLlmPaths,
  },
  {
    path: '/docs/:version/:slug',
    element: <DocPage />,
    loader: docLoader,
    getStaticPaths: allPagePaths,
  },
  { path: '*', element: <NotFound /> },
];
