/* eslint-env node */
/* global __dirname, console, process */
const fs = require('fs');
const path = require('path');

const reportPath = path.resolve(__dirname, '../UNUSED_FILES_REPORT.md');
if (!fs.existsSync(reportPath)) {
  console.error('UNUSED_FILES_REPORT.md not found.');
  process.exit(1);
}
const report = fs.readFileSync(reportPath, 'utf8');
const orphanedFiles = [];
const lines = report.split('\n');
let currentFile = null;
let hasRationale = false;
for (const line of lines) {
  if (line.startsWith('### ')) {
    if (currentFile && !hasRationale) orphanedFiles.push(currentFile);
    currentFile = line.replace('### ', '').trim();
    hasRationale = false;
  }
  if (/@legacy|@supersededBy|@rationale/.test(line)) {
    hasRationale = true;
  }
}
if (currentFile && !hasRationale) orphanedFiles.push(currentFile);
if (orphanedFiles.length) {
  console.error('The following orphaned files lack rationale or legacy tags:');
  orphanedFiles.forEach(f => console.error(' - ' + f));
  process.exit(1);
}
console.log('All orphaned files have rationale or legacy tags.');
process.exit(0); 