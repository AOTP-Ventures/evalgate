#!/usr/bin/env python3
"""
Combine all markdown documentation files into a single LLM-readable document.
Usage: python scripts/combine-docs.py v0.2.0
"""

import os
import sys
import re
from pathlib import Path
from typing import List, Tuple

def read_markdown_file(file_path: Path) -> str:
    """Read a markdown file and return its content."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return ""

def extract_title(content: str) -> str:
    """Extract the first H1 title from markdown content."""
    lines = content.split('\n')
    for line in lines:
        if line.startswith('# '):
            return line[2:].strip()
    return "Untitled"

def get_markdown_files(docs_dir: Path) -> List[Tuple[Path, str, str]]:
    """Get all markdown files in the docs directory, sorted by filename."""
    files = []
    for file_path in sorted(docs_dir.glob('*.md')):
        content = read_markdown_file(file_path)
        title = extract_title(content)
        files.append((file_path, title, content))
    return files

def combine_docs(version: str) -> str:
    """Combine all documentation for a version into a single document."""
    docs_dir = Path(f'docs/{version}')
    
    if not docs_dir.exists():
        print(f"Error: Documentation directory {docs_dir} does not exist")
        return ""
    
    # Get all markdown files
    files = get_markdown_files(docs_dir)
    
    if not files:
        print(f"No markdown files found in {docs_dir}")
        return ""
    
    # Build combined document
    combined = []
    combined.append(f"# EvalGate Documentation {version}")
    combined.append("")
    combined.append("This is the complete EvalGate documentation for LLM reference.")
    combined.append("")
    
    # Add table of contents
    combined.append("## Table of Contents")
    combined.append("")
    for i, (file_path, title, _) in enumerate(files, 1):
        combined.append(f"{i}. [{title}](#{title.lower().replace(' ', '-').replace('/', '').replace(':', '')})")
    combined.append("")
    
    # Add separator
    combined.append("---")
    combined.append("")
    
    # Add each document
    for i, (file_path, title, content) in enumerate(files, 1):
        combined.append(f"## {i}. {title}")
        combined.append("")
        combined.append(f"*Source: {file_path.name}*")
        combined.append("")
        
        # Remove the first H1 from content since we're adding our own
        lines = content.split('\n')
        filtered_lines = []
        skip_first_h1 = True
        
        for line in lines:
            if skip_first_h1 and line.startswith('# '):
                skip_first_h1 = False
                continue
            filtered_lines.append(line)
        
        combined.append('\n'.join(filtered_lines).strip())
        combined.append("")
        combined.append("---")
        combined.append("")
    
    return '\n'.join(combined)

def main():
    if len(sys.argv) != 2:
        print("Usage: python scripts/combine-docs.py <version>")
        print("Example: python scripts/combine-docs.py v0.2.0")
        sys.exit(1)
    
    version = sys.argv[1]
    
    # Combine documentation
    combined_content = combine_docs(version)
    
    if not combined_content:
        sys.exit(1)
    
    # Write combined document
    output_path = Path(f'docs/{version}/COMPLETE.md')
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(combined_content)
        
        print(f"✅ Combined documentation written to: {output_path}")
        print(f"📄 Document size: {len(combined_content):,} characters")
        
        # Count sections
        section_count = combined_content.count('## ')
        print(f"📋 Sections: {section_count}")
        
    except Exception as e:
        print(f"Error writing combined documentation: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
