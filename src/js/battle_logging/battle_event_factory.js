/**
 * @fileoverview Battle Event Factory
 * @description Pure event construction functions with no side effects
 * @version 1.0.0
 */

"use strict";

import { EVENT_TYPES, ROLL_TYPES, OUTCOME_TYPES } from "./battle_event_types.js";

/**
 * Creates a base log event with standard metadata
 * @param {Object} battleState - Current battle state
 * @param {Object} baseEvent - Base event data
 * @returns {Object} Complete log event
 */
export function createBaseEvent(battleState, baseEvent) {
    const eventId = `${baseEvent.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
        ...baseEvent,
        eventId: eventId,
        turnNumber: battleState.turn || 0,
        timestamp: new Date().toISOString(),
        performanceTimestamp: performance.now(),
        phase: battleState.currentPhase || "unknown",
        
        metadata: {
            createdBy: "battle_event_factory",
            version: "1.0.0",
            battleStateSnapshot: {
                turn: battleState.turn,
                phase: battleState.currentPhase,
                environmentalImpacts: battleState.environmentState?.environmentalImpactCount || 0
            }
        }
    };
}

/**
 * Creates a dice roll event
 * @param {Object} battleState - Current battle state
 * @param {Object} rollData - Roll data
 * @returns {Object} Dice roll event
 */
export function createDiceRollEvent(battleState, rollData) {
    const { rollType, actorId, roll, threshold, outcome, moveName, details } = rollData;
    
    return createBaseEvent(battleState, {
        type: EVENT_TYPES.DICE_ROLL,
        rollType,
        actorId,
        result: roll,
        threshold,
        outcome,
        moveName,
        details,
        
        rollAnalysis: {
            isSuccess: threshold !== undefined ? roll >= threshold : null,
            successMargin: threshold !== undefined ? roll - threshold : null,
            rollPercentile: Math.round(roll * 100),
            isExtreme: roll <= 0.05 || roll >= 0.95
        },
        
        text: generateRollDescription(rollType, actorId, roll, threshold, outcome, moveName),
        
        debugData: {
            rollType,
            rollValue: roll,
            threshold,
            outcome,
            moveName,
            additionalDetails: details
        }
    });
}

/**
 * Creates a performance tracking event
 * @param {Object} battleState - Current battle state
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in milliseconds
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Performance event
 */
export function createPerformanceEvent(battleState, operation, duration, metadata = {}) {
    return createBaseEvent(battleState, {
        type: EVENT_TYPES.PERFORMANCE,
        operation,
        duration,
        metadata: {
            ...metadata,
            isSlowOperation: duration > 100,
            timestamp: performance.now()
        },
        text: `${operation} completed in ${duration.toFixed(2)}ms`,
        debugData: {
            operation,
            duration,
            performanceMetrics: metadata
        }
    });
}

/**
 * Creates an error event
 * @param {Object} battleState - Current battle state
 * @param {Error} error - Error object
 * @param {string} context - Error context
 * @param {Object} additionalData - Additional error data
 * @returns {Object} Error event
 */
export function createErrorEvent(battleState, error, context, additionalData = {}) {
    return createBaseEvent(battleState, {
        type: EVENT_TYPES.ERROR,
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack
        },
        context,
        additionalData,
        text: `Error in ${context}: ${error.message}`,
        isMajorEvent: true,
        debugData: {
            errorName: error.name,
            errorMessage: error.message,
            context,
            additionalData,
            stackTrace: error.stack
        }
    });
}

/**
 * Creates a battle flow event (start, end, phase change, etc.)
 * @param {Object} battleState - Current battle state
 * @param {string} eventType - Type of battle flow event
 * @param {Object} eventData - Event-specific data
 * @returns {Object} Battle flow event
 */
export function createBattleFlowEvent(battleState, eventType, eventData = {}) {
    return createBaseEvent(battleState, {
        type: eventType,
        ...eventData,
        isMajorEvent: [EVENT_TYPES.BATTLE_START, EVENT_TYPES.BATTLE_END, EVENT_TYPES.PHASE_CHANGE].includes(eventType)
    });
}

/**
 * Creates a combat event (damage, healing, etc.)
 * @param {Object} battleState - Current battle state
 * @param {string} eventType - Type of combat event
 * @param {Object} combatData - Combat-specific data
 * @returns {Object} Combat event
 */
export function createCombatEvent(battleState, eventType, combatData = {}) {
    return createBaseEvent(battleState, {
        type: eventType,
        ...combatData,
        isMajorEvent: [EVENT_TYPES.CRITICAL_HIT, EVENT_TYPES.COUNTER].includes(eventType)
    });
}

/**
 * Creates a narrative event (quotes, narration, etc.)
 * @param {Object} battleState - Current battle state
 * @param {string} eventType - Type of narrative event
 * @param {Object} narrativeData - Narrative-specific data
 * @returns {Object} Narrative event
 */
export function createNarrativeEvent(battleState, eventType, narrativeData = {}) {
    return createBaseEvent(battleState, {
        type: eventType,
        ...narrativeData
    });
}

/**
 * Generates human-readable description for dice rolls
 * @private
 */
function generateRollDescription(rollType, actorId, roll, threshold, outcome, moveName) {
    const actor = actorId || "Unknown";
    const move = moveName ? ` for ${moveName}` : "";
    const rollPercent = Math.round(roll * 100);
    const thresholdPercent = threshold ? Math.round(threshold * 100) : null;
    
    switch (rollType) {
        case ROLL_TYPES.CRIT_CHECK:
            return `${actor} rolls ${rollPercent}% for critical hit${move} - ${outcome}`;
        case ROLL_TYPES.EVASION_CHECK:
            return `${actor} rolls ${rollPercent}% for evasion${move} - ${outcome}`;
        case ROLL_TYPES.DAMAGE_VARIANCE:
            return `${actor} rolls ${rollPercent}% for damage variance${move}`;
        case ROLL_TYPES.ACCURACY_CHECK:
            return `${actor} rolls ${rollPercent}% for accuracy${move} (needs ${thresholdPercent}%) - ${outcome}`;
        default:
            return `${actor} rolls ${rollPercent}% for ${rollType}${move} - ${outcome}`;
    }
} 