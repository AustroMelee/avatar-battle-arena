// FILE: js/engine_narrative-engine.js
// FILE: engine_narrative-engine.js
'use strict';

// VERSION 6.0: Battle Phase Integration.
// - `generateTurnNarration` now accepts `currentPhaseKey` to fetch phase-specific intro phrases.
// - `phaseTemplates.header` is populated with dynamic phase display name and emoji.
// - `phaseTemplates.phaseWrapper` includes `data-phase` attribute.
// - Added support for `stalemateResult` in `phaseTemplates`.

import { phaseTemplates, impactPhrases, collateralImpactPhrases, introductoryPhrases, battlePhases as phaseDefinitions } from './narrative-v2.js';
import { locationConditions } from './location-battle-conditions.js';

const getRandomElement = (arr) => arr ? arr[Math.floor(Math.random() * arr.length)] : null;

function conjugatePresent(verbPhrase) {
    if (!verbPhrase) return '';
    const words = verbPhrase.split(' ');
    const verb = words[0];
    const rest = words.slice(1).join(' ');
    if (verb.endsWith('s') && !['erupt', 'lash', 'assume', 'control', 'focus'].includes(verb) ) return verbPhrase;
    const irregulars = { 'have': 'has', 'do': 'does', 'go': 'goes', 'be': 'is' };
    if (irregulars[verb]) {
        return rest ? `${irregulars[verb]} ${rest}` : irregulars[verb];
    }
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

function substituteTokens(template, actor, opponent, context = {}) {
    if (!template) return '';
    let text = template;
    const replacements = {
        '{actorName}': actor.name,
        '{opponentName}': opponent.name,
        '{targetName}': opponent.name,
        '{actor.s}': actor.pronouns.s,
        '{actor.p}': actor.pronouns.p,
        '{actor.o}': actor.pronouns.o,
        '{opponent.s}': opponent?.pronouns?.s || '',
        '{opponent.p}': opponent?.pronouns?.p || '',
        '{opponent.o}': opponent?.pronouns?.o || '',
        '{possessive}': actor.pronouns.p,
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

    // Phase-specific character narrative overrides
    const currentPhaseKey = context.currentPhaseKey || 'Generic'; // Fallback to Generic if phase not specified
    if (opponent.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger]?.[currentPhaseKey]) {
        pool = actor.relationships[opponent.id].narrative[trigger][subTrigger][currentPhaseKey];
    } else if (opponent.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger]?.Generic) {
        pool = actor.relationships[opponent.id].narrative[trigger][subTrigger].Generic; // Fallback to Generic relationship quote
    } else if (opponent.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger] && !Array.isArray(actor.relationships[opponent.id].narrative[trigger][subTrigger])) {
         // This is for older structure that doesn't have phase keys yet
        pool = actor.relationships[opponent.id].narrative[trigger][subTrigger]; // Use if it's a direct array (legacy)
    }
    // Character-specific narrative with phase
    else if (narrativeData[trigger]?.[subTrigger]?.[currentPhaseKey]) {
        pool = narrativeData[trigger][subTrigger][currentPhaseKey];
    } else if (narrativeData[trigger]?.[subTrigger]?.Generic) {
        pool = narrativeData[trigger][subTrigger].Generic; // Fallback to Generic character quote
    }
    // Move execution specific, checking for result as context, with phase
    else if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result]?.[currentPhaseKey]) {
        pool = narrativeData[trigger][subTrigger][context.result][currentPhaseKey];
    } else if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result]?.Generic) {
        pool = narrativeData[trigger][subTrigger][context.result].Generic; // Fallback for move exec
    } else if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result] && Array.isArray(narrativeData[trigger]?.[subTrigger]?.[context.result])) {
        pool = narrativeData[trigger][subTrigger][context.result]; // Legacy move exec
    }
    // General sub-trigger (e.g., onIntentSelection: CapitalizeOnOpening)
    else if (narrativeData[trigger]?.[subTrigger] && Array.isArray(narrativeData[trigger]?.[subTrigger])) { // Legacy general sub-trigger
        pool = narrativeData[trigger][subTrigger];
    }
    // Fallback to general trigger if available (e.g., battleStart: general)
    else if (narrativeData[trigger]?.general?.[currentPhaseKey]) {
        pool = narrativeData[trigger].general[currentPhaseKey];
    } else if (narrativeData[trigger]?.general?.Generic) {
        pool = narrativeData[trigger].general.Generic;
    } else if (narrativeData[trigger]?.general && Array.isArray(narrativeData[trigger]?.general)) {
        pool = narrativeData[trigger].general; // Legacy general trigger
    }
    // Special handling for collateral impact
    else if (trigger === 'onCollateral' && subTrigger === 'general' && context.impactText) {
        return { type: 'environmental', line: context.impactText };
    }

    return pool ? getRandomElement(pool) : null;
}


