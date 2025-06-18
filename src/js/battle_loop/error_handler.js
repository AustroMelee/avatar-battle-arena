/**
 * @fileoverview Error handling for the battle loop.
 */

"use strict";

/**
 * @typedef {import('../types.js').BattleLoopState} BattleLoopState
 */

/**
 * Handles an error that occurred during the battle loop.
 * @param {Error} error
 * @param {BattleLoopState} currentState
 * @returns {BattleLoopState}
 */
export function handleLoopError(error, currentState) {
    console.error("[BattleLoopManager] Error during battle execution:", error);
    
    if (currentState) {
        currentState.status = "error";
        currentState.metadata.error = {
            message: error.message,
            stack: error.stack,
        };
        currentState.executionEndTime = performance.now();
    }

    // Depending on the error, we might try to recover or just terminate.
    // For now, we'll just log and update state.

    return currentState;
} 