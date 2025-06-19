/**
 * @fileoverview State management for the battle loop.
 */

"use strict";

import { initializeMetrics } from "./metrics.js";

/**
 * @typedef {import('../types/battle_loop.js').BattleLoopState} BattleLoopState
 * @typedef {import('../types/battle.js').Fighter} Fighter
 * @typedef {import('../types/battle.js').BattleState} BattleState
 * @typedef {import('../types/engine.js').TurnExecutionResult} TurnExecutionResult
 */

/**
 * Initializes the battle loop state.
 * @param {Fighter} fighter1
 * @param {Fighter} fighter2
 * @returns {BattleLoopState}
 */
export function initializeLoopState(fighter1, fighter2) {
    return {
        isRunning: true,
        status: "initializing",
        turn: 0,
        winner: null,
        loser: null,
        winnerId: null,
        loserId: null,
        isDraw: false,
        isStalemate: false,
        battleOver: false,
        battleEventLog: [],
        metrics: initializeMetrics(),
        metadata: {
            fighter1Id: fighter1.id,
            fighter2Id: fighter2.id,
        },
        executionStartTime: performance.now(),
        executionEndTime: 0,
        errorLog: [],
    };
}

/**
 * Updates the loop state after a turn.
 * @param {BattleLoopState} currentState
 * @param {TurnExecutionResult} turnResult
 * @returns {BattleLoopState}
 */
export function updateLoopState(currentState, turnResult) {
    currentState.turn = turnResult.turnNumber;
    currentState.battleEventLog.push(...turnResult.newEvents);
    // Future logic for updating winnerId, battleOver, etc.
    return currentState;
} 