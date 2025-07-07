# Status: 🟢 Healthy

Excellent final touches. This level of detail transforms the document into a living, navigable system that actively helps developers. Here is the final, fully-featured version.

Architecture Document: Avatar Battle Arena

Last Updated: YYYY-MM-DD

Recent Changes:

YYYY-MM-DD: Refactored NarrativeCoordinator to be SRP-compliant, extracting logic into dedicated services.

YYYY-MM-DD: Implemented a phase-based processTurn pipeline to improve clarity and testability.

YYYY-MM-DD: Added UnifiedBattleLog component and lazy initialization for all core services to resolve circular dependencies.

Table of Contents

System Overview

Folder & File Overview

2.1. Root Directory

2.2. docs/

2.3. src/

Core System Diagrams

3.1. Battle Turn Processing Pipeline

3.2. AI Decision Pipeline

Feature Inventory

4.1. Core Battle Mechanics (User-Facing)

4.2. AI & Character Identity System (Internal & User-Facing)

4.3. Narrative & Escalation System (User-Facing)

4.4. UI & Technical Features (User & Developer-Facing)

Best Practices & Architectural Patterns

5.1. TypeScript & Code Style

5.2. Architecture & Dependencies (The "Gotcha" Section)

5.3. Implementing New Features

5.4. Pre-Commit Checklist

FAQ & Common Pitfalls

Open Questions & Future Considerations

1. System Overview

The Avatar Battle Arena is a next-gen, turn-based battle simulator set in the world of Avatar: The Last Airbender. Its architectural pillars are:

Strict TypeScript: No any. All types are enforced for maximum safety and developer clarity.

Service-Oriented Modularity: The Single Responsibility Principle (SRP) is applied at every level, from individual functions to entire service directories.

Phase-Based Combat Loop: The battle engine processes turns through a clean, predictable pipeline, making the combat flow easy to trace and extend.

Emergent, Data-Driven AI: Character behaviors are not hard-coded but emerge from a system of data-driven personalities, tactical intents, and environmental awareness.

Narrative-Driven Escalation: A battle-arc state machine controls the fight's pacing, applying global modifiers and unlocking dramatic moments organically.

2. Folder & File Overview

This section details the project's file structure, describing the purpose, dependencies, and sensitivity of each component.

2.1. Root Directory
File / Folder	Description	Depends On	Depended By	Criticality & Exposure
index.html	App entry point, mounts React app.	src/main.tsx	-	🔥 Entry Point
package.json	Project metadata, scripts, dependencies.	-	npm, build tools	🔥 Build-Critical
package-lock.json	Locks dependency versions for reproducible builds.	package.json	npm	🔥 Build-Critical
vite.config.ts	Configuration for the Vite build tool.	vite	Vite CLI	🔥 Build-Critical
tsconfig.json	Main TypeScript compiler configuration.	tsconfig.node.json	TypeScript Compiler	🔥 Build-Critical
tsconfig.node.json	TypeScript config for Node.js files (vite.config.ts).	-	tsconfig.json	Medium (Config)
README.md	Top-level project overview & setup instructions.	-	Developers	High (Docs)
CHANGELOG.md	Version history and release notes.	-	Developers	High (Docs)
jsconfig.json	Legacy JS config, superseded by tsconfig.json.	-	-	Low (Legacy)
<!-- AI: Update when adding/removing root files -->

2.2. docs/ - Documentation

This directory is the single source of truth for the system's architectural intent and complex mechanics.

File	Description	Criticality & Exposure
SIMULATOR_MECHANICS.md	Primary Reference. Master table of all mechanics.	High (Docs)
AI_SYSTEM.md	Deep dive into the AI's context analysis, intent, and identity integration.	High (Docs)
IDENTITY_DRIVEN_TACTICAL_BEHAVIOR.md	Details the "soul" of the AI: personality profiles and mental states.	High (Docs)
BEHAVIORAL_SYSTEM.md	Details the trait system (manipulation, overconfidence).	High (Docs)
ESCALATION_SYSTEM.md	Details the dynamic battle arc state machine.	High (Docs)
TACTICAL_BATTLE_SYSTEM.md	Details the positioning, charge-up, and environmental constraint system.	High (Docs)
CIRCULAR_DEPENDENCY_RESOLUTION.md	Documents a resolved circular dependency issue and provides prevention patterns.	High (Docs)
TYPESCRIPT_COMPLIANCE.md	Outlines the strict TypeScript standards and patterns used in the project.	High (Docs)
<!-- AI: Update when adding/removing docs -->

