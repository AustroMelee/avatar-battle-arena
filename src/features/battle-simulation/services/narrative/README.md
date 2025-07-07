# Narrative System Architecture

This directory contains the complete, "Avatar-Level" narrative system. It is designed to be modular, extensible, and type-safe.

## Core Concepts

1.  **Narrative Service (`narrative.service.ts`)**: The main entry point for the system. It orchestrates all other components to generate a single, context-aware narrative line.

2.  **Narrative Pools (`pools/`)**: This is the content layer. All dialogue and descriptive text are stored here, organized by character. Each character has a pool file (e.g., `aang.narrative.ts`, `azula.narrative.ts`) that exports a `CharacterNarrativePool` object.
    -   **To add a new character**: Create a new file in this directory, define their narrative pool, and add it to the main `narrative.pools.ts` registry.

3.  **Type Definitions (`narrative.types.ts`)**: This is the single source of truth for the system's data structures. It defines all valid `CharacterName`, `CombatMechanic`, and `NarrativeContext` values. Using these enums/types ensures that the pools are always in sync with what the game engine can trigger.

4.  **Utilities (`utils/`)**:
    -   `antiRepetition.utility.ts`: A simple but effective class that tracks the last-used line for a given context (e.g., "Azula's Lightning hit") to prevent it from being selected again immediately.
    -   `fallbackGenerator.utility.ts`: A safety net. If a narrative pool is ever missing a line for a specific event, this utility will generate a high-quality, procedural line (e.g., "Aang uses a Charged Air Tornado!") instead of crashing or showing a raw key.

## How to Use

From anywhere in the battle engine (e.g., `tacticalMove.service.ts`), you can get a narrative line like this:

```typescript
import { narrativeService } from './narrative.service';

// ... inside a function where a move happens ...

const line = narrativeService.getNarrativeLine(
  'Azula', // The character performing the action
  'Lightning', // The mechanic ID
  'hit' // The context of the mechanic
);

// Add the line to the battle log
battleLog.push({ ... , narrative: line });
```

## How to Extend

### Adding a New Character

1.  **Add to Type**: Open `narrative.types.ts` and add the new character's name to the `CharacterName` type.
    ```typescript
    export type CharacterName = 'Aang' | 'Azula' | 'Zuko';
    ```
2.  **Create Pool File**: Create a new file `pools/zuko.narrative.ts`. Copy the structure from an existing file (like `aang.narrative.ts`) and fill it with Zuko-specific lines.
3.  **Register Pool**: Open `pools/narrative.pools.ts`, import your new `zukoNarrativePool`, and add it to the main `narrativePools` export.

### Adding a New Mechanic

1.  **Add to Type**: Open `narrative.types.ts` and add the new mechanic's ID to the `CombatMechanic` type.
    ```typescript
    export type CombatMechanic = ... | 'NewCoolMove';
    ```
2.  **Add to Pools**: Go into each character's pool file (e.g., `aang.narrative.ts`) and add a new entry for `NewCoolMove` with all its relevant contexts (`hit`, `miss`, etc.).
3.  **Trigger in Engine**: Find the place in the game code where this new mechanic is executed and add a call to `narrativeService.getNarrativeLine()`.
