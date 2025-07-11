// validate-data.mjs
// Validates each raw JSON file in /raw-data/ against its schema using Zod
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

const RAW_DATA_DIR = path.resolve('raw-data');
const SCHEMA_DIR = path.join(RAW_DATA_DIR, 'schema');

async function loadJson(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function validateFile(dataFile, schemaFile) {
  const data = await loadJson(dataFile);
  const schemaModule = await import(schemaFile);
  const schema = schemaModule.default || schemaModule;
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation failed for ${dataFile}:\n` + JSON.stringify(result.error.issues, null, 2));
  }
}

async function main() {
  const files = await fs.readdir(RAW_DATA_DIR);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const dataFile = path.join(RAW_DATA_DIR, file);
      const schemaFile = path.join(SCHEMA_DIR, file.replace('.json', '.schema.js'));
      try {
        await validateFile(dataFile, schemaFile);
        console.log(`Validated: ${file}`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    }
  }
  console.log('All files validated successfully.');
}

main();
