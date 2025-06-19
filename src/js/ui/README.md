# 🖼️ UI Module

## 📜 Purpose

The UI module is the presentation layer of the Avatar Battle Arena. It is responsible for all direct DOM manipulation, rendering application state to the screen, and handling all user interactions, from character selection to displaying final battle results. It acts as the primary interface between the user and the underlying game engine, ensuring a clear separation of concerns by never containing any core game logic itself.

The module is designed to be state-driven. It listens for changes in the application's central state and re-renders components as needed. It also captures user input (like character selections or button clicks) and dispatches actions to update the state, but does not directly invoke engine functions.

## 🗂️ Files & Exports

The UI module is composed of a main controller and several specialized sub-modules for handling specific UI concerns like battle analysis, character selection, and replaying battles.

### Core UI Files

-   **`ui.js`**: The central UI orchestrator.
    -   `initializeUI()`: Sets up all UI components, event listeners, and the main render loop.
    -   `updateSelection()`: Updates the user's fighter/location selection state.
    -   `getCurrentSelection()`: Retrieves the current selection state.
    -   `displayBattleResults()`: Coordinates the process of showing the post-battle analysis screen.
-   **`index.js`**: A barrel file that exports the primary functions from `ui.js` and re-exports functionality from other UI modules for easy access.
-   **`ui_module.js`**: Contains low-level, reusable UI functions for managing component state, screen transitions, and the render loop.
-   **`ui_state.js`**: Manages the internal state of the UI, including component visibility, user selections, and global UI configurations like themes.
-   **`dom_elements.js`**: A DOM registry that caches references to frequently accessed elements to improve performance and centralize DOM queries.
-   **`ui_renderer.js`**: Handles the actual rendering logic, taking state and converting it into DOM updates.
-   **`ui_events.js`**: Centralizes all UI-related event handling.

### Battle Results & Analysis

-   **`battle_results.js`**: Orchestrates the analysis and rendering of the final battle results screen.
    -   `displayCompleteBattleResults()`: The main entry point to show the results.
-   **`battle_results_renderer.js`**: A pure rendering module that creates HTML elements from analyzed battle data without performing direct DOM manipulation.
-   **`battle_analysis.js`**: The entry point for the analysis sub-module.
    -   `analyzeBattleResults()`: Takes a raw `BattleResult` object and produces a structured `BattleAnalysisResult`.
-   **`./analysis/`**: A subdirectory containing specialized analysis functions for the winner, fighters, and environment.

### Other UI Components

-   **`./character_selection/`**: A sub-module dedicated to the logic and state of the character selection screen.
-   **`./replay/`**: A sub-module containing all logic for the battle replay system, including playback controls and state snapshot management.
-   **`battle_log_controls.js`**: Provides standalone functions for managing the interactive elements of the detailed battle log (toggling visibility, copying content).

## 🧩 Module Interactions

The UI module is the top-level consumer of application state and the primary source of user-driven actions. It sits between the user and the rest of the application.

```mermaid
graph TD
    subgraph User
        direction LR
        A[User Interaction]
    end

    subgraph UI Module (src/js/ui)
        direction TB
        B(ui.js / ui_events.js) --> C{State Update Request};
        D(ui_renderer.js) --> E[DOM Update];
    end

    subgraph State Management
        direction TB
        F(state_manager.js) -->|Notifies| D;
    end

    subgraph Engine (src/js/engine)
        direction TB
        G(engine_battle-engine-core.js)
    end
    
    subgraph Data (src/js/data)
        H(Character/Location Data)
    end

    A --> B;
    C --> F;
    F --> G;
    G --> H;
    G --> F;
```

1.  **User -> UI**: The user interacts with the DOM (e.g., clicks a character).
2.  **UI -> State**: The UI event handlers in `ui_events.js` or `ui.js` capture this interaction and request a state change via `state_manager.js`.
3.  **State -> Engine**: The `main.js` application loop detects the state change (e.g., a "start battle" action) and invokes the `engine` with the current state.
4.  **Engine -> State**: After the battle simulation, the engine returns a result, which is used to update the central state.
5.  **State -> UI**: The `state_manager` notifies its listeners (including the UI) of the state change.
6.  **UI -> DOM**: The `ui_renderer.js` observes the new state and updates the DOM to reflect it (e.g., showing the battle results screen).

## 📝 Architectural Constraints

From `.cursorcontext`:
-   **UI Layer (`src/js/ui/*.js`)**:
    -   **Purpose**: DOM manipulation, animations, rendering logic.
    -   **Can import from**: `/utils`.
    -   **MUST NOT import from**: `/engine` or `/ai`.

This is a critical architectural rule. The UI must remain decoupled from game logic. It should be "dumb," only reacting to state changes and dispatching user intentions. All battle calculations and AI decisions must happen outside this module.

## Usage Example

Initializing the UI and handling a user's selection to start a battle is managed in the main application entry point (`main.js`), but the core UI functions are exported from this module.

```javascript
// In main.js

import { initializeUI, getCurrentSelection } from './ui.js';
import { initializeBattleState } from './engine_state_initializer.js';
import { executeBattle } from './engine_battle-engine-core.js';
import { setGlobalState, getGlobalState } from './state_manager.js';

// 1. Initialize the entire UI system on page load
await initializeUI({
    theme: 'dark',
    enableAnimations: true,
});

// 2. An event listener for the 'FIGHT' button would trigger the battle
document.getElementById('start-battle-button').addEventListener('click', async () => {
    // 3. Get the fighter and location IDs from the UI's state
    const selection = getCurrentSelection();

    // 4. The main application logic (not the UI) calls the engine
    const initialState = initializeBattleState(selection.fighter1Id, selection.fighter2Id, selection.locationId);
    const battleResult = await executeBattle(initialState);

    // 5. Update the global state with the results
    setGlobalState({ battleResult: battleResult, view: 'results' });

    // The UI will automatically react to this state change and display the results.
});
``` 