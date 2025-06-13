// FILE: js/engine_narrative-engine.js
'use strict';

import { phaseTemplates, impactPhrases, collateralImpactPhrases, introductoryPhrases, battlePhases as phaseDefinitions } from './narrative-v2.js'; // Assuming narrative-v2.js is renamed to data_narrative_config.js later
import { locationConditions } from './location-battle-conditions.js'; // Assuming renamed to data_location_conditions.js

const getRandomElement = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

/**
 * Conjugates a verb phrase for third-person singular present tense.
 * @param {string} verbPhrase - The verb phrase to conjugate.
 * @returns {string} The conjugated verb phrase.
 */
function conjugatePresent(verbPhrase) { 
    if (!verbPhrase) return '';
    const words = verbPhrase.split(' ');
    const verb = words[0];
    const rest = words.slice(1).join(' ');
    // Simple check for already conjugated common forms or specific verbs.
    if (verb.endsWith('s') && !['erupt', 'lash', 'assume', 'control', 'focus', 'execute', 'block', 'throw', 'strike', 'ride', 'unleash', 'form', 'create', 'push', 'sweep', 'send', 'don', 'slam', 'bend', 'launch', 'entomb', 'pin', 'devise', 'spring', 'ignite', 'generate', 'summon', 'propel', 'trigger', 'hurl', 'raise', 'conjure', 'inflict', 'end'].includes(verb) ) return verbPhrase;
    
    const irregulars = { 'have': 'has', 'do': 'does', 'go': 'goes', 'be': 'is' };
    if (irregulars[verb]) {
        return rest ? `${irregulars[verb]} ${rest}` : irregulars[verb];
    }
    let conjugatedVerb;
    if (/(ss|sh|ch|x|z|o)$/.test(verb)) {
        conjugatedVerb = verb + 'es';
    } else if (/[^aeiou]y$/.test(verb)) { // Verbs ending in consonant + y
        conjugatedVerb = verb.slice(0, -1) + 'ies';
    } else { // Default: add -s
        conjugatedVerb = verb + 's';
    }
    return rest ? `${conjugatedVerb} ${rest}` : conjugatedVerb;
}

/**
 * Substitutes tokens in a template string with provided values.
 * @param {string} template - The template string with tokens.
 * @param {object} actor - The acting character object.
 * @param {object} opponent - The opposing character object.
 * @param {object} [context={}] - Additional context for token replacement.
 * @returns {string} The string with tokens replaced.
 */
function substituteTokens(template, actor, opponent, context = {}) {
    if (!template) return '';
    let text = template;
    const replacements = {
        '{actorName}': actor?.name || 'A fighter',
        '{opponentName}': opponent?.name || 'Their opponent',
        '{targetName}': opponent?.name || 'The target',
        '{actor.s}': actor?.pronouns?.s || 'they',
        '{actor.p}': actor?.pronouns?.p || 'their',
        '{actor.o}': actor?.pronouns?.o || 'them',
        '{opponent.s}': opponent?.pronouns?.s || 'they',
        '{opponent.p}': opponent?.pronouns?.p || 'their',
        '{opponent.o}': opponent?.pronouns?.o || 'them',
        '{possessive}': actor?.pronouns?.p || 'their', // Defaulted to actor's possessive
        ...context
    };
    for (const [token, value] of Object.entries(replacements)) {
        text = text.replace(new RegExp(token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), String(value));
    }
    return text;
 }

/**
 * Finds a narrative quote based on trigger, sub-trigger, and context.
 * @param {object} actor - The character performing the action or being described.
 * @param {object} opponent - The opposing character.
 * @param {string} trigger - The main trigger for the narrative (e.g., 'battleStart', 'onMoveExecution').
 * @param {string} subTrigger - The specific sub-trigger (e.g., 'Early', move name).
 * @param {object} [context={}] - Additional context (e.g., currentPhaseKey, result).
 * @returns {object|null} The selected quote object or null.
 */
