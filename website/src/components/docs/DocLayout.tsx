'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, CheckSquare } from 'lucide-react';
import { docNavigation } from '@/lib/docs';
import { VersionSelector } from './VersionSelector';

interface DocLayoutProps {
  children: ReactNode;
}

export function DocLayout({ children }: DocLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EvalGate</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* GitHub link */}
            <Link
              href="https://github.com/AOTP-Ventures/evalgate"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-40 w-72 transform border-r border-gray-200 bg-white pt-16 transition-transform duration-200 ease-in-out lg:static lg:inset-0 lg:translate-x-0 lg:pt-0`}
        >
          <nav className="h-full overflow-y-auto p-6">
            {/* Version Selector */}
            <VersionSelector className="mb-8" />
            
            {docNavigation.map((section) => (
              <div key={section.title} className="mb-8">
                <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item) => {
                    const href = item.slug ? `/docs/${item.slug}` : '/docs';
                    const isActive = pathname === href;
                    
                    return (
                      <li key={item.slug}>
                        <Link
                          href={href}
                          onClick={() => setSidebarOpen(false)}
                          className={`block px-3 py-2 rounded-lg transition-colors group ${
                            isActive
                              ? 'bg-violet-50 border-l-2 border-violet-500'
                              : 'hover:bg-gray-50 border-l-2 border-transparent hover:border-gray-200'
                          }`}
                        >
                          <div className={`font-medium text-sm ${
                            isActive ? 'text-violet-700' : 'text-gray-900 group-hover:text-gray-900'
                          }`}>
                            {item.title}
                          </div>
                          {item.description && (
                            <div className={`text-xs mt-1 ${
                              isActive ? 'text-violet-600' : 'text-gray-500 group-hover:text-gray-600'
                            }`}>
                              {item.description}
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-gray-600 bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:pl-8">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
