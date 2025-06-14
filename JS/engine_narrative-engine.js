// FILE: engine_narrative-engine.js
'use strict';

import { phaseTemplates, impactPhrases, collateralImpactPhrases, introductoryPhrases, postBattleVictoryPhrases } from './narrative-v2.js';
import { locationConditions } from './location-battle-conditions.js';
import { characters as characterData } from './data_characters.js'; // For name lookups if actor/opponent is just ID

const getRandomElement = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

function conjugatePresent(verbPhrase) { 
    if (!verbPhrase) return '';
    const words = verbPhrase.split(' ');
    let verb = words[0];
    const rest = words.slice(1).join(' ');
    
    const baseFormExceptions = [
        'erupts', 'lashes', 'assumes', 'controls', 'focuses', 'executes', 
        'blocks', 'throws', 'strikes', 'rides', 'unleashes', 'forms', 
        'creates', 'pushes', 'sweeps', 'sends', 'dons', 'slams', 
        'bends', 'launches', 'entombs', 'pins', 'devises', 'springs', 
        'ignites', 'generates', 'summons', 'propels', 'triggers', 'hurls', 
        'raises', 'conjures', 'inflicts', 'ends'
    ];

    if (baseFormExceptions.includes(verb)) { 
        return verbPhrase;
    }
    if (verb.endsWith('s') && verb !== 'is' && verb !== 'has' && verb !== 'does' && verb !== 'goes') { 
        if (/(ss|sh|ch|x|z|o)es$/.test(verb) || /[^aeiou]ies$/.test(verb) || (/[aeiou]s$/.test(verb) && !verb.endsWith("ss"))) {
           // Looks like it might already be correct
        } else if (verb.length > 1 && verb.charAt(verb.length-2) !== 's') { 
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
    } else if (!verb.endsWith('s')) { 
        verb = verb + 's';
    }
    return rest ? `${verb} ${rest}` : verb;
}

/**
 * Substitutes tokens in a template string with provided values.
 * Actor/Opponent are the primary context. Context object can override or add.
 * @param {string} template - The template string with tokens.
 * @param {object} [actor] - The primary acting character object.
 * @param {object} [opponent] - The primary opposing character object.
 * @param {object} [context={}] - Additional context for token replacement.
 *                                 Special keys: '{WinnerName}', '{LoserName}' for victory lines.
 *                                 '{attackerName}', '{targetName}' for curbstomp/action lines.
 * @returns {string} The string with tokens replaced.
 */
function substituteTokens(template, actor, opponent, context = {}) {
    if (typeof template !== 'string') return ''; 
    let text = template;

    // Determine primary actor/opponent for pronouns and default names
    // If context provides Winner/Loser, those take precedence for naming in those specific templates
    const primaryActor = context.WinnerName && actor?.name === context.WinnerName ? actor : (context.attackerName && actor?.name === context.attackerName ? actor : actor);
    const primaryOpponent = context.LoserName && opponent?.name === context.LoserName ? opponent : (context.targetName && opponent?.name === context.targetName ? opponent : opponent);

    const replacements = {
        '{actorName}': primaryActor?.name || context.attackerName || 'A fighter',
        '{opponentName}': primaryOpponent?.name || context.targetName || 'Their opponent',
        '{targetName}': primaryOpponent?.name || context.targetName || 'The target', // Often same as opponent
        '{attackerName}': primaryActor?.name || context.attackerName || 'The attacker', // For curbstomp messages
        '{WinnerName}': context.WinnerName || primaryActor?.name || 'The Victor',
        '{LoserName}': context.LoserName || primaryOpponent?.name || 'The Vanquished',
        
        '{actor.s}': primaryActor?.pronouns?.s || 'they',
        '{actor.p}': primaryActor?.pronouns?.p || 'their',
        '{actor.o}': primaryActor?.pronouns?.o || 'them',
        
        '{opponent.s}': primaryOpponent?.pronouns?.s || 'they',
        '{opponent.p}': primaryOpponent?.pronouns?.p || 'their',
        '{opponent.o}': primaryOpponent?.pronouns?.o || 'them',
        
        // Specific possessives if context has Winner/Loser (actor/opponent might be ambiguous then)
        '{WinnerPronounS}': (context.WinnerName === actor?.name ? actor?.pronouns?.s : opponent?.pronouns?.s) || 'they',
        '{WinnerPronounP}': (context.WinnerName === actor?.name ? actor?.pronouns?.p : opponent?.pronouns?.p) || 'their',
        '{WinnerPronounO}': (context.WinnerName === actor?.name ? actor?.pronouns?.o : opponent?.pronouns?.o) || 'them',
        '{LoserPronounS}': (context.LoserName === actor?.name ? actor?.pronouns?.s : opponent?.pronouns?.s) || 'they',
        '{LoserPronounP}': (context.LoserName === actor?.name ? actor?.pronouns?.p : opponent?.pronouns?.p) || 'their',
        '{LoserPronounO}': (context.LoserName === actor?.name ? actor?.pronouns?.o : opponent?.pronouns?.o) || 'them',

        '{possessive}': primaryActor?.pronouns?.p || 'their', 
        ...context // Spread other context items last to allow specific overrides
    };

    for (const [token, value] of Object.entries(replacements)) {
        if (typeof token === 'string' && value !== undefined) {
            text = text.replace(new RegExp(token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), String(value));
        }
    }
    return text;
 }

export function findNarrativeQuote(actor, opponent, trigger, subTrigger, context = {}) {
    if (!actor || !actor.narrative) return null; 
    const narrativeData = actor.narrative;
    let pool = null;
    const currentPhaseKey = context.currentPhaseKey || 'Generic'; 

    const lookupPaths = [];

    if (opponent?.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger]?.[currentPhaseKey]) {
        lookupPaths.push(() => actor.relationships[opponent.id].narrative[trigger][subTrigger][currentPhaseKey]);
    }
    if (opponent?.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger]?.Generic) {
        lookupPaths.push(() => actor.relationships[opponent.id].narrative[trigger][subTrigger].Generic);
    }
    if (opponent?.id && actor.relationships?.[opponent.id]?.narrative?.[trigger]?.[subTrigger] && Array.isArray(actor.relationships[opponent.id].narrative[trigger][subTrigger])) {
        lookupPaths.push(() => actor.relationships[opponent.id].narrative[trigger][subTrigger]);
    }
    if (narrativeData[trigger]?.[subTrigger]?.[currentPhaseKey]) {
        lookupPaths.push(() => narrativeData[trigger][subTrigger][currentPhaseKey]);
    }
    if (narrativeData[trigger]?.[subTrigger]?.Generic) {
        lookupPaths.push(() => narrativeData[trigger][subTrigger].Generic);
    }
    if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result]?.[currentPhaseKey]) {
        lookupPaths.push(() => narrativeData[trigger][subTrigger][context.result][currentPhaseKey]);
    }
    if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result]?.Generic) {
        lookupPaths.push(() => narrativeData[trigger][subTrigger][context.result].Generic);
    }
    if (trigger === 'onMoveExecution' && narrativeData[trigger]?.[subTrigger]?.[context.result] && Array.isArray(narrativeData[trigger]?.[subTrigger]?.[context.result])) {
        lookupPaths.push(() => narrativeData[trigger][subTrigger][context.result]);
    }
    if (narrativeData[trigger]?.[subTrigger] && Array.isArray(narrativeData[trigger]?.[subTrigger])) {
        lookupPaths.push(() => narrativeData[trigger][subTrigger]);
    }
    if (narrativeData[trigger]?.general?.[currentPhaseKey]) {
        lookupPaths.push(() => narrativeData[trigger].general[currentPhaseKey]);
    }
    if (narrativeData[trigger]?.general?.Generic) {
        lookupPaths.push(() => narrativeData[trigger].general.Generic);
    }
    if (narrativeData[trigger]?.general && Array.isArray(narrativeData[trigger]?.general)) {
        lookupPaths.push(() => narrativeData[trigger].general);
    }

    for (const getPool of lookupPaths) {
        pool = getPool();
        if (pool && Array.isArray(pool) && pool.length > 0) {
            return getRandomElement(pool);
        }
    }
    
    if (trigger === 'onCollateral' && subTrigger === 'general' && context.impactText) {
        return { type: 'environmental', line: context.impactText };
    }

    return null; 
}

