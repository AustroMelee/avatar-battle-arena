// FILE: engine_narrative-engine.js
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
import { BATTLE_PHASES } from './engine_battle-phase.js'; // NEW: Correct import for BATTLE_PHASES
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

// --- ARCHETYPE DATA IMPORTS ---
import { aangArchetypeData } from './data_archetype_aang.js';
import { azulaArchetypeData } from './data_archetype_azula.js';
import { bumiArchetypeData } from './data_archetype_bumi.js';
import { jeongJeongArchetypeData } from './data_archetype_jeongjeong.js';
import { kataraArchetypeData } from './data_archetype_katara.js';
import { maiArchetypeData } from './data_archetype_mai.js';
import { ozaiArchetypeData } from './data_archetype_ozai.js';
import { pakkuArchetypeData } from './data_archetype_pakku.js';
import { sokkaArchetypeData } from './data_archetype_sokka.js';
import { tophArchetypeData } from './data_archetype_toph.js';
import { tyLeeArchetypeData } from './data_archetype_tylee.js';
import { zukoArchetypeData } from './data_archetype_zuko.js';

const archetypeDataMap = {
    'aang': aangArchetypeData,
    'azula': azulaArchetypeData,
    'bumi': bumiArchetypeData,
    'jeong-jeong': jeongJeongArchetypeData,
    'katara': kataraArchetypeData,
    'mai': maiArchetypeData,
    'ozai': ozaiArchetypeData,
    'pakku': pakkuArchetypeData,
    'sokka': sokkaArchetypeData,
    'toph-beifong': tophArchetypeData,
    'ty-lee': tyLeeArchetypeData,
    'zuko': zukoArchetypeData,
    // Add other character IDs and their archetype data here
};
// --- END ARCHETYPE DATA IMPORTS ---