function renderQuote(quote, actor, opponent, context) {
    if (!quote || !quote.line) return '';
    const { type, line } = quote;
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const narrativeClass = `narrative-${type || 'spoken'}`;
    const verb = type === 'internal' ? 'thinks' : (type === 'action' ? '' : 'says'); // action type has no verb "says/thinks"
    
    const formattedLine = substituteTokens(line, actor, opponent, context);
    
    if (type === 'environmental') {
        return formattedLine; 
    }
    if (type === 'action') {
        return `<p class="${narrativeClass}">${actorSpan} ${formattedLine}</p>`;
    }

    return `<p class="${narrativeClass}">${actorSpan} ${verb}, "<em>${formattedLine}</em>"</p>`;
}

// MODIFIED: Added currentPhaseKey to generateActionDescription
function generateActionDescription(move, actor, opponent, result, currentPhaseKey) {
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const opponentSpan = `<span class="char-${opponent.id}">${opponent.name}</span>`;
    let introPhrase = '';
    let tacticalPrefix = '';
    let tacticalSuffix = '';

    // Get phase-specific intro phrase or fallback to generic
    const phaseSpecificIntroPool = introductoryPhrases[currentPhaseKey] || introductoryPhrases.Generic;
    introPhrase = getRandomElement(phaseSpecificIntroPool) || "Responding,"; // Ensure fallback

    if (result.payoff && result.consumedStateName) {
        tacticalPrefix = `Capitalizing on ${opponentSpan} being ${result.consumedStateName}, `;
    }
    
    if (actor.tacticalState && actor.tacticalState.name && actor.tacticalState.duration >= 0 && actor.tacticalState.isPositive) {
        tacticalSuffix += ` ${actorSpan} is now ${actor.tacticalState.name}!`;
    } else if (actor.tacticalState && actor.tacticalState.name && actor.tacticalState.duration >= 0 && !actor.tacticalState.isPositive && move.isRepositionMove) {
        tacticalSuffix += ` However, ${actorSpan} is now ${actor.tacticalState.name}!`;
    } else if (move.setup && result.effectiveness.label !== 'Weak' && !move.isRepositionMove) {
        tacticalSuffix += ` The move leaves ${opponentSpan} ${move.setup.name}!`;
    }

    let impactSentence;
    if (move.isRepositionMove) {
        impactSentence = getRandomElement(impactPhrases.REPOSITION[result.effectiveness.label.toUpperCase()]);
    } else if (move.type === 'Defense' || move.type === 'Utility') {
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
    
    // Add introductory phrase to the beginning
    const fullDesc = substituteTokens(`${introPhrase} ${tacticalPrefix}${baseAction}. ${impactSentence}${tacticalSuffix}`, actor, opponent);
    return `<p class="move-description">${fullDesc}</p>`;
}

function generateCollateralDamageDescription(move, actor, opponent, environmentState, locationData) {
    if (!move.collateralImpact || move.collateralImpact === 'none' || environmentState.damageLevel === 0) {
        return '';
    }
    const impactLevel = move.collateralImpact.toUpperCase();
    const collateralPhrase = getRandomElement(collateralImpactPhrases[impactLevel]);
    if (collateralPhrase) {
        const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
        let description = `${actorSpan}'s attack impacts the surroundings: ${substituteTokens(collateralPhrase, actor, opponent)}`;
        const currentDamageThreshold = environmentState.damageLevel;
        let specificImpactPhrase = '';
        if (locationData && locationData.environmentalImpacts) {
            let selectedImpacts = [];
            if (currentDamageThreshold >= locationData.damageThresholds.catastrophic) {
                selectedImpacts = locationData.environmentalImpacts.catastrophic;
            } else if (currentDamageThreshold >= locationData.damageThresholds.severe) {
                selectedImpacts = locationData.environmentalImpacts.severe;
            } else if (currentDamageThreshold >= locationData.damageThresholds.moderate) {
                selectedImpacts = locationData.environmentalImpacts.moderate;
            } else if (currentDamageThreshold >= locationData.damageThresholds.minor) {
                selectedImpacts = locationData.environmentalImpacts.minor;
            }
            if (selectedImpacts.length > 0) {
                const uniqueImpact = getRandomElement(selectedImpacts.filter(imp => !environmentState.specificImpacts.has(imp)));
                if (uniqueImpact) {
                    specificImpactPhrase = ` ${substituteTokens(uniqueImpact, actor, opponent)}`;
                    environmentState.specificImpacts.add(uniqueImpact);
                }
            }
        }
        if (move.element && !['physical', 'utility', 'special'].includes(move.element)) {
            description += ` The ${move.element} energy ripples through the area.`;
        }
        return `<p class="collateral-damage-description">${description}${specificImpactPhrase}</p>`;
    }
    return '';
}

// MODIFIED: Added currentPhaseKey to generateTurnNarration
export function generateTurnNarration(events, move, actor, opponent, result, environmentState, locationData, currentPhaseKey) {
    let narrativeBlockContent = '';

    events.forEach(event => {
        narrativeBlockContent += renderQuote(event.quote, event.actor, opponent, { '{moveName}': move.name, currentPhaseKey });
    });

    const moveQuoteContext = { result: result.effectiveness.label, currentPhaseKey };
    const moveExecutionQuote = findNarrativeQuote(actor, opponent, 'onMoveExecution', move.name, moveQuoteContext);

    let mechanicalLog = phaseTemplates.move
        .replace(/{actorId}/g, actor.id)
        .replace(/{actorName}/g, actor.name)
        .replace(/{moveName}/g, move.name)
        .replace(/{moveEmoji}/g, '⚔️') // Emoji could be dynamic based on move type/element later
        .replace(/{effectivenessLabel}/g, result.effectiveness.label)
        .replace(/{effectivenessEmoji}/g, result.effectiveness.emoji);

    let actionDescription;
    if (moveExecutionQuote) {
        actionDescription = `<p class="move-description">${substituteTokens(moveExecutionQuote.line, actor, opponent, {currentPhaseKey})}</p>`;
    } else {
        // Pass currentPhaseKey to generateActionDescription
        actionDescription = generateActionDescription(move, actor, opponent, result, currentPhaseKey);
    }
    
    const collateralDamageDescription = generateCollateralDamageDescription(move, actor, opponent, environmentState, locationData);

    mechanicalLog = mechanicalLog.replace(/{moveDescription}/g, actionDescription);
    mechanicalLog = mechanicalLog.replace(/{collateralDamageDescription}/g, collateralDamageDescription);
    
    const narrativeWrapper = narrativeBlockContent ? `<div class="narrative-block">${narrativeBlockContent}</div>` : '';
    return narrativeWrapper + mechanicalLog;
}

export function getFinalVictoryLine(winner, loser) {
    const finalQuote = findNarrativeQuote(winner, loser, 'onVictory', 'Default', {}); // Phase doesn't really apply here.
    if (finalQuote) {
        return substituteTokens(finalQuote.line, winner, loser);
    }
    // Fallback to victoryStyle based phrase if specific quote not found
    const victoryPhrases = postBattleVictoryPhrases[winner.victoryStyle] || postBattleVictoryPhrases.default;
    const outcomeType = winner.hp > 50 ? 'dominant' : 'narrow'; // Example logic for dominant vs narrow
    let phrase = victoryPhrases[outcomeType] || victoryPhrases.dominant; // Default to dominant if narrow not defined
    
    return substituteTokens(phrase, winner, loser, {
        WinnerName: winner.name, 
        LoserName: loser.name,
        WinnerPronounS: winner.pronouns.s,
        WinnerPronounP: winner.pronouns.p,
        WinnerPronounO: winner.pronouns.o
    });
}