'use client';

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

// Function to create slugs the same way rehype-slug does
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{2,4})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2]
        .trim()
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
        .replace(/`([^`]+)`/g, '$1')     // Remove code markdown
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links, keep text
      
      const id = createSlug(text);
      
      if (level >= 2 && level <= 4) { // Only show h2, h3, h4
        items.push({ id, text, level });
      }
    }

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    // Set up intersection observer to track active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    // Observe all headings
    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  if (tocItems.length < 2) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="sticky top-24 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 mb-8">
      <div className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-3">
        <List className="h-4 w-4" />
        <span>On this page</span>
      </div>
      <nav>
        <ul className="space-y-1 text-sm">
          {tocItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`block w-full text-left py-1 px-2 rounded transition-colors ${
                  activeId === item.id
                    ? 'bg-violet-100 text-violet-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } ${
                  item.level === 3 ? 'ml-4' : item.level === 4 ? 'ml-8' : ''
                }`}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
