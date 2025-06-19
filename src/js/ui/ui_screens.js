/**
 * @fileoverview Manages showing and hiding of UI screens.
 */

"use strict";

import { getUIState, setCurrentScreen, markComponentDirty, setComponentState, getUIConfig } from "./ui_state.js";
// import { showCharacterSelection } from '../ui_character-selection.js';
// import { showLocationSelection } from '../ui_location-selection.js';
// import { showBattleDisplay } from '../ui_battle-display.js'; // Assuming this will be created
import { animateShow, animateHide } from "./ui_animation.js";

/**
 * Shows a specific UI screen.
 * @param {string} screenName - The name of the screen to show.
 * @param {object} [options={}] - Screen transition options.
 * @returns {Promise<void>}
 */
export async function showScreen(screenName, options = {}) {
    if (typeof screenName !== "string") {
        throw new TypeError("showScreen: screenName must be a string");
    }
    
    console.debug(`[UI] Showing screen: ${screenName}`);
    
    try {
        /** @type {import('../types/ui.js').UIState} */
        const uiState = getUIState();
        if (uiState.currentScreen !== screenName) {
            await hideScreen(uiState.currentScreen, options);
        }
        
        await showScreenImplementation(screenName, options);
        
        setCurrentScreen(screenName);
        markComponentDirty(screenName);
        
    } catch (error) {
        console.error(`[UI] Failed to show screen ${screenName}:`, error);
        throw error;
    }
}

/**
 * @param {string} screenName
 * @param {object} options
 */
async function showScreenImplementation(screenName, options) {
    switch (screenName) {
        case "character-selection":
            {
                const el = document.querySelector("#character-selection");
                if (el) el.style.display = "block";
            }
            break;
        case "location-selection":
            {
                const el = document.querySelector("#location-selection");
                if (el) el.style.display = "block";
            }
            break;
        case "battle-display":
            // await showBattleDisplay(options);
            break;
        default:
            throw new Error(`Unknown screen: ${screenName}`);
    }
    setComponentState(screenName, { visible: true, loading: false });
}

/**
 * @param {string} screenName
 * @param {object} options
 */
async function hideScreen(screenName, options = {}) {
    if (!screenName || typeof screenName !== "string") {
        return;
    }
    
    /** @type {HTMLElement | null} */
    const screenElement = document.querySelector(`#${screenName}`);
    
    if (screenElement) {
        /** @type {import('../types/ui.js').UIConfig} */
        const uiConfig = getUIConfig();
        // @ts-ignore
        if (options.animate && uiConfig.enableAnimations) {
            await animateHide(screenElement);
        } else {
            screenElement.style.display = "none";
        }
    }
    
    setComponentState(screenName, { visible: false });
}

export function hideAllScreens() {
    const screens = document.querySelectorAll(".screen");
    screens.forEach(screen => {
        /** @type {HTMLElement} */ (screen).style.display = "none";
    });
} 