2.3. src/ - Application Source Code
2.3.1. Main Application (src/)
File / Folder	Description	Depends On	Depended By	Criticality & Exposure
main.tsx	App entry point. Renders <App /> with ErrorBoundary.	App.tsx	index.html	🔥 Entry Point
App.tsx	Root React component. Manages top-level state and orchestrates UI.	useBattleSimulator	main.tsx	🔥 High (Orchestration)
components/	Contains shared, general-purpose components.	React	main.tsx	Medium (Utility)
styles/	Global CSS files.	-	main.tsx	Medium (UI)
types/	Global type definitions.	-	TypeScript Compiler	Medium (Utility)
2.3.2. Common Components (src/common/)
File / Folder	Description	Depends On	Depended On By	Criticality & Exposure
components/	Reusable, styled UI components (e.g., Button).	React	App.tsx	Medium (UI)
types/	Defines common, static types (e.g., Character, Ability).	-	Most of the app	High (Core Logic)
2.3.3. Features (src/features/)
<!-- AI: Update when adding a new feature folder -->

Feature Folder	Description
battle-simulation/	The Core Engine. Contains all battle logic, AI, narrative, and state management.
character-selection/	UI and data for selecting characters before a battle.
location-selection/	UI and data for selecting the battle location.
battle-log/	Components for displaying the styled narrative battle log.
technical-log/	Components for displaying the detailed AI decision log.

battle-simulation/ Details

