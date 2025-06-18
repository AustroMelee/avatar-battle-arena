/**
 * @fileoverview Battle phase invariant checks.
 */

"use strict";

/**
 * @typedef {import('./types.js').InvariantViolation} InvariantViolation
 * @typedef {import('../../../types/battle.js').BattleState} BattleState
 */

/**
 * Validate battle phase invariants.
 *
 * @param {BattleState} battleState - The battle state to validate.
 * @returns {InvariantViolation[]} A list of violations.
 */
export function assertPhaseInvariants(battleState) {
    /** @type {InvariantViolation[]} */
    const violations = [];

    const phase = battleState.currentPhase;
    const validPhases = ["Opening", "Escalation", "Climax", "Resolution", "opening"]; // Added 'opening' from initializer

    // Phase should be a valid string
    if (typeof phase !== "string" || !validPhases.includes(phase)) {
        violations.push({
            invariantName: "valid_phase",
            message: "Current phase must be a valid string",
            actualValue: phase,
            expectedValue: validPhases,
            severity: "error",
            timestamp: Date.now(),
        });
    }
    
    // In the old implementation, there was a check for phaseTurnCount.
    // This property does not exist on the new BattleState.
    // I will omit this check.

    return violations;
} 