/**
 * @fileoverview Manages state change listeners for the application.
 */

"use strict";

/**
 * @typedef {import('../types/composite.js').GameState} GameState
 */

/** @type {Function[]} */
const stateChangeListeners = [];

/**
 * Notifies all registered listeners of a state change.
 * @param {GameState} oldState - The state before the change.
 * @param {GameState} newState - The state after the change.
 */
export function notifyStateChangeListeners(oldState, newState) {
    console.debug(`[State Manager] Notifying ${stateChangeListeners.length} listeners of state change`);
    for (const listener of stateChangeListeners) {
        try {
            listener(oldState, newState);
        } catch (error) {
            console.error("[State Manager] Error in state change listener:", error);
        }
    }
}

/**
 * Adds a listener function to be called on state changes.
 * @param {Function} listener - The listener function.
 */
export function addStateChangeListener(listener) {
    if (typeof listener !== "function") {
        throw new TypeError("addStateChangeListener: listener must be a function");
    }
    stateChangeListeners.push(listener);
    console.debug(`[State Manager] Added state change listener. Total listeners: ${stateChangeListeners.length}`);
} 