// FILE: js/engine_narrative-engine.js
'use strict';

// Version 3.3.1: Null-Safety Pass

import { phaseTemplates, impactPhrases, collateralImpactPhrases, introductoryPhrases, battlePhases as phaseDefinitions, finishingBlowPhrases } from './narrative-v2.js'; // Assuming this is correctly structured
import { locationConditions } from './location-battle-conditions.js'; // Assuming this is correctly structured

const DEFAULT_PRONOUNS = { s: 'they', p: 'their', o: 'them' };

const getRandomElement = (arr) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
        // console.warn("Narrative Engine (getRandomElement): Attempted to get element from empty or invalid array.");
        return null;
    }
    return arr[Math.floor(Math.random() * arr.length)];
};

function conjugatePresent(verbPhrase) {
    if (!verbPhrase || typeof verbPhrase !== 'string') {
        // console.warn(`Narrative Engine (conjugatePresent): Invalid verbPhrase: ${verbPhrase}`);
        return '';
    }
    const words = verbPhrase.split(' ');
    const verb = words[0];
    const rest = words.slice(1).join(' ');
    if (verb.endsWith('s') && !['erupt', 'lash', 'assume', 'control', 'focus'].includes(verb)) return verbPhrase; // Heuristic, might need refinement
    const irregulars = { 'have': 'has', 'do': 'does', 'go': 'goes', 'be': 'is' };
    if (irregulars[verb]) {
        return rest ? `${irregulars[verb]} ${rest}` : irregulars[verb];
    }
    let conjugatedVerb;
    if (/(ss|sh|ch|x|z|o)$/.test(verb)) {
        conjugatedVerb = verb + 'es';
    } else if (/[^aeiou]y$/.test(verb)) { // consonant + y
        conjugatedVerb = verb.slice(0, -1) + 'ies';
    } else {
        conjugatedVerb = verb + 's';
    }
    return rest ? `${conjugatedVerb} ${rest}` : conjugatedVerb;
}

function substituteTokens(template, actor, opponent, context = {}) {
    if (typeof template !== 'string') {
        // console.warn(`Narrative Engine (substituteTokens): Template is not a string:`, template);
        return '';
    }
    let text = template;
    const actorName = actor?.name || 'Someone';
    const opponentName = opponent?.name || 'Someone else';
    const actorPronouns = actor?.pronouns || DEFAULT_PRONOUNS;
    const opponentPronouns = opponent?.pronouns || DEFAULT_PRONOUNS;

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
        ...context // Spread context last so it can override if necessary
    };
    for (const [token, value] of Object.entries(replacements)) {
        // Ensure value is a string to avoid issues with replace
        const replacementValue = (value === null || value === undefined) ? '' : String(value);
        text = text.replace(new RegExp(token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replacementValue);
    }
    return text;
}

