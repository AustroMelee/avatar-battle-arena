// enrich-data.mjs
import { promises as fs } from 'fs';
import path from 'path';
import enrichConfig from './enrich-config.mjs';

const RAW_DATA_ROOT = path.resolve('raw-data');
const ENRICHED_PATH = path.resolve('dist/enriched-data.json');

// Recursively find all .json files under a directory
async function findJsonFilesRecursive(dir) {
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
      results = results.concat(await findJsonFilesRecursive(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(fullPath);
    }
  }
  return results;
}

function getIdentifier(record, file) {
  return record.id || record.name || path.basename(file);
}

function appendUnique(arr, values) {
  for (const v of values) {
    if (!arr.includes(v)) arr.push(v);
  }
}

function enrichRecord(record, typeConfig, id, type) {
  const enriched = { ...record };
  if (!typeConfig) return enriched; // No enrichment rules, return as-is
  for (const field of typeConfig.enrichFields || []) {
    if (field === 'synonyms' && typeConfig.synonyms) {
      const syns = typeConfig.synonyms[record.name];
      if (syns) {
        if (!enriched.synonyms) enriched.synonyms = [];
        appendUnique(enriched.synonyms, syns);
      }
    }
    if (field === 'tags' && typeConfig.tags) {
      const tags = typeConfig.tags[record.name];
      if (tags) {
        if (!enriched.tags) enriched.tags = [];
        appendUnique(enriched.tags, tags);
      }
    }
    if (field === 'relations' && typeConfig.relations) {
      const rels = typeConfig.relations[record.name];
      if (rels) {
        if (!enriched.relations) enriched.relations = [];
        appendUnique(enriched.relations, rels);
      }
    }
    // Add default if missing and defined in config
    if (enriched[field] === undefined && typeConfig.defaults && typeConfig.defaults[field] !== undefined) {
      enriched[field] = typeConfig.defaults[field];
    } else if (enriched[field] === undefined) {
      console.warn(`${id}: Missing field '${field}' for type '${type}', no default. Skipping enrichment for this field.`);
    }
  }
  return enriched;
}

function detectType(record, file) {
  // Prefer explicit type field
  if (record && typeof record.type === 'string' && record.type.trim()) {
    return record.type.trim();
  }
  // Else, use immediate parent directory name
  const parentDir = path.basename(path.dirname(file));
  if (parentDir) return parentDir;
  return null;
}

async function main() {
  const jsonFiles = await findJsonFilesRecursive(RAW_DATA_ROOT);
  const grouped = {};
  const typeCounts = {};
  let skipped = 0;
  for (const file of jsonFiles) {
    let records = [];
    try {
      const content = await fs.readFile(file, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        records = parsed;
      } else {
        records = [parsed];
      }
    } catch (e) {
      console.warn(`[SKIP] ${file}: Failed to parse JSON: ${e.message}`);
      skipped++;
      continue;
    }
    for (const record of records) {
      const type = detectType(record, file);
      const id = getIdentifier(record, file);
      if (!type) {
        console.warn(`[SKIP] ${file}: Could not determine type for record '${id}'.`);
        skipped++;
        continue;
      }
      if (!grouped[type]) grouped[type] = [];
      const typeConfig = enrichConfig[type];
      let enriched;
      try {
        enriched = enrichRecord(record, typeConfig, id, type);
      } catch (err) {
        console.warn(`[ENRICH ERROR] ${file}: ${id}: ${err.message}`);
        enriched = record;
      }
      grouped[type].push(enriched);
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }
  }
  await fs.mkdir(path.dirname(ENRICHED_PATH), { recursive: true });
  await fs.writeFile(ENRICHED_PATH, JSON.stringify(grouped, null, 2));
  // Print summary
  console.log('Enrichment complete. Type summary:');
  for (const t of Object.keys(typeCounts)) {
    console.log(`  ${t}: ${typeCounts[t]} records`);
  }
  if (skipped) {
    console.log(`Skipped ${skipped} files/records due to errors or missing type.`);
  }
}

main();
