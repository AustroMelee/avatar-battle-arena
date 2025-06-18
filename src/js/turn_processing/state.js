/**
 * @fileoverview State management for the turn processor.
 */

"use strict";

import { assertBattleStateInvariants } from "../utils_state_invariants.js";

/**
 * @typedef {import('../types/battle.js').BattleState} BattleState
 */

/**
 * Creates a deep copy of the battle state for safe mutation during a turn.
 * @param {BattleState} originalState
 * @param {number} turnNumber
 * @returns {BattleState}
 */
export function createWorkingBattleState(originalState, turnNumber) {
    assertBattleStateInvariants(originalState, `turn_${turnNumber}_start`);

    // A proper deep clone is needed for a real implementation.
    const workingState = JSON.parse(JSON.stringify(originalState));
    
    if (!workingState.events) {
        workingState.events = [];
    }
    
    return workingState;
}

/**
 * Validates the final state of the turn.
 * @param {BattleState} finalState
 * @param {number} turnNumber
 */
export function validateTurnEndState(finalState, turnNumber) {
    assertBattleStateInvariants(finalState, `turn_${turnNumber}_end`);
} 