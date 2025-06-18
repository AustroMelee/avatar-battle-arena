/**
 * @fileoverview Fighter health state invariant checks.
 */

"use strict";

/**
 * @typedef {import('./types.js').InvariantViolation} InvariantViolation
 * @typedef {import('../../../types/battle.js').BattleState} BattleState
 * @typedef {import('../../../types/battle.js').Fighter} Fighter
 */

import { MIN_HP, MAX_HP } from "./types.js";

/**
 * Validate fighter health and HP-related invariants.
 *
 * @param {any} battleState - The battle state to validate.
 * @returns {InvariantViolation[]} A list of health-related violations.
 */
export function assertFighterHealthInvariants(battleState) {
    /** @type {BattleState} */
    const state = /** @type {BattleState} */ (battleState);

    /** @type {InvariantViolation[]} */
    const violations = [];

    if (!state.fighters) {
        violations.push({
            invariantName: "fighters_property_exists",
            message: "battleState.fighters property must exist",
            actualValue: state.fighters,
            expectedValue: "An object of fighters",
            severity: "critical",
            timestamp: Date.now(),
        });
        return violations;
    }

    const fighters = Object.values(state.fighters);

    if (fighters.length !== 2) {
        violations.push({
            invariantName: "fighters_count",
            message: "There must be exactly two fighters.",
            actualValue: fighters.length,
            expectedValue: 2,
            severity: "critical",
            timestamp: Date.now(),
        });
        return violations;
    }


    fighters.forEach((fighter) => {
        if (!fighter) {
            violations.push({
                invariantName: "fighter_is_not_null",
                message: "Fighter object should not be null or undefined.",
                actualValue: fighter,
                expectedValue: "Fighter object",
                severity: "critical",
                timestamp: Date.now(),
            });
            return;
        }

        const fighterName = fighter.name;

        // HP bounds checking
        if (typeof fighter.hp !== "number" || fighter.hp < MIN_HP || fighter.hp > MAX_HP) {
            violations.push({
                invariantName: "hp_bounds",
                message: `${fighterName} HP must be between ${MIN_HP} and ${MAX_HP}`,
                actualValue: fighter.hp,
                expectedValue: `${MIN_HP} <= hp <= ${MAX_HP}`,
                severity: "critical",
                timestamp: Date.now(),
            });
        }

        // Max HP consistency
        if (typeof fighter.maxHp !== "number" || fighter.maxHp <= 0 || fighter.maxHp > MAX_HP) {
            violations.push({
                invariantName: "max_hp_valid",
                message: `${fighterName} maxHp must be a positive number <= ${MAX_HP}`,
                actualValue: fighter.maxHp,
                expectedValue: `0 < maxHp <= ${MAX_HP}`,
                severity: "error",
                timestamp: Date.now(),
            });
        }

        // HP should not exceed maxHp
        if (typeof fighter.hp === "number" && typeof fighter.maxHp === "number" && fighter.hp > fighter.maxHp) {
            violations.push({
                invariantName: "hp_not_exceed_max",
                message: `${fighterName} HP cannot exceed maxHp`,
                actualValue: { hp: fighter.hp, maxHp: fighter.maxHp },
                expectedValue: "hp <= maxHp",
                severity: "critical",
                timestamp: Date.now(),
            });
        }
    });

    return violations;
} 