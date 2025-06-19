"use strict";

/**
 * @fileoverview Type Definitions for the Battle Loop
 * @description Defines the data structures for the battle loop manager.
 */

/**
 * @typedef {Object} BattleLoopConfig
 * @property {number} maxTurns
 * @property {boolean} enableDebugLogging
 * @property {boolean} enableNarrative
 * @property {number} stalemateThreshold
 * @property {boolean} enableCurbstompRules
 */

/**
 * @typedef {Object} LoopMetrics
 * @property {number} executionTime
 * @property {number} totalTurns
 * @property {number} totalEvents
 * @property {number} averageTurnTime
 * @property {Object<string, number>} eventTypeCount
 * @property {number} errorsEncountered
 * @property {number} [stalemateCounter]
 */

/**
 * @typedef {Object} BattleLoopState
 * @property {boolean} isRunning
 * @property {string} status
 * @property {number} turn
 * @property {string | null} winner
 * @property {string | null} loser
 * @property {string | null} winnerId
 * @property {string | null} loserId
 * @property {boolean} isDraw
 * @property {boolean} isStalemate
 * @property {boolean} battleOver
 * @property {any[]} battleEventLog
 * @property {LoopMetrics} metrics
 * @property {Object} metadata
 * @property {number} executionStartTime
 * @property {number} [executionEndTime]
 * @property {any[]} errorLog
 */

export {}; 