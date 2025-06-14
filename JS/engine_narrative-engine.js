// FILE: engine_narrative-engine.js
'use strict';

import { phaseTemplates, impactPhrases, collateralImpactPhrases, introductoryPhrases, postBattleVictoryPhrases } from './narrative-v2.js';
import { locationConditions } from './location-battle-conditions.js';
import { characters as characterData } from './data_characters.js'; 

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
    // Simplified conjugation logic, may need refinement for edge cases
    if (verb.endsWith('s') && verb !== 'is' && verb !== 'has' && verb !== 'does' && verb !== 'goes') {
        // Avoid double 's' like "focusess" unless it's a legitimate verb ending like "passes"
        if (!verb.endsWith("ss") && !verb.endsWith("es") && !verb.endsWith("ies")) {
             // It might already be conjugated, or it's a plural noun used as a verb (less common in this context)
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
 * @param {string} template - The template string with tokens.
 * @param {object} [primaryActorForContext] - The character primarily performing or focused on in the template.
 * @param {object} [secondaryActorForContext] - The other character involved, often the target or opponent.
 * @param {object} [additionalContext={}] - Additional overrides or specific values (e.g., WinnerName, LoserName).
 * @returns {string} The string with tokens replaced.
 */
function substituteTokens(template, primaryActorForContext, secondaryActorForContext, additionalContext = {}) {
    if (typeof template !== 'string') return ''; 
    let text = template;

    const actor = primaryActorForContext;
    const opponent = secondaryActorForContext;

    // Use names from additionalContext if provided (e.g., for Winner/Loser specific lines)
    // Otherwise, default to the passed actor/opponent objects.
    const actorNameDisplay = additionalContext.WinnerName || additionalContext.attackerName || actor?.name || 'A fighter';
    const opponentNameDisplay = additionalContext.LoserName || additionalContext.targetName || opponent?.name || 'Their opponent';
    
    const actorPronouns = actor?.pronouns || { s: 'they', p: 'their', o: 'them' };
    const opponentPronouns = opponent?.pronouns || { s: 'they', p: 'their', o: 'them' };

    const replacements = {
        // General context names, will be overridden by more specific ones if present in additionalContext
        '{actorName}': actorNameDisplay,
        '{opponentName}': opponentNameDisplay,
        '{targetName}': additionalContext.targetName || opponentNameDisplay, // Target is usually the secondary actor
        '{attackerName}': additionalContext.attackerName || actorNameDisplay, // Attacker is usually the primary actor
        '{WinnerName}': additionalContext.WinnerName || actorNameDisplay,
        '{LoserName}': additionalContext.LoserName || opponentNameDisplay,
        '{characterName}': additionalContext.characterName || actorNameDisplay, // Generic character reference

        // Pronouns for the primary "actor" of the sentence
        '{actor.s}': actorPronouns.s,
        '{actor.p}': actorPronouns.p,
        '{actor.o}': actorPronouns.o,
        
        // Pronouns for the "opponent" or secondary character
        '{opponent.s}': opponentPronouns.s,
        '{opponent.p}': opponentPronouns.p,
        '{opponent.o}': opponentPronouns.o,
        
        // Specific Winner/Loser pronouns if context indicates this is a victory/loss line
        '{WinnerPronounS}': (additionalContext.WinnerName === actor?.name ? actorPronouns.s : opponentPronouns.s),
        '{WinnerPronounP}': (additionalContext.WinnerName === actor?.name ? actorPronouns.p : opponentPronouns.p),
        '{WinnerPronounO}': (additionalContext.WinnerName === actor?.name ? actorPronouns.o : opponentPronouns.o),
        '{LoserPronounS}': (additionalContext.LoserName === actor?.name ? actorPronouns.s : opponentPronouns.s),
        '{LoserPronounP}': (additionalContext.LoserName === actor?.name ? actorPronouns.p : opponentPronouns.p),
        '{LoserPronounO}': (additionalContext.LoserName === actor?.name ? actorPronouns.o : opponentPronouns.o),

        '{possessive}': actorPronouns.p, // Defaults to primary actor's possessive
        ...additionalContext // Spread other context items last to allow specific overrides
    };

    for (const [token, value] of Object.entries(replacements)) {
        if (typeof token === 'string' && value !== undefined && value !== null) { 
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
    // Pass actor as primary, opponent as secondary for pronoun context.
    // Additional context (like moveName) is passed through.
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

    // Context for these substitutions: actor is performing, opponent is target
    if (result.payoff && result.consumedStateName) {
        tacticalPrefix = substituteTokens(`Capitalizing on {opponentName} being ${result.consumedStateName}, `, actor, opponent);
    }
    
    if (actor.tacticalState?.name && actor.tacticalState.duration >= 0 && actor.tacticalState.isPositive) {
        tacticalSuffix += substituteTokens(` {actorName} is now ${actor.tacticalState.name}!`, actor, opponent);
    } else if (actor.tacticalState?.name && actor.tacticalState.duration >= 0 && !actor.tacticalState.isPositive && move.isRepositionMove) {
        tacticalSuffix += substituteTokens(` However, {actorName} is now ${actor.tacticalState.name}!`, actor, opponent);
    } else if (move.setup && result.effectiveness.label !== 'Weak' && !move.isRepositionMove) {
        tacticalSuffix += substituteTokens(` The move leaves {opponentName} ${move.setup.name}!`, actor, opponent);
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
    // Substitute tokens in impact sentence separately to ensure {targetName} and {actorName} are correct for this sentence part
    const impactSentence = substituteTokens(impactSentenceTemplate, actor, opponent, {
        '{targetName}': opponent?.name || 'the opponent', // Explicitly target for impact sentence
        '{actorName}': actor?.name || 'The attacker'      // Explicitly actor for impact sentence
    });


    let baseActionTextTemplate;
    if (move.name === "Struggle") {
        baseActionTextTemplate = `{actorName} struggles to fight back`; 
    } else {
        const verb = conjugatePresent(move.verb || 'executes');
        const objectString = (typeof move.object === 'string') ? move.object : "an action";
        const article = (move.requiresArticle && typeof objectString === 'string' && objectString.length > 0) ? 
                        ((['a','e','i','o','u'].includes(objectString[0].toLowerCase()) ? `an ${objectString}` : `a ${objectString}`)) 
                        : objectString;
        baseActionTextTemplate = `{actorName} ${verb} ${article}`; 
    }
    const baseActionText = substituteTokens(baseActionTextTemplate, actor, opponent);
    
    const fullDescText = `${introPhrase} ${tacticalPrefix}${baseActionText}. ${impactSentence}${tacticalSuffix}`;
    
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
    
    const safeLoser = loser || { name: "their opponent", pronouns: { s: 'they', p: 'their', o: 'them' } };

    const finalQuote = findNarrativeQuote(winner, safeLoser, 'onVictory', 'Default', {});
    if (finalQuote && typeof finalQuote.line === 'string') {
        return substituteTokens(finalQuote.line, winner, safeLoser, {
            WinnerName: winner.name, 
            LoserName: safeLoser.name
        });
    }
    
    const winnerVictoryStyle = winner.victoryStyle || 'default'; 
    const victoryPhrasesPool = postBattleVictoryPhrases[winnerVictoryStyle] || postBattleVictoryPhrases.default;
    const outcomeType = winner.hp > 50 ? 'dominant' : 'narrow'; 
    let phraseTemplate = victoryPhrasesPool[outcomeType] || victoryPhrasesPool.dominant; 
    
    const winnerPronounP = winner.pronouns?.p || 'their'; 

    return substituteTokens(phraseTemplate, winner, safeLoser, {
        WinnerName: winner.name,
        LoserName: safeLoser.name,
        WinnerPronounP: winnerPronounP 
    });
}

export function generateCurbstompNarration(rule, attacker, target, isEscape = false) {
    let textTemplate;
    let htmlClass = "narrative-curbstomp highlight-major"; 

    const attackerName = attacker?.name || "Attacker";
    const targetName = target?.name || "Target";
    let genericCharacterName = attackerName; 

    if (rule.appliesToAll) {
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
        // Note: This function is called assuming the *outcome* has been determined.
        // If it's self-sabotage, the battle-engine should pass the selfSabotageMessage template.
        // For now, this function will use successMessage if not explicitly told it's a self-sabotage for this call.
        // The actual logic of *which* message to use for self-sabotage vs success is in battle-engine-core's curbstomp check.
        textTemplate = rule.outcome.successMessage; // Default to success if not clearly a self-sabotage *call*
        if (additionalContext.isSelfSabotageOutcome) { // A hypothetical flag battle-engine would set for this call
            textTemplate = rule.outcome.selfSabotageMessage;
            htmlClass = "narrative-curbstomp highlight-neutral"; // Or some other class for self-sabotage
        }
    } else {
        textTemplate = rule.outcome.successMessage || `${attackerName}'s ${rule.id} overwhelmingly defeats ${targetName}!`;
    }
    
    // The primary context for pronouns is attacker vs target.
    // Additional context ensures specific names like {attackerName} and {targetName} are always correct.
    const substitutedText = substituteTokens(textTemplate, attacker, target, {
        attackerName: attackerName, // explicit
        targetName: targetName,     // explicit
        characterName: genericCharacterName // for {characterName} token if present
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