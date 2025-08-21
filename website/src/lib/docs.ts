
// Import all doc content components
import { Introduction } from '@/components/docs/content/Introduction';
import { QuickStart } from '@/components/docs/content/QuickStart';
import { HowItWorks } from '@/components/docs/content/HowItWorks';
import { TestFixtures } from '@/components/docs/content/BasicSetup';
import { LLMAsJudge } from '@/components/docs/content/LLMAsJudge';
import { GitHubActions } from '@/components/docs/content/GitHubActions';
import { Evaluators } from '@/components/docs/content/Evaluators';
import { Configuration } from '@/components/docs/content/Configuration';
import { UseCases } from '@/components/docs/content/UseCases';

// Types
export interface DocItem {
  title: string;
  slug: string;
  component: React.ComponentType;
  description?: string;
}

export interface DocSection {
  title: string;
  items: DocItem[];
}

// Navigation structure - designed around user journey
export const docNavigation: DocSection[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Introduction',
        slug: '',
        component: Introduction,
        description: 'What is EvalGate and why use it'
      }
    ]
  },
  {
    title: 'Get Started',
    items: [
      {
        title: 'How It Works',
        slug: 'how-it-works',
        component: HowItWorks,
        description: 'Architecture and evaluation flow'
      },
      {
        title: 'Quick Start',
        slug: 'quick-start',
        component: QuickStart,
        description: 'Get running in 10 minutes'
      }
    ]
  },
  {
    title: 'Core Concepts',
    items: [
      {
        title: 'Evaluators',
        slug: 'concepts/evaluators',
        component: Evaluators,
        description: 'Understanding evaluation types'
      },
      {
        title: 'Configuration',
        slug: 'concepts/configuration',
        component: Configuration,
        description: 'Config file structure and options'
      },
      {
        title: 'Test Fixtures',
        slug: 'concepts/fixtures',
        component: TestFixtures,
        description: 'Creating and organizing test cases'
      }
    ]
  },
  {
    title: 'Advanced Features',
    items: [
      {
        title: 'LLM as Judge',
        slug: 'advanced/llm-as-judge',
        component: LLMAsJudge,
        description: 'AI-powered quality evaluation'
      },
      {
        title: 'GitHub Integration',
        slug: 'advanced/github-actions',
        component: GitHubActions,
        description: 'CI/CD workflows and automation'
      }
    ]
  },
  {
    title: 'Examples & Patterns',
    items: [
      {
        title: 'Common Use Cases',
        slug: 'examples/use-cases',
        component: UseCases,
        description: 'Real-world implementation examples'
      },
      {
        title: 'Best Practices',
        slug: 'examples/best-practices',
        component: UseCases, // Will be updated with best practices
        description: 'Tips and patterns from production'
      }
    ]
  },
  {
    title: 'Help',
    items: [
      {
        title: 'Troubleshooting',
        slug: 'help/troubleshooting',
        component: UseCases, // Will be updated with troubleshooting
        description: 'Common issues and solutions'
      },
      {
        title: 'FAQ',
        slug: 'help/faq',
        component: UseCases, // Will be updated with FAQ
        description: 'Frequently asked questions'
      }
    ]
  }
];

// Utility functions
export function getDocContent(slug: string): DocItem | null {
  for (const section of docNavigation) {
    const item = section.items.find(item => item.slug === slug);
    if (item) return item;
  }
  return null;
}

export function getAllDocSlugs(): string[][] {
  const slugs: string[][] = [];
  for (const section of docNavigation) {
    for (const item of section.items) {
      if (item.slug) {
        slugs.push(item.slug.split('/'));
      } else {
        slugs.push([]);
      }
    }
  }
  return slugs;
}

export function getPreviousNext(currentSlug: string): { previous: DocItem | null; next: DocItem | null } {
  const allItems: DocItem[] = [];
  docNavigation.forEach(section => {
    allItems.push(...section.items);
  });

  const currentIndex = allItems.findIndex(item => item.slug === currentSlug);
  
  return {
    previous: currentIndex > 0 ? allItems[currentIndex - 1] : null,
    next: currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null
  };
}