export function findNarrativeQuote(actor, opponent, trigger, subTrigger, context = {}) {
    if (!actor) {
        // console.warn(`Narrative Engine (findNarrativeQuote): Actor is undefined for trigger "${trigger}/${subTrigger}".`);
        return null;
    }
    const narrativeData = actor.narrative || {}; // Fallback to empty object if narrative is missing
    let pool = null;
    const currentPhaseKey = context?.currentPhaseKey || 'Generic';
    const opponentId = opponent?.id;

    // Define a helper for accessing nested properties safely
    const getPath = (obj, pathArray) => pathArray.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);

    // Path for relationship-specific, phase-specific quotes
    pool = pool || getPath(actor.relationships, [opponentId, 'narrative', trigger, subTrigger, currentPhaseKey]);
    // Path for relationship-specific, generic phase quotes
    pool = pool || getPath(actor.relationships, [opponentId, 'narrative', trigger, subTrigger, 'Generic']);
    // Path for relationship-specific quotes (if not phase-specific and is an array)
    const relBase = getPath(actor.relationships, [opponentId, 'narrative', trigger, subTrigger]);
    if (!pool && Array.isArray(relBase)) {
        pool = relBase;
    }

    // Path for general, phase-specific quotes
    pool = pool || getPath(narrativeData, [trigger, subTrigger, currentPhaseKey]);
    // Path for general, generic phase quotes
    pool = pool || getPath(narrativeData, [trigger, subTrigger, 'Generic']);

    // Path for onMoveExecution with result, phase-specific
    if (trigger === 'onMoveExecution' && context?.result) {
        pool = pool || getPath(narrativeData, [trigger, subTrigger, context.result, currentPhaseKey]);
        // Path for onMoveExecution with result, generic phase
        pool = pool || getPath(narrativeData, [trigger, subTrigger, context.result, 'Generic']);
        // Path for onMoveExecution with result (if not phase-specific and is an array)
        const moveExecBase = getPath(narrativeData, [trigger, subTrigger, context.result]);
        if (!pool && Array.isArray(moveExecBase)) {
            pool = moveExecBase;
        }
    }
    
    // Path for general quotes (if not phase-specific and is an array)
    const generalBase = getPath(narrativeData, [trigger, subTrigger]);
    if (!pool && Array.isArray(generalBase)) {
        pool = generalBase;
    }

    // Fallback to trigger.general (e.g., battleStart.general)
    pool = pool || getPath(narrativeData, [trigger, 'general', currentPhaseKey]);
    pool = pool || getPath(narrativeData, [trigger, 'general', 'Generic']);
    const triggerGeneralBase = getPath(narrativeData, [trigger, 'general']);
    if (!pool && Array.isArray(triggerGeneralBase)) {
        pool = triggerGeneralBase;
    }
    
    // Special handling for onCollateral if impactText is provided directly
    if (trigger === 'onCollateral' && subTrigger === 'general' && context?.impactText) {
        // console.log(`Narrative Engine: Using direct impactText for onCollateral: "${context.impactText}"`);
        return { type: 'environmental', line: context.impactText };
    }
    
    if (pool && Array.isArray(pool)) {
        return getRandomElement(pool);
    } else if (pool) { // If pool is an object (e.g. for onMoveExecution.MoveName.Critical.Generic)
        // This case should be handled by the specific path lookups above.
        // If it reaches here and pool is an object but not an array, it means the path was too specific
        // or the data structure is unexpected.
        // console.warn(`Narrative Engine (findNarrativeQuote): Found pool for ${actor.name}/${trigger}/${subTrigger}, but it was not an array. Pool:`, pool);
    } else {
        // console.warn(`Narrative Engine (findNarrativeQuote): No narrative pool found for ${actor.name}/${trigger}/${subTrigger} (Phase: ${currentPhaseKey}, Result: ${context?.result}).`);
    }
    return null;
}

function formatQuoteToStructuredEvent(quoteObj, actor, opponent, context) {
    if (!quoteObj || typeof quoteObj.line !== 'string') { // Ensure quoteObj and line are valid
        // console.warn("Narrative Engine (formatQuoteToStructuredEvent): Invalid quoteObj or missing line property.", quoteObj);
        return null;
    }
    const { type, line } = quoteObj;
    const characterName = actor?.name || 'Narrator'; // Fallback for Narrator if actor is null
    const textContent = substituteTokens(line, actor, opponent, context);

    let htmlClassType = `narrative-${type || 'general'}`; // Fallback if type is missing
    let htmlContent;

    if (type === 'environmental') {
        htmlContent = textContent; // Environmental events are just text, no character attribution
    } else if (type === 'action') {
        // Action narrative often implies the actor's name starts the sentence.
        htmlContent = `<p class="${htmlClassType}">${substituteTokens(actorName, actor, opponent)} ${textContent}</p>`;
    } else { // 'spoken' or 'internal', or fallback 'general'
        htmlContent = `<p class="${htmlClassType}">${substituteTokens(actorName, actor, opponent)} ${type === 'internal' ? 'thinks' : 'says'}, "<em>${textContent}</em>"</p>`;
    }

    return {
        type: 'dialogue_event', // All narrative quotes become dialogue events for simplicity in the log
        actorId: actor?.id || null,
        characterName: characterName,
        text: textContent,
        isDialogue: (type === 'spoken' || type === 'internal'),
        isActionNarrative: (type === 'action'),
        isEnvironmentalNarrative: (type === 'environmental'),
        dialogueType: type || 'general', // Store the original type for potential styling
        html_content: `<div class="narrative-block">${htmlContent}</div>`
    };
}

function generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey) {
    if (!move || !actor || !opponent || !result || !result.effectiveness) {
        // console.warn("Narrative Engine (generateActionDescriptionObject): Missing critical parameters.");
        return {
            type: 'move_action_event', actorId: actor?.id, characterName: actor?.name || "Unknown", moveName: move?.name || "Unknown Move",
            moveType: move?.element || move?.type || "Unknown", effectivenessLabel: "Error",
            text: "Error generating action description due to missing data.", isMoveAction: true, isKOAction: false,
            html_content: "<p>Error generating action description.</p>"
        };
    }

    let introPhrase = '';
    let tacticalPrefix = '';
    let tacticalSuffix = '';

    const phaseSpecificIntroPool = introductoryPhrases[currentPhaseKey] || introductoryPhrases.Generic;
    introPhrase = getRandomElement(phaseSpecificIntroPool) || "Responding,";

    if (result.payoff && result.consumedStateName) {
        tacticalPrefix = `Capitalizing on ${(opponent?.name || 'the opponent')} being ${result.consumedStateName}, `;
    }

    const actorTacticalState = actor?.tacticalState;
    if (actorTacticalState && actorTacticalState.name && actorTacticalState.duration >= 0) {
        if (actorTacticalState.isPositive) {
            tacticalSuffix += ` ${(actor?.name || 'The attacker')} is now ${actorTacticalState.name}!`;
        } else if (move.isRepositionMove) { // Only add negative state suffix if it's a reposition outcome
            tacticalSuffix += ` However, ${(actor?.name || 'The attacker')} is now ${actorTacticalState.name}!`;
        }
    }
    
    // Add opponent's new state if it's a setup move and not a self-buffing reposition
    if (move.setup && result.effectiveness.label !== 'Weak' && !move.isRepositionMove) {
        tacticalSuffix += ` The move leaves ${(opponent?.name || 'the opponent')} ${move.setup.name}!`;
    }

    let impactSentence;
    const effectivenessLabelUpper = result.effectiveness.label?.toUpperCase();
    if (move.isRepositionMove && impactPhrases.REPOSITION?.[effectivenessLabelUpper]) {
        impactSentence = getRandomElement(impactPhrases.REPOSITION[effectivenessLabelUpper]);
    } else if ((move.type === 'Defense' || move.type === 'Utility') && impactPhrases.DEFENSE) {
        const isReactive = opponent?.lastMove?.type === 'Offense'; // Check if opponent and lastMove exist
        impactSentence = getRandomElement(isReactive ? impactPhrases.DEFENSE.REACTIVE : impactPhrases.DEFENSE.PROACTIVE);
    } else if (impactPhrases.DEFAULT?.[effectivenessLabelUpper]) {
        impactSentence = getRandomElement(impactPhrases.DEFAULT[effectivenessLabelUpper]);
    } else {
        impactSentence = "The move unfolds."; // Generic fallback
        // console.warn(`Narrative Engine: No impact phrase for effectiveness "${effectivenessLabelUpper}" and move type "${move.type}".`);
    }


    let baseActionText;
    const actorName = actor?.name || 'The attacker';
    if (move.name === "Struggle") {
        baseActionText = `${actorName} struggles to fight back`;
    } else {
        const verb = conjugatePresent(move.verb || 'executes');
        const objectText = move.object || "an action";
        const article = move.requiresArticle ? (['a','e','i','o','u'].includes(objectText[0]?.toLowerCase()) ? `an ${objectText}` : `a ${objectText}`) : objectText;
        baseActionText = `${actorName} ${verb} ${article}`;
    }

    let fullDescText = substituteTokens(`${introPhrase} ${tacticalPrefix}${baseActionText}. ${impactSentence || ''}${tacticalSuffix}`, actor, opponent);
    let isKO = false;

    if ((opponent?.hp || 0) <= 0 && result.damage > 0 && (move.type === 'Offense' || move.type === 'Finisher')) {
        const koVariations = finishingBlowPhrases || [ // Use imported or fallback
            "...and {targetName} collapses, utterly defeated!",
            "...delivering the final, decisive blow! {targetName} is out!",
            "...leaving {targetName} with no strength left to fight. The battle is over!",
            "...and with that, {targetName}'s resistance ends completely!"
        ];
        const koPhrase = getRandomElement(koVariations) || "...and {targetName} is defeated!";
        fullDescText += ` ${substituteTokens(koPhrase, actor, opponent)}`;
        isKO = true;
    }

    const moveLineHtml = (phaseTemplates.move || '') // Ensure phaseTemplates.move exists
        .replace(/{actorId}/g, actor?.id || 'unknown-actor')
        .replace(/{actorName}/g, actorName)
        .replace(/{moveName}/g, move.name || 'Unknown Move')
        .replace(/{moveEmoji}/g, result.effectiveness?.emoji || '⚔️') // Use emoji from result
        .replace(/{effectivenessLabel}/g, result.effectiveness?.label || 'Normal')
        .replace(/{effectivenessEmoji}/g, result.effectiveness?.emoji || '⚔️')
        .replace(/{moveDescription}/g, `<p class="move-description">${fullDescText}</p>`)
        .replace(/{collateralDamageDescription}/g, ''); // Collateral handled separately

    return {
        type: 'move_action_event',
        actorId: actor?.id,
        characterName: actorName,
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
    if (!move || !actor || !environmentState) {
        // console.warn("Narrative Engine (generateCollateralDamageEvent): Missing critical parameters.");
        return null;
    }
    if (!move.collateralImpact || move.collateralImpact === 'none' || environmentState.damageLevel === 0) {
        return null;
    }
    const impactLevel = move.collateralImpact.toUpperCase();
    const collateralPhrasePool = collateralImpactPhrases[impactLevel];
    if (!collateralPhrasePool || collateralPhrasePool.length === 0) {
        // console.warn(`Narrative Engine: No collateral phrases for impact level "${impactLevel}".`);
        return null;
    }
    const collateralPhrase = getRandomElement(collateralPhrasePool);
    if (!collateralPhrase) return null;

    const actorName = actor?.name || 'The attacker';
    let descriptionText = `${actorName}'s attack impacts the surroundings: ${substituteTokens(collateralPhrase, actor, opponent)}`;
    let specificImpactText = '';

    if (locationData && locationData.environmentalImpacts && environmentState.specificImpacts) {
        const currentDamageThreshold = environmentState.damageLevel;
        let selectedImpactsPool = [];

        // Determine which pool of impacts to use based on damage level
        if (currentDamageThreshold >= (locationData.damageThresholds?.catastrophic || 101) && locationData.environmentalImpacts.catastrophic) {
            selectedImpactsPool = locationData.environmentalImpacts.catastrophic;
        } else if (currentDamageThreshold >= (locationData.damageThresholds?.severe || 101) && locationData.environmentalImpacts.severe) {
            selectedImpactsPool = locationData.environmentalImpacts.severe;
        } else if (currentDamageThreshold >= (locationData.damageThresholds?.moderate || 101) && locationData.environmentalImpacts.moderate) {
            selectedImpactsPool = locationData.environmentalImpacts.moderate;
        } else if (currentDamageThreshold >= (locationData.damageThresholds?.minor || 0) && locationData.environmentalImpacts.minor) {
            selectedImpactsPool = locationData.environmentalImpacts.minor;
        }
        
        if (selectedImpactsPool.length > 0) {
            // Attempt to find an impact not already used, or pick one randomly if all are used or set is empty
            const availableImpacts = selectedImpactsPool.filter(imp => !environmentState.specificImpacts.has(imp));
            const uniqueImpact = availableImpacts.length > 0 ? getRandomElement(availableImpacts) : getRandomElement(selectedImpactsPool);
            
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
    if (!narrativeEvents || !Array.isArray(narrativeEvents)) {
        // console.warn("Narrative Engine (generateTurnNarrationObjects): narrativeEvents is not a valid array.");
        narrativeEvents = []; // Ensure it's an array to avoid errors
    }
    let turnEventObjects = [];

    narrativeEvents.forEach(event => {
        if (event && event.quote) { // Ensure event and event.quote exist
            const quoteEvent = formatQuoteToStructuredEvent(event.quote, event.actor, opponent, { '{moveName}': move?.name, currentPhaseKey });
            if (quoteEvent) {
                turnEventObjects.push(quoteEvent);
            }
        }
    });

    if (!isInitialBanter && move && result) {
        const moveQuoteContext = { result: result.effectiveness?.label || 'Normal', currentPhaseKey }; // Use label from effectiveness
        const moveExecutionQuote = findNarrativeQuote(actor, opponent, 'onMoveExecution', move.name, moveQuoteContext);
        if (moveExecutionQuote) {
            const quoteEvent = formatQuoteToStructuredEvent(moveExecutionQuote, actor, opponent, { currentPhaseKey });
            if (quoteEvent) turnEventObjects.push(quoteEvent);
        }

        const actionEvent = generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey);
        if (actionEvent) turnEventObjects.push(actionEvent);

        const collateralEvent = generateCollateralDamageEvent(move, actor, opponent, environmentState, locationData);
        if (collateralEvent) {
            const lastActionEvent = turnEventObjects.find(e => e.type === 'move_action_event' && e.html_content);
            if (lastActionEvent && lastActionEvent.html_content) { // Ensure html_content exists
                lastActionEvent.html_content = lastActionEvent.html_content.replace(/{collateralDamageDescription}/g, collateralEvent.html_content);
            } else if (lastActionEvent) { // If html_content was missing, just push collateral as new event
                turnEventObjects.push(collateralEvent);
            } else { // If no prior move action, which is unlikely but possible if initial banter is complex
                turnEventObjects.push(collateralEvent);
            }
        } else { // Ensure the placeholder is removed even if no collateral event
            const lastActionEvent = turnEventObjects.find(e => e.type === 'move_action_event' && e.html_content);
            if (lastActionEvent && lastActionEvent.html_content) {
                lastActionEvent.html_content = lastActionEvent.html_content.replace(/{collateralDamageDescription}/g, '');
            }
        }
    }
    return turnEventObjects;
}

export function getFinalVictoryLine(winner, loser) {
    if (!winner) {
        // console.warn("Narrative Engine (getFinalVictoryLine): Winner object is undefined.");
        return "The battle ends.";
    }

    const finalQuote = findNarrativeQuote(winner, loser, 'onVictory', 'Default', {}); // Context might be empty here
    if (finalQuote && typeof finalQuote.line === 'string') {
        return substituteTokens(finalQuote.line, winner, loser);
    }

    // Fallback to victoryStyle phrases
    const winnerVictoryStyle = winner.victoryStyle || 'default';
    const victoryPhrasesPool = postBattleVictoryPhrases[winnerVictoryStyle] || postBattleVictoryPhrases.default;
    if (!victoryPhrasesPool) {
        // console.warn(`Narrative Engine: No victory phrases for style "${winnerVictoryStyle}" or default.`);
        return `${winner.name || 'The victor'} stands triumphant.`;
    }

    const outcomeType = (winner.hp || 0) > 50 ? 'dominant' : 'narrow';
    let phrase = victoryPhrasesPool[outcomeType] || victoryPhrasesPool.dominant || "{WinnerName} is victorious."; // Further fallback

    return substituteTokens(phrase, winner, loser, {
        WinnerName: winner.name || 'The Victor',
        LoserName: loser?.name || "the opponent",
        WinnerPronounS: (winner.pronouns || DEFAULT_PRONOUNS).s,
        WinnerPronounP: (winner.pronouns || DEFAULT_PRONOUNS).p,
        WinnerPronounO: (winner.pronouns || DEFAULT_PRONOUNS).o
    });
}