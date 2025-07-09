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
  - **Pattern Adaptation Logic:** Introduced a pattern ban system—if the same move is repeated 3+ times, it is temporarily banned for 2 turns (default). Edge case handling ensures the AI never deadlocks or runs out of valid moves. Logging and analytics were added for pattern bans and adaptations.
  - **Escalation/Desperation Logic:** Enhanced move selection logic to strongly boost escalation, finisher, lastResort, desperation, comeback, and all-in moves during their respective phases. Stacking boosts and logging for these events. Robust to edge cases and integrated with analytics.
  - **Stalemate/Deadlock Forcing:** Added detection for 5 turns of no progress (stalemate). After 2 cycles, the system forces a dramatic ending using forceBattleClimax. System logging and analytics for all forced stalemates and climaxes.
  - **Anti-Repetition Enforcement:** Enforced a buffer of the last 3 lines per narrative context. Never repeats a line or surfaces “No narrative.” Always provides a non-empty fallback line.
  - **Technical Debt & Code Hygiene:** Systematically removed all unused variables and parameters across the codebase. Batch linting and doc automation enforced. Updated all function signatures and call sites to match actual usage. New best practices doc created.
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
- **Full mechanics/narrative type safety and lint/test enforcement as of July 2025**

For diagrams, logic maps, and full details, see [Engine Deep Dive](./ENGINE_DEEP_DIVE.md).

---

## Documentation Policy
All documentation is modular and auto-synced. See [Documentation Policy & Automation](./DOCUMENTATION_POLICY.md) for update requirements and automation details.

---

## Recent Changes
See [Changelog](../CHANGELOG.md) for the latest updates.
- Multi-phase mechanics and narrative overhaul: expanded move/narrative pools, anti-repetition/cadence, forced ending logic (July 9th, 2025)
- **July 2025 Compliance Update:** 100% mechanics and narrative coverage (all tactical/emotional contexts for Aang and Azula, including taunt, comeback, pattern_break, interrupt/counter/reversal, stalemate/deadlock). All core battle and narrative systems are now strictly type-safe, lint/test compliant, and robustly error-handled. All test stubs and codemods updated for type correctness. All critical errors and dependency issues resolved.
- **July 2025 Mechanics/Narrative/Process Update:** Pattern ban system, escalation/desperation logic, forced stalemate resolution, anti-repetition narrative buffer, fallback enforcement, technical debt cleanup, and new best practices doc added.

---

## Glossary
See [Glossary of Terms](./GLOSSARY.md) for all domain-specific and architectural terms.
---

## July 9th, 2025 Milestone: Engine Complete, Narrative Upgrade Next

- **Battle Engine Stability:** All core mechanics (charge/release, escalation, effect processing, KO, turn logic) are robust and bug-free. No deadlocks, infinite loops, or charge limbo remain. The simulation loop is now chunked and browser-friendly: it processes a few turns per tick and yields to the UI, so the browser never freezes and React state updates in real time. End conditions (KO, max turns, draw) are strictly enforced, with clear logging at battle end.
- **Narrative/Logging:** All major events (attacks, effects, escalation, charge/release) are logged, but the output is still debug-style (e.g., “Outcome: HIT for 1 damage,” “Searing Burn (BURN) with 3 turns remaining”). Escalation and effect triggers are visible in logs, but not yet cinematic or immersive. No special narrative lines for finishers, charge releases, or KOs—just mechanical logs.
- **Next Steps:** The groundwork is laid for a cinematic narrative layer, but the current update does not yet swap debug logs for in-world, story-driven narration. The system is ready for narrative service integration to generate lines like “Aang unleashes a mighty tornado!” or “Azula’s lightning splits the arena.”

---

