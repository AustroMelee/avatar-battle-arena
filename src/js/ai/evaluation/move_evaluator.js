"use strict";

/**
 * @fileoverview AI Move Evaluator
 * @description Evaluates all available moves for the AI and assigns a score to each.
 * @version 1.0.0
 */

// ============================================================================
// TYPE IMPORTS
// ============================================================================
/**
 * @typedef {import('../../types/battle.js').Move} Move
 * @typedef {import('../../types/ai.js').DecisionContext} DecisionContext
 * @typedef {import('../../types/ai.js').AiAnalysis} AiAnalysis
 * @typedef {import('../../types/ai.js').MoveEvaluation} MoveEvaluation
 * @typedef {import('../../types/ai.js').DecisionWeights} DecisionWeights
 */

// ============================================================================
// DEPENDENCY IMPORTS
// ============================================================================
import { calculateDamageScore, calculateAccuracyScore, calculateRiskScore, calculateStrategicScore } from "./scoring_calculators.js";
import { applyPersonalityModifiers, applyMemoryModifiers, generateMoveReasoning } from "../ai_scoring_utils.js";
import { simulateTurn } from "../simulation/turn_simulator.js";
import { getCharacterBias } from "../decision/bias.js";

// ============================================================================
// MOVE EVALUATION
// ============================================================================

/**
 * Evaluates all available moves for the AI.
 * @param {DecisionContext} context The decision context.
 * @param {AiAnalysis} analysis The AI's analysis.
 * @returns {Promise<MoveEvaluation[]>} A promise that resolves to an array of move evaluations.
 */
async function evaluateAvailableMoves(context, analysis) {
    const evaluations = await Promise.all(
        context.availableMoves.map(move => evaluateMove(move, context, analysis))
    );
    return evaluations.filter(e => e.confidence > 0.1);
}

/**
 * Evaluates a single move.
 * @param {Move} move The move to evaluate.
 * @param {DecisionContext} context The decision context.
 * @param {AiAnalysis} analysis The AI's analysis.
 * @returns {Promise<MoveEvaluation>} A promise that resolves to the move's evaluation.
 */
async function evaluateMove(move, context, analysis) {
    // --- NEW: SIMULATION-BASED EVALUATION ---
    const simulationResult = await simulateTurn(
        context.battleState,
        context.aiFighter,
        context.opponent,
        move
    );

    // The score is now derived directly from the value of the simulated future state.
    let finalScore = simulationResult.stateValue;

    // --- APPLY CHARACTER BIAS ---
    const bias = getCharacterBias(context.aiFighter.id);
    if (bias) {
        // This is a placeholder for a more complex bias application.
        // For now, we just add the bias values to the score.
        finalScore += (bias.overkill || 0) - (bias.selfPreservation || 0);
    }
    
    const factors = {
        simulatedValue: simulationResult.stateValue,
        biasAdjustment: finalScore - simulationResult.stateValue,
    };

    return {
        moveId: move.id,
        moveName: move.name,
        score: Math.max(0, Math.min(100, finalScore)),
        damage: 0, // Old factors are no longer relevant
        accuracy: 0,
        risk: 0,
        strategic: 0,
        reasoning: `Simulation: ${simulationResult.stateValue.toFixed(2)}. Bias Adj: ${(finalScore - simulationResult.stateValue).toFixed(2)}.`,
        factors,
        confidence: Math.min(1, finalScore / 100), // Confidence is based on the score
    };
}

// ============================================================================
// EXPORTS
// ============================================================================
export { evaluateAvailableMoves, evaluateMove }; 