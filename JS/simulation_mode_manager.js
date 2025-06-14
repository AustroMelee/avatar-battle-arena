// FILE: js/simulation_mode_manager.js
'use strict';

// Version 1.1: Null-Safety Pass

import { startAnimationSequence, stopCurrentAnimation } from './animated_text_engine.js'; // animated_text_engine should be robust
import { resetCamera, enableCameraControls, disableCameraControls } from './camera_control.js'; // camera_control should be robust

let currentSimulationMode = "instant"; // Default
let isSimulationRunning = false;
let animationQueue = [];
let battleResultForPostAnimation = null;
let onSimulationCompleteCallback = null;

// DOM references are initialized by `initializeSimulationManagerDOM`
const DOM = {
    simulationContainer: null,
    cancelButton: null,
    battleResultsContainer: null,
    winnerNameDisplay: null,
    analysisListDisplay: null,
    battleStoryDisplay: null
};

export function initializeSimulationManagerDOM(domRefs) {
    if (!domRefs) {
        // console.error("Sim Manager (initializeDOM): domRefs object is null or undefined.");
        return;
    }
    DOM.simulationContainer = domRefs.simulationContainer; // May be null if ID not found
    DOM.cancelButton = domRefs.cancelButton;
    DOM.battleResultsContainer = domRefs.battleResultsContainer;
    DOM.winnerNameDisplay = domRefs.winnerNameDisplay;
    DOM.analysisListDisplay = domRefs.analysisListDisplay;
    DOM.battleStoryDisplay = domRefs.battleStoryDisplay;

    if (DOM.cancelButton) {
        DOM.cancelButton.addEventListener('click', handleCancelSimulation);
    } else {
        // console.warn("Sim Manager (initializeDOM): Cancel button not found in DOM_simulation_references.");
    }
}

export function setSimulationMode(mode) {
    if (mode === "animated" || mode === "instant") {
        currentSimulationMode = mode;
        // console.log(`Simulation mode set to: ${currentSimulationMode}`);
    } else {
        // console.warn(`Sim Manager (setSimulationMode): Invalid mode "${mode}". Defaulting to "instant".`);
        currentSimulationMode = "instant";
    }
}

export function getSimulationMode() {
    return currentSimulationMode;
}

export function startSimulation(eventQueue, battleResult, onCompleteCallback) {
    if (!DOM.simulationContainer) { // Check critical DOM element
        // console.error("Sim Manager (startSimulation): Simulation container DOM element not initialized. Cannot start animated simulation.");
        if (typeof onCompleteCallback === 'function') {
            onCompleteCallback(battleResult, true); // true indicates fallback to instant/error
        }
        return;
    }
    if (!Array.isArray(eventQueue)) {
        // console.error("Sim Manager (startSimulation): eventQueue is not an array. Defaulting to empty queue.");
        eventQueue = [];
    }


    animationQueue = eventQueue;
    battleResultForPostAnimation = battleResult; // Store for completion
    onSimulationCompleteCallback = typeof onCompleteCallback === 'function' ? onCompleteCallback : null;
    isSimulationRunning = true;

    DOM.simulationContainer.innerHTML = ''; // Clear previous content
    DOM.simulationContainer.classList.remove('hidden');

    if (DOM.cancelButton) { // Only interact if button exists
        DOM.cancelButton.classList.remove('hidden');
        DOM.cancelButton.disabled = false;
    }

    resetCamera(DOM.simulationContainer); // resetCamera should handle null container
    enableCameraControls(DOM.simulationContainer); // enableCameraControls should handle null

    // console.log('Starting animation sequence with queue:', animationQueue);
    startAnimationSequence(animationQueue, DOM.simulationContainer, simulationStepCompleted); // startAnimationSequence should be robust
}

function simulationStepCompleted(isEndOfQueue) {
    if (!isSimulationRunning) return; // Aborted by cancel

    if (isEndOfQueue) {
        finishSimulation();
    }
    // animated_text_engine handles stepping through the queue
}

function finishSimulation() {
    if (!isSimulationRunning) return;

    // console.log("Simulation animation finished.");
    isSimulationRunning = false;
    stopCurrentAnimation(); // Ensure any lingering animation stops
    disableCameraControls(); // disableCameraControls should handle null buttons

    if (DOM.cancelButton) {
        DOM.cancelButton.classList.add('hidden');
        DOM.cancelButton.disabled = true;
    }

    if (onSimulationCompleteCallback && battleResultForPostAnimation) {
        onSimulationCompleteCallback(battleResultForPostAnimation, false); // false indicates animation completed successfully
    }
}

function handleCancelSimulation() {
    if (!isSimulationRunning) return;

    // console.log("Simulation cancelled by user.");
    isSimulationRunning = false;
    stopCurrentAnimation();
    disableCameraControls();

    if (DOM.simulationContainer) DOM.simulationContainer.classList.add('hidden');
    if (DOM.cancelButton) {
        DOM.cancelButton.classList.add('hidden');
        DOM.cancelButton.disabled = true;
    }

    if (onSimulationCompleteCallback && battleResultForPostAnimation) {
        onSimulationCompleteCallback(battleResultForPostAnimation, true); // true indicates cancellation
    }
}

export function resetSimulationManager() {
    stopCurrentAnimation();
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
    // console.log("Simulation Manager reset.");
}