'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VersionSelectorProps {
  currentVersion?: string;
  className?: string;
}

export function VersionSelector({ currentVersion, className }: VersionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  
  // Auto-detect current version from URL
  const detectedVersion = pathname.match(/\/docs\/(v\d+\.\d+\.\d+)/)?.[1] || 'v0.3.0';
  const activeVersion = currentVersion || detectedVersion;

  useEffect(() => {
    // Get available versions from API
    const fetchVersions = async () => {
      try {
        const response = await fetch('/api/docs/versions');
        if (response.ok) {
          const data = await response.json();
          setVersions(data.versions);
        }
      } catch (error) {
        console.error('Failed to fetch versions:', error);
        // Fallback to hardcoded versions
        setVersions(['v0.3.0', 'v0.2.0']);
      }
    };
    
    fetchVersions();
  }, []);

  const handleVersionChange = (version: string) => {
    setIsOpen(false);
    
    // Navigate to the same path but with the new version
    if (pathname.includes('/docs/')) {
      // If we're in a versioned docs path, replace the version
      const newPath = pathname.replace(/\/docs\/v[\d.]+/, `/docs/${version}`);
      router.push(newPath);
    } else {
      // If we're on the main docs page, go to the version's docs
      router.push(`/docs/${version}`);
    }
  };

  const handleLLMView = () => {
    setIsOpen(false);
    router.push(`/docs/${activeVersion}/llm`);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Version Label */}
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
        Version
      </div>
      
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium",
          "bg-white border border-gray-200 rounded-lg shadow-sm",
          "hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500",
          "transition-all duration-150"
        )}
      >
        <div className="flex items-center">
          <div className="w-2 h-2 bg-violet-500 rounded-full mr-2" />
          <span className="text-gray-900">{activeVersion}</span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-gray-400 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Content */}
          <div className="absolute left-0 right-0 z-20 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {/* Versions */}
            <div className="py-1">
              {versions.map((version) => (
                <button
                  key={version}
                  onClick={() => handleVersionChange(version)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors",
                    version === activeVersion
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center">
                    <div className={cn(
                      "w-2 h-2 rounded-full mr-2",
                      version === activeVersion ? "bg-violet-500" : "bg-gray-300"
                    )} />
                    <span className={version === activeVersion ? "font-medium" : "font-normal"}>
                      {version}
                    </span>
                  </div>
                  {version === activeVersion && (
                    <Check className="h-4 w-4 text-violet-500" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Separator */}
            <div className="h-px bg-gray-200" />
            
            {/* LLM View */}
            <button
              onClick={handleLLMView}
              className="w-full flex items-center px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Zap className="h-4 w-4 mr-2 text-amber-500" />
              <span>LLM View</span>
              <span className="ml-auto text-xs text-gray-400">→</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
