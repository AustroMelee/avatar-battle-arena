/**
 * @fileoverview AI Decision Engine (Top-Level Orchestrator)
 * @description Composes all AI modules to provide the main selectMove interface.
 * Handles logging, state updates, and coordination between subsystems.
 * @version 1.0
 */

'use strict';

import { adaptPersonality } from './ai_personality.js';
import { updateAiMemory } from './ai_memory.js';
import { determineStrategicIntent, getIntentDescription } from './ai_strategy_intent.js';
import { calculateMoveWeights, getViableMoves } from './ai_move_scoring.js';
import { selectMoveFromWeights, getSelectionStats } from './ai_move_selection.js';

/**
 * Default struggle move for emergency fallback
 */
const STRUGGLE_MOVE = {
    name: "Struggle",
    verb: 'struggle',
    type: 'Offense',
    power: 10,
    element: 'physical',
    moveTags: []
};

/**
 * Safe getter for nested object properties
 */
function safeGet(obj, path, defaultValue, actorName = 'Unknown Actor') {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    if (value === undefined || value === null) {
        return defaultValue;
    }
    return value;
}

/**
 * Creates a comprehensive AI log entry for debugging and analysis
 */
function createAiLogEntry(actor, defender, turn, currentPhase, intent, chosenMoveInfo) {
    const moveProb = chosenMoveInfo.probability || 0;
    const finalProb = `${(moveProb * 100).toFixed(1)}%`;

    return {
        turn: turn + 1,
        characterName: actor?.name || 'Unknown Actor',
        phase: currentPhase,
        intent: intent,
        intentDescription: getIntentDescription(intent),
        chosenMove: chosenMoveInfo.move?.name || 'Unknown Move',
        finalProb: finalProb,
        temperature: chosenMoveInfo.temperature || 'N/A',
        actorState: {
            hp: actor?.hp || 0,
            energy: actor?.energy || 0,
            momentum: actor?.momentum || 0,
            mental: actor?.mentalState?.level || 'Normal',
            escalation: actor?.escalationState || 'Normal',
            previousMental: actor?._previousMentalState || 'Normal'
        },
        opponentEscalation: defender?.escalationState || 'Normal',
        reasons: (chosenMoveInfo.reasons || []).join(', '),
        selectionMethod: chosenMoveInfo.temperature === 0 ? 'deterministic' : 'probabilistic'
    };
}

/**
 * Handles AI state updates and learning
 */
function updateAiState(actor, defender) {
    // Update AI memory based on recent experiences
    updateAiMemory(actor, defender);
    
    // Adapt personality based on recent move effectiveness
    adaptPersonality(actor);
}

/**
 * Main AI decision function - selects a move for the given actor
 * This is the primary public interface for AI decision making
 */
export function selectMove(actor, defender, conditions, turn, currentPhase) {
    // Validate inputs
    if (!actor || !defender || !conditions) {
        console.warn('[AI Decision] Invalid inputs provided to selectMove');
        return {
            move: STRUGGLE_MOVE,
            aiLogEntryFromSelectMove: {
                intent: 'Error',
                chosenMove: 'Struggle',
                reasons: 'InvalidInputs'
            }
        };
    }

    // Initialize AI arrays if they don't exist
    if (!actor.aiLog) actor.aiLog = [];

    // Update AI state based on previous turn results
    updateAiState(actor, defender);

    // Determine strategic intent
    const intent = determineStrategicIntent(actor, defender, turn, currentPhase);

    // Handle narrative-only phases
    if (intent === 'NarrativeOnly') {
        const logEntry = createAiLogEntry(actor, defender, turn, currentPhase, intent, {
            move: null,
            probability: 1.0,
            reasons: ['NarrativePhase']
        });
        actor.aiLog.push(logEntry);
        
        return {
            move: null,
            aiLogEntryFromSelectMove: logEntry
        };
    }

    // Calculate move weights based on intent and conditions
    let weightedMoves = calculateMoveWeights(actor, defender, conditions, intent, currentPhase);
    let viableMoves = getViableMoves(weightedMoves);

    // Fallback to struggle if no viable moves
    if (viableMoves.length === 0) {
        viableMoves = [{
            move: STRUGGLE_MOVE,
            weight: 1.0,
            reasons: ['FallbackOnlyStruggle']
        }];
    }

    // Select move using personality-based predictability
    const predictability = safeGet(actor.personalityProfile, 'predictability', 0.5, actor.name);
    const chosenMoveInfo = selectMoveFromWeights(viableMoves, predictability);

    // Create comprehensive log entry
    const aiLogEntry = createAiLogEntry(actor, defender, turn, currentPhase, intent, chosenMoveInfo);
    
    // Add selection statistics for debugging
    if (chosenMoveInfo.probability && chosenMoveInfo.probability < 1.0) {
        const selectionStats = getSelectionStats([chosenMoveInfo]);
        aiLogEntry.selectionStats = selectionStats;
    }

    actor.aiLog.push(aiLogEntry);

    return {
        move: chosenMoveInfo.move,
        aiLogEntryFromSelectMove: aiLogEntry
    };
}

/**
 * Provides detailed AI analysis for debugging (without making a decision)
 */
export function analyzeAiDecision(actor, defender, conditions, turn, currentPhase) {
    const intent = determineStrategicIntent(actor, defender, turn, currentPhase);
    const weightedMoves = calculateMoveWeights(actor, defender, conditions, intent, currentPhase);
    const viableMoves = getViableMoves(weightedMoves);
    
    const predictability = safeGet(actor.personalityProfile, 'predictability', 0.5, actor.name);
    
    return {
        intent,
        intentDescription: getIntentDescription(intent),
        totalMoves: weightedMoves.length,
        viableMoves: viableMoves.length,
        predictability,
        topMoves: weightedMoves
            .filter(m => m.weight > 0)
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 3)
            .map(m => ({
                name: m.move.name,
                weight: m.weight.toFixed(3),
                reasons: m.reasons.join(', ')
            }))
    };
}

/**
 * Resets AI state for a new battle
 */
export function resetAiState(actor) {
    if (!actor) return;
    
    actor.aiLog = [];
    
    // Reset memory if it exists
    if (actor.aiMemory) {
        actor.aiMemory.moveSuccessCooldown = {};
        actor.aiMemory.repositionCooldown = 0;
        // Keep personality and opponent model for continuity
    }
}

/**
 * Gets AI decision summary for post-battle analysis
 */
export function getAiSummary(actor) {
    if (!actor?.aiLog) {
        return { totalDecisions: 0, intents: {}, averageConfidence: 0 };
    }

    const intents = {};
    let totalConfidence = 0;
    let confidenceCount = 0;

    actor.aiLog.forEach(entry => {
        // Count intents
        intents[entry.intent] = (intents[entry.intent] || 0) + 1;
        
        // Calculate average confidence (probability)
        const probMatch = entry.finalProb?.match(/(\d+\.?\d*)%/);
        if (probMatch) {
            totalConfidence += parseFloat(probMatch[1]);
            confidenceCount++;
        }
    });

    return {
        totalDecisions: actor.aiLog.length,
        intents,
        averageConfidence: confidenceCount > 0 ? (totalConfidence / confidenceCount).toFixed(1) + '%' : 'N/A',
        lastIntent: actor.aiLog[actor.aiLog.length - 1]?.intent || 'None'
    };
} 