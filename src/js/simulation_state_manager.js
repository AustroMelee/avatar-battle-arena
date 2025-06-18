/**
 * @fileoverview Simulation State Manager
 * @description State management for simulation execution and mode handling
 * @version 1.0
 */

"use strict";

let currentSimulationMode = null; // Default to null, will be set by main.js
let isSimulationRunning = false;
let animationQueue = [];
let battleResultForPostAnimation = null;
let onSimulationCompleteCallback = null;

/**
 * Sets the simulation mode
 * @param {string} mode - Either "animated" or "instant"
 */
export function setSimulationMode(mode) {
    if (mode === "animated" || mode === "instant") {
        currentSimulationMode = mode;
        console.log(`Simulation mode set to: ${currentSimulationMode}`);
    } else {
        console.warn(`Sim Manager (setSimulationMode): Invalid mode "${mode}". Defaulting to "instant".`);
        currentSimulationMode = "instant";
    }
}

/**
 * Gets the current simulation mode
 * @returns {string|null} Current simulation mode
 */
export function getSimulationMode() {
    return currentSimulationMode;
}

/**
 * Checks if simulation is currently running
 * @returns {boolean} True if simulation is running
 */
export function isRunning() {
    return isSimulationRunning;
}

/**
 * Sets the simulation running state
 * @param {boolean} running - Whether simulation is running
 */
export function setRunning(running) {
    isSimulationRunning = running;
}

/**
 * Gets the current animation queue
 * @returns {Array} Animation queue
 */
export function getAnimationQueue() {
    return animationQueue;
}

/**
 * Sets the animation queue
 * @param {Array} queue - New animation queue
 */
export function setAnimationQueue(queue) {
    animationQueue = Array.isArray(queue) ? queue : [];
}

/**
 * Gets the battle result for post-animation
 * @returns {Object|null} Battle result
 */
export function getBattleResult() {
    return battleResultForPostAnimation;
}

/**
 * Sets the battle result for post-animation
 * @param {Object} result - Battle result
 */
export function setBattleResult(result) {
    battleResultForPostAnimation = result;
}

/**
 * Gets the completion callback
 * @returns {Function|null} Completion callback
 */
export function getCompletionCallback() {
    return onSimulationCompleteCallback;
}

/**
 * Sets the completion callback
 * @param {Function} callback - Completion callback
 */
export function setCompletionCallback(callback) {
    onSimulationCompleteCallback = typeof callback === "function" ? callback : null;
}

/**
 * Resets all simulation state
 */
export function resetState() {
    isSimulationRunning = false;
    animationQueue = [];
    battleResultForPostAnimation = null;
    onSimulationCompleteCallback = null;
} 