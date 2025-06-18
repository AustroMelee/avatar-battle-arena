/**
 * @fileoverview State management for the battle loop.
 */

"use strict";

/**
 * @typedef {import('../types.js').BattleLoopState} BattleLoopState
 * @typedef {import('../types.js').Fighter} Fighter
 * @typedef {import('../types.js').BattleState} BattleState
 */

/**
 * Initializes the battle loop state.
 * @param {Fighter} fighter1
 * @param {Fighter} fighter2
 * @returns {BattleLoopState}
 */
export function initializeLoopState(fighter1, fighter2) {
    return {
        turn: 0,
        battleOver: false,
        winnerId: null,
        loserId: null,
        isStalemate: false,
        battleEventLog: [],
        metadata: {
            fighter1Id: fighter1.id,
            fighter2Id: fighter2.id,
        },
        executionStartTime: performance.now(),
        status: "initializing",
    };
}

/**
 * Updates the loop state after a turn.
 * @param {BattleLoopState} currentState
 * @param {import('../types.js').TurnExecutionResult} turnResult
 * @returns {BattleLoopState}
 */
export function updateLoopState(currentState, turnResult) {
    currentState.turn = turnResult.turnNumber;
    currentState.battleEventLog.push(...turnResult.newEvents);
    // Future logic for updating winnerId, battleOver, etc.
    return currentState;
} 