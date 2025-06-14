// FILE: js/engine_narrative-engine.js
'use strict';

// Version 3.3.2: Fix ReferenceError in formatQuoteToStructuredEvent & General Null Safety Clean-up

import { phaseTemplates, impactPhrases, collateralImpactPhrases, introductoryPhrases, battlePhases as phaseDefinitions, finishingBlowPhrases } from './narrative-v2.js';
import { locationConditions } from './location-battle-conditions.js';

const DEFAULT_PRONOUNS = { s: 'they', p: 'their', o: 'them' };
const MINIMAL_ACTOR_FALLBACK = { name: 'Narrator', pronouns: DEFAULT_PRONOUNS, id: 'narrator' }; // Used if actor is truly null

const getRandomElement = (arr) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
        return null;
    }
    return arr[Math.floor(Math.random() * arr.length)];
};

function conjugatePresent(verbPhrase) {
    if (!verbPhrase || typeof verbPhrase !== 'string') {
        return '';
    }
    const words = verbPhrase.split(' ');
    const verb = words[0];
    const rest = words.slice(1).join(' ');
    if (verb.endsWith('s') && !['erupt', 'lash', 'assume', 'control', 'focus'].includes(verb)) return verbPhrase;
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
    if (typeof template !== 'string') {
        return '';
    }
    let text = template;
    // Ensure actor and opponent are at least minimal objects for safe property access
    // If actor/opponent is null, MINIMAL_ACTOR_FALLBACK provides default name/pronouns
    const currentActor = actor || MINIMAL_ACTOR_FALLBACK;
    const currentOpponent = opponent || MINIMAL_ACTOR_FALLBACK;

    const actorName = currentActor.name || 'Someone'; // Fallback if name somehow missing from currentActor
    const opponentName = currentOpponent.name || 'Someone else';
    const actorPronouns = currentActor.pronouns || DEFAULT_PRONOUNS;
    const opponentPronouns = currentOpponent.pronouns || DEFAULT_PRONOUNS;

    const replacements = {
        '{actorName}': actorName,
        '{opponentName}': opponentName,
        '{targetName}': opponentName, // targetName is often the opponent
        '{actor.s}': actorPronouns.s,
        '{actor.p}': actorPronouns.p,
        '{actor.o}': actorPronouns.o,
        '{opponent.s}': opponentPronouns.s,
        '{opponent.p}': opponentPronouns.p,
        '{opponent.o}': opponentPronouns.o,
        '{possessive}': actorPronouns.p, // Usually actor's possessive
        ...context
    };
    for (const [token, value] of Object.entries(replacements)) {
        const replacementValue = (value === null || value === undefined) ? '' : String(value);
        text = text.replace(new RegExp(token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replacementValue);
    }
    return text;
}

export function findNarrativeQuote(actor, opponent, trigger, subTrigger, context = {}) {
    // If actor is null (e.g. for purely environmental effects not tied to a specific character),
    // we use MINIMAL_ACTOR_FALLBACK to prevent errors when accessing actor.narrative or actor.relationships.
    // However, environmental quotes should ideally be handled differently or have specific narrator structures.
    const currentActor = actor || MINIMAL_ACTOR_FALLBACK;

    const narrativeData = currentActor.narrative || {};
    let pool = null;
    const currentPhaseKey = context?.currentPhaseKey || 'Generic';
    const opponentId = opponent?.id;

    const getPath = (obj, pathArray) => pathArray.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);

    // Try most specific paths first
    pool = pool || getPath(currentActor.relationships, [opponentId, 'narrative', trigger, subTrigger, currentPhaseKey]);
    pool = pool || getPath(currentActor.relationships, [opponentId, 'narrative', trigger, subTrigger, 'Generic']);
    const relBase = getPath(currentActor.relationships, [opponentId, 'narrative', trigger, subTrigger]);
    if (!pool && Array.isArray(relBase)) pool = relBase;

    pool = pool || getPath(narrativeData, [trigger, subTrigger, currentPhaseKey]);
    pool = pool || getPath(narrativeData, [trigger, subTrigger, 'Generic']);

    if (trigger === 'onMoveExecution' && context?.result) {
        pool = pool || getPath(narrativeData, [trigger, subTrigger, context.result, currentPhaseKey]);
        pool = pool || getPath(narrativeData, [trigger, subTrigger, context.result, 'Generic']);
        const moveExecBase = getPath(narrativeData, [trigger, subTrigger, context.result]);
        if (!pool && Array.isArray(moveExecBase)) pool = moveExecBase;
    }
    
    const generalBase = getPath(narrativeData, [trigger, subTrigger]);
    if (!pool && Array.isArray(generalBase)) pool = generalBase;

    pool = pool || getPath(narrativeData, [trigger, 'general', currentPhaseKey]);
    pool = pool || getPath(narrativeData, [trigger, 'general', 'Generic']);
    const triggerGeneralBase = getPath(narrativeData, [trigger, 'general']);
    if (!pool && Array.isArray(triggerGeneralBase)) pool = triggerGeneralBase;
    
    if (trigger === 'onCollateral' && subTrigger === 'general' && context?.impactText) {
        return { type: 'environmental', line: context.impactText };
    }
    
    return (pool && Array.isArray(pool)) ? getRandomElement(pool) : null;
}

