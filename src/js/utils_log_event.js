/**
 * @fileoverview Avatar Battle Arena - Battle Event Logging Utilities
 * @description Enhanced battle event logging with comprehensive type safety and validation
 * @version 2.0.0
 */

"use strict";

//# sourceURL=utils_log_event.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').BattleState} BattleState
 * @typedef {import('./types.js').BattleEvent} BattleEvent
 * @typedef {import('./types.js').Fighter} Fighter
 */

/**
 * @typedef {Object} LogEventOptions
 * @description Options for creating log events
 * @property {string} type - Event type identifier
 * @property {string} actorId - ID of the acting fighter
 * @property {string} [targetId] - ID of the target fighter
 * @property {Object<string, any>} [metadata] - Additional event metadata
 * @property {boolean} [isMajorEvent=false] - Whether this is a major event
 * @property {number} [timestamp] - Custom timestamp (defaults to current time)
 */

/**
 * @typedef {Object} RollEventData
 * @description Data for dice roll events
 * @property {string} rollType - Type of roll ('accuracy', 'damage', 'critical')
 * @property {string} actorId - ID of the acting fighter
 * @property {number} roll - Roll value between 0 and 1
 * @property {number} threshold - Success threshold
 * @property {string} outcome - Roll outcome ('success', 'failure', 'critical')
 * @property {string} [moveName] - Name of associated move
 * @property {Object<string, any>} [details] - Additional roll details
 */

/**
 * @typedef {Object} PerformanceEventData
 * @description Data for performance tracking events
 * @property {string} operation - Name of the operation
 * @property {number} duration - Duration in milliseconds
 * @property {Object<string, any>} [metadata] - Additional performance data
 * @property {boolean} [isSlowOperation] - Whether operation exceeded threshold
 */

/**
 * @typedef {Object} ErrorEventData
 * @description Data for error events
 * @property {Error} error - The error that occurred
 * @property {string} context - Context where error occurred
 * @property {Object<string, any>} [additionalData] - Additional error context
 * @property {string} severity - Error severity ('low', 'medium', 'high', 'critical')
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { 
    createBaseEvent, 
    createDiceRollEvent, 
    createPerformanceEvent as moduleCreatePerformanceEvent, 
    createErrorEvent as moduleCreateErrorEvent 
} from "./battle_logging/battle_event_factory.js";

import { 
    validateLogEvent as moduleValidateLogEvent,
    validateBattleState,
    validateRollData 
} from "./battle_logging/battle_event_validators.js";

import { writeEvent } from "./battle_logging/battle_log_writer.js";
import { logEventToConsole } from "./battle_logging/battle_log_debug.js";

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {string[]} */
const VALID_ROLL_TYPES = ["accuracy", "damage", "critical", "defense", "special"];

/** @type {string[]} */
const VALID_ROLL_OUTCOMES = ["success", "failure", "critical_success", "critical_failure"];

/** @type {string[]} */
const VALID_ERROR_SEVERITIES = ["low", "medium", "high", "critical"];

/** @type {number} */
const PERFORMANCE_THRESHOLD_MS = 100;

/** @type {number} */
const MAX_EVENT_METADATA_SIZE = 1000;

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Generates a standardized log event with consistent metadata and validation
 * 
 * @param {BattleState} battleState - The current battle state object
 * @param {LogEventOptions} eventOptions - Options for creating the event
 * 
 * @returns {BattleEvent} Complete log event with metadata
 * 
 * @throws {TypeError} When battleState or eventOptions is invalid
 * @throws {Error} When required event properties are missing
 * 
 * @example
 * // Generate a move execution event
 * const event = generateLogEvent(battleState, {
 *   type: 'move_executed',
 *   actorId: 'aang',
 *   targetId: 'azula',
 *   metadata: { moveName: 'Air Blast', damage: 25 }
 * });
 * 
 * @since 2.0.0
 * @public
 */
