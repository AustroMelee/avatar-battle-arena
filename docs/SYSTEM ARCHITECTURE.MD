# System Architecture: Avatar Battle Arena

---

## Quick Links
- [Project README](../README.md)
- [System Architecture](./SYSTEM%20ARCHITECTURE.MD)
- [Narrative Context Matrix](./NARRATIVE_CONTEXT_MATRIX.md)
- [Changelog](../CHANGELOG.md)
- [Cursor Effectiveness Checklist](./cursor-effectiveness.md)
- [Main App Entry (App.tsx)](../src/App.tsx)
- [React Entry Point (main.tsx)](../src/main.tsx)
- [Docs Refresh Script Instructions](../scripts/README.md)

---

## Table of Contents
1. [Document Conventions](#document-conventions)
2. [System Health Dashboard](#system-health-dashboard)
3. [Architectural Tenets](#architectural-tenets)
4. [System Overview](#system-overview)
5. [System Diagrams & Visualizations](#system-diagrams--visualizations)
6. [UI DOM Architecture & Insights](#ui-dom-architecture--insights)
7. [Folder & File Overview](#folder--file-overview)
8. [Key Logic Locator](#key-logic-locator)
9. [Codebase Cookbooks: How to Extend the System](#codebase-cookbooks-how-to-extend-the-system)
10. [Core Policies](#core-policies)
11. [Documentation: Policy & Automation](#documentation-policy--automation)
12. [Testing & Deployment](#testing--deployment)
13. [Onboarding/Quick Start](#onboardingquick-start)
14. [Architecture Decision Records (ADRs)](#architecture-decision-records-adrs)
15. [FAQ & Common Pitfalls](#faq--common-pitfalls)
16. [Troubleshooting Playbook](#troubleshooting-playbook)
17. [Recent Changes](#recent-changes)
18. [Glossary of Terms](#glossary-of-terms)

---

## 1. Document Conventions
- **Headings:** All major sections use `##`, subsections use `###`.
- **Code/Commands:** Use markdown code blocks for all commands and code snippets.
- **Terminology:** See the [Glossary of Terms](#glossary-of-terms) for all domain-specific and architectural terms.

---

## 2. System Health Dashboard
| Metric            | Status                                                                                                   |
|-------------------|----------------------------------------------------------------------------------------------------------|
| **CI Pipeline**   | ![CI](https://github.com/user/repo/actions/workflows/ci.yml/badge.svg)                                   |
| **Test Coverage** | ![codecov](https://codecov.io/gh/user/repo/branch/main/graph/badge.svg)                                  |
| **Code Quality**  | ![CodeFactor](https://www.codefactor.io/repository/github/user/repo/badge)                               |
| **Bundle Size**   | ![Vercel](https://vercel-badge-gamma.vercel.app/?target=...&stat=size)                                   |
| **Dependencies**  | ![Depfu](https://badges.depfu.com/badges/...)                                                            |
| **Type Coverage** | ![Type Coverage](https://img.shields.io/badge/Type%20Coverage-99.8%25-brightgreen)                      |

---

## 3. Architectural Tenets
1. **Correctness Over Performance:** The simulation must be narratively and mechanically correct first. Optimize only after correctness is proven.
2. **Prevent Stalemates At All Costs:** Every mechanic must ultimately drive the battle towards a conclusion. Infinite loops are the cardinal sin. This is enforced by an engine-level forced ending and phase-based escalation/desperation logic.
3. **The AI is a Character, Not a Bot:** AI decisions must be explainable through personality and context. Black-box logic is forbidden. All AI is now contract-bound and phase-driven, with strict move pool enforcement in escalation/desperation.
4. **Readability is a Feature:** Clear, SRP-compliant code is more maintainable than clever, dense code. If it requires a 10-minute explanation, refactor it.
5. **Documentation is Not an Afterthought:** This document is part of the definition of done. If it's not documented here, the feature isn't finished.
6. **Log Hygiene and Type Safety:** All logs are created via robust helpers (`logTechnical`, `logStory`), never null, and strictly typed. All escalation/desperation/AI/phase logic is type-safe and documented.

---

## 4. System Overview
The Avatar Battle Arena is a next-gen, turn-based battle simulator built on several key architectural pillars:
- **Strict TypeScript:** `any` is forbidden. All types are explicit for maximum safety and developer clarity. All escalation/desperation/AI/phase logic is now fully type-safe.
- **Service-Oriented Modularity (SRP):** The Single Responsibility Principle is applied at every level. Services are focused, testable, and independent.
- **Phase-Based Combat Loop:** The battle engine processes turns through a clean, predictable pipeline (e.g., `validateBattleEndPhase → escalationPhase → tacticalMovePhase`), making the combat flow easy to trace and extend. Escalation and desperation are now strictly phase-based, with no legacy flag checks.
- **Deadlock-Proof AI:** The AI features robust anti-stalemate logic, using risk tolerance, tactical counters, and desperation gambles to actively break deadlocks. AI move selection is now contract-bound and phase-driven, with strict move pool enforcement in escalation/desperation.
- **Consequence-Driven Escalation:** The battle arc state machine controls fight pacing. Stalemates trigger escalating consequences, culminating in a guaranteed, decisive Sudden Death phase. All escalation/desperation logic is robust, type-safe, and future-proof.
- **Plug-and-Play Content:** All finisher logic, moves, characters, and narrative are data-driven. Adding or changing content is a pure data/registry operation—no engine code changes are required.
- **Log Hygiene:** All logs are created via robust helpers, never null, and strictly typed. No log entry is ever null or malformed.

### High-Level Architecture Diagram
```mermaid
graph TD
    UI["UI Components"] --> |"User Actions, State"| BattleEngine["Battle Engine"]
    BattleEngine --> |"Battle State, Events"| AI["AI & Decision Logic"]
    BattleEngine --> |"Battle State, Events"| Narrative["Narrative System"]
    BattleEngine --> |"State, Data"| Data["Data & Types"]
    AI --> |"Move Choices, Analysis"| BattleEngine
    Narrative --> |"Narrative Output"| UI
    Data --> |"Types, Static Data"| BattleEngine
    Data --> |"Types, Static Data"| AI
    Data --> |"Types, Static Data"| Narrative
    Utilities["Utilities & Hooks"] --> |"Shared Logic"| UI
    Utilities --> |"Shared Logic"| BattleEngine
    Utilities --> |"Shared Logic"| AI
    Utilities --> |"Shared Logic"| Narrative
```

---

## 5. System Diagrams & Visualizations
### 5.1. Turn Processing Flow (Activity Diagram)
```mermaid
graph TD
    A[Start Turn] --> B(Update Real-Time Analytics);
    B --> C{End-Game Check?<br/>(KO / Decisive Win / Sudden Death Trigger)};
    C -- Yes --> D[End Battle];
    C -- No --> E{Escalation Check?<br/>(Stalemate / Repetition)};
    E -- Escalate --> F[Set Escalation/Risk Flags & Enter Escalation Phase];
    F --> G{Tactical Move Phase};
    E -- No --> G;
    G -- Sudden Death? --> H[Force Finisher Move!];
    G -- Escalation? --> I[Force Aggressive Move / Charge Power];
    G -- Desperation? --> J[Only Desperation/Finisher Moves Allowed];
    G -- Normal --> J[Execute AI-Chosen Tactical Move];
    H --> K{Resolve Move & Apply Damage};
    I --> K;
    J --> K;
    K --> L{End-of-Turn Effects<br/>(Status Ticks / Effect Fusion)};
    L -- KO? --> D;
    L -- No --> M[Switch Active Player & Increment Turn];
    M --> A;

    style D fill:#c00,stroke:#333,stroke-width:2px,color:#fff;
```

### 5.2. AI Decision Pipeline (Flowchart)
```mermaid
graph TD
    subgraph AI Decision
        A[Start AI Turn] --> B(Calculate Risk & Stalemate Counters);
        B --> C{Get Available Moves<br/>(Hard-filtered by Chi, Cooldowns, Uses & Collateral)};
        C -- No Moves Available --> D[Choose "Gather Power" / Skip Turn];
        C -- Moves Available --> E{Determine Tactical Priority<br/>(Attack, Defend, Pierce, Gamble...)};
        E --> F[Score Available Moves Based on Priority];
        F --> G[Adjust Scores by Character Identity];
        G --> H[Select Best Move];
        H --> I[End AI Turn: Execute Move];
        D --> I;
    end
```

### 5.3. Turn Processing Call Stack (Sequence Diagram)
```mermaid
sequenceDiagram
    participant UI
    participant useBattleSimulator
    participant battleSimulator.service
    participant processTurn
    participant tacticalPhase

    UI->>useBattleSimulator: runSimulation()
    useBattleSimulator->>battleSimulator.service: run()
    loop Until Battle End
        battleSimulator.service->>processTurn: execute(state)
        processTurn->>tacticalPhase: execute(state)
        tacticalPhase-->>processTurn: updatedState
        processTurn-->>battleSimulator.service: updatedState
    end
```

### 5.4. Battle Arc State Machine
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Escalation: Stalemate detected
    Escalation --> Climax: Escalation limit reached
    Climax --> Sudden_Death: Climax fails to resolve
    Sudden_Death --> End: Finisher clash
    Escalation --> End
    Climax --> End
```

---

## 6. UI DOM Architecture & Insights
### 6.1. High-Level React/DOM Tree
```mermaid
graph TD
    Root["#root (React root)"]
    App["App.tsx (_appContainer_1rx4b_1)"]
    Header["Header (_header_1rx4b_37)"]
    Main["Main Content (_mainContent_1rx4b_143)"]
    BattleScene["BattleScene (_container_czwm9_1)"]
    VersusGrid["VersusGrid (_versusGrid_dmjnw_1)"]
    Player1["PlayerCardHorizontal (Player 1)"]
    Player2["PlayerCardHorizontal (Player 2)"]
    AbilityPanel["AbilityPanel"]
    UnifiedBattleLog["UnifiedBattleLog (_unifiedBattleLog_1q2w3_1)"]
    ErrorBoundary["ErrorBoundary"]
    Suspense["Suspense (LoadingSpinner)"]

    Root --> App
    App --> ErrorBoundary
    ErrorBoundary --> Suspense
    Suspense --> Header
    Suspense --> Main
    Main --> BattleScene
    BattleScene --> VersusGrid
    VersusGrid --> Player1
    VersusGrid --> Player2
    BattleScene --> AbilityPanel
    BattleScene --> UnifiedBattleLog
```

### 6.2. CSS, Theming, and Accessibility
- **CSS Modules:** All UI components use locally-scoped CSS modules to prevent class name collisions.
- **CSS Variables:** Theming is controlled by CSS variables in `styles/variables.css` for colors, spacing, and fonts.
- **Layout:** Flexbox and grid are used for main layouts. All spacing uses explicit gap or padding values from variables.
- **Accessibility:** Root-level UI is wrapped in ErrorBoundary and Suspense with accessible fallbacks. All interactive elements have ARIA labels and are keyboard accessible.
- **Defensive UI:** Log rendering is guarded against undefined/null data, with warnings logged and placeholders shown for malformed data.

### 6.3. Key CSS Variables
| Variable                | Value                    | Usage Context                |
|-------------------------|-------------------------|------------------------------|
| --font-heading          | 'Poppins', sans-serif   | Headings, titles             |
| --font-mono             | 'JetBrains Mono', monospace | Code, technical log     |
| --background-color-dark | #0F172A                 | Main app background          |
| --text-color-primary    | #F8FAFC                 | Main text color              |
| --border-color-soft     | #475569                 | Soft borders, dividers       |
| --player-1-color        | #3B82F6                 | Player 1 highlights, borders |
| --player-2-color        | #EF4444                 | Player 2 highlights, borders |
| --highlight-color       | #F59E0B                 | Highlights, buttons, accents |
| --spacing-medium        | 16px                    | Medium gaps, padding         |

### 6.4. Battle Log View Modes & Dropdown
- **Log View Dropdown:** The battle log UI now features a persistent dropdown at the top, allowing instant toggling between multiple log view modes.
- **Modes:**
  - **[DEV] Grouped by Turn – Full battle transcript:** Shows all log entries grouped and ordered by turn, with headers for each turn. For developers and testers.
  - **[DEV] Latest Turn Only – Just current turn:** Shows only the most recent turn's entries. For rapid debugging and step-by-step analysis.
  - **[DEV] All Entries (Raw) – Unfiltered log:** Shows every log entry in order, with no grouping. For log system debugging.
  - **[PUBLIC] Story View – For players/spectators:** (Currently same as grouped, but intended for user-facing release. Only this mode is shown in production.)
- **Dropdown Placement:** The dropdown is always rendered at the very top of the log area, before any log content, and is never hidden or delayed.
- **Educational Labels:** Each dropdown option includes a one-line summary for clarity. [DEV] modes are only visible in development; [PUBLIC] is the only option in production.
- **Rationale:** This design ensures maximum clarity for both developers and users, prevents UI drift, and makes the tool self-explanatory.

### 6.5. Log UI Update Best Practices & File Map
- **Log pipeline and UI are now robust, type-safe, and future-proof.**
- **Renderer:** `UnifiedBattleLog.tsx` uses an exhaustive switch to render only true dialogue as bubbles, with unknown types rendered as neutral gray.
- **Unit Test:** `UnifiedBattleLog.test.tsx` covers all core log types and ensures exhaustive rendering.
- **Lint Rule:** Custom ESLint plugin prevents stray imports of `DialogueLogEntry` outside the canonical context.
- **Type Helper:** `assertNever` enforces compile-time exhaustiveness for log type switches.
- **Log Creation:** All logs are created via robust helpers (`logTechnical`, `logStory`, `logDialogue`, `logSystem`), never null, and strictly typed. All tactical subtypes are mapped to canonical types at the source. Duplicate log entries are prevented with a hash/set utility.
- **Log Type System:**
    - `dialogue` — In-character speech, taunts, or dialogue. Use `logDialogue`.
    - `mechanics` — Technical/mechanical outcomes, system events, or developer logs. Use `logTechnical`.
    - `narrative` — Pure narrative, story-driven lines, or scene-setting. Use `logStory`.
    - `system` — System-level messages, out-of-band notifications. Use `logSystem`.
- **Checklist for Log UI Updates:**
    - [x] Update log text in helpers/templates as needed
    - [x] Update styles in log entry components or CSS modules
    - [x] Update dropdown options/labels and logic
    - [x] Update/add log action buttons
    - [x] Update SYSTEM ARCHITECTURE.MD and ALL_FILES_INDEX.md to reflect changes
    - [x] Run and visually verify all log modes (DEV and PUBLIC)
- **File Map for Log UI:**
    - Log text: `mechanicLogUtils.ts`, narrative pools/templates
    - Log styles: `DialogueLogEntry.tsx`, `NarrativeLogEntry.tsx`, `TechnicalLogEntry.tsx`, `variables.css`
    - Dropdown: `UnifiedBattleLog.tsx`, `logViewModes.ts`
    - Buttons: `UnifiedBattleLog.tsx` (or subcomponents)
- **Policy:** All log UI changes must be reflected in this document and in ALL_FILES_INDEX.md to prevent drift.

---

## 7. Folder & File Overview

| Path | Description | Category | Tags | Status | Last Modified | Owner | Used By | Calls |
|------|-------------|----------|------|--------|--------------|-------|---------|-------|
| _Placeholder_ | _This table will be auto-generated by the docs refresh script._ | | | | | |

> **Note:** All escalation/desperation/AI/phase files are now strictly phase-based, type-safe, and robust. See ALL_FILES_INDEX.md for the full, always-up-to-date file listing.

---

## 8. Key Logic Locator
This table maps core gameplay logic to its exact location.

| Core Logic         | File & Function Location                                 |
|--------------------|---------------------------------------------------------|
| Damage Calculation | tacticalPhase.service.ts → applyMoveEffects()           |
| Stalemate Detection| arc.service.ts → checkForStalemate()                    |
| AI Move Scoring    | enhancedMoveScoring.ts → scoreMove()                    |
| Cooldown Ticks     | useBattleSimulator.controller.ts → endTurn() loop        |
| Engine-Level Forced Ending | escalationPhase.service.ts → handleEscalationPhase()   |
| Escalation/Desperation Phase Logic | escalationDetection.service.ts, escalationApplication.service.ts, desperationSystem.service.ts, escalationPhase.service.ts |
| Contract-Bound AI Move Selection | advancedAIController.ts → selectAIMove()   |
| Log Hygiene & Safety | mechanicLogUtils.ts → logTechnical(), logStory()      |

> **Note:** This table is manually curated. If you refactor core logic, please update this table.

---

## 8.1. Dynamically Used Modules

| File | Consuming System | Usage Mechanism |
|------|------------------|----------------|
| src/features/battle-simulation/services/battle-simulation/services/battle/desperationSystem.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/arc.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/criticalSystem.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/desperationMoveCreation.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/desperationMoves.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/disruptionWindow.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/effectFusion.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/endPhase.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/escalationPhase.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/logIdGenerator.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/ai/advancedAIController.ts | AI Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/ai/battleAwareness.ts | AI Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/ai/behaviorTreeEngine.ts | AI Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/ai/chooseAbility.ts | AI Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/ai/narrative.ts | AI Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/ai/tacticalAI.service.ts | AI Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/ai/tacticalNarrative.ts | AI Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/narrative/enhancedNarrativeSystem.ts | Narrative Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/narrative/enhancedRepetitionManager.ts | Narrative Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/narrative/enhancedStateManager.ts | Narrative Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/narrative/enhancedStateNarratives.ts | Narrative Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/narrative/enhancedTemplateGenerator.ts | Narrative Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/narrative/index.ts | Narrative Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/utils/mechanicLogUtils.ts | BattleEngine/utilities | Dynamic registry lookup |
| src/features/battle-simulation/services/utils/moveUtils.ts | BattleEngine/utilities | Dynamic registry lookup |
| src/features/battle-simulation/hooks/useNarrativeLine.ts | Narrative Engine/UI | Dynamic registry lookup or React hook |
| src/features/battle-simulation/services/narrative/utils/antiRepetition.utility.ts | Narrative Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/narrative/utils/fallbackGenerator.utility.ts | Narrative Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/narrative/utils/narrativeKey.utility.ts | Narrative Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/narrative/utils/pronoun.utility.ts | Narrative Engine | Dynamic registry lookup |
| src/features/battle-simulation/services/battleSimulator.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/reportGenerator.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/finisherSystem.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/genericMove.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/moveRegistry.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/moveRouter.service.ts | BattleEngine | Dynamic registry lookup |
| src/features/battle-simulation/services/battle/phases/desperationPhase.service.ts | BattleEngine | Dynamic registry lookup |

---

## 9. Codebase Cookbooks: How to Extend the System
This section provides step-by-step instructions for adding new content. Following these guides ensures the system remains scalable and maintainable.

### How to Add a New Character (e.g., Zuko)
Adding a new character is a data-only operation. You do not need to modify any core engine files.

1. **Define Moves:**
    - Open `src/features/battle-simulation/data/moves.ts`.
    - Add new `Move` objects for the character's abilities (e.g., `zuko_fire_whip`). Ensure each `id` is unique.
2. **Define Character Data:**
    - Open `src/features/character-selection/data/characterData.ts`.
    - Add a new `Character` object to the `availableCharacters` array.
    - In the `abilities` array, list the unique `id`s of the moves you defined in step 1.
    - Set the `aiRulesetId` and `narrativeId` to a unique key (e.g., `'zuko'`).
3. **Create AI Rules:**
    - Create `src/features/battle-simulation/services/ai/rules/zukoRules.ts`.
    - Define and export an array of `AIRule` objects for Zuko's behavior.
4. **Register AI Rules:**
    - Open `src/features/battle-simulation/services/ai/rules/aiRuleRegistry.service.ts`.
    - Import `zukoAIRules` and register it in the constructor: `this.register('zuko', zukoAIRules);`
5. **Create Narrative Pool:**
    - Create `src/features/battle-simulation/services/narrative/pools/zuko.narrative.ts`.
    - Define and export a `CharacterNarrativePool` object with Zuko's dialogue.
6. **Register Narrative Pool:**
    - Open `src/features/battle-simulation/services/narrative/pools/narrativePoolRegistry.service.ts`.
    - Import `zukoNarrativePool` and register it: `this.register('zuko', zukoNarrativePool);`
7. **Add Assets:**
    - Add character images (e.g., `zuko.jpg`) to the `/public/assets/` directory.

### How to Add a New Location
1. **Add Location Data:**
    - Open `src/features/location-selection/data/locationData.ts`.
    - Add a new `Location` object to the `availableLocations` array.
2. **Add Asset:**
    - Add the location image to `/public/assets/`.

### How to Add a New Move
1. **Define the Move:**
    - Open `src/features/battle-simulation/data/moves.ts`.
    - Add a new `Move` object to the `ALL_MOVES` array.
2. **Assign to Character(s):**
    - Open `src/features/character-selection/data/characterData.ts`.
    - Add the new move's `id` to the `abilities` array of any character who should use it.

### How to Ensure Dynamic Fighter Names in the Simulation UI (No Hardcoding)

**Goal:** The simulation UI must always display the actual character names (e.g., "Aang" and "Azula") instead of hardcoded labels like "Fighter 1" and "Fighter 2". This supports plug-and-play extensibility for any future characters.

#### Where Names Are Rendered
- **UnifiedBattleLog.tsx**: The main battle log UI. Renders all log entries and passes participant names to log entry components.
- **DialogueLogEntry.tsx**: Renders individual dialogue lines, displaying the `actor` prop as the speaker's name.

#### How Participants Are Passed
- The simulation state (`BattleState.participants`) always contains the two current fighters as `BattleCharacter` objects, each with a `name` property.
- The `UnifiedBattleLog` component receives a `participants` prop (an array of two `BattleCharacter`s) and uses their `.name` fields for all log rendering.
- All log and dialogue rendering (including `SingleLogEntry`, `TurnGroup`, and `renderNarrativeTab` in `UnifiedBattleLog.tsx`) must use these dynamic names, never hardcoded labels.

#### How to Extend or Change for New Characters
- To add new characters, simply add them to the registry in `characterData.ts` and ensure their names are set correctly.
- The UI will automatically display the correct names for any selected participants, with no code changes required.
- All log rendering will use the selected characters' names, supporting true plug-and-play extensibility.

#### Relevant Files and Types
- `src/features/battle-simulation/components/UnifiedBattleLog/UnifiedBattleLog.tsx`
- `src/features/battle-simulation/components/UnifiedBattleLog/DialogueLogEntry.tsx`
- `src/features/character-selection/data/characterData.ts`
- `BattleCharacter` type (see `types/index.ts`)
- `BattleState` type (see `types/index.ts`)

#### Contributor Checklist: Dynamic Fighter Name Display
- [ ] Never hardcode participant labels (e.g., "Fighter 1", "Fighter 2") in any UI or log component.
- [ ] Always use the `.name` property from the `BattleCharacter` objects in the simulation state.
- [ ] When adding new log or dialogue UI, ensure the actor/speaker is set dynamically from the participant data.
- [ ] When adding new characters, confirm their names are set in the registry and appear correctly in the UI.
- [ ] When updating log UI, review all usages of actor/speaker labels for hardcoded values and refactor as needed.
- [ ] Reference this section in PRs or code reviews when making changes to log or participant display logic.

> **Policy:** All log and dialogue rendering must use the real character names from the simulation state. Hardcoded labels are forbidden. This ensures full plug-and-play compliance and future extensibility.

---

## 10. Core Policies
### 10.1. Plug-and-Play Compliance Policy (MANDATORY)
- All new features, content, and mechanics must be implemented in a strictly plug-and-play fashion.
- No hard-coded references to specific entities (characters, moves, etc.) are allowed in core logic.
- All extensible entities must be registered via explicit registries and referenced by ID.
- Adding new content must never require changes to core engine, AI, or narrative code.
- Any PR or commit that violates this policy must be rejected or refactored before merge.

### 10.2. Logging Architecture Policy
- All battle log entries are strictly separated:
    - `type: 'NARRATIVE'` — Player-facing story lines, created via the `logStory` utility.
    - `type: 'INFO'` — Technical/developer logs, created via the `logTechnical` utility.
- All engine sub-phases must return log entries to be appended only in `processTurn`.
- UI components must filter logs by type.

### 10.3. Test/Mock Data Policy
- All test data should be isolated and clearly marked. Mock data should accurately reflect the shape of real data types.

### 10.4. Security, Privacy, and Dependency Management
- Regularly audit dependencies for vulnerabilities.
- No sensitive data should ever be stored in the codebase or logs.
- Follow a clear versioning and change management process for all updates.

---

## 11. Documentation: Policy & Automation

### 11.1. Documentation Update Policy (Critical)
> **Best Practice & Policy:** Whenever a file's implementation, responsibility, or integration changes (including refactors, logging, or SRP updates), the corresponding file description, tags, and criticality in this document MUST be updated in the same batch. This ensures the documentation always reflects the true state of the codebase and prevents architectural drift.

### 11.2. Automation & Self-Updating Architecture
- **Structured Comments:** Critical files should contain structured comments:
```typescript
// @docs
// @description: The heart of the battle engine...
// @criticality: 🩸 High Risk
// @owner: AustroMelee
// @tags: core-logic, turn
```
- **Refresh Script:** A script (`npm run docs:refresh`) scans the codebase for `@docs` tags and automatically regenerates tables like the Folder & File Overview.
- **Code-Level Cross-Referencing:** The script also parses imports/exports to generate "Used By" and "Calls" lists, providing a live map of dependencies.
- **Result:** Zero drift between code and documentation and frictionless, accurate updates.

### 11.3. Legendary File Index Automation (ALL_FILES_INDEX.md)
- **Canonical File Map:** `docs/ALL_FILES_INDEX.md` is the single source of truth for all files in the codebase. It is always up-to-date, generated by automation, and must never be hand-edited.
- **Automation Script:** The file is generated by `scripts/auto-crossref.cjs` (run via `node scripts/auto-crossref.cjs` or as part of `npm run docs:refresh`).
- **Columns:**
  - **Path:** Relative to repo root.
  - **Description:** Pulled from `@fileoverview`, `@description`, or top-level comments. If missing, inferred from filename or left blank.
  - **Category:** From `@category` or inferred from directory (e.g., `/ai/` → "AI Engine").
  - **Tags:** From `@tags` or inferred from directory (e.g., `/narrative/` → "narrative").
  - **Status:**
    - 🟢 = Healthy (no TODO/FIXME, not stale)
    - 🟡 = TODO/FIXME present in file
    - 🟠 = Stale (not modified in >6 months)
    - 🔴 = Error/Outdated (future: CI integration)
  - **Last Modified:** Short commit hash, hyperlinked to the commit on GitHub for instant traceability.
  - **Owner:** From `@owner` tag if present, else last commit author.
- **Orphaned/Dead Code Detection:**
  - The script analyzes the import graph to flag files not imported anywhere (except entry points). These are listed in a dedicated "Potential Dead Code / Unused Files" section, but also appear in the main table.
- **Category & Tag Inference:**
  - If no `@category` or `@tags` are present, the script infers them from the file's directory structure.
- **File Counts:**
  - Each category section displays the number of files it contains.
- **Traceability:**
  - Every file row is traceable to its last change and owner. The top of the file links to the latest commit diff.
- **CI/Pre-commit Enforcement:**
  - The index must be updated in every commit that adds, removes, or modifies files. This is enforced by pre-commit/CI hooks. If the index is not updated, the commit/PR fails unless a `--skip-index` flag is set (with justification).
- **Source of Truth:**
  - The index is used for onboarding, audits, maintenance, and as a reference for all contributors and automation.
- **Extensibility:**
  - The script is designed to be extended for future features: CI/lint status badges, stale file warnings, search/filter UI, and more.

> **Reference:** For the full, always-up-to-date file listing, see [ALL_FILES_INDEX.md](./ALL_FILES_INDEX.md). For script details, see [scripts/auto-crossref.cjs](../scripts/auto-crossref.cjs).

### 11.4. Escalation/Desperation/AI/Phase Logic:
- **All such logic must be documented, strictly phase-based, and type-safe.** Any changes must be reflected in this document and in ALL_FILES_INDEX.md.

---

## 12. Testing & Deployment
*(This section is a placeholder for detailed strategies)*
- **12.1. Testing Strategy:** Includes unit, integration, and end-to-end tests.
- **12.2. CI/CD and Deployment:** Automated pipeline for testing, building, and deploying.

### Lint & Auto-fix
Run `npm run lint:fix` to apply ESLint auto-fixes. The CI workflow rejects commits with any remaining lint errors. This command is enforced in package.json scripts, developer docs, and CI configuration.

---

## 13. Onboarding/Quick Start
*(This section is a placeholder for new developer instructions)*

---

## 14. Architecture Decision Records (ADRs)
*(This section is a placeholder for linking to ADR files)*

---

## 15. FAQ & Common Pitfalls
*(This section is a placeholder for frequently asked questions)*

---

## 16. Troubleshooting Playbook
*(This section is a placeholder for debugging common issues)*

---

## 17. Recent Changes
### Phase 5: Log Pipeline & UI Hardening (July 2025)
- Log pipeline and UI are now robust, type-safe, and future-proof.
- Renderer: `UnifiedBattleLog.tsx` uses an exhaustive switch for log types, with unknown types rendered as neutral gray.
- Unit Test: `UnifiedBattleLog.test.tsx` covers all log types and ensures exhaustive rendering.
- Lint Rule: Custom ESLint plugin prevents stray imports of `DialogueLogEntry`.
- Type Helper: `assertNever` enforces compile-time exhaustiveness.
- Log Creation: All logs are created via robust helpers (`logTechnical`, `logStory`, `logDialogue`, `logSystem`), never null, and strictly typed. All tactical subtypes are mapped to canonical types at the source. Duplicate log entries are prevented with a hash/set utility.

### Phase 4: Escalation/Desperation/AI/Phase Logic Refactor (July 2025)
- All escalation and desperation mechanics are now strictly phase-based, with no legacy flag checks.
- AI move selection is contract-bound and phase-driven, with strict move pool enforcement in escalation/desperation.
- All log creation and handling is robust, type-safe, and never null.
- All escalation/desperation/AI/phase files are now fully type-safe and future-proof.
- Batch cleanup of all type/lint errors and unused variables/imports.
- Node.js scripts and documentation automation are robust and error-free.

### Phase 3: Plug-and-Play Refactor Completion (July 2025)
- All moves, AI rules, and narrative pools are now loaded via registries.
- Adding new content is now a pure data/registry operation, fully decoupling the engine from content.

### Phase 2.2: AAA Narrative Logging & SRP Finalization (July 2025)
- All logs are now created via `logStory` or `logTechnical` utilities.
- `logStory` now centralizes all narrative log hygiene: anti-repetition, null filtering, capitalization, and generic fallbacks.
- Engine-level forced ending: A `forcedEnding` flag is set if both fighters reach maximum escalation, guaranteeing no infinite loops.
- `.cursorcontext` compliance: Pre-commit and CI hooks enforce type, lint, and doc sync.

### Phase 2.1: Critical Stability Update - Log Separation (July 2025)
- Log Separation Enforced: Battle log entries are now strictly separated into NARRATIVE and INFO types.
- Engine Refactor: All services now return log entries to be appended only in `processTurn`, enforcing a pure, one-way data flow.

---

## 18. Glossary of Terms
*(This section is a placeholder for key terminology)*
- **SRP:** Single Responsibility Principle.
- **ADR:** Architecture Decision Record.
- **Registry:** A central service that loads and provides access to data-driven content (e.g., moves, AI rules).

---

## Onboarding: Unused/Legacy File Policy

- All orphaned/unused files are listed in [UNUSED_FILES_REPORT.md](../UNUSED_FILES_REPORT.md), auto-generated by CI.
- Every flagged file must have a rationale or legacy tag in its header.
- Do not use or resurrect files flagged as @legacy or listed in the report without consulting the project architect.
- See the decision log and changelog links in the report for context.
- Before merging, confirm the checklist:
  - [ ] Not imported anywhere (static/dynamic analysis)
  - [ ] No runtime references or dynamic loading
  - [ ] Superseded file is live and covered by tests
  - [ ] Changelog/GitHub issue updated
  - [ ] Team notified

## Log Type System (2025 Update)

### LogEntryType
All log entries now have an explicit `type` field:

- `dialogue` — In-character speech, taunts, or dialogue. Use `logDialogue`.
- `mechanics` — Technical/mechanical outcomes, system events, or developer logs. Use `logTechnical`.
- `narrative` — Pure narrative, story-driven lines, or scene-setting. Use `logStory`.
- `system` — System-level messages, out-of-band notifications. Use `logSystem`.

### Log Creation Rules
- Always use the correct log generator for the intent:
  - Character speech: `logDialogue({ ... })`
  - Mechanics/results: `logTechnical({ ... })`
  - Narrative/story: `logStory({ ... })`
  - System message: `logSystem({ ... })`
- Never create a log entry without a `type`.
- When loading legacy logs, use the `inferLogType(log)` helper to assign a type if missing.

### Visual Distinction in UI
- **Dialogue:** Speech bubble, quotes, speaker face, 💬 icon
- **Mechanics:** Gear/sword icon, flat box, ⚙️ icon
- **Narrative:** Italic, “storybook” style, NarrativeBubble
- **System:** Subtle, out-of-band message, 🖥️ icon

### Example
```ts
logDialogue({ turn, actor: 'Azula', text: 'You cannot win, Avatar!' });
logTechnical({ turn, actor: 'System', action: 'Chi Drain', result: 'Azula loses 10 chi.' });
logStory({ turn, actor: 'Narrator', narrative: 'The arena trembles as the battle intensifies.' });
logSystem({ turn, actor: 'System', message: 'Battle paused for player input.' });
```

- All log types are enforced by TypeScript and reviewed in code review.
- See `src/features/battle-simulation/services/utils/mechanicLogUtils.ts` for implementation.
- **Log View Modes:** The UI supports multiple log view modes (see Section 6.4), with clear separation between developer and public-facing options. The dropdown is always visible for devs, and only [PUBLIC] mode is shown to users in production.