/**
 * @fileoverview Escalation Narrative Generator
 * @description Handles narrative for character escalation state changes (Injured, Exhausted, etc.).
 * @version 1.0
 */

'use strict';

import { escalationStateNarratives } from '../data_narrative_escalation.js';
import { phaseTemplates } from '../data_narrative_phases.js';
import { getRandomElementSeeded } from '../utils_seeded_random.js';
import { generateLogEvent } from '../utils_log_event.js';
import { substituteTokens } from './stringSubstitution.js';

/**
 * Generates narrative for a change in a character's escalation state (e.g., Injured, Exhausted).
 * @param {object} fighter - The character whose state is changing.
 * @param {string} oldState - The previous escalation state.
 * @param {string} newState - The new escalation state.
 * @param {object} battleState - The current battle state.
 * @returns {object|null} A log event for the escalation change, or null.
 */
export function generateEscalationNarrative(fighter, oldState, newState, battleState) {
    if (!fighter || !newState || oldState === newState) return null;

    const flavorTextPool = escalationStateNarratives[newState] || [`{actorName}'s condition changes.`];
    const flavorText = getRandomElementSeeded(flavorTextPool);
    const substitutedFlavorText = substituteTokens(flavorText, fighter, null);

    const htmlTemplate = phaseTemplates.escalationStateChangeTemplates[newState.toLowerCase()] || phaseTemplates.escalationStateChangeTemplates.general;
    const htmlContent = substituteTokens(htmlTemplate, fighter, null, { '{escalationFlavorText}': substitutedFlavorText });

    return generateLogEvent(battleState, {
        type: 'escalation_change_event',
        actorId: fighter.id,
        characterName: fighter.name,
        oldState,
        newState,
        text: substitutedFlavorText,
        html_content: htmlContent
    });
} 