Path	Description	Criticality & Exposure
controllers/useBattleSimulator.controller.ts (Hook)	The main React hook for managing battle state.	🔥 High (API Surface)
services/battleSimulator.service.ts (Service)	Top-level service that runs the main battle loop.	🔥 High (Orchestration)
services/battle/processTurn.ts (Service)	The heart of the turn engine. Executes the phase-based pipeline.	🔥 High Risk (State Mutator)
services/battle/phases/* (Services)	Discrete phases of a turn. Excellent example of SRP.	High Risk
services/ai/* (Services)	The complete AI system and its sub-modules.	High Risk
services/identity/* (Services)	Manages character personality and mental state.	High Risk
services/narrative/* (Services)	The modular narrative engine.	High Risk
services/battle/* (Services)	Core battle mechanics (damage, status effects, etc.).	High (Core Logic)
types/* (Types)	Dynamic type definitions for the simulation (BattleState, etc.).	High (Core Logic)
components/* (Components)	React components for rendering the battle (BattleScene, etc.).	High (UI)
data/* (Data)	Data files that drive mechanics (arcTransitions, identities).	High (Core Logic)
hooks/* (Hooks)	UI logic hooks (useCooldownManager).	Medium (UI Logic)

NOTE on Security & Side-Effects: As a fully client-side application with no external network requests, file I/O, or user authentication, there are currently no files flagged as "Security-sensitive." The primary "side-effects" are managed state mutations within the battle simulation loop, which are flagged as State Mutator.

3. Core System Diagrams
3.1. Battle Turn Processing Pipeline

This diagram illustrates the flow of a single turn. Each phase is a self-contained service that can end the battle or pass the state to the next phase.

Generated mermaid
graph TD
    A[Start Turn] --> B{processTurn};
    B --> C[1. End-Game Check<br/>(validateBattleEndPhase)];
    C --> D{Finished?};
    D -- Yes --> E[End Battle];
    D -- No --> F[2. Desperation Check<br/>(processDesperationPhase)];
    F --> G{Finished?};
    G -- Yes --> E;
    G -- No --> H[3. Finisher Check<br/>(finisherPhase)];
    H --> I{Finished?};
    I -- Yes --> E;
    I -- No --> J[4. Escalation Check<br/>(escalationPhase)];
    J --> K{Finished?};
    K -- Yes --> E;
    K -- No --> L[5. Tactical Move<br/>(tacticalMovePhase)];
    L --> M{Finished?};
    M -- Yes --> E;
    M -- No --> N[6. End-of-Turn Effects<br/>(endOfTurnEffectsPhase)];
    N --> O[Switch Active Player & Increment Turn];
    O --> A;

    style E fill:#c00,stroke:#333,stroke-width:2px,color:#fff;

3.2. AI Decision Pipeline

This diagram shows how the AI selects a move. It's a multi-layered process that combines high-level strategy with low-level scoring.

Generated mermaid
graph TD
    subgraph AI Decision
        A[Start AI Turn] --> B[1. Assess Battle Context<br/>(battleStateAwareness)];
        B --> C[2. Choose Tactical Intent<br/>(intentSystem)];
        C --> D[3. Get Available Moves<br/>(moveUtils)];
        D --> E[4. Score Each Move<br/>(contextualMoveScoring)];
        E -- adjust based on --> F[5. Personality & Mental State<br/>(tacticalPersonality.engine)];
        F --> G[6. Select Best Move];
        G --> H[End AI Turn: Execute Move];
    end
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Mermaid
IGNORE_WHEN_COPYING_END
4. Feature Inventory

This section enumerates all implemented features, their purpose, and their visibility to the end-user.

4.1. Core Battle Mechanics (User-Facing)

Turn-Based Engine: Phased combat, sequential state mutation (processTurn.ts, phases/*).

Damage & Crit System: Contextual crits with real damage multipliers (moveLogic.service.ts, criticalSystem.service.ts).

Finisher & Desperation Moves: Health-gated, story-relevant power spikes (finisherSystem.service.ts, desperationSystem.service.ts).

Positional & Tactical System: Movement, charge-up moves, and vulnerability windows (positioningMechanics.service.ts, tacticalAI.service.ts).

Defensive System: Active defenses like Evasion and Parrying (defensiveResolution.service.ts).

Status Effect System: Unified system for buffs and debuffs (statusEffect.service.ts).

Cooldown & Use Limits: Prevents ability spam (cooldownManager.service.ts).

4.2. AI & Character Identity System (Internal & User-Facing)

Identity-Driven AI (IDTB): (Internal) The AI's "soul." Decisions are influenced by core values and moral boundaries (identity/*).

Dynamic Mental State: (User-Facing) Characters' mental states (enraged, unhinged) evolve based on battle events (mentalState.service.ts).

Contextual Awareness: (Internal) The AI analyzes the battle state to make informed decisions (battleStateAwareness.ts).

Tactical Intent System: (Internal) The AI sets multi-turn goals (go_for_finish, stall) to guide its strategy (intentSystem.ts).

Pattern Recognition: (Internal) AI detects and adapts to repetitive move usage (patternRecognition.ts).

Collateral Damage Awareness: (User-Facing) AI considers environmental damage, influenced by its personality (moveUtils.ts).

Behavioral Traits: (User-Facing) Character-specific traits (overconfidence) that can interrupt combat (behavioral.service.ts).

4.3. Narrative & Escalation System (User-Facing)

Dynamic Escalation Timeline: A battle arc state machine (Opening -> Climax) that controls fight pacing (escalation*.service.ts).

Contextual Storytelling: Narrative lines are selected from pools based on game state and character personality (narrativePoolManager.ts).

Environmental Damage Narratives: Moves and locations have specific narrative text for collateral damage events (locationData.ts).

4.4. UI & Technical Features (User & Developer-Facing)

Character & Location Selection: (User-Facing) Interactive UI for setting up the battle simulation (character-selection/*).

Unified Battle Log: (User-Facing) A tabbed interface for the narrative battle log and the technical AI log (UnifiedBattleLog.tsx).

Error Handling: (Developer-Facing) The app is wrapped in a React ErrorBoundary for graceful failure (main.tsx).

Strict TypeScript: (Developer-Facing) The entire codebase is strictly typed to prevent common JavaScript errors (tsconfig.json).

5. Best Practices & Architectural Patterns

TL;DR:

Never use any.

No side-effects in services unless flagged as state mutators.

No UI imports in services—services power hooks, hooks power components.

Circular Dependency Rule: No top-level singletons importing other singletons. Always use lazy factory patterns if cross-service references are needed.

5.1. TypeScript & Code Style

No any Allowed: Every type must be explicitly defined. Use unknown for type-unsafe data and validate it with type guards.

Strict Mode is Law: All strict compiler options in tsconfig.json must remain enabled.

Interfaces for Services: Define clear interfaces for all services to decouple them from their implementations. This is crucial for testing and preventing circular dependencies.

Read-Only Whenever Possible: Use readonly for properties and Readonly<T> for arrays/objects that should not be mutated. The battle state is cloned each turn to maintain immutability.

5.2. Architecture & Dependencies (The "Gotcha" Section)

Single Responsibility Principle (SRP): As demonstrated by the narrative and battle/phases services, every module, class, or function should have one, and only one, reason to change. Before adding logic, ask: "Does this belong here, or in a new, more focused service?"

Dependency Flow: Dependencies must flow in one direction: Data/Types -> Services -> Controllers (Hooks) -> UI Components.

🔥 Architectural Gotcha: Circular Dependencies: This is a critical architectural constraint that was previously encountered and resolved in this codebase (see docs/CIRCULAR_DEPENDENCY_RESOLUTION.md).

The Problem: Two modules importing each other at the top level. JavaScript cannot resolve this and will return one module as undefined.

Generated mermaid
graph TD
    A[narrative/index.ts] -->|imports| B(battle/services/attackMove.ts);
    B -->|imports| A;
    style A fill:#f99,stroke:#333,stroke-width:2px;
    style B fill:#f99,stroke:#333,stroke-width:2px;
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Mermaid
IGNORE_WHEN_COPYING_END

The Solution: Use lazy initialization via factory functions (createMyService()) instead of exporting instantiated singletons. This defers module resolution until runtime, breaking the circular dependency at load time.

Generated diff
// ❌ BAD: Can lead to circular dependencies
// narrative/index.ts
- import { someBattleFunction } from '../battle/some.service';
- class NarrativeService { /* ... */ }
- export const narrativeService = new NarrativeService();

