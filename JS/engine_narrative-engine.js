// FILE: js/engine_narrative-engine.js
'use strict';

// VERSION 6.2: Enhanced KO Narration
// - `generateActionDescriptionObject` now appends a KO confirmation to the move's `text`
//   if the move results in the opponent's HP dropping to 0 or below.

import { phaseTemplates, impactPhrases, collateralImpactPhrases, introductoryPhrases, battlePhases as phaseDefinitions, finishingBlowPhrases } from './narrative-v2.js'; // Added finishingBlowPhrases
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
        '{actorName}': actor?.name || 'Someone', 
        '{opponentName}': opponent?.name || 'Someone else',
        '{targetName}': opponent?.name || 'Someone else',
        '{actor.s}': actor?.pronouns?.s || 'they',
        '{actor.p}': actor?.pronouns?.p || 'their',
        '{actor.o}': actor?.pronouns?.o || 'them',
        '{opponent.s}': opponent?.pronouns?.s || 'they',
        '{opponent.p}': opponent?.pronouns?.p || 'their',
        '{opponent.o}': opponent?.pronouns?.o || 'them',
        '{possessive}': actor?.pronouns?.p || 'their',
        ...context
    };
    for (const [token, value] of Object.entries(replacements)) {
        text = text.replace(new RegExp(token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), String(value));
    }
    return text;
 }

export function findNarrativeQuote(actor, opponent, trigger, subTrigger, context = {}) {
    const narrativeData = actor.narrative || {};
    let pool = null;
    const currentPhaseKey = context.currentPhaseKey || 'Generic';

    if (opponent?.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger]?.[currentPhaseKey]) {
        pool = actor.relationships[opponent.id].narrative[trigger][subTrigger][currentPhaseKey];
    } else if (opponent?.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger]?.Generic) {
        pool = actor.relationships[opponent.id].narrative[trigger][subTrigger].Generic;
    } else if (opponent?.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger] && Array.isArray(actor.relationships[opponent.id].narrative[trigger][subTrigger])) {
        pool = actor.relationships[opponent.id].narrative[trigger][subTrigger];
    } else if (narrativeData[trigger]?.[subTrigger]?.[currentPhaseKey]) {
        pool = narrativeData[trigger][subTrigger][currentPhaseKey];
    } else if (narrativeData[trigger]?.[subTrigger]?.Generic) {
        pool = narrativeData[trigger][subTrigger].Generic;
    } else if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result]?.[currentPhaseKey]) {
        pool = narrativeData[trigger][subTrigger][context.result][currentPhaseKey];
    } else if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result]?.Generic) {
        pool = narrativeData[trigger][subTrigger][context.result].Generic;
    } else if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result] && Array.isArray(narrativeData[trigger]?.[subTrigger]?.[context.result])) {
        pool = narrativeData[trigger][subTrigger][context.result];
    } else if (narrativeData[trigger]?.[subTrigger] && Array.isArray(narrativeData[trigger]?.[subTrigger])) {
        pool = narrativeData[trigger][subTrigger];
    } else if (narrativeData[trigger]?.general?.[currentPhaseKey]) {
        pool = narrativeData[trigger].general[currentPhaseKey];
    } else if (narrativeData[trigger]?.general?.Generic) {
        pool = narrativeData[trigger].general.Generic;
    } else if (narrativeData[trigger]?.general && Array.isArray(narrativeData[trigger]?.general)) {
        pool = narrativeData[trigger].general;
    } else if (trigger === 'onCollateral' && subTrigger === 'general' && context.impactText) {
        return { type: 'environmental', line: context.impactText };
    }
    return pool ? getRandomElement(pool) : null;
}

function formatQuoteToStructuredEvent(quoteObj, actor, opponent, context) {
    if (!quoteObj || !quoteObj.line) return null;
    const { type, line } = quoteObj; 
    const characterName = actor?.name || 'Narrator'; 
    const textContent = substituteTokens(line, actor, opponent, context);
    
    let htmlClassType = `narrative-${type || 'general'}`;
    let htmlContent;

    if (type === 'environmental') { 
        htmlContent = textContent;
    } else if (type === 'action') {
        htmlContent = `<p class="${htmlClassType}">${substituteTokens(actor.name, actor, opponent)} ${textContent}</p>`;
    } else { 
        htmlContent = `<p class="${htmlClassType}">${substituteTokens(actor.name, actor, opponent)} ${type === 'internal' ? 'thinks' : 'says'}, "<em>${textContent}</em>"</p>`;
    }

    return {
        type: 'dialogue_event', 
        actorId: actor?.id || null,
        characterName: characterName,
        text: textContent,
        isDialogue: (type === 'spoken' || type === 'internal'),
        isActionNarrative: (type === 'action'),
        dialogueType: type, 
        html_content: `<div class="narrative-block">${htmlContent}</div>` 
    };
}

function generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey) {
    let introPhrase = '';
    let tacticalPrefix = '';
    let tacticalSuffix = '';

    const phaseSpecificIntroPool = introductoryPhrases[currentPhaseKey] || introductoryPhrases.Generic;
    introPhrase = getRandomElement(phaseSpecificIntroPool) || "Responding,";

    if (result.payoff && result.consumedStateName) {
        tacticalPrefix = `Capitalizing on ${opponent.name} being ${result.consumedStateName}, `;
    }
    
    if (actor.tacticalState && actor.tacticalState.name && actor.tacticalState.duration >= 0 && actor.tacticalState.isPositive) {
        tacticalSuffix += ` ${actor.name} is now ${actor.tacticalState.name}!`;
    } else if (actor.tacticalState && actor.tacticalState.name && actor.tacticalState.duration >= 0 && !actor.tacticalState.isPositive && move.isRepositionMove) {
        tacticalSuffix += ` However, ${actor.name} is now ${actor.tacticalState.name}!`;
    } else if (move.setup && result.effectiveness.label !== 'Weak' && !move.isRepositionMove) {
        tacticalSuffix += ` The move leaves ${opponent.name} ${move.setup.name}!`;
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

    let baseActionText;
    if (move.name === "Struggle") {
        baseActionText = `${actor.name} struggles to fight back`;
    } else {
        const verb = conjugatePresent(move.verb || 'executes');
        const object = move.requiresArticle ? (['a','e','i','o','u'].includes(move.object[0].toLowerCase()) ? `an ${move.object}` : `a ${move.object}`) : move.object;
        baseActionText = `${actor.name} ${verb} ${object}`;
    }
    
    let fullDescText = substituteTokens(`${introPhrase} ${tacticalPrefix}${baseActionText}. ${impactSentence}${tacticalSuffix}`, actor, opponent);

    // NEW: Append KO confirmation if this move defeated the opponent
    if (opponent.hp - result.damage <= 0 && result.damage > 0 && (move.type === 'Offense' || move.type === 'Finisher')) {
        const koPhrase = getRandomElement(finishingBlowPhrases) || "{targetName} is defeated!";
        fullDescText += ` ${substituteTokens(koPhrase, actor, opponent)}`;
    }
    
    const moveLineHtml = phaseTemplates.move
        .replace(/{actorId}/g, actor.id)
        .replace(/{actorName}/g, actor.name)
        .replace(/{moveName}/g, move.name)
        .replace(/{moveEmoji}/g, '⚔️')
        .replace(/{effectivenessLabel}/g, result.effectiveness.label)
        .replace(/{effectivenessEmoji}/g, result.effectiveness.emoji)
        .replace(/{moveDescription}/g, `<p class="move-description">${fullDescText}</p>`) 
        .replace(/{collateralDamageDescription}/g, ''); 

    return {
        type: 'move_action_event',
        actorId: actor.id,
        characterName: actor.name,
        moveName: move.name,
        moveType: move.element || move.type, 
        effectivenessLabel: result.effectiveness.label,
        text: fullDescText, 
        isMoveAction: true,
        html_content: moveLineHtml 
    };
}

function generateCollateralDamageEvent(move, actor, opponent, environmentState, locationData) {
    if (!move.collateralImpact || move.collateralImpact === 'none' || environmentState.damageLevel === 0) {
        return null;
    }
    const impactLevel = move.collateralImpact.toUpperCase(); 
    const collateralPhrase = getRandomElement(collateralImpactPhrases[impactLevel]);
    if (!collateralPhrase) return null;

    let descriptionText = `${actor.name}'s attack impacts the surroundings: ${substituteTokens(collateralPhrase, actor, opponent)}`;
    let specificImpactText = ''; 

    if (locationData && locationData.environmentalImpacts) {
        const currentDamageThreshold = environmentState.damageLevel;
        let selectedImpactsPool = [];
        if (currentDamageThreshold >= locationData.damageThresholds.catastrophic) selectedImpactsPool = locationData.environmentalImpacts.catastrophic;
        else if (currentDamageThreshold >= locationData.damageThresholds.severe) selectedImpactsPool = locationData.environmentalImpacts.severe;
        else if (currentDamageThreshold >= locationData.damageThresholds.moderate) selectedImpactsPool = locationData.environmentalImpacts.moderate;
        else if (currentDamageThreshold >= locationData.damageThresholds.minor) selectedImpactsPool = locationData.environmentalImpacts.minor;

        if (selectedImpactsPool.length > 0) {
            const uniqueImpact = getRandomElement(selectedImpactsPool.filter(imp => !environmentState.specificImpacts.has(imp)));
            if (uniqueImpact) {
                specificImpactText = ` ${substituteTokens(uniqueImpact, actor, opponent)}`;
                environmentState.specificImpacts.add(uniqueImpact); 
            }
        }
    }
     if (move.element && !['physical', 'utility', 'special'].includes(move.element)) {
        descriptionText += ` The ${move.element} energy ripples through the area.`;
    }
    const fullCollateralText = `${descriptionText}${specificImpactText}`.trim();
    const collateralHtml = `<p class="collateral-damage-description">${fullCollateralText}</p>`;

    return {
        type: 'collateral_damage_event',
        actorId: actor.id, 
        text: fullCollateralText,
        isEnvironmental: true,
        html_content: collateralHtml 
    };
}

export function generateTurnNarrationObjects(narrativeEvents, move, actor, opponent, result, environmentState, locationData, currentPhaseKey, isInitialBanter = false) {
    let turnEventObjects = [];

    narrativeEvents.forEach(event => {
        const quoteEvent = formatQuoteToStructuredEvent(event.quote, event.actor, opponent, { '{moveName}': move?.name, currentPhaseKey });
        if (quoteEvent) {
            turnEventObjects.push(quoteEvent);
        }
    });
    
    if (!isInitialBanter && move && result) {
        const moveQuoteContext = { result: result.effectiveness.label, currentPhaseKey };
        const moveExecutionQuote = findNarrativeQuote(actor, opponent, 'onMoveExecution', move.name, moveQuoteContext);
        if (moveExecutionQuote) {
            const quoteEvent = formatQuoteToStructuredEvent(moveExecutionQuote, actor, opponent, {currentPhaseKey});
            if(quoteEvent) turnEventObjects.push(quoteEvent);
        }

        const actionEvent = generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey);
        turnEventObjects.push(actionEvent);

        const collateralEvent = generateCollateralDamageEvent(move, actor, opponent, environmentState, locationData);
        if (collateralEvent) {
            const lastActionEvent = turnEventObjects.find(e => e.type === 'move_action_event' && e.html_content);
            if(lastActionEvent) {
                lastActionEvent.html_content = lastActionEvent.html_content.replace(/{collateralDamageDescription}/g, collateralEvent.html_content);
            }
            turnEventObjects.push(collateralEvent); 
        } else {
            const lastActionEvent = turnEventObjects.find(e => e.type === 'move_action_event' && e.html_content);
            if(lastActionEvent) {
                lastActionEvent.html_content = lastActionEvent.html_content.replace(/{collateralDamageDescription}/g, '');
            }
        }
    }
    return turnEventObjects;
}

export function getFinalVictoryLine(winner, loser) { 
    if (!winner) return "The battle ends."; 

    const finalQuote = findNarrativeQuote(winner, loser, 'onVictory', 'Default', {});
    if (finalQuote && finalQuote.line) {
        return substituteTokens(finalQuote.line, winner, loser);
    }
    const victoryPhrases = postBattleVictoryPhrases[winner.victoryStyle] || postBattleVictoryPhrases.default;
    const outcomeType = winner.hp > 50 ? 'dominant' : 'narrow';
    let phrase = victoryPhrases[outcomeType] || victoryPhrases.dominant; 
    
    return substituteTokens(phrase, winner, loser, {
        WinnerName: winner.name, 
        LoserName: loser?.name || "the opponent", 
        WinnerPronounS: winner.pronouns?.s || 'they',
        WinnerPronounP: winner.pronouns?.p || 'their',
        WinnerPronounO: winner.pronouns?.o || 'them'
    });
}