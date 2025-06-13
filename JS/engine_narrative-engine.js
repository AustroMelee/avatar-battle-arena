// FILE: engine_narrative-engine.js
// FILE: engine_narrative-engine.js
'use strict';

// VERSION 5.1: FINAL OVERKILL PATCH.
// - Implemented a compound verb-aware conjugator to fix "erupt withs" bug.
// - Added legacy {possessive} token support to the substitution map for full redundancy.
// - The root cause of the {possessive} leak in narrative-v2.js is also fixed.

import { phaseTemplates, impactPhrases, collateralImpactPhrases } from './narrative-v2.js'; // Added collateralImpactPhrases
import { locationConditions } from './location-battle-conditions.js'; // Added locationConditions

const getRandomElement = (arr) => arr ? arr[Math.floor(Math.random() * arr.length)] : null;

// 1: Patched verb conjugator for compound verbs.
function conjugatePresent(verbPhrase) {
    if (!verbPhrase) return '';
    const words = verbPhrase.split(' ');
    const verb = words[0];
    const rest = words.slice(1).join(' ');
    
    // This handles the base case of an already-conjugated verb (e.g., from a quote)
    if (verb.endsWith('s') && !['erupt', 'lash', 'assume', 'control'].includes(verb) ) return verbPhrase; // Allow specific verbs to be conjugated

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
        '{actor.s}': actor.pronouns.s,
        '{actor.p}': actor.pronouns.p,
        '{actor.o}': actor.pronouns.o,
        // Ensure opponent properties are safely accessed
        '{opponent.s}': opponent?.pronouns?.s || '',
        '{opponent.p}': opponent?.pronouns?.p || '',
        '{opponent.o}': opponent?.pronouns?.o || '',
        '{possessive}': actor.pronouns.p, // Legacy support for {possessive}
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

    // Relationship-specific narrative first
    if (opponent.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger]) {
        pool = actor.relationships[opponent.id].narrative[trigger][subTrigger];
    } 
    // Move execution specific, checking for result as context
    else if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result]) {
        pool = narrativeData[trigger][subTrigger][context.result];
    } 
    // General sub-trigger (e.g., onIntentSelection: CapitalizeOnOpening)
    else if (narrativeData[trigger]?.[subTrigger]) {
        pool = narrativeData[trigger][subTrigger];
    } 
    // Fallback to general if available (e.g., battleStart: general)
    else if (narrativeData[trigger]?.general) {
        pool = narrativeData[trigger].general;
    } else if (trigger === 'onCollateral' && subTrigger === 'general' && context.impactText) {
        // Special handling for general environmental impact messages
        return { type: 'environmental', line: context.impactText };
    }


    // Return a random quote from the selected pool
    return pool ? getRandomElement(pool) : null;
}

function renderQuote(quote, actor, opponent, context) {
    if (!quote || !quote.line) return '';
    const { type, line } = quote;
    const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
    const narrativeClass = `narrative-${type || 'spoken'}`;
    const verb = type === 'internal' ? 'thinks' : 'says';
    const formattedLine = substituteTokens(line, actor, opponent, context);
    
    // For environmental impacts, don't attribute to an actor
    if (type === 'environmental') {
        return formattedLine; // It's already the full phrase
    }

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
    
    // Check if the move itself created a tactical state for the ACTOR
    if (actor.tacticalState && actor.tacticalState.name && actor.tacticalState.duration > 0 && actor.tacticalState.isPositive) {
        // If the actor's *own* move resulted in a positive tactical state
        tacticalSuffix += ` ${actorSpan} is now ${actor.tacticalState.name}!`;
    } else if (actor.tacticalState && actor.tacticalState.name && actor.tacticalState.duration > 0 && !actor.tacticalState.isPositive && move.isRepositionMove) {
        // If the actor's *own* reposition move resulted in a negative tactical state (failure)
        tacticalSuffix += ` However, ${actorSpan} is now ${actor.tacticalState.name}!`;
    } else if (move.setup && result.effectiveness.label !== 'Weak' && !move.isRepositionMove) {
        // If the move set up a state for the OPPONENT
        tacticalSuffix += ` The move leaves ${opponentSpan} ${move.setup.name}!`;
    }


    let impactSentence;
    // Special impact phrases for Reposition Move
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

    const fullDesc = substituteTokens(`${tacticalPrefix}${baseAction}. ${impactSentence}${tacticalSuffix}`, actor, opponent);
    return `<p class="move-description">${fullDesc}</p>`;
}

// NEW FUNCTION: Generate collateral damage description
function generateCollateralDamageDescription(move, actor, opponent, environmentState, locationData) {
    if (!move.collateralImpact || move.collateralImpact === 'none' || environmentState.damageLevel === 0) {
        return '';
    }

    const impactLevel = move.collateralImpact.toUpperCase(); // e.g., 'LOW', 'MEDIUM', 'HIGH'
    const collateralPhrase = getRandomElement(collateralImpactPhrases[impactLevel]);

    if (collateralPhrase) {
        const actorSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
        // Use generic collateral phrase
        let description = `${actorSpan}'s attack impacts the surroundings: ${substituteTokens(collateralPhrase, actor, opponent)}`; // Pass opponent
        
        // Add location-specific impact description based on overall damage level, if applicable
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
                // Ensure unique impact descriptions for current turn, if applicable
                const uniqueImpact = getRandomElement(selectedImpacts.filter(imp => !environmentState.specificImpacts.has(imp)));
                if (uniqueImpact) {
                    specificImpactPhrase = ` ${substituteTokens(uniqueImpact, actor, opponent)}`; // Pass opponent
                    environmentState.specificImpacts.add(uniqueImpact); // Mark as used for this turn
                }
            }
        }
        
        // If the move itself has an element, add elemental flair to the collateral description
        if (move.element && move.element !== 'physical' && move.element !== 'utility' && move.element !== 'special') {
            description += ` The ${move.element} energy ripples through the area.`;
        }

        // Combine generic and specific impact
        return `<p class="collateral-damage-description">${description}${specificImpactPhrase}</p>`;
    }
    return '';
}


export function generateTurnNarration(events, move, actor, opponent, result, environmentState, locationData) {
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
    
    // NEW: Generate collateral damage description, passing opponent
    const collateralDamageDescription = generateCollateralDamageDescription(move, actor, opponent, environmentState, locationData);

    mechanicalLog = mechanicalLog.replace(/{moveDescription}/g, actionDescription);
    mechanicalLog = mechanicalLog.replace(/{collateralDamageDescription}/g, collateralDamageDescription); // Insert collateral description
    
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