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
    battleStoryDisplay: null,
    animatedLogOutput: null, // Added this, important for animated mode's text output
    zoomInBtn: null,         // Added for camera control
    zoomOutBtn: null         // Added for camera control
};

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
    DOM.animatedLogOutput = domRefs.animatedLogOutput; // Ensure this is initialized
    DOM.zoomInBtn = domRefs.zoomInBtn;
    DOM.zoomOutBtn = domRefs.zoomOutBtn;


    if (DOM.cancelButton) {
        DOM.cancelButton.addEventListener('click', handleCancelSimulation);
    } else {
        console.warn("Sim Manager (initializeDOM): Cancel button not found in DOM_simulation_references.");
    }

    // Initialize camera controls if buttons are present
    if (DOM.simulationContainer && DOM.zoomInBtn && DOM.zoomOutBtn) {
        // Assuming initializeCameraControls handles its own event listeners.
        // It's also important that animated_text_engine's focusOnLatestMessage has the correct container reference.
        // This is primarily passed in startAnimationSequence.
        // This is a re-initialization on every start, but it ensures references are fresh.
        // The main camera_control.js only needs to be initialized ONCE.
        // Instead of calling initializeCameraControls here (which adds listeners multiple times),
        // we'll rely on its initial setup in main.js/ui.js, and only enable/disable here.
    } else {
        console.warn("Sim Manager (initializeDOM): Camera control buttons or simulation container missing. Camera controls may not function.");
    }
}

export function setSimulationMode(mode) {
    if (mode === "animated" || mode === "instant") {
        currentSimulationMode = mode;
        console.log(`Simulation mode set to: ${currentSimulationMode}`);
    } else {
        console.warn(`Sim Manager (setSimulationMode): Invalid mode "${mode}". Defaulting to "instant".`);
        currentSimulationMode = "instant";
    }
}

export function getSimulationMode() {
    return currentSimulationMode;
}

export function startSimulation(eventQueue, battleResult, onCompleteCallback) {
    // Check for essential DOM elements before proceeding
    if (!DOM.simulationContainer || !DOM.animatedLogOutput) {
        console.error("Sim Manager (startSimulation): Critical DOM elements (simulationContainer or animatedLogOutput) not initialized. Cannot start animated simulation.");
        if (typeof onCompleteCallback === 'function') {
            onCompleteCallback(battleResult, true); // true indicates fallback to instant/error
        }
        return;
    }
    if (!Array.isArray(eventQueue)) {
        console.error("Sim Manager (startSimulation): eventQueue is not an array. Defaulting to empty queue.");
        eventQueue = [];
    }


    animationQueue = eventQueue;
    battleResultForPostAnimation = battleResult; // Store for completion
    onSimulationCompleteCallback = typeof onCompleteCallback === 'function' ? onCompleteCallback : null;
    isSimulationRunning = true;

    DOM.animatedLogOutput.innerHTML = ''; // Clear previous content in the actual log display area
    DOM.simulationContainer.classList.remove('hidden'); // Show the wrapper container

    if (DOM.cancelButton) { // Only interact if button exists
        DOM.cancelButton.classList.remove('hidden');
        DOM.cancelButton.disabled = false;
    }

    // Pass the animatedLogOutput element to camera control for scrolling, not the wrapper container
    resetCamera(DOM.animatedLogOutput);
    enableCameraControls(DOM.animatedLogOutput);

    console.log('Starting animation sequence with queue:', animationQueue);
    startAnimationSequence(animationQueue, DOM.animatedLogOutput, simulationStepCompleted); // Pass the correct element for text rendering
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

    console.log("Simulation animation finished.");
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
        onSimulationCompleteCallback(battleResultForPostAnimation, true); // true indicates cancellation
    }
}

export function resetSimulationManager() {
    stopCurrentAnimation();
    isSimulationRunning = false;
    animationQueue = [];
    battleResultForPostAnimation = null;
    onSimulationCompleteCallback = null;

    if (DOM.animatedLogOutput) { // Clear the content display area
        DOM.animatedLogOutput.innerHTML = '';
    }
    if (DOM.simulationContainer) { // Hide the main wrapper
        DOM.simulationContainer.classList.add('hidden');
    }
    if (DOM.cancelButton) {
        DOM.cancelButton.classList.add('hidden');
        DOM.cancelButton.disabled = true;
    }
    disableCameraControls(); // Ensure controls are disabled upon full reset
    console.log("Simulation Manager reset.");
}