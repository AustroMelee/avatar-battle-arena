/**
 * @fileoverview Quantifies the immediate survival risk for the AI.
 * @description Analyzes the battle state to determine if the AI is in immediate danger,
 * which can be used to trigger defensive pivots, healing, or stalling decisions.
 */

"use strict";

/**
 * @typedef {import('../../types/battle.js').BattleState} BattleState
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 */

/**
 * @typedef {'HIGH' | 'MEDIUM' | 'LOW'} ThreatLevel
 */

const THREAT_THRESHOLDS = {
    HIGH: 30, // HP below this is high threat
    MEDIUM: 60, // HP below this is medium threat
    LOW: 100, // HP below this is low threat
};

const HIGH_DAMAGE_THRESHOLD = 40; // Opponent moves stronger than this are a major threat

/**
 * Analyzes the current threat level for the AI.
 * @param {BattleState} battleState - The current battle state.
 * @param {Fighter} aiCharacter - The AI character.
 * @returns {ThreatLevel} The calculated threat level.
 */
export function analyzeThreatLevel(battleState, aiCharacter) {
    if (!battleState || !aiCharacter) {
        return "LOW";
    }

    const { fighters } = /** @type {BattleState} */ (battleState);
    const opponent = Object.values(fighters).find(/** @param {Fighter} f */ f => f.id !== aiCharacter.id);

    if (!opponent) {
        return "LOW";
    }

    const aiHealthPercent = (aiCharacter.hp / aiCharacter.maxHp) * 100;
    
    // Factor in opponent's damage potential
    const opponentMaxDamage = opponent.moves.reduce(/** @param {number} max, @param {import('../../types/battle.js').Move} move */(max, move) => {
        return Math.max(max, move.power || 0);
    }, 0);

    let threatScore = 100 - aiHealthPercent;

    if (opponentMaxDamage >= HIGH_DAMAGE_THRESHOLD) {
        threatScore += 20; // Add threat if opponent has a high-damage move
    }

    if (aiHealthPercent <= THREAT_THRESHOLDS.HIGH || (aiHealthPercent <= 50 && opponentMaxDamage >= HIGH_DAMAGE_THRESHOLD)) {
        return "HIGH";
    }

    if (aiHealthPercent <= THREAT_THRESHOLDS.MEDIUM) {
        return "MEDIUM";
    }

    return "LOW";
} 