function formatQuoteEvent(quote, actor, opponent, context) {
    if (!quote || typeof quote.line !== 'string') return null; 
    const { type, line } = quote;
    const characterName = actor?.name || 'Narrator';
    // Pass actor and opponent directly for pronoun resolution, context for specific name overrides
    const formattedLine = substituteTokens(line, actor, opponent, context);
    
    const actorNameForHtml = actor ? actor.name : "Narrator"; 
    const actorIdForHtml = actor ? actor.id : "environment";
    const actorSpan = `<span class="char-${actorIdForHtml}">${actorNameForHtml}</span>`;
    
    let htmlContent = "";
    const narrativeClass = `narrative-${type || 'spoken'}`;

    if (type === 'environmental') {
        htmlContent = `<p class="${narrativeClass}">${formattedLine}</p>`;
    } else if (type === 'action') {
        htmlContent = `<p class="${narrativeClass}">${actorSpan} ${formattedLine}</p>`;
    } else { 
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

function generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey) {
    let introPhrase = '';
    let tacticalPrefix = '';
    let tacticalSuffix = '';

    const phaseSpecificIntroPool = introductoryPhrases[currentPhaseKey] || introductoryPhrases.Generic;
    introPhrase = getRandomElement(phaseSpecificIntroPool) || "Responding,"; 

    if (result.payoff && result.consumedStateName) {
        tacticalPrefix = `Capitalizing on {opponentName} being ${result.consumedStateName}, `;
    }
    
    if (actor.tacticalState?.name && actor.tacticalState.duration >= 0 && actor.tacticalState.isPositive) {
        tacticalSuffix += ` {actorName} is now ${actor.tacticalState.name}!`; // actorName explicitly for clarity
    } else if (actor.tacticalState?.name && actor.tacticalState.duration >= 0 && !actor.tacticalState.isPositive && move.isRepositionMove) {
        tacticalSuffix += ` However, {actorName} is now ${actor.tacticalState.name}!`;
    } else if (move.setup && result.effectiveness.label !== 'Weak' && !move.isRepositionMove) {
        tacticalSuffix += ` The move leaves {opponentName} ${move.setup.name}!`;
    }

    let impactSentenceKey = result.effectiveness.label.toUpperCase();
    let impactSentencePool;

    if (move.isRepositionMove) {
        impactSentencePool = impactPhrases.REPOSITION?.[impactSentenceKey];
    } else if (move.type === 'Defense' || move.type === 'Utility') {
        const isReactive = opponent?.lastMove?.type === 'Offense'; 
        impactSentencePool = isReactive ? impactPhrases.DEFENSE?.REACTIVE : impactPhrases.DEFENSE?.PROACTIVE;
    } else {
        impactSentencePool = impactPhrases.DEFAULT?.[impactSentenceKey];
    }
    const impactSentenceTemplate = getRandomElement(impactSentencePool) || "The move unfolds."; 
    // Substitute tokens in impact sentence separately to ensure {targetName} is opponent
    const impactSentence = substituteTokens(impactSentenceTemplate, actor, opponent, {'{targetName}': opponent?.name || 'the opponent'});


    let baseActionText;
    if (move.name === "Struggle") {
        baseActionText = `{actorName} struggles to fight back`; // Use actorName token
    } else {
        const verb = conjugatePresent(move.verb || 'executes');
        const objectString = (typeof move.object === 'string') ? move.object : "an action";
        const article = (move.requiresArticle && typeof objectString === 'string' && objectString.length > 0) ? 
                        ((['a','e','i','o','u'].includes(objectString[0].toLowerCase()) ? `an ${objectString}` : `a ${objectString}`)) 
                        : objectString;
        baseActionText = `{actorName} ${verb} ${article}`; // Use actorName token
    }
    
    // Substitute everything together, ensuring actor and opponent are correctly contextualized for this line
    const fullDescText = substituteTokens(`${introPhrase} ${tacticalPrefix}${baseActionText}. ${impactSentence}${tacticalSuffix}`, actor, opponent);
    
    const moveLineHtml = phaseTemplates.move
        .replace(/{actorId}/g, actor.id)
        .replace(/{actorName}/g, actor.name)
        .replace(/{moveName}/g, move.name)
        .replace(/{moveEmoji}/g, result.effectiveness.emoji || '⚔️') 
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
        html_content: moveLineHtml,
        isKOAction: result.isKOAction || false 
    };
}

