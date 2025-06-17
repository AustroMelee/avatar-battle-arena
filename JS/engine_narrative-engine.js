// FILE: engine_narrative-engine.js
'use strict';

// Version 1.3: Centralized and Simplified Narrative Generation
// - Overhauled generateActionDescriptionObject for clarity and consistency.
// - Simplified generateTurnNarrationObjects to focus on its core role.

import { conjugatePresent, getEmojiForMoveType, postBattleVictoryPhrases } from './narrative-flavor.js';
import { effectivenessLevels } from './move-interaction-matrix.js';
import { escalationStateNarratives } from './data_narrative_escalation.js';
import { phaseTemplates } from './data_narrative_phases.js';
// --- END UPDATED IMPORTS ---

import { locationConditions } from './location-battle-conditions.js';
import { characters as characterData } from './data_characters.js';
import { getRandomElement } from './engine_battle-engine-core.js';
import { ESCALATION_STATES } from './engine_escalation.js';
import { BATTLE_PHASES } from './engine_battle-phase.js';

// --- ARCHETYPE DATA IMPORTS ---
import { aangArchetypeData } from './data_archetype_aang.js';
import { azulaArchetypeData } from './data_archetype_azula.js';
import { bumiArchetypeData } from './data_archetype_bumi.js';
import { jeongjeongArchetypeData } from './data_archetype_jeong-jeong.js';
import { kataraArchetypeData } from './data_archetype_katara.js';
import { maiArchetypeData } from './data_archetype_mai.js';
import { ozaiArchetypeData } from './data_archetype_ozai.js';
import { pakkuArchetypeData } from './data_archetype_pakku.js';
import { sokkaArchetypeData } from './data_archetype_sokka.js';
import { tophArchetypeData } from './data_archetype_toph.js';
import { tyleeArchetypeData } from './data_archetype_ty-lee.js';
import { zukoArchetypeData } from './data_archetype_zuko.js';

const archetypeDataMap = {
    'aang': aangArchetypeData,
    'azula': azulaArchetypeData,
    'bumi': bumiArchetypeData,
    'jeong-jeong': jeongjeongArchetypeData,
    'katara': kataraArchetypeData,
    'mai': maiArchetypeData,
    'ozai': ozaiArchetypeData,
    'pakku': pakkuArchetypeData,
    'sokka': sokkaArchetypeData,
    'toph-beifong': tophArchetypeData,
    'ty-lee': tyleeArchetypeData,
    'zuko': zukoArchetypeData,
    // Add other character IDs and their archetype data here
};
// --- END ARCHETYPE DATA IMPORTS ---

