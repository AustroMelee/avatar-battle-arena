/**
 * @fileoverview Creates final battle results and calculates statistics.
 */

"use strict";

/**
 * @typedef {import('../../types/battle.js').BattleState} BattleState
 * @typedef {import('../../types/battle.js').BattleResult} BattleResult
 * @typedef {import('../../types/battle.js').BattleEvent} BattleEvent
 */

/**
 * Creates the final battle result object.
 * @param {BattleState} finalState
 * @param {string | null} winnerId
 * @param {number} turnCount
 * @param {BattleEvent[]} battleLog
 * @param {boolean} isDraw
 * @returns {BattleResult}
 */
export function createBattleResult(finalState, winnerId, turnCount, battleLog, isDraw) {
    if (!finalState) throw new TypeError("createBattleResult: finalState is required");

    const loserId = isDraw ? null : (winnerId === finalState.fighter1.id ? finalState.fighter2.id : finalState.fighter1.id);

    return {
        winnerId,
        loserId,
        isDraw,
        turnCount,
        finalState,
        log: battleLog,
        locationId: finalState.environment.locationId,
        timestamp: new Date().toISOString(),
        metadata: {
            engineVersion: "2.0.0",
            totalEvents: battleLog.length,
            finalScores: {
                fighter1: finalState.fighter1.incapacitationScore || 0,
                fighter2: finalState.fighter2.incapacitationScore || 0,
            },
        },
    };
}

/**
 * Calculates battle statistics from a result.
 * @param {BattleResult} battleResult
 * @returns {Object}
 */
export function calculateBattleStatistics(battleResult) {
    if (!battleResult || !Array.isArray(battleResult.log)) {
        throw new TypeError("calculateBattleStatistics: battleResult with a log is required");
    }

    const { log, turnCount } = battleResult;
    const eventTypeCount = {};
    let totalDamageDealt = 0;
    let totalMovesExecuted = 0;

    for (const event of log) {
        eventTypeCount[event.type] = (eventTypeCount[event.type] || 0) + 1;
        if (event.type === "MOVE_EXECUTED" && event.data?.damage) {
            totalDamageDealt += event.data.damage;
            totalMovesExecuted++;
        }
    }

    return {
        totalEvents: log.length,
        totalTurns: turnCount,
        totalDamage: totalDamageDealt,
        totalMoves: totalMovesExecuted,
        averageTurnLength: log.length / turnCount,
        averageDamagePerMove: totalMovesExecuted > 0 ? totalDamageDealt / totalMovesExecuted : 0,
        eventTypeDistribution: eventTypeCount,
    };
} 