"use strict";

/**
 * @fileoverview AI Goal Setting
 * @description Determines the AI's primary goal for the turn and calculates decision weights based on context and personality.
 * @version 1.0.0
 */

// ============================================================================
// TYPE IMPORTS
// ============================================================================
/**
 * @typedef {import('../../types/ai.js').DecisionContext} DecisionContext
 * @typedef {import('../../types/ai.js').ThreatAssessment} ThreatAssessment
 * @typedef {import('../../types/ai.js').AiPersonality} AiPersonality
 * @typedef {import('../../types/ai.js').DecisionWeights} DecisionWeights
 */

// ============================================================================
// CONSTANTS
// ============================================================================
const DEFAULT_DECISION_WEIGHTS = {
    damage: 0.3,
    accuracy: 0.2,
    strategic: 0.25,
    personality: 0.15,
    memory: 0.1,
    risk: 0.1
};

// ============================================================================
// GOAL SETTING
// ============================================================================

/**
 * Calculates decision weights based on context and personality.
 * @param {DecisionContext} context The decision context.
 * @param {AiPersonality} personality The AI's personality traits.
 * @returns {DecisionWeights} The calculated decision weights.
 */
function calculateDecisionWeights(context, personality) {
    const weights = { ...DEFAULT_DECISION_WEIGHTS };

    if (personality.aggression > 0.7) {
        weights.damage += 0.1;
        weights.strategic -= 0.05;
    }
    if (personality.caution > 0.7) {
        weights.accuracy += 0.1;
        weights.risk += 0.1;
        weights.damage -= 0.1;
    }
    if (personality.creativity > 0.7) {
        weights.strategic += 0.1;
        weights.personality += 0.05;
    }

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    for (const key in weights) {
        weights[key] = weights[key] / totalWeight;
    }

    return weights;
}

/**
 * Determines the primary tactical goal for the current turn.
 * @param {DecisionContext} context The decision context.
 * @param {ThreatAssessment} threat The threat assessment.
 * @param {number} aggressionLevel The current situational aggression level.
 * @returns {string} The primary goal for the turn.
 */
function determinePrimaryGoal(context, threat, aggressionLevel) {
    if (context.self.hp < 25) {
        return "survive";
    }
    if (context.opponent.hp < 25) {
        return "finish_opponent";
    }
    if (aggressionLevel > 70) {
        return "deal_damage";
    }
    if (threat.overallThreat > 60 && aggressionLevel < 40) {
        return "defend";
    }
    return "gain_advantage";
}

// ============================================================================
// EXPORTS
// ============================================================================
export { calculateDecisionWeights, determinePrimaryGoal }; 