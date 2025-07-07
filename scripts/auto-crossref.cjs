// auto-crossref.cjs
// Cross-reference and tag extractor for Avatar Battle Arena
// Usage: node scripts/auto-crossref.cjs

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');
const OUT_PATH = path.resolve(__dirname, '../docs/crossref-output.json');

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

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const exports = [];
  const imports = [];
  const tags = [];
  const calls = [];

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
      const rel = impPath.replace(/^.*?src[\\\/]/, 'src/').replace(/\\/g, '/');
      calls.push(rel);
    }
  }

  // Find @tags comments
  const tagRegex = /@tags?:?\s*([\w, -]+)/i;
  const tagMatch = content.match(tagRegex);
  if (tagMatch) {
    tags.push(...tagMatch[1].split(',').map(t => t.trim()));
  } else {
    if (filePath.includes('/ai/')) tags.push('ai');
    if (filePath.includes('/narrative/')) tags.push('narrative');
    if (filePath.includes('/battle/')) tags.push('battle');
    if (filePath.includes('/components/')) tags.push('ui');
    if (filePath.includes('/types/')) tags.push('types');
    if (filePath.includes('/data/')) tags.push('data');
    if (filePath.includes('ErrorBoundary')) tags.push('error-handling');
  }

  return { file: filePath, exports, imports, tags, calls };
}

function main() {
  const files = getAllTSFiles(SRC_DIR);
  const results = files.map(analyzeFile);

  // Build Used By map (reverse import graph)
  const fileToRel = f => f.replace(/^.*?src[\\\/]/, 'src/').replace(/\\/g, '/');
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
}

main();
