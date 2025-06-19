"use strict";

/**
 * @fileoverview Type Definitions for UI Analysis
 * @description Defines the data structures for the UI analysis modules.
 */

/**
 * @typedef {Object} EnvironmentAnalysis
 * @property {string} locationId
 * @property {string} locationName
 * @property {string[]} significantEffects
 * @property {number} environmentalImpact
 * @property {string} summary
 */

/**
 * @typedef {Object} FighterStats
 * @property {number} damageDealt
 * @property {number} damageTaken
 * @property {number} healingDone
 * @property {number} energyUsed
 * @property {number} successfulHits
 * @property {number} totalAttacks
 */

/**
 * @typedef {Object} BattleSummary
 * @property {string} winnerName
 * @property {string} loserName
 * @property {number} totalTurns
 * @property {string} victoryCondition
 */

/**
 * @typedef {Object} WinnerAnalysis
 * @property {string} keyFactor
 * @property {string[]} turningPoints
 */

/**
 * @typedef {Object} BattleAnalysisResult
 * @property {BattleSummary} summary
 * @property {FighterStats} fighter1Stats
 * @property {FighterStats} fighter2Stats
 * @property {EnvironmentAnalysis} environment
 * @property {WinnerAnalysis} winnerAnalysis
 */

export {}; 