# Documentation Automation Scripts

This directory contains scripts to automate code-level cross-referencing and tag extraction for SYSTEM ARCHITECTURE.MD.

## Scripts

### auto-crossref.js
- Scans all TypeScript/TSX files in `src/`.
- For each exported type/function:
  - Lists all files/components/services that import or use it ("Used By").
  - Lists all major functions/services it calls ("Calls").
- Outputs a Markdown file at `docs/CROSSREFS.md`.

### auto-tag-extract.js
- Scans all TypeScript/TSX files in `src/`.
- Extracts tags from file-level docblocks (lines starting with `@tags:`).
- Outputs a Markdown file at `docs/FILE_TAGS.md`.

## Usage

1. Install dependencies:
   ```sh
   npm install ts-morph
   ```
2. Run the scripts:
   ```sh
   node scripts/auto-crossref.js
   node scripts/auto-tag-extract.js
   ```
3. Review the generated `docs/CROSSREFS.md` and `docs/FILE_TAGS.md`.
4. Integrate the output into SYSTEM ARCHITECTURE.MD as needed.

## Integration
- These scripts can be called from your `docs-refresh.cjs` or as part of a pre-commit/CI hook to keep documentation in sync with the codebase.