export function generateLogEvent(battleState, eventOptions) {
    // Input validation
    if (!battleState || typeof battleState !== "object") {
        throw new TypeError("generateLogEvent: battleState must be an object");
    }

    if (!eventOptions || typeof eventOptions !== "object") {
        throw new TypeError("generateLogEvent: eventOptions must be an object");
    }

    if (typeof eventOptions.type !== "string" || eventOptions.type.length === 0) {
        throw new Error("generateLogEvent: eventOptions.type is required and must be a non-empty string");
    }

    if (typeof eventOptions.actorId !== "string" || eventOptions.actorId.length === 0) {
        throw new Error("generateLogEvent: eventOptions.actorId is required and must be a non-empty string");
    }

    console.debug(`[Log Event] Creating event of type: ${eventOptions.type} (enhanced version)`);

    try {
        // Validate battle state
        validateBattleState(battleState);
    } catch (error) {
        console.error(`[Log Event] Battle state validation failed: ${error.message}`);
        throw new Error(`Invalid battle state: ${error.message}`);
    }

    // Prepare event data
    /** @type {any} */
    const baseEventData = {
        type: eventOptions.type,
        actorId: eventOptions.actorId,
        targetId: eventOptions.targetId || null,
        timestamp: eventOptions.timestamp || Date.now(),
        metadata: eventOptions.metadata || {},
        isMajorEvent: eventOptions.isMajorEvent || false
    };

    // Validate metadata size
    if (eventOptions.metadata) {
        /** @type {string} */
        const metadataString = JSON.stringify(eventOptions.metadata);
        if (metadataString.length > MAX_EVENT_METADATA_SIZE) {
            console.warn(`[Log Event] Metadata size (${metadataString.length}) exceeds limit (${MAX_EVENT_METADATA_SIZE})`);
            baseEventData.metadata = { ...eventOptions.metadata, _truncated: true };
        }
    }

    try {
        /** @type {BattleEvent} */
        const event = createBaseEvent(battleState, baseEventData);
        
        // Add performance tracking for major events
        if (eventOptions.isMajorEvent) {
            console.log(`[Log Event] Major event created: ${eventOptions.type} (ID: ${event.eventId})`);
        }
        
        // Validate event structure
        try {
            moduleValidateLogEvent(event);
        } catch (validationError) {
            console.warn(`[Log Event] Event validation failed: ${validationError.message}`);
            event.metadata = { ...event.metadata, validationWarning: validationError.message };
        }
        
        console.debug(`[Log Event] Event created successfully: ${event.eventId}`);
        return event;
        
    } catch (error) {
        console.error(`[Log Event] Failed to create event: ${error.message}`);
        throw new Error(`Event creation failed: ${error.message}`);
    }
}

/**
 * Logs a dice roll event to the battle log with comprehensive validation
 * 
 * @param {Object} options - Configuration object for the roll log entry
 * @param {BattleEvent[]} options.battleLog - Battle log array to append to
 * @param {RollEventData} options.rollData - Roll event data
 * @param {BattleState} options.battleState - Current battle state
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When required parameters are missing or invalid
 * @throws {RangeError} When roll value is outside valid range [0, 1]
 * 
 * @example
 * // Log an accuracy roll
 * logRoll({
 *   battleLog: currentBattleLog,
 *   rollData: {
 *     rollType: 'accuracy',
 *     actorId: 'aang',
 *     roll: 0.75,
 *     threshold: 0.60,
 *     outcome: 'success',
 *     moveName: 'Air Blast'
 *   },
 *   battleState: currentState
 * });
 * 
 * @since 2.0.0
 * @public
 */
