/**
 * @fileoverview Simulation Mode Manager (Compatibility Layer)
 * @description Compatibility layer that re-exports focused simulation modules
 * 
 * This module maintains backward compatibility while delegating to focused modules:
 * - DOM element management (simulation_dom_manager.js)
 * - State management (simulation_state_manager.js)
 * 
 * @version 2.0.0 - Refactored to modular architecture
 */

'use strict';

// Import from focused modules
import { 
    initializeSimulationManagerDOM as initDOM,
    getDOMReferences,
    setupEventListeners,
    showSimulationContainer,
    hideSimulationContainer,
    showCancelButton,
    hideCancelButton,
    clearAnimatedOutput,
    getAnimatedLogOutput
} from './simulation_dom_manager.js';

import {
    setSimulationMode as setMode,
    getSimulationMode as getMode,
    isRunning,
    setRunning,
    getAnimationQueue,
    setAnimationQueue,
    getBattleResult,
    setBattleResult,
    getCompletionCallback,
    setCompletionCallback,
    resetState
} from './simulation_state_manager.js';

// Import other dependencies
import { startAnimationSequence, stopCurrentAnimation } from './animated_text_engine.js';
import { resetCamera, enableCameraControls, disableCameraControls } from './camera_control.js';

// Re-export functions for backward compatibility
export { setSimulationMode, getSimulationMode } from './simulation_state_manager.js';

export function initializeSimulationManagerDOM(domRefs) {
    initDOM(domRefs);
    setupEventListeners(handleCancelSimulation);
}

// Legacy compatibility - these are also re-exported above

export function startSimulation(eventQueue, battleResult, onCompleteCallback) {
    const DOM = getDOMReferences();
    
    // If mode is instant, immediately call callback without animation
    if (getMode() === "instant") {
        console.log("Sim Manager (startSimulation): Running in instant mode. Skipping animation.");
        if (typeof onCompleteCallback === 'function') {
            onCompleteCallback(battleResult, false); // false indicates success (no animation needed)
        }
        return;
    }

    // Check for essential DOM elements before proceeding with animated mode
    if (!DOM.simulationContainer || !DOM.animatedLogOutput) {
        console.error("Sim Manager (startSimulation): Critical DOM elements not initialized for animated mode. Cannot start animated simulation.");
        if (typeof onCompleteCallback === 'function') {
            onCompleteCallback(battleResult, true); // true indicates fallback to instant/error
        }
        return;
    }
    
    if (!Array.isArray(eventQueue)) {
        console.error("Sim Manager (startSimulation): eventQueue is not an array. Defaulting to empty queue.");
        eventQueue = [];
    }

    // Set state using the new modules
    setAnimationQueue(eventQueue);
    setBattleResult(battleResult);
    setCompletionCallback(onCompleteCallback);
    setRunning(true);

    // Update DOM using the new modules
    clearAnimatedOutput();
    showSimulationContainer();
    showCancelButton();

    // Set up camera controls
    resetCamera(getAnimatedLogOutput());
    enableCameraControls(getAnimatedLogOutput());

    console.log('Starting animation sequence with queue:', getAnimationQueue());
    startAnimationSequence(getAnimationQueue(), getAnimatedLogOutput(), simulationStepCompleted);
}

function simulationStepCompleted(isEndOfQueue) {
    if (!isRunning()) return; // Aborted by cancel

    if (isEndOfQueue) {
        finishSimulation();
    }
    // animated_text_engine handles stepping through the queue
}

function finishSimulation() {
    if (!isRunning()) return;

    console.log("Simulation animation finished.");
    setRunning(false);
    stopCurrentAnimation(); // Ensure any lingering animation stops
    disableCameraControls(); // disableCameraControls should handle null buttons

    hideCancelButton();

    const callback = getCompletionCallback();
    const result = getBattleResult();
    if (callback && result) {
        callback(result, false); // false indicates animation completed successfully
    }
}

function handleCancelSimulation() {
    if (!isRunning()) return;

    console.log("Simulation cancelled by user.");
    setRunning(false);
    stopCurrentAnimation();
    disableCameraControls();

    hideSimulationContainer();
    hideCancelButton();

    const callback = getCompletionCallback();
    const result = getBattleResult();
    if (callback && result) {
        callback(result, true); // true indicates cancellation
    }
}

export function resetSimulationManager() {
    stopCurrentAnimation();
    resetState();
    
    clearAnimatedOutput();
    hideSimulationContainer();
    hideCancelButton();
    disableCameraControls(); // Ensure controls are disabled upon full reset
    
    console.log("Simulation Manager reset.");
}