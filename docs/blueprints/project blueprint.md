# AUSTROS ATLA WORLD SEARCH & FILTERING BLUEPRINT (v3.0)

> **Migration Note:** The original plan was to use Tailwind CSS for all styling. Due to persistent build and integration errors, the project is switching to [vanilla-extract](https://vanilla-extract.style/) for type-safe, zero-runtime CSS. All references to Tailwind in this document reflect the original intent; the current and future implementation will use vanilla-extract for all styles.

## 🏛️ **CORE PRINCIPLE**

**One blazing-fast, client-side experience:**

* Instant search and advanced filtering over rich Avatar universe data
* All data, logic, and UX run in the browser—*no server required*
* Indexing, enrichment, and validation done at build time
* No feature bloat, no tracking, no network lag, and *no loss of accessibility*
* All code open source and reproducible

---

## 📁 **PROJECT FOLDER STRUCTURE**

(Keep in mind may not look exactly like this due to user edits, but this is generally what is expected for SRP compliance.)

```
/avatar-edge-encyclopedia/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── assets/
│       └── images/         # Static images, logos, SVGs
├── raw-data/
│   ├── animals.json        # Raw, source-of-truth data files
│   ├── foods.json
│   ├── locations.json
│   ├── abilities.json
│   └── schema/             # Zod (or JSON Schema) definitions for validation
│       └── animal.schema.json
├── scripts/
│   ├── build-index.mjs     # Node script: index, enrich, validate raw data
│   ├── enrich-data.mjs     # Node script: add synonyms, tags, relations
│   └── validate-data.mjs   # Node script: Zod/JSON schema runtime validation
├── dist/
│   ├── search-index.json   # Compressed index for fast in-browser search
│   └── enriched-data.json  # Fully enriched, ready-to-use display data
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── FilterTag.tsx
│   │   ├── ItemCard.tsx
│   │   ├── ResultsGrid.tsx
│   │   ├── NoResults.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── hooks/
│   │   ├── useAustrosSearch.ts     # Wrapper for instant search/filter logic
│   │   ├── useDebounce.ts
│   │   ├── useVirtualScroll.ts
│   ├── pages/
│   │   ├── AnimalsPage.tsx
│   │   ├── FoodsPage.tsx
│   │   ├── LocationsPage.tsx
│   │   └── AbilitiesPage.tsx
│   ├── search/
│   │   ├── ClientSearchEngine.ts # Handles index, data, personalized ranking
│   │   ├── QueryParser.ts        # "Natural language" to filter/search logic
│   │   └── PersonalizationEngine.ts # Click-boosting, recent search, local only
│   ├── types/
│   │   ├── domainTypes.ts
│   │   └── rawTypes.ts
│   ├── utils/
│   │   ├── accessibility.ts
│   │   ├── performance.ts
│   │   └── migration.ts
│   ├── styles/
│   │   └── tailwind.css
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── tests/
│   ├── unit/
│   ├── integration/
│   └── a11y/
├── docs/
│   ├── setup.md
│   ├── decisions.md
│   ├── performance.md
│   └── accessibility.md
├── netlify.toml
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## ⚡ **TECH STACK (OPEN SOURCE, CLIENT-ONLY)**

* **React + TypeScript**: All logic and UI, strictly typed
* **vanilla-extract**: Type-safe, zero-runtime CSS-in-TypeScript (replacing TailwindCSS)
* **FlexSearch.js**: Bleeding-edge, ultra-fast, client-side search index ([MIT License](https://github.com/nextapps-de/flexsearch))
* **Zod**: Data validation and parsing, at build and runtime
* **Vite**: Dev/build tool, enables code-splitting, HMR, PWA
* **Netlify (Edge CDN)**: Free, instant global hosting and deploy previews
* **PWA plugin**: Offline support, installable app
* **axe-core, Testing Library, Playwright**: Testing & a11y
* **No Google Analytics, no external tracking**

---

## 🚦 **ARCHITECTURE & DATA FLOW**

1. **Raw Data** (`/raw-data/`):

   * Authoritative, editable JSON data for each domain
   * Separate schema for each data type (enforced at build)
2. **Build Scripts** (`/scripts/`):

   * Validate raw data with Zod/JSON Schema
   * Enrich with synonyms, tags, semantic relations (optional: AI/NLP for expansion)
   * Generate compact `search-index.json` (FlexSearch) and `enriched-data.json` for the client
3. **Static Distribution** (`/dist/`):

   * Only outputs shipped to the browser: *zero dynamic code, zero API*
4. **Client-side App** (`/src/`):

   * Loads data/index asynchronously on user search/filter interaction
   * Uses `FlexSearch` for instant full-text, fuzzy, and tag/field search
   * Domain pages provide filter UIs (species, region, rarity, etc.) AND unified search via `SearchBar`
   * Personalized boosting (optional) via `localStorage` (recent, favorites, clicks)
   * All filter/search state reflected in URL query params for shareability
   * Virtual scrolling, lazy rendering for large datasets
   * Error boundaries, loading skeletons, *offline-ready* (PWA)

---

## 🛡️ **NON-NEGOTIABLE STANDARDS**

* **Performance:** <50ms search UX, <200KB bundle, instant load on all devices
* **Accessibility:** 100% keyboard navigation, WCAG 2.1 AA minimum, screen reader validated, dark mode (CSS only, prefers-color-scheme)
* **Privacy:** No server round-trips, no cookies, all personalization local
* **Progressive Enhancement:** Basic filtering/search works without JS (noscript fallback)
* **Test Coverage:** All critical filter/search components, hooks, and scripts unit/integration tested

---

## 🏆 **GOLDEN FEATURES**

* **Instant, fuzzy, and filterable search**

  * Find “Appa” by typing “bison,” “sky,” or “Aang’s pet”
  * Stack filters (region, rarity, etc.) with full undo/reset
  * “Natural language” pattern matching (e.g., “Fire Nation animals”)
* **Per-page filtering and cross-domain global search**

  * Animals/Foods/Locations/Abilities each have dedicated page, but *global* search bar can search across all
* **Shareable results via URL**

  * Active filters and queries encoded in query params
* **Offline-first**

  * All content loads and works with zero connection after first load
* **PWA installable**

  * Add to Home Screen/mobile for native-like experience

---

## 🧑‍💻 **RECOMMENDED FREE/LIBRARIES**

* [`FlexSearch`](https://github.com/nextapps-de/flexsearch) (search engine, MIT, best-in-class for speed/size)
* [`Zod`](https://github.com/colinhacks/zod) (validation, MIT)
* [`React`](https://react.dev/), [`React Router`](https://reactrouter.com/), [`TypeScript`](https://www.typescriptlang.org/)
* [`vanilla-extract`](https://vanilla-extract.style/) (CSS-in-TypeScript, MIT, replacing TailwindCSS)
* [`Vite`](https://vitejs.dev/)
* [`axe-core`](https://github.com/dequelabs/axe-core) (a11y testing)
* [`Playwright`](https://playwright.dev/) / [`Testing Library`](https://testing-library.com/)

---

## 🚀 **IMPLEMENTATION BATCH STEPS**

### **Batch 1: Data & Build Layer**

* Set up `/raw-data/` for each domain (animals, foods, etc.), plus `/schema/` for Zod/JSON Schema.
* Write `validate-data.mjs` to check all input JSON, halt build on schema violation.
* Write `enrich-data.mjs` to add synonyms, tags, basic semantic relationships to each item.
* Write `build-index.mjs` to generate FlexSearch index and output `search-index.json` + `enriched-data.json`.

### **Batch 2: Core App Skeleton**

* Scaffold `/src/` with per-domain pages, a global search bar, and filter panels.
* Implement `useAustrosSearch.ts` to wrap FlexSearch + filter logic.
* Build dumb components for ItemCard, FilterTag, ResultsGrid, etc.

### **Batch 3: Client-Side Engine**

* Integrate FlexSearch for instant local search.
* Build “natural language” query parsing (e.g., “show me rare animals”).
* Hook up filter panels with URL params and reset/undo.
* Implement lazy loading/virtual scrolling for large results.

### **Batch 4: UX Polish, Testing, PWA**

* Add accessibility (a11y), test keyboard/reader navigation.
* Add loading skeletons, offline-ready PWA, error boundaries.
* Run axe-core, Playwright, and Testing Library suites.
* Add dark mode via Tailwind.

### **Batch 5: Optimization/Refinement**

* Code splitting: async-load index/data only when needed.
* (Optional) Move heavy search ops to Web Worker if dataset is huge.
* Analyze bundle and optimize for <200KB initial load.

---

## 🏅 **NORTH STAR**

If Fandom/Wiki is slow, ugly, or noisy, *yours* is:

* Instant
* Intuitive
* Beautiful
* Fully accessible
* 100% private
  And it’s all open source, client-side only.


