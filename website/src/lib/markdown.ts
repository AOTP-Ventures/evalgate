import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeToc from 'rehype-toc';
import remarkGitHubBlockquoteAlert from 'remark-github-blockquote-alert';
import remarkDirective from 'remark-directive';
import { remarkCollapsible } from './markdown-collapsible';

// Import highlight.js languages we use most in documentation
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import xml from 'highlight.js/lib/languages/xml';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm) // GitHub Flavored Markdown
  .use(remarkDirective) // Support for directives like :::collapsible
  .use(remarkCollapsible) // Transform collapsible directives
  .use(remarkGitHubBlockquoteAlert) // Convert GitHub-style alerts to callouts
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw) // Allow raw HTML
  .use(rehypeSlug) // Add IDs to headings
  .use(rehypeToc, {
    headings: ['h2', 'h3'], // Which headings to include in TOC
    cssClasses: {
      toc: 'inline-toc-container bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8',
      list: 'toc-list space-y-2 text-sm',
      listItem: 'toc-item',
      link: 'toc-link block py-1.5 px-3 rounded-md transition-all text-gray-600 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-300 hover:shadow-sm'
    },
    nav: false // Don't wrap in nav element
  })
  .use(rehypeHighlight, {
    detect: true,
    ignoreMissing: true,
  })
  .use(rehypeStringify);

/**
 * Process markdown content into HTML using unified/remark/rehype
 * This provides proper markdown parsing with GFM support, syntax highlighting, and more
 */
export async function processMarkdown(markdown: string): Promise<string> {
  try {
    const result = await processor.process(markdown);
    return result.toString();
  } catch (error) {
    console.error('Markdown processing failed:', error);
    // Re-throw the error so calling code can handle it appropriately
    throw new Error(`Failed to process markdown: ${error}`);
  }
}


/**
 * Render markdown to HTML with graceful fallback
 * This is a convenience function for page components
 */
export async function renderMarkdownToHTML(markdown: string): Promise<string> {
  try {
    return await processMarkdown(markdown);
  } catch (error) {
    console.error('Markdown processing error, using basic fallback:', error);
    // Very basic fallback - just preserve line breaks and basic formatting
    return markdown
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/<p><\/p>/g, ''); // Remove empty paragraphs
  }
}
