import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';

export interface MarkdownFrontmatter {
  title: string;
  section: string;
  slug: string;
  order: number;
  description: string;
}

export interface MarkdownFile {
  frontmatter: MarkdownFrontmatter;
  content: string;
  filePath: string;
}

export interface NavigationSection {
  title: string;
  slug: string;
  pages: NavigationPage[];
}

export interface NavigationPage {
  title: string;
  slug: string;
  description: string;
  order: number;
}

export interface NavigationStructure {
  sections: NavigationSection[];
  defaultPage?: NavigationPage;
}

/**
 * Parse frontmatter and content from a markdown file
 */
export function parseMarkdownFile(filePath: string): MarkdownFile | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);
    
    // Validate required frontmatter fields
    const requiredFields: (keyof MarkdownFrontmatter)[] = ['title', 'section', 'slug', 'order', 'description'];
    const missingFields = requiredFields.filter(field => !(field in frontmatter));
    
    if (missingFields.length > 0) {
      console.warn(`Missing frontmatter fields in ${filePath}: ${missingFields.join(', ')}`);
      return null;
    }
    
    return {
      frontmatter: frontmatter as MarkdownFrontmatter,
      content,
      filePath
    };
  } catch (error) {
    console.error(`Error parsing markdown file ${filePath}:`, error);
    return null;
  }
}

/**
 * Get all markdown files for a specific version
 */
export function getVersionMarkdownFiles(version: string): MarkdownFile[] {
  const versionDir = path.join(process.cwd(), 'docs', version);
  
  if (!fs.existsSync(versionDir)) {
    return [];
  }
  
  const files = fs.readdirSync(versionDir)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(versionDir, file))
    .map(parseMarkdownFile)
    .filter((file): file is MarkdownFile => file !== null);
  
  return files;
}

/**
 * Build navigation structure from markdown files
 */
export function buildNavigationStructure(markdownFiles: MarkdownFile[]): NavigationStructure {
  // Group files by section
  const sectionMap = new Map<string, MarkdownFile[]>();
  
  for (const file of markdownFiles) {
    const section = file.frontmatter.section;
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section)!.push(file);
  }
  
  // Build sections with sorted pages
  const sections: NavigationSection[] = [];
  
  for (const [sectionTitle, files] of sectionMap.entries()) {
    // Sort files by order within section
    const sortedFiles = files.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
    
    const pages: NavigationPage[] = sortedFiles.map(file => ({
      title: file.frontmatter.title,
      slug: file.frontmatter.slug,
      description: file.frontmatter.description,
      order: file.frontmatter.order
    }));
    
    sections.push({
      title: sectionTitle,
      slug: createSectionSlug(sectionTitle),
      pages
    });
  }
  
  // Sort sections by the minimum order of their pages
  sections.sort((a, b) => {
    const minOrderA = Math.min(...a.pages.map(p => p.order));
    const minOrderB = Math.min(...b.pages.map(p => p.order));
    return minOrderA - minOrderB;
  });
  
  // Find default page (lowest overall order)
  const allPages = markdownFiles.map(file => ({
    title: file.frontmatter.title,
    slug: file.frontmatter.slug,
    description: file.frontmatter.description,
    order: file.frontmatter.order
  }));
  
  const defaultPage = allPages.sort((a, b) => a.order - b.order)[0];
  
  return {
    sections,
    defaultPage
  };
}

/**
 * Find a markdown file by slug
 */
export function findFileBySlug(markdownFiles: MarkdownFile[], slug: string): MarkdownFile | null {
  return markdownFiles.find(file => file.frontmatter.slug === slug) || null;
}

/**
 * Create a URL-safe slug from section title
 */
function createSectionSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Validate navigation structure for common issues
 */
export function validateNavigationStructure(structure: NavigationStructure): string[] {
  const warnings: string[] = [];
  
  // Check for duplicate slugs
  const allSlugs = structure.sections.flatMap(section => section.pages.map(page => page.slug));
  const duplicateSlugs = allSlugs.filter((slug, index) => allSlugs.indexOf(slug) !== index);
  
  if (duplicateSlugs.length > 0) {
    warnings.push(`Duplicate slugs found: ${duplicateSlugs.join(', ')}`);
  }
  
  // Check for duplicate orders within sections
  for (const section of structure.sections) {
    const orders = section.pages.map(page => page.order);
    const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
    
    if (duplicateOrders.length > 0) {
      warnings.push(`Duplicate orders in section "${section.title}": ${duplicateOrders.join(', ')}`);
    }
  }
  
  // Check for empty sections
  const emptySections = structure.sections.filter(section => section.pages.length === 0);
  if (emptySections.length > 0) {
    warnings.push(`Empty sections found: ${emptySections.map(s => s.title).join(', ')}`);
  }
  
  return warnings;
}
