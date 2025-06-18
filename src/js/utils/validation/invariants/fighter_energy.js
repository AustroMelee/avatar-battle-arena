/**
 * @fileoverview Fighter energy state invariant checks.
 */

"use strict";

/**
 * @typedef {import('./types.js').InvariantViolation} InvariantViolation
 * @typedef {import('../../../types/battle.js').BattleState} BattleState
 */

import { MIN_ENERGY, MAX_ENERGY } from "./types.js";

/**
 * Validate fighter energy and energy-related invariants.
 *
 * @param {BattleState} battleState - The battle state to validate.
 * @returns {InvariantViolation[]} A list of energy-related violations.
 */
export function assertEnergyInvariants(battleState) {
    /** @type {InvariantViolation[]} */
    const violations = [];

    if (!battleState.fighters) {
        // This case is handled by health invariants, but as a safeguard:
        return violations;
    }

    const fighters = Object.values(battleState.fighters);

    fighters.forEach((fighter) => {
        if (!fighter) return;

        const fighterName = fighter.name;

        // Energy bounds checking
        if (typeof fighter.energy !== "number" || fighter.energy < MIN_ENERGY || fighter.energy > MAX_ENERGY) {
            violations.push({
                invariantName: "energy_bounds",
                message: `${fighterName} energy must be between ${MIN_ENERGY} and ${MAX_ENERGY}`,
                actualValue: fighter.energy,
                expectedValue: `${MIN_ENERGY} <= energy <= ${MAX_ENERGY}`,
                severity: "critical",
                timestamp: Date.now(),
            });
        }

        // Max energy consistency
        if (typeof fighter.maxEnergy !== "number" || fighter.maxEnergy <= 0 || fighter.maxEnergy > MAX_ENERGY) {
            violations.push({
                invariantName: "max_energy_valid",
                message: `${fighterName} maxEnergy must be a positive number <= ${MAX_ENERGY}`,
                actualValue: fighter.maxEnergy,
                expectedValue: `0 < maxEnergy <= ${MAX_ENERGY}`,
                severity: "error",
                timestamp: Date.now(),
            });
        }

        // Energy should not exceed maxEnergy
        if (typeof fighter.energy === "number" && typeof fighter.maxEnergy === "number" && fighter.energy > fighter.maxEnergy) {
            violations.push({
                invariantName: "energy_not_exceed_max",
                message: `${fighterName} energy cannot exceed maxEnergy`,
                actualValue: { energy: fighter.energy, maxEnergy: fighter.maxEnergy },
                expectedValue: "energy <= maxEnergy",
                severity: "critical",
                timestamp: Date.now(),
            });
        }
    });

    return violations;
} 