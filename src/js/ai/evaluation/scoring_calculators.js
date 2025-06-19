"use strict";

/**
 * @fileoverview AI Scoring Calculators
 * @description Provides functions to calculate individual components of a move's score (damage, accuracy, risk, strategic value).
 * @version 1.0.0
 */

// ============================================================================
// TYPE IMPORTS
// ============================================================================
/**
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 * @typedef {import('../../types/ai.js').ThreatAssessment} ThreatAssessment
 * @typedef {import('../../types/ai.js').AiAnalysis} AiAnalysis
 * @typedef {import('../../types/battle.js').Move} Move
 * @typedef {import('../../types/ai.js').DecisionContext} DecisionContext
 */

// ============================================================================
// DEPENDENCY IMPORTS
// ============================================================================
import { getElementalEffectiveness } from "../ai_utils.js";

// ============================================================================
// SCORING CALCULATORS
// ============================================================================

/**
 * Calculates the damage score for a move.
 * @param {Move} move The move to evaluate.
 * @param {DecisionContext} context The decision context.
 * @returns {number} The damage score (0-100).
 */
function calculateDamageScore(move, context) {
    const effectiveness = getElementalEffectiveness(move.element, context.opponent.archetype);
    const finalDamage = (move.baseDamage || 0) * effectiveness;
    return Math.min(100, finalDamage);
}

/**
 * Calculates the accuracy score for a move.
 * @param {Move} move The move to evaluate.
 * @param {DecisionContext} context The decision context.
 * @returns {number} The accuracy score (0-100).
 */
function calculateAccuracyScore(move, context) {
    const hitChance = (move.accuracy || 0.8) * (1 - (context.opponent.stats.evasion || 0));
    return hitChance * 100;
}

/**
 * Calculates the risk score for a move.
 * @param {Move} move The move to evaluate.
 * @param {DecisionContext} context The decision context.
 * @param {AiAnalysis} analysis The AI's analysis.
 * @returns {number} The risk score (0-100), where higher is riskier.
 */
function calculateRiskScore(move, context, analysis) {
    let risk = 100 - (move.accuracy || 80);
    if (move.selfDamage) {
        risk += move.selfDamage * 2;
    }
    if (context.self.hp < 30) {
        risk += 20; // Increased risk at low health
    }
    return Math.min(100, risk);
}

/**
 * Calculates the strategic score for a move.
 * @param {Move} move The move to evaluate.
 * @param {DecisionContext} context The decision context.
 * @param {AiAnalysis} analysis The AI's analysis.
 * @returns {number} The strategic score (0-100).
 */
function calculateStrategicScore(move, context, analysis) {
    let strategicScore = 0;
    if (move.effects) {
        strategicScore += move.effects.length * 15;
    }
    if (analysis.primaryGoal === "defensive" && move.type === "defensive") {
        strategicScore += 40;
    }
    if (analysis.primaryGoal === "offensive" && move.type === "offensive") {
        strategicScore += 20;
    }
    // Add more complex strategic logic here...
    return Math.min(100, strategicScore);
}

// ============================================================================
// EXPORTS
// ============================================================================
export {
    calculateDamageScore,
    calculateAccuracyScore,
    calculateRiskScore,
    calculateStrategicScore
}; 