/**
 * @fileoverview Battle Logging System - Main Entry Point
 * @description Modular battle event logging system with clean separation of concerns
 * @version 1.0.0
 */

'use strict';

// Export event types and constants
export * from './battle_event_types.js';

// Export factory functions for creating events
export * from './battle_event_factory.js';

// Export validation functions
export * from './battle_event_validators.js';

// Export log writing functionality
export * from './battle_log_writer.js';

// Export formatting utilities
export * from './battle_log_formatters.js';

// Export debug utilities
export * from './battle_log_debug.js';

// Re-export commonly used combinations for convenience
import { createBaseEvent, createDiceRollEvent, createPerformanceEvent, createErrorEvent } from './battle_event_factory.js';
import { writeEvent, writeEvents } from './battle_log_writer.js';
import { validateLogEvent, validateBattleState } from './battle_event_validators.js';
import { logEventToConsole } from './battle_log_debug.js';

/**
 * High-level convenience function that creates and logs an event
 * @param {Array} battleLog - Target log array
 * @param {Object} battleState - Current battle state
 * @param {Object} baseEvent - Base event data
 * @returns {Object} The created event
 */
export function createAndLogEvent(battleLog, battleState, baseEvent) {
    const event = createBaseEvent(battleState, baseEvent);
    writeEvent(battleLog, event);
    logEventToConsole(event);
    return event;
}

/**
 * High-level convenience function for dice roll events
 * @param {Array} battleLog - Target log array
 * @param {Object} battleState - Current battle state
 * @param {Object} rollData - Roll data
 * @returns {Object} The created roll event
 */
export function createAndLogRoll(battleLog, battleState, rollData) {
    const event = createDiceRollEvent(battleState, rollData);
    writeEvent(battleLog, event);
    logEventToConsole(event);
    return event;
}

/**
 * High-level convenience function for performance events
 * @param {Array} battleLog - Target log array
 * @param {Object} battleState - Current battle state
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in milliseconds
 * @param {Object} metadata - Additional metadata
 * @returns {Object} The created performance event
 */
export function createAndLogPerformance(battleLog, battleState, operation, duration, metadata = {}) {
    const event = createPerformanceEvent(battleState, operation, duration, metadata);
    writeEvent(battleLog, event);
    logEventToConsole(event);
    return event;
}

/**
 * High-level convenience function for error events
 * @param {Array} battleLog - Target log array
 * @param {Object} battleState - Current battle state
 * @param {Error} error - Error object
 * @param {string} context - Error context
 * @param {Object} additionalData - Additional error data
 * @returns {Object} The created error event
 */
export function createAndLogError(battleLog, battleState, error, context, additionalData = {}) {
    const event = createErrorEvent(battleState, error, context, additionalData);
    writeEvent(battleLog, event);
    logEventToConsole(event);
    return event;
}

/**
 * Namespace object for organized access to all functionality
 */
import * as types from './battle_event_types.js';
import * as factory from './battle_event_factory.js';
import * as validators from './battle_event_validators.js';
import * as writer from './battle_log_writer.js';
import * as formatters from './battle_log_formatters.js';
import * as debug from './battle_log_debug.js';

export const BattleLogging = {
    // Types and constants
    types,
    
    // Factory functions
    factory,
    
    // Validation
    validators,
    
    // Writing
    writer,
    
    // Formatting
    formatters,
    
    // Debug
    debug,
    
    // High-level functions
    createAndLogEvent,
    createAndLogRoll,
    createAndLogPerformance,
    createAndLogError
}; 