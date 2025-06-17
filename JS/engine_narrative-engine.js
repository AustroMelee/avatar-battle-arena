// FILE: engine_narrative-engine.js
'use strict';

// Version 1.4: Stripped-down version for Aang vs. Azula
// - Removed all unnecessary character archetype imports and map entries.

import { conjugatePresent, getEmojiForMoveType, postBattleVictoryPhrases, consumedStateNarratives } from './narrative-flavor.js';
import { effectivenessLevels } from './data_narrative_effectiveness.js';
import { escalationStateNarratives } from './data_narrative_escalation.js';
import { phaseTemplates, battlePhases } from './data_narrative_phases.js';

import { locationConditions } from './location-battle-conditions.js';
import { characters as characterData } from './data_characters.js';
import { ESCALATION_STATES } from './engine_escalation.js';
import { BATTLE_PHASES } from './engine_battle-phase.js';
import { NarrativeStringBuilder } from './utils_narrative-string-builder.js';
import { locations } from './locations.js';
import { generateLogEvent } from './utils_log_event.js';
import { getRandomElementSeeded, seededRandom } from './utils_seeded_random.js';
import { USE_DETERMINISTIC_RANDOM } from './config_game.js';
import { EFFECT_TYPES } from './data_mechanics_definitions.js';

// --- ARCHETYPE DATA IMPORTS (Stripped Down) ---
import { aangArchetypeData } from './data_archetype_aang.js';
import { azulaArchetypeData } from './data_archetype_azula.js';

import { allArchetypes } from './data_archetypes_index.js'; // Import all archetypes

function getEnvironmentImpactLine(locationId, currentPhase, isCrit = false, moveType = null, moveElement = null, recentlyUsedLines = []) {
    const loc = locations[locationId];
    if (!loc) {
        return ""; // Safety
    }

    let messagePool = [];

    if (isCrit && loc.envImpactCritical && loc.envImpactCritical.length > 0) {
        messagePool = loc.envImpactCritical;
    } else {
        switch (currentPhase) {
            case 'Poking':
            case 'Opening':
                messagePool = loc.envImpactInitial || [];
                break;
            case 'Early':
                messagePool = loc.envImpactInitial || [];
                break;
            case 'Mid':
                messagePool = loc.envImpactMid || [];
                break;
            case 'Late':
                messagePool = loc.envImpactLate || loc.envImpactMid || [];
                break;
            case 'Decisive':
            case 'FinalBlow':
                messagePool = loc.envImpactLate || loc.envImpactMid || [];
                break;
            default:
                messagePool = []; // Fallback if no specific phase pool
        }
    }

    // Filter out recently used lines and fall back to general variants if specific pool is exhausted
    let availablePool = messagePool.filter(line => !recentlyUsedLines.includes(line));
    if (availablePool.length === 0 && loc.envImpactVariants) {
        availablePool = loc.envImpactVariants.filter(line => !recentlyUsedLines.includes(line));
    }

    if (availablePool && availablePool.length > 0) {
        return getRandomElementSeeded(availablePool);
    }
    return "";
}

export function substituteTokens(template, primaryActorForContext, secondaryActorForContext, additionalContext = {}) {
    if (typeof template !== 'string') return '';
    let text = template;

    const actor = primaryActorForContext;
    const opponent = secondaryActorForContext;

    const actorNameDisplay = additionalContext.WinnerName || additionalContext.attackerName || additionalContext.characterName || actor?.name || 'A fighter';
    const opponentNameDisplay = additionalContext.LoserName || additionalContext.targetName || (actor?.id === opponent?.id ? 'their reflection' : opponent?.name) || 'Their opponent';

    const safeActorPronouns = actor?.pronouns || { s: 'he', p: 'his', o: 'him' };
    const safeOpponentPronouns = opponent?.pronouns || { s: 'he', p: 'his', o: 'him' };
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
            text = text.replace(new RegExp(token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\$&'), 'g'), (match, offset, originalString) => {
                const stringBefore = originalString.substring(0, offset);
                const lastChar = stringBefore.slice(-1);
                if (offset === 0 || (lastChar && /[.!?]\s/.test(stringBefore.slice(-2)))) {
                    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
                }
                return String(value);
            });
        }
    }
    return text;
}

