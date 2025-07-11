### Project Structure & Setup

**1. 📂 Purpose of `raw-data/`**

* `raw-data/` holds the original, human-editable JSON files for each Avatar domain (e.g., `animals.json`, `foods.json`).
* These files are the *single source of truth* for encyclopedia data.
* They are **never loaded directly by the client app**; instead, they are processed into optimized, validated outputs for production.

**2. ⚙️ How `scripts/` transforms raw data**

* Each script runs at build time (Node.js, not browser):

  * `validate-data.mjs`: Checks every raw JSON file against its schema, fails build on error.
  * `enrich-data.mjs`: Expands each record with synonyms, tags, and cross-references for searchability.
  * `build-index.mjs`: Builds a fast, compressed search index (e.g., FlexSearch), outputs to `/dist/`.
* **All processing is deterministic and runs before deploy.**

**3. 📜 Role of `schema/` and `animal.schema.json`**

* Contains strict schema definitions (Zod/JSON Schema) for each data type.
* Every raw data record is validated against its schema before inclusion.
* Prevents structural errors and enforces required fields/types.

**4. 🛠️ Build tool and `vite.config.ts`**

* **Vite** is the build tool: fast, supports HMR, code splitting, and static asset handling.
* `vite.config.ts` configures TypeScript, React, Tailwind, static file serving, and PWA.
* Ensures all TSX/TS code is type-checked and all CSS is processed via Tailwind.

**5. 📦 Likely dependencies in `package.json`**

* **React**, **React-DOM**
* **TypeScript**, **@types/react**
* **TailwindCSS**, **postcss**, **autoprefixer**
* **Vite**, **vite-plugin-pwa**
* **FlexSearch** (or Fuse.js, but FlexSearch preferred)
* **Zod** (for validation)
* **React Router**, **Jest/Testing Library/axe-core/Playwright** for tests

---

### Frontend Components & Pages

**6. 🖼️ `SearchBar.tsx` and `ClientSearchEngine.ts`**

* `SearchBar.tsx` is the UI component where users type queries.
* On input, it passes queries to `ClientSearchEngine.ts`, which loads `search-index.json` and `enriched-data.json` if needed, performs search/filter, and returns results instantly to display.

**7. 🔍 `FilterPanel.tsx` and `FilterTag.tsx`**

* `FilterPanel.tsx` renders all available filter controls (checkboxes, dropdowns, etc.) for the current page’s domain.
* `FilterTag.tsx` displays each active filter as a removable tag, allowing users to quickly clear or adjust their selections.
* Both manage filter state, update URL query params, and trigger result refresh.

**8. 📋 `ResultsGrid.tsx` and `useVirtualScroll.ts`**

* `ResultsGrid.tsx` renders the visual grid/list of results.
* For large datasets, it relies on `useVirtualScroll.ts` to only render items visible in the viewport, dramatically improving performance and memory usage.

**9. 🚫 `NoResults.tsx` behavior**

* Renders a simple, high-contrast, accessible message (e.g., “No results found. Try adjusting your filters.”)
* Styled using Tailwind: centered, responsive, minimal.
* May include a “Reset Filters” button.

**10. ⚠️ `ErrorBoundary.tsx` behavior**

* Catches all React rendering/runtime errors below its tree.
* Prevents white screens/app crashes by displaying a fallback UI.
* Logs error details for dev mode, and encourages user to reload the app.

---

### Search & Personalization

**11. 🔎 `ClientSearchEngine.ts` search logic**

* Loads static `search-index.json` into FlexSearch on first query.
* Performs ultra-fast, in-memory search using fuzzy, prefix, or keyword matching.
* Matches return data from `enriched-data.json` for rendering.

**12. 🗣️ `QueryParser.ts` natural language support**

* Parses user input (e.g., “Fire Nation animals”) into structured filter/search instructions.
* Uses regexes, basic NLP, and mapping to known filter fields.
* Supports simple comparatives (“stronger than X”) if implemented.

**13. 📈 `PersonalizationEngine.ts` (local only)**

* Tracks recent queries, clicked items, or favorited results in `localStorage`.
* No data ever leaves the user’s device.
* Can boost frequently clicked items for the current user only.

**14. ⚡ `useEdgeSearch.ts` optimization**

* Combines local filter state and global search efficiently.
* Uses memoization and debouncing to avoid unnecessary re-renders.
* Batched updates and virtualized results for instant UI.

---

### Performance & Accessibility

**15. 🚀 `useVirtualScroll.ts` optimizations**

* Renders only visible rows/cards in the grid; offscreen items aren’t mounted.
* Listens to scroll/resize events, dynamically updates the view window.
* Dramatically reduces DOM node count and improves FPS on large datasets.

**16. ♿ `accessibility.ts` and a11y testing**

* Adds ARIA labels/roles, keyboard focus management, skip links.
* All interactive elements are tab-navigable and screen reader tested.
* `tests/a11y/` uses axe-core and Playwright to check for missing labels, contrast, focus traps, etc.

**17. ⏱️ `docs/performance.md` & `performance.ts`**

* Documents strategies: virtual scrolling, code splitting, lazy loading index/data, debounced input, memoized computations.
* `performance.ts` implements core helpers (e.g., measuring search/render timing, bundle size alerts).

---

### Data Processing & Validation

**18. 🔄 `enrich-data.mjs` logic and `enriched-data.json` structure**

* Reads raw data, adds fields: `synonyms` (array), `tags` (array), `relations` (object), etc.
* Each record in `enriched-data.json` includes all display-ready, filterable, and searchable fields.
* Enrichment may be rule-based, AI-assisted, or manual as needed.

**19. ✅ `validate-data.mjs` rules and schema usage**

* Applies Zod/JSON Schema from `/schema/` to every record.
* Enforces required fields, type correctness, allowed enums, uniqueness, and any domain constraints.
* Build fails immediately on invalid data.

**20. 🔗 Use of `types/domainTypes.ts` and `rawTypes.ts`**

* `rawTypes.ts`: Matches the structure of unprocessed records from `/raw-data/` (pre-validation/enrichment).
* `domainTypes.ts`: Defines all *runtime* types used in the app, reflecting enriched, display-ready data (includes synonyms, tags, relations, etc.).
* All TypeScript code (components, hooks, search engine) is strictly typed against these definitions.

