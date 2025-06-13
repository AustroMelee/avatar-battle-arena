// FILE: engine/narrative-engine.js
'use strict';

// VERSION 3: OMEGA Narrative Engine, refactored to return structured data for better integration.

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

function formatLine(line, context) {
    let formatted = line;
    if (context.target) formatted = formatted.replace(/{target}/g, context.target.name);
    if (context.move) formatted = formatted.replace(/{move}/g, context.move.name);
    return formatted;
}

function findNarrativePool(actor, trigger, subTrigger, context) {
    const narrativeData = actor.narrative || {};
    let pool = null;

    // 1. Hyper-specific: Relationship + Contextual State
    if (context.target?.id && actor.relationships?.[context.target.id]?.narrative?.states?.[context.actorState]) {
        pool = actor.relationships[context.target.id].narrative.states[context.actorState];
        if (pool) return pool;
    }
    
    // 2. Specific: Relationship + Trigger
    if (context.target?.id && actor.relationships?.[context.target.id]?.narrative?.[trigger]?.[subTrigger]) {
        pool = actor.relationships[context.target.id].narrative[trigger][subTrigger];
        if (pool) return pool;
    }

    // 3. Move-specific trigger (e.g., onMoveResult -> Boomerang Throw -> Critical)
    if (trigger === 'onMoveResult' && narrativeData[trigger]?.[subTrigger]?.[context.result]) {
        pool = narrativeData[trigger][subTrigger][context.result];
        if(pool) return pool;
    }

    // 4. Character Specific: Trigger + Subtrigger
    if (narrativeData[trigger]?.[subTrigger]) {
        pool = narrativeData[trigger][subTrigger];
        if (Array.isArray(pool)) return pool;
    }
    
    // 5. Character Specific: General Trigger
    if (narrativeData[trigger]?.general) {
        return narrativeData[trigger].general;
    }

    return null;
}

/**
 * Returns a structured narrative event object, or null if no quote is found.
 */
export function generateNarrativeEvent(actor, trigger, subTrigger, context = {}) {
    const narrativePool = findNarrativePool(actor, trigger, subTrigger, context);
    if (!narrativePool || narrativePool.length === 0) {
        return null;
    }
    const quote = getRandomElement(narrativePool);
    return {
        actor,
        line: formatLine(quote.line, context),
        type: quote.type || 'spoken' // Default to 'spoken'
    };
}

/**
 * Renders a narrative event object into an HTML string.
 */
export function renderNarrativeEvent(event) {
    if (!event) return '';
    const { actor, line, type } = event;
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const narrativeClass = `narrative-${type}`;
    const verb = type === 'internal' ? 'thinks' : 'says';

    return `<p class="${narrativeClass}">${actorSpan} ${verb}, "<em>${line}</em>"</p>`;
}

export function getFinalVictoryLine(winner, loser, lastMove) {
    const trigger = 'onVictory';
    let subTrigger = 'Default';

    if (lastMove?.moveTags.includes('Finisher')) subTrigger = 'Finisher';
    if (lastMove?.moveTags.includes('humiliation')) subTrigger = 'Humiliation';
    
    const pool = findNarrativePool(winner, trigger, subTrigger, { target: loser });
    
    if(pool) {
        return getRandomElement(pool).line.replace(/{target}/g, loser.name);
    }
    
    // Fallback to old quote system if new one isn't populated
    return winner.quotes.postWin[0];
}