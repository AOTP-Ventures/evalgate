import { redirect } from 'next/navigation';
import { getLatestVersion, getDefaultPage } from '@/lib/navigation';

export default function Docs() {
  // Get the latest version and redirect to its default page
  const latestVersion = getLatestVersion();
  
  if (!latestVersion) {
    // Fallback if no versions found - redirect to version page which will show default
    redirect('/docs/v0.3.0');
    return;
  }
  
  // Get the default page for this version
  const defaultPage = getDefaultPage(latestVersion);
  
  if (!defaultPage) {
    // If no default page found, redirect to version page which will handle it
    redirect(`/docs/${latestVersion}`);
    return;
  }
  
  // Redirect to the specific default page
  redirect(`/docs/${latestVersion}/${defaultPage.frontmatter.slug}`);
}