export function logRoll({ battleLog, rollData, battleState }) {
    // Input validation
    if (!Array.isArray(battleLog)) {
        throw new TypeError("logRoll: battleLog must be an array");
    }

    if (!rollData || typeof rollData !== "object") {
        throw new TypeError("logRoll: rollData must be an object");
    }

    if (!battleState || typeof battleState !== "object") {
        throw new TypeError("logRoll: battleState must be an object");
    }

    // Validate roll data structure
    if (typeof rollData.rollType !== "string" || !VALID_ROLL_TYPES.includes(rollData.rollType)) {
        throw new Error(`logRoll: rollType must be one of: ${VALID_ROLL_TYPES.join(", ")}`);
    }

    if (typeof rollData.actorId !== "string" || rollData.actorId.length === 0) {
        throw new Error("logRoll: actorId is required and must be a non-empty string");
    }

    if (typeof rollData.roll !== "number" || rollData.roll < 0 || rollData.roll > 1) {
        throw new RangeError("logRoll: roll must be a number between 0 and 1 (inclusive)");
    }

    if (typeof rollData.threshold !== "number" || rollData.threshold < 0 || rollData.threshold > 1) {
        throw new RangeError("logRoll: threshold must be a number between 0 and 1 (inclusive)");
    }

    if (typeof rollData.outcome !== "string" || !VALID_ROLL_OUTCOMES.includes(rollData.outcome)) {
        throw new Error(`logRoll: outcome must be one of: ${VALID_ROLL_OUTCOMES.join(", ")}`);
    }

    console.debug(`[Log Event] Logging dice roll: ${rollData.rollType} for ${rollData.actorId} (enhanced version)`);
    
    try {
        // Validate roll data with modular system
        validateRollData(rollData);
    } catch (error) {
        throw new Error(`Roll data validation failed: ${error.message}`);
    }
    
    // Create dice roll event using new modular system
    /** @type {BattleEvent} */
    const rollEvent = createDiceRollEvent(battleState, rollData);
    
    // Write to log
    writeEvent(battleLog, rollEvent);
    
    // Log extreme rolls for debugging
    /** @type {boolean} */
    const isExtreme = rollData.roll <= 0.05 || rollData.roll >= 0.95;
    if (isExtreme) {
        console.warn(`[Log Event] Extreme roll detected: ${rollData.rollType} = ${rollData.roll} (${rollData.outcome})`);
    }
    
    console.debug(`[Log Event] Dice roll logged: ${rollEvent.eventId}`);
}

/**
 * Creates a performance tracking event for monitoring system performance.
 * 
 * @deprecated Use createPerformanceEvent from battle_logging/battle_event_factory.js
 * @param {Object} battleState - Current battle state
 * @param {string} operation - Name of the operation being tracked
 * @param {number} duration - Duration in milliseconds
 * @param {Object} [metadata] - Additional performance metadata
 * @returns {Object} Performance tracking event
 */
export function createPerformanceEvent(battleState, operation, duration, metadata = {}) {
    console.debug(`[Log Event] Performance: ${operation} took ${duration.toFixed(2)}ms (via compatibility layer)`);
    
    return moduleCreatePerformanceEvent(battleState, operation, duration, metadata);
}

/**
 * Creates an error event for logging system errors and exceptions.
 * 
 * @deprecated Use createErrorEvent from battle_logging/battle_event_factory.js
 * @param {Object} battleState - Current battle state
 * @param {Error} error - The error that occurred
 * @param {string} context - Context where the error occurred
 * @param {Object} [additionalData] - Additional error context
 * @returns {Object} Error event for logging
 */
export function createErrorEvent(battleState, error, context, additionalData = {}) {
    console.error(`[Log Event] Error in ${context}: (via compatibility layer)`, error);
    
    return moduleCreateErrorEvent(battleState, error, context, additionalData);
}

// Add deprecation warnings for development
if (typeof console !== "undefined" && console.warn) {
    console.warn(
        "[DEPRECATION WARNING] utils_log_event.js is now a compatibility layer. " +
        "Please migrate to the new modular system: import from \"./battle_logging/index.js\""
    );
} 