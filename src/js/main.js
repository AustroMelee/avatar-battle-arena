/**
 * @fileoverview Main application entry point for Avatar Battle Arena.
 * @description Initializes UI components and orchestrates the main application flow,
 * from user selection to battle execution, based on a centralized state model.
 * @version 2.0.0
 */
"use strict";

// --- TYPE IMPORTS ---
/**
 * @typedef {import('./types/battle.js').BattleResult} BattleResult
 * @typedef {import('./types/battle.js').BattleState} BattleState
 * @typedef {import('./types/composite.js').GameState} GameState
 */

import { executeBattle } from "./engine_battle-engine-core.js";
import { initializeBattleState } from "./engine_state_initializer.js";
import { 
    getSelectionState,
    updateGameState, 
    resetGameState, 
    forceRender 
} from "./state_manager.js";
import { initializeUI } from "./ui.js";

/**
 * Initializes the application.
 * This function sets up the initial state, initializes all UI components,
 * and attaches the primary event listeners.
 * 
 * @returns {void}
 */
function init() {
    // 1. Set up initial state
    resetGameState();
    
    // 2. Initialize all UI components (character selection, etc.)
    initializeUI();
    
    // 3. Force an initial render to display the default UI
    forceRender();

    // 4. Attach the main battle initiation event listener
    setupBattleButton();
}

/**
 * Attaches the click event listener to the main "FIGHT" button.
 * This function contains the core logic for starting a battle simulation.
 * @returns {void}
 */
function setupBattleButton() {
    /** @type {HTMLButtonElement | null} */
    const battleBtn = document.querySelector("#battleBtn");
    if (!battleBtn) {
        console.error("[MAIN] Battle button not found. The application cannot start a battle.");
        return;
    }

    battleBtn.addEventListener("click", async () => {
        try {
            // 1. Get user selections from the single source of truth (global state)
            const selection = /** @type {import('./types/ui.js').SelectionState} */ (getSelectionState());
            if (!selection.fighter1Id || !selection.fighter2Id || !selection.locationId) {
                alert("Please select both fighters and a location.");
                return;
            }

            // 2. Update UI to a loading state
            updateGameState({ ui: { currentScreen: "loading" } });
            
            // Artificial delay to allow UI to update
            await new Promise(resolve => setTimeout(resolve, 100));

            // 3. Initialize the battle state using the selections
            const initialState = initializeBattleState(
                selection.fighter1Id,
                selection.fighter2Id,
                selection.locationId
            );

            // 4. Execute the battle using the pure engine function
            const battleResult = /** @type {BattleResult} */ (await executeBattle(initialState));
            
            // 5. Update the global state with the battle result
            updateGameState({
                battle: battleResult.finalState,
                ui: { currentScreen: "results" }
            });

        } catch (/** @type {any} */ error) {
            console.error("[MAIN] A critical error occurred during the battle simulation:", error);
            alert("The battle could not be completed due to an unexpected error. Please check the console and refresh.");
            // Reset to a safe state
            resetGameState();
        }
    });
}

// Kick off app initialization on DOMContentLoaded
document.addEventListener("DOMContentLoaded", init);