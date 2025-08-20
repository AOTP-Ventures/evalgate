import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { DocLayout } from '@/components/docs/DocLayout';
import { PreviousNext } from '@/components/docs/PreviousNext';

interface MarkdownFile {
  filename: string;
  title: string;
  content: string;
}

function extractTitle(content: string): string {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.slice(2).trim();
    }
  }
  return 'Untitled';
}

function getMarkdownFiles(docsDir: string): MarkdownFile[] {
  try {
    const files = fs.readdirSync(docsDir)
      .filter(file => file.endsWith('.md') && file !== 'COMPLETE.md')
      .sort();
    
    return files.map(filename => {
      const filePath = path.join(docsDir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      const title = extractTitle(content);
      
      return { filename, title, content };
    });
  } catch (error) {
    return [];
  }
}

function renderMarkdownToHTML(markdown: string): string {
  // Simple markdown-to-HTML conversion for basic formatting
  return markdown
    .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold text-gray-900 mb-6">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold text-gray-900 mb-4 mt-8">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold text-gray-900 mb-3 mt-6">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-xl font-bold text-gray-900 mb-2 mt-4">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">$1</code>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
    .replace(/^• (.*$)/gim, '<li class="ml-4">• $1</li>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>')
    .replace(/```\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
    .split('\n')
    .map(line => {
      if (line.trim() && !line.startsWith('<') && !line.includes('<li')) {
        return `<p class="mb-4">${line}</p>`;
      }
      return line;
    })
    .join('\n')
    .replace(/<p class="mb-4"><\/p>/g, ''); // Remove empty paragraphs
}

export default async function VersionedDocsPage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  
  // Validate version format
  if (!/^v\d+\.\d+\.\d+$/.test(version)) {
    notFound();
  }
  
  const docsDir = path.join(process.cwd(), 'docs', version);
  
  if (!fs.existsSync(docsDir)) {
    notFound();
  }
  
  const markdownFiles = getMarkdownFiles(docsDir);
  
  if (markdownFiles.length === 0) {
    return (
      <DocLayout>
        <div className="max-w-4xl">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <span className="text-gray-900 font-medium">Docs</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{version}</span>
          </nav>

          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              No Documentation Found
            </h1>
            <p className="text-gray-600">
              No markdown files found for version {version}.
            </p>
          </div>
        </div>
      </DocLayout>
    );
  }
  
  return (
    <DocLayout>
      <div className="max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span className="text-gray-900 font-medium">Docs</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{version}</span>
        </nav>

        {/* Content */}
        <div className="space-y-12">
          {markdownFiles.map((file, index) => (
            <article key={file.filename} className="prose prose-gray max-w-none prose-violet">
              {index > 0 && (
                <div className="border-t border-gray-200 pt-8 mb-8" />
              )}
              
              <div 
                className="markdown-content"
                dangerouslySetInnerHTML={{ 
                  __html: renderMarkdownToHTML(file.content) 
                }} 
              />
            </article>
          ))}
        </div>

        {/* Navigation */}
        <PreviousNext currentSlug={version} />
      </div>
    </DocLayout>
  );
}

export function generateStaticParams() {
  const docsDir = path.join(process.cwd(), 'docs');
  
  try {
    const versions = fs.readdirSync(docsDir)
      .filter(item => {
        const itemPath = path.join(docsDir, item);
        return fs.statSync(itemPath).isDirectory() && /^v\d+\.\d+\.\d+$/.test(item);
      });
    
    return versions.map(version => ({ version }));
  } catch (error) {
    return [];
  }
}
