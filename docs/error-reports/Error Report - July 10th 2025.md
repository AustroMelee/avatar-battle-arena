# Post-Mortem: Branded String & Log Actor Enforcement

**Date:** 2025-07-10

**Author:** Lead Architect

**Status:** Resolved

## 1. Summary
A series of production and CI failures occurred due to inconsistent data shapes being passed to the logging pipeline. Specifically, null or empty strings were being assigned to fields typed as string, and the actor field was being incorrectly added to non-dialogue log entries. This caused runtime errors in the UI and failed assertions in our CI pipeline tests.

## 2. Root Cause Analysis
The root cause was twofold:
- Type-level insufficiency: Standard string types do not prevent empty strings ('').
- Schema drift: Developers were adding the actor property to mechanics logs for debugging, which violated the implicit schema and broke UI components expecting actor to only exist on dialogue.

## 3. Resolution and Recovery
- Branded Types: Introduced NonEmptyString and a nes() utility to guarantee at both compile-time and run-time that a string is not empty.
- Discriminated Union Enforcement: Modified the ESLint rules and TypeScript types to explicitly forbid the actor property on any log type other than dialogue.
- Codemod Refactor: A jscodeshift codemod was written and executed across the entire repository to update all instances of log creation to use the new type-safe helpers and branded strings.
- CI Hardening: The "canary" simulation test in CI was updated to assert these new, stricter log schemas.

## 4. Lessons Learned & Action Items
- Type safety is not just about any; it's about semantic correctness.
- All major, repo-wide refactors must be performed with codemods to ensure consistency.
- CI must validate not just functionality, but data contracts.
- All policies derived from this incident are now codified in docs/POLICIES.md.
