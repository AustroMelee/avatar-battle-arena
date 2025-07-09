# System Architecture: Avatar Battle Arena

---

## Quick Links
- [Project README](../README.md)
- [System Architecture (Overview)](./SYSTEM%20ARCHITECTURE.MD)
- [Engine Deep Dive](./ENGINE_DEEP_DIVE.md)
- [UI & Frontend Guide](./UI_GUIDE.md)
- [Developer & Contribution Guide](../CONTRIBUTING.md)
- [Core System Policies](./POLICIES.md)
- [The Logging System](./LOGGING_SYSTEM.md)
- [Documentation Policy & Automation](./DOCUMENTATION_POLICY.md)
- [Architecture Decision Records (ADRs)](./adr/)
- [Changelog](../CHANGELOG.md)
- [Glossary of Terms](./GLOSSARY.md)
- [Cursor Effectiveness Checklist](./cursor-effectiveness.md)
- [Main App Entry (App.tsx)](../src/App.tsx)
- [React Entry Point (main.tsx)](../src/main.tsx)
- [Docs Refresh Script Instructions](../scripts/README.md)

---

## Overview

This document provides a high-level entry point to the Avatar Battle Arena system. For detailed information, see the linked modular documentation files above.

- **July 9th, 2025 Overhaul:** The battle/narrative system was overhauled in a multi-phase update:
  - Dramatic/finisher/last-resort move pools expanded for all characters.
  - Move selection logic guarantees dramatic moves in escalation/desperation/climax.
  - Penalty logic ensures dramatic moves are always available.
  - Narrative pools expanded to 8–10 unique lines per phase/character, with fallback to contextual lines.
  - Global anti-repetition and cadence logic: at least one dialogue/scene line every 2 turns in dramatic phases.
  - Forced endings always output unique, cinematic lines.
  - All changes are type/lint/test enforced, with robust error handling and test coverage.
- **Architecture, policies, and best practices** are now organized into focused documents for clarity and maintainability.
- **All automation, cross-referencing, and docs refresh scripts remain fully supported.**
- **For a full file index, see [ALL_FILES_INDEX.md](./ALL_FILES_INDEX.md).**

---

## Table of Contents
1. [Document Conventions](./DOCUMENTATION_POLICY.md)
2. [System Health Dashboard](../README.md)
3. [Architectural Tenets](#architectural-tenets)
4. [System Overview](#system-overview)
5. [System Diagrams & Visualizations](./ENGINE_DEEP_DIVE.md)
6. [UI DOM Architecture & Insights](./UI_GUIDE.md)
7. [Folder & File Overview](./ALL_FILES_INDEX.md)
8. [Key Logic Locator](./ENGINE_DEEP_DIVE.md)
9. [Codebase Cookbooks: How to Extend the System](../CONTRIBUTING.md)
10. [Core Policies](./POLICIES.md)
11. [Documentation: Policy & Automation](./DOCUMENTATION_POLICY.md)
12. [Testing & Deployment](../CONTRIBUTING.md)
13. [Onboarding/Quick Start](../CONTRIBUTING.md)
14. [Architecture Decision Records (ADRs)](./adr/)
15. [FAQ & Common Pitfalls](../CONTRIBUTING.md)
16. [Troubleshooting Playbook](../CONTRIBUTING.md)
17. [Recent Changes](../CHANGELOG.md)
18. [Glossary of Terms](./GLOSSARY.md)

---

## Folder & File Overview

| Path | Type | Description | Size | Tags | Used By | Calls |
|------|------|-------------|------|------|---------|-------|

---

## Architectural Tenets (Summary)
- **Correctness Over Performance**
- **Prevent Stalemates At All Costs**
- **The AI is a Character, Not a Bot**
- **Readability is a Feature**
- **Documentation is Not an Afterthought**
- **Log Hygiene and Type Safety**

For full details, see [Engine Deep Dive](./ENGINE_DEEP_DIVE.md) and [Core System Policies](./POLICIES.md).

---

## System Overview (Summary)
The Avatar Battle Arena is a next-gen, turn-based battle simulator built on:
- Strict TypeScript
- Service-Oriented Modularity (SRP)
- Phase-Based Combat Loop
- Deadlock-Proof AI
- Consequence-Driven Escalation
- Plug-and-Play Content
- Log Hygiene

For diagrams, logic maps, and full details, see [Engine Deep Dive](./ENGINE_DEEP_DIVE.md).

---

## Documentation Policy
All documentation is modular and auto-synced. See [Documentation Policy & Automation](./DOCUMENTATION_POLICY.md) for update requirements and automation details.

---

## Recent Changes
See [Changelog](../CHANGELOG.md) for the latest updates.
- Multi-phase mechanics and narrative overhaul: expanded move/narrative pools, anti-repetition/cadence, forced ending logic (July 9th, 2025)

---

## Glossary
See [Glossary of Terms](./GLOSSARY.md) for all domain-specific and architectural terms.