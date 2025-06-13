// FILE: engine/narrative-engine.js
'use strict';

// VERSION 4.1: HOTFIX.
// Exporting `findNarrativeQuote` to make it available to the core engine,
// resolving the ReferenceError and re-establishing a pure data pipeline.

import { phaseTemplates, impactPhrases } from '../narrative-v2.js';

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 1.2: Central Pronoun Substitution Utility
function substituteTokens(template, actor, opponent, context = {}) {
    if (!template) return '';
    let text = template;
    const replacements = {
        '{actorName}': actor.name,
        '{opponentName}': opponent.name,
        '{actor.s}': actor.pronouns.s,
        '{actor.p}': actor.pronouns.p,
        '{actor.o}': actor.pronouns.o,
        '{opponent.s}': opponent.pronouns.s,
        '{opponent.p}': opponent.pronouns.p,
        '{opponent.o}': opponent.pronouns.o,
        ...context // Add other dynamic context like move names
    };
    for (const [token, value] of Object.entries(replacements)) {
        text = text.replace(new RegExp(token, 'g'), value);
    }
    return text;
}

// === MODIFICATION START: `export` added ===
export function findNarrativeQuote(actor, opponent, trigger, subTrigger, context = {}) {
    const narrativeData = actor.narrative || {};
    let pool = null;
    if (opponent.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger]) {
        pool = actor.relationships[opponent.id].narrative[trigger][subTrigger];
    } else if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result]) {
        pool = narrativeData[trigger][subTrigger][context.result];
    } else if (narrativeData[trigger]?.[subTrigger]) {
        pool = narrativeData[trigger][subTrigger];
    } else if (narrativeData[trigger]?.general) {
        pool = narrativeData[trigger].general;
    }
    return pool ? getRandomElement(pool) : null;
}
// === MODIFICATION END ===

function renderQuote(quote, actor, opponent, context) {
    if (!quote) return '';
    const { type, line } = quote;
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const narrativeClass = `narrative-${type || 'spoken'}`;
    const verb = type === 'internal' ? 'thinks' : 'says';
    const formattedLine = substituteTokens(line, actor, opponent, context);
    return `<p class="${narrativeClass}">${actorSpan} ${verb}, "<em>${formattedLine}</em>"</p>`;
}

// 3.1: Move Description Collapsing (Integrated into single function)
function generateActionDescription(move, actor, opponent, result) {
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const opponentSpan = `<span class="char-${opponent.id}">${opponent.name}</span>`;
    let tacticalPrefix = '';
    let tacticalSuffix = '';

    if (result.payoff && result.consumedStateName) {
        tacticalPrefix = `Capitalizing on ${opponentSpan} being ${result.consumedStateName}, `;
    }
    if (move.setup && result.effectiveness.label !== 'Weak') {
        tacticalSuffix = ` The move leaves ${opponentSpan} ${move.setup.name}!`;
    }

    // This block is the prose from the old `narration.js`
    let impactSentence;
    if (move.type === 'Defense' || move.type === 'Utility') {
        const isReactive = opponent.lastMove?.type === 'Offense';
        impactSentence = getRandomElement(isReactive ? impactPhrases.DEFENSE.REACTIVE : impactPhrases.DEFENSE.PROACTIVE);
    } else {
        impactSentence = getRandomElement(impactPhrases.DEFAULT[result.effectiveness.label.toUpperCase()]);
    }

    const verb = move.verb || 'executes';
    const object = move.requiresArticle ? `a ${move.object}` : move.object;
    const baseAction = `${actor.pronouns.s} ${verb} ${object}`;

    const fullDesc = substituteTokens(`${tacticalPrefix}${actorSpan} ${baseAction}. ${impactSentence}${tacticalSuffix}`, actor, opponent);
    return `<p class="move-description">${fullDesc}</p>`;
}

// PRIMARY EXPORTED FUNCTION
export function generateTurnNarration(events, move, actor, opponent, result) {
    let narrativeBlockContent = '';

    // Render all pre-action narrative events (dialogue, thoughts)
    events.forEach(event => {
        narrativeBlockContent += renderQuote(event.quote, event.actor, opponent, { '{moveName}': move.name });
    });

    // 3.1: Decide whether to use narrative or mechanical description
    // Check for a specific `onMoveExecution` quote
    const moveQuoteContext = { result: result.effectiveness.label };
    const moveExecutionQuote = findNarrativeQuote(actor, opponent, 'onMoveExecution', move.name, moveQuoteContext);

    let mechanicalLog = phaseTemplates.move
        .replace(/{actorId}/g, actor.id)
        .replace(/{actorName}/g, actor.name)
        .replace(/{moveName}/g, move.name)
        .replace(/{moveEmoji}/g, '⚔️')
        .replace(/{effectivenessLabel}/g, result.effectiveness.label)
        .replace(/{effectivenessEmoji}/g, result.effectiveness.emoji);

    let actionDescription;
    if (moveExecutionQuote) {
        // Use the specific character quote for the action
        actionDescription = `<p class="move-description">${substituteTokens(moveExecutionQuote.line, actor, opponent)}</p>`;
    } else {
        // Fallback to the generic action description generator
        actionDescription = generateActionDescription(move, actor, opponent, result);
    }
    
    // Combine the mechanical log and the (narrative or generic) action description
    mechanicalLog = mechanicalLog.replace(/{moveDescription}/g, actionDescription);
    
    // Assemble the final HTML block
    const narrativeWrapper = narrativeBlockContent ? `<div class="narrative-block">${narrativeBlockContent}</div>` : '';
    return narrativeWrapper + mechanicalLog;
}

// This function remains for end-of-battle quotes
export function getFinalVictoryLine(winner, loser) {
    const finalQuote = findNarrativeQuote(winner, loser, 'onVictory', 'Default', {});
    if (finalQuote) {
        return substituteTokens(finalQuote.line, winner, loser);
    }
    // Hard fallback if narrative object is malformed
    return "The battle is won.";
}