export function findNarrativeQuote(actor, opponent, trigger, subTrigger, context = {}) {
    const narrativeData = actor.narrative || {};
    let pool = null;
    const currentPhaseKey = context.currentPhaseKey || 'Generic';

    // Path priority: Relationship -> Character -> Move -> General Trigger
    if (opponent?.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger]?.[currentPhaseKey]) {
        pool = actor.relationships[opponent.id].narrative[trigger][subTrigger][currentPhaseKey];
    } else if (opponent?.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger]?.Generic) {
        pool = actor.relationships[opponent.id].narrative[trigger][subTrigger].Generic;
    } else if (opponent?.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger] && Array.isArray(actor.relationships[opponent.id].narrative[trigger][subTrigger])) { // Legacy support
        pool = actor.relationships[opponent.id].narrative[trigger][subTrigger];
    } else if (narrativeData[trigger]?.[subTrigger]?.[currentPhaseKey]) {
        pool = narrativeData[trigger][subTrigger][currentPhaseKey];
    } else if (narrativeData[trigger]?.[subTrigger]?.Generic) {
        pool = narrativeData[trigger][subTrigger].Generic;
    } else if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result]?.[currentPhaseKey]) {
        pool = narrativeData[trigger][subTrigger][context.result][currentPhaseKey];
    } else if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result]?.Generic) {
        pool = narrativeData[trigger][subTrigger][context.result].Generic;
    } else if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result] && Array.isArray(narrativeData[trigger]?.[subTrigger]?.[context.result])) { // Legacy support
        pool = narrativeData[trigger][subTrigger][context.result];
    } else if (narrativeData[trigger]?.[subTrigger] && Array.isArray(narrativeData[trigger]?.[subTrigger])) { // Legacy general sub-trigger
        pool = narrativeData[trigger][subTrigger];
    } else if (narrativeData[trigger]?.general?.[currentPhaseKey]) { // General trigger fallback with phase
        pool = narrativeData[trigger].general[currentPhaseKey];
    } else if (narrativeData[trigger]?.general?.Generic) { // General trigger fallback to Generic
        pool = narrativeData[trigger].general.Generic;
    } else if (narrativeData[trigger]?.general && Array.isArray(narrativeData[trigger]?.general)) { // Legacy general trigger
        pool = narrativeData[trigger].general;
    } else if (trigger === 'onCollateral' && subTrigger === 'general' && context.impactText) {
        // Special handling for raw impact text for collateral damage
        return { type: 'environmental', line: context.impactText };
    }

    return pool ? getRandomElement(pool) : null;
}

/**
 * Formats a quote object into a structured event for the battle log.
 * @param {object} quote - The quote object from findNarrativeQuote.
 * @param {object} actor - The character associated with the quote.
 * @param {object} opponent - The opposing character.
 * @param {object} context - Additional context.
 * @returns {object|null} A structured event object or null.
 */
function formatQuoteEvent(quote, actor, opponent, context) {
    if (!quote || !quote.line) return null;
    const { type, line } = quote;
    const characterName = actor?.name || 'Narrator';
    const formattedLine = substituteTokens(line, actor, opponent, context);
    
    const actorSpan = actor ? `<span class="char-${actor.id}">${characterName}</span>` : characterName;
    const verb = type === 'internal' ? 'thinks' : (type === 'action' ? '' : 'says');
    let htmlContent = "";
    if (type === 'environmental') {
        htmlContent = `<p class="narrative-environmental">${formattedLine}</p>`;
    } else if (type === 'action') {
        htmlContent = `<p class="narrative-action">${actorSpan} ${formattedLine}</p>`;
    } else {
        htmlContent = `<p class="narrative-${type || 'spoken'}">${actorSpan} ${verb}, "<em>${formattedLine}</em>"</p>`;
    }

    return {
        type: 'dialogue_event',
        actorId: actor?.id || null,
        characterName: characterName,
        text: formattedLine, // Raw text for animation
        isDialogue: (type === 'spoken' || type === 'internal'),
        isActionNarrative: (type === 'action'),
        isEnvironmental: (type === 'environmental'),
        html_content: htmlContent, // HTML for instant mode
    };
}

