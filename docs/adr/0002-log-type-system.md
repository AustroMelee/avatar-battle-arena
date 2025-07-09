# ADR 0002: Adopt a Discriminated Union for the Log Type System

**Status:** Accepted

**Date:** 2025-07-08

**Deciders:** Architecture Team

## Context and Problem Statement

The previous logging system used two broad types, NARRATIVE and INFO, which was insufficient. We lacked a clear distinction between in-character dialogue, story-beat narration, and mechanical system events. This led to inconsistent UI rendering and made it difficult to filter logs for different audiences (players vs. developers).

## Decision

We will refactor the BattleLogEntry type to be a discriminated union based on a type property. The new types will be: dialogue, narrative, mechanics, and system. Each type will have a strictly defined schema, enforced by TypeScript. For example, only the dialogue type will be allowed to have an actor property representing a fighter.

## Consequences

**Positive:**
- Greatly improved type safety.
- Enables exhaustive checking in switches, preventing unhandled log types.
- Allows for distinct and appropriate UI rendering for each log type.
- Simplifies filtering for different log views (e.g., a "Story Only" view).
- **July 9th, 2025 Overhaul:** Narrative/mechanics/anti-repetition/cadence/forced ending logic is now robustly enforced and type-checked, with all dramatic/narrative/forced ending events guaranteed to produce unique, cinematic lines and pass all type/lint/test checks.

**Negative:**
- Requires a significant, one-time refactor of all code that creates or consumes log entries.
- Requires new, specialized helper functions (logDialogue, logStory, etc.) to ensure correct type creation.
