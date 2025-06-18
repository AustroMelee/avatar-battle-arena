"use strict";

/**
 * @fileoverview Analysis & Result Type Definitions
 * @description Defines the data structures for post-battle analysis, statistics, and performance metrics.
 */

/**
 * @typedef {import('./battle.js').Fighter} Fighter
 */

// ============================================================================
// ANALYSIS AND RESULT TYPES
// ============================================================================

/**
 * @typedef {Object} BattleResult
 * @description Complete battle result
 * @property {string | null} winnerId - Winner fighter ID
 * @property {string | null} loserId - Loser fighter ID
 * @property {boolean} isDraw - Whether battle was a draw
 * @property {number} turnCount - Total turns in the battle
 */

/**
 * @typedef {Object} BattleFinalState
 * @description Final state of all fighters
 * @property {Fighter} fighter1 - Final state of fighter 1
 * @property {Fighter} fighter2 - Final state of fighter 2
 */

/**
 * @typedef {Object} BattleStatistics
 * @description Battle performance statistics
 * @property {number} totalTurns - Total turns in battle
 * @property {number} totalDamage - Total damage dealt
 * @property {number} battleDuration - Battle duration in ms
 */

/**
 * @typedef {Object} BattleAnalysis
 * @description Post-battle analysis
 * @property {string} victoryMethod - How victory was achieved
 * @property {string[]} keyMoments - Key moments in battle
 * @property {FighterAnalysis} fighter1Analysis - Fighter 1 analysis
 * @property {FighterAnalysis} fighter2Analysis - Fighter 2 analysis
 */

/**
 * @typedef {Object} FighterAnalysis
 * @description Individual fighter performance analysis
 * @property {number} damageEfficiency - Damage per energy ratio
 * @property {number} survivability - How well fighter survived
 * @property {number} adaptability - How well fighter adapted
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @description System performance metrics
 * @property {number} averageTurnTime - Average time per turn in ms
 * @property {number} memoryUsage - Peak memory usage in bytes
 */

export {}; 