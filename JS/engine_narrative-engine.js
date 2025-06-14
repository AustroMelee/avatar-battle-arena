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
    if (verb.endsWith('s') && verb !== 'is' && verb !== 'has' && verb !== 'does' && verb !== 'goes') {
        if (!verb.endsWith("ss") && !verb.endsWith("es") && !verb.endsWith("ies")) {
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

// --- MODIFIED: Export substituteTokens ---
export function substituteTokens(template, primaryActorForContext, secondaryActorForContext, additionalContext = {}) {
    if (typeof template !== 'string') return ''; 
    let text = template;

    const actor = primaryActorForContext;
    const opponent = secondaryActorForContext;

    const actorNameDisplay = additionalContext.WinnerName || additionalContext.attackerName || actor?.name || 'A fighter';
    const opponentNameDisplay = additionalContext.LoserName || additionalContext.targetName || opponent?.name || 'Their opponent';
    
    const actorPronouns = actor?.pronouns || { s: 'they', p: 'their', o: 'them' };
    const opponentPronouns = opponent?.pronouns || { s: 'they', p: 'their', o: 'them' };

    const replacements = {
        '{actorName}': actorNameDisplay,
        '{opponentName}': opponentNameDisplay,
        '{targetName}': additionalContext.targetName || opponentNameDisplay, 
        '{attackerName}': additionalContext.attackerName || actorNameDisplay, 
        '{WinnerName}': additionalContext.WinnerName || actorNameDisplay,
        '{LoserName}': additionalContext.LoserName || opponentNameDisplay,
        '{characterName}': additionalContext.characterName || actorNameDisplay, 

        '{actor.s}': actorPronouns.s,
        '{actor.p}': actorPronouns.p,
        '{actor.o}': actorPronouns.o,
        
        '{opponent.s}': opponentPronouns.s,
        '{opponent.p}': opponentPronouns.p,
        '{opponent.o}': opponentPronouns.o,
        
        '{WinnerPronounS}': (additionalContext.WinnerName === actor?.name ? actorPronouns.s : opponentPronouns.s),
        '{WinnerPronounP}': (additionalContext.WinnerName === actor?.name ? actorPronouns.p : opponentPronouns.p),
        '{WinnerPronounO}': (additionalContext.WinnerName === actor?.name ? actorPronouns.o : opponentPronouns.o),
        '{LoserPronounS}': (additionalContext.LoserName === actor?.name ? actorPronouns.s : opponentPronouns.s),
        '{LoserPronounP}': (additionalContext.LoserName === actor?.name ? actorPronouns.p : opponentPronouns.p),
        '{LoserPronounO}': (additionalContext.LoserName === actor?.name ? actorPronouns.o : opponentPronouns.o),

        '{possessive}': actorPronouns.p, 
        ...additionalContext 
    };

    for (const [token, value] of Object.entries(replacements)) {
        if (typeof token === 'string' && value !== undefined && value !== null) { 
            text = text.replace(new RegExp(token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), String(value));
        }
    }
    return text;
 }
// --- END MODIFICATION ---

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
    const impactSentence = substituteTokens(impactSentenceTemplate, actor, opponent, {
        '{targetName}': opponent?.name || 'the opponent', 
        '{actorName}': actor?.name || 'The attacker'      
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
        // Pass winner as primaryActor, loser as secondaryActor for this specific substitution context
        return substituteTokens(finalQuote.line, winner, safeLoser, {
            WinnerName: winner.name, 
            LoserName: safeLoser.name
        });
    }
    
    const winnerVictoryStyle = winner.victoryStyle || 'default'; 
    const victoryPhrasesPool = postBattleVictoryPhrases[winnerVictoryStyle] || postBattleVictoryPhrases.default;
    // Ensure winner.hp is defined, default to 0 if not (though it should be >0 for a winner)
    const winnerHp = winner.hp !== undefined ? winner.hp : 0;
    const outcomeType = winnerHp > 50 ? 'dominant' : 'narrow'; 
    let phraseTemplate = victoryPhrasesPool[outcomeType] || victoryPhrasesPool.dominant; 
    
    const winnerPronounP = winner.pronouns?.p || 'their'; 

    // Pass winner as primaryActor, loser as secondaryActor for this specific substitution context
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

    let additionalContextForTokens = {
        attackerName: attackerName, 
        targetName: targetName,     
        characterName: genericCharacterName 
    };

    if (isEscape) {
        textTemplate = rule.outcome.escapeMessage || `{targetName} narrowly escapes ${attackerName}'s devastating attempt!`;
        htmlClass = "narrative-curbstomp highlight-escape";
        // For escape messages, the "target" of the escape is the one escaping.
        // The "attacker" is the one they escaped from.
        additionalContextForTokens.targetName = targetName; // Character who escaped
        additionalContextForTokens.attackerName = attackerName; // Character who was attempting the curbstomp
    } else if (rule.outcome.type === "conditional_instant_kill_or_self_sabotage") {
        // The battle engine determines if it's self-sabotage. This function receives that outcome.
        // If this function is called for the self-sabotage *part* of a conditional rule:
        if (additionalContextForTokens.isSelfSabotageOutcome) { 
            textTemplate = rule.outcome.selfSabotageMessage || `${attackerName}'s move backfires!`;
            htmlClass = "narrative-curbstomp highlight-neutral";
             // For self-sabotage, the "attacker" is the one affected. "Target" is less relevant or is the original opponent.
            additionalContextForTokens.attackerName = attackerName; 
            additionalContextForTokens.targetName = targetName;
        } else { // Otherwise, it's the success (kill) part of the conditional rule
            textTemplate = rule.outcome.successMessage || `${attackerName}'s ${rule.id} overwhelmingly defeats ${targetName}!`;
        }
    } else {
        textTemplate = rule.outcome.successMessage || `${attackerName}'s ${rule.id} overwhelmingly defeats ${targetName}!`;
    }
    
    // Pass attacker as primary actor, target as secondary actor for pronoun context,
    // but override names with specific roles via additionalContext.
    const substitutedText = substituteTokens(textTemplate, attacker, target, additionalContextForTokens);

    return {
        type: 'curbstomp_event',
        text: substitutedText,
        html_content: `<p class="${htmlClass}">${substitutedText}</p>`,
        curbstompRuleId: rule.id,
        isEscape: isEscape,
        isMajorEvent: !isEscape && !(additionalContextForTokens.isSelfSabotageOutcome) // Self-sabotage isn't a "major victory" type event
    };
}