// FILE: engine/narrative-engine.js
'use strict';

// This is the OMEGA Narrative Engine. Its job is to translate game states
// and AI thoughts into rich, in-character dialogue and narration.

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * The main entry point for generating narrative.
 * It intelligently selects a quote based on a trigger and context.
 * @param {object} actor - The character speaking/thinking.
 * @param {string} trigger - The event that caused the narrative (e.g., 'intent', 'mentalState').
 * @param {string} subTrigger - The specific sub-event (e.g., 'PressAdvantage', 'stressed').
 * @param {object} context - Optional context like target name, move name, etc.
 * @returns {string} A formatted HTML string for the battle log, or an empty string.
 */
export function triggerNarrativeEvent(actor, trigger, subTrigger, context = {}) {
    const narrativePool = findNarrativePool(actor, trigger, subTrigger, context);

    if (!narrativePool || narrativePool.length === 0) {
        return ''; // No quote found for this trigger
    }

    const quote = getRandomElement(narrativePool);
    const formattedLine = formatLine(quote.line, context);
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;

    if (quote.type === 'internal') {
        return `<p class="narrative-internal"><em>${actorSpan} thinks, "${formattedLine}"</em></p>`;
    }
    // Default to 'spoken'
    return `<p class="narrative-spoken">${actorSpan} says, "${formattedLine}"</p>`;
}

function findNarrativePool(actor, trigger, subTrigger, context) {
    // 1. Check for hyper-specific relationship context first
    if (context.target && actor.relationships?.[context.target.id]?.narrative?.[trigger]?.[subTrigger]) {
        return actor.relationships[context.target.id].narrative[trigger][subTrigger];
    }

    // 2. Check for character-specific trigger
    if (actor.narrative?.[trigger]?.[subTrigger]) {
        return actor.narrative[trigger][subTrigger];
    }
    
    // 3. Fallback to a general pool for the trigger
    if (actor.narrative?.[trigger]?.general) {
        return actor.narrative[trigger].general;
    }

    return null;
}

function formatLine(line, context) {
    let formatted = line;
    if (context.target) formatted = formatted.replace(/{target}/g, context.target.name);
    if (context.move) formatted = formatted.replace(/{move}/g, context.move.name);
    return formatted;
}