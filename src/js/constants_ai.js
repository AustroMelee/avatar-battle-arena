/**
 * @fileoverview AI Decision Making Constants
 * @description Constants for AI behavior, probabilities, and decision weights
 * @version 1.0
 */

"use strict";

/**
 * AI Decision Making Constants
 */
export const AI_CONFIG = {
    // Base probabilities
    MANIPULATION_BASE_CHANCE: 0.4,
    CRITICAL_HIT_BASE_CHANCE: 0.15,
    CURBSTOMP_BASE_CHANCE: 0.05,
    
    // AI memory and learning
    MEMORY_RETENTION_TURNS: 3,
    OPPONENT_PATTERN_THRESHOLD: 2,
    MOVE_SUCCESS_COOLDOWN_TURNS: 2,
    REPOSITION_COOLDOWN_TURNS: 3,
    
    // Personality modifiers
    AGGRESSION_BASE_MULTIPLIER: 1.0,
    PATIENCE_BASE_MULTIPLIER: 1.0,
    RISK_TOLERANCE_BASE_MULTIPLIER: 1.0,
    DEFENSIVE_BIAS_BASE_MULTIPLIER: 1.0,
    CREATIVITY_BASE_MULTIPLIER: 1.0,
    OPPORTUNISM_BASE_MULTIPLIER: 1.0,
    
    // Scoring weights
    MOVE_EFFECTIVENESS_WEIGHT: 0.4,
    ENERGY_EFFICIENCY_WEIGHT: 0.2,
    TACTICAL_ADVANTAGE_WEIGHT: 0.25,
    RISK_ASSESSMENT_WEIGHT: 0.15
}; 