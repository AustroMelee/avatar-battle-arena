/**
 * @fileoverview Analyzes the status of an individual fighter.
 */

"use strict";

/**
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 * @typedef {import('../../types/battle.js').BattleResult} BattleResult
 * @typedef {import('../../types/analysis.js').FighterAnalysis} FighterAnalysis
 * @typedef {import('../../types/analysis.js').FighterStats} FighterStats
 * @typedef {import('../../types/analysis.js').PerformanceMetrics} PerformanceMetrics
 */

const STATUS_DESCRIPTIONS = {
    winner: "Victorious",
    loser: "Defeated",
    draw: "Draw",
};

/**
 * Analyzes the status of a single fighter.
 * @param {Fighter} fighter
 * @param {string | null} winnerId
 * @param {boolean} isDraw
 * @param {BattleResult} battleResult
 * @returns {FighterAnalysis}
 */
export function analyzeFighterStatus(fighter, winnerId, isDraw, battleResult) {
    const status = isDraw ? "draw" : (fighter.id === winnerId ? "winner" : "loser");
    const wasVictorious = status === "winner";

    /** @type {FighterStats} */
    const finalStats = {
        hp: fighter.hp,
        energy: fighter.energy,
        incapacitationScore: fighter.incapacitationScore,
        momentum: fighter.momentum,
        escalationState: fighter.escalationState,
    };

    /** @type {PerformanceMetrics} */
    const performance = {
        damageDealt: fighter.damageDealt,
        damageReceived: fighter.damageReceived,
        movesExecuted: fighter.moveHistory?.length || 0,
        accuracy: calculateOverallAccuracy(fighter),
        effectiveness: calculateOverallEffectiveness(fighter),
    };

    return {
        id: fighter.id,
        name: fighter.name,
        status,
        finalStats,
        performance,
        condition: STATUS_DESCRIPTIONS[status] || "Unknown",
        wasVictorious,
    };
}

function calculateOverallAccuracy(fighter) {
    if (!fighter.moveHistory || fighter.moveHistory.length === 0) return 100;
    const hits = fighter.moveHistory.filter(m => m.hit).length;
    return (hits / fighter.moveHistory.length) * 100;
}

function calculateOverallEffectiveness(fighter) {
    if (!fighter.moveHistory || fighter.moveHistory.length === 0) return 50;
    const effectivenessValues = { Weak: 0, Normal: 50, Strong: 100, Critical: 150 };
    const totalEffectiveness = fighter.moveHistory.reduce((sum, move) => {
        return sum + (effectivenessValues[move.effectiveness] || 50);
    }, 0);
    return totalEffectiveness / fighter.moveHistory.length;
} 