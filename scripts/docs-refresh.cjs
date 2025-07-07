// scripts/docs-refresh.cjs
// Unified documentation refresh script: runs crossref and tag extraction, then updates SYSTEM ARCHITECTURE.MD

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const archPath = path.join(root, 'docs', 'SYSTEM ARCHITECTURE.MD');
const tagPath = path.join(root, 'docs', 'FILE_TAGS.md');
const crossrefPath = path.join(root, 'docs', 'crossref-output.json');

// 1. Run cross-reference and tag extraction scripts
console.log('Running code-level cross-referencing...');
execSync('node scripts/auto-crossref.cjs', { stdio: 'inherit' });
console.log('Running tag extraction...');
execSync('node scripts/auto-tag-extract.cjs', { stdio: 'inherit' });

// 2. Read generated tag and crossref output
const tagsMd = fs.readFileSync(tagPath, 'utf8');
let arch = fs.readFileSync(archPath, 'utf8');
const crossrefs = JSON.parse(fs.readFileSync(crossrefPath, 'utf8'));

// 3. Parse FILE_TAGS.md into a map: file (normalized) -> tags
const tagMap = {};
const tagLines = tagsMd.split('\n').slice(3); // skip header
for (const line of tagLines) {
  const match = line.match(/^\|\s*(.*?)\s*\|\s*(.*?)\s*\|/);
  if (match) {
    // Normalize slashes for matching
    const file = match[1].replace(/\\/g, '/');
    tagMap[file] = match[2];
  }
}

// 4. Parse crossref-output.json into maps: file (normalized) -> usedBy, calls
const usedByMap = {};
const callsMap = {};
for (const entry of crossrefs) {
  const rel = entry.file.replace(/^.*?src[\\\/]/, 'src/').replace(/\\/g, '/');
  usedByMap[rel] = entry.usedBy || [];
  callsMap[rel] = entry.calls || [];
}

// 5. Update Folder & File Overview table in SYSTEM ARCHITECTURE.MD
const tableStart = arch.indexOf('| Path |');
const tableEnd = arch.indexOf('\n##', tableStart);
if (tableStart === -1 || tableEnd === -1) {
  console.error('Could not find Folder & File Overview table in SYSTEM ARCHITECTURE.MD');
  process.exit(1);
}
const before = arch.slice(0, tableStart);
const after = arch.slice(tableEnd);
const table = arch.slice(tableStart, tableEnd);

const tableLines = table.split('\n');
let header = tableLines[0];
let divider = tableLines[1];
// Add Used By and Calls columns if not present
if (!header.includes('Used By')) {
  header += ' Used By |';
  divider += '---------|';
}
if (!header.includes('Calls')) {
  header += ' Calls |';
  divider += '-------|';
}
const updatedRows = [header, divider];
for (let i = 2; i < tableLines.length; i++) {
  const row = tableLines[i];
  const cols = row.split('|');
  if (cols.length < 6) { updatedRows.push(row); continue; }
  const fileLink = cols[1].trim();
  // Extract the file path from the markdown link
  const fileMatch = fileLink.match(/\]\((.*?)\)/);
  if (!fileMatch) { updatedRows.push(row); continue; }
  let filePath = fileMatch[1].replace(/^\.\//, ''); // remove leading ./
  filePath = filePath.replace(/\\/g, '/');
  // Try to match with tagMap, usedByMap, callsMap
  let tags = tagMap[filePath] || tagMap['src/' + filePath] || '';
  let usedBy = usedByMap[filePath] || usedByMap['src/' + filePath] || [];
  let calls = callsMap[filePath] || callsMap['src/' + filePath] || [];
  cols[5] = ' ' + tags + ' ';
  // Add Used By column (comma-separated, short file names)
  let usedByShort = usedBy.map(f => f.split('/').pop()).join(', ');
  if (cols.length < 7) cols.push(' ' + usedByShort + ' ');
  else cols[6] = ' ' + usedByShort + ' ';
  // Add Calls column (comma-separated, short file names)
  let callsShort = calls.map(f => f.split('/').pop()).join(', ');
  if (cols.length < 8) cols.push(' ' + callsShort + ' ');
  else cols[7] = ' ' + callsShort + ' ';
  updatedRows.push(cols.join('|'));
}
const newTable = updatedRows.join('\n');

// 6. Write back updated SYSTEM ARCHITECTURE.MD
arch = before + newTable + after;
fs.writeFileSync(archPath, arch);
console.log('SYSTEM ARCHITECTURE.MD tags, Used By, and Calls columns updated from FILE_TAGS.md and crossref-output.json.');
