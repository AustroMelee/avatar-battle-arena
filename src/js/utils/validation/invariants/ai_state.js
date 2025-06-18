/**
 * @fileoverview AI state invariant checks.
 */

"use strict";

/**
 * @typedef {import('./types.js').InvariantViolation} InvariantViolation
 * @typedef {import('../../../types/battle.js').BattleState} BattleState
 */

/**
 * Validate AI-related state invariants on fighters.
 *
 * @param {BattleState} battleState - The battle state to validate.
 * @returns {InvariantViolation[]} A list of violations.
 */
export function assertAiStateInvariants(battleState) {
    /** @type {InvariantViolation[]} */
    const violations = [];

    if (!battleState.fighters) {
        return violations;
    }

    const fighters = Object.values(battleState.fighters);

    fighters.forEach((fighter) => {
        if (!fighter) return;

        const fighterName = fighter.name;

        // The old implementation checked for aiLog and moveHistory.
        // These are not on the new Fighter type. I will check stunDuration.
        
        // Stun duration should be non-negative
        if (fighter.stunDuration && (typeof fighter.stunDuration !== "number" || fighter.stunDuration < 0)) {
            violations.push({
                invariantName: "stun_duration_non_negative",
                message: `${fighterName} stunDuration must be a non-negative number`,
                actualValue: fighter.stunDuration,
                expectedValue: "stunDuration >= 0",
                severity: "error",
                timestamp: Date.now(),
            });
        }
    });

    return violations;
} 