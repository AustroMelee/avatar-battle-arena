/**
 * @fileoverview General battle state invariant checks.
 */

"use strict";

/**
 * @typedef {import('./types.js').InvariantViolation} InvariantViolation
 * @typedef {import('../../../types/battle.js').BattleState} BattleState
 */

import { MIN_TURN, MAX_TURN, REQUIRED_BATTLE_STATE_PROPERTIES } from "./types.js";

/**
 * Validate general battle state invariants.
 *
 * @param {BattleState} battleState - The battle state to validate.
 * @returns {InvariantViolation[]} A list of violations.
 */
export function assertGeneralStateInvariants(battleState) {
    /** @type {InvariantViolation[]} */
    const violations = [];

    // Turn number should be non-negative
    if (typeof battleState.turn !== "number" || battleState.turn < MIN_TURN) {
        violations.push({
            invariantName: "turn_non_negative",
            message: "Turn number must be non-negative",
            actualValue: battleState.turn,
            expectedValue: `turn >= ${MIN_TURN}`,
            severity: "error",
            timestamp: Date.now(),
        });
    }

    // Turn number should be reasonable (not infinite)
    if (battleState.turn > MAX_TURN) {
        violations.push({
            invariantName: "turn_reasonable",
            message: "Turn number exceeds reasonable bounds",
            actualValue: battleState.turn,
            expectedValue: `turn <= ${MAX_TURN}`,
            severity: "warning",
            timestamp: Date.now(),
        });
    }

    // Battle should have required properties
    REQUIRED_BATTLE_STATE_PROPERTIES.forEach(prop => {
        if (!(prop in battleState)) {
            violations.push({
                invariantName: "required_property",
                message: `Battle state missing required property: ${prop}`,
                actualValue: prop in battleState,
                expectedValue: true,
                severity: "critical",
                timestamp: Date.now(),
            });
        }
    });

    return violations;
} 