export function findNarrativeQuote(actor, recipient, type, phase, context) {
    const archetype = allArchetypes[actor.id]; // Use allArchetypes here
    if (!archetype || !archetype.quotes) return null;

    if (!actor) return null;
    const actorArchetypeData = allArchetypes[actor.id] || {};
    const narrativeData = actorArchetypeData.narrative || {};

    let pool = null;
    const currentPhaseKey = context.currentPhaseKey || 'Generic';

    const lookupPaths = [];

    // Relationship-specific narrative first
    if (recipient?.id && actor.relationships?.[recipient.id]?.narrative) {
        const relNarrative = actor.relationships[recipient.id].narrative;
        if (relNarrative[type]?.[phase]?.Generic) {
            lookupPaths.push(() => relNarrative[type][phase].Generic);
        }
    }

    // Character's general narrative from archetype data
    if (type === 'battleStart' && context.locationId) {
        if (actorArchetypeData[recipient.id]?.[context.locationId]?.label) {
            // This is for the matchup intro, handled by resolveArchetypeLabel
        } else if (narrativeData[type]?.[currentPhaseKey]) {
            lookupPaths.push(() => narrativeData[type][currentPhaseKey]);
        }
    } else {
        if (narrativeData[type]?.[phase]?.[currentPhaseKey]) {
            lookupPaths.push(() => narrativeData[type][phase][currentPhaseKey]);
        }
        if (narrativeData[type]?.[phase]?.Generic) {
            lookupPaths.push(() => narrativeData[type][phase].Generic);
        }
    }

    // General trigger fallback
    if (narrativeData[type]?.general?.Generic) {
        lookupPaths.push(() => narrativeData[type].general.Generic);
    }

    for (const getPool of lookupPaths) {
        pool = getPool();
        if (pool && Array.isArray(pool) && pool.length > 0) {
            const selectedElement = getRandomElementSeeded(pool); // Use getRandomElementSeeded
            if (selectedElement && typeof selectedElement === 'object' && selectedElement.type && selectedElement.line) {
                return selectedElement;
            } else if (typeof selectedElement === 'string') {
                return { type: 'spoken', line: selectedElement };
            }
        }
    }

    return null;
}

export function formatQuoteEvent(quote, actor, opponent, context) {
    if (!quote || typeof quote.line !== 'string') return null;
    const { type, line } = quote;
    const substitutedLine = substituteTokens(line, actor, opponent, context);

    let htmlContent = '';
    let baseEvent = {};

    switch (type) {
        case 'spoken':
        case 'action':
            htmlContent = `<p class="dialogue-line char-${actor.id}">${actor.name} says, "<em>${substitutedLine}</em>"</p>`;
            baseEvent = { type: 'dialogue_event', actorId: actor.id, characterName: actor.name, text: `${actor.name} says, "${substitutedLine}"`, html_content: htmlContent, isDialogue: true, dialogueType: type };
            break;
        case 'internal':
            htmlContent = `<p class="dialogue-line internal-thought char-${actor.id}"><em>(${substitutedLine})</em></p>`;
            baseEvent = { type: 'internal_thought_event', actorId: actor.id, characterName: actor.name, text: `(${actor.name} thinks: ${substitutedLine})`, html_content: htmlContent, isInternalThought: true, dialogueType: type };
            break;
        case 'environmental':
            htmlContent = `<p class="environmental-impact-text">${substitutedLine}</p>`;
            baseEvent = { type: 'environmental_impact_event', actorId: null, characterName: 'Environment', text: substitutedLine, html_content: htmlContent, isEnvironmental: true };
            break;
        default:
            htmlContent = `<p class="narrative-event">${substitutedLine}</p>`;
            baseEvent = { type: 'generic_narrative_event', actorId: actor?.id || null, characterName: actor?.name || 'Narrator', text: substitutedLine, html_content: htmlContent };
            break;
    }
    return generateLogEvent(context.battleState, baseEvent);
}

