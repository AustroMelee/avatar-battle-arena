Below is the updated project plan for the **Austros ATLA World Encyclopedia**, incorporating the suggested improvements to address gaps and ambiguities while ensuring clarity for Cursor to execute autonomously. The revisions focus on dependency installation, schema clarity, FlexSearch configuration, Tailwind CSS integration, and testing setup, while maintaining the original structure’s intent. Tailwind’s role is emphasized for rapid, accessible UI development, aligning with the project’s `styles/tailwind.css` and `tailwind.config.ts`. Each step remains actionable, references the blueprint and raw data (`/raw-data/`), and aligns with the provided project structure (`/avatar-edge-encyclopedia/`).

---

**Austros ATLA World Encyclopedia – Updated Project Task Breakdown**

**(User–Cursor Step-by-Step Workflow)**

---

**[COMPLETED]**
### Pre-Step: Project Foundations

**User**:  
I've uploaded the full project blueprint, all raw data, each folder needing its own html page (we will probably need a landing page as well) and this breakdown as documents in the repo. Cursor, use these as your primary context for every task. Proceed to create the initial repository based on the provided blueprint.

Keep in mind, some names of current folders or files in the repo may not match the names given in the blueprints. This is totally normal, ask for clarification if confused, but things should generally be accurate. Be accurate to the current folder structure you see in the REPO FIRST then the actual plan SECOND. Do not change any names of files in the repo or edit their contents without permission. 

I need the folder structure as documented in the blueprints, but keep in mind, it will not end up being a 1:1 accurate representation to what is planned.

---

**[COMPLETED]**
### Step 1: Repository Initialization

**User**:  
Cursor, generate the folder structure (do not remove any current ones) based on the blueprint with the following structure:  
- `/raw-data/` with all JSON files (`fauna.json`, `foods.json`, `locations.json`, `abilities.json`) and their schemas (`/raw-data/schema/`, e.g., `fauna.schema.json`).  
- `/docs/` with the blueprint and this breakdown.  
- Placeholder folders: `/src/`, `/scripts/`, `/dist/`, `/public/`, `/tests/`.  
- Initialize `README.md` with project overview and setup instructions.  
- Add `.gitignore` to ignore `/dist/` and `node_modules/`.  
Do not scaffold code beyond the structure and README. Proceed.

---

**[COMPLETED]**
### Step 2: Scaffold Core App and Build Setup

**User**:  
Cursor, scaffold a Vite + React + TypeScript + Tailwind CSS project in `/src/` per the blueprint.  
- Install dependencies: `vite`, `react`, `react-dom`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `vite-plugin-pwa`.  
- Configure `vite.config.ts` for:  
  - PWA support (via `vite-plugin-pwa` for `manifest.json` and service worker).  
  - Static asset handling (`/public/assets/images/`).  
  - TypeScript support.  
- Set up `tailwind.config.ts` with a custom theme (e.g., colors, fonts, spacing) for the encyclopedia’s branding and `styles/tailwind.css` for global styles.  
- Create `App.tsx`, `main.tsx`, and `router.tsx` with basic routing (React Router).  
- Ensure `npm run dev` builds and runs successfully.  
- Update `package.json` with scripts: `dev`, `build`, `preview`.  
Proceed.

---

**[COMPLETED]**
### Step 3: Set Up Data Processing Scripts

**User**:  
Cursor, in `/scripts/`, create three Node.js scripts:  
- `validate-data.mjs`: Validates each raw JSON file (`/raw-data/*.json`) against its schema (`/raw-data/schema/*.json`) using Zod.  
- `enrich-data.mjs`: Adds synonyms, tags, and relations to each record per schema rules.  
- `build-index.mjs`: Uses FlexSearch to create a compact search index, indexing `name`, `synonyms`, `tags`, and `relations` fields with English tokenization.  
Ensure scripts are executable, handle errors gracefully, and are documented in `/docs/setup.md` with sample commands (e.g., `node scripts/validate-data.mjs`) and outputs. Proceed.

---

### Step 4 (Completed): Implement Data Validation Workflow

**User**:  
Cursor, add a build step (`npm run validate:data`) that runs `validate-data.mjs`.  
- Fail on any schema validation error in `/raw-data/`.  
- Output success message or detailed error logs (e.g., file, field, error type).  
- Update `/docs/setup.md` with instructions to run validation and interpret results, including a reference to schema structures in `/raw-data/schema/`.  
Proceed.

---



**[COMPLETED]**
**Step 5**: 
Implement Data Enrichment Workflow (Revised)

Cursor, wire up the build process to run enrich-data.mjs after successful validation.

Input: Validated raw data from /raw-data/.

