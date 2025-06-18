/**
 * @fileoverview Provides utility functions for the UI.
 */

"use strict";

const UI_SELECTORS = {
    errorDisplay: "#error-display"
};

const VALID_THEMES = ["light", "dark", "avatar"];

/**
 * Shows an error message to the user.
 * @param {string} message - The error message to display.
 * @param {{autoHide?: boolean, delay?: number}} [options={}] - Display options.
 */
export function showErrorMessage(message, options = {}) {
    if (typeof message !== "string") {
        throw new TypeError("showErrorMessage: message must be a string");
    }
    
    console.error("[UI] Showing error message:", message);
    
    /** @type {HTMLElement | null} */
    const errorDisplay = document.querySelector(UI_SELECTORS.errorDisplay);
    
    if (errorDisplay) {
        errorDisplay.textContent = message;
        errorDisplay.style.display = "block";
        
        const delay = options.autoHide !== false ? (options.delay || 5000) : 0;
        
        if (delay > 0) {
            setTimeout(() => {
                errorDisplay.style.display = "none";
            }, delay);
        }
    }
}

/**
 * Applies a theme to the UI.
 * @param {string} themeName - The name of the theme to apply.
 */
export function applyTheme(themeName) {
    if (typeof themeName !== "string") {
        throw new TypeError("applyTheme: themeName must be a string");
    }
    
    if (!VALID_THEMES.includes(themeName)) {
        throw new Error(`applyTheme: invalid theme '${themeName}'.`);
    }
    
    document.body.classList.remove(...VALID_THEMES.map(theme => `theme-${theme}`));
    document.body.classList.add(`theme-${themeName}`);
    
    console.debug(`[UI] Applied theme: ${themeName}`);
} 