export function generateActionDescriptionObject(move, actor, defender, result, environmentState, locationData, currentPhase, aiLogEntry, battleState) {
    const effectiveness = result.effectiveness.label;
    const builder = new NarrativeStringBuilder(actor, defender, move, effectivenessLevels, locationData, { isCrit: effectiveness === 'Critical' });
    const { actionSentence, htmlSentence } = builder.buildActionDescription(effectiveness, null, null);
    
    console.log("generateActionDescriptionObject - Action Sentence:", actionSentence);
    console.log("generateActionDescriptionObject - HTML Sentence:", htmlSentence);

    return generateLogEvent(battleState, {
        type: 'move_action_event',
        actorId: actor.id,
        characterName: actor.name,
        moveName: move.name,
        moveType: move.type,
        moveTags: move.moveTags || [],
        text: actionSentence,
        html_content: htmlSentence,
        effectiveness: effectiveness,
        damage: result.damage,
        element: move.element,
    });
}

export function generateCollateralDamageEvent(move, actor, opponent, environmentState, locationData, battleState, result) {
    // Check if an ENVIRONMENTAL_DAMAGE effect exists in the result
    const envDamageEffect = result.effects?.find(effect => effect.type === EFFECT_TYPES.ENVIRONMENTAL_DAMAGE);

    if (!envDamageEffect) {
        console.log("generateCollateralDamageEvent - No environmental damage effect found.");
        return null; // No environmental damage effect, so no narrative needed
    }

    const isCrit = result.effectiveness.label === 'Critical';
    const collateralPhrase = getEnvironmentImpactLine(locationData.id, battleState.currentPhase, isCrit, move.type, move.element, environmentState.environmentalImpactsThisPhase.map(e => e.line));

    if (!collateralPhrase) {
        console.log("generateCollateralDamageEvent - No collateral phrase generated or line was a repeat.");
        return null; // No relevant phrase generated or it was a repeat
    }

    // Increment impact count and store the phrase for summarization
    environmentState.environmentalImpactCount = (environmentState.environmentalImpactCount || 0) + 1;
    environmentState.environmentalImpactsThisPhase.push({
        line: collateralPhrase,
        turn: battleState.turn,
        phase: battleState.currentPhase,
        move: move.name,
        actor: actor.name
    });

    const htmlContent = `<p class="environmental-impact-text">${collateralPhrase}</p>`;

    return generateLogEvent(battleState, {
        type: 'collateral_damage_event',
        actorId: actor.id,
        characterName: actor.name,
        text: collateralPhrase,
        html_content: htmlContent,
        isEnvironmental: true,
        impactAmount: envDamageEffect.value,
        locationId: locationData.id
    });
}

export function generateEscalationNarrative(fighter, oldState, newState, battleState) {
    if (!fighter || !newState || oldState === newState) return null;
    const flavorText = getRandomElementSeeded(escalationStateNarratives[newState] || [`{actorName}'s condition worsens.`]);
    const substitutedFlavorText = substituteTokens(flavorText, fighter, null);
    const templateKey = newState.toLowerCase().replace(/ /g, '_');
    const htmlTemplate = phaseTemplates.escalationStateChangeTemplates[templateKey] || phaseTemplates.escalationStateChangeTemplates.general;
    const htmlContent = substituteTokens(htmlTemplate, fighter, null, { '{escalationFlavorText}': substitutedFlavorText });
    return generateLogEvent(battleState, {
        type: 'escalation_change_event',
        actorId: fighter.id,
        characterName: fighter.name,
        oldState,
        newState,
        text: substitutedFlavorText,
        html_content: htmlContent,
        isEscalationEvent: true
    });
}