export function substituteTokens(template, primaryActorForContext, secondaryActorForContext, additionalContext = {}) {
    if (typeof template !== 'string') return '';
    let text = template;

    const actor = primaryActorForContext;
    const opponent = secondaryActorForContext;

    const actorNameDisplay = additionalContext.WinnerName || additionalContext.attackerName || additionalContext.characterName || actor?.name || 'A fighter';
    const opponentNameDisplay = additionalContext.LoserName || additionalContext.targetName || (actor?.id === opponent?.id ? 'their reflection' : opponent?.name) || 'Their opponent';

    const actorPronouns = actor?.pronouns;
    const opponentPronouns = opponent?.pronouns;

    // If for some reason pronouns are still undefined, default to a sensible (non-they/them) value.
    // This should ideally be handled at character data loading or fighter initialization.
    const safeActorPronouns = actorPronouns || { s: 'he', p: 'his', o: 'him' };
    const safeOpponentPronouns = opponentPronouns || { s: 'he', p: 'his', o: 'him' };

    const winnerPronouns = (additionalContext.WinnerName === actor?.name) ? safeActorPronouns : safeOpponentPronouns;
    const loserPronouns = (additionalContext.LoserName === actor?.name) ? safeActorPronouns : safeOpponentPronouns;


    const replacements = {
        '{actorName}': additionalContext.attackerName || actor?.name || 'A fighter',
        '{opponentName}': additionalContext.targetName || (actor?.id === opponent?.id ? safeOpponentPronouns.p + ' reflection' : opponent?.name) || safeOpponentPronouns.p + ' opponent',

        '{targetName}': additionalContext.targetName || (actor?.id === opponent?.id ? safeOpponentPronouns.p + ' reflection' : opponent?.name) || safeOpponentPronouns.p + ' opponent',
        '{attackerName}': additionalContext.attackerName || actor?.name || 'A fighter',

        '{WinnerName}': additionalContext.WinnerName || actorNameDisplay,
        '{LoserName}': additionalContext.LoserName || opponentNameDisplay,

        '{characterName}': additionalContext.characterName || actorNameDisplay,

        '{actor.s}': safeActorPronouns.s,
        '{actor.p}': safeActorPronouns.p,
        '{actor.o}': safeActorPronouns.o,

        '{opponent.s}': safeOpponentPronouns.s,
        '{opponent.p}': safeOpponentPronouns.p,
        '{opponent.o}': safeOpponentPronouns.o,

        '{WinnerPronounS}': winnerPronouns.s,
        '{WinnerPronounP}': winnerPronouns.p,
        '{WinnerPronounO}': winnerPronouns.o,
        '{LoserPronounS}': loserPronouns.s,
        '{LoserPronounP}': loserPronouns.p,
        '{LoserPronounO}': loserPronouns.o,

        '{possessive}': safeActorPronouns.p,
        ...additionalContext
    };

    for (const [token, value] of Object.entries(replacements)) {
        if (typeof token === 'string' && value !== undefined && value !== null) {
            text = text.replace(new RegExp(token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\$&'), 'g'), String(value));
        }
    }
    return text;
 }

export function findNarrativeQuote(actor, opponent, trigger, subTrigger, context = {}) {
    if (!actor) return null;
    const actorArchetypeData = archetypeDataMap[actor.id] || {}; // Get archetype data for actor
    const narrativeData = actorArchetypeData.narrative || {}; // Access narrative from archetype data

    let pool = null;
    const currentPhaseKey = context.currentPhaseKey || 'Generic';
    const aiLogEntry = context.aiLogEntry || {};

    if (trigger === 'onIntentSelection' && aiLogEntry.isEscalationFinisherAttempt && context.move?.type === 'Finisher') {
        if (introductoryPhrases.EscalationFinisher && introductoryPhrases.EscalationFinisher.length > 0) {
            const selectedQuote = getRandomElement(introductoryPhrases.EscalationFinisher);
            // FIX: Ensure selectedQuote is not null and has a .line property if it's an object
            return selectedQuote ? { type: 'action', line: selectedQuote.line || selectedQuote } : null;
        }
    }

    const lookupPaths = [];

    // Relationship-specific narrative first (from base character data, not archetype data)
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

    // Character's general narrative (from archetype data)
    // For general character intros/phase transitions, check `archetypeData[locationId]` or `archetypeData['_DEFAULT_LOCATION_']`
    // For turn-based narratives like `onIntentSelection`, `onMoveExecution`, `onStateChange`, `onCollateral`, `onVictory`,
    // these should be structured directly under `archetypeData.narrative`.
    if (trigger === 'battleStart' && context.locationId) {
        if (actorArchetypeData[opponent.id] && actorArchetypeData[opponent.id][context.locationId] && actorArchetypeData[opponent.id][context.locationId].narrative && actorArchetypeData[opponent.id][context.locationId].narrative.battleStart && actorArchetypeData[opponent.id][context.locationId].narrative.battleStart[currentPhaseKey]) {
            lookupPaths.push(() => actorArchetypeData[opponent.id][context.locationId].narrative.battleStart[currentPhaseKey]);
        }
        else if (actorArchetypeData[opponent.id] && actorArchetypeData[opponent.id]._DEFAULT_LOCATION_ && actorArchetypeData[opponent.id]._DEFAULT_LOCATION_.narrative && actorArchetypeData[opponent.id]._DEFAULT_LOCATION_.narrative.battleStart && actorArchetypeData[opponent.id]._DEFAULT_LOCATION_.narrative.battleStart[currentPhaseKey]) {
            lookupPaths.push(() => actorArchetypeData[opponent.id]._DEFAULT_LOCATION_.narrative.battleStart[currentPhaseKey]);
        }
        else if (narrativeData[trigger]?.[context.locationId]?.[currentPhaseKey]) { // Fallback if narrative is directly under location in archetype
            lookupPaths.push(() => narrativeData[trigger][context.locationId][currentPhaseKey]);
        }
        else if (narrativeData[trigger]?.[currentPhaseKey]) { // General phase-based intro for battleStart
            lookupPaths.push(() => narrativeData[trigger][currentPhaseKey]);
        }
    } else { // For all other triggers (onIntentSelection, onMoveExecution, etc.)
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
            const selectedElement = getRandomElement(pool);
            // If the selected element is an object with 'type' and 'line', return it directly.
            // Otherwise, assume it's a plain string and wrap it as 'spoken' type.
            if (selectedElement && typeof selectedElement === 'object' && selectedElement.type && selectedElement.line) {
                return selectedElement;
            } else if (typeof selectedElement === 'string') {
                return { type: 'spoken', line: selectedElement };
            }
            return null; // Fallback if element is not string or expected object format
        }
    }

    // Fallback for specific triggers if no quote found (e.g., if a new phase has no intro defined)
    if (trigger === 'battleStart') {
         if (currentPhaseKey === BATTLE_PHASES.PRE_BANTER) return { type: 'spoken', line: `{actorName} prepares for battle, sensing the tension in {actor.p} air.` };
         if (currentPhaseKey === BATTLE_PHASES.POKING) return { type: 'spoken', line: `{actorName} begins to probe {opponent.p} defenses cautiously.` };
    }
    if (trigger === 'phaseTransition') {
         if (subTrigger === BATTLE_PHASES.POKING) return { type: 'action', line: `The silence breaks, and the probing begins for {actor.o}!` };
         if (subTrigger === BATTLE_PHASES.EARLY) return { type: 'action', line: `The battle intensifies! The true fight begins for {actor.o}!` };
         if (subTrigger === BATTLE_PHASES.MID) return { type: 'action', line: `The conflict reaches a new height. The stakes are rising for {actor.o}!` };
         if (subTrigger === BATTLE_PHASES.LATE) return { type: 'action', line: `The end is in sight. {actor.s} prepares for a decisive confrontation!` };
    }

    if (trigger === 'onCollateral' && subTrigger === 'general' && context.impactText) {
        return { type: 'environmental', line: context.impactText };
    }

    // NEW: Handle internal thoughts
    if (trigger === 'internalThought' && actor.quotes?.internalThoughts && actor.quotes.internalThoughts.length > 0) {
        const selectedThought = getRandomElement(actor.quotes.internalThoughts);
        return selectedThought ? { type: 'internal', line: selectedThought.line || selectedThought } : null;
    }

    return null;
}

export function formatQuoteEvent(quote, actor, opponent, context) {
    if (!quote || typeof quote.line !== 'string') return null;
    const { type, line } = quote;

    const substitutedLine = substituteTokens(line, actor, opponent, context);

    switch (type) {
        case 'spoken':
        case 'action': // Actions with spoken lines
            const actorNameSpan = `<span class="char-${actor.id}">${actor.name}</span>`;
            const dialogueHtml = `<p class="dialogue-line">${actorNameSpan} says, "<em>${substitutedLine}</em>"</p>`;
            return {
                type: 'dialogue_event',
                actorId: actor.id,
                characterName: actor.name,
                text: `${actor.name} says, "${substitutedLine}"`,
                html_content: dialogueHtml,
                isDialogue: true,
                dialogueType: type
            };
        case 'internal':
            const internalHtml = `<p class="dialogue-line internal-thought char-${actor.id}"><em>(${substitutedLine})</em></p>`;
            return {
                type: 'internal_thought_event',
                actorId: actor.id,
                characterName: actor.name,
                text: `(${actor.name} thinks: ${substitutedLine})`,
                html_content: internalHtml,
                isInternalThought: true,
                dialogueType: type
            };
        case 'environmental':
            const environmentalHtml = `<p class="environmental-impact-text">${substitutedLine}</p>`;
            return {
                type: 'environmental_impact_event',
                actorId: null,
                characterName: 'Environment',
                text: substitutedLine,
                html_content: environmentalHtml,
                isEnvironmental: true
            };
        default:
            // Fallback for unhandled types, or if no specific formatting is needed beyond text
            return {
                type: 'generic_narrative_event',
                actorId: actor?.id || null,
                characterName: actor?.name || 'Narrator',
                text: substitutedLine,
                html_content: `<p class="narrative-event">${substitutedLine}</p>`,
            };
    }
}

// OLD: export function generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey, aiLogEntry = {})
export function generateActionDescriptionObject(move, actor, defender, result, environmentState, locationData, currentPhase, aiLogEntry) {
    if (!actor || !defender) return null;

    const actorName = actor.name;
    const defenderName = defender.name;

    const actorPronouns = actor.pronouns || { s: 'they', p: 'their', o: 'them' };
    const defenderPronouns = defender.pronouns || { s: 'they', p: 'their', o: 'them' };

    const moveVerb = conjugatePresent(move.verb || 'acts');
    const moveObject = move.object || 'meaningfully';

    let actionText = '';
    let htmlContent = '';
    let additionalContext = {};

    // Base action description
    actionText = `${actorName} ${moveVerb} ${moveObject}.`;
    htmlContent = `<p class="narrative-action char-${actor.id}">${actorName} ${moveVerb} ${moveObject}.</p>`;

    // Effectiveness flavor
    const effectiveness = result?.effectiveness?.label || 'Normal';
    const effectivenessEmoji = result?.effectiveness?.emoji || '';
    const effectivenessFlavor = effectivenessLevels[effectiveness]?.flavor || '';
    const effectivenessColor = effectivenessLevels[effectiveness]?.colorClass || '';

    if (effectiveness !== 'Normal' && effectiveness !== 'Ineffective') {
        actionText += ` ${effectivenessFlavor}, ${actorPronouns.s} move hitting with ${effectiveness.toLowerCase()} impact.`;
        htmlContent = `<p class="narrative-action char-${actor.id}">${actorName} ${moveVerb} ${moveObject}. <span class="${effectivenessColor}">${effectivenessFlavor}, ${actorPronouns.s} move hitting with ${effectiveness.toLowerCase()} impact.</span></p>`;
    }

    // Damage/Healing
    if (result.damage > 0) {
        actionText += ` It deals ${result.damage} damage to ${defenderName}.`;
        htmlContent += `<p class="narrative-damage char-${defender.id}">It deals <span class="damage-value">${result.damage}</span> damage to ${defenderName}.</p>`;
    } else if (result.healing > 0) {
        actionText += ` ${actorPronouns.s} heals for ${result.healing} HP.`;
        htmlContent += `<p class="narrative-healing char-${actor.id}">${actorPronouns.s} heals for <span class="healing-value">${result.healing}</span> HP.</p>`;
    }

    // Self-damage
    if (result.selfDamage > 0) {
        actionText += ` But ${actorPronouns.s} takes ${result.selfDamage} recoil damage.`;
        htmlContent += `<p class="narrative-self-damage char-${actor.id}">But ${actorPronouns.s} takes <span class="damage-value">${result.selfDamage}</span> recoil damage.</p>`;
    }

    // Stun
    if (result.stunDuration > 0) {
        actionText += ` ${defenderName} is stunned for ${result.stunDuration} turn(s)!`;
        htmlContent += `<p class="narrative-stun char-${defender.id}">${defenderName} is stunned for <span class="stun-value">${result.stunDuration}</span> turn(s)!</p>`;
    }

    // Debuffs/Buffs
    if (result.debuff) {
        actionText += ` ${defenderName} is now ${result.debuff.name.toLowerCase()}.`;
        htmlContent += `<p class="narrative-debuff char-${defender.id}">${defenderName} is now <span class="debuff-name">${result.debuff.name.toLowerCase()}</span>.</p>`;
    }
    if (result.buff) {
        actionText += ` ${actorName} gains ${result.buff.name.toLowerCase()}.`;
        htmlContent += `<p class="narrative-buff char-${actor.id}">${actorName} gains <span class="buff-name">${result.buff.name.toLowerCase()}</span>.</p>`;
    }

    // Tactical State interaction (e.g., opening consumed)
    if (move.moveTags?.includes('requires_opening') && result.payoff && result.consumedStateName) {
        actionText += ` This consumes ${defenderName}'s ${result.consumedStateName} state.`;
        htmlContent += `<p class="narrative-context char-${actor.id}">This consumes ${defenderName}'s <span class="tactical-state">${result.consumedStateName}</span> state.</p>`;
    }

    // Environmental Impact
    if (result.environmentalDamage > 0) {
        actionText += ` The environment takes ${result.environmentalDamage} damage.`;
        htmlContent += `<p class="narrative-environmental-damage">The environment takes <span class="damage-value">${result.environmentalDamage}</span> damage.</p>`;
    }

    // Reactive Defense
    if (result.isReactedAction) {
        actionText += ` However, ${defenderName} responded with a reactive defense!`;
        htmlContent += `<p class="narrative-context char-${defender.id}">However, ${defenderName} responded with a reactive defense!</p>`;
    }

    // Move-specific narration from the move itself (if available)
    if (move.narrative && move.narrative[effectiveness]) {
        const moveNarrative = substituteTokens(move.narrative[effectiveness], actor, defender, { ...additionalContext, move: move, result: result });
        actionText += ` ${moveNarrative}`; // Append to existing text
        htmlContent += `<p class="narrative-move-specific">${moveNarrative}</p>`;
    }

    // Quotes and AI log entries for debugging
    const aiLogEntryText = aiLogEntry?.text ? `(${aiLogEntry.text})` : '';
    if (aiLogEntryText) {
        actionText += ` ${aiLogEntryText}`;
        htmlContent += `<p class="narrative-log-entry">${aiLogEntryText}</p>`;
    }

    return {
        type: 'move_action_event',
        actionText: actionText,
        html_content: htmlContent,
        element: move.element || null
    };
}

export function generateCollateralDamageEvent(move, actor, opponent, environmentState, locationData, battleState) { // FIX: Added battleState
    if (!move.collateralImpact || move.collateralImpact === 'none' || environmentState.damageLevel === 0) {
        return null;
    }
    const impactLevel = move.collateralImpact.toUpperCase();
    if (!collateralImpactPhrases[impactLevel] || collateralImpactPhrases[impactLevel].length === 0) return null;

    const collateralPhraseTemplate = getRandomElement(collateralImpactPhrases[impactLevel]);
    // OLD: const collateralPhrase = collateralPhraseTemplate ? substituteTokens(collateralPhraseTemplate.line || collateralPhraseTemplate, actor, opponent) : '';
    const collateralPhrase = collateralPhraseTemplate ? substituteTokens(collateralPhraseTemplate.line || collateralPhraseTemplate, actor, opponent, {battleState}) : ''; // FIX: Pass battleState

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
    const actorArchetypeData = characterData[fighter.id]?.archetypeData || {}; // Get archetype data for actor
    const narrativeData = actorArchetypeData.narrative || {}; // Access narrative from archetype data

    let flavorTextPool = [];
    if (narrativeData.onEscalationStateChange && narrativeData.onEscalationStateChange[newState]) { // Check character-specific first
        flavorTextPool.push(...narrativeData.onEscalationStateChange[newState]);
    }
    if (escalationStateNarratives[newState] && Array.isArray(escalationStateNarratives[newState])) { // Then generic
        flavorTextPool.push(...escalationStateNarratives[newState]);
    }
    const defaultFlavor = `The tide of battle shifts for {actorName}.`;
    const selectedFlavorTextTemplate = getRandomElement(flavorTextPool);
    // FIX: Safely extract line or use the string directly if selectedFlavorTextTemplate is a string
    const flavorText = selectedFlavorTextTemplate ? (selectedFlavorTextTemplate.line || selectedFlavorTextTemplate) : defaultFlavor; // FIX: Ensure flavorText is a string
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


export function generateTurnNarrationObjects(narrativeEventsForAction, move, actor, defender, result, environmentState, locationData, currentPhase, isPreBattle, aiLogEntry, battleState) {
    let narrationObjects = [];

    // 1. Process specific narrative quotes that were triggered (e.g., mental state changes)
    if (narrativeEventsForAction && narrativeEventsForAction.length > 0) {
        narrationObjects.push(...narrativeEventsForAction.map(event => formatQuoteEvent(event.quote, event.actor, defender, { battleState, move, result })));
    }

    // 2. Generate the primary action description for the move itself
    if (move && result && !isPreBattle) {
        const actionDescription = generateActionDescriptionObject(move, actor, defender, result, environmentState, locationData, currentPhase, aiLogEntry);
        narrationObjects.push(actionDescription);

        // NEW: Add narrative based on move outcome (after action description)
        const narrativeContext = { move, result, battleState, currentPhase };

        // Character reaction to their own move's effectiveness
        const actorReactionToMove = findNarrativeQuote(actor, defender, 'onMoveExecution', result.effectiveness.label, narrativeContext);
        if (actorReactionToMove) {
            narrationObjects.push(formatQuoteEvent(actorReactionToMove, actor, defender, narrativeContext));
        }

        // Defender reaction to being hit / taking damage
        if (result.damage > 0) {
            const defenderReactionToHit = findNarrativeQuote(defender, actor, 'onHit', result.effectiveness.label, narrativeContext);
            if (defenderReactionToHit) {
                narrationObjects.push(formatQuoteEvent(defenderReactionToHit, defender, actor, narrativeContext));
            }
        }

        // Defender reaction to being stunned
        if (result.stunDuration > 0) {
            const defenderReactionToStun = findNarrativeQuote(defender, actor, 'onStun', 'general', narrativeContext);
            if (defenderReactionToStun) {
                narrationObjects.push(formatQuoteEvent(defenderReactionToStun, defender, actor, narrativeContext));
            }
        }

        // Narrative for a punished move (attacker perspective)
        if (result.wasPunished) {
            const actorPunishedNarrative = findNarrativeQuote(actor, defender, 'onMoveExecution', 'wasPunished', narrativeContext);
            if (actorPunishedNarrative) {
                narrationObjects.push(formatQuoteEvent(actorPunishedNarrative, actor, defender, narrativeContext));
            }
        }

        // Narrative for a reactive defense action
        if (result.isReactedAction) {
            const defenderReactiveNarrative = findNarrativeQuote(defender, actor, 'onReactiveDefense', result.reactionSuccess ? 'success' : 'fail', narrativeContext);
            if (defenderReactiveNarrative) {
                narrationObjects.push(formatQuoteEvent(defenderReactiveNarrative, defender, actor, narrativeContext));
            }
        }

        // Internal thought after a move (e.g., assessing situation, stress)
        const actorInternalThought = findNarrativeQuote(actor, defender, 'internalThought', 'afterMove', narrativeContext);
        if (actorInternalThought) {
            narrationObjects.push(formatQuoteEvent(actorInternalThought, actor, defender, narrativeContext));
        }

        // Check for environmental impact narrative (if collateral damage occurred)
        if (result.collateralDamage > 0) {
            const envImpactNarrative = findNarrativeQuote(actor, defender, 'onCollateral', 'general', { ...narrativeContext, impactText: 'The environment feels the impact of the battle.' });
            if (envImpactNarrative) {
                narrationObjects.push(formatQuoteEvent(envImpactNarrative, actor, defender, narrativeContext));
            }
        }
    }
    
    // 3. (Future) Add narration for reactions or other tertiary events if needed.

    return narrationObjects;
}

export function getFinalVictoryLine(winner, loser) {
    if (!winner || !loser) {
        return postBattleVictoryPhrases.generic.defeat[0]; // Fallback if winner/loser are not defined
    }

    const winnerPronounS = winner.pronouns?.s || 'they';
    const winnerPronounP = winner.pronouns?.p || 'their';
    const loserPronounS = loser.pronouns?.s || 'they';
    const loserPronounO = loser.pronouns?.o || 'them';

    // Attempt to find a specific victory phrase based on the winner and loser IDs
    if (winner.quotes?.postWin_specific?.[loser.id]?.length > 0) {
        const specificQuote = getRandomElement(winner.quotes.postWin_specific[loser.id]);
        if (specificQuote) return specificQuote;
    }

    // Fallback to general overwhelming victory if the winner delivered a curbstomp or massive damage
    // NOTE: This logic might need refinement based on how curbstomp/overwhelming victory is determined in the battle engine
    if (winner.summary?.includes('decisive victory') || winner.summary?.includes('completely overwhelmed')) {
        if (winner.quotes?.postWin_overwhelming?.length > 0) {
            const overwhelmingQuote = getRandomElement(winner.quotes.postWin_overwhelming);
            if (overwhelmingQuote) return overwhelmingQuote;
        }
    }

    // General victory phrases
    if (winner.quotes?.postWin?.length > 0) {
        const generalWinQuote = getRandomElement(winner.quotes.postWin);
        if (generalWinQuote) return generalWinQuote;
    }

    // Generic fallback if no specific quotes are found
    return getRandomElement(postBattleVictoryPhrases.generic.victory)
        .replace(/{winner.s}/g, winnerPronounS)
        .replace(/{loser.o}/g, loserPronounO);
}

export function generateCurbstompNarration(rule, attacker, target, isEscape = false, explicitContext = {}) {
    if (!rule || !attacker || !target) return null;

    const attackerName = attacker.name;
    const targetName = target.name;

    const attackerPronouns = attacker.pronouns || { s: 'they', p: 'their', o: 'them' };
    const targetPronouns = target.pronouns || { s: 'they', p: 'their', o: 'them' };

    let narrationText = '';

    if (isEscape) {
        narrationText = `${targetName} manages to narrowly escape ${attacker.p} overwhelming assault!`;
        return { type: 'curbstomp_escape', text: narrationText };
    }

    const outcomeType = rule.outcome?.type;

    switch (outcomeType) {
        case 'instant_win':
            narrationText = `${attackerName} delivers a crushing blow, ending the fight decisively and securing ${attackerPronouns.p} victory over ${targetName}.`;
            break;
        case 'instant_loss':
            narrationText = `${targetName} is overwhelmed by the situation, leading to ${targetPronouns.p} immediate defeat.`;
            break;
        case 'environmental_kill':
            narrationText = `The environment claims ${targetName} as ${targetPronouns.s} is unable to withstand its harsh conditions.`;
            break;
        case 'buff':
            narrationText = `${attackerName} gains a significant advantage, boosting ${attackerPronouns.p} ${rule.outcome.property}.`;
            break;
        case 'debuff':
            narrationText = `${targetName} is severely hampered, suffering a major debuff to ${targetPronouns.p} ${rule.outcome.property}.`;
            break;
        case 'advantage':
            narrationText = `${attackerName} gains a significant strategic advantage, putting ${targetName} on the defensive.`;
            break;
        case 'external_intervention':
            narrationText = `The conflict is abruptly interrupted by an unforeseen external force, bringing the battle to an unexpected halt.`;
            break;
        case 'loss_weighted_character': // Added for completeness, although handled by selectCurbstompVictim
        case 'loss_random_character':
            narrationText = `A decisive turn of events forces ${targetName} into an unfavorable position, leading to ${targetPronouns.p} defeat.`;
            break;
        default:
            narrationText = `A pivotal moment occurs, fundamentally shifting the battle's trajectory against ${targetName}.`;
            break;
    }

    // Append rule description if available and not too generic
    if (rule.description && !narrationText.includes(rule.description)) {
        narrationText += ` (${rule.description})`;
    }

    return { type: 'curbstomp_event', text: narrationText };
}