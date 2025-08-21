import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Element, Text } from 'hast';


// Remark plugin to transform collapsible directives
export const remarkCollapsible: Plugin<[], Root> = () => {
  return (tree) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, 'containerDirective', (node: any, index: number | undefined, parent: any) => {
      if (node.name !== 'collapsible') return;

      const title = node.attributes?.title || 'Details';
      const defaultOpen = node.attributes?.open === 'true';

      // Transform to HTML structure
      const details: Element = {
        type: 'element',
        tagName: 'details',
        properties: {
          className: ['collapsible-section', 'border', 'border-gray-200', 'rounded-lg', 'mb-4'],
          ...(defaultOpen && { open: true }),
        },
        children: [
          {
            type: 'element',
            tagName: 'summary',
            properties: {
              className: [
                'collapsible-summary',
                'cursor-pointer',
                'select-none',
                'p-4',
                'bg-gray-50',
                'hover:bg-gray-100',
                'transition-colors',
                'duration-200',
                'rounded-lg',
                'font-medium',
                'text-gray-900',
              ],
            },
            children: [
              {
                type: 'element',
                tagName: 'span',
                properties: {
                  className: ['inline-flex', 'items-center'],
                },
                children: [
                  {
                    type: 'element',
                    tagName: 'svg',
                    properties: {
                      className: [
                        'collapsible-chevron',
                        'w-4',
                        'h-4',
                        'mr-2',
                        'transform',
                        'transition-transform',
                        'duration-200',
                      ],
                      fill: 'none',
                      stroke: 'currentColor',
                      viewBox: '0 0 24 24',
                    },
                    children: [
                      {
                        type: 'element',
                        tagName: 'path',
                        properties: {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          strokeWidth: 2,
                          d: 'M9 5l7 7-7 7',
                        },
                        children: [],
                      },
                    ],
                  },
                  {
                    type: 'text',
                    value: title,
                  } as Text,
                ],
              },
            ],
          },
          {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['collapsible-content', 'p-4', 'pt-2', 'border-t', 'border-gray-200'],
            },
            children: node.children || [],
          },
        ],
      };

      // Replace the directive with the details element
      if (parent && typeof index === 'number') {
        parent.children[index] = details;
      }
    });
  };
};

export default remarkCollapsible;
