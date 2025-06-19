# State Module

## Overview

The State module is the **single source of truth** for the entire application. It encapsulates all application data—including UI state, battle state, and configuration—into a single, centralized `globalState` object.

This module follows a Redux-like pattern, providing a clear and predictable way to manage state changes. All mutations are performed through dedicated updater functions, and any component can subscribe to state changes to reactively update itself. This prevents scattered state and uncontrolled mutations, which are common sources of bugs in complex applications.

## Architectural Constraints

- This is a foundational module. It should have very few dependencies, primarily on `utils` for helper functions.
- It must **not** have dependencies on `engine`, `ai`, or `ui` components that perform rendering.
- All state modifications **must** go through the `updateGameState` or `updateUIState` functions. Direct mutation of the `globalState` object from outside this module is strictly forbidden.

## Module Interaction

```mermaid
graph TD
    A[UI Event (e.g., button click)] --> B{State Updaters}
    B -- "updateGameState()" --> C[Global State]
    C -- "Notifies" --> D[Listeners]
    D -- "Triggers" --> E[Render Loop]
    E -- "Re-renders" --> F[UI Components]

    subgraph State Module
        B
        C
        D
        E
    end
```
1.  **UI Event**: An action, like the user clicking a character portrait, triggers an event handler.
2.  **State Updaters**: The event handler calls an updater function from `state_updaters.js` (e.g., `updateCharacterSelection('aang', 'fighter1Id')`).
3.  **Global State**: The updater function creates a new state object by merging the changes and replaces the `globalState`.
4.  **Listeners**: The `notifyStateChangeListeners` function is called, which iterates through all subscribed listeners.
5.  **Render Loop**: A key listener is the `render_loop.js`, which schedules a re-render of the application UI.
6.  **UI Components**: The rendering logic (in the `/ui` module) reads from the new `globalState` to display the updated information.

## Files

-   **`global_state.js`**: Defines the shape of the `GameState` object and holds the single `globalState` instance. It provides simple getter and setter functions (`getGlobalState`, `setGlobalState`) for controlled access.
-   **`state_updaters.js`**: The only place where state mutation logic should exist. It provides functions like `updateGameState` and `updateUIState` that take partial state objects, merge them into the global state, and trigger the notification process.
-   **`listeners.js`**: Manages the subscription system. It contains `addStateChangeListener` for components to register themselves and `notifyStateChangeListeners` to broadcast updates.
-   **`render_loop.js`**: A specialized listener that handles the application's rendering. It uses `requestAnimationFrame` for efficient updates and can be triggered by state changes.
-   **`utils.js`**: Contains helper functions for the state module, most importantly `deepMerge` for safely merging nested state objects without losing data.

## Usage

### Updating State

To change the application state, import an updater function and call it with the new data.

```javascript
import { updateUIState } from './js/state/state_updaters.js';

// Example: Handling a click on the "vs AI" button
function onGameModeToggle() {
    updateUIState({
        selection: {
            gameMode: 'ai'
        }
    });
    // The render loop will automatically be triggered to update the UI.
}
```

### Subscribing to State Changes

A UI component can subscribe to changes to know when it needs to re-render.

```javascript
import { addStateChangeListener } from './js/state/listeners.js';
import { getUIState } from './js/state/global_state.js';

function setupHeaderComponent() {
    const headerElement = document.getElementById('header');

    function renderHeader() {
        const { currentScreen } = getUIState();
        headerElement.textContent = `Current Screen: ${currentScreen}`;
    }

    // Add a listener that calls renderHeader whenever the state changes.
    addStateChangeListener(renderHeader);

    // Initial render.
    renderHeader();
}
``` 