/**
 * Generates a summarized environmental impact event if conditions are met.
 * @param {object} battleState - The current battle state.
 * @param {object} environmentState - The current environment state.
 * @param {string} locationId - The ID of the current location.
 * @returns {object|null} A summarized environmental event or null if no summary is needed.
 */
export function generateEnvironmentalSummaryEvent(battleState, environmentState, locationId) {
    if (!environmentState.environmentalImpactsThisPhase || environmentState.environmentalImpactsThisPhase.length === 0) {
        return null;
    }

    let summaryPhrase = ""; // Will be dynamically set
    let headerPhrase = ""; // The more narrative header phrase
    const impactCount = environmentState.environmentalImpactsThisPhase.length;

    if (impactCount === 1) {
        summaryPhrase = `The battle left a subtle mark on the surroundings.`;
        headerPhrase = `The environment bears subtle new marks.`;
    } else if (impactCount >= 2 && impactCount <= 4) {
        summaryPhrase = `Minor alterations appeared in the environment due to the ongoing fight.`;
        headerPhrase = `The arena shows minor fresh scars.`;
    } else if (impactCount >= 5 && impactCount <= 7) {
        summaryPhrase = `The environment visibly reacted to the clash, showing signs of significant impact.`;
        headerPhrase = `The environment visibly reacted to the clash.`;
    } else if (impactCount >= 8) {
        summaryPhrase = `Widespread destruction scarred the landscape, a testament to the battle's ferocity.`;
        headerPhrase = `Widespread destruction scars the landscape.`;
    }
    
    // Select a distinct environmental impact from the phase for display, if available
    const distinctImpact = environmentState.environmentalImpactsThisPhase.length > 0
        ? getRandomElementSeeded(environmentState.environmentalImpactsThisPhase.map(e => e.line))
        : null;

    let htmlContent = `<div class="environmental-summary"><p class="environmental-summary-header">${headerPhrase}</p>`;
    if (distinctImpact) {
        htmlContent += `<p class="environmental-summary-detail">${distinctImpact}</p>`;
    }
    htmlContent += `</div>`;

    return generateLogEvent(battleState, {
        type: 'environmental_summary_event',
        text: summaryPhrase, // The original summaryPhrase for raw log
        html_content: htmlContent, // The richer HTML content
        isEnvironmental: true,
        totalImpactsThisPhase: impactCount,
        summaryDetail: distinctImpact // Store the distinct impact for potential future use
    });
}

export function generateTurnNarrationObjects(narrativeEventsForAction, move, actor, defender, result, environmentState, locationData, currentPhase, isPreBattle, aiLogEntry, battleState) {
    const narrationObjects = [];
    if (isPreBattle) {
        const preBattleQuote = findNarrativeQuote(actor, defender, 'battleStart', currentPhase, { locationId: locationData.id, currentPhaseKey: currentPhase });
        if (preBattleQuote) narrationObjects.push(formatQuoteEvent(preBattleQuote, actor, defender, { battleState: battleState }));
    } else if (move && result) {
        narrationObjects.push(generateActionDescriptionObject(move, actor, defender, result, environmentState, locationData, currentPhase, aiLogEntry, battleState));
        const collateralEvent = generateCollateralDamageEvent(move, actor, defender, environmentState, locationData, battleState, result);
        if (collateralEvent) narrationObjects.push(collateralEvent);
    }
    return narrationObjects;
}

export function getFinalVictoryLine(winner, loser) {
    if (!winner || !loser) return "The battle is over.";
    const winnerStyle = winner.victoryStyle || 'default';
    const phraseCategory = (winner.hp > 75) ? 'dominant' : 'narrow';
    const phraseTemplate = (postBattleVictoryPhrases[winnerStyle] && postBattleVictoryPhrases[winnerStyle][phraseCategory]) || postBattleVictoryPhrases.default[phraseCategory];
    return substituteTokens(getRandomElementSeeded(phraseTemplate), winner, loser, { WinnerName: winner.name, LoserName: loser.name, WinnerPronounP: winner.pronouns.p });
}

