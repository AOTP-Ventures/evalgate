// Build-time helpers shared by the content pipeline (scripts/build-content.ts).
// Pure string/array logic — no `fs`, but only used at build time.
import type { MarkdownFile } from './frontmatter';

/**
 * Compare two `vX.Y.Z` version strings, newest first (descending).
 * Lifted from the sort comparator in the old navigation.ts.
 */
export function compareVersionsDesc(a: string, b: string): number {
  const [, aMajor, aMinor, aPatch] = a.match(/v(\d+)\.(\d+)\.(\d+)/) || [];
  const [, bMajor, bMinor, bPatch] = b.match(/v(\d+)\.(\d+)\.(\d+)/) || [];

  const av = [parseInt(aMajor), parseInt(aMinor), parseInt(aPatch)];
  const bv = [parseInt(bMajor), parseInt(bMinor), parseInt(bPatch)];

  for (let i = 0; i < 3; i++) {
    if (av[i] !== bv[i]) return bv[i] - av[i];
  }
  return 0;
}

/**
 * Concatenate all of a version's markdown into one plain-text document for the
 * "LLM View". Ported verbatim from the old app/docs/[version]/llm/page.tsx so
 * the output is byte-identical.
 */
export function combineDocumentation(version: string, files: MarkdownFile[]): string {
  const ordered = [...files].sort((a, b) => a.frontmatter.order - b.frontmatter.order);
  const combined: string[] = [];

  combined.push(`# EvalGate Documentation ${version}`);
  combined.push('');
  combined.push('This is the complete EvalGate documentation for LLM reference.');
  combined.push('');

  // Table of contents
  combined.push('## Table of Contents');
  combined.push('');
  ordered.forEach((file, i) => {
    const anchor = file.frontmatter.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    combined.push(`${i + 1}. [${file.frontmatter.title}](#${anchor})`);
  });
  combined.push('');
  combined.push('---');
  combined.push('');

  // Content sections
  ordered.forEach((file, i) => {
    const filename = file.filePath.split('/').pop() ?? file.frontmatter.slug;
    combined.push(`## ${i + 1}. ${file.frontmatter.title}`);
    combined.push('');
    combined.push(`*Source: ${filename}*`);
    combined.push('');

    // Remove the first H1 from content since we're adding our own
    const lines = file.content.split('\n');
    let skipFirstH1 = true;
    const filteredLines: string[] = [];
    for (const line of lines) {
      if (skipFirstH1 && line.startsWith('# ')) {
        skipFirstH1 = false;
        continue;
      }
      filteredLines.push(line);
    }

    combined.push(filteredLines.join('\n').trim());
    combined.push('');
    combined.push('---');
    combined.push('');
  });

  return combined.join('\n');
}
