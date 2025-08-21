'use client';

import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface EnhancedCodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
  highlightLines?: number[];
}

export function EnhancedCodeBlock({ 
  children, 
  language = 'text', 
  filename,
  highlightLines = []
}: EnhancedCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languageIcon = language === 'bash' || language === 'shell' ? (
    <Terminal className="h-4 w-4" />
  ) : null;

  const languageLabel = {
    javascript: 'JavaScript',
    typescript: 'TypeScript', 
    python: 'Python',
    yaml: 'YAML',
    json: 'JSON',
    bash: 'Bash',
    shell: 'Shell',
  }[language] || language.toUpperCase();

  return (
    <div className="relative group my-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 text-sm rounded-t-lg border-b border-gray-700">
        <div className="flex items-center space-x-2">
          {languageIcon}
          <span className="font-medium">{filename || languageLabel}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code content */}
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm leading-relaxed">
        <code className={`language-${language}`}>
          {children.split('\n').map((line, index) => (
            <div
              key={index}
              className={`${
                highlightLines.includes(index + 1) 
                  ? 'bg-yellow-500/20 border-l-2 border-yellow-400 pl-2 -ml-2' 
                  : ''
              }`}
            >
              {line}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
