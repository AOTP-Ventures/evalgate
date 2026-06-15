// Client access layer over the build-time content artifacts in src/generated.
//
// Navigation + manifests are small and imported eagerly so the sidebar and
// route table render synchronously. Per-page HTML and the (large) LLM text are
// imported lazily via import.meta.glob so they never bloat the landing bundle.
import versionsJson from '@/generated/versions.json';
import manifestJson from '@/generated/manifest.json';
import type {
  ContentManifest,
  NavigationStructure,
  PageData,
  VersionsManifest,
} from './types';

export const versionsManifest = versionsJson as VersionsManifest;
export const manifest = manifestJson as ContentManifest;

// Eager: navigation structures (one small JSON per version).
const navigationModules = import.meta.glob<NavigationStructure>(
  '../generated/navigation/*.json',
  { eager: true, import: 'default' },
);

// Lazy: per-page rendered HTML.
const pageModules = import.meta.glob<PageData>('../generated/pages/*/*.json', {
  import: 'default',
});

// Lazy: combined plain-text LLM view.
const llmModules = import.meta.glob<string>('../generated/llm/*.txt', {
  query: '?raw',
  import: 'default',
});

const navKey = (version: string) => `../generated/navigation/${version}.json`;
const pageKey = (version: string, slug: string) =>
  `../generated/pages/${version}/${slug}.json`;
const llmKey = (version: string) => `../generated/llm/${version}.txt`;

export function getVersions(): string[] {
  return versionsManifest.versions;
}

export function getLatestVersion(): string | null {
  return versionsManifest.latest;
}

export function hasVersion(version: string): boolean {
  return Object.prototype.hasOwnProperty.call(manifest, version);
}

export function hasPage(version: string, slug: string): boolean {
  return manifest[version]?.slugs.includes(slug) ?? false;
}

export function getDefaultSlug(version: string): string | undefined {
  return manifest[version]?.defaultSlug;
}

export function getNavigation(version: string): NavigationStructure | null {
  return navigationModules[navKey(version)] ?? null;
}

export async function loadPage(
  version: string,
  slug: string,
): Promise<PageData | null> {
  const loader = pageModules[pageKey(version, slug)];
  return loader ? loader() : null;
}

export async function loadLlm(version: string): Promise<string | null> {
  const loader = llmModules[llmKey(version)];
  return loader ? loader() : null;
}

/** All `/docs/:version` paths — used by the SSG route enumerator. */
export function allVersionPaths(): string[] {
  return getVersions().map((v) => `/docs/${v}`);
}

/** All `/docs/:version/llm` paths — used by the SSG route enumerator. */
export function allLlmPaths(): string[] {
  return getVersions().map((v) => `/docs/${v}/llm`);
}

/** All `/docs/:version/:slug` paths — used by the SSG route enumerator. */
export function allPagePaths(): string[] {
  return getVersions().flatMap((v) =>
    manifest[v].slugs.map((slug) => `/docs/${v}/${slug}`),
  );
}
