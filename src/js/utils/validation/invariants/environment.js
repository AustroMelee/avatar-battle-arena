/**
 * @fileoverview Environment state invariant checks.
 */

"use strict";

/**
 * @typedef {import('./types.js').InvariantViolation} InvariantViolation
 * @typedef {import('../../../types/battle.js').BattleState} BattleState
 */

/**
 * Validate environmental state invariants.
 *
 * @param {BattleState} battleState - The battle state to validate.
 * @returns {InvariantViolation[]} A list of violations.
 */
export function assertEnvironmentalInvariants(battleState) {
    /** @type {InvariantViolation[]} */
    const violations = [];

    if (battleState.environmentState) {
        const env = battleState.environmentState;

        // totalDamage is on the new EnvironmentState type
        if (typeof env.totalDamage !== "number" || env.totalDamage < 0) {
            violations.push({
                invariantName: "total_damage_non_negative",
                message: "Environmental total damage must be non-negative",
                actualValue: env.totalDamage,
                expectedValue: "totalDamage >= 0",
                severity: "error",
                timestamp: Date.now(),
            });
        }
        
        // impactDescriptions is on the new EnvironmentState type and is an array of strings
        if (!Array.isArray(env.impactDescriptions)) {
            violations.push({
                invariantName: "impact_descriptions_array",
                message: "Environmental impact descriptions should be an array",
                actualValue: typeof env.impactDescriptions,
                expectedValue: "Array",
                severity: "error",
                timestamp: Date.now(),
            });
        }
    }

    return violations;
} 