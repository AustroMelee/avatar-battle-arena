/**
 * @fileoverview Analyzes the decision context for the AI.
 */

"use strict";

import { determineStrategicIntent } from "../ai_strategy_intent.js";
import { getDynamicPersonality } from "../ai_personality.js";
import { assessThreatLevel, calculateSituationalAggression, calculateSituationalRisk } from "../analysis/threat_assessment.js";
import { calculateDecisionWeights, determinePrimaryGoal } from "../goals/goal_setting.js";

/**
 * @typedef {import('../../types/ai.js').DecisionContext} DecisionContext
 * @typedef {import('../../types/ai.js').AiAnalysis} AiAnalysis
 * @typedef {import('../../types/ai.js').AiPersonality} AiPersonality
 * @typedef {import('../analysis/threat_assessment.js').ThreatAssessment} ThreatAssessment
 */

/**
 * Analyzes the decision context to determine a strategic approach.
 * @param {DecisionContext} context - The decision context.
 * @returns {Promise<AiAnalysis>} The strategic analysis.
 */
export async function analyzeDecisionContext(context) {
    const threatAssessment = assessThreatLevel(context);
    const strategicIntent = await determineStrategicIntent(context.self, context.opponent, context.turnNumber, context.phase);
    const personality = getDynamicPersonality(context.self, context.phase);
    
    const baseAggression = personality.aggression || 0.5;
    const situationalAggression = calculateSituationalAggression(context, threatAssessment);
    const aggressionLevel = Math.max(0, Math.min(1, baseAggression + situationalAggression));

    const baseRisk = personality.caution ? 1 - personality.caution : 0.5;
    const situationalRisk = calculateSituationalRisk(context, threatAssessment);
    const riskTolerance = Math.max(0, Math.min(1, baseRisk + situationalRisk));

    const consideredFactors = [
        "health_differential",
        "move_availability",
        "environmental_factors",
        "momentum_state",
        "escalation_level",
    ];

    const weights = calculateDecisionWeights(context, personality);
    const primaryGoal = determinePrimaryGoal(context, threatAssessment, aggressionLevel);

    /** @type {AiAnalysis} */
    const analysis = {
        strategicIntent,
        aggressionLevel,
        riskTolerance,
        consideredFactors,
        weights,
        primaryGoal,
    };

    return analysis;
} 