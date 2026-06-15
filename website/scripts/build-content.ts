/**
 * Build-time content pipeline.
 *
 * Reads the per-version markdown under docs/, renders each page to HTML with
 * the EXACT same unified
 * (remark/rehype/highlight.js) pipeline the Next app used, and emits static
 * JSON/text the SPA imports at build time. This keeps the heavy markdown
 * dependencies out of the browser bundle (they are devDependencies only).
 *
 * Run via `npm run build:content` (wired to predev/prebuild).
 *
 * Emits:
 *   src/generated/versions.json              { versions, latest }
 *   src/generated/manifest.json              { [version]: { slugs, defaultSlug } }
 *   src/generated/navigation/<version>.json  NavigationStructure
 *   src/generated/pages/<version>/<slug>.json { frontmatter, html }
 *   src/generated/llm/<version>.txt          combined plain text (in-app view)
 *   public/docs/<version>/llm.txt            combined plain text (raw text/plain asset)
 */
import fs from 'node:fs';
import path from 'node:path';
import { renderMarkdownToHTML } from '../src/lib/markdown';
import { getVersionMarkdownFiles, buildNavigationStructure } from '../src/lib/frontmatter';
import { compareVersionsDesc, combineDocumentation } from '../src/lib/content-build';

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');
const OUT_SRC = path.join(ROOT, 'src', 'generated');
const OUT_PUB = path.join(ROOT, 'public', 'docs');

const VERSION_RE = /^v\d+\.\d+\.\d+$/;

function listVersions(): string[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return fs
    .readdirSync(DOCS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && VERSION_RE.test(d.name))
    .map((d) => d.name)
    .sort(compareVersionsDesc);
}

function writeJson(relPath: string, data: unknown): void {
  const full = path.join(OUT_SRC, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data));
}

function writeText(full: string, text: string): void {
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, text);
}

async function main(): Promise<void> {
  const versions = listVersions();

  // Start each build from a clean slate so deleted docs don't linger.
  fs.rmSync(OUT_SRC, { recursive: true, force: true });
  fs.rmSync(OUT_PUB, { recursive: true, force: true });

  const manifest: Record<string, { slugs: string[]; defaultSlug: string }> = {};
  // Only versions with usable (frontmatter-bearing) markdown are published. The
  // old app listed every docs/ subdir, including ones with no frontmatter
  // (e.g. v0.2.0), which rendered a broken "No Documentation Found" page.
  const builtVersions: string[] = [];

  for (const version of versions) {
    const files = getVersionMarkdownFiles(version);
    if (files.length === 0) {
      console.warn(`[build-content] skipping ${version}: no frontmatter docs`);
      continue;
    }
    builtVersions.push(version);

    const navigation = buildNavigationStructure(files);
    writeJson(path.join('navigation', `${version}.json`), navigation);

    for (const file of files) {
      const html = await renderMarkdownToHTML(file.content);
      writeJson(path.join('pages', version, `${file.frontmatter.slug}.json`), {
        frontmatter: file.frontmatter,
        html,
      });
    }

    const combined = combineDocumentation(version, files);
    writeText(path.join(OUT_SRC, 'llm', `${version}.txt`), combined);
    writeText(path.join(OUT_PUB, version, 'llm.txt'), combined);

    manifest[version] = {
      slugs: files.map((f) => f.frontmatter.slug),
      defaultSlug: navigation.defaultPage?.slug ?? files[0].frontmatter.slug,
    };
  }

  writeJson('versions.json', { versions: builtVersions, latest: builtVersions[0] ?? null });
  writeJson('manifest.json', manifest);

  const pageCount = Object.values(manifest).reduce((n, v) => n + v.slugs.length, 0);
  console.log(
    `[build-content] ${builtVersions.length} version(s), ${pageCount} page(s) -> src/generated, public/docs`,
  );
}

main().catch((err) => {
  console.error('[build-content] failed:', err);
  process.exit(1);
});
