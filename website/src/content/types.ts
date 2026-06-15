// Client-safe content types. These mirror the structures produced by the
// build-time content pipeline (scripts/build-content.ts) and consumed by the
// SPA. No Node/`fs` imports here so this module is safe in the browser bundle.

export interface MarkdownFrontmatter {
  title: string;
  section: string;
  slug: string;
  order: number;
  description: string;
}

export interface NavigationPage {
  title: string;
  slug: string;
  description: string;
  order: number;
}

export interface NavigationSection {
  title: string;
  slug: string;
  pages: NavigationPage[];
}

export interface NavigationStructure {
  sections: NavigationSection[];
  defaultPage?: NavigationPage;
}

export interface PageData {
  frontmatter: MarkdownFrontmatter;
  html: string;
}

export interface VersionsManifest {
  versions: string[];
  latest: string | null;
}

export interface VersionManifestEntry {
  slugs: string[];
  defaultSlug: string;
}

export type ContentManifest = Record<string, VersionManifestEntry>;