// ✅ GOOD: Breaks circular dependencies with lazy initialization
// narrative/index.ts
+ let narrativeServiceInstance: NarrativeService | null = null;
+ export function createNarrativeService(): NarrativeService {
+   if (!narrativeServiceInstance) {
+     narrativeServiceInstance = new NarrativeService();
+   }
+   return narrativeServiceInstance;
+ }
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Diff
IGNORE_WHEN_COPYING_END
5.3. Implementing New Features

Types First: Define types in src/features/feature-name/types/.

Data Models: Add data to src/features/feature-name/data/.

Service Logic: Create a new, focused service.

Integrate: Add the service to the processTurn.ts pipeline.

Expose to AI: Update battleStateAwareness.ts and AI scoring services.

Narrative Hooks: Update narrative/ services for storytelling.

Build UI: Create or update React components.

Document: Create a new .md file in docs/.

5.4. Pre-Commit Checklist
Generated markdown
- [ ] npm run lint passes (no errors)
- [ ] npx tsc --noEmit passes (no errors)
- [ ] madge --circular src/ passes (no new cycles)
- [ ] All new features documented in /docs
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Markdown
IGNORE_WHEN_COPYING_END
6. FAQ & Common Pitfalls

Q: Why is my new service returning undefined when imported?

A: You likely have a circular dependency. Check your imports and ensure you are using the lazy initialization factory pattern (createMyService()) for any cross-service dependencies.

Q: The AI is making a weird decision. How do I debug it?

A: Open the TechnicalLog component in the UI. It provides a turn-by-turn breakdown of the AI's perceived state, considered actions, scores, and final reasoning.

Q: My new feature works, but the battle narrative is generic. Why?

A: You need to add narrative hooks or templates for your new mechanic. See the services/narrative/ directory and docs/narrative/README.md for guidance on adding new storytelling logic.

Pitfall: Mutating State Directly. Never mutate the BattleState object directly. The cloneBattleState function is used at the start of each turn to create a fresh copy. All services should operate on and return a new state object to ensure predictable state flow.

7. Open Questions & Future Considerations

This section flags areas of the architecture that may need future discussion, refactoring, or improvement.

Topic	Owner	Notes
Multiplayer State Management	Tech Lead	Consider Immer/XState for scalable real-time synchronization. Current JSON.parse(JSON.stringify()) is not sufficient for multiplayer.
AI Weight Tuning	AI/Gameplay Dev	Move AI scoring weights from code to external JSON files for easier balancing and experimentation by non-developers.
Performance Profiling	Tech Lead	Regularly benchmark processTurn and its constituent phases to identify and optimize bottlenecks as more features are added.
Testing Strategy	QA Lead	Establish a formal testing strategy. The SRP architecture is well-suited for unit testing individual services. Integration tests for the full processTurn pipeline are needed.
Hard-coded vs. Config Data	Content Lead	Evaluate migrating character/ability data from .ts files to JSON to allow for a potential future content management system.
<!-- AI: Add new architectural concerns to this table -->

## Glossary

| Term    | Definition |
|---------|------------|
| SRP     | Single Responsibility Principle: Each module/file/class should have one reason to change. |
| Phase   | A discrete step in the battle turn pipeline (e.g., Desperation, Finisher, Escalation). |
| Intent  | The AI's tactical goal for a turn or sequence (e.g., go_for_finish, stall). |
| Arc State | The current narrative/battle progression state (Opening, Climax, etc.). |
| Owner   | The person or role responsible for a system/component. |
| MCP     | Master Control Program or server for orchestration/integration. |

## Integration Summary

| Integration | Purpose | Link/Location | Notes |
|-------------|---------|---------------|-------|
| (None yet)  |         |               |       |

## Onboarding Guide

**First Steps for New Developers**

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run the dev server:**
   ```sh
   npm run dev
   ```
3. **Add a new feature:**
   - Define types in `[file](./src/features/feature-name/types/index.ts)`
   - Add data in `[file](./src/features/feature-name/data/)`
   - Implement logic in `[file](./src/features/feature-name/services/)`
   - Integrate in `[file](./src/features/battle-simulation/services/battle/processTurn.ts)`
   - Update docs in `[doc](./docs/)`

4. **Checklists:**
   - [ ] Run `npm run lint` and `npx tsc --noEmit` before commit
   - [ ] Update documentation for all new features

## Security Considerations

*No sensitive data or authentication is currently handled. If/when you add auth, payments, or sensitive state, expand this section with security best practices and protocols for safe handling.*
