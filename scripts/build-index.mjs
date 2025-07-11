// build-index.mjs
// Step 6: Build FlexSearch index from enriched-data.json for Austros ATLA World Encyclopedia
import { promises as fs } from 'fs';
import path from 'path';
import FlexSearch from 'flexsearch';
import crypto from 'crypto';

const ENRICHED_PATH = path.resolve('dist/enriched-data.json');
const INDEX_PATH = path.resolve('dist/search-index.json');
const GITIGNORE_PATH = path.resolve('.gitignore');

function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex').slice(0, 12);
}

function getTypeKey(record, parentType) {
  // Try to infer type from parent key or record.type
  if (record.type) return record.type;
  if (parentType) return parentType;
  return 'unknown';
}

async function main() {
  // Load enriched data
  let raw;
  try {
    raw = JSON.parse(await fs.readFile(ENRICHED_PATH, 'utf-8'));
  } catch (e) {
    console.error(`[ERROR] Failed to read or parse ${ENRICHED_PATH}:`, e.message);
    process.exit(1);
  }

  // Flatten all records from all types
  const allRecords = [];
  for (const [type, records] of Object.entries(raw)) {
    if (!Array.isArray(records)) continue;
    for (const rec of records) {
      allRecords.push({ ...rec, __type: type });
    }
  }

  // Build index and records map
  const index = new FlexSearch.Document({
    document: {
      id: 'id',
      index: ['name', 'synonyms', 'tags', 'relations'],
      store: ['name', 'synonyms', 'tags', 'relations'],
    },
    tokenize: 'forward',
    language: 'en',
  });
  const recordsMap = {};
  let skipped = 0;

  for (const rec of allRecords) {
    let id = rec.id;
    if (!id) {
      if (!rec.name) {
        console.warn(`[WARN] Skipping record missing both 'id' and 'name' (type: ${rec.__type}):`, JSON.stringify(rec).slice(0, 120));
        skipped++;
        continue;
      }
      // Deterministic hash: name + type
      id = hashString(`${rec.name}|${rec.__type}`);
      rec.id = id;
    }
    if (!rec.name) {
      console.warn(`[WARN] Skipping record missing 'name' (id: ${id}, type: ${rec.__type})`);
      skipped++;
      continue;
    }
    // Only index required fields
    const doc = {
      id,
      name: rec.name,
      synonyms: rec.synonyms || [],
      tags: rec.tags || [],
      relations: rec.relations || [],
    };
    try {
      index.add(doc);
      recordsMap[id] = rec;
    } catch (e) {
      console.warn(`[WARN] Failed to index record (id: ${id}, type: ${rec.__type}):`, e.message);
      skipped++;
    }
  }

  // Export index using callback-based API
  let exportedIndex;
  try {
    exportedIndex = await new Promise((resolve, reject) => {
      index.export((data) => {
        if (!data) {
          reject(new Error('FlexSearch export returned empty data'));
        } else {
          resolve(data);
        }
      });
    });
  } catch (e) {
    console.error(`[ERROR] Failed to export FlexSearch index:`, e.message);
    process.exit(1);
  }

  const output = {
    index: exportedIndex,
    records: recordsMap,
  };
  try {
    await fs.writeFile(INDEX_PATH, JSON.stringify(output, null, 2));
    console.log(`[INFO] Search index written to ${INDEX_PATH}`);
  } catch (e) {
    console.error(`[ERROR] Failed to write search index to ${INDEX_PATH}:`, e.message);
    process.exit(1);
  }
  if (skipped > 0) {
    console.warn(`[WARN] Skipped ${skipped} records due to missing required fields.`);
  }

  // .gitignore enforcement
  let gitignore;
  try {
    gitignore = await fs.readFile(GITIGNORE_PATH, 'utf-8');
  } catch (e) {
    console.warn(`[WARN] Could not read .gitignore: ${e.message}`);
    return;
  }
  const missing = [];
  if (!gitignore.includes('dist/search-index.json')) missing.push('dist/search-index.json');
  if (!gitignore.includes('dist/enriched-data.json')) missing.push('dist/enriched-data.json');
  if (missing.length > 0) {
    console.warn(`[WARN] The following files are not present in .gitignore: ${missing.join(', ')}. Add them to prevent accidental commits.`);
  }
}

main();
