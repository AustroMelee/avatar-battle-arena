/**
 * @fileoverview Quote Engine for Character Dialogue
 * @description Handles finding and formatting character quotes, dialogue, and internal thoughts.
 * @version 1.0
 */

'use strict';

import { allArchetypes } from '../data_archetypes_index.js';
import { getRandomElementSeeded } from '../utils_seeded_random.js';
import { generateLogEvent } from '../utils_log_event.js';
import { substituteTokens } from './stringSubstitution.js';

/**
 * Retrieves a narrative quote for a character based on context.
 * @param {object} actor - The character speaking or thinking.
 * @param {object} recipient - The character being addressed or thought about.
 * @param {string} type - The type of quote (e.g., 'battleStart', 'onTakeDamage').
 * @param {string} phase - The current battle phase (e.g., 'Opening', 'Climax').
 * @param {object} context - Additional context like locationId.
 * @returns {{type: string, line: string}|null} The selected quote object or null.
 */
export function findNarrativeQuote(actor, recipient, type, phase, context) {
    if (!actor || !actor.id) {
        console.warn('findNarrativeQuote called with invalid actor.');
        return null;
    }

    const archetype = allArchetypes[actor.id];
    if (!archetype || !archetype.narrative) {
        console.debug(`No narrative archetype found for actor ID: ${actor.id}`);
        return null;
    }

    const narrativeData = archetype.narrative;
    const currentPhaseKey = phase || 'Generic';
    const poolsToTry = [];

    // 1. Most specific: Relationship-based quotes for the current phase
    if (recipient && recipient.id && narrativeData.relationships && narrativeData.relationships[recipient.id]) {
        const relNarrative = narrativeData.relationships[recipient.id];
        if (relNarrative[type]?.[currentPhaseKey]) poolsToTry.push(relNarrative[type][currentPhaseKey]);
        if (relNarrative[type]?.Generic) poolsToTry.push(relNarrative[type].Generic);
    }

    // 2. Character-specific quotes for the current phase
    if (narrativeData[type]?.[currentPhaseKey]) poolsToTry.push(narrativeData[type][currentPhaseKey]);

    // 3. Character-specific quotes for any phase
    if (narrativeData[type]?.Generic) poolsToTry.push(narrativeData[type].Generic);

    // 4. Fallback to general pools
    if (narrativeData.general?.[currentPhaseKey]) poolsToTry.push(narrativeData.general[currentPhaseKey]);
    if (narrativeData.general?.Generic) poolsToTry.push(narrativeData.general.Generic);

    for (const pool of poolsToTry) {
        if (pool && Array.isArray(pool) && pool.length > 0) {
            const selectedElement = getRandomElementSeeded(pool);
            if (typeof selectedElement === 'string') {
                return { type: 'spoken', line: selectedElement }; // Default to spoken
            }
            if (typeof selectedElement === 'object' && selectedElement.line) {
                return { type: selectedElement.type || 'spoken', line: selectedElement.line };
            }
        }
    }

    // console.debug(`No suitable quote found for ${actor.name}, type: ${type}, phase: ${phase}`);
    return null;
}

/**
 * Formats a quote into a structured log event.
 * @param {{type: string, line: string}} quote - The quote object.
 * @param {object} actor - The speaker.
 * @param {object} opponent - The other character.
 * @param {object} context - Additional context including battleState.
 * @returns {object|null} A formatted log event or null if invalid.
 */
export function formatQuoteEvent(quote, actor, opponent, context) {
    if (!quote || typeof quote.line !== 'string') return null;

    const { type, line } = quote;
    const substitutedLine = substituteTokens(line, actor, opponent, context);
    let htmlContent = '';
    let baseEvent = {};

    switch (type) {
        case 'spoken':
            htmlContent = `<p class="dialogue-line char-${actor.id}">${actor.name}: "<em>${substitutedLine}</em>"</p>`;
            baseEvent = { type: 'dialogue_event', text: `${actor.name} says, "${substitutedLine}"`, isDialogue: true };
            break;
        case 'internal':
            htmlContent = `<p class="dialogue-line internal-thought char-${actor.id}"><em>(${substitutedLine})</em></p>`;
            baseEvent = { type: 'internal_thought_event', text: `(${actor.name} thinks: ${substitutedLine})`, isInternalThought: true };
            break;
        case 'action':
             htmlContent = `<p class="action-line char-${actor.id}">${substitutedLine}</p>`;
             baseEvent = { type: 'action_narrative_event', text: substitutedLine };
             break;
        default:
             console.warn(`Unknown quote type: ${type}. Treating as generic narrative.`);
             htmlContent = `<p class="narrative-event">${substitutedLine}</p>`;
             baseEvent = { type: 'generic_narrative_event', text: substitutedLine };
             break;
    }

    return generateLogEvent(context.battleState, {
        ...baseEvent,
        actorId: actor.id,
        characterName: actor.name,
        html_content: htmlContent,
    });
} 