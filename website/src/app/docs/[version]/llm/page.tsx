import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';

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

function combineDocumentation(version: string, files: MarkdownFile[]): string {
  const combined: string[] = [];
  
  combined.push(`# EvalGate Documentation ${version}`);
  combined.push('');
  combined.push('This is the complete EvalGate documentation for LLM reference.');
  combined.push('');
  
  // Table of contents
  combined.push('## Table of Contents');
  combined.push('');
  files.forEach((file, i) => {
    combined.push(`${i + 1}. [${file.title}](#${file.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')})`);
  });
  combined.push('');
  combined.push('---');
  combined.push('');
  
  // Content sections
  files.forEach((file, i) => {
    combined.push(`## ${i + 1}. ${file.title}`);
    combined.push('');
    combined.push(`*Source: ${file.filename}*`);
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

export default async function LLMDocumentationPage({ params }: { params: Promise<{ version: string }> }) {
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
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              No Documentation Found
            </h1>
            <p className="text-gray-600">
              No markdown files found for version {version}.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const combinedContent = combineDocumentation(version, markdownFiles);
  
  return (
    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
      {combinedContent}
    </pre>
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
