// FILE: js/engine_narrative-engine.js
'use strict';

// ====================================================================================
//  Narrative Engine Library (v3.6 - Lightning Redirection Narrative)
// ====================================================================================
//  - Added `RedirectedSuccess` and `RedirectedFail` effectiveness levels.
//  - Added specific `impactPhrases` for these redirection outcomes.
// ====================================================================================

// --- UPDATED IMPORTS ---
import { effectivenessLevels } from './data_narrative_effectiveness.js';
import { phaseTemplates } from './data_narrative_phases.js';
import { impactPhrases } from './data_narrative_outcomes.js';
import { collateralImpactPhrases } from './data_narrative_collateral.js';
import { introductoryPhrases } from './data_narrative_introductions.js';
import { postBattleVictoryPhrases } from './data_narrative_postbattle.js';
import { escalationStateNarratives } from './data_narrative_escalation.js';
// --- END UPDATED IMPORTS ---

import { locationConditions } from './location-battle-conditions.js';
import { characters as characterData } from './data_characters.js';
import { getRandomElement } from './engine_battle-engine-core.js';
import { ESCALATION_STATES } from './engine_escalation.js';


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
        // Already conjugated (or plural noun used as verb, which is rare in this context)
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

export function substituteTokens(template, primaryActorForContext, secondaryActorForContext, additionalContext = {}) {
    if (typeof template !== 'string') return '';
    let text = template;

    const actor = primaryActorForContext;
    const opponent = secondaryActorForContext;

    const actorNameDisplay = additionalContext.WinnerName || additionalContext.attackerName || additionalContext.characterName || actor?.name || 'A fighter';
    const opponentNameDisplay = additionalContext.LoserName || additionalContext.targetName || (actor?.id === opponent?.id ? 'their reflection' : opponent?.name) || 'Their opponent';

    const actorPronouns = actor?.pronouns || { s: 'they', p: 'their', o: 'them' };
    const opponentPronouns = opponent?.pronouns || { s: 'they', p: 'their', o: 'them' };

    const winnerPronouns = (additionalContext.WinnerName === actor?.name) ? actorPronouns : opponentPronouns;
    const loserPronouns = (additionalContext.LoserName === actor?.name) ? actorPronouns : opponentPronouns;


    const replacements = {
        '{actorName}': additionalContext.attackerName || actor?.name || 'A fighter',
        '{opponentName}': additionalContext.targetName || (actor?.id === opponent?.id ? 'their reflection' : opponent?.name) || 'Their opponent',

        '{targetName}': additionalContext.targetName || (actor?.id === opponent?.id ? 'their reflection' : opponent?.name) || 'Their opponent',
        '{attackerName}': additionalContext.attackerName || actor?.name || 'A fighter',

        '{WinnerName}': additionalContext.WinnerName || actorNameDisplay,
        '{LoserName}': additionalContext.LoserName || opponentNameDisplay,

        '{characterName}': additionalContext.characterName || actorNameDisplay,

        '{actor.s}': actorPronouns.s,
        '{actor.p}': actorPronouns.p,
        '{actor.o}': actorPronouns.o,

        '{opponent.s}': opponentPronouns.s,
        '{opponent.p}': opponentPronouns.p,
        '{opponent.o}': opponentPronouns.o,

        '{WinnerPronounS}': winnerPronouns.s,
        '{WinnerPronounP}': winnerPronouns.p,
        '{WinnerPronounO}': winnerPronouns.o,
        '{LoserPronounS}': loserPronouns.s,
        '{LoserPronounP}': loserPronouns.p,
        '{LoserPronounO}': loserPronouns.o,

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

export function findNarrativeQuote(actor, opponent, trigger, subTrigger, context = {}) {
    if (!actor || !actor.narrative) return null;
    const narrativeData = actor.narrative;
    let pool = null;
    const currentPhaseKey = context.currentPhaseKey || 'Generic';
    const aiLogEntry = context.aiLogEntry || {};

    if (trigger === 'onIntentSelection' && aiLogEntry.isEscalationFinisherAttempt && context.move?.type === 'Finisher') {
        if (introductoryPhrases.EscalationFinisher && introductoryPhrases.EscalationFinisher.length > 0) {
            return { type: 'action', line: getRandomElement(introductoryPhrases.EscalationFinisher) };
        }
    }

    const lookupPaths = [];

    // Relationship-specific narrative first
    if (opponent?.id && actor.relationships?.[opponent.id]?.narrative) {
        const relNarrative = actor.relationships[opponent.id].narrative;
        if (relNarrative[trigger]?.[subTrigger]?.[currentPhaseKey]) {
            lookupPaths.push(() => relNarrative[trigger][subTrigger][currentPhaseKey]);
        }
        if (relNarrative[trigger]?.[subTrigger]?.Generic) {
            lookupPaths.push(() => relNarrative[trigger][subTrigger].Generic);
        }
        if (trigger === 'onMoveExecution' && relNarrative[trigger]?.[subTrigger]?.[context.result]?.[currentPhaseKey]) {
            lookupPaths.push(() => relNarrative[trigger][subTrigger][context.result][currentPhaseKey]);
        }
        if (trigger === 'onMoveExecution' && relNarrative[trigger]?.[subTrigger]?.[context.result]?.Generic) {
            lookupPaths.push(() => relNarrative[trigger][subTrigger][context.result].Generic);
        }
        if (trigger === 'onMoveExecution' && relNarrative[trigger]?.[subTrigger]?.[context.result] && Array.isArray(relNarrative[trigger]?.[subTrigger]?.[context.result])) {
           lookupPaths.push(() => relNarrative[trigger][subTrigger][context.result]);
        }
         if (relNarrative[trigger]?.[subTrigger] && Array.isArray(relNarrative[trigger]?.[subTrigger])) { // General subtrigger array
            lookupPaths.push(() => relNarrative[trigger][subTrigger]);
        }
    }

    // Character's general narrative
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

    // Escalation state observed
    if (trigger === 'onEscalationStateObserved' && narrativeData[trigger]?.[context.observedStateKey]?.[currentPhaseKey]) {
        lookupPaths.push(() => narrativeData[trigger][context.observedStateKey][currentPhaseKey]);
    }
    if (trigger === 'onEscalationStateObserved' && narrativeData[trigger]?.[context.observedStateKey]?.Generic) {
        lookupPaths.push(() => narrativeData[trigger][context.observedStateKey].Generic);
    }

    // General trigger narrative (less specific than subTrigger)
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

export function formatQuoteEvent(quote, actor, opponent, context) {
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
        htmlContent = `<p class="${narrativeClass}">${substituteTokens(line, actor, opponent, context)}</p>`;
    } else {
        const verb = type === 'internal' ? 'thinks' : 'says';
        htmlContent = `<p class="${narrativeClass}">${actorSpan} ${verb}, "<em>${formattedLine}</em>"</p>`;
    }

    return {
        type: 'dialogue_event',
        actorId: actor?.id || null,
        characterName: characterName,
        text: formattedLine,
        isDialogue: (type === 'spoken' || type === 'internal' || type === 'action'),
        isActionNarrative: (type === 'action'),
        isEnvironmental: (type === 'environmental'),
        html_content: htmlContent,
    };
 }

export function generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey, aiLogEntry = {}) {
    let introPhrase = '';
    let tacticalPrefix = '';
    let tacticalSuffix = '';

    // Handle Lightning Redirection narrative first, based on result flags
    if (result.isReactedAction && result.reactionType === 'lightning_redirection') {
        // Narrative events for redirection are now expected to be in result.narrativeEvents
        // This function will primarily format the "move line" part.
        // The actual descriptive text of what happened during redirection comes from narrativeEvents.
        const redirector = actor; // In this context, actor is the one who redirected (Zuko)
        const lightningUser = opponent; // Opponent is the one who threw lightning (Azula/Ozai)

        const redirectEffectiveness = effectivenessLevels[result.effectiveness.label.toUpperCase()] || effectivenessLevels.NORMAL;

        const moveLineHtml = phaseTemplates.move
            .replace(/{actorId}/g, redirector.id)
            .replace(/{actorName}/g, redirector.name)
            .replace(/{moveName}/g, "Lightning Redirection") // Standardized name for the reactive move
            .replace(/{moveEmoji}/g, redirectEffectiveness.emoji || '⚡↩️')
            .replace(/{effectivenessLabel}/g, result.effectiveness.label)
            .replace(/{effectivenessEmoji}/g, redirectEffectiveness.emoji)
            .replace(/{moveDescription}/g, '') // Narrative events from result.narrativeEvents will fill this
            .replace(/{collateralDamageDescription}/g, '');

        return {
            type: 'move_action_event',
            actorId: redirector.id,
            characterName: redirector.name,
            moveName: "Lightning Redirection",
            moveType: "lightning",
            effectivenessLabel: result.effectiveness.label,
            text: result.narrativeEvents.map(e => e.text).join(' ') || `${redirector.name} redirects ${lightningUser.name}'s lightning!`, // Fallback text
            isMoveAction: true,
            html_content: moveLineHtml, // This will be combined with narrativeEvents from result
            isKOAction: false, // Redirection itself isn't usually a KO
            isRedirectedAction: true,
            narrativeEventsToPrepend: result.narrativeEvents || [] // To be processed by generateTurnNarrationObjects
        };
    }
    // Standard move narrative generation
    if (aiLogEntry.isEscalationFinisherAttempt && move.type === 'Finisher') {
        const escalationFinisherPool = introductoryPhrases.EscalationFinisher || introductoryPhrases.Late;
        introPhrase = getRandomElement(escalationFinisherPool) || "Sensing the end is near,";
        introPhrase = substituteTokens(introPhrase, actor, opponent);
    } else {
        const intentForIntro = aiLogEntry.intent || 'StandardExchange';
        const introQuote = findNarrativeQuote(actor, opponent, 'onIntentSelection', intentForIntro, { currentPhaseKey, aiLogEntry, move });
        if (introQuote && introQuote.type === 'action') {
            introPhrase = substituteTokens(introQuote.line, actor, opponent);
        } else { // If introQuote is dialogue or null, use default phase/generic intro
            const phaseSpecificIntroPool = introductoryPhrases[currentPhaseKey] || introductoryPhrases.Generic;
            introPhrase = getRandomElement(phaseSpecificIntroPool) || "Responding,";
        }
    }


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

    // Use specific impact phrases for redirection if they exist
    if (result.effectiveness.label === "RedirectedSuccess" || result.effectiveness.label === "RedirectedFail") {
        impactSentencePool = impactPhrases.DEFAULT?.[impactSentenceKey]; // These are now in DEFAULT
    } else if (move.isRepositionMove) {
        impactSentencePool = impactPhrases.REPOSITION?.[impactSentenceKey];
    } else if (move.type === 'Defense' || move.type === 'Utility') {
        const isReactive = opponent?.lastMove?.type === 'Offense';
        impactSentencePool = isReactive ? impactPhrases.DEFENSE?.REACTIVE : impactPhrases.DEFENSE?.PROACTIVE;
    } else {
        impactSentencePool = impactPhrases.DEFAULT?.[impactSentenceKey];
    }

    const impactSentenceTemplate = getRandomElement(impactSentencePool) || "The move unfolds.";
    // For redirection, the "actor" of the impact phrase is the one who *attempted* redirection (Zuko).
    // The "target" is the original attacker (Azula/Ozai).
    const impactActor = (result.effectiveness.label === "RedirectedSuccess" || result.effectiveness.label === "RedirectedFail") ? actor : actor; // Correct actor for impact phrase context
    const impactTarget = (result.effectiveness.label === "RedirectedSuccess" || result.effectiveness.label === "RedirectedFail") ? opponent : opponent;

    const impactSentence = substituteTokens(impactSentenceTemplate, impactActor, impactTarget, {
        '{targetName}': impactTarget?.name || 'the opponent',
        '{actorName}': impactActor?.name || 'The attacker'
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

    let fullDescText;
    // For redirected actions, the introPhrase might already be set by the redirection logic.
    // We want the main "move description" to be the impact sentence.
    if (result.isReactedAction) {
        fullDescText = impactSentence; // The introPhrase is handled by the narrativeEventsToPrepend
    } else if (introPhrase.includes(actor.name)) {
        fullDescText = `${introPhrase} ${tacticalPrefix}${conjugatePresent(move.verb || 'executes')} ${ (move.requiresArticle ? ( (['a','e','i','o','u'].includes(move.object[0].toLowerCase()) ? `an ${move.object}` : `a ${move.object}`) ) : move.object) || 'an action'}. ${impactSentence}${tacticalSuffix}`;
    } else {
        fullDescText = `${introPhrase} ${tacticalPrefix}${baseActionText}. ${impactSentence}${tacticalSuffix}`;
    }


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

export function generateEscalationNarrative(fighter, oldState, newState) {
    if (!fighter || !newState || oldState === newState) return null;

    let flavorTextPool = [];
    if (escalationStateNarratives[fighter.id] && escalationStateNarratives[fighter.id][newState]) {
        flavorTextPool.push(...escalationStateNarratives[fighter.id][newState]);
    }
    if (escalationStateNarratives[newState] && Array.isArray(escalationStateNarratives[newState])) {
        flavorTextPool.push(...escalationStateNarratives[newState]);
    }
    const defaultFlavor = `The tide of battle shifts for {actorName}.`;
    const flavorText = getRandomElement(flavorTextPool) || defaultFlavor;
    const substitutedFlavorText = substituteTokens(flavorText, fighter, null);


    let templateKey = 'general';
    let highlightClass = 'highlight-neutral';

    switch (newState) {
        case ESCALATION_STATES.PRESSURED:
            templateKey = 'pressured';
            highlightClass = 'highlight-pressured';
            break;
        case ESCALATION_STATES.SEVERELY_INCAPACITATED:
            templateKey = 'severely_incapacitated';
            highlightClass = 'highlight-severe';
            break;
        case ESCALATION_STATES.TERMINAL_COLLAPSE:
            templateKey = 'terminal_collapse';
            highlightClass = 'highlight-terminal';
            break;
        case ESCALATION_STATES.NORMAL:
            if (oldState !== ESCALATION_STATES.NORMAL) {
                templateKey = 'reverted_to_normal';
            } else {
                return null;
            }
            break;
        default:
            const unknownStateText = substituteTokens(`${fighter.name}'s condition has changed to ${newState}. ${substitutedFlavorText}`, fighter, null);
            return {
                type: 'escalation_change_event',
                actorId: fighter.id,
                characterName: fighter.name,
                oldState: oldState,
                newState: newState,
                text: unknownStateText,
                html_content: `<p class="narrative-escalation char-${fighter.id || 'unknown'} ${highlightClass}">${unknownStateText}</p>`,
                isEscalationEvent: true,
                highlightClass: highlightClass
            };
    }

    const htmlTemplate = phaseTemplates.escalationStateChangeTemplates[templateKey] || phaseTemplates.escalationStateChangeTemplates.general;

    const htmlContent = substituteTokens(htmlTemplate, fighter, null, {
        '{escalationFlavorText}': substitutedFlavorText,
    });


    return {
        type: 'escalation_change_event',
        actorId: fighter.id,
        characterName: fighter.name,
        oldState: oldState,
        newState: newState,
        text: substituteTokens(`${fighter.name} is now ${newState}! ${substitutedFlavorText}`, fighter, null),
        html_content: htmlContent,
        isEscalationEvent: true,
        highlightClass: highlightClass
    };
}


export function generateTurnNarrationObjects(events, move, actor, opponent, result, environmentState, locationData, currentPhaseKey, isInitialBanter = false, aiLogEntry = {}) {
    let turnEventObjects = [];

    // Handle narrative events from reactive defenses first if they exist on the result
    if (result && result.isReactedAction && result.narrativeEventsToPrepend) {
        result.narrativeEventsToPrepend.forEach(event => {
            // These events are already formatted by formatQuoteEvent in engine_lightning-redirection.js
            // We just need to ensure they are added to the log.
            if (event) { // Ensure event is not null/undefined
                turnEventObjects.push(event);
            }
        });
    }

    // Standard dialogue events (quotes, etc.)
    events.forEach(event => {
        const quoteEvent = formatQuoteEvent(event.quote, event.actor, opponent, { '{moveName}': move?.name, currentPhaseKey, aiLogEntry });
        if (quoteEvent) {
            turnEventObjects.push(quoteEvent);
        }
    });

    if (!isInitialBanter && move && result) {
        // Generate the main action description, which could be a standard move or the "move line" part of a reacted action
        const actionEvent = generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey, aiLogEntry);
        turnEventObjects.push(actionEvent); // This actionEvent will now be simpler for reacted actions

        // Standard move execution quote (if not a reacted action that already has its narrative)
        if (!result.isReactedAction) {
            const moveQuoteContext = { result: result.effectiveness.label, currentPhaseKey, aiLogEntry };
            const moveExecutionQuote = findNarrativeQuote(actor, opponent, 'onMoveExecution', move.name, moveQuoteContext);
            if (moveExecutionQuote) {
                const quoteEvent = formatQuoteEvent(moveExecutionQuote, actor, opponent, { currentPhaseKey, aiLogEntry });
                if (quoteEvent) {
                    quoteEvent.isMoveExecutionQuote = true;
                    turnEventObjects.push(quoteEvent);
                }
            }
        }


        const collateralEvent = generateCollateralDamageEvent(move, actor, opponent, environmentState, locationData);
        if (collateralEvent) {
            // Append collateral HTML to the actionEvent's HTML if it exists and is not already handled
            if (actionEvent.html_content && !actionEvent.html_content.includes('collateral-damage-description')) {
                 actionEvent.html_content = actionEvent.html_content.replace(/{collateralDamageDescription}/g, collateralEvent.html_content);
            } else if (!actionEvent.html_content.includes('collateral-damage-description')) { // If no main action HTML, just add collateral
                turnEventObjects.push(collateralEvent);
            }
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
    const winnerHp = winner.hp !== undefined ? winner.hp : 0;
    const outcomeType = winnerHp > 50 ? 'dominant' : 'narrow';
    let phraseTemplate = victoryPhrasesPool[outcomeType] || victoryPhrasesPool.dominant;

    const winnerPronounP = winner.pronouns?.p || 'their';

    return substituteTokens(phraseTemplate, winner, safeLoser, {
        WinnerName: winner.name,
        LoserName: safeLoser.name,
        WinnerPronounP: winnerPronounP
    });
}

export function generateCurbstompNarration(rule, attacker, target, isEscape = false, explicitContext = {}) {
    let textTemplate;
    let htmlClass = "narrative-curbstomp highlight-major";

    const attackerName = attacker?.name || "Attacker";
    const targetName = target?.name || "Target";

    let baseCharacterForToken;

    if (explicitContext.actualVictimName) {
        baseCharacterForToken = explicitContext.actualVictimName;
    } else if (rule.appliesToAll) {
        if (rule.outcome?.type?.includes("loss_random") || rule.outcome?.type?.includes("loss_weighted") || rule.outcome?.type?.includes("death_target")) {
            baseCharacterForToken = targetName;
        } else if (rule.outcome?.type?.includes("loss_character") && rule.appliesToCharacter === target?.id) {
            baseCharacterForToken = targetName;
        } else {
            baseCharacterForToken = attackerName;
        }
    } else if (rule.appliesToCharacter) {
        baseCharacterForToken = characterData[rule.appliesToCharacter]?.name || (rule.appliesToCharacter === attacker?.id ? attackerName : targetName);
    } else {
        baseCharacterForToken = attackerName;
    }


    if (isEscape) {
        textTemplate = rule.outcome.escapeMessage || `{targetName} narrowly escapes ${attackerName}'s devastating attempt!`;
        htmlClass = "narrative-curbstomp highlight-escape";
        if (!explicitContext.actualVictimName) {
             baseCharacterForToken = targetName;
        }

    } else if (rule.outcome.type === "conditional_instant_kill_or_self_sabotage" && explicitContext.isSelfSabotageOutcome) {
        textTemplate = rule.outcome.selfSabotageMessage || `${attackerName}'s move backfires!`;
        htmlClass = "narrative-curbstomp highlight-neutral";
    } else {
        textTemplate = rule.outcome.successMessage || `${attackerName}'s ${rule.id} overwhelmingly defeats ${targetName}!`;
    }

    let additionalContextForTokens = {
        attackerName: attackerName,
        targetName: targetName,
        characterName: baseCharacterForToken,
        '{moveName}': explicitContext['{moveName}'] || rule.activatingMoveName || "a devastating maneuver",
    };

    const substitutedText = substituteTokens(textTemplate, attacker, target, additionalContextForTokens);

    return {
        type: 'curbstomp_event',
        text: substitutedText,
        html_content: `<p class="${htmlClass}">${substitutedText}</p>`,
        curbstompRuleId: rule.id,
        isEscape: isEscape,
        isMajorEvent: !isEscape && !(explicitContext.isSelfSabotageOutcome)
    };
}