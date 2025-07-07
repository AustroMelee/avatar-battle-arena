// auto-tag-extract.cjs
// MVP: Reads crossref-output.json and prints file-to-tags mapping

const fs = require('fs');
const path = require('path');

const crossrefPath = path.resolve(__dirname, '../docs/crossref-output.json');
const tagOutPath = path.resolve(__dirname, '../docs/FILE_TAGS.md');

const crossrefs = JSON.parse(fs.readFileSync(crossrefPath, 'utf8'));

let md = '# File Tags (Auto-Generated)\n\n';
md += '| File | Tags |\n|------|------|\n';
crossrefs.forEach(entry => {
  const rel = entry.file.replace(/^.*?src[\\\/]/, 'src/');
  md += `| ${rel} | ${entry.tags.join(', ')} |\n`;
});

fs.writeFileSync(tagOutPath, md);
console.log('File tags written to', tagOutPath);
