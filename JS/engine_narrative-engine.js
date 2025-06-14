// FILE: engine_narrative-engine.js
'use strict';

import { phaseTemplates, impactPhrases, collateralImpactPhrases, introductoryPhrases, postBattleVictoryPhrases } from './narrative-v2.js';
import { locationConditions } from './location-battle-conditions.js';

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

function substituteTokens(template, actor, opponent, context = {}) {
    if (typeof template !== 'string') return ''; 
    let text = template;
    const replacements = {
        '{actorName}': actor?.name || 'A fighter',
        '{opponentName}': opponent?.name || 'Their opponent',
        '{targetName}': opponent?.name || 'The target',
        '{characterName}': context?.characterName || actor?.name || 'A fighter', // For curbstomp characterName
        '{attackerName}': context?.attackerName || actor?.name || 'Attacker', // For curbstomp rule messages
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
        const isReactive = opponent?.lastMove?.type === 'Offense'; 
        impactSentencePool = isReactive ? impactPhrases.DEFENSE?.REACTIVE : impactPhrases.DEFENSE?.PROACTIVE;
    } else {
        impactSentencePool = impactPhrases.DEFAULT?.[impactSentenceKey];
    }
    const impactSentence = getRandomElement(impactSentencePool) || "The move unfolds."; 


    let baseActionText;
    if (move.name === "Struggle") {
        baseActionText = `${actor.name} struggles to fight back`;
    } else {
        const verb = conjugatePresent(move.verb || 'executes');
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
        isKOAction: result.isKOAction || false // Add this from result if it exists
    };
}

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
    if (!loser) return `${winner.name} stands victorious.`; 

    const finalQuote = findNarrativeQuote(winner, loser, 'onVictory', 'Default', {});
    if (finalQuote && typeof finalQuote.line === 'string') {
        return substituteTokens(finalQuote.line, winner, loser);
    }
    
    const winnerVictoryStyle = winner.victoryStyle || 'default'; // ensure victoryStyle exists
    const victoryPhrasesPool = postBattleVictoryPhrases[winnerVictoryStyle] || postBattleVictoryPhrases.default;
    const outcomeType = winner.hp > 50 ? 'dominant' : 'narrow'; // ensure hp exists
    let phraseTemplate = victoryPhrasesPool[outcomeType] || victoryPhrasesPool.dominant; // Fallback for safety
    
    // Ensure pronouns exist on winner object before substitution
    const winnerPronounP = winner.pronouns?.p || 'their'; 

    return substituteTokens(phraseTemplate, winner, loser, {
        '{WinnerName}': winner.name,
        '{LoserName}': loser.name,
        '{WinnerPronounP}': winnerPronounP 
    });
}

// --- NEW: Narrative for Curbstomp Events ---
export function generateCurbstompNarration(rule, attacker, target, isEscape = false) {
    let text;
    let htmlClass = "narrative-curbstomp highlight-major"; // Default for significant event

    if (isEscape) {
        text = rule.outcome.escapeMessage || `${target.name} narrowly escapes ${attacker.name}'s devastating attempt using ${rule.id}!`;
        htmlClass = "narrative-curbstomp highlight-escape";
    } else if (rule.outcome.type === "conditional_instant_kill_or_self_sabotage" && rule.outcome.selfSabotageMessage) {
        // This case will be handled by battle engine based on the sabotage roll
        // For now, assume success if not escape
        text = rule.outcome.successMessage || `${attacker.name}'s ${rule.id} overwhelmingly defeats ${target.name}!`;
    } else {
        text = rule.outcome.successMessage || `${attacker.name}'s ${rule.id} overwhelmingly defeats ${target.name}!`;
    }
    
    // Substitute placeholders in the chosen message
    const characterForName = rule.appliesToAll ? (Math.random() < 0.5 ? attacker : target) : (rule.appliesToCharacter ? (characters[rule.appliesToCharacter] || attacker) : attacker);
    const substitutedText = substituteTokens(text, attacker, target, {
        '{attackerName}': attacker.name,
        '{targetName}': target.name,
        '{characterName}': characterForName.name // For appliesToAll or appliesToCharacter outcomes
    });

    return {
        type: 'curbstomp_event',
        text: substitutedText,
        html_content: `<p class="${htmlClass}">${substitutedText}</p>`,
        curbstompRuleId: rule.id,
        isEscape: isEscape,
        isMajorEvent: !isEscape // Major if not an escape
    };
}