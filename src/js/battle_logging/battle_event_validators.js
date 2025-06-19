/**
 * @fileoverview Battle Event Validators
 * @description Validation logic for all event types
 * @version 1.0.0
 */

"use strict";

import { EVENT_TYPES, ROLL_TYPES, REQUIRED_EVENT_FIELDS } from "./battle_event_types.js";

/**
 * Validates the basic structure of any log event
 * @param {Object} logEvent - Event to validate
 * @throws {Error} If validation fails
 */
export function validateLogEvent(logEvent) {
    if (!logEvent || typeof logEvent !== "object") {
        throw new Error("Log event must be an object");
    }

    // Check required fields
    for (const field of REQUIRED_EVENT_FIELDS) {
        if (!(field in logEvent)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    
    // Validate field types
    if (typeof logEvent.type !== "string") {
        throw new Error(`Field 'type' must be a string, got: ${typeof logEvent.type}`);
    }
    
    if (typeof logEvent.turnNumber !== "number") {
        throw new Error(`Field 'turnNumber' must be a number, got: ${typeof logEvent.turnNumber}`);
    }

    if (typeof logEvent.eventId !== "string") {
        throw new Error(`Field 'eventId' must be a string, got: ${typeof logEvent.eventId}`);
    }

    if (typeof logEvent.timestamp !== "string") {
        throw new Error(`Field 'timestamp' must be a string, got: ${typeof logEvent.timestamp}`);
    }
}

/**
 * Validates battle state object for event generation
 * @param {Object} battleState - Battle state to validate
 * @throws {TypeError} If validation fails
 */
export function validateBattleState(battleState) {
    if (!battleState || typeof battleState !== "object") {
        throw new TypeError(`'battleState' must be an object, received: ${typeof battleState}`);
    }
    
    // Optional but recommended fields
    if (battleState.turn !== undefined && typeof battleState.turn !== "number") {
        throw new TypeError(`'battleState.turn' must be a number if provided, received: ${typeof battleState.turn}`);
    }
    
    if (battleState.currentPhase !== undefined && typeof battleState.currentPhase !== "string") {
        throw new TypeError(`'battleState.currentPhase' must be a string if provided, received: ${typeof battleState.currentPhase}`);
    }
}

/**
 * Validates base event data before event creation
 * @param {Object} baseEvent - Base event data to validate
 * @throws {Error} If validation fails
 */
export function validateBaseEvent(baseEvent) {
    if (!baseEvent || typeof baseEvent !== "object") {
        throw new TypeError(`'baseEvent' must be an object, received: ${typeof baseEvent}`);
    }
    
    if (!baseEvent.type || typeof baseEvent.type !== "string") {
        throw new Error(`'baseEvent.type' is required and must be a string, received: ${typeof baseEvent.type} (${baseEvent.type})`);
    }
    
    // Validate event type is known
    const validTypes = Object.values(EVENT_TYPES);
    if (!validTypes.includes(baseEvent.type)) {
        throw new Error(`Unknown event type: ${baseEvent.type}. Valid types: ${validTypes.join(", ")}`);
    }
}

/**
 * Validates dice roll specific data
 * @param {Object} rollData - Roll data to validate
 * @throws {TypeError|RangeError} If validation fails
 */
export function validateRollData(rollData) {
    const { rollType, roll, outcome } = rollData;
    
    if (!rollType || typeof rollType !== "string") {
        throw new TypeError(`'rollType' must be a non-empty string, received: ${typeof rollType} (${rollType})`);
    }
    
    // Validate roll type is known
    const validRollTypes = Object.values(ROLL_TYPES);
    if (!validRollTypes.includes(rollType)) {
        throw new Error(`Unknown roll type: ${rollType}. Valid types: ${validRollTypes.join(", ")}`);
    }
    
    if (typeof roll !== "number" || isNaN(roll)) {
        throw new TypeError(`'roll' must be a valid number, received: ${typeof roll} (${roll})`);
    }
    
    if (roll < 0 || roll > 1) {
        throw new RangeError(`'roll' must be between 0 and 1, received: ${roll}`);
    }
    
    if (!outcome || typeof outcome !== "string") {
        throw new TypeError(`'outcome' must be a non-empty string, received: ${typeof outcome} (${outcome})`);
    }
    
    if (rollData.threshold !== undefined) {
        if (typeof rollData.threshold !== "number" || isNaN(rollData.threshold)) {
            throw new TypeError(`'threshold' must be a valid number if provided, received: ${typeof rollData.threshold}`);
        }
        
        if (rollData.threshold < 0 || rollData.threshold > 1) {
            throw new RangeError(`'threshold' must be between 0 and 1 if provided, received: ${rollData.threshold}`);
        }
    }
}

/**
 * Validates performance event data
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in milliseconds
 * @throws {TypeError} If validation fails
 */
export function validatePerformanceData(operation, duration) {
    if (!operation || typeof operation !== "string") {
        throw new TypeError(`'operation' must be a non-empty string, received: ${typeof operation}`);
    }
    
    if (typeof duration !== "number" || isNaN(duration) || duration < 0) {
        throw new TypeError(`'duration' must be a non-negative number, received: ${typeof duration} (${duration})`);
    }
}

/**
 * Validates error event data
 * @param {Error} error - Error object
 * @param {string} context - Error context
 * @throws {TypeError} If validation fails
 */
export function validateErrorData(error, context) {
    if (!error || typeof error.message !== 'string') {
        throw new TypeError("'error' must be an Error object or error-like object with a message property");
    }
    
    if (!context || typeof context !== "string") {
        throw new TypeError(`'context' must be a non-empty string, received: ${typeof context}`);
    }
}

/**
 * Validates an array intended to be used as a battle log
 * @param {Array} battleLog - Battle log array to validate
 * @throws {TypeError} If validation fails
 */
export function validateBattleLog(battleLog) {
    if (!Array.isArray(battleLog)) {
        throw new TypeError(`'battleLog' must be an array, received: ${typeof battleLog}`);
    }
}

/**
 * Performs comprehensive validation of an event before logging
 * @param {Object} event - Complete event to validate
 * @returns {Object} Validation result with warnings and errors
 */
export function comprehensiveEventValidation(event) {
    const result = {
        isValid: true,
        errors: [],
        warnings: []
    };
    
    try {
        validateLogEvent(event);
    } catch (/** @type {any} */ error) {
        result.isValid = false;
        result.errors.push(error.message);
    }
    
    // Additional checks for completeness
    if (!event.text && !event.html_content) {
        result.warnings.push("Event has no human-readable content (text or html_content)");
    }
    
    if (event.isMajorEvent && !event.debugData) {
        result.warnings.push("Major event lacks debugging data");
    }
    
    if (event.type === EVENT_TYPES.DICE_ROLL && !event.rollAnalysis) {
        result.warnings.push("Dice roll event lacks roll analysis");
    }
    
    return result;
} 