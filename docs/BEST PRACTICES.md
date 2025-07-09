# ENGINEERING BEST PRACTICES

---

## 1. Linting, Type Safety, and Testing

- **Linting:**
  - Run `npm run lint -- --max-warnings=0` after every batch of changes. All warnings/errors must be fixed before commit/merge.
  - Use `npm run lint:fix` for auto-fixes. No code with lint errors may be committed.
- **Type Checking:**
  - Run `npx tsc --noEmit` to ensure zero TypeScript errors. All type errors must be fixed before new features or merges.
  - No use of `any` unless absolutely necessary and commented. Prefer explicit, descriptive types.
- **Testing:**
  - Run `npx vitest run` for all tests. No test failures allowed in merged code.
  - Place all tests in `src/**/__tests__` and import from 'vitest'.
- **Critical Lint/Type Rules:**
  - Always fix: unused variables/imports, shadowed variables, unreachable code, duplicate cases/imports, cyclic dependencies, unsafe any, missing keys in React lists, invalid hooks, no-console/debugger, unhandled promises, unused expressions, fallthrough in switch, broken import paths, accessibility violations.

---

## 2. Parameter Hygiene & Signature Consistency

- Remove all unused variables and parameters unless required for interface compliance or explicitly reserved (with comments).
- Update all function signatures and call sites to match actual usage.
- Never keep obsolete parameters or calls to deleted/renamed functions.
- For ambiguous removals, surface code for explicit user direction.
- Use descriptive, explicit variable names for readability.

---

## 3. Batch Processing & Automation

- Perform codebase changes in batch passes, not piecemeal.
- After each batch:
  - Run `npm run lint -- --max-warnings=0` and `npx tsc --noEmit`.
  - Run `npm run docs:refresh` to update all documentation.
  - Stage and commit all updated docs: `docs/SYSTEM ARCHITECTURE.MD`, `docs/ALL_FILES_INDEX.md`, `docs/FILE_TAGS.md`, `docs/crossref-output.json`, `docs/unused-report/UNUSED_FILES_REPORT.md`.
- Use automation scripts for cross-referencing and doc generation. Never hand-edit auto-generated docs.
- Always use `--force` on terminal commands that support it (especially git push).

---

## 4. Documentation & File Indexing

- All documentation must be updated in the same batch as code changes.
- Use structured comments (`@docs`, `@description`, etc.) in critical files for automation.
- Never hand-edit `docs/ALL_FILES_INDEX.md`—it is always auto-generated.
- All files must be tagged and indexed. Orphaned/unused files are flagged in `docs/unused-report/UNUSED_FILES_REPORT.md`.
- See `docs/DOCUMENTATION_POLICY.md` for conventions and automation details.

---

## 5. Communication & Review Conventions

- No unnecessary confirmations or status updates—only surface blockers or critical design decisions.
- Document all removals/additions in code or commit messages.
- Use clear, actionable commit messages. Batch changes for reviewability (5–15 files per pass).
- All contributors must review AI/automation changes before applying to critical/core logic.
- Use the glossary for all domain-specific terms.

---

## 6. Narrative & Mechanic System Rules

- **Mechanics:**
  - Pattern ban: If a move is repeated 3+ times, ban it for 2 turns. Never deadlock the AI.
  - Escalation/desperation: Boost relevant moves, log all events, and ensure robust analytics.
  - Stalemate: Detect 5 turns of no progress; after 2 cycles, force a dramatic ending.
- **Narrative:**
  - Anti-repetition: Buffer last 3 lines per context; never repeat a line or surface “No narrative.” Always provide a fallback.
  - Narrative pools: 8–10 unique lines per phase/character/context, with fallback to contextual lines.
  - System logs (technical) and battle narration (flavor) must be clearly separated. Use correct log generators (`logDialogue`, `logTechnical`, `logStory`, `logSystem`).
  - All log types are enforced by TypeScript and reviewed in code review.

---

## 7. General Engineering Principles

- Preserve existing code—never remove or alter unrelated logic.
- Follow consistent coding style and modular, single-responsibility design (SRP).
- Prioritize performance and security. No vulnerabilities or leaks.
- Handle and document all edge cases. Use named constants, not magic numbers.
- Implement robust error handling/logging—no silent failures.
- Use assertions to enforce assumptions and catch errors early.
- All code must be compatible with project versions and automation.
- No source file may exceed 500 lines.

---

## 8. UI & Accessibility

- UI must be simple, minimal, and accessible. Follow the unified design system in `src/styles/variables.css` and `docs/UI_GUIDE.md`.
- All interactive elements must have clear focus, hover, and disabled states.
- Validate color contrast and ARIA compliance.
- Remove unused assets/components as flagged in audits.

---

## 9. AI/Automation Effectiveness

- Use the Cursor Effectiveness Checklist (`docs/cursor-effectiveness.md`) for all automation and review workflows.
- Refine project rules as new issues are discovered. Update docs and context as the project grows.
- Always review AI/automation output before applying to core/critical code.

---

## 10. Onboarding & Reference

- All onboarding, architecture, and process docs are in `docs/SYSTEM ARCHITECTURE.MD`.
- For file/tag/index automation, see `docs/DOCUMENTATION_POLICY.md` and `scripts/auto-crossref.cjs`.
- For narrative/mechanics, see `docs/NARRATIVE_CONTEXT_MATRIX.md`, `docs/LOGGING_SYSTEM.md`, and `docs/ENGINE_DEEP_DIVE.md`.
- For UI, see `docs/UI_GUIDE.md` and `docs/PLANNED UPDATES/UI OVERHAUL.MD`.
- For glossary/terms, see `docs/GLOSSARY.md`.

---

> **July 9th, 2025 Milestone:**
> The engine is now stable and all mechanics are robust. Narrative/logging is functional but not yet cinematic; narrative upgrade is the next step.

---

