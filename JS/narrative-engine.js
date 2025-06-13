'use strict';

// VERSION 5.1: FINAL OVERKILL PATCH.
// - Implemented a compound verb-aware conjugator to fix "erupt withs" bug.
// - Added legacy {possessive} token support to the substitution map for full redundancy.
// - The root cause of the {possessive} leak in narrative-v2.js is also fixed.

import { phaseTemplates, impactPhrases } from './narrative-v2.js';

const getRandomElement = (arr) => arr ? arr[Math.floor(Math.random() * arr.length)] : null;

// 1: Patched verb conjugator for compound verbs.
function conjugatePresent(verbPhrase) {
    if (!verbPhrase) return '';
    const words = verbPhrase.split(' ');
    const verb = words[0];
    const rest = words.slice(1).join(' ');
    
    // This handles the base case of an already-conjugated verb (e.g., from a quote)
    if (verb.endsWith('s')) return verbPhrase;

    // Irregular verbs map
    const irregulars = { 'have': 'has', 'do': 'does', 'go': 'goes', 'be': 'is' };
    if (irregulars[verb]) {
        return rest ? `${irregulars[verb]} ${rest}` : irregulars[verb];
    }

    // Regular verbs
    let conjugatedVerb;
    if (/(ss|sh|ch|x|z|o)$/.test(verb)) {
        conjugatedVerb = verb + 'es';
    } else if (/[^aeiou]y$/.test(verb)) {
        conjugatedVerb = verb.slice(0, -1) + 'ies';
    } else {
        conjugatedVerb = verb + 's';
    }
    
    return rest ? `${conjugatedVerb} ${rest}` : conjugatedVerb;
}

// 2: Patched token substitution map.
function substituteTokens(template, actor, opponent, context = {}) {
    if (!template) return '';
    let text = template;
    const replacements = {
        '{actorName}': actor.name,
        '{opponentName}': opponent.name,
        '{targetName}': opponent.name,
        '{possessive}': actor.pronouns.p, // Legacy template fix
        '{actor.s}': actor.pronouns.s,
        '{actor.p}': actor.pronouns.p,
        '{actor.o}': actor.pronouns.o,
        '{opponent.s}': opponent.pronouns.s,
        '{opponent.p}': opponent.pronouns.p,
        '{opponent.o}': opponent.pronouns.o,
        ...context
    };
    for (const [token, value] of Object.entries(replacements)) {
        text = text.replace(new RegExp(token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), value);
    }
    return text;
}

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

function renderQuote(quote, actor, opponent, context) {
    if (!quote) return '';
    const { type, line } = quote;
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const narrativeClass = `narrative-${type || 'spoken'}`;
    const verb = type === 'internal' ? 'thinks' : 'says';
    const formattedLine = substituteTokens(line, actor, opponent, context);
    return `<p class="${narrativeClass}">${actorSpan} ${verb}, "<em>${formattedLine}</em>"</p>`;
}

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

    let impactSentence;
    if (move.type === 'Defense' || move.type === 'Utility') {
        const isReactive = opponent.lastMove?.type === 'Offense';
        impactSentence = getRandomElement(isReactive ? impactPhrases.DEFENSE.REACTIVE : impactPhrases.DEFENSE.PROACTIVE);
    } else {
        impactSentence = getRandomElement(impactPhrases.DEFAULT[result.effectiveness.label.toUpperCase()]);
    }

    let baseAction;
    if (move.name === "Struggle") {
        baseAction = `${actor.name} struggles to fight back`;
    } else {
        const verb = conjugatePresent(move.verb || 'executes');
        const object = move.requiresArticle ? (['a','e','i','o','u'].includes(move.object[0].toLowerCase()) ? `an ${move.object}` : `a ${move.object}`) : move.object;
        baseAction = `${actor.name} ${verb} ${object}`;
    }

    const fullDesc = substituteTokens(`${tacticalPrefix}${baseAction}. ${impactSentence}${tacticalSuffix}`, actor, opponent);
    return `<p class="move-description">${fullDesc}</p>`;
}

export function generateTurnNarration(events, move, actor, opponent, result) {
    let narrativeBlockContent = '';

    events.forEach(event => {
        narrativeBlockContent += renderQuote(event.quote, event.actor, opponent, { '{moveName}': move.name });
    });

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
        actionDescription = `<p class="move-description">${substituteTokens(moveExecutionQuote.line, actor, opponent)}</p>`;
    } else {
        actionDescription = generateActionDescription(move, actor, opponent, result);
    }
    
    mechanicalLog = mechanicalLog.replace(/{moveDescription}/g, actionDescription);
    
    const narrativeWrapper = narrativeBlockContent ? `<div class="narrative-block">${narrativeBlockContent}</div>` : '';
    return narrativeWrapper + mechanicalLog;
}

export function getFinalVictoryLine(winner, loser) {
    const finalQuote = findNarrativeQuote(winner, loser, 'onVictory', 'Default', {});
    if (finalQuote) {
        return substituteTokens(finalQuote.line, winner, loser);
    }
    return "The battle is won.";
}