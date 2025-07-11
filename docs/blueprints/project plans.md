Below is the updated project plan for the **Avatar Edge Encyclopedia**, incorporating the suggested improvements to address gaps and ambiguities while ensuring clarity for Cursor to execute autonomously. The revisions focus on dependency installation, schema clarity, FlexSearch configuration, Tailwind CSS integration, and testing setup, while maintaining the original structure’s intent. Tailwind’s role is emphasized for rapid, accessible UI development, aligning with the project’s `styles/tailwind.css` and `tailwind.config.ts`. Each step remains actionable, references the blueprint and raw data (`/raw-data/`), and aligns with the provided project structure (`/avatar-edge-encyclopedia/`).

---

**Avatar Edge Encyclopedia – Updated Project Task Breakdown**

**(User–Cursor Step-by-Step Workflow)**

---

### Pre-Step: Project Foundations

**User**:  
I've uploaded the full project blueprint, all raw data, each folder needing its own html page (we will probably need a landing page as well) and this breakdown as documents in the repo. Cursor, use these as your primary context for every task. Proceed to create the initial repository based on the provided blueprint.

Keep in mind, some names of current folders or files in the repo may not match the names given in the blueprints. This is totally normal, ask for clarification if confused, but things should generally be accurate. Be accurate to the current folder structure you see in the REPO FIRST then the actual plan SECOND. Do not change any names of files in the repo or edit their contents without permission. 

I need the folder structure as documented in the blueprints, but keep in mind, it will not end up being a 1:1 accurate representation to what is planned.

---

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

### Step 3: Set Up Data Processing Scripts

**User**:  
Cursor, in `/scripts/`, create three Node.js scripts:  
- `validate-data.mjs`: Validates each raw JSON file (`/raw-data/*.json`) against its schema (`/raw-data/schema/*.json`) using Zod.  
- `enrich-data.mjs`: Adds synonyms, tags, and relations to each record per schema rules.  
- `build-index.mjs`: Uses FlexSearch to create a compact search index, indexing `name`, `synonyms`, `tags`, and `relations` fields with English tokenization.  
Ensure scripts are executable, handle errors gracefully, and are documented in `/docs/setup.md` with sample commands (e.g., `node scripts/validate-data.mjs`) and outputs. Proceed.

---

### Step 4: Implement Data Validation Workflow

**User**:  
Cursor, add a build step (`npm run validate:data`) that runs `validate-data.mjs`.  
- Fail on any schema validation error in `/raw-data/`.  
- Output success message or detailed error logs (e.g., file, field, error type).  
- Update `/docs/setup.md` with instructions to run validation and interpret results, including a reference to schema structures in `/raw-data/schema/`.  
Proceed.

---

### Step 5: Implement Data Enrichment Workflow

**User**:  
Cursor, wire up the build process to run `enrich-data.mjs` after successful validation.  
- Input: Validated raw data from `/raw-data/`.  
- Process: Add synonyms, tags, and relations per schema rules (e.g., add `synonyms: ["cat", "feline"]` for an animal).  
- Output: `enriched-data.json` in `/dist/`.  
- Ensure enrichment logic is modular and configurable (e.g., via a config file or constants).  
- Update `/docs/setup.md` with the workflow, including sample enrichment rules.  
Proceed.

---

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
- `useEdgeSearch.ts`: For search/filter logic.  
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
- Unit tests (`/tests/unit/`) for hooks (`useEdgeSearch.ts`, etc.), scripts, and utilities using Jest/Vitest.  
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