function conjugatePresent(verbPhrase) {
    if (!verbPhrase || typeof verbPhrase !== 'string') return ''; // FIX: Added type check for verbPhrase
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
export function generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey, aiLogEntry = {}, battleState) { // FIX: Added battleState parameter
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
            narrativeEventsToPrepend: result.narrativeEvents || [] // Key for narrative engine
            // stunAppliedToOriginalAttacker is handled above by modifying attacker.stunDuration directly
        };
    }
    // Standard move narrative generation
    if (aiLogEntry.isEscalationFinisherAttempt && move.type === 'Finisher') {
        const escalationFinisherPool = introductoryPhrases.EscalationFinisher || introductoryPhrases.Late;
        const selectedPhrase = getRandomElement(escalationFinisherPool); // This can be an object {type, line} or string
        // OLD: introPhrase = selectedPhrase ? substituteTokens(selectedPhrase.line || selectedPhrase, actor, opponent) : "Sensing the end is near,";
        introPhrase = selectedPhrase ? substituteTokens(selectedPhrase.line || selectedPhrase, actor, opponent, {battleState}) : "Sensing the end is near,"; // FIX: Pass battleState
    } else {
        const intentForIntro = aiLogEntry.intent || 'StandardExchange';
        // OLD: const introQuote = findNarrativeQuote(actor, opponent, 'onIntentSelection', intentForIntro, { currentPhaseKey, aiLogEntry, move });
        const introQuote = findNarrativeQuote(actor, opponent, 'onIntentSelection', intentForIntro, { currentPhaseKey, aiLogEntry, move, battleState }); // FIX: Pass battleState
        // FIX: Safely extract line or use the string directly if introQuote is a string
        if (introQuote && (introQuote.type === 'action' || typeof introQuote.line === 'string')) {
            // OLD: introPhrase = substituteTokens(introQuote.line || introQuote, actor, opponent);
            introPhrase = substituteTokens(introQuote.line || introQuote, actor, opponent, {battleState}); // FIX: Pass battleState
        } else { // If introQuote is null or not a recognized type, use default phase/generic intro
            const phaseSpecificIntroPool = introductoryPhrases[currentPhaseKey] || introductoryPhrases.Generic;
            const selectedPhrase = getRandomElement(phaseSpecificIntroPool); // This can be an object {type, line} or string
            // OLD: introPhrase = selectedPhrase ? substituteTokens(selectedPhrase.line || selectedPhrase, actor, opponent) : "Responding,";
            introPhrase = selectedPhrase ? substituteTokens(selectedPhrase.line || selectedPhrase, actor, opponent, {battleState}) : "Responding,"; // FIX: Pass battleState
        }
    }

    // The line `if (introPhrase.includes(actor.name))` now uses a guaranteed string for introPhrase


    if (result.payoff && result.consumedStateName) {
        // OLD: tacticalPrefix = substituteTokens(`Capitalizing on {opponentName} being ${result.consumedStateName}, `, actor, opponent);
        tacticalPrefix = substituteTokens(`Capitalizing on {opponentName} being ${result.consumedStateName}, `, actor, opponent, {battleState}); // FIX: Pass battleState
    }

    if (actor.tacticalState?.name && actor.tacticalState.duration >= 0 && actor.tacticalState.isPositive) {
        // OLD: tacticalSuffix += substituteTokens(` {actorName} is now ${actor.tacticalState.name}!`, actor, opponent);
        tacticalSuffix += substituteTokens(` {actorName} is now ${actor.tacticalState.name}!`, actor, opponent, {battleState}); // FIX: Pass battleState
    } else if (actor.tacticalState?.name && actor.tacticalState.duration >= 0 && !actor.tacticalState.isPositive && move.isRepositionMove) {
        // OLD: tacticalSuffix += substituteTokens(` However, {actorName} is now ${actor.tacticalState.name}!`, actor, opponent);
        tacticalSuffix += substituteTokens(` However, {actorName} is now ${actor.tacticalState.name}!`, actor, opponent, {battleState}); // FIX: Pass battleState
    } else if (move.setup && result.effectiveness.label !== 'Weak' && !move.isRepositionMove) {
        // OLD: tacticalSuffix += substituteTokens(` The move leaves {opponentName} ${move.setup.name}!`, actor, opponent);
        tacticalSuffix += substituteTokens(` The move leaves {opponentName} ${move.setup.name}!`, actor, opponent, {battleState}); // FIX: Pass battleState
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
        // The error is here: You have an unbound ternary operator that is not part of an assignment.
        // It should be `isReactive ? impactPhrases.DEFENSE?.REACTIVE : impactPhrases.DEFENSE?.PROACTIVE`
        impactSentencePool = isReactive ? impactPhrases.DEFENSE?.REACTIVE : impactPhrases.DEFENSE?.PROACTIVE; // FIX
    } else {
        impactSentencePool = impactPhrases.DEFAULT?.[impactSentenceKey];
    }

    const impactSentenceTemplate = getRandomElement(impactSentencePool);
    // OLD: const impactSentence = impactSentenceTemplate ? substituteTokens(impactSentenceTemplate.line || impactSentenceTemplate, actor, opponent, { '{targetName}': opponent?.name, '{actorName}': actor?.name }) : "The move unfolds.";
    const impactSentence = impactSentenceTemplate ? substituteTokens(impactSentenceTemplate.line || impactSentenceTemplate, actor, opponent, {
        '{targetName}': opponent?.name || 'the opponent',
        '{actorName}': actor?.name || 'The attacker',
        battleState // FIX: Pass battleState here
    }) : "The move unfolds.";


    let baseActionTextTemplate;
    if (move.name === "Struggle") {
        baseActionTextTemplate = `{actorName} struggles to fight back`;
    } else {
        const verb = conjugatePresent(move.verb || 'executes');
        const objectString = (typeof move.object === 'string') ? move.object : "an action";
        // FIX: Ensure move.object is a string and its first character is accessed safely
        const article = (move.requiresArticle && typeof objectString === 'string' && objectString.length > 0) ?
                        ((['a','e','i','o','u'].includes(objectString[0].toLowerCase()) ? `an ${objectString}` : `a ${objectString}`))
                        : objectString;
        baseActionTextTemplate = `{actorName} ${verb} ${article}`;
    }
    // OLD: const baseActionText = substituteTokens(baseActionTextTemplate, actor, opponent);
    const baseActionText = substituteTokens(baseActionTextTemplate, actor, opponent, {battleState}); // FIX: Pass battleState

    let fullDescText;
    // For redirected actions, the introPhrase might already be set by the redirection logic.
    // We want the main "move description" to be the impact sentence.
    if (result.isReactedAction) {
        fullDescText = impactSentence; // The introPhrase is handled by the narrativeEventsToPrepend
    } else if (introPhrase.includes(actor.name)) { // This line now uses a guaranteed string for introPhrase
        // OLD: fullDescText = `${introPhrase} ${tacticalPrefix}${conjugatePresent(move.verb || 'executes')} ${ (move.requiresArticle ? ( (typeof move.object === 'string' && move.object.length > 0 && ['a','e','i','o','u'].includes(move.object[0].toLowerCase()) ? `an ${move.object}` : `a ${move.object}`) ) : move.object) || 'an action'}. ${impactSentence}${tacticalSuffix}`;
        fullDescText = `${introPhrase} ${tacticalPrefix}${conjugatePresent(move.verb || 'executes')} ${ (move.requiresArticle ? ( (typeof move.object === 'string' && move.object.length > 0 && ['a','e','i','o','u'].includes(move.object[0].toLowerCase()) ? `an ${move.object}` : `a ${move.object}`) ) : move.object) || 'an action'}. ${impactSentence}${tacticalSuffix}`; // FIX: Added battleState to substituteTokens calls above this point
    } else {
        // OLD: fullDescText = `${introPhrase} ${tacticalPrefix}${baseActionText}. ${impactSentence}${tacticalSuffix}`;
        fullDescText = `${introPhrase} ${tacticalPrefix}${baseActionText}. ${impactSentence}${tacticalSuffix}`; // FIX: Added battleState to substituteTokens calls above this point
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


export function generateTurnNarrationObjects(events, move, actor, opponent, result, environmentState, locationData, currentPhaseKey, isInitialBanter = false, aiLogEntry = {}, battleState) { // FIX: Added battleState
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
        // OLD: const quoteEvent = formatQuoteEvent(event.quote, event.actor, opponent, { '{moveName}': move?.name, currentPhaseKey, aiLogEntry });
        const quoteEvent = formatQuoteEvent(event.quote, event.actor, opponent, { '{moveName}': move?.name, currentPhaseKey, aiLogEntry, battleState }); // FIX: Pass battleState
        if (quoteEvent) {
            turnEventObjects.push(quoteEvent);
        }
    });

    // Only generate action descriptions and collateral if a `move` object exists (i.e., not a NarrativeOnly turn)
    if (move && result) { // Check for move object
        // Generate the main action description, which could be a standard move or the "move line" part of a reacted action
        const actionEvent = generateActionDescriptionObject(move, actor, opponent, result, currentPhaseKey, aiLogEntry, battleState); // FIX: Pass battleState
        turnEventObjects.push(actionEvent); // This actionEvent will now be simpler for reacted actions

        // Standard move execution quote (if not a reacted action that already has its narrative)
        if (!result.isReactedAction) {
            // OLD: const moveQuoteContext = { result: result.effectiveness.label, currentPhaseKey, aiLogEntry };
            const moveQuoteContext = { result: result.effectiveness.label, currentPhaseKey, aiLogEntry, battleState }; // FIX: Pass battleState
            const moveExecutionQuote = findNarrativeQuote(actor, opponent, 'onMoveExecution', move.name, moveQuoteContext);
            if (moveExecutionQuote) {
                // OLD: const quoteEvent = formatQuoteEvent(moveExecutionQuote, actor, opponent, { currentPhaseKey, aiLogEntry });
                const quoteEvent = formatQuoteEvent(moveExecutionQuote, actor, opponent, { currentPhaseKey, aiLogEntry, battleState }); // FIX: Pass battleState
                if (quoteEvent) {
                    quoteEvent.isMoveExecutionQuote = true;
                    turnEventObjects.push(quoteEvent);
                }
            }
        }


        const collateralEvent = generateCollateralDamageEvent(move, actor, opponent, environmentState, locationData, battleState); // FIX: Pass battleState
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
    } else if (currentPhaseKey === BATTLE_PHASES.PRE_BANTER) { // NEW: Handle narrative-only turns
        // For PreBanter, we might add a subtle hint that no combat occurred yet
        if (turnEventObjects.length === 0) { // If no actual banter was found for this character
            turnEventObjects.push({ type: 'narrative_info', text: `(${actor.name} observes their opponent in silence.)`, html_content: `<p class="narrative-info char-${actor.id}">(${actor.name} observes their opponent in silence.)</p>` });
        }
    }
    return turnEventObjects;
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