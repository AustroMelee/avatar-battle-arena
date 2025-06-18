/**
 * @fileoverview Simulation DOM Manager
 * @description DOM element management and initialization for simulation mode
 * @version 1.0
 */

"use strict";

// DOM references are initialized by `initializeSimulationManagerDOM`
const DOM = {
    simulationContainer: null,
    cancelButton: null,
    battleResultsContainer: null,
    winnerNameDisplay: null,
    analysisListDisplay: null,
    battleStoryDisplay: null,
    animatedLogOutput: null,
    zoomInBtn: null,
    zoomOutBtn: null
};

/**
 * Initializes DOM references for simulation manager
 * @param {Object} domRefs - Object containing DOM element references
 */
export function initializeSimulationManagerDOM(domRefs) {
    if (!domRefs) {
        console.error("Sim Manager (initializeDOM): domRefs object is null or undefined.");
        return;
    }
    
    // Safely assign DOM references. If an ID is not found, the element will remain null.
    DOM.simulationContainer = domRefs.simulationContainer;
    DOM.cancelButton = domRefs.cancelButton;
    DOM.battleResultsContainer = domRefs.battleResultsContainer;
    DOM.winnerNameDisplay = domRefs.winnerNameDisplay;
    DOM.analysisListDisplay = domRefs.analysisListDisplay;
    DOM.battleStoryDisplay = domRefs.battleStoryDisplay;
    DOM.animatedLogOutput = domRefs.animatedLogOutput;
    DOM.zoomInBtn = domRefs.zoomInBtn;
    DOM.zoomOutBtn = domRefs.zoomOutBtn;

    if (!DOM.simulationContainer || !DOM.animatedLogOutput) {
        console.warn("Sim Manager (initializeDOM): Critical DOM elements missing. Animation mode may not function properly.");
    }

    if (!DOM.zoomInBtn || !DOM.zoomOutBtn) {
        console.warn("Sim Manager (initializeDOM): Camera control buttons missing. Camera controls may not function.");
    }
}

/**
 * Gets DOM element references
 * @returns {Object} DOM element references
 */
export function getDOMReferences() {
    return { ...DOM };
}

/**
 * Sets up event listeners for simulation controls
 * @param {Function} onCancel - Callback for cancel button
 */
export function setupEventListeners(onCancel) {
    if (DOM.cancelButton && typeof onCancel === "function") {
        DOM.cancelButton.addEventListener("click", onCancel);
    } else {
        console.warn("Sim Manager (setupEventListeners): Cancel button not found or invalid callback.");
    }
}

/**
 * Shows the simulation container
 */
export function showSimulationContainer() {
    if (DOM.simulationContainer) {
        DOM.simulationContainer.classList.remove("hidden");
    }
}

/**
 * Hides the simulation container
 */
export function hideSimulationContainer() {
    if (DOM.simulationContainer) {
        DOM.simulationContainer.classList.add("hidden");
    }
}

/**
 * Shows the cancel button
 */
export function showCancelButton() {
    if (DOM.cancelButton) {
        DOM.cancelButton.classList.remove("hidden");
        DOM.cancelButton.disabled = false;
    }
}

/**
 * Hides the cancel button
 */
export function hideCancelButton() {
    if (DOM.cancelButton) {
        DOM.cancelButton.classList.add("hidden");
        DOM.cancelButton.disabled = true;
    }
}

/**
 * Clears the animated log output
 */
export function clearAnimatedOutput() {
    if (DOM.animatedLogOutput) {
        DOM.animatedLogOutput.innerHTML = "";
    }
}

/**
 * Gets the animated log output element
 * @returns {HTMLElement|null} The animated log output element
 */
export function getAnimatedLogOutput() {
    return DOM.animatedLogOutput;
} 