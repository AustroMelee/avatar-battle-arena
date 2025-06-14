// FILE: js/engine_narrative-engine.js
'use strict';

import { phaseTemplates, impactPhrases, collateralImpactPhrases, introductoryPhrases, postBattleVictoryPhrases } from './narrative-v2.js'; // Will be data_narrative_config.js
import { locationConditions } from './location-battle-conditions.js'; // Will be data_location_conditions.js

const getRandomElement = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

/**
 * Conjugates a verb phrase for third-person singular present tense.
 * Ensures specific verbs are handled correctly.
 * @param {string} verbPhrase - The verb phrase to conjugate.
 * @returns {string} The conjugated verb phrase.
 */
function conjugatePresent(verbPhrase) { 
    if (!verbPhrase) return '';
    const words = verbPhrase.split(' ');
    let verb = words[0];
    const rest = words.slice(1).join(' ');
    
    // List of verbs that might end in 's' but are base forms or already irregular
    const baseFormExceptions = [
        'erupts', 'lashes', 'assumes', 'controls', 'focuses', 'executes', 
        'blocks', 'throws', 'strikes', 'rides', 'unleashes', 'forms', 
        'creates', 'pushes', 'sweeps', 'sends', 'dons', 'slams', 
        'bends', 'launches', 'entombs', 'pins', 'devises', 'springs', 
        'ignites', 'generates', 'summons', 'propels', 'triggers', 'hurls', 
        'raises', 'conjures', 'inflicts', 'ends'
    ];

    if (baseFormExceptions.includes(verb)) { // If it's already in a form we want to keep
        return verbPhrase;
    }
    if (verb.endsWith('s') && verb !== 'is' && verb !== 'has' && verb !== 'does' && verb !== 'goes') { // Avoid double 's' unless it's like "focuses"
         // Check if it's already correctly conjugated (e.g. "focuses")
        if (/(ss|sh|ch|x|z|o)es$/.test(verb) || /[^aeiou]ies$/.test(verb) || (/[aeiou]s$/.test(verb) && !verb.endsWith("ss"))) {
           // Looks like it might already be correct
        } else if (verb.length > 1 && verb.charAt(verb.length-2) !== 's') { // Simple plural, like "hits" vs "hit"
            // This assumes it's likely already conjugated. Might need refinement for complex verbs.
        }
    }


    const irregulars = { 'have': 'has', 'do': 'does', 'go': 'goes', 'be': 'is' };
    if (irregulars[verb]) {
        verb = irregulars[verb];
    } else if (/(ss|sh|ch|x|z|o)$/.test(verb)) {
        verb = verb + 'es';
    } else if (/[^aeiou]y$/.test(verb)) { 
        verb = verb.slice(0, -1) + 'ies';
    } else if (!verb.endsWith('s')) { // Only add 's' if it doesn't already end with 's'
        verb = verb + 's';
    }
    // If 'rest' is empty, just return the verb. Otherwise, combine them.
    return rest ? `${verb} ${rest}` : verb;
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
    if (typeof template !== 'string') return ''; // Ensure template is a string
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
        '{possessive}': actor?.pronouns?.p || 'their', 
        ...context
    };
    for (const [token, value] of Object.entries(replacements)) {
        // Ensure token is a string and value is defined and can be stringified
        if (typeof token === 'string' && value !== undefined) {
            text = text.replace(new RegExp(token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), String(value));
        }
    }
    return text;
 }

/**
 * Finds a narrative quote based on trigger, sub-trigger, and context.
 * Prioritizes relationship-specific, then character-specific, then move-specific, then general quotes.
 * Considers current battle phase for phase-specific quotes.
 * @param {object} actor - The character performing the action or being described.
 * @param {object} opponent - The opposing character.
 * @param {string} trigger - The main trigger (e.g., 'battleStart', 'onMoveExecution').
 * @param {string} subTrigger - The specific sub-trigger (e.g., 'Early', move name).
 * @param {object} [context={}] - Additional context (e.g., currentPhaseKey, result, impactText).
 * @returns {object|null} The selected quote object {type, line} or null.
 */
export function findNarrativeQuote(actor, opponent, trigger, subTrigger, context = {}) {
    if (!actor || !actor.narrative) return null; // Ensure actor and actor.narrative exist
    const narrativeData = actor.narrative;
    let pool = null;
    const currentPhaseKey = context.currentPhaseKey || 'Generic'; // Default to 'Generic' if no phase specified

    // Define lookup paths in order of preference
    const lookupPaths = [];

    // 1. Relationship-specific, phase-specific
    if (opponent?.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger]?.[currentPhaseKey]) {
        lookupPaths.push(() => actor.relationships[opponent.id].narrative[trigger][subTrigger][currentPhaseKey]);
    }
    // 2. Relationship-specific, generic phase
    if (opponent?.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger]?.Generic) {
        lookupPaths.push(() => actor.relationships[opponent.id].narrative[trigger][subTrigger].Generic);
    }
    // 3. Relationship-specific, direct array (legacy)
    if (opponent?.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger] && Array.isArray(actor.relationships[opponent.id].narrative[trigger][subTrigger])) {
        lookupPaths.push(() => actor.relationships[opponent.id].narrative[trigger][subTrigger]);
    }
    // 4. Character-specific, phase-specific
    if (narrativeData[trigger]?.[subTrigger]?.[currentPhaseKey]) {
        lookupPaths.push(() => narrativeData[trigger][subTrigger][currentPhaseKey]);
    }
    // 5. Character-specific, generic phase
    if (narrativeData[trigger]?.[subTrigger]?.Generic) {
        lookupPaths.push(() => narrativeData[trigger][subTrigger].Generic);
    }
    // 6. Move execution specific, with result, phase-specific
    if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result]?.[currentPhaseKey]) {
        lookupPaths.push(() => narrativeData[trigger][subTrigger][context.result][currentPhaseKey]);
    }
    // 7. Move execution specific, with result, generic phase
    if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result]?.Generic) {
        lookupPaths.push(() => narrativeData[trigger][subTrigger][context.result].Generic);
    }
    // 8. Move execution specific, with result, direct array (legacy)
    if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result] && Array.isArray(narrativeData[trigger]?.[subTrigger]?.[context.result])) {
        lookupPaths.push(() => narrativeData[trigger][subTrigger][context.result]);
    }
    // 9. Character-specific, direct array (legacy for general sub-triggers)
    if (narrativeData[trigger]?.[subTrigger] && Array.isArray(narrativeData[trigger]?.[subTrigger])) {
        lookupPaths.push(() => narrativeData[trigger][subTrigger]);
    }
    // 10. General trigger for actor, phase-specific
    if (narrativeData[trigger]?.general?.[currentPhaseKey]) {
        lookupPaths.push(() => narrativeData[trigger].general[currentPhaseKey]);
    }
    // 11. General trigger for actor, generic phase
    if (narrativeData[trigger]?.general?.Generic) {
        lookupPaths.push(() => narrativeData[trigger].general.Generic);
    }
    // 12. General trigger for actor, direct array (legacy)
    if (narrativeData[trigger]?.general && Array.isArray(narrativeData[trigger]?.general)) {
        lookupPaths.push(() => narrativeData[trigger].general);
    }

    // Try paths until a pool is found
    for (const getPool of lookupPaths) {
        pool = getPool();
        if (pool && Array.isArray(pool) && pool.length > 0) {
            return getRandomElement(pool);
        }
    }
    
    // Special handling for raw impact text (collateral damage)
    if (trigger === 'onCollateral' && subTrigger === 'general' && context.impactText) {
        return { type: 'environmental', line: context.impactText };
    }

    return null; // No quote found
}

/**
 * Formats a quote object into a structured event for the battle log.
 * @param {object} quote - The quote object from findNarrativeQuote.
 * @param {object} actor - The character associated with the quote.
 * @param {object} opponent - The opposing character.
 * @param {object} context - Additional context including currentPhaseKey.
 * @returns {object|null} A structured event object or null if quote is invalid.
 */
function formatQuoteEvent(quote, actor, opponent, context) {
    if (!quote || typeof quote.line !== 'string') return null; // Ensure quote and line are valid
    const { type, line } = quote;
    const characterName = actor?.name || 'Narrator';
    const formattedLine = substituteTokens(line, actor, opponent, context);
    
    const actorNameForHtml = actor ? actor.name : "Narrator"; // Default for environmental if no actor
    const actorIdForHtml = actor ? actor.id : "environment";
    const actorSpan = `<span class="char-${actorIdForHtml}">${actorNameForHtml}</span>`;
    
    let htmlContent = "";
    const narrativeClass = `narrative-${type || 'spoken'}`;

    if (type === 'environmental') {
        htmlContent = `<p class="${narrativeClass}">${formattedLine}</p>`;
    } else if (type === 'action') {
        htmlContent = `<p class="${narrativeClass}">${actorSpan} ${formattedLine}</p>`;
    } else { // spoken, internal
        const verb = type === 'internal' ? 'thinks' : 'says';
        htmlContent = `<p class="${narrativeClass}">${actorSpan} ${verb}, "<em>${formattedLine}</em>"</p>`;
    }

    return {
        type: 'dialogue_event', 
        actorId: actor?.id || null, 
        characterName: characterName,
        text: formattedLine, 
        isDialogue: (type === 'spoken' || type === 'internal'),
        isActionNarrative: (type === 'action'),
        isEnvironmental: (type === 'environmental'),
        html_content: htmlContent, 
    };
}

/**
 * Generates a structured object describing a move action for the battle log.
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
    introPhrase = getRandomElement(phaseSpecificIntroPool) || "Responding,"; // Fallback if pool is empty

    if (result.payoff && result.consumedStateName) {
        tacticalPrefix = `Capitalizing on ${opponent?.name || 'the opponent'} being ${result.consumedStateName}, `;
    }
    
    if (actor.tacticalState?.name && actor.tacticalState.duration >= 0 && actor.tacticalState.isPositive) {
        tacticalSuffix += ` ${actor.name} is now ${actor.tacticalState.name}!`;
    } else if (actor.tacticalState?.name && actor.tacticalState.duration >= 0 && !actor.tacticalState.isPositive && move.isRepositionMove) {
        tacticalSuffix += ` However, ${actor.name} is now ${actor.tacticalState.name}!`;
    } else if (move.setup && result.effectiveness.label !== 'Weak' && !move.isRepositionMove) {
        tacticalSuffix += ` The move leaves ${opponent?.name || 'the opponent'} ${move.setup.name}!`;
    }

    let impactSentenceKey = result.effectiveness.label.toUpperCase();
    let impactSentencePool;

    if (move.isRepositionMove) {
        impactSentencePool = impactPhrases.REPOSITION?.[impactSentenceKey];
    } else if (move.type === 'Defense' || move.type === 'Utility') {
        const isReactive = opponent?.lastMove?.type === 'Offense'; // Check opponent and lastMove
        impactSentencePool = isReactive ? impactPhrases.DEFENSE?.REACTIVE : impactPhrases.DEFENSE?.PROACTIVE;
    } else {
        impactSentencePool = impactPhrases.DEFAULT?.[impactSentenceKey];
    }
    const impactSentence = getRandomElement(impactSentencePool) || "The move unfolds."; // Fallback


    let baseActionText;
    if (move.name === "Struggle") {
        baseActionText = `${actor.name} struggles to fight back`;
    } else {
        const verb = conjugatePresent(move.verb || 'executes');
        // Ensure move.object exists and is a string before trying to access its characters
        const objectString = (typeof move.object === 'string') ? move.object : "an action";
        const article = (move.requiresArticle && typeof objectString === 'string' && objectString.length > 0) ? 
                        ((['a','e','i','o','u'].includes(objectString[0].toLowerCase()) ? `an ${objectString}` : `a ${objectString}`)) 
                        : objectString;
        baseActionText = `${actor.name} ${verb} ${article}`;
    }
    
    const fullDescText = substituteTokens(`${introPhrase} ${tacticalPrefix}${baseActionText}. ${impactSentence}${tacticalSuffix}`, actor, opponent);
    
    const moveLineHtml = phaseTemplates.move
        .replace(/{actorId}/g, actor.id)
        .replace(/{actorName}/g, actor.name)
        .replace(/{moveName}/g, move.name)
        .replace(/{moveEmoji}/g, result.effectiveness.emoji || '⚔️') // Use effectiveness emoji for consistency
        .replace(/{effectivenessLabel}/g, result.effectiveness.label)
        .replace(/{effectivenessEmoji}/g, result.effectiveness.emoji)
        .replace(/{moveDescription}/g, `<p class="move-description">${fullDescText}</p>`)
        .replace(/{collateralDamageDescription}/g, ''); // Collateral is separate

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
 * @returns {object|null} A structured event object or null.
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
        specificImpactPhrase = ` ${Array.from(environmentState.specificImpacts).join(' ')}`;
    }
    
     if (move.element && !['physical', 'utility', 'special'].includes(move.element)) {
        description += ` The ${move.element} energy ripples through the area.`;
    }
    const fullCollateralText = `${description}${specificImpactPhrase}`.trim();
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
 * @param {object|null} move - The move object being executed (can be null for initial banter).
 * @param {object} actor - The acting character.
 * @param {object} opponent - The defending character.
 * @param {object|null} result - The result of the move calculation (can be null for initial banter).
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
                // For animated mode, this is a distinct text line.
                // For instant mode, this text is *part* of the move-description paragraph usually.
                // Let's make it distinct for animation, and ensure the transformer can merge if needed for instant mode.
                quoteEvent.isMoveExecutionQuote = true; // Add a flag for the transformer
                turnEventObjects.push(quoteEvent);
            }
        }

        const actionEvent = generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey);
        turnEventObjects.push(actionEvent);

        const collateralEvent = generateCollateralDamageEvent(move, actor, opponent, environmentState, locationData);
        if (collateralEvent) {
            // For instant mode, collateral HTML needs to be part of the move action's HTML content.
            if (actionEvent.html_content) { 
                actionEvent.html_content = actionEvent.html_content.replace(/{collateralDamageDescription}/g, collateralEvent.html_content);
            }
            // For animated mode, it's a separate event.
            turnEventObjects.push(collateralEvent); 
        } else if (actionEvent.html_content) { // If no collateral, ensure placeholder is removed
             actionEvent.html_content = actionEvent.html_content.replace(/{collateralDamageDescription}/g, '');
        }
    }
    return turnEventObjects;
}

/**
 * Generates the final victory line for the winning character.
 * @param {object} winner - The winning character object.
 * @param {object|null} loser - The losing character object (can be null in draws).
 * @returns {string} The final victory line.
 */
export function getFinalVictoryLine(winner, loser) { 
    if (!winner) return "The battle ends."; 
    if (!loser) return `${winner.name} stands victorious.`; 

    const finalQuote = findNarrativeQuote(winner, loser, 'onVictory', 'Default', {});
    if (finalQuote && typeof finalQuote.line === 'string') {
        return substituteTokens(finalQuote.line, winner, loser);
    }
    
    const victoryStyle = winner.victoryStyle || 'default';
    const victoryPhrases = postBattleVictoryPhrases[victoryStyle] || postBattleVictoryPhrases.default;
    const outcomeType = winner.hp > 50 ? 'dominant' : 'narrow';
    let phrase = victoryPhrases[outcomeType] || victoryPhrases.dominant; // Default to dominant
    
    return substituteTokens(phrase, winner, loser); // substituteTokens handles nulls in pronouns
}