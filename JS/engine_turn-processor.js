// FILE: engine_turn-processor.js
'use strict';

/**
 * @file Turn Processor
 * @description Manages all logic within a single character's turn, from action
 * selection to resolution and narrative generation.
 */

// --- ENGINE MODULE IMPORTS ---
import { selectMove, updateAiMemory } from './engine_ai-decision.js';
import { calculateMove } from './engine_move-resolution.js';
import { updateMentalState } from './engine_mental-state.js';
import { applyEffect } from './engine_effect_application.js';
import { attemptManipulation } from './engine_manipulation.js';
import { charactersMarkedForDefeat } from './engine_curbstomp_manager.js';
import { MIN_ENERGY_FOR_ACTION, ENERGY_RECOVERY_PER_TURN, MAX_ENERGY } from './config_game.js';
import { generateTurnNarrationObjects, findNarrativeQuote, generateStatusChangeEvent, generateEnvironmentalSummaryEvent } from './engine_narrative-engine.js';
import { clamp } from './utils_math.js';
import { generateLogEvent } from './utils_log_event.js';
import { safeGet } from './utils_safe_accessor.js';


/**
 * Generates all narrative events for a given action and its result.
 * @private
 */
function generateActionNarrative(attacker, defender, move, result, battleState, phaseState) {
    const narrativeEvents = [];
    const phase = phaseState.currentPhase;
    
    // Main action description
    narrativeEvents.push(...generateTurnNarrationObjects(
        [], 
        {...move, actionVariants: move.actionVariants || []}, 
        attacker, 
        defender, 
        result, 
        battleState.environmentState, 
        battleState.locationConditions, 
        phase, 
        false, 
        null, 
        battleState
    ));

    // Effectiveness-based quotes
    if (result.effectiveness.label === 'Critical') {
        const quote = findNarrativeQuote(attacker, defender, 'onCriticalHitLanded', phase, { currentPhaseKey: phase, battleState });
        if (quote) narrativeEvents.push(...generateTurnNarrationObjects(
            [{ quote, actor: attacker }], 
            null, 
            attacker, 
            defender, 
            null, 
            battleState.environmentState, 
            battleState.locationConditions, 
            phase, 
            false, 
            null, 
            battleState
        ));
    } else if (result.effectiveness.label === 'Weak') {
        const quote = findNarrativeQuote(attacker, defender, 'onWeakHitLanded', phase, { currentPhaseKey: phase, battleState });
        if (quote) narrativeEvents.push(...generateTurnNarrationObjects(
            [{ quote, actor: attacker }], 
            null, 
            attacker, 
            defender, 
            null, 
            battleState.environmentState, 
            battleState.locationConditions, 
            phase, 
            false, 
            null, 
            battleState
        ));
    }
    
    // State change quotes (Mental State)
    const mentalStateEvents = result.effects.filter(e => e.type === 'MENTAL_STATE_CHANGE');
    if (mentalStateEvents.length > 0) {
        const quote = findNarrativeQuote(defender, attacker, 'onStateChange', defender.mentalState.level, { battleState });
        if (quote) narrativeEvents.push(...generateTurnNarrationObjects([{ quote, actor: defender }], null, defender, attacker, null, battleState, false));
    }

    return narrativeEvents;
}

/**
 * Handles the case where a fighter cannot act (e.g., stunned, low energy).
 * @private
 */
function handleInaction(attacker, battleState) {
    const events = [];
    if (attacker.stunDuration > 0) {
        attacker.stunDuration--;
        if (attacker.stunDuration === 0) attacker.consecutiveStuns = 0;
        events.push(generateLogEvent(battleState, { 
            type: 'stun_event', 
            actorId: attacker.id,
            characterName: attacker.name,
            text: `${attacker.name} is stunned and unable to move!`,
            html_content: `<p class="narrative-action char-${attacker.id}">${attacker.name} is stunned and unable to move!</p>`
        }));
    } else if (attacker.energy < MIN_ENERGY_FOR_ACTION) {
        const oldEnergy = attacker.energy;
        attacker.energy = clamp(attacker.energy + ENERGY_RECOVERY_PER_TURN, 0, MAX_ENERGY);
        const energyEvent = generateStatusChangeEvent(battleState, attacker, 'energy_change', oldEnergy, attacker.energy);
        if (energyEvent) events.push(energyEvent);
    }
    return events;
}

/**
 * Processes a single turn for one attacker.
 * @returns {Array} An array of log events generated during this turn.
 */