/**
 * Generates a structured object describing a move action.
 * @param {object} move - The move object.
 * @param {object} actor - The attacking character.
 * @param {object} opponent - The defending character.
 * @param {object} result - The result of the move calculation.
 * @param {string} currentPhaseKey - The current battle phase key.
 * @returns {object} A structured event object for the move action.
 */
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

    let impactSentenceKey = result.effectiveness.label.toUpperCase();
    let impactSentencePool;

    if (move.isRepositionMove) {
        impactSentencePool = impactPhrases.REPOSITION?.[impactSentenceKey];
    } else if (move.type === 'Defense' || move.type === 'Utility') {
        const isReactive = opponent.lastMove?.type === 'Offense';
        impactSentencePool = isReactive ? impactPhrases.DEFENSE?.REACTIVE : impactPhrases.DEFENSE?.PROACTIVE;
    } else {
        impactSentencePool = impactPhrases.DEFAULT?.[impactSentenceKey];
    }
    const impactSentence = getRandomElement(impactSentencePool) || "The move is made.";


    let baseActionText;
    if (move.name === "Struggle") {
        baseActionText = `${actor.name} struggles to fight back`;
    } else {
        const verb = conjugatePresent(move.verb || 'executes');
        const object = move.requiresArticle ? ((['a','e','i','o','u'].includes(move.object[0].toLowerCase()) ? `an ${move.object}` : `a ${move.object}`)) : move.object;
        baseActionText = `${actor.name} ${verb} ${object}`;
    }
    
    const fullDescText = substituteTokens(`${introPhrase} ${tacticalPrefix}${baseActionText}. ${impactSentence}${tacticalSuffix}`, actor, opponent);
    
    const moveLineHtml = phaseTemplates.move
        .replace(/{actorId}/g, actor.id)
        .replace(/{actorName}/g, actor.name)
        .replace(/{moveName}/g, move.name)
        .replace(/{moveEmoji}/g, '⚔️') // Placeholder, animation engine will handle better emoji
        .replace(/{effectivenessLabel}/g, result.effectiveness.label)
        .replace(/{effectivenessEmoji}/g, result.effectiveness.emoji)
        .replace(/{moveDescription}/g, `<p class="move-description">${fullDescText}</p>`) // Full description in its own p tag
        .replace(/{collateralDamageDescription}/g, ''); // Collateral will be a separate event or appended

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

/**
 * Generates a structured event for collateral damage.
 * @param {object} move - The move that caused collateral.
 * @param {object} actor - The character who performed the move.
 * @param {object} opponent - The opposing character.
 * @param {object} environmentState - Current state of the environment.
 * @param {object} locationData - Data for the current location.
 * @returns {object|null} A structured event object or null if no collateral.
 */
function generateCollateralDamageEvent(move, actor, opponent, environmentState, locationData) {
    if (!move.collateralImpact || move.collateralImpact === 'none' || environmentState.damageLevel === 0) {
        return null;
    }
    const impactLevel = move.collateralImpact.toUpperCase();
    if (!collateralImpactPhrases[impactLevel] || collateralImpactPhrases[impactLevel].length === 0) return null;
    
    const collateralPhrase = getRandomElement(collateralImpactPhrases[impactLevel]);
    if (!collateralPhrase) return null;

    let description = `${actor.name}'s attack impacts the surroundings: ${substituteTokens(collateralPhrase, actor, opponent)}`;
    let specificImpactPhrase = '';

    if (locationData && locationData.environmentalImpacts && environmentState.specificImpacts.size > 0) {
        // Use the already populated specificImpacts from environmentState, which engine_battle-core now handles
        specificImpactPhrase = ` ${Array.from(environmentState.specificImpacts).join(' ')}`;
    }
    
     if (move.element && !['physical', 'utility', 'special'].includes(move.element)) {
        description += ` The ${move.element} energy ripples through the area.`;
    }
    const fullCollateralText = `${description}${specificImpactPhrase}`;
    const collateralHtml = `<p class="collateral-damage-description">${fullCollateralText}</p>`;

    return {
        type: 'collateral_damage_event',
        actorId: actor.id, 
        text: fullCollateralText,
        isEnvironmental: true,
        html_content: collateralHtml
    };
}