function formatQuoteToStructuredEvent(quoteObj, actor, opponent, context) {
    if (!quoteObj || typeof quoteObj.line !== 'string') {
        return null;
    }
    const { type, line } = quoteObj;
    
    // Ensure actor is an object for substituteTokens, even if it's just the fallback.
    // characterName will be 'Narrator' if actor is null/undefined.
    const currentActor = actor || MINIMAL_ACTOR_FALLBACK;
    const characterName = currentActor.name;

    // The line template itself should contain tokens like {actorName}
    // substituteTokens will handle replacing them based on currentActor
    const textContent = substituteTokens(line, currentActor, opponent, context);

    let htmlClassType = `narrative-${type || 'general'}`;
    let htmlContent;

    // Construct HTML based on the quote type
    if (type === 'environmental') {
        // Environmental quotes are direct descriptions, not attributed to a character saying/thinking them
        htmlContent = `<p class="${htmlClassType}">${textContent}</p>`;
    } else if (type === 'action') {
        // Action lines typically describe what the character *does*.
        // Example template for 'action': "{actorName} unleashes a furious roar."
        // textContent will become "Azula unleashes a furious roar."
        htmlContent = `<p class="${htmlClassType}">${textContent}</p>`;
    } else { // 'spoken' or 'internal', or fallback 'general'
        // Example template for 'spoken': "You are weak!"
        // textContent will become "You are weak!"
        // htmlContent will be "Azula says, "<em>You are weak!</em>""
        htmlContent = `<p class="${htmlClassType}">${characterName} ${type === 'internal' ? 'thinks' : 'says'}, "<em>${textContent}</em>"</p>`;
    }

    return {
        type: 'dialogue_event',
        actorId: currentActor.id,
        characterName: characterName,
        text: textContent, // The pure, substituted text content
        isDialogue: (type === 'spoken' || type === 'internal'),
        isActionNarrative: (type === 'action'),
        isEnvironmentalNarrative: (type === 'environmental'),
        dialogueType: type || 'general', // The original type for potential specific styling
        html_content: `<div class="narrative-block">${htmlContent}</div>` // Formatted HTML
    };
}

function generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey) {
    if (!move || !result || !result.effectiveness) {
        const errActorName = actor?.name || "Unknown Attacker";
        const errMoveName = move?.name || "Unknown Move";
        return {
            type: 'move_action_event', actorId: actor?.id || 'unknown', characterName: errActorName, moveName: errMoveName,
            moveType: move?.element || move?.type || "Unknown", effectivenessLabel: "Error",
            text: `Error generating action description for ${errMoveName} by ${errActorName}.`, isMoveAction: true, isKOAction: false,
            html_content: `<p>Error generating action description for ${errMoveName}.</p>`
        };
    }
    const currentActor = actor || MINIMAL_ACTOR_FALLBACK;
    const currentOpponent = opponent || MINIMAL_ACTOR_FALLBACK;

    let introPhrase = '';
    let tacticalPrefix = '';
    let tacticalSuffix = '';

    const phaseSpecificIntroPool = introductoryPhrases[currentPhaseKey] || introductoryPhrases.Generic;
    introPhrase = getRandomElement(phaseSpecificIntroPool) || "Responding,";

    if (result.payoff && result.consumedStateName) {
        tacticalPrefix = `Capitalizing on ${currentOpponent.name} being ${result.consumedStateName}, `;
    }
    
    const actorTacticalState = currentActor.tacticalState;
    if (actorTacticalState && actorTacticalState.name && (actorTacticalState.duration || 0) >= 0) {
        if (actorTacticalState.isPositive) {
            tacticalSuffix += ` ${currentActor.name} is now ${actorTacticalState.name}!`;
        } else if (move.isRepositionMove) {
            tacticalSuffix += ` However, ${currentActor.name} is now ${actorTacticalState.name}!`;
        }
    }
    
    if (move.setup && result.effectiveness.label !== 'Weak' && !move.isRepositionMove) {
        tacticalSuffix += ` The move leaves ${currentOpponent.name} ${move.setup.name}!`;
    }

    let impactSentence;
    const effectivenessLabelUpper = result.effectiveness.label?.toUpperCase() || 'NORMAL';
    if (move.isRepositionMove && impactPhrases.REPOSITION?.[effectivenessLabelUpper]) {
        impactSentence = getRandomElement(impactPhrases.REPOSITION[effectivenessLabelUpper]);
    } else if ((move.type === 'Defense' || move.type === 'Utility') && impactPhrases.DEFENSE) {
        const isReactive = currentOpponent.lastMove?.type === 'Offense';
        impactSentence = getRandomElement(isReactive ? impactPhrases.DEFENSE.REACTIVE : impactPhrases.DEFENSE.PROACTIVE);
    } else if (impactPhrases.DEFAULT?.[effectivenessLabelUpper]) {
        impactSentence = getRandomElement(impactPhrases.DEFAULT[effectivenessLabelUpper]);
    } else {
        impactSentence = "The move unfolds.";
    }

    let baseActionText;
    if (move.name === "Struggle") {
        baseActionText = `${currentActor.name} struggles to fight back`;
    } else {
        const verb = conjugatePresent(move.verb || 'executes');
        const objectText = move.object || "an action";
        const article = move.requiresArticle ? (['a','e','i','o','u'].includes(objectText[0]?.toLowerCase()) ? `an ${objectText}` : `a ${objectText}`) : objectText;
        baseActionText = `${currentActor.name} ${verb} ${article}`;
    }
    
    let fullDescText = substituteTokens(`${introPhrase} ${tacticalPrefix}${baseActionText}. ${impactSentence || ''}${tacticalSuffix}`, currentActor, currentOpponent);
    let isKO = false;

    if ((currentOpponent.hp || 0) <= 0 && (result.damage || 0) > 0 && (move.type === 'Offense' || move.type === 'Finisher')) {
        const koVariations = finishingBlowPhrases || [ "...and {targetName} collapses, utterly defeated!" ];
        const koPhrase = getRandomElement(koVariations) || "...and {targetName} is defeated!";
        fullDescText += ` ${substituteTokens(koPhrase, currentActor, currentOpponent)}`;
        isKO = true; 
    }
    
    const moveLineHtml = (phaseTemplates.move || '')
        .replace(/{actorId}/g, currentActor.id || 'unknown-actor')
        .replace(/{actorName}/g, currentActor.name)
        .replace(/{moveName}/g, move.name || 'Unknown Move')
        .replace(/{moveEmoji}/g, result.effectiveness?.emoji || '⚔️') 
        .replace(/{effectivenessLabel}/g, result.effectiveness?.label || 'Normal')
        .replace(/{effectivenessEmoji}/g, result.effectiveness?.emoji || '⚔️')
        .replace(/{moveDescription}/g, `<p class="move-description">${fullDescText}</p>`) 
        .replace(/{collateralDamageDescription}/g, ''); 

    return {
        type: 'move_action_event',
        actorId: currentActor.id,
        characterName: currentActor.name,
        moveName: move.name,
        moveType: move.element || move.type, 
        effectivenessLabel: result.effectiveness.label,
        text: fullDescText, 
        isMoveAction: true,
        isKOAction: isKO, 
        html_content: moveLineHtml 
    };
}