export function processTurn(attacker, defender, battleState, phaseState) {
    try {
        // Defensive Programming: Validate all input parameters
        if (!attacker || typeof attacker !== 'object') {
            console.error('[Turn Processor] Invalid attacker object:', attacker);
            return [];
        }
        if (!defender || typeof defender !== 'object') {
            console.error('[Turn Processor] Invalid defender object:', defender);
            return [];
        }
        if (!battleState || typeof battleState !== 'object') {
            console.error('[Turn Processor] Invalid battleState object:', battleState);
            return [];
        }
        if (!phaseState || typeof phaseState !== 'object') {
            console.error('[Turn Processor] Invalid phaseState object:', phaseState);
            return [];
        }

        const attackerName = safeGet(attacker, 'name', 'Unknown Attacker');
        const phaseName = safeGet(phaseState, 'currentPhase', 'unknown');
        const turnNumber = safeGet(battleState, 'turn', -1);

        console.debug(`[Turn Processor] Processing turn for ${attackerName} (Phase: ${phaseName}, Turn: ${turnNumber})`);
        console.debug(`[Turn Processor] Attacker state: HP ${safeGet(attacker, 'health', 'N/A')}, Energy ${safeGet(attacker, 'energy', 'N/A')}, Stun ${safeGet(attacker, 'stunDuration', 0)}`);
    
    const turnEvents = [generateLogEvent(battleState, { 
        type: 'turn_marker', 
        actorId: attacker.id, 
        characterName: attacker.name,
        turn: battleState.turn + 1,
        portrait: attacker.portrait
    })];

    // 1. Handle Pre-Action State (Stun, Energy, Marked for Defeat)
    if (charactersMarkedForDefeat.has(attacker.id) || attacker.stunDuration > 0 || attacker.energy < MIN_ENERGY_FOR_ACTION) {
        turnEvents.push(...handleInaction(attacker, battleState));
        return turnEvents;
    }

    // 2. Manipulation Attempt (optional pre-action)
    const manipulationResult = attemptManipulation(attacker, defender, battleState, turnEvents);
    if (manipulationResult.success) {
        updateMentalState(defender, attacker, { effectiveness: { label: manipulationResult.effect } }, battleState.environmentState, battleState.locationId, battleState);
        const successQuote = findNarrativeQuote(attacker, defender, 'onManipulationSuccess', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState });
        if (successQuote) {
            turnEvents.push(...generateTurnNarrationObjects(
                [{ quote: successQuote, actor: attacker }], 
                null, 
                attacker, 
                defender, 
                null, 
                battleState.environmentState, 
                battleState.locationConditions, 
                phaseState.currentPhase, 
                false, 
                null, 
                battleState
            ));
        }
    } else if (manipulationResult.attempted) {
        const failureQuote = findNarrativeQuote(attacker, defender, 'onManipulationFailure', phaseState.currentPhase, { currentPhaseKey: phaseState.currentPhase, battleState });
        if (failureQuote) {
            turnEvents.push(...generateTurnNarrationObjects(
                [{ quote: failureQuote, actor: attacker }], 
                null, 
                attacker, 
                defender, 
                null, 
                battleState.environmentState, 
                battleState.locationConditions, 
                phaseState.currentPhase, 
                false, 
                null, 
                battleState
            ));
        }
    }
    
    // 3. AI Selects a Move
    const aiDecision = selectMove(attacker, defender, battleState.locationConditions, battleState.turn, battleState.currentPhase);
    const move = aiDecision.move;
    if (!move) {
        turnEvents.push(generateLogEvent(battleState, { 
            type: 'action_failure_event', 
            actorId: attacker.id,
            characterName: attacker.name,
            text: `${attacker.name} hesitates, unsure of what to do.`,
            html_content: `<p class="narrative-action char-${attacker.id}">${attacker.name} hesitates, unsure of what to do.</p>`
        }));
        return turnEvents;
    }
    
    // 4. Resolve the Move (Calculate Damage, Effects, etc.)
    const result = calculateMove(
        move,
        attacker,
        defender,
        battleState.locationConditions,
        turnEvents,
        attacker.aiLog,
        battleState.environmentState,
        battleState.locationId,
        null,
        battleState
    );

    // 5. Apply All Effects from the Result
    result.effects.forEach(effect => {
        const effectResult = applyEffect({ ...effect, sourceMove: move }, attacker, defender, battleState, turnEvents);
        if (effectResult.events && effectResult.events.length > 0) {
            turnEvents.push(...effectResult.events);
        }
    });

    // 6. Generate Narrative for the Action
    const narrativeEvents = generateActionNarrative(attacker, defender, move, result, battleState, phaseState);
    turnEvents.push(...narrativeEvents);

    // 7. Post-Action Updates
    const oldEnergy = attacker.energy;
    attacker.energy = clamp(attacker.energy - (result.energyCost || 0), 0, MAX_ENERGY);
    if(oldEnergy !== attacker.energy) {
        const energyEvent = generateStatusChangeEvent(battleState, attacker, 'energy_change', oldEnergy, attacker.energy);
        if (energyEvent) turnEvents.push(energyEvent);
    }
    
    // Update move history and AI memory
    attacker.moveHistory.push({ ...move, effectiveness: result.effectiveness.label });
    updateAiMemory(attacker, defender);

    // Generate environmental summary if there were impacts this turn
    const environmentalSummary = generateEnvironmentalSummaryEvent(battleState, battleState.environmentState);
    if (environmentalSummary) {
        turnEvents.push(environmentalSummary);
        // Reset environmental impacts for next phase/turn
        battleState.environmentState.environmentalImpactsThisPhase = [];
        battleState.environmentState.highestImpactLevelThisPhase = 'subtle';
    }

        return turnEvents;
    } catch (error) {
        console.error('[Turn Processor] Critical error during turn processing:', error);
        // Return minimal safe event log in case of complete failure
        const safeAttackerName = safeGet(attacker, 'name', 'Unknown');
        const safeActorId = safeGet(attacker, 'id', 'unknown');
        
        return [generateLogEvent(battleState || {}, {
            type: 'action_failure_event',
            actorId: safeActorId,
            characterName: safeAttackerName,
            text: `${safeAttackerName} encounters an unexpected problem and cannot act.`,
            html_content: `<p class="narrative-action char-${safeActorId}">${safeAttackerName} encounters an unexpected problem and cannot act.</p>`,
            error: error.message
        })];
    }
}