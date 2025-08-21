import { 
  getVersionMarkdownFiles, 
  buildNavigationStructure, 
  validateNavigationStructure, 
  NavigationStructure,
  MarkdownFile,
  findFileBySlug
} from './frontmatter';

/**
 * Get navigation structure for a specific version
 */
export function getVersionNavigation(version: string): NavigationStructure {
  const markdownFiles = getVersionMarkdownFiles(version);
  const navigation = buildNavigationStructure(markdownFiles);
  
  // Validate and log warnings
  const warnings = validateNavigationStructure(navigation);
  if (warnings.length > 0) {
    console.warn(`Navigation warnings for ${version}:`, warnings);
  }
  
  return navigation;
}

/**
 * Get all available documentation versions
 */
export function getAvailableVersions(): string[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path');
  
  const docsDir = path.join(process.cwd(), 'docs');
  
  if (!fs.existsSync(docsDir)) {
    return [];
  }
  
  return fs.readdirSync(docsDir, { withFileTypes: true })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((dirent: any) => dirent.isDirectory())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((dirent: any) => dirent.name)
    .filter((name: string) => /^v\d+\.\d+\.\d+$/.test(name)) // Match version pattern
    .sort((a: string, b: string) => {
      // Sort versions in descending order (newest first)
      const [, aMajor, aMinor, aPatch] = a.match(/v(\d+)\.(\d+)\.(\d+)/) || [];
      const [, bMajor, bMinor, bPatch] = b.match(/v(\d+)\.(\d+)\.(\d+)/) || [];
      
      const aVersion = [parseInt(aMajor), parseInt(aMinor), parseInt(aPatch)];
      const bVersion = [parseInt(bMajor), parseInt(bMinor), parseInt(bPatch)];
      
      for (let i = 0; i < 3; i++) {
        if (aVersion[i] !== bVersion[i]) {
          return bVersion[i] - aVersion[i]; // Descending order
        }
      }
      return 0;
    });
}

/**
 * Get the latest available version
 */
export function getLatestVersion(): string | null {
  const versions = getAvailableVersions();
  return versions.length > 0 ? versions[0] : null;
}

/**
 * Get markdown content for a specific page
 */
export function getPageContent(version: string, slug: string): MarkdownFile | null {
  const markdownFiles = getVersionMarkdownFiles(version);
  return findFileBySlug(markdownFiles, slug);
}


/**
 * Get the default page for a version (page with lowest order)
 */
export function getDefaultPage(version: string): MarkdownFile | null {
  const markdownFiles = getVersionMarkdownFiles(version);
  
  if (markdownFiles.length === 0) {
    return null;
  }
  
  // Sort by order and return the first (lowest order)
  const sortedFiles = markdownFiles.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
  return sortedFiles[0];
}

/**
 * Get breadcrumb data for a specific page
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function getBreadcrumbs(version: string, slug: string): BreadcrumbItem[] {
  const pageContent = getPageContent(version, slug);
  
  if (!pageContent) {
    return [];
  }
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Documentation', href: '/docs' },
    { label: version, href: `/docs/${version}` },
  ];
  
  // Add section if different from page title
  if (pageContent.frontmatter.section !== pageContent.frontmatter.title) {
    breadcrumbs.push({
      label: pageContent.frontmatter.section,
    });
  }
  
  // Add current page
  breadcrumbs.push({
    label: pageContent.frontmatter.title,
  });
  
  return breadcrumbs;
}

/**
 * Search for pages across all content
 */
export interface SearchResult {
  version: string;
  title: string;
  section: string;
  slug: string;
  description: string;
  relevance: number;
}

export function searchPages(query: string): SearchResult[] {
  const versions = getAvailableVersions();
  const results: SearchResult[] = [];
  
  const searchTerms = query.toLowerCase().split(/\s+/);
  
  for (const version of versions) {
    const markdownFiles = getVersionMarkdownFiles(version);
    
    for (const file of markdownFiles) {
      const { title, section, slug, description } = file.frontmatter;
      
      // Calculate relevance based on matches in different fields
      let relevance = 0;
      const searchableContent = [
        title.toLowerCase(),
        section.toLowerCase(),
        description.toLowerCase(),
        slug.toLowerCase()
      ];
      
      for (const term of searchTerms) {
        for (let i = 0; i < searchableContent.length; i++) {
          if (searchableContent[i].includes(term)) {
            // Weight matches: title=4, section=3, description=2, slug=1
            relevance += 4 - i;
          }
        }
      }
      
      if (relevance > 0) {
        results.push({
          version,
          title,
          section,
          slug,
          description,
          relevance
        });
      }
    }
  }
  
  // Sort by relevance (descending)
  return results.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Get page metadata for SEO and display
 */
export interface PageMetadata {
  title: string;
  description: string;
  section: string;
  version: string;
  slug: string;
  canonicalUrl?: string;
}

export function getPageMetadata(version: string, slug: string, baseUrl: string = ''): PageMetadata | null {
  const pageContent = getPageContent(version, slug);
  
  if (!pageContent) {
    return null;
  }
  
  const { title, description, section } = pageContent.frontmatter;
  
  return {
    title: `${title} - EvalGate ${version} Documentation`,
    description,
    section,
    version,
    slug,
    canonicalUrl: `${baseUrl}/docs/${version}/${slug}`
  };
}

/**
 * Generate sitemap data for all documentation pages
 */
export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
}

export function generateSitemapData(baseUrl: string): SitemapEntry[] {
  const versions = getAvailableVersions();
  const entries: SitemapEntry[] = [];
  
  for (const version of versions) {
    const markdownFiles = getVersionMarkdownFiles(version);
    const isLatest = version === versions[0];
    
    for (const file of markdownFiles) {
      const { slug, order } = file.frontmatter;
      
      // Calculate priority based on version recency and page importance
      let priority = 0.5;
      if (isLatest) {
        priority += 0.3;
      }
      if (order === 1) {
        priority += 0.2; // Boost for introduction/landing pages
      }
      
      entries.push({
        url: `${baseUrl}/docs/${version}/${slug}`,
        changeFrequency: isLatest ? 'weekly' : 'monthly',
        priority: Math.min(priority, 1.0)
      });
    }
  }
  
  return entries;
}

/**
 * Cache management for navigation data
 */
const navigationCache = new Map<string, NavigationStructure>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in development, longer in production
const cacheTimestamps = new Map<string, number>();

export function getCachedNavigation(version: string): NavigationStructure {
  const now = Date.now();
  const cached = navigationCache.get(version);
  const timestamp = cacheTimestamps.get(version) || 0;
  
  // Use cache in production, always rebuild in development
  if (process.env.NODE_ENV === 'production' && cached && (now - timestamp) < CACHE_TTL) {
    return cached;
  }
  
  const navigation = getVersionNavigation(version);
  navigationCache.set(version, navigation);
  cacheTimestamps.set(version, now);
  
  return navigation;
}

/**
 * Clear navigation cache (useful for development)
 */
export function clearNavigationCache(version?: string): void {
  if (version) {
    navigationCache.delete(version);
    cacheTimestamps.delete(version);
  } else {
    navigationCache.clear();
    cacheTimestamps.clear();
  }
}

// Export types and functions for use in components
export type {
  NavigationStructure,
  NavigationSection,
  NavigationPage,
  MarkdownFile
} from './frontmatter';

// Re-export functions that components might need
export { getVersionMarkdownFiles } from './frontmatter';
