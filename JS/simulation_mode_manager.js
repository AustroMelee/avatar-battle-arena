// FILE: js/simulation_mode_manager.js
'use strict';

import { startAnimationSequence, stopCurrentAnimation } from './animated_text_engine.js';
import { resetCamera, enableCameraControls, disableCameraControls } from './camera_control.js';

let currentSimulationMode = "instant"; // "animated" or "instant"
let isSimulationRunning = false;
let animationQueue = [];
let battleResultForPostAnimation = null;
let onSimulationCompleteCallback = null;

const DOM = {
    simulationContainer: null,
    cancelButton: null,
    // These will be set by ui.js or main.js after DOM is loaded
    battleResultsContainer: null, 
    winnerNameDisplay: null,
    analysisListDisplay: null,
    battleStoryDisplay: null // For instant mode
};

/**
 * Initializes the Simulation Mode Manager with necessary DOM elements.
 * @param {object} domRefs - References to key DOM elements.
 */
export function initializeSimulationManagerDOM(domRefs) {
    DOM.simulationContainer = domRefs.simulationContainer;
    DOM.cancelButton = domRefs.cancelButton;
    DOM.battleResultsContainer = domRefs.battleResultsContainer;
    DOM.winnerNameDisplay = domRefs.winnerNameDisplay;
    DOM.analysisListDisplay = domRefs.analysisListDisplay;
    DOM.battleStoryDisplay = domRefs.battleStoryDisplay;

    if (DOM.cancelButton) {
        DOM.cancelButton.addEventListener('click', handleCancelSimulation);
    }
}

/**
 * Sets the current simulation mode.
 * @param {"animated" | "instant"} mode - The desired simulation mode.
 */
export function setSimulationMode(mode) {
    currentSimulationMode = mode;
    console.log(`Simulation mode set to: ${currentSimulationMode}`);
}

/**
 * Gets the current simulation mode.
 * @returns {"animated" | "instant"} The current simulation mode.
 */
export function getSimulationMode() {
    return currentSimulationMode;
}

/**
 * Starts the battle simulation display.
 * @param {Array<object>} eventQueue - Array of structured battle events for animation.
 * @param {object} battleResult - The full battle result object.
 * @param {Function} onCompleteCallback - Callback function when simulation finishes or is cancelled.
 */
export function startSimulation(eventQueue, battleResult, onCompleteCallback) {
    if (!DOM.simulationContainer || !DOM.cancelButton) {
        console.error("Simulation Manager: DOM elements not initialized.");
        // Fallback to instant display if UI isn't ready for animation
        onCompleteCallback(battleResult, true); // true indicates instant fallback
        return;
    }

    animationQueue = eventQueue;
    battleResultForPostAnimation = battleResult;
    onSimulationCompleteCallback = onCompleteCallback;
    isSimulationRunning = true;

    DOM.simulationContainer.innerHTML = ''; // Clear previous content
    DOM.simulationContainer.classList.remove('hidden');
    DOM.cancelButton.classList.remove('hidden');
    DOM.cancelButton.disabled = false;
    
    resetCamera(DOM.simulationContainer);
    enableCameraControls(DOM.simulationContainer);

    console.log('Starting animation sequence with queue:', animationQueue);
    startAnimationSequence(animationQueue, DOM.simulationContainer, simulationStepCompleted);
}

/**
 * Callback function called by animated_text_engine after each step or full completion.
 * @param {boolean} isEndOfQueue - True if the entire animation queue is processed.
 */
function simulationStepCompleted(isEndOfQueue) {
    if (!isSimulationRunning) return; // Aborted by cancel

    if (isEndOfQueue) {
        finishSimulation();
    }
    // Otherwise, animation engine will continue with the next step automatically
}

/**
 * Finalizes the simulation, displaying full results.
 */
function finishSimulation() {
    if (!isSimulationRunning) return; // Already cancelled

    console.log("Simulation animation finished.");
    isSimulationRunning = false;
    stopCurrentAnimation(); // Ensure any lingering animation stops
    disableCameraControls();
    if (DOM.cancelButton) {
        DOM.cancelButton.classList.add('hidden');
        DOM.cancelButton.disabled = true;
    }
    
    if (onSimulationCompleteCallback && battleResultForPostAnimation) {
        onSimulationCompleteCallback(battleResultForPostAnimation, false); // false indicates animation completed
    }
    // UI module will handle showing final results in the standard section.
}

/**
 * Handles the click event for the "Cancel Simulation" button.
 */
function handleCancelSimulation() {
    if (!isSimulationRunning) return;

    console.log("Simulation cancelled by user.");
    isSimulationRunning = false;
    stopCurrentAnimation();
    disableCameraControls();

    if (DOM.simulationContainer) DOM.simulationContainer.classList.add('hidden');
    if (DOM.cancelButton) {
        DOM.cancelButton.classList.add('hidden');
        DOM.cancelButton.disabled = true;
    }

    if (onSimulationCompleteCallback && battleResultForPostAnimation) {
        // Call completion callback, indicating it was cancelled (or potentially show pre-battle UI directly)
        // For now, we'll let the UI module handle full reset logic via the callback.
        onSimulationCompleteCallback(battleResultForPostAnimation, true); // true indicates cancellation/instant display
    }
    // The UI module should then handle resetting the UI to pre-battle or showing instant results.
}

/**
 * Resets the simulation manager state for a new battle.
 */
export function resetSimulationManager() {
    stopCurrentAnimation(); // Stop any active animations
    isSimulationRunning = false;
    animationQueue = [];
    battleResultForPostAnimation = null;
    onSimulationCompleteCallback = null;

    if (DOM.simulationContainer) {
        DOM.simulationContainer.innerHTML = '';
        DOM.simulationContainer.classList.add('hidden');
    }
    if (DOM.cancelButton) {
        DOM.cancelButton.classList.add('hidden');
        DOM.cancelButton.disabled = true;
    }
    disableCameraControls();
    console.log("Simulation Manager reset.");
}