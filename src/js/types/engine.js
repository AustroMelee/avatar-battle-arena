"use strict";

/**
 * @fileoverview Engine & Mechanics Type Definitions
 * @description Defines the data structures for the battle engine's mechanics, including phases, move results, and contexts.
 */

/**
 * @typedef {import('./battle.js').Fighter} Fighter
 * @typedef {import('./battle.js').BattleState} BattleState
 * @typedef {import('./battle.js').EnvironmentState} EnvironmentState
 */

// ============================================================================
// ENGINE & MECHANICS TYPES
// ============================================================================

/**
 * @typedef {Object} PhaseState
 * @description Battle phase management state
 * @property {string} currentPhase - Current phase identifier
 * @property {number} phaseStartTurn - Turn when phase started
 */

/**
 * @typedef {Object} PhaseTransition
 * @description Record of a phase transition
 * @property {string} fromPhase - Previous phase
 * @property {string} toPhase - New phase
 * @property {number} turn - Turn of transition
 * @property {string} reason - Reason for transition
 */

/**
 * @typedef {Object} MoveResult
 * @description Result of executing a move
 * @property {boolean} hit - Whether move connected
 * @property {boolean} critical - Whether move was critical hit
 * @property {number} damage - Actual damage dealt
 */

/**
 * @typedef {Object} ActionContext
 * @description Context for action execution
 * @property {Fighter} actor - Fighter performing action
 * @property {Fighter} target - Target of the action
 * @property {BattleState} battleState - Current battle state
 * @property {TurnOptions} options - Turn processing options
 */

/**
 * @typedef {Object} TurnOptions
 * @description Options for turn processing
 * @property {number} turnNumber - Current turn number (1+)
 * @property {boolean} enableNarrative - Whether to generate narrative events
 * @property {boolean} enableDebugLogging - Whether to enable debug logging
 */

/**
 * @typedef {Object} ResolutionContext
 * @description Context information for move resolution
 * @property {number} turnNumber - Current turn number (1+)
 * @property {string} phase - Current battle phase
 * @property {EnvironmentState} [environment] - Current environment state
 */

/**
 * @typedef {Object} DamageCalculation
 * @description Detailed damage calculation result
 * @property {number} baseDamage - The move's base damage.
 * @property {number} attackMultiplier - The attacker's damage multiplier.
 * @property {number} defenseMultiplier - The defender's damage reduction multiplier.
 * @property {number} moveTypeModifier - The modifier based on the move's type.
 * @property {number} elementalModifier - The elemental effectiveness modifier.
 * @property {number} variance - The random damage variance applied.
 * @property {number} finalDamage - The final damage dealt after all calculations.
 * @property {boolean} isCritical - If the hit was a critical strike.
 * @property {boolean} isGlancing - If the hit was a glancing blow.
 * @property {Object<string, number>} modifiers - A breakdown of numeric modifiers.
 */

/**
 * @typedef {Object} AccuracyCalculation
 * @description Detailed accuracy calculation
 * @property {number} finalAccuracy - Final calculated accuracy (0.05-0.95)
 * @property {boolean} hitSuccess - Whether the hit was successful
 */
 
/**
 * @typedef {Object} BattleEngineOptions
 * @description Configuration options for battle engine
 * @property {number} [maxTurns=50] - Maximum number of turns before draw
 * @property {boolean} [enableDebugLogging=false] - Enable debug logging
 */

/**
 * @typedef {Object} PhaseAIModifiers
 * @description AI behavior modifiers for different battle phases.
 * @property {number} aggressionMultiplier
 * @property {number} patienceMultiplier
 * @property {number} riskToleranceMultiplier
 * @property {number} defensiveBiasMultiplier
 * @property {number} creativityMultiplier
 * @property {number} opportunismMultiplier
 */

/**
 * @typedef {Object} BattlePhaseState
 * @description State information for a battle phase
 * @property {string} currentPhase - The current battle phase.
 * @property {number} turnInCurrentPhase - The number of turns elapsed in the current phase.
 * @property {number} pokingDuration - The calculated duration for the poking phase.
 * @property {string[]} phaseLog - A log of phase transitions and events.
 * @property {object[]} phaseSummaryLog - A summary log of phase outcomes.
 * @property {object} currentPhaseFighterStats - Fighter stats at the start of the current phase.
 */

/**
 * @typedef {'Pre-Banter' | 'Poking' | 'Early' | 'Mid' | 'Late'} BattlePhase
 * @description The different phases of a battle.
 */

export {}; 