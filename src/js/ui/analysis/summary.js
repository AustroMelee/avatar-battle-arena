/**
 * @fileoverview Generates a high-level summary of a battle.
 */

"use strict";

/**
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 * @typedef {import('../../types/battle.js').BattleResult} BattleResult
 * @typedef {import('../../types/analysis.js').BattleSummary} BattleSummary
 */

/**
 * Generates a high-level summary of the battle.
 * @param {Fighter} fighter1
 * @param {Fighter} fighter2
 * @param {string | null} winnerId
 * @param {boolean} isDraw
 * @param {BattleResult} battleResult
 * @returns {BattleSummary}
 */
export function generateBattleSummary(fighter1, fighter2, winnerId, isDraw, battleResult) {
    const totalTurns = battleResult.turnCount;
    const totalEvents = battleResult.log?.length || 0;
    const finalPhase = battleResult.finalState?.phaseState?.currentPhase || "Unknown";
    
    const endCondition = determineEndCondition(winnerId, isDraw, battleResult);
    const battleIntensity = calculateBattleIntensity(fighter1, fighter2, totalTurns);

    return {
        totalTurns,
        totalEvents,
        battlePhase: finalPhase,
        endCondition,
        battleIntensity,
        narrativeSummary: `The battle concluded in ${totalTurns} turns with a ${endCondition}.`,
    };
}

function determineEndCondition(winnerId, isDraw, battleResult) {
    if (battleResult.error) return "error";
    if (isDraw) return "stalemate";
    return winnerId ? "victory" : "defeat";
}

function calculateBattleIntensity(fighter1, fighter2, totalTurns) {
    if (totalTurns === 0) return 0;
    const totalDamage = (fighter1.damageDealt || 0) + (fighter2.damageDealt || 0);
    const intensity = (totalDamage / totalTurns) * 2;
    return Math.min(100, Math.round(intensity));
} 