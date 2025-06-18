/**
 * @fileoverview Avatar Battle Arena - Main UI Controller
 * @description Central UI management system orchestrating various UI modules.
 * @version 2.1.0
 */

"use strict";

/**
 * @typedef {import('./types/ui.js').UIConfig} UIConfig
 * @typedef {import('./types/ui.js').SelectionState} SelectionState
 */

import * as UI from "./ui/ui_module.js";
import { getUIConfig, getUIState } from "./ui/ui_state.js";
import { displayCompleteBattleResults } from './ui/battle_results.js';
import { initializeReplayControls, showReplaySystem } from './ui_replay_controls.js';

const UI_SELECTORS = {
    characterSection: "#character-selection",
    locationSection: "#location-selection",
    battleSection: "#battle-display",
    controlsSection: "#battle-controls",
    logSection: "#battle-log",
    loadingOverlay: "#loading-overlay",
    errorDisplay: "#error-display",
    replayButton: "#replayBtn"
};

const REQUIRED_UI_ELEMENTS = [
    "character-selection",
    "location-selection",
    "battle-display",
    "battle-controls",
    "battle-log"
];

/**
 * Initializes the UI system.
 * @param {import('./types/ui.js').UIConfig} [config={}] - UI configuration options.
 * @returns {Promise<void>}
 */
export async function initializeUI(config = {}) {
    console.log("[UI] Initializing UI system...");

    try {
        UI.setUIConfig(config);
        validateRequiredElements();
        UI.initializeComponentStates(REQUIRED_UI_ELEMENTS);
        UI.setupEventHandlers();
        setupReplayButton();
        /** @type {import('./types/ui.js').UIConfig} */
        const uiConfig = getUIConfig();
        UI.applyTheme(uiConfig.theme);
        
        await UI.showScreen("character-selection");
        
        initializeReplayControls();
        requestAnimationFrame(UI.updateRenderLoop);
        
        console.log("[UI] UI system initialized successfully");
    } catch (/** @type {any} */ error) {
        console.error("[UI] Failed to initialize UI system:", error);
        UI.showErrorMessage(`UI initialization failed: ${error.message}`);
        throw error;
    }
}

function validateRequiredElements() {
    const missingElements = Object.values(UI_SELECTORS).filter(selector => !document.querySelector(selector));
    if (missingElements.length > 0) {
        throw new Error(`Missing required UI elements: ${missingElements.join(", ")}`);
    }
}

/**
 * Sets up the event listener for the replay button.
 * @private
 */
function setupReplayButton() {
    const replayBtn = document.querySelector(UI_SELECTORS.replayButton);
    if (replayBtn) {
        replayBtn.addEventListener("click", () => {
            console.log("[UI] Replay button clicked.");
            showReplaySystem();
        });
    } else {
        console.warn("[UI] Replay button not found. Replay functionality will be unavailable.");
    }
}

/**
 * Updates the current selection state.
 * @param {import('./types/ui.js').SelectionState} updates
 */
export function updateSelection(updates) {
    UI.updateSelectionState(updates);
    UI.markUIForUpdate();
    validateSelectionState();
}

/**
 * @returns {import('./types/ui.js').SelectionState}
 */
export function getCurrentSelection() {
    /** @type {import('./types/ui.js').UIState} */
    const uiState = getUIState();
    return uiState.selection;
}

function validateSelectionState() {
    /** @type {import('./types/ui.js').UIState} */
    const uiState = getUIState();
    const selection = uiState.selection;
    const isValid = selection.fighter1Id && selection.fighter2Id && selection.locationId && selection.fighter1Id !== selection.fighter2Id;
    
    /** @type {HTMLButtonElement | null} */
    const startButton = document.querySelector("#start-battle-button");
    if (startButton) {
        startButton.disabled = !isValid;
        startButton.textContent = isValid ? "Start Battle" : "Select Fighters and Location";
    }
    return isValid;
}

/**
 * Displays battle results.
 * @param {import('./types/battle.js').BattleResult} battleResult
 * @param {object} [options={}]
 * @returns {Promise<void>}
 */
export async function displayBattleResults(battleResult, options = {}) {
    console.log("[UI] Displaying battle results");
    try {
        await displayCompleteBattleResults(battleResult);
        UI.setCurrentScreen("battle-results");
        UI.markComponentDirty("battle-results");
    } catch (/** @type {any} */ error) {
        console.error("[UI] Failed to display battle results:", error);
        UI.showErrorMessage("Failed to display battle results.");
        throw error;
    }
} 