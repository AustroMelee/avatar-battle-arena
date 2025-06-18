/**
 * @fileoverview Battle Event Logging Utilities (Compatibility Layer)
 * @description Backward-compatible interface to the new modular battle logging system
 * 
 * This file maintains compatibility with existing code while using the new modular
 * battle logging system internally. All original functions are preserved with
 * identical signatures and behavior.
 * 
 * @version 2.0.0 (Modular System)
 * @deprecated Use the new modular system directly: import from './battle_logging/index.js'
 * @author Battle Arena Development Team
 * @since 1.0.0
 */

'use strict';

// Import from the new modular system
import { 
    createBaseEvent, 
    createDiceRollEvent, 
    createPerformanceEvent as moduleCreatePerformanceEvent, 
    createErrorEvent as moduleCreateErrorEvent 
} from './battle_logging/battle_event_factory.js';

import { 
    validateLogEvent as moduleValidateLogEvent,
    validateBattleState,
    validateRollData 
} from './battle_logging/battle_event_validators.js';

import { writeEvent } from './battle_logging/battle_log_writer.js';
import { logEventToConsole } from './battle_logging/battle_log_debug.js';

/**
 * Generates a standardized log event with consistent metadata.
 * 
 * @deprecated Use createBaseEvent from battle_logging/battle_event_factory.js
 * @param {Object} battleState - The current battle state object
 * @param {Object} baseEvent - The base event object to extend
 * @returns {Object} Complete log event with metadata
 * @throws {TypeError} If battleState or baseEvent is not an object
 * @throws {Error} If required event type is missing
 */
export function generateLogEvent(battleState, baseEvent) {
    console.debug(`[Log Event] Creating event of type: ${baseEvent?.type} (via compatibility layer)`);
    
    try {
        validateBattleState(battleState);
    } catch (error) {
        console.error(`[Log Event] ${error.message}`);
        throw error;
    }
    
    try {
        const event = createBaseEvent(battleState, baseEvent);
        
        // Add performance tracking for major events (preserving original behavior)
        if (baseEvent.isMajorEvent) {
            console.log(`[Log Event] Major event created: ${baseEvent.type} (ID: ${event.eventId})`);
        }
        
        // Validate event structure (preserving original behavior)
        try {
            validateLogEvent(event);
        } catch (validationError) {
            console.warn(`[Log Event] Event validation failed: ${validationError.message}`);
            event.metadata.validationWarning = validationError.message;
        }
        
        console.debug(`[Log Event] Event created successfully: ${event.eventId}`);
        return event;
        
    } catch (error) {
        console.error(`[Log Event] Failed to create event: ${error.message}`);
        throw error;
    }
}

/**
 * Validates the structure and content of a log event.
 * 
 * @deprecated Use validateLogEvent from battle_logging/battle_event_validators.js
 * @param {Object} logEvent - The log event to validate
 * @throws {Error} If the event structure is invalid
 */
function validateLogEvent(logEvent) {
    return moduleValidateLogEvent(logEvent);
}

/**
 * Logs a dice roll event to the battle log with comprehensive details.
 * 
 * @deprecated Use createAndLogRoll from battle_logging/index.js
 * @param {Object} options - Configuration object for the roll log entry
 * @throws {TypeError} If required parameters are missing or invalid
 * @throws {RangeError} If roll value is outside valid range [0, 1]
 */
export function logRoll({ battleLog, rollType, actorId, roll, threshold, outcome, battleState, moveName, details }) {
    console.debug(`[Log Event] Logging dice roll: ${rollType} for ${actorId || 'unknown'} (via compatibility layer)`);
    
    // Input validation (preserving original behavior)
    if (!Array.isArray(battleLog)) {
        throw new TypeError(`logRoll(): 'battleLog' must be an array, received: ${typeof battleLog}`);
    }
    
    const rollData = { rollType, actorId, roll, threshold, outcome, moveName, details };
    
    try {
        validateRollData(rollData);
    } catch (error) {
        // Re-throw with original error format for compatibility
        throw error;
    }
    
    // Create dice roll event using new modular system
    const rollEvent = createDiceRollEvent(battleState, rollData);
    
    // Write to log
    writeEvent(battleLog, rollEvent);
    
    // Log extreme rolls for debugging (preserving original behavior)
    if (rollEvent.rollAnalysis.isExtreme) {
        console.warn(`[Log Event] Extreme roll detected: ${rollType} = ${roll} (${outcome})`);
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
if (typeof console !== 'undefined' && console.warn) {
    console.warn(
        '[DEPRECATION WARNING] utils_log_event.js is now a compatibility layer. ' +
        'Please migrate to the new modular system: import from "./battle_logging/index.js"'
    );
} 