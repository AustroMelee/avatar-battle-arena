/**
 * @fileoverview Manages UI event handlers, including keyboard shortcuts and window events.
 */

"use strict";

import { getUIConfig, markAllComponentsDirty, getUIState } from "./ui_state.js";
import { updateLayout } from "./ui_layout.js"; // Assuming a layout module will be created
import { showErrorMessage } from "./ui_utils.js"; // Assuming a utils module will be created

function handleEscapeKey() {
    console.debug("[UI] Escape key pressed");
}

function handleEnterKey() {
    console.debug("[UI] Enter key pressed");
}

function handleRefreshKey() {
    console.debug("[UI] Refresh key pressed");
    const requiredElements = Object.keys(getUIState().rendering.componentStates);
    markAllComponentsDirty(requiredElements);
}

/**
 * @param {number} number
 */
function handleNumberKey(number) {
    console.debug(`[UI] Number key ${number} pressed`);
}

/**
 * @param {KeyboardEvent} event
 */
function handleKeyboardShortcuts(event) {
    if (!event || typeof event !== "object") {
        return;
    }

    /** @type {HTMLElement} */
    const target = (event.target);
    if (!target || target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
    }

    switch (event.key) {
        case "Escape":
            event.preventDefault();
            handleEscapeKey();
            break;
        case "Enter":
            event.preventDefault();
            handleEnterKey();
            break;
        case "r":
        case "R":
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                handleRefreshKey();
            }
            break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
            if (!event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                handleNumberKey(parseInt(event.key, 10));
            }
            break;
    }
}

function handleWindowResize() {
    /** @type {import('../types/ui.js').UIState} */
    const uiState = getUIState();
    const requiredElements = Object.keys(uiState.rendering.componentStates);
    markAllComponentsDirty(requiredElements);

    clearTimeout(handleWindowResize.timeout);
    handleWindowResize.timeout = setTimeout(() => {
        updateLayout();
    }, 250);
}

/**
 * @param {ErrorEvent} event
 */
function handleGlobalError(event) {
    console.error("[UI] Global error caught:", event.error);
    showErrorMessage("An unexpected error occurred. Please refresh the page.");
}

export function setupEventHandlers() {
    /** @type {import('../types/ui.js').UIConfig} */
    const uiConfig = getUIConfig();
    if (uiConfig.enableKeyboardShortcuts) {
        document.addEventListener("keydown", handleKeyboardShortcuts);
    }
    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("error", handleGlobalError);
} 