export function generateCurbstompNarration(rule, attacker, target, isEscape = false, battleState) {
    if (!rule) return null;
    let message = isEscape ? rule.outcome.failureMessage : rule.outcome.successMessage;
    let narrationText = substituteTokens(message, attacker, target, { attackerName: attacker.name, targetName: target.name });
    return generateLogEvent(battleState, {
        type: 'curbstomp_event',
        text: narrationText
    });
}

export function generateStatusChangeEvent(battleState, character, type, oldValue, newValue, attributeName) {
    let text = '';
    let html_content = '';
    let isSignificant = false;

    switch (type) {
        case 'hp_change':
            const hpChange = newValue - oldValue;
            if (hpChange !== 0) {
                text = `${character.name} ${hpChange > 0 ? 'recovers' : 'loses'} ${Math.abs(hpChange)} HP. (Current: ${newValue})`;
                html_content = `<p class="status-change ${hpChange > 0 ? 'hp-heal' : 'hp-damage'} char-${character.id}">${character.name} <span class="hp-change-value">${hpChange > 0 ? '+' : ''}${hpChange} HP</span></p>`;
                if (Math.abs(hpChange) >= 10 || newValue <= 20) isSignificant = true; // Significant if large change or low HP
            }
            break;
        case 'energy_change':
            const energyChange = newValue - oldValue;
            if (energyChange !== 0) {
                text = `${character.name} ${energyChange > 0 ? 'gains' : 'loses'} ${Math.abs(energyChange)} Energy. (Current: ${newValue})`;
                html_content = `<p class="status-change ${energyChange > 0 ? 'energy-gain' : 'energy-loss'} char-${character.id}">${character.name} <span class="energy-change-value">${energyChange > 0 ? '+' : ''}${energyChange} Energy</span></p>`;
                if (Math.abs(energyChange) >= 10 || newValue <= 10) isSignificant = true; // Significant if large change or low energy
            }
            break;
        case 'mental_state_change':
            text = `${character.name}'s mental state shifts from ${oldValue} to ${newValue}.`;
            html_content = `<p class="status-change mental-state-change char-${character.id}">${character.name}'s mental state: <span class="old-state">${oldValue}</span> → <span class="new-state">${newValue}</span></p>`;
            if (oldValue !== newValue) isSignificant = true;
            break;
        case 'momentum_change':
            const momentumChange = newValue - oldValue;
            if (momentumChange !== 0) {
                text = `${character.name}'s momentum ${momentumChange > 0 ? 'increases' : 'decreases'} by ${Math.abs(momentumChange)}. (Current: ${newValue})`;
                html_content = `<p class="status-change momentum-change ${momentumChange > 0 ? 'momentum-gain' : 'momentum-loss'} char-${character.id}">${character.name}'s Momentum: <span class="momentum-change-value">${momentumChange > 0 ? '+' : ''}${momentumChange}</span> (Current: ${newValue})</p>`;
                if (Math.abs(momentumChange) >= 2) isSignificant = true;
            }
            break;
        case 'stun_status_change':
            text = newValue > 0 ? `${character.name} is stunned for ${newValue} turn(s).` : `${character.name} recovers from stun.`;
            html_content = `<p class="status-change stun-status ${newValue > 0 ? 'stunned' : 'recovered'} char-${character.id}">${text}</p>`;
            isSignificant = true;
            break;
        default:
            console.warn(`Attempted to generate unknown status change event type: ${type}`);
            return null;
    }

    if (text === '') return null; // No change, no event

    return generateLogEvent(battleState, {
        type: 'status_change_event',
        actorId: character.id,
        characterName: character.name,
        text: text,
        html_content: html_content,
        isSignificant: isSignificant,
        statusType: type,
        oldValue: oldValue,
        newValue: newValue,
        attributeName: attributeName || type.replace('_change', '') // e.g., 'hp', 'energy'
    });
}

// Centralized Tag/Context Registry
const NARRATIVE_TAGS = {
    // ... existing code ...
};

