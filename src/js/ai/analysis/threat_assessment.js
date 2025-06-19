"use strict";

/**
 * @fileoverview AI Threat Assessment
 * @description Provides functions for analyzing the threat level posed by the opponent and the overall risk of the current situation.
 * @version 1.0.0
 */

// ============================================================================
// TYPE IMPORTS
// ============================================================================
/**
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 * @typedef {import('../../types/ai.js').ThreatAssessment} ThreatAssessment
 * @typedef {import('../../types/ai.js').DecisionContext} DecisionContext
 */

// ============================================================================
// THREAT ASSESSMENT
// ============================================================================

/**
 * Assesses the threat level posed by the opponent.
 * @param {DecisionContext} context The decision context.
 * @returns {ThreatAssessment} An object containing the threat assessment.
 */
function assessThreatLevel(context) {
    const { self, opponent } = context;
    const immediateThreat = (opponent.stats.damageDealt / (self.stats.damageReceived + 1)) * 50;
    const longTermThreat = (opponent.maxHp / self.maxHp) * 50;
    
    // Placeholder for more sophisticated threat analysis
    const primaryThreats = opponent.moves.filter(m => m.baseDamage > 20).map(m => m.name);
    const vulnerabilities = self.archetype === "water" ? ["fire"] : [];

    const overallThreat = Math.min(100, immediateThreat + longTermThreat);

    return {
        immediate: immediateThreat,
        longTerm: longTermThreat,
        primaryThreats,
        vulnerabilities,
        overallThreat,
        analysis: {}
    };
}

/**
 * Calculates a situational aggression level based on context and threat.
 * @param {DecisionContext} context The decision context.
 * @param {ThreatAssessment} threat The threat assessment.
 * @returns {number} A situational aggression score (0-100).
 */
function calculateSituationalAggression(context, threat) {
    let aggression = 50;
    if (context.self.hp > context.opponent.hp) {
        aggression += 20; // More aggressive when ahead
    }
    if (threat.overallThreat > 70) {
        aggression -= 30; // Less aggressive against high threat
    }
    return Math.max(0, Math.min(100, aggression));
}

/**
 * Calculates the situational risk based on context and threat.
 * @param {DecisionContext} context The decision context.
 * @param {ThreatAssessment} threat The threat assessment.
 * @returns {number} A situational risk score (0-100).
 */
function calculateSituationalRisk(context, threat) {
    let risk = 50;
    if (context.self.hp < 30) {
        risk += 30; // High risk at low health
    }
    if (threat.overallThreat > 70) {
        risk += 20;
    }
    return Math.max(0, Math.min(100, risk));
}


// ============================================================================
// EXPORTS
// ============================================================================
export {
    assessThreatLevel,
    calculateSituationalAggression,
    calculateSituationalRisk
}; 