'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export function CodeBlock({ code, language = 'text', filename, className = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-400">
          {filename || language}
        </span>
        <button
          onClick={copyToClipboard}
          className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
          title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Code */}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-100 font-mono leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}

// Convenience component for terminal commands
export function TerminalBlock({ commands, className = '' }: { commands: string[]; className?: string }) {
  const code = commands.map(cmd => `$ ${cmd}`).join('\n');
  
  return (
    <CodeBlock
      code={code}
      language="bash"
      filename="Terminal"
      className={className}
    />
  );
}