/**
 * Generates an array of structured narrative event objects for a turn's actions.
 * @param {Array<object>} events - Array of pre-action narrative events (dialogue, thoughts).
 * @param {object} move - The move object being executed.
 * @param {object} actor - The attacking character.
 * @param {object} opponent - The defending character.
 * @param {object} result - The result of the move calculation.
 * @param {object} environmentState - Current state of the environment.
 * @param {object} locationData - Data for the current location.
 * @param {string} currentPhaseKey - The current battle phase key.
 * @param {boolean} [isInitialBanter=false] - True if these are pre-battle banter events.
 * @returns {Array<object>} An array of structured event objects.
 */
export function generateTurnNarrationObjects(events, move, actor, opponent, result, environmentState, locationData, currentPhaseKey, isInitialBanter = false) {
    let turnEventObjects = [];

    events.forEach(event => {
        const quoteEvent = formatQuoteEvent(event.quote, event.actor, opponent, { '{moveName}': move?.name, currentPhaseKey });
        if (quoteEvent) {
            turnEventObjects.push(quoteEvent);
        }
    });
    
    if (!isInitialBanter && move && result) {
        const moveQuoteContext = { result: result.effectiveness.label, currentPhaseKey };
        const moveExecutionQuote = findNarrativeQuote(actor, opponent, 'onMoveExecution', move.name, moveQuoteContext);
        if (moveExecutionQuote) {
            const quoteEvent = formatQuoteEvent(moveExecutionQuote, actor, opponent, {currentPhaseKey});
            if(quoteEvent) {
                turnEventObjects.push(quoteEvent);
            }
        }

        const actionEvent = generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey);
        turnEventObjects.push(actionEvent);

        const collateralEvent = generateCollateralDamageEvent(move, actor, opponent, environmentState, locationData);
        if (collateralEvent) {
            // Append collateral HTML to the main move action's HTML for instant mode
            if (actionEvent.html_content) { // Ensure html_content exists
                actionEvent.html_content = actionEvent.html_content.replace(/{collateralDamageDescription}/g, collateralEvent.html_content);
            }
            // Push collateral as a separate event for animated mode
            turnEventObjects.push(collateralEvent); 
        } else if (actionEvent.html_content) {
             actionEvent.html_content = actionEvent.html_content.replace(/{collateralDamageDescription}/g, '');
        }
    }
    return turnEventObjects;
}

/**
 * Generates the final victory line for the winning character.
 * @param {object} winner - The winning character object.
 * @param {object} loser - The losing character object.
 * @returns {string} The final victory line.
 */
export function getFinalVictoryLine(winner, loser) { 
    if (!winner) return "The battle ends."; // Graceful handling if no clear winner (e.g. true draw)
    if (!loser && winner) return `${winner.name} stands victorious.`; // If only winner is known (e.g. stalemate but one has more HP)

    const finalQuote = findNarrativeQuote(winner, loser, 'onVictory', 'Default', {});
    if (finalQuote && finalQuote.line) {
        return substituteTokens(finalQuote.line, winner, loser);
    }
    
    const victoryPhrases = postBattleVictoryPhrases[winner.victoryStyle] || postBattleVictoryPhrases.default;
    const outcomeType = winner.hp > 50 ? 'dominant' : 'narrow';
    let phrase = victoryPhrases[outcomeType] || victoryPhrases.dominant; // Default to dominant if narrow not defined
    
    return substituteTokens(phrase, winner, loser, {
        WinnerName: winner.name, 
        LoserName: loser?.name || "their opponent", // Loser might be null in some draw scenarios
        WinnerPronounS: winner.pronouns?.s || 'they',
        WinnerPronounP: winner.pronouns?.p || 'their',
        WinnerPronounO: winner.pronouns?.o || 'them'
    });
}