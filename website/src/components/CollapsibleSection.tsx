import React, { ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false, 
  className = '' 
}: CollapsibleSectionProps) {
  return (
    <details 
      className={`collapsible-section border border-gray-200 rounded-lg mb-4 ${className}`}
      open={defaultOpen}
    >
      <summary className="collapsible-summary cursor-pointer select-none p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-lg font-medium text-gray-900">
        <span className="inline-flex items-center">
          <svg 
            className="collapsible-chevron w-4 h-4 mr-2 transform transition-transform duration-200"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {title}
        </span>
      </summary>
      <div className="collapsible-content p-4 pt-2 border-t border-gray-200">
        {children}
      </div>
    </details>
  );
}

export default CollapsibleSection;
