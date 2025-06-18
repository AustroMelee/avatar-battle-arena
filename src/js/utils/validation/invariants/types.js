/**
 * @fileoverview Shared types and constants for state invariant validation.
 * @description Centralizes the data structures and constants used across the state invariant system.
 */

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('../../../types/battle.js').Fighter} Fighter
 * @typedef {import('../../../types/battle.js').BattleState} BattleState
 * @typedef {import('../../../types/battle.js').EnvironmentState} EnvironmentState
 */

// ============================================================================
// INVARIANT-SPECIFIC TYPES
// ============================================================================

/**
 * @typedef {Object} InvariantViolation
 * @description Describes a violated state invariant.
 * @property {string} invariantName - Name of the violated invariant.
 * @property {string} message - Description of the violation.
 * @property {any} actualValue - The actual value that violated the invariant.
 * @property {any} expectedValue - The expected value or range.
 * @property {string} severity - The severity level ('critical', 'error', 'warning').
 * @property {number} timestamp - When the violation was detected.
 * @property {string} [context] - Additional context about the violation.
 */

/**
 * @typedef {Object} InvariantConfig
 * @description Configuration for invariant checking behavior.
 * @property {boolean} throwOnCritical - Whether to throw on critical violations.
 * @property {boolean} throwOnError - Whether to throw on error violations.
 * @property {boolean} throwOnWarning - Whether to throw on warning violations.
 * @property {boolean} enableHealthChecks - Enable fighter health validation.
 * @property {boolean} enableEnergyChecks - Enable fighter energy validation.
 * @property {boolean} enableStateChecks - Enable general state validation.
 * @property {boolean} enablePhaseChecks - Enable battle phase validation.
 * @property {boolean} enableEnvironmentalChecks - Enable environment validation.
 * @property {boolean} enableAiChecks - Enable AI state validation.
 * @property {boolean} skipInvariantsInProduction - Skip checks in production.
 * @property {number} maxViolationsPerCheck - Maximum violations to report per check.
 */

/**
 * @typedef {Object} ValidationResult
 * @description The result of a validation check.
 * @property {boolean} isValid - Whether the validation passed.
 * @property {InvariantViolation[]} violations - A list of violations found.
 * @property {number} checkDuration - The time taken for the validation in ms.
 * @property {string} context - The context where the validation was performed.
 * @property {number} checkCount - The sequential check number.
 */

/**
 * @typedef {Object} InvariantStatistics
 * @description Statistics about invariant checking.
 * @property {number} totalChecks - The total number of checks performed.
 * @property {number} totalViolations - The total number of violations detected.
 * @property {number} criticalViolations - The number of critical violations detected.
 * @property {number} errorViolations - The number of error violations detected.
 * @property {number} warningViolations - The number of warning violations detected.
 * @property {number} averageCheckDuration - The average check duration in ms.
 * @property {Object<string, number>} violationsByType - Violations grouped by type.
 */


// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {InvariantConfig} */
export const INVARIANT_CONFIG = {
    // Error handling behavior
    throwOnCritical: true,
    throwOnError: false,
    throwOnWarning: false,
    
    // Enable/disable specific invariant categories
    enableHealthChecks: true,
    enableEnergyChecks: true,
    enableStateChecks: true,
    enablePhaseChecks: true,
    enableEnvironmentalChecks: true,
    enableAiChecks: true,
    
    // Performance settings
    skipInvariantsInProduction: false,
    maxViolationsPerCheck: 10
};

/** @type {string[]} */
export const VALID_SEVERITIES = ["critical", "error", "warning"];

/** @type {string[]} */
export const REQUIRED_FIGHTER_PROPERTIES = ["id", "name", "hp", "maxHp", "energy", "maxEnergy"];

/** @type {string[]} */
export const REQUIRED_BATTLE_STATE_PROPERTIES = ["fighter1", "fighter2", "turn", "events"];

/** @type {number} */
export const MIN_HP = 0;

/** @type {number} */
export const MAX_HP = 100;

/** @type {number} */
export const MIN_ENERGY = 0;

/** @type {number} */
export const MAX_ENERGY = 100;

/** @type {number} */
export const MIN_TURN = 0;

/** @type {number} */
export const MAX_TURN = 1000; 