#!/usr/bin/env node

/**
 * Script to update complete.md files from individual documentation files
 * This ensures LLM endpoints stay in sync with human documentation
 */

const fs = require('fs');
const path = require('path');

// Read all markdown files from docs directory
function readDocsFiles(docsDir) {
  const files = ['intro.md', 'configuration.md', 'evaluators.md', 'github-actions.md', 'examples.md'];
  const content = [];
  
  files.forEach(file => {
    const filePath = path.join(docsDir, file);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      // Remove frontmatter
      const withoutFrontmatter = fileContent.replace(/^---\n[\s\S]*?\n---\n/, '');
      content.push(withoutFrontmatter);
    }
  });
  
  return content.join('\n\n---\n\n');
}

// Update current docs (latest version)
const currentDocs = readDocsFiles('./docs');
const completeHeader = `# EvalGate Complete Documentation

**EvalGate** is an open-source tool that runs deterministic LLM/RAG evaluations as GitHub PR checks.

---

`;

fs.writeFileSync('./static/complete.md', completeHeader + currentDocs);
console.log('✓ Updated static/complete.md');

// Update versioned docs if they exist
const versionsPath = './versions.json';
if (fs.existsSync(versionsPath)) {
  const versions = JSON.parse(fs.readFileSync(versionsPath, 'utf8'));
  
  versions.forEach(version => {
    const versionDocsDir = `./versioned_docs/version-${version}`;
    if (fs.existsSync(versionDocsDir)) {
      const versionDocs = readDocsFiles(versionDocsDir);
      const versionHeader = `# EvalGate ${version} Documentation

**EvalGate ${version}** is an open-source tool that runs deterministic LLM/RAG evaluations as GitHub PR checks.

---

`;
      
      fs.writeFileSync(`./static/${version}-complete.md`, versionHeader + versionDocs);
      console.log(`✓ Updated static/${version}-complete.md`);
    }
  });
}

console.log('✓ All complete.md files updated!');
