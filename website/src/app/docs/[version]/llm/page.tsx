import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { getVersionMarkdownFiles } from '@/lib/navigation';

interface MarkdownFile {
  filename: string;
  title: string;
  content: string;
  order: number;
}

function getMarkdownFiles(version: string): MarkdownFile[] {
  try {
    // Use our frontmatter system to get properly ordered files
    const frontmatterFiles = getVersionMarkdownFiles(version);
    
    return frontmatterFiles.map(file => ({
      filename: path.basename(file.filePath),
      title: file.frontmatter.title,
      content: file.content,
      order: file.frontmatter.order
    })).sort((a, b) => a.order - b.order); // Sort by frontmatter order
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
  
  const markdownFiles = getMarkdownFiles(version);
  
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
