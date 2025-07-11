#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';

const RAW_DATA_ROOT = path.resolve('raw-data');
const VERBOSE = process.argv.includes('--verbose');

function parseFrontmatter(md) {
  if (!md.startsWith('---')) return { frontmatter: null, body: md };
  const end = md.indexOf('---', 3);
  if (end === -1) return { frontmatter: null, body: md };
  const yaml = md.slice(3, end).trim();
  const body = md.slice(end + 3).replace(/^\s*\n/, '');
  try {
    // Simple YAML parser (no dependencies)
    const obj = {};
    for (const line of yaml.split(/\r?\n/)) {
      if (!line.trim() || line.trim().startsWith('#')) continue;
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      let value = line.slice(idx + 1).trim();
      // Try to parse arrays (comma-separated)
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim());
      }
      obj[key] = value;
    }
    return { frontmatter: obj, body };
  } catch (e) {
    return { frontmatter: 'MALFORMED', body: md };
  }
}

async function processMdFile(mdPath) {
  const base = path.basename(mdPath, '.md');
  const dir = path.dirname(mdPath);
  const jsonPath = path.join(dir, base + '.json');
  let status = 'OK';
  let warnings = [];
  let error = null;
  let output = {};
  try {
    const raw = await fs.readFile(mdPath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(raw);
    if (frontmatter === 'MALFORMED') {
      error = 'Malformed frontmatter';
      output = { name: base, description: body.trim() };
    } else if (frontmatter) {
      output = { ...frontmatter };
      // Warn on unknown fields (not name, description, body)
      for (const k of Object.keys(frontmatter)) {
        if (!['name', 'description', 'body'].includes(k)) {
          warnings.push(`Unknown field: ${k}`);
        }
      }
      if (!output.name) {
        output.name = base;
        warnings.push('Missing name; set from filename');
      }
      if (output.description && body.trim()) {
        output.body = body.trim();
      } else if (!output.description && body.trim()) {
        output.description = body.trim();
      }
    } else {
      output = { name: base, description: raw.trim() };
    }
    await fs.writeFile(jsonPath, JSON.stringify(output, null, 2));
  } catch (e) {
    status = 'ERROR';
    error = e.message;
  }
  let msg = `[${status}] ${mdPath}`;
  if (error) msg += ` | Error: ${error}`;
  if (warnings.length) msg += ` | Warnings: ${warnings.join('; ')}`;
  console.log(msg);
  if (VERBOSE && status === 'OK') {
    console.log(JSON.stringify(output, null, 2));
  }
}

async function findMdFilesRecursive(dir) {
  let results = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await findMdFilesRecursive(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

async function main() {
  const mdFiles = await findMdFilesRecursive(RAW_DATA_ROOT);
  for (const mdFile of mdFiles) {
    await processMdFile(mdFile);
  }
}

main(); 