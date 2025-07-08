/* global __dirname, console */
// auto-crossref.cjs
// Cross-reference and tag extractor for Avatar Battle Arena
// Usage: node scripts/auto-crossref.cjs

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.resolve(__dirname, '../src');
const OUT_PATH = path.resolve(__dirname, '../docs/crossref-output.json');
const INDEX_PATH = path.resolve(__dirname, '../docs/ALL_FILES_INDEX.md');
const REPO_URL = 'https://github.com/yourorg/yourrepo';
const MS_6_MONTHS = 1000 * 60 * 60 * 24 * 30 * 6;

function getAllTSFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllTSFiles(filePath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

function getGitMeta(file) {
  try {
    const out = execSync(`git log -1 --pretty=format:"%h|%an|%ad" -- "${file}"`).toString();
    const [hash, author, date] = out.split('|');
    return { hash, author, date };
  } catch {
    return { hash: '', author: '', date: '' };
  }
}

function extractDocBlock(content) {
  // Try to extract @fileoverview, @description, @owner, @category, @tags
  const doc = { description: '', owner: '', category: '', tags: [] };
  const docBlock = content.match(/\*\*([\s\S]*?)\*\//);
  if (docBlock) {
    const block = docBlock[1];
    const descMatch = block.match(/@fileoverview\s+([^@\n]+)/) || block.match(/@description\s+([^@\n]+)/);
    if (descMatch) doc.description = descMatch[1].trim();
    const ownerMatch = block.match(/@owner\s+([^@\n]+)/);
    if (ownerMatch) doc.owner = ownerMatch[1].trim();
    const catMatch = block.match(/@category\s+([^@\n]+)/);
    if (catMatch) doc.category = catMatch[1].trim();
    const tagMatch = block.match(/@tags?:?\s*([\w, -]+)/i);
    if (tagMatch) doc.tags = tagMatch[1].split(',').map(t => t.trim());
  }
  // Fallback: first non-empty comment line
  if (!doc.description) {
    const firstLine = content.split('\n').find(l => l.trim().startsWith('//') && !l.includes('@'));
    if (firstLine) doc.description = firstLine.replace('//', '').trim();
  }
  return doc;
}

function inferCategoryAndTags(filePath) {
  if (filePath.includes('/ai/')) return { category: 'AI Engine', tags: ['ai'] };
  if (filePath.includes('/narrative/')) return { category: 'Narrative System', tags: ['narrative'] };
  if (filePath.includes('/battle/')) return { category: 'Battle Simulation', tags: ['battle'] };
  if (filePath.includes('/components/')) return { category: 'UI Components', tags: ['ui'] };
  if (filePath.includes('/types/')) return { category: 'Types', tags: ['types'] };
  if (filePath.includes('/data/')) return { category: 'Data', tags: ['data'] };
  return { category: 'Other', tags: [] };
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const exports = [];
  const imports = [];
  const calls = [];
  const doc = extractDocBlock(content);
  const inferred = inferCategoryAndTags(filePath);

  // Find exports
  const exportRegex = /export\s+(?:type|interface|function|const|class)\s+(\w+)/g;
  let match;
  while ((match = exportRegex.exec(content))) {
    exports.push(match[1]);
  }

  // Find imports
  const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
  while ((match = importRegex.exec(content))) {
    imports.push(match[1]);
    // Only consider relative imports within src for calls
    if (match[1].startsWith('.')) {
      let impPath = path.resolve(path.dirname(filePath), match[1]);
      if (!impPath.endsWith('.ts') && !impPath.endsWith('.tsx')) {
        if (fs.existsSync(impPath + '.ts')) impPath += '.ts';
        else if (fs.existsSync(impPath + '.tsx')) impPath += '.tsx';
      }
      const rel = impPath.replace(/^.*?src\//, 'src/').replace(/\\/g, '/');
      calls.push(rel);
    }
  }

  // Tags/category fallback
  if (!doc.tags.length) doc.tags = inferred.tags;
  if (!doc.category) doc.category = inferred.category;

  // Status: parse TODO/FIXME, else 🟢
  let status = '🟢';
  if (/TODO|FIXME/i.test(content)) status = '🟡';
  // Stale: >6 months old
  const git = getGitMeta(filePath);
  let stale = false;
  if (git.date) {
    const lastDate = new Date(git.date);
    if (Date.now() - lastDate.getTime() > MS_6_MONTHS) stale = true;
  }
  if (stale) status = '🟠';

  return {
    file: filePath,
    exports,
    imports,
    tags: doc.tags,
    calls,
    description: doc.description,
    owner: doc.owner,
    category: doc.category,
    git,
    status
  };
}

function main() {
  const files = getAllTSFiles(SRC_DIR);
  const results = files.map(analyzeFile);

  // Build Used By map (reverse import graph)
  const fileToRel = f => f.replace(/^.*?src\//, 'src/').replace(/\\/g, '/');
  const relToAbs = {};
  results.forEach(r => { relToAbs[fileToRel(r.file)] = r.file; });
  const usedByMap = {};
  results.forEach(r => {
    const rel = fileToRel(r.file);
    r.imports.forEach(imp => {
      if (imp.startsWith('.')) {
        let impPath = path.resolve(path.dirname(r.file), imp);
        if (!impPath.endsWith('.ts') && !impPath.endsWith('.tsx')) {
          if (fs.existsSync(impPath + '.ts')) impPath += '.ts';
          else if (fs.existsSync(impPath + '.tsx')) impPath += '.tsx';
        }
        const impRel = fileToRel(impPath);
        if (!usedByMap[impRel]) usedByMap[impRel] = [];
        usedByMap[impRel].push(rel);
      }
    });
  });

  // Attach Used By to each result
  results.forEach(r => {
    r.usedBy = usedByMap[fileToRel(r.file)] || [];
  });

  fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
  console.log(`Cross-reference data written to ${OUT_PATH}`);

  // --- ALL_FILES_INDEX.md GENERATION ---
  const categoryMap = {};
  const orphaned = [];
  let latestCommit = '';
  let latestCommitDate = 0;

  // Build main table rows and category map
  results.forEach(r => {
    const relPath = fileToRel(r.file);
    const git = r.git;
    if (git.hash && (!latestCommitDate || new Date(git.date) > latestCommitDate)) {
      latestCommit = git.hash;
      latestCommitDate = new Date(git.date);
    }
    // Owner: @owner tag or last commit author
    const owner = r.owner || git.author || '';
    const tags = r.tags.join(', ');
    // Orphaned: not imported anywhere except entry points
    const isOrphan = r.usedBy.length === 0 && !relPath.includes('main') && !relPath.includes('App');
    if (isOrphan) orphaned.push(relPath);
    // Category map
    if (!categoryMap[r.category]) categoryMap[r.category] = [];
    categoryMap[r.category].push({
      path: relPath,
      description: r.description || '',
      category: r.category,
      tags,
      status: r.status,
      lastMod: git.hash ? `[${git.hash}](${REPO_URL}/commit/${git.hash})` : '',
      owner
    });
  });

  // Write ALL_FILES_INDEX.md
  let md = `# Legendary File Index\n\n`;
  md += `> [Latest Commit Diff](${REPO_URL}/commit/${latestCommit})\n\n`;
  md += `| Path | Description | Category | Tags | Status | Last Modified | Owner |\n`;
  md += `|------|-------------|----------|------|--------|--------------|-------|\n`;

  // Category sections with file counts
  Object.keys(categoryMap).sort().forEach(cat => {
    md += `\n\n### ${cat} (${categoryMap[cat].length} files)\n\n`;
    categoryMap[cat].forEach(row => {
      md += `| ${row.path} | ${row.description} | ${row.category} | ${row.tags} | ${row.status} | ${row.lastMod} | ${row.owner} |\n`;
    });
  });

  // Orphaned files section (reference main table rows)
  if (orphaned.length) {
    md += `\n\n## Potential Dead Code / Unused Files\n`;
    orphaned.forEach(f => {
      md += `- ${f}\n`;
    });
  }

  fs.writeFileSync(INDEX_PATH, md);
  console.log(`ALL_FILES_INDEX.md written to ${INDEX_PATH}`);

  // After orphaned files section, generate UNUSED_FILES_REPORT.md
  const unusedReportPath = path.resolve(__dirname, '../docs/unused-report/UNUSED_FILES_REPORT.md');
  let unusedMd = `# UNUSED FILES REPORT\n\nThis file is auto-generated by CI. All orphaned/unused files must have a rationale or legacy tag. See SYSTEM ARCHITECTURE.MD for policy.\n\n| File | Status | Reason | Action | Link |\n|------|--------|--------|--------|------|\n`;
  orphaned.forEach(f => {
    // Scan file for rationale tags
    const absPath = relToAbs[f];
    let header = '';
    if (fs.existsSync(absPath)) {
      const content = fs.readFileSync(absPath, 'utf8');
      const match = content.match(/\/\*\*[\s\S]*?\*\//);
      if (match) header = match[0];
    }
    // Parse tags
    let status = 'Orphaned', reason = '', action = 'Review';
    if (/@legacy/.test(header)) status = 'Legacy';
    if (/@supersededBy/.test(header)) {
      const m = header.match(/@supersededBy\s+([\S]+)/);
      if (m) reason = `Superseded by ${m[1]}`;
    }
    if (/@reason/.test(header)) {
      const m = header.match(/@reason\s*:?\s*([^\n]+)/);
      if (m) reason = m[1].trim();
    }
    if (/@removeAfter/.test(header)) {
      const m = header.match(/@removeAfter\s*:?\s*([^\n]+)/);
      if (m) action = `Delete after ${m[1].trim()}`;
    }
    if (/@rationale/.test(header)) status = 'Barrel file, unused', reason = 'Direct imports only', action = 'Keep (document rationale)';
    unusedMd += `| ${f} | ${status} | ${reason} | ${action} | [commit](#) [issue](#) |\n`;
  });
  unusedMd += `\n---\n`;
  orphaned.forEach(f => {
    const absPath = relToAbs[f];
    let header = '';
    if (fs.existsSync(absPath)) {
      const content = fs.readFileSync(absPath, 'utf8');
      const match = content.match(/\/\*\*[\s\S]*?\*\//);
      if (match) header = match[0];
    }
    unusedMd += `\n### ${f}\n${header}\n`;
  });
  fs.mkdirSync(path.dirname(unusedReportPath), { recursive: true });
  fs.writeFileSync(unusedReportPath, unusedMd);
  console.log(`UNUSED_FILES_REPORT.md written to ${unusedReportPath}`);
}

main();
