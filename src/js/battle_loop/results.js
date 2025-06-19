/**
 * @fileoverview Generates the final battle result.
 */

"use strict";

/**
 * @typedef {import('../types/battle.js').BattleResult} BattleResult
 * @typedef {import('../types/battle.js').BattleState} BattleState
 * @typedef {import('../types/battle_loop.js').BattleLoopState} BattleLoopState
 */

/**
 * Generates the final battle result object.
 * @param {BattleState} finalBattleState
 * @param {BattleLoopState} loopState
 * @returns {BattleResult}
 */
export function generateBattleResult(finalBattleState, loopState) {
    return {
        winnerId: loopState.winnerId,
        loserId: loopState.loserId,
        isDraw: loopState.isStalemate,
        turnCount: loopState.turn,
        finalState: finalBattleState,
        log: loopState.battleEventLog,
        locationId: finalBattleState.environment.locationId,
        timestamp: new Date().toISOString(),
        metadata: {
            ...loopState.metadata,
            engineVersion: "2.0.0", // This should be dynamic
        },
    };
} 