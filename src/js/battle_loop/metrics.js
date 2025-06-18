/**
 * @fileoverview Metrics collection for the battle loop.
 */

"use strict";

/**
 * @typedef {import('../types.js').LoopMetrics} LoopMetrics
 * @typedef {import('../types.js').BattleLoopState} BattleLoopState
 */

/**
 * Initializes the loop metrics.
 * @returns {LoopMetrics}
 */
export function initializeMetrics() {
    return {
        totalExecutionTime: 0,
        averageTurnTime: 0,
        totalTurns: 0,
        totalEvents: 0,
        errorsEncountered: 0,
        eventTypeCount: {},
    };
}

/**
 * Updates the final loop metrics after the battle is complete.
 * @param {LoopMetrics} currentMetrics
 * @param {BattleLoopState} finalState
 * @returns {LoopMetrics}
 */
export function updateFinalMetrics(currentMetrics, finalState) {
    const totalTime = finalState.executionEndTime - finalState.executionStartTime;
    const totalTurns = finalState.turn;

    currentMetrics.totalExecutionTime = totalTime;
    currentMetrics.totalTurns = totalTurns;
    currentMetrics.totalEvents = finalState.battleEventLog.length;
    currentMetrics.averageTurnTime = totalTurns > 0 ? totalTime / totalTurns : 0;
    
    for (const event of finalState.battleEventLog) {
        currentMetrics.eventTypeCount[event.type] = (currentMetrics.eventTypeCount[event.type] || 0) + 1;
    }

    return currentMetrics;
} 