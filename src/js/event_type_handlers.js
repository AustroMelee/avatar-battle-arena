/**
 * @fileoverview Event Type Handlers for Battle Log Transformation
 * @description Strategy pattern implementation for handling different event types in animation queue transformation
 * @version 1.0
 */

'use strict';

import { IMPACT_LEVELS, getPauseDurationForImpact } from './utils_impact_level.js';

/**
 * Default animation event structure
 */
const createBaseAnimationEvent = (event) => ({
    text: event.text || '',
    pauseAfter: event.pauseAfter || getPauseDurationForImpact(IMPACT_LEVELS.LOW)
});

/**
 * Handler for phase header events
 */
function handlePhaseHeaderEvent(event) {
    return {
        ...createBaseAnimationEvent(event),
        text: `${event.phaseName || 'New Phase'} ${event.phaseEmoji || '⚔️'}`,
        isPhaseHeader: true,
        pauseAfter: 1200
    };
}

/**
 * Handler for dialogue and internal thought events
 */
function handleDialogueEvent(event) {
    const textLength = event.text ? event.text.length : 0;
    return {
        ...createBaseAnimationEvent(event),
        actorId: event.actorId,
        characterName: event.characterName,
        isDialogue: true,
        dialogueType: event.dialogueType,
        pauseAfter: textLength > 50 ? 1000 : 600
    };
}

/**
 * Handler for move action events
 */
function handleMoveActionEvent(event) {
    return {
        ...createBaseAnimationEvent(event),
        isMoveAction: true,
        impactLevel: event.impactLevel || IMPACT_LEVELS.MEDIUM,
        moveData: { 
            name: event.moveName, 
            type: event.moveType, 
            effectiveness: event.effectiveness 
        },
        pauseAfter: 1000
    };
}

/**
 * Handler for escalation change events
 */
function handleEscalationChangeEvent(event) {
    return {
        ...createBaseAnimationEvent(event),
        isStatusEvent: true,
        impactLevel: IMPACT_LEVELS.HIGH,
        pauseAfter: 1300
    };
}

/**
 * Handler for major battle events (curbstomp, final blow, conclusion)
 */
function handleMajorBattleEvent(event) {
    return {
        ...createBaseAnimationEvent(event),
        impactLevel: IMPACT_LEVELS.CRITICAL,
        isMajorEvent: true,
        pauseAfter: 2500
    };
}

/**
 * Handler for stalemate result events
 */
function handleStalemateResultEvent(event) {
    return {
        ...createBaseAnimationEvent(event),
        impactLevel: IMPACT_LEVELS.HIGH,
        isMajorEvent: true,
        pauseAfter: 2000
    };
}

/**
 * Default handler for unknown or simple events
 */
function handleDefaultEvent(event) {
    return {
        ...createBaseAnimationEvent(event),
        impactLevel: IMPACT_LEVELS.LOW
    };
}

/**
 * Event type handler registry
 * Maps event types to their corresponding handler functions
 */
export const EVENT_TYPE_HANDLERS = {
    'phase_header_event': handlePhaseHeaderEvent,
    'dialogue_event': handleDialogueEvent,
    'internal_thought_event': handleDialogueEvent, // Same handler as dialogue
    'move_action_event': handleMoveActionEvent,
    'escalation_change_event': handleEscalationChangeEvent,
    'curbstomp_event': handleMajorBattleEvent,
    'final_blow_event': handleMajorBattleEvent,
    'conclusion_event': handleMajorBattleEvent,
    'stalemate_result_event': handleStalemateResultEvent
};

/**
 * Processes an event using the appropriate handler
 * 
 * @param {object} event - The event to process
 * @returns {object} Processed animation event
 */
export function processEventForAnimation(event) {
    try {
        // Defensive Programming: Comprehensive input validation
        if (!event) {
            console.warn('[Event Handler] Event is null or undefined');
            return handleDefaultEvent({ text: 'Unknown event' });
        }
        
        if (typeof event !== 'object') {
            console.warn('[Event Handler] Event is not an object:', typeof event);
            return handleDefaultEvent({ text: 'Invalid event' });
        }
        
        if (!event.type) {
            console.warn('[Event Handler] Event missing type property:', event);
            return handleDefaultEvent({ text: 'Event missing type' });
        }
        
        if (typeof event.type !== 'string') {
            console.warn('[Event Handler] Event type is not a string:', typeof event.type);
            return handleDefaultEvent({ text: 'Invalid event type' });
        }
        
        console.debug(`[Event Handler] Processing event type: ${event.type}`);
        
        // Defensive: Ensure handler exists and is a function
        const handler = EVENT_TYPE_HANDLERS[event.type];
        if (!handler) {
            console.warn(`[Event Handler] No handler found for event type: ${event.type}`);
            return handleDefaultEvent(event);
        }
        
        if (typeof handler !== 'function') {
            console.error(`[Event Handler] Handler for "${event.type}" is not a function:`, typeof handler);
            return handleDefaultEvent(event);
        }
        
        // Process with error recovery
        const result = handler(event);
        
        // Validate handler result
        if (!result || typeof result !== 'object') {
            console.warn(`[Event Handler] Handler for "${event.type}" returned invalid result:`, result);
            return handleDefaultEvent(event);
        }
        
        return result;
    } catch (error) {
        console.error(`[Event Handler] Critical error processing event:`, error, event);
        return handleDefaultEvent({ 
            text: 'Error processing event',
            error: error.message 
        });
    }
}

/**
 * Registers a new event type handler
 * 
 * @param {string} eventType - The event type to handle
 * @param {function} handlerFunction - The handler function
 * @returns {boolean} True if successfully registered
 */
export function registerEventHandler(eventType, handlerFunction) {
    if (typeof handlerFunction !== 'function') {
        console.error('[Event Handler] Handler must be a function');
        return false;
    }
    
    if (eventType in EVENT_TYPE_HANDLERS) {
        console.warn(`[Event Handler] Overwriting existing handler for "${eventType}"`);
    }
    
    EVENT_TYPE_HANDLERS[eventType] = handlerFunction;
    return true;
}

/**
 * Gets all registered event types
 * 
 * @returns {string[]} Array of registered event type names
 */
export function getRegisteredEventTypes() {
    return Object.keys(EVENT_TYPE_HANDLERS);
}

/**
 * Checks if an event type has a registered handler
 * 
 * @param {string} eventType - The event type to check
 * @returns {boolean} True if handler exists
 */
export function hasEventHandler(eventType) {
    return eventType in EVENT_TYPE_HANDLERS;
} 