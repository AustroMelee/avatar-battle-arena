/**
 * @fileoverview Utility functions for battle phase management.
 */

"use strict";

import { BATTLE_PHASES } from "./constants.js";
import { PHASE_TRANSITION_THRESHOLDS } from "../../config_phase_transitions.js";

/**
 * @typedef {import('../../types/engine.js').PhaseState} PhaseState
 * @typedef {import('../../types/engine.js').PhaseAIModifiers} PhaseAIModifiers
 */

/**
 * Gets AI behavior modifiers for the current battle phase.
 * @param {string} currentPhase - Current battle phase.
 * @returns {PhaseAIModifiers} AI behavior modifiers for the phase.
 */
export function getPhaseAIModifiers(currentPhase) {
    if (typeof currentPhase !== "string") {
        throw new TypeError("getPhaseAIModifiers: currentPhase must be a string");
    }

    switch (currentPhase) {
        case BATTLE_PHASES["PRE_BANTER"]:
            return { aggressionMultiplier: 0.001, patienceMultiplier: 5.0, riskToleranceMultiplier: 0.001, defensiveBiasMultiplier: 5.0, creativityMultiplier: 0.1, opportunismMultiplier: 0.001 };
        case BATTLE_PHASES["POKING"]:
            return { aggressionMultiplier: 0.2, patienceMultiplier: 2.0, riskToleranceMultiplier: 0.3, defensiveBiasMultiplier: 2.0, creativityMultiplier: 1.5, opportunismMultiplier: 0.5 };
        case BATTLE_PHASES["EARLY"]:
            return { aggressionMultiplier: 0.9, patienceMultiplier: 1.1, riskToleranceMultiplier: 0.8, defensiveBiasMultiplier: 1.0, creativityMultiplier: 1.0, opportunismMultiplier: 1.0 };
        case BATTLE_PHASES["MID"]:
            return { aggressionMultiplier: 1.2, patienceMultiplier: 0.9, riskToleranceMultiplier: 1.1, defensiveBiasMultiplier: 0.9, creativityMultiplier: 1.1, opportunismMultiplier: 1.2 };
        case BATTLE_PHASES["LATE"]:
            return { aggressionMultiplier: 1.5, patienceMultiplier: 0.5, riskToleranceMultiplier: 1.5, defensiveBiasMultiplier: 0.6, creativityMultiplier: 1.0, opportunismMultiplier: 1.5 };
        default:
            console.warn(`[Phase Manager] Unknown phase for AI modifiers: ${currentPhase}`);
            return { aggressionMultiplier: 1.0, patienceMultiplier: 1.0, riskToleranceMultiplier: 1.0, defensiveBiasMultiplier: 1.0, creativityMultiplier: 1.0, opportunismMultiplier: 1.0 };
    }
}

/**
 * Validates the phase state object.
 * @param {PhaseState} phaseState - The phase state to validate.
 * @returns {void}
 * @throws {Error} If the phase state is invalid.
 */
export function validatePhaseState(phaseState) {
    /** @type {PhaseState} */
    const state = phaseState;
    if (!state || typeof state !== "object") {
        throw new Error("Invalid phase state object.");
    }
    if (typeof state.currentPhase !== "string" || !Object.values(BATTLE_PHASES).includes(state.currentPhase)) {
        throw new Error(`Invalid current phase: ${state.currentPhase}`);
    }
    if (typeof state.turnInCurrentPhase !== "number" || state.turnInCurrentPhase < 0) {
        throw new Error("Invalid turnInCurrentPhase.");
    }
}

/**
 * Gets the transition requirements between two phases.
 * @param {string} fromPhase - The starting phase.
 * @param {string} toPhase - The target phase.
 * @returns {object | null} The transition requirements, or null if not defined.
 */
export function getPhaseTransitionRequirements(fromPhase, toPhase) {
    const key = `${fromPhase.toUpperCase()}_TO_${toPhase.toUpperCase()}`;
    return PHASE_TRANSITION_THRESHOLDS[key] || null;
} 