Enrichment rules:

All enrichment rules (for adding synonyms, tags, and relations) must be defined in a single config file: /scripts/enrich-config.mjs.

This config must clearly specify, for each data type, which fields to enrich, synonym/tag/relations mappings, and any default or fallback rules.

No enrichment logic is allowed to be hardcoded inside enrich-data.mjs—all rules, mappings, and exceptions must flow from the config file or the schema.

Processing:

For each record, apply enrichment (add synonyms, tags, and relations) strictly according to the config and schema.

Example: If the config includes "cat": ["feline", "housecat"] for animals, then those must be set as synonyms for "cat".

Output:

Write a single enriched-data.json to /dist/.

The script must process all files in /raw-data/ every run, so any new, updated, or removed data is always reflected in the output.

The output is always fully regenerated from scratch (idempotent, never incremental).

Error handling:

If enrichment fails for any record, log the error and skip that record—never halt the build or throw.

Build integration:

The enrichment step must be a required part of the build pipeline (e.g., included in npm run build or CI job), ensuring all raw data changes are always processed.

If data volume grows, optimize via streaming or batching, but do not change the workflow or output structure.

Documentation:

In /docs/setup.md, document the enrichment workflow, config file format, and provide a sample rule.

Instructions must be clear: after editing raw data or config, simply re-run the scripts to update outputs.

Proceed with my instructions.


**(Revised, detailed enrichment workflow)**

After successful validation, run enrich-data.mjs as the next build step.

Input: All raw JSON files in /raw-data/ directory.

Enrichment logic must be defined in a single config file: /scripts/enrich-config.mjs.

The config specifies, for each data type, which fields to enrich (synonyms, tags, relations), default values, and any lookup tables for known synonyms or tags.

No enrichment rules are hardcoded inside the main script. All logic must flow from this config file or the data schema itself.

For each record in each file:
- Add synonyms, tags, and relations according to schema rules and the enrichment config.
- Example: For animals, if the config lists "cat": ["feline", "housecat"], ensure those are added as synonyms.

Output a single enriched-data.json in /dist/, always fully regenerated from scratch on every run.

If any enrichment fails for a record, log the error and skip that record—do not halt the pipeline.

The workflow must be idempotent and repeatable: after editing any raw data or config, re-running the script must fully update the output.

The enrichment step is wired into the main build process (npm run build) and is required to pass before deployment or test runs.

Document this workflow in /docs/setup.md, including:
- Example config structure and sample enrichment rule
- How to add new synonym/tag/relations rules
- What to do if enrichment errors occur

Proceed.

---

**[COMPLETED]**
**Step 5.5**: Automate Markdown-to-JSON Data Extraction (Final, Architect-Clarified Version)
User:
Cursor, implement a new pipeline step to extract structured data from all Markdown (.md) files in /raw-data/{type}/ directories and convert them to valid .json files for downstream processing.

Requirements:
Script Location:

Create a new script at /scripts/convert-md-to-json.mjs.

This script must only handle Markdown-to-JSON conversion (do not mix with enrichment, validation, or indexing logic).

Detection:

For every /raw-data/{type}/ subdirectory, scan for .md files.

Parsing and Extraction:

For each .md file:

Parse only "---" delimited YAML frontmatter at the file start (ignore "+++" or additional/multi-doc frontmatters).

Normalize all YAML frontmatter keys to lower-case.

If both a "description" field and Markdown body exist:

Use "description" from frontmatter as the "description" field.

Store the Markdown body (below frontmatter) as "body" (raw Markdown).

If frontmatter is missing "name", set the filename (without extension) as "name" and log a warning.

If no frontmatter exists, treat the entire file as "description" and set "name" to the filename.

If frontmatter is malformed, skip it, log an error, and use only Markdown body as "description".

Allow arbitrary extra fields in frontmatter (do not enforce a whitelist). Warn if unknown fields are encountered, but do not remove them.

Output:

For each .md file, write a .json file in the same directory, with the exact same basename (foo-bar.md → foo-bar.json), containing a single JSON object for that record.

Overwrite any existing .json with the same basename.

All JSON must be formatted with 2-space indentation.

Idempotency:

The script must be safely re-runnable at any time.

Logging:

Print a status line for every file processed, including errors or warnings.

Support an optional --verbose flag for debug info (e.g., full output object).

No Enrichment/Validation:

Do not enrich, validate, or index at this step—only convert and extract.

Documentation:

Update /docs/setup.md with:

Step-by-step instructions for running this script.

Required Markdown/YAML structure and field conventions.

Example before/after (.md and corresponding .json).

Sample command:

bash
Copy
Edit
node scripts/convert-md-to-json.mjs
or

bash
Copy
Edit
node scripts/convert-md-to-json.mjs --verbose

--------------------------------------------------------------

### Step 6: Generate Search Index

**User**:  
Cursor, run `build-index.mjs` after enrichment to produce `search-index.json` using FlexSearch.  
- Index fields: `name`, `synonyms`, `tags`, `relations` from `enriched-data.json`.  
- Use English tokenization and stemming for efficient search.  
- Output `search-index.json` and `enriched-data.json` to `/dist/`, ignored in `.gitignore`.  
- Document the process, FlexSearch config, and output structure in `/docs/setup.md`.  
Proceed.

---

### Step 7: Scaffold Types and Validation

**User**:  
Cursor, in `/src/types/`, define:  
- `rawTypes.ts`: Matches the exact structure of raw JSON files (`/raw-data/*.json`).  
- `domainTypes.ts`: Matches enriched data (with synonyms, tags, relations) for runtime use.  
- Ensure `validate-data.mjs` and `enrich-data.mjs` export types compatible with `domainTypes.ts`.  
- Use these types in all scripts and components for type safety.  
Proceed.

---

### Step 8: Scaffold Initial Components

**User**:  
Cursor, scaffold the following component files in `/src/components/` with placeholder exports:  
- `SearchBar.tsx`, `FilterPanel.tsx`, `FilterTag.tsx`, `ItemCard.tsx`, `ResultsGrid.tsx`, `NoResults.tsx`, `LoadingSpinner.tsx`, `ErrorBoundary.tsx`.  
- Add basic Tailwind classes for responsive styling (e.g., `SearchBar.tsx`: `className="flex p-2 bg-gray-100 rounded"`, `ResultsGrid.tsx`: `className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"`).  
- Ensure components accept TypeScript props from `domainTypes.ts`.  
Proceed.

---

### Step 9: Scaffold Initial Hooks

**User**:  
Cursor, create empty shell hooks in `/src/hooks/`:  
- `useAustrosSearch.ts`: For search/filter logic.  
- `useDebounce.ts`: For debouncing search input.  
- `useVirtualScroll.ts`: For efficient rendering of large lists.  
- Add TypeScript interfaces referencing `domainTypes.ts`.  
Proceed.

---

### Step 10: Scaffold Pages and Routing

**User**:  
Cursor, create page files in `/src/pages/`:  
- `AnimalsPage.tsx`, `FoodsPage.tsx`, `LocationsPage.tsx`, `AbilitiesPage.tsx`.  
- Update `router.tsx` to enable navigation between pages using React Router.  
- Apply basic Tailwind styling (e.g., `className="container mx-auto p-4"`) for layout consistency.  
Proceed.

---

### Step 11: Implement Data Loading Logic

**User**:  
Cursor, implement client-side logic in `/src/search/ClientSearchEngine.ts` to:  
- Asynchronously load `search-index.json` and `enriched-data.json` from `/dist/`.  
- Provide an API for components to query and retrieve results, typed with `domainTypes.ts`.  
- Cache data in memory to avoid redundant fetches.  
Proceed.

---

### Step 12: Implement Search and Filter Engine

**User**:  
Cursor, build out `/src/search/` with:  
- `ClientSearchEngine.ts`: FlexSearch-based in-memory search using `search-index.json`.  
- `QueryParser.ts`: Parses natural language queries into filter/search logic (e.g., “fire animals” → `{ tag: "fire", type: "animal" }`).  
- `PersonalizationEngine.ts`: Tracks recent searches and boosted results in `localStorage` only, typed with `domainTypes.ts`.  
- Ensure all modules use types from `/src/types/`.  
Proceed.

---

### Step 13: Wire Up SearchBar, FilterPanel, and Filters

**User**:  
Cursor, connect `SearchBar.tsx` and `FilterPanel.tsx` to `ClientSearchEngine.ts` and page state.  
- Implement stackable, resettable filters reflected in URL query params (e.g., `?type=animal&tag=fire`).  
- Render `FilterTag.tsx` for each active filter with click-to-remove functionality.  
- Use Tailwind for responsive, accessible styling (e.g., `FilterTag.tsx`: `className="inline-flex items-center px-2 py-1 bg-blue-200 rounded"`).  
Proceed.

---

### Step 14: Render Results with Virtual Scrolling

**User**:  
Cursor, implement `ResultsGrid.tsx` to render search results as `ItemCard.tsx` components.  
- Use `useVirtualScroll.ts` to render only visible items in the DOM for performance.  
- Apply Tailwind classes for responsive grid layout (e.g., `className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"`).

