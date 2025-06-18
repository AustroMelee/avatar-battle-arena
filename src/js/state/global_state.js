/**
 * @fileoverview Defines and manages the global state container for the application.
 * @description This module is the single source of truth for the entire application's state.
 * It provides getter and setter functions to ensure controlled access and mutation.
 * @version 1.0.0
 */

"use strict";

/**
 * @typedef {import('../types/composite.js').GameState} GameState
 * @typedef {import('../types/ui.js').UIState} UIState
 * @typedef {import('../types/ui.js').SelectionState} SelectionState
 * @typedef {import('../types/battle.js').BattleState} BattleState
 */

/** 
 * @type {GameState} 
 * @description The single, global state object for the entire application.
 */
let globalState = /** @type {GameState} */ ({
    ui: {
        currentScreen: "selection",
        selection: {
            fighter1Id: "",
            fighter2Id: "",
            locationId: "",
            timeOfDay: "day",
            gameMode: "battle",
            emotionalMode: false
        },
        rendering: {
            needsUpdate: false,
            lastRendered: {},
            dirtyComponents: [],
            lastRenderTime: 0,
            performance: {
                averageRenderTime: 0,
                maxRenderTime: 0,
                totalRenders: 0,
                skippedRenders: 0,
                componentTimes: {}
            }
        },
        animation: {
            queue: [],
            isPlaying: false,
            currentIndex: 0,
            speed: "normal",
            isPaused: false
        },
        interaction: {
            isInteracting: false,
            activeElement: "",
            disabledElements: {},
            history: [],
            preferences: {}
        },
        cache: {}
    },
    battle: null,
    config: {
        debugMode: false,
        performanceTracking: false,
        logLevel: "info",
        maxTurns: 50,
        deterministicRandom: false,
        customSettings: {}
    },
    cache: {}
});

/**
 * Gets the entire current global state object.
 * @returns {GameState} The global state.
 */
export function getGlobalState() {
    return globalState;
}

/**
 * Replaces the entire global state with a new state object.
 * @param {GameState} newState The new state to set.
 * @returns {void}
 */
export function setGlobalState(newState) {
    if (!newState) {
        throw new Error("setGlobalState: A new state object must be provided.");
    }
    globalState = newState;
}

/**
 * Gets the UI state portion of the global state.
 * @returns {UIState} The UI state.
 */
export function getUIState() {
    return globalState.ui;
}

/**
 * Gets the current character and location selection state.
 * @returns {SelectionState} The selection state.
 */
export function getSelectionState() {
    return globalState.ui.selection;
}

/**
 * Gets the current battle state.
 * @returns {BattleState | null} The current battle state, or null if no battle is active.
 */
export function getBattleState() {
    return globalState.battle;
}

/**
 * Sets the battle state portion of the global state.
 * @param {BattleState | null} newBattleState The new battle state to set.
 * @returns {void}
 */
export function setBattleState(newBattleState) {
    globalState.battle = newBattleState;
} 