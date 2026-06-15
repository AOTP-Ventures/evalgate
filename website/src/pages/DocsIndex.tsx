import { Navigate } from 'react-router-dom';
import { getLatestVersion, getDefaultSlug } from '@/content';
import NotFound from './NotFound';

// Mirrors the old /docs server redirect() to the latest version's default page.
export default function DocsIndex() {
  const latest = getLatestVersion();
  const defaultSlug = latest ? getDefaultSlug(latest) : undefined;

  if (!latest || !defaultSlug) {
    return <NotFound />;
  }
  return <Navigate to={`/docs/${latest}/${defaultSlug}`} replace />;
}
