'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NavigationStructure } from '@/lib/navigation';

interface PreviousNextProps {
  currentSlug: string;
  version: string;
}

export function PreviousNext({ currentSlug, version }: PreviousNextProps) {
  const [navigation, setNavigation] = useState<NavigationStructure | null>(null);
  
  // Fetch navigation data when version changes
  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const response = await fetch(`/api/docs/${version}/navigation`);
        if (response.ok) {
          const navData = await response.json();
          setNavigation(navData);
        }
      } catch (error) {
        console.error('Failed to fetch navigation:', error);
      }
    };
    
    fetchNavigation();
  }, [version]);
  
  // Calculate previous/next pages
  const allPages = navigation ? navigation.sections.flatMap(section => 
    section.pages.map(page => ({ ...page, section: section.title }))
  ).sort((a, b) => a.order - b.order) : [];
  
  const currentIndex = allPages.findIndex(page => page.slug === currentSlug);
  const previous = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const next = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  if (!previous && !next) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 pt-8 mt-12">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Previous */}
        <div className="flex-1 w-full sm:w-auto">
          {previous ? (
            <Link
              href={`/docs/${version}/${previous.slug}`}
              className="group flex items-center text-left p-5 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-colors w-full"
            >
              <div className="mr-4 h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors flex-shrink-0">
                <ChevronLeft className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 group-hover:text-violet-600 font-medium">Previous</div>
                <div className="font-medium text-gray-900 group-hover:text-violet-700">{previous.title}</div>
                {previous.description && (
                  <div className="text-sm text-gray-500 mt-1 hidden sm:block">{previous.description}</div>
                )}
              </div>
            </Link>
          ) : (
            <div /> // Empty div for spacing
          )}
        </div>

        {/* Next */}
        <div className="flex-1 w-full sm:w-auto">
          {next ? (
            <Link
              href={`/docs/${version}/${next.slug}`}
              className="group flex items-center text-left p-5 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-colors w-full"
            >
              <div className="mr-4 h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors flex-shrink-0">
                <ChevronRight className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 group-hover:text-violet-600 font-medium">Next</div>
                <div className="font-medium text-gray-900 group-hover:text-violet-700">{next.title}</div>
                {next.description && (
                  <div className="text-sm text-gray-500 mt-1 hidden sm:block">{next.description}</div>
                )}
              </div>
            </Link>
          ) : (
            <div /> // Empty div for spacing
          )}
        </div>
      </div>
    </div>
  );
}
