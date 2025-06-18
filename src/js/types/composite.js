"use strict";

/**
 * @fileoverview Composite & Function Signature Type Definitions
 * @description Defines complex types that compose other types and function signatures.
 */

/**
 * @typedef {import('./battle.js').Fighter} Fighter
 * @typedef {import('./battle.js').BattleState} BattleState
 * @typedef {import('./battle.js').BattleEvent} BattleEvent
 * @typedef {import('./engine.js').PhaseState} PhaseState
 * @typedef {import('./engine.js').MoveResult} MoveResult
 * @typedef {import('./ai.js').AiDecision} AiDecision
 * @typedef {import('./ui.js').UIState} UIState
 * @typedef {import('./utility.js').ConfigOptions} ConfigOptions
 * @typedef {import('./utility.js').ValidationResult} ValidationResult
 */

// ============================================================================
// COMPOSITE & FUNCTION TYPES
// ============================================================================

/**
 * @typedef {Object} GameState
 * @description The root object for all application state.
 * @property {UIState} ui - The complete UI state.
 * @property {BattleState | null} battle - The current battle state, or null if no battle is active.
 * @property {ConfigOptions} config - The global game configuration.
 * @property {Object<string, any>} cache - A general-purpose cache for application data.
 */

/**
 * @typedef {function(Fighter, Fighter, BattleState, PhaseState): MoveResult} MoveProcessor
 * @description Function signature for move processing
 */

/**
 * @typedef {function(BattleEvent): void} EventHandler
 * @description Function signature for event handling
 */

/**
 * @typedef {function(Fighter, Fighter, BattleState): AiDecision} AiDecisionFunction
 * @description Function signature for AI decision making
 */

/**
 * @typedef {function(any[], Object): ValidationResult} ValidatorFunction
 * @description Function signature for validation functions
 */

export {}; 