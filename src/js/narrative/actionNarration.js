/**
 * @fileoverview Action Narration Generator
 * @description Handles generating action descriptions and comprehensive turn narration objects.
 * @version 1.0
 */

'use strict';

import { locations } from '../locations.js';
import { effectivenessLevels } from '../data_narrative_effectiveness.js';
import { NarrativeStringBuilder } from '../utils_narrative-string-builder.js';
import { generateLogEvent } from '../utils_log_event.js';
import { formatQuoteEvent } from './quoteEngine.js';
import { generateCollateralDamageEvent } from './environmentNarrative.js';

/**
 * Generates the primary narrative description for a move action.
 * @param {object} move - The move being performed.
 * @param {object} actor - The character performing the move.
 * @param {object} defender - The character being targeted.
 * @param {object} result - The outcome of the move action.
 * @param {object} battleState - The current state of the battle.
 * @returns {object} A structured log event for the action.
 */
export function generateActionDescriptionObject(move, actor, defender, result, battleState) {
    const effectiveness = result.effectiveness.label;
    const locationData = locations[battleState.locationId];

    const builder = new NarrativeStringBuilder(actor, defender, move, effectivenessLevels, locationData, {
        isCrit: effectiveness === 'Critical'
    });

    const { actionSentence, htmlSentence } = builder.buildActionDescription(effectiveness);

    return generateLogEvent(battleState, {
        type: 'move_action_event',
        actorId: actor.id,
        characterName: actor.name,
        moveName: move.name,
        moveType: move.type,
        text: actionSentence,
        html_content: htmlSentence,
        effectiveness: effectiveness,
        damage: result.damage,
        element: move.element,
    });
}

/**
 * Generates turn narration objects from events, quotes, and move actions.
 * This is a comprehensive function that handles dialogue, actions, and environmental narrative.
 * 
 * @param {Array} events - Array of narrative events (quotes, dialogue, etc.)
 * @param {Object} move - The move being performed (can be null for dialogue-only events)
 * @param {Object} actor - The primary actor
 * @param {Object} opponent - The opponent
 * @param {Object} result - The move result (can be null for dialogue-only events)
 * @param {Object} environmentState - Current environmental state
 * @param {Object} locationConditions - Location-specific conditions
 * @param {string} currentPhaseKey - Current battle phase
 * @param {boolean} [isInitialBanter=false] - Whether this is initial battle banter
 * @param {Object} [aiLogEntry=null] - AI decision log entry for debugging
 * @param {Object} [battleState=null] - Full battle state for context
 * @returns {Array} Array of log events
 */
export function generateTurnNarrationObjects(events, move, actor, opponent, result, environmentState, locationConditions, currentPhaseKey, isInitialBanter = false, aiLogEntry = null, battleState = null) {
    const narrativeObjects = [];
    
    // Handle quote events (dialogue, internal thoughts, actions)
    if (events && Array.isArray(events)) {
        for (const event of events) {
            if (event.quote) {
                const quoteEvent = formatQuoteEvent(event.quote, event.actor || actor, opponent, {
                    battleState: battleState || { turn: 0, currentPhase: currentPhaseKey },
                    currentPhaseKey: currentPhaseKey
                });
                if (quoteEvent) {
                    narrativeObjects.push(quoteEvent);
                }
            }
        }
    }
    
    // Handle move action description
    if (move && result && !isInitialBanter) {
        const actionEvent = generateActionDescriptionObject(move, actor, opponent, result, battleState || { turn: 0, currentPhase: currentPhaseKey, locationId: 'unknown' });
        if (actionEvent) {
            narrativeObjects.push(actionEvent);
        }
        
        // Generate collateral damage if applicable
        const collateralEvent = generateCollateralDamageEvent(move, actor, result, environmentState, battleState || { turn: 0, currentPhase: currentPhaseKey, locationId: 'unknown' });
        if (collateralEvent) {
            narrativeObjects.push(collateralEvent);
        }
    }
    
    return narrativeObjects;
} 