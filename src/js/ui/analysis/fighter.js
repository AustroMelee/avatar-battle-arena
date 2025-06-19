/**
 * @fileoverview Analyzes the performance of a single fighter in a battle.
 */

"use strict";

/**
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 * @typedef {import('../../types/ui_analysis.js').FighterStats} FighterStats
 */

/**
 * Analyzes a fighter's performance.
 * @param {Fighter} fighter
 * @returns {FighterStats}
 */
export function analyzeFighterPerformance(fighter) {
    return {
        damageDealt: fighter.stats.totalDamageDealt || 0,
        damageTaken: fighter.stats.totalDamageTaken || 0,
        healingDone: fighter.stats.totalHealingDone || 0,
        energyUsed: fighter.stats.totalEnergyUsed || 0,
        successfulHits: fighter.stats.successfulHits || 0,
        totalAttacks: fighter.stats.totalAttacks || 0,
    };
} 