function generateCollateralDamageEvent(move, actor, opponent, environmentState, locationData) {
    if (!move.collateralImpact || move.collateralImpact === 'none' || environmentState.damageLevel === 0) {
        return null;
    }
    const impactLevel = move.collateralImpact.toUpperCase();
    if (!collateralImpactPhrases[impactLevel] || collateralImpactPhrases[impactLevel].length === 0) return null;
    
    const collateralPhraseTemplate = getRandomElement(collateralImpactPhrases[impactLevel]);
    if (!collateralPhraseTemplate) return null;

    // Ensure actor and opponent context is correctly passed for token substitution
    const collateralPhrase = substituteTokens(collateralPhraseTemplate, actor, opponent);

    let description = `${actor.name}'s attack impacts the surroundings: ${collateralPhrase}`;
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

export function generateTurnNarrationObjects(events, move, actor, opponent, result, environmentState, locationData, currentPhaseKey, isInitialBanter = false) {
    let turnEventObjects = [];

    events.forEach(event => {
        // For dialogue, the "actor" of the quote is primary for pronouns, opponent is secondary
        const quoteEvent = formatQuoteEvent(event.quote, event.actor, opponent, { '{moveName}': move?.name, currentPhaseKey });
        if (quoteEvent) {
            turnEventObjects.push(quoteEvent);
        }
    });
    
    if (!isInitialBanter && move && result) {
        const moveQuoteContext = { result: result.effectiveness.label, currentPhaseKey };
        // For move execution quotes, "actor" is the one performing the move
        const moveExecutionQuote = findNarrativeQuote(actor, opponent, 'onMoveExecution', move.name, moveQuoteContext);
        if (moveExecutionQuote) {
            const quoteEvent = formatQuoteEvent(moveExecutionQuote, actor, opponent, {currentPhaseKey});
            if(quoteEvent) {
                quoteEvent.isMoveExecutionQuote = true; 
                turnEventObjects.push(quoteEvent);
            }
        }

        const actionEvent = generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey);
        turnEventObjects.push(actionEvent);

        const collateralEvent = generateCollateralDamageEvent(move, actor, opponent, environmentState, locationData);
        if (collateralEvent) {
            if (actionEvent.html_content) { 
                actionEvent.html_content = actionEvent.html_content.replace(/{collateralDamageDescription}/g, collateralEvent.html_content);
            }
            turnEventObjects.push(collateralEvent); 
        } else if (actionEvent.html_content) { 
             actionEvent.html_content = actionEvent.html_content.replace(/{collateralDamageDescription}/g, '');
        }
    }
    return turnEventObjects;
}

