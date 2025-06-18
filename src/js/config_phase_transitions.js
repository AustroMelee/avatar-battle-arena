/**
 * @fileoverview Phase Transition Configuration
 * @description Centralized configuration for battle phase transition thresholds and rules
 * @version 1.0
 */

'use strict';

/**
 * Configuration for phase transition thresholds
 * These values determine when the battle transitions between phases
 */
export const PHASE_TRANSITION_THRESHOLDS = {
    // POKING -> EARLY phase transition
    POKING_TO_EARLY: {
        // Duration is determined randomly between min and max
        MIN_DURATION: 1,
        MAX_DURATION: 3
    },
    
    // EARLY -> MID phase transition
    EARLY_TO_MID: {
        HP_THRESHOLD: 60,              // HP below this triggers transition
        MOMENTUM_THRESHOLD: 5,         // Absolute momentum above this triggers transition
        DAMAGE_DELTA_THRESHOLD: 30,    // Damage taken in phase above this triggers transition
        MOMENTUM_DELTA_THRESHOLD: 5,   // Momentum gained in phase above this triggers transition
        HP_DIFFERENCE_THRESHOLD: 30,   // HP difference between fighters above this triggers transition
        MOMENTUM_DIFFERENCE_THRESHOLD: 8, // Momentum difference between fighters above this triggers transition
        MIN_TURNS: 2,                  // Minimum turns before forced transition
        MAX_TURNS: 5,                  // Maximum turns before forced transition
        REQUIRED_TRIGGERS: 1           // Number of trigger conditions that must be met
    },
    
    // MID -> LATE phase transition
    MID_TO_LATE: {
        HP_THRESHOLD: 40,              // HP below this triggers transition
        MOMENTUM_THRESHOLD: 4,         // Absolute momentum above this triggers transition
        DAMAGE_DELTA_THRESHOLD: 25,    // Damage taken in phase above this triggers transition
        MOMENTUM_DELTA_THRESHOLD: 4,   // Momentum gained in phase above this triggers transition
        HP_DIFFERENCE_THRESHOLD: 20,   // HP difference between fighters above this triggers transition
        MOMENTUM_DIFFERENCE_THRESHOLD: 6, // Momentum difference between fighters above this triggers transition
        MIN_TURNS: 2,                  // Minimum turns before forced transition
        MAX_TURNS: 7,                  // Maximum turns before forced transition
        REQUIRED_TRIGGERS: 1           // Number of trigger conditions that must be met
    }
};

/**
 * Mental state conditions that can trigger phase transitions
 */
export const MENTAL_STATE_TRIGGERS = {
    EARLY_TO_MID: ['stressed'],
    MID_TO_LATE: ['shaken', 'broken']
};

/**
 * Move-based triggers for phase transitions
 */
export const MOVE_TRIGGERS = {
    FINISHER_POWER_THRESHOLD: 70,     // Power level above which moves are considered finisher-level
    MIN_FINISHER_COUNT_FOR_LATE: 1    // Number of finisher moves to trigger late phase
};

/**
 * Stalemate detection configuration
 */
export const STALEMATE_CONFIG = {
    MIN_TURN_FOR_DETECTION: 2,        // Minimum turn before stalemate can be detected
    CONSECUTIVE_DEFENSIVE_TURNS: 3,    // Consecutive defensive turns by both fighters
    HP_DIFFERENCE_THRESHOLD: 15,      // Max HP difference for stalemate consideration
    EXCLUDED_PHASES: ['EARLY']        // Phases where stalemate cannot occur
};

/**
 * Phase-specific AI behavior modifiers
 */
export const PHASE_AI_MODIFIERS = {
    PRE_BANTER: {
        narrativeOnly: true,
        allowActions: false
    },
    POKING: {
        conservativeMultiplier: 1.5,
        finisherPenalty: 0.5,
        utilityBonus: 1.3
    },
    EARLY: {
        balancedApproach: true,
        riskTolerance: 0.8
    },
    MID: {
        aggressionBonus: 1.2,
        finisherBonus: 1.1
    },
    LATE: {
        aggressionBonus: 1.5,
        finisherBonus: 1.8,
        desperationThreshold: 0.3
    }
};

/**
 * Helper function to get phase transition configuration
 * @param {string} fromPhase - Source phase
 * @param {string} toPhase - Target phase
 * @returns {object|null} Configuration object or null if not found
 */
export function getPhaseTransitionConfig(fromPhase, toPhase) {
    const transitionKey = `${fromPhase}_TO_${toPhase}`;
    return PHASE_TRANSITION_THRESHOLDS[transitionKey] || null;
}

/**
 * Helper function to check if a mental state should trigger a phase transition
 * @param {string} mentalState - The mental state to check
 * @param {string} targetPhase - The phase we're trying to transition to
 * @returns {boolean} True if the mental state triggers the transition
 */
export function shouldMentalStateTriggerTransition(mentalState, targetPhase) {
    const triggers = MENTAL_STATE_TRIGGERS[targetPhase];
    return triggers ? triggers.includes(mentalState) : false;
}

/**
 * Helper function to get AI modifiers for a specific phase
 * @param {string} phase - The battle phase
 * @returns {object} AI modifier configuration
 */
export function getPhaseAIModifiers(phase) {
    return PHASE_AI_MODIFIERS[phase] || {};
} 