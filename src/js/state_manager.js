/**
 * @fileoverview Avatar Battle Arena - Centralized State Management
 * @description Manages global application state with efficient rendering and UI synchronization.
 * @version 2.1.0
 */

"use strict";

import { getGlobalState, setGlobalState, getUIState, getSelectionState } from "./state/global_state.js";
import { addStateChangeListener } from "./state/listeners.js";
import { requestRender, forceRender } from "./state/render_loop.js";
import { updateGameState, updateUIState, updateCharacterSelection, updateLocationSelection, showLoadingState, showResultsState, resetGameState } from "./state/state_updaters.js";

/**
 * @typedef {import('./types/composite.js').GameState} GameState
 * @typedef {import('./types/ui.js').UIState} UIState
 * @typedef {import('./types/ui.js').SelectionState} SelectionState
 * @typedef {import('./types/battle.js').BattleState} BattleState
 * @typedef {import('./types/battle.js').Fighter} Fighter
 * @typedef {import('./types/battle.js').BattleResult} BattleResult
 * @typedef {Object} StateManagerOptions
 * @description Configuration options for state manager.
 * @property {boolean} [enableDebugLogging=false] - Enable debug logging.
 * @property {boolean} [enablePerformanceTracking=false] - Enable performance tracking.
 */

let isInitialized = false;

/**
 * Initializes the state manager with the given options.
 * @param {StateManagerOptions} [options={}] - The initialization options.
 */
export function initializeStateManager(options = {}) {
    if (isInitialized) {
        console.warn("[State Manager] Already initialized.");
        return;
    }

    /** @type {StateManagerOptions} */
    const opts = options;
    const { enableDebugLogging = false, enablePerformanceTracking = false } = opts;

    const config = {
        debugMode: enableDebugLogging,
        performanceTracking: enablePerformanceTracking,
        logLevel: enableDebugLogging ? "debug" : "info",
    };

    updateGameState({ config });

    isInitialized = true;
    console.log("[State Manager] Initialized successfully.");
}

export {
    getGlobalState,
    setGlobalState,
    getUIState,
    getSelectionState,
    updateGameState,
    updateUIState,
    updateCharacterSelection,
    updateLocationSelection,
    showLoadingState,
    showResultsState,
    resetGameState,
    addStateChangeListener,
    requestRender,
    forceRender
}; 