function generateCollateralDamageEvent(move, actor, opponent, environmentState, locationData) {
    const currentActor = actor || MINIMAL_ACTOR_FALLBACK;
    const currentOpponent = opponent || MINIMAL_ACTOR_FALLBACK;

    if (!move || !environmentState) {
        return null;
    }
    if (!move.collateralImpact || move.collateralImpact === 'none' || (environmentState.damageLevel || 0) === 0) {
        return null;
    }
    const impactLevel = move.collateralImpact.toUpperCase(); 
    const collateralPhrasePool = collateralImpactPhrases[impactLevel];
    if (!collateralPhrasePool || collateralPhrasePool.length === 0) {
        return null;
    }
    const collateralPhrase = getRandomElement(collateralPhrasePool);
    if (!collateralPhrase) return null;

    let descriptionText = `${currentActor.name}'s attack impacts the surroundings: ${substituteTokens(collateralPhrase, currentActor, currentOpponent)}`;
    let specificImpactText = ''; 

    if (locationData && locationData.environmentalImpacts && environmentState.specificImpacts) {
        const currentDamageThreshold = environmentState.damageLevel || 0;
        let selectedImpactsPool = [];
        const thresholds = locationData.damageThresholds || {};
        const impacts = locationData.environmentalImpacts || {};

        if (currentDamageThreshold >= (thresholds.catastrophic || 101) && impacts.catastrophic) selectedImpactsPool = impacts.catastrophic;
        else if (currentDamageThreshold >= (thresholds.severe || 101) && impacts.severe) selectedImpactsPool = impacts.severe;
        else if (currentDamageThreshold >= (thresholds.moderate || 101) && impacts.moderate) selectedImpactsPool = impacts.moderate;
        else if (currentDamageThreshold >= (thresholds.minor || 0) && impacts.minor) selectedImpactsPool = impacts.minor;
        
        if (selectedImpactsPool.length > 0) {
            const availableImpacts = selectedImpactsPool.filter(imp => !environmentState.specificImpacts.has(imp));
            const uniqueImpact = availableImpacts.length > 0 ? getRandomElement(availableImpacts) : getRandomElement(selectedImpactsPool);
            
            if (uniqueImpact) {
                specificImpactText = ` ${substituteTokens(uniqueImpact, currentActor, currentOpponent)}`;
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
        actorId: currentActor.id, 
        text: fullCollateralText,
        isEnvironmental: true,
        html_content: collateralHtml 
    };
}

export function generateTurnNarrationObjects(narrativeEvents, move, actor, opponent, result, environmentState, locationData, currentPhaseKey, isInitialBanter = false) {
    if (!narrativeEvents || !Array.isArray(narrativeEvents)) {
        narrativeEvents = []; 
    }
    let turnEventObjects = [];

    narrativeEvents.forEach(event => {
        if (event && event.quote) { 
            const quoteEvent = formatQuoteToStructuredEvent(event.quote, event.actor, opponent, { '{moveName}': move?.name, currentPhaseKey });
            if (quoteEvent) {
                turnEventObjects.push(quoteEvent);
            }
        }
    });
    
    if (!isInitialBanter && move && result) {
        const currentActorForMove = actor || MINIMAL_ACTOR_FALLBACK;
        const currentOpponentForMove = opponent || MINIMAL_ACTOR_FALLBACK;

        const moveQuoteContext = { result: result.effectiveness?.label || 'Normal', currentPhaseKey };
        const moveExecutionQuote = findNarrativeQuote(currentActorForMove, currentOpponentForMove, 'onMoveExecution', move.name, moveQuoteContext);
        if (moveExecutionQuote) {
            const quoteEvent = formatQuoteToStructuredEvent(moveExecutionQuote, currentActorForMove, currentOpponentForMove, {currentPhaseKey});
            if(quoteEvent) turnEventObjects.push(quoteEvent);
        }

        const actionEvent = generateActionDescriptionObject(move, currentActorForMove, currentOpponentForMove, result, currentPhaseKey);
        if (actionEvent) turnEventObjects.push(actionEvent);

        const collateralEvent = generateCollateralDamageEvent(move, currentActorForMove, currentOpponentForMove, environmentState, locationData);
        if (collateralEvent) {
            const lastActionEvent = turnEventObjects.find(e => e.type === 'move_action_event' && e.html_content);
            if(lastActionEvent && lastActionEvent.html_content) {
                lastActionEvent.html_content = lastActionEvent.html_content.replace(/{collateralDamageDescription}/g, collateralEvent.html_content);
            } else if (lastActionEvent) {
                turnEventObjects.push(collateralEvent);
            } else { 
                turnEventObjects.push(collateralEvent);
            }
        } else { 
            const lastActionEvent = turnEventObjects.find(e => e.type === 'move_action_event' && e.html_content);
            if(lastActionEvent && lastActionEvent.html_content) {
                lastActionEvent.html_content = lastActionEvent.html_content.replace(/{collateralDamageDescription}/g, '');
            }
        }
    }
    return turnEventObjects;
}

export function getFinalVictoryLine(winner, loser) { 
    const currentWinner = winner || MINIMAL_ACTOR_FALLBACK;
    const currentLoser = loser || MINIMAL_ACTOR_FALLBACK;

    const finalQuote = findNarrativeQuote(currentWinner, currentLoser, 'onVictory', 'Default', {});
    if (finalQuote && typeof finalQuote.line === 'string') {
        return substituteTokens(finalQuote.line, currentWinner, currentLoser);
    }
    const winnerVictoryStyle = currentWinner.victoryStyle || 'default';
    const victoryPhrasesPool = postBattleVictoryPhrases[winnerVictoryStyle] || postBattleVictoryPhrases.default;
    if (!victoryPhrasesPool) {
        return `${currentWinner.name} stands triumphant.`;
    }

    const outcomeType = (currentWinner.hp || 0) > 50 ? 'dominant' : 'narrow';
    let phrase = victoryPhrasesPool[outcomeType] || victoryPhrasesPool.dominant || "{WinnerName} is victorious."; 
    
    return substituteTokens(phrase, currentWinner, currentLoser, {
        WinnerName: currentWinner.name, 
        LoserName: currentLoser.name, 
        WinnerPronounS: (currentWinner.pronouns || DEFAULT_PRONOUNS).s,
        WinnerPronounP: (currentWinner.pronouns || DEFAULT_PRONOUNS).p,
        WinnerPronounO: (currentWinner.pronouns || DEFAULT_PRONOUNS).o
    });
}