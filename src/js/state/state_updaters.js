/**
 * @fileoverview Provides pure functions for updating the global application state.
 * @description This module centralizes state mutation logic. Functions here take new data,
 * merge it into the global state, and trigger re-renders, but they do NOT contain
 * any simulation-specific or direct DOM manipulation logic.
 * @version 2.0.0
 */

"use strict";

import { getGlobalState, setGlobalState, setBattleState } from "./global_state.js";
import { deepMerge } from "./utils.js";
import { notifyStateChangeListeners } from "./listeners.js";
import { requestRender } from "./render_loop.js";

/**
 * @typedef {import('../types/composite.js').GameState} GameState
 * @typedef {import('../types/ui.js').UIState} UIState
 * @typedef {import('../types/battle.js').BattleResult} BattleResult
 */

/**
 * Updates the global state by deep merging a partial state object.
 * This is the primary function for all state mutations.
 *
 * @param {Partial<GameState>} newState - A partial state object to merge into the current state.
 * @param {boolean} [triggerRender=true] - Whether to request a UI re-render after the state change.
 * @returns {void}
 * @throws {TypeError} If newState is not a valid object.
 */
export function updateGameState(newState, triggerRender = true) {
    if (!newState || typeof newState !== "object") {
        throw new TypeError("updateGameState: newState must be an object");
    }

    const oldState = JSON.parse(JSON.stringify(getGlobalState()));
    const updatedState = deepMerge(getGlobalState(), newState);
    setGlobalState(updatedState);

    notifyStateChangeListeners(oldState, updatedState);

    if (triggerRender) {
        requestRender();
    }
}

/**
 * A convenience function to update the UI state specifically.
 * Merges updates into the `ui` property of the global state.
 *
 * @param {Partial<UIState>} uiUpdates - A partial UI state object to merge.
 * @param {boolean} [triggerRender=true] - Whether to request a UI re-render.
 * @returns {void}
 */
export function updateUIState(uiUpdates, triggerRender = true) {
    if (!uiUpdates || typeof uiUpdates !== "object") {
        throw new TypeError("updateUIState: uiUpdates must be an object");
    }
    const oldState = getGlobalState();
    const newState = {
        ...oldState,
        ui: deepMerge(oldState.ui, uiUpdates)
    };
    setGlobalState(newState);

    notifyStateChangeListeners(oldState, newState);

    if (triggerRender) {
        requestRender();
    }
}

/**
 * Updates a character selection slot in the state.
 * @param {string} fighterId - The unique identifier for the selected fighter.
 * @param {'fighter1Id' | 'fighter2Id'} slotKey - The selection slot to update.
 * @returns {void}
 * @throws {Error} If arguments are invalid.
 */
export function updateCharacterSelection(fighterId, slotKey) {
    if (typeof fighterId !== "string" || !["fighter1Id", "fighter2Id"].includes(slotKey)) {
        throw new Error("Invalid arguments for updateCharacterSelection");
    }
    const state = getGlobalState();
    updateUIState({
        selection: {
            ...state.ui.selection,
            [slotKey]: fighterId
        }
    });
}

/**
 * Updates the location selection in the state.
 * @param {string} locationId - The unique identifier for the selected location.
 * @returns {void}
 * @throws {TypeError} If locationId is not a string.
 */
export function updateLocationSelection(locationId) {
    if (typeof locationId !== "string") {
        throw new TypeError("updateLocationSelection: locationId must be a string");
    }
    const state = getGlobalState();
    updateUIState({
        selection: {
            ...state.ui.selection,
            locationId: locationId
        }
    });
}

/**
 * Shows the loading state for battle simulation.
 * @deprecated This function mixes state updates with direct UI logic calls.
 * Its logic should be moved to the UI layer that initiates the battle.
 * @param {string} mode - Simulation mode ('animated', 'instant', etc.).
 */
export function showLoadingState(mode) {
    console.warn("showLoadingState is deprecated. Move its logic to the UI event handler.");
    if (typeof mode !== "string") {
        throw new TypeError("showLoadingState: mode must be a string");
    }
    const state = getGlobalState();
    updateUIState({
        currentScreen: "loading",
        interaction: {
            ...state.ui.interaction,
            isInteracting: true,
            disabledElements: { battleBtn: true, characterSelection: true, locationSelection: true }
        }
    });
}

/**
 * Shows the results state after battle completion.
 * @deprecated This function mixes state updates with direct UI logic calls.
 * Its logic should be moved to the UI layer that handles battle completion.
 * @param {BattleResult} battleResult - Complete battle result.
 * @param {string} mode - Simulation mode that was used.
 */
export function showResultsState(battleResult, mode) {
    console.warn("showResultsState is deprecated. Move its logic to the UI event handler.");
    if (!battleResult || typeof battleResult !== "object" || typeof mode !== "string") {
        throw new TypeError("Invalid arguments for showResultsState");
    }
    // The new battle state should be set here
    setBattleState(battleResult.finalState);

    const state = getGlobalState();
    updateUIState({
        currentScreen: "results",
        interaction: {
            ...state.ui.interaction,
            isInteracting: false,
            disabledElements: {}
        }
    });
}

/**
 * Resets the global state to its initial values for a new battle.
 * @returns {void}
 */
export function resetGameState() {
    const state = getGlobalState();
    // Preserve configuration across resets.
    const preservedConfig = { ...state.config };

    const freshState = {
        ui: {
            currentScreen: "selection",
            selection: { fighter1Id: "", fighter2Id: "", locationId: "", timeOfDay: "day", gameMode: "battle", emotionalMode: false },
            rendering: { needsUpdate: true, lastRendered: {}, dirtyComponents: [], lastRenderTime: 0, performance: { averageRenderTime: 0, maxRenderTime: 0, totalRenders: 0, skippedRenders: 0, componentTimes: {} } },
            animation: { queue: [], isPlaying: false, currentIndex: 0, speed: "normal", isPaused: false },
            interaction: { isInteracting: false, activeElement: "", disabledElements: {}, history: [], preferences: {} },
            cache: {}
        },
        battle: null, // Reset battle state
        config: preservedConfig,
        cache: {}
    };
    setGlobalState(freshState);
    requestRender();
} 