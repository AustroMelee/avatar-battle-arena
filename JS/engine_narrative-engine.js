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
         if (currentPhaseKey === BATTLE_PHASES.PRE_BANTER) return { type: 'spoken', line: `{actorName} prepares for battle, sensing the tension in the air.` };
         if (currentPhaseKey === BATTLE_PHASES.POKING) return { type: 'spoken', line: `{actorName} begins to probe {opponentName}'s defenses cautiously.` };
    }
    if (trigger === 'phaseTransition') {
         if (subTrigger === BATTLE_PHASES.POKING) return { type: 'action', line: `The silence breaks, and the probing begins for {actorName}!` };
         if (subTrigger === BATTLE_PHASES.EARLY) return { type: 'action', line: `The battle intensifies! The true fight begins for {actorName}!` };
         if (subTrigger === BATTLE_PHASES.MID) return { type: 'action', line: `The conflict reaches a new height. The stakes are rising for {actorName}!` };
         if (subTrigger === BATTLE_PHASES.LATE) return { type: 'action', line: `The end is in sight. {actorName} prepares for a decisive confrontation!` };
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
        htmlContent = `<p class="${narrativeClass}">${formattedLine}</p>`; // Use formattedLine directly for action type
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

// OLD: export function generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey, aiLogEntry = {})
export function generateActionDescriptionObject(move, actor, defender, result, environmentState, locationData, currentPhase, aiLogEntry) {
    if (!move || !result || !result.effectiveness) {
        return {
            type: 'move_action_event',
            html_content: `<p class="move-line error">A move was attempted by ${actor.name}, but the outcome was unclear.</p>`
        };
    }

    const effectiveness = result.effectiveness.label;
    const effectivenessClass = effectiveness.toLowerCase();
    const actorName = `<span class="move-actor char-${actor.id}">${actor.name}</span>`;
    const moveName = `<span class="move-name">${move.name}</span>`;
    const emoji = getEmojiForMoveType(move.moveType, effectiveness);

    // Main action line
    const actionLine = `${actorName} used ${moveName} ${emoji}`;

    // Effectiveness description
    const effectivenessLine = `<span class="move-effectiveness ${effectivenessClass}">${effectiveness}</span>`;

    // Detailed description generation
    let descriptionText = findNarrativeQuote(actor, defender, 'onMove', effectiveness.toLowerCase(), {
        moveName: move.name,
        moveType: move.moveType,
        phase: currentPhase,
    });

    if (!descriptionText) {
        // Fallback description
        switch (effectiveness.toLowerCase()) {
            case 'critical':
                descriptionText = `${actor.name} lands a devastating blow, turning the tide of battle!`;
                break;
            case 'strong':
                descriptionText = `A powerful strike from ${actor.name} that puts ${defender.name} on the defensive.`;
                break;
            case 'weak':
                descriptionText = `${defender.name} weathers the attack from ${actor.name}, which was less effective than intended.`;
                break;
            default:
                descriptionText = `A standard exchange between the two combatants.`;
        }
    }

    // Add context from AI log if available
    if (result.consumedStateName) {
        descriptionText += ` It capitalized on ${defender.name} being ${result.consumedStateName}.`;
    }

    const html_content = `
        <div class="move-line">
            <div class="move-header">
                ${actionLine} - ${effectivenessLine}
            </div>
            <p class="move-description">${descriptionText}</p>
        </div>
    `;

    return {
        type: 'move_action_event',
        html_content: html_content,
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
        narrativeEventsForAction.forEach(event => {
            if (event.quote) {
                const actorNameSpan = `<span class="char-${event.actor.id}">${event.actor.name}</span>`;
                const rawQuoteLine = event.quote.line || event.quote;
                const substitutedQuoteLine = substituteTokens(rawQuoteLine, actor, defender, { actorName: actor.name, opponentName: defender.name });
                const dialogueHtml = `<p class="dialogue-line">${actorNameSpan} says, "<em>${substitutedQuoteLine}</em>"</p>`;
                
                narrationObjects.push({
                    type: 'dialogue_event',
                    actorId: event.actor.id,
                    characterName: actor.name,
                    text: `${actor.name} says, "${substitutedQuoteLine}"`,
                    html_content: dialogueHtml,
                    isDialogue: true,
                    dialogueType: 'quote' 
                });
            }
        });
    }

    // 2. Generate the primary action description for the move itself
    if (move && result && !isPreBattle) {
        const actionDescription = generateActionDescriptionObject(move, actor, defender, result, environmentState, locationData, currentPhase, aiLogEntry);
        narrationObjects.push(actionDescription);
    }
    
    // 3. (Future) Add narration for reactions or other tertiary events if needed.

    return narrationObjects;
}

export function getFinalVictoryLine(winner, loser) {
    if (!winner) return "The battle ends.";
    const winnerArchetypeData = characterData[winner.id]?.archetypeData || {};
    const winnerQuotes = winnerArchetypeData.quotes || {};

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
    const outcomeType = (winner.hp !== undefined && safeLoser.hp !== undefined && winner.hp > (safeLoser.hp + 20)) ? 'dominant' : 'narrow';
    let phraseTemplate = getRandomElement(victoryPhrasesPool[outcomeType]);

    // Check for character-specific post-win quotes first
    if (winnerQuotes.postWin_specific && winnerQuotes.postWin_specific[safeLoser.id]) {
        phraseTemplate = { line: winnerQuotes.postWin_specific[safeLoser.id] };
    } else if (winnerQuotes.postWin_overwhelming && outcomeType === 'dominant') {
        phraseTemplate = { line: winnerQuotes.postWin_overwhelming };
    } else if (winnerQuotes.postWin) {
        phraseTemplate = { line: getRandomElement(winnerQuotes.postWin) };
    }

    // FIX: Safely extract line or use the string directly if phraseTemplate is a string
    const finalPhrase = phraseTemplate ? (phraseTemplate.line || phraseTemplate) : (victoryPhrasesPool.default.dominant[0].line || victoryPhrasesPool.default.dominant[0]); // Ensure default is an array


    const winnerPronounP = winner.pronouns?.p || 'their';

    return substituteTokens(finalPhrase, winner, safeLoser, {
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
        actualAttackerId: attacker.id, // ADD THIS LINE: Store the ID directly
        isEscape: isEscape,
        isMajorEvent: !isEscape && !(explicitContext.isSelfSabotageOutcome)
    };
}