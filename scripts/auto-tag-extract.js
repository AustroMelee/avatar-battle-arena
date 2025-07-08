/* eslint-env node */
/* global __dirname, console, require, process */
// scripts/auto-tag-extract.js
// Automated tag extraction for SYSTEM ARCHITECTURE.MD Folder & File Overview
// Requires: npm install ts-morph

const { Project } = require('ts-morph');
const fs = require('fs');
const path = require('path');

const project = new Project({ tsConfigFilePath: path.resolve(__dirname, '../tsconfig.json') });
const files = project.getSourceFiles('src/**/*.ts*');

const tagMap = {};

files.forEach(file => {
  const text = file.getFullText();
  const match = text.match(/@tags:\s*(.*)/);
  if (match) {
    const tags = match[1].split(',').map(t => t.trim());
    tagMap[path.relative(process.cwd(), file.getFilePath())] = tags;
  }
});

// Output as Markdown
let md = '# File Tag Index\n\n';
md += '| File | Tags |\n|------|------|\n';
Object.entries(tagMap).forEach(([file, tags]) => {
  md += `| ${file} | ${tags.join(', ')} |\n`;
});

fs.writeFileSync(path.resolve(__dirname, '../docs/FILE_TAGS.md'), md);
console.log('File tags written to docs/FILE_TAGS.md');
