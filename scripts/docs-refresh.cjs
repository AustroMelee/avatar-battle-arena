// docs-refresh.js
// Scans for @docs comments and updates the Folder & File Overview in SYSTEM ARCHITECTURE.MD

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const DOC_PATH = path.join(PROJECT_ROOT, 'docs', 'SYSTEM ARCHITECTURE.MD');

function findFiles(dir, exts = ['.ts', '.tsx'], fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findFiles(fullPath, exts, fileList);
    } else if (exts.includes(path.extname(file))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function parseDocsBlock(content) {
  const docsMatch = content.match(/\/\/ *@docs[\s\S]*?(?=\n\/\/|$)/);
  if (!docsMatch) return null;
  const block = docsMatch[0];
  const desc = (block.match(/@description: *(.*)/) || [])[1] || '';
  const crit = (block.match(/@criticality: *(.*)/) || [])[1] || '';
  const owner = (block.match(/@owner: *(.*)/) || [])[1] || '';
  return { desc, crit, owner };
}

function relativePath(file) {
  return path.relative(PROJECT_ROOT, file).replace(/\\/g, '/');
}

function generateTable(rows) {
  let out = '| Path | Description | Criticality & Dependencies | Owner / Expert |\n';
  out += '|------|-------------|---------------------------|----------------|\n';
  for (const row of rows) {
    out += `| [${row.path}](https://github.com/user/repo/blob/main/${row.path}) | ${row.desc} | ${row.crit} | Owner: ${row.owner} |\n`;
  }
  return out;
}

function updateDocTable(docText, table) {
  const start = docText.indexOf('## Folder & File Overview');
  if (start === -1) throw new Error('Folder & File Overview section not found');
  const tableStart = docText.indexOf('| Path |', start);
  const nextSection = docText.indexOf('\n## ', tableStart + 1);
  const before = docText.slice(0, tableStart);
  const after = nextSection !== -1 ? docText.slice(nextSection) : '';
  return before + table + '\n' + after;
}

function main() {
  const files = findFiles(SRC_DIR);
  const rows = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const docs = parseDocsBlock(content);
    if (docs) {
      rows.push({
        path: relativePath(file),
        desc: docs.desc,
        crit: docs.crit,
        owner: docs.owner || 'AustroMelee',
      });
    }
  }
  if (!rows.length) {
    console.log('No @docs blocks found.');
    return;
  }
  const table = generateTable(rows);
  let docText = fs.readFileSync(DOC_PATH, 'utf8');
  docText = updateDocTable(docText, table);
  fs.writeFileSync(DOC_PATH, docText, 'utf8');
  console.log('SYSTEM ARCHITECTURE.MD Folder & File Overview updated!');
}

if (require.main === module) main();
