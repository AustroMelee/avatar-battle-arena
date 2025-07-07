# docs-site

This folder is for the Docusaurus-powered interactive documentation site.

## Setup

1. From this directory, run:
   ```sh
   npx create-docusaurus@latest . classic
   npm install @docusaurus/remark-plugin-npm2yarn remark-mermaid mermaid
   ```
2. In `docusaurus.config.js`, enable Mermaid diagrams:
   ```js
   presets: [
     [
       'classic',
       {
         docs: {
           remarkPlugins: [require('remark-mermaid')],
         },
       },
     ],
   ],
   ```
3. Add `../docs/SYSTEM ARCHITECTURE.MD` as a main doc page (copy or symlink as needed).
4. Add sidebar links and configure navigation as desired.

## Features
- Mermaid diagram support
- Tag filtering (custom or via plugin)
- Live, interactive navigation

---

For advanced features (live tag filtering, clickable diagrams), see the Docusaurus and Mermaid plugin docs.