---

### Step 15: Implement No Results and Loading/Error States

**User**:  
Cursor, wire up:  
- `NoResults.tsx`: Displays when no results match, styled with Tailwind (e.g., `className="text-center p-4 text-gray-500"`).  
- `LoadingSpinner.tsx`: Shows during async loading, styled with Tailwind (e.g., `className="animate-spin h-8 w-8 text-blue-500"`).  
- `ErrorBoundary.tsx`: Wraps each page to catch render errors, displaying a fallback UI.  
Proceed.

---

### Step 16: Wire Up Per-Page Filtering Logic

**User**:  
Cursor, ensure each page (`AnimalsPage.tsx`, etc.) loads only relevant data (e.g., animals for `AnimalsPage.tsx`).  
- Implement contextual filters (e.g., animal type, region) without cross-domain bloat.  
- Use Tailwind for touch-friendly, accessible filter UI (e.g., `FilterPanel.tsx`: `className="flex flex-wrap gap-2 p-4"`).  
Proceed.

---

### Step 17: Integrate Accessibility Standards

**User**:  
Cursor, implement:  
- ARIA roles/labels, keyboard navigation, and focus management in all components.  
- Dark mode support via Tailwind’s `dark:` prefix.  
- Utility functions in `accessibility.ts` for reusable a11y logic.  
- Automated a11y tests in `/tests/a11y/` using `axe-core`.  
- Ensure Tailwind classes include accessible contrasts (e.g., `text-gray-900 dark:text-gray-100`).  
Proceed.

---

### Step 18: Document All Setup and Workflows

**User**:  
Cursor, ensure `/docs/` contains:  
- `setup.md`: Step-by-step install, build, and run instructions, including validation/enrichment workflows and schema references.  
- `decisions.md`: Key architectural choices (e.g., FlexSearch, Tailwind, client-only).  
- `performance.md`: Details on bundling, code-splitting, virtual scroll, and optimization.  
- `accessibility.md`: a11y standards, Tailwind `dark:` usage, and validation checklists.  
Proceed.

---

### Step 19: Implement Full Test Suite

**User**:  
Cursor, set up:  
- Unit tests (`/tests/unit/`) for hooks (`useAustrosSearch.ts`, etc.), scripts, and utilities using Jest/Vitest.  
- Integration tests (`/tests/integration/`) for UI components and search flows.  
- End-to-end tests for filter/search flows using Playwright.  
- a11y tests (`/tests/a11y/`) using `axe-core` and Playwright, ensuring Tailwind-styled components meet ARIA standards.  
- Add `npm run test` script to `package.json` and ensure all tests pass.  
Proceed.

---

### Step 20: PWA, Optimization, and Final Polish

**User**:  
Cursor, finalize:  
- PWA configuration: `manifest.json`, service worker (via `vite-plugin-pwa`), and offline support for `search-index.json` and `enriched-data.json`.  
- Code-splitting: Ensure `search-index.json` and `enriched-data.json` load asynchronously.  
- Bundle size: Target <200KB on cold load, optimized via Vite.  
- Confirm performance (virtual scroll, async loading) and accessibility (ARIA, keyboard nav) targets are met.  
- Use Tailwind’s minification for production CSS.  
- Provide a deployable Netlify preview (`netlify.toml`) and a release-ready `README.md`.  
Proceed.

---

### Completion

**User**:  
Cursor, the project should now match the blueprint in function, code quality, accessibility, performance, and developer clarity.  
- All data is static, all features are client-only, and all code is open source.  
- Deploy to Netlify and update `README.md` with deployment instructions.  
Proceed.

---

### Key Improvements
- **Dependencies**: Explicitly lists `vite`, `react`, `tailwindcss`, etc., in Step 2 to avoid build failures.
- **Schema Clarity**: References `/raw-data/schema/` in Steps 3–4 and documents structures in `setup.md`.
- **FlexSearch Config**: Specifies fields and tokenization in Step 6 for precise indexing.
- **Tailwind Integration**: Adds Tailwind classes in Steps 8, 13, 15, 16, and 17 for consistent, accessible styling.
- **Testing Tools**: Clarifies Jest/Vitest for unit/integration tests in Step 19.
- **PWA Details**: Includes service worker and caching in Step 20 via `vite-plugin-pwa`.

This updated plan is ready for Cursor to execute, aligning with the project structure (`/src/`, `/dist/`, `/scripts/`, etc.) and leveraging Tailwind CSS for rapid, accessible UI development. If you need code snippets for any step (e.g., `tailwind.config.ts`, `ClientSearchEngine.ts`) or want to simulate Cursor’s execution, let me know! 🚀