export function getFinalVictoryLine(winner, loser) { 
    if (!winner) return "The battle ends."; 
    
    // Ensure loser is at least a minimal object for token substitution if null
    const safeLoser = loser || { name: "their opponent", pronouns: { s: 'they', p: 'their', o: 'them' } };

    const finalQuote = findNarrativeQuote(winner, safeLoser, 'onVictory', 'Default', {});
    if (finalQuote && typeof finalQuote.line === 'string') {
        // Pass winner as actor, loser as opponent for this specific substitution context
        return substituteTokens(finalQuote.line, winner, safeLoser, {
            '{WinnerName}': winner.name, // Explicitly for victory lines
            '{LoserName}': safeLoser.name
        });
    }
    
    const winnerVictoryStyle = winner.victoryStyle || 'default'; 
    const victoryPhrasesPool = postBattleVictoryPhrases[winnerVictoryStyle] || postBattleVictoryPhrases.default;
    const outcomeType = winner.hp > 50 ? 'dominant' : 'narrow'; 
    let phraseTemplate = victoryPhrasesPool[outcomeType] || victoryPhrasesPool.dominant; 
    
    const winnerPronounP = winner.pronouns?.p || 'their'; 

    return substituteTokens(phraseTemplate, winner, safeLoser, {
        '{WinnerName}': winner.name,
        '{LoserName}': safeLoser.name,
        '{WinnerPronounP}': winnerPronounP 
    });
}

export function generateCurbstompNarration(rule, attacker, target, isEscape = false) {
    let textTemplate;
    let htmlClass = "narrative-curbstomp highlight-major"; 

    const attackerName = attacker?.name || "Attacker";
    const targetName = target?.name || "Target";
    // Determine the character name for "{characterName}" token if rule applies to "All" or specific character
    let genericCharacterName = attackerName; // Default to attacker
    if (rule.appliesToAll) {
        // If applies to all, and there's a clear "loser" from the rule type, use that
        if (rule.outcome?.type?.includes("loss_random") || rule.outcome?.type?.includes("death_target")) {
            genericCharacterName = targetName;
        } else if (rule.outcome?.type?.includes("loss_character") && rule.appliesToCharacter === target?.id) {
            genericCharacterName = targetName;
        }
    } else if (rule.appliesToCharacter) {
        genericCharacterName = characterData[rule.appliesToCharacter]?.name || (rule.appliesToCharacter === attacker?.id ? attackerName : targetName);
    }


    if (isEscape) {
        textTemplate = rule.outcome.escapeMessage || `{targetName} narrowly escapes ${attackerName}'s devastating attempt!`;
        htmlClass = "narrative-curbstomp highlight-escape";
    } else if (rule.outcome.type === "conditional_instant_kill_or_self_sabotage" && rule.outcome.selfSabotageMessage) {
        // This specific text is for self-sabotage, success message will be used otherwise.
        // The actual determination of self-sabotage happens in battle-engine-core.
        // This function assumes it's being called for the *successful* outcome if not escape.
        textTemplate = rule.outcome.successMessage || `${attackerName}'s ${rule.id} overwhelmingly defeats ${targetName}!`;
    } else {
        textTemplate = rule.outcome.successMessage || `${attackerName}'s ${rule.id} overwhelmingly defeats ${targetName}!`;
    }
    
    const substitutedText = substituteTokens(textTemplate, attacker, target, {
        '{attackerName}': attackerName,
        '{targetName}': targetName,
        '{characterName}': genericCharacterName 
    });

    return {
        type: 'curbstomp_event',
        text: substitutedText,
        html_content: `<p class="${htmlClass}">${substitutedText}</p>`,
        curbstompRuleId: rule.id,
        isEscape: isEscape,
        isMajorEvent: !isEscape 
    };
}