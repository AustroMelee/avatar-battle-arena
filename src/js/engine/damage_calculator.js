"use strict";

/**
 * @fileoverview Damage calculation for moves.
 * @description This module is responsible for calculating the final damage of a
 *   move. It orchestrates a multi-step formula that includes base move power,
 *   attacker and defender stats, elemental matchups, random variance, and other
 *   situational modifiers.
 */

/**
 * @typedef {import('../types/battle.js').Fighter} Fighter
 * @typedef {import('../types/battle.js').Move} Move
 * @typedef {import('../types/battle.js').BattleState} BattleState
 * @typedef {import('../types/battle.js').EnvironmentState} EnvironmentState
 * @typedef {import('../types/engine.js').ResolutionContext} ResolutionContext
 * @typedef {import('../types/engine.js').DamageCalculation} DamageCalculation
 */

import { randomFloat, randomChance } from "../utils_random.js";
import {
    CRITICAL_HIT_MULTIPLIER,
    GLANCING_BLOW_MULTIPLIER,
    GLANCING_BLOW_CHANCE,
    MIN_DAMAGE_VARIANCE,
    MAX_DAMAGE_VARIANCE,
    MIN_BASE_DAMAGE,
    MAX_BASE_DAMAGE,
    MOVE_TYPE_MODIFIERS,
    ELEMENTAL_EFFECTIVENESS
} from "../constants_battle.js";

/**
 * Calculates the final damage of a move after applying a series of modifiers.
 *
 * The damage calculation follows these steps:
 * 1.  **Base Damage**: Start with the move's `baseDamage`.
 * 2.  **Attacker's Power**: Modify by the attacker's power. Note that this is
 *     derived from their total `damageDealt` stat, which simulates a "momentum"
 *     or "berserker" effect where successful fighters hit harder over time.
 * 3.  **Defender's Resilience**: Reduce damage based on the defender's
 *     resilience, which is counter-intuitively derived from their total
 *     `damageReceived`. This may represent fatigue or battle damage.
 * 4.  **Move Type Modifier**: Apply a modifier based on the move's category
 *     (e.g., 'fast', 'heavy').
 * 5.  **Elemental Effectiveness**: Apply a multiplier based on the elemental
 *     matchup (e.g., fire vs. water).
 * 6.  **Random Variance**: Add a random variance to make damage less predictable.
 * 7.  **Critical/Glancing Hits**: Check for random critical hits (more damage)
 *     or glancing blows (less damage).
 * 8.  **Final Modifiers**: Apply situational modifiers from the attacker's
 *     momentum score and environmental factors.
 * 9.  **Clamping**: The final damage is clamped within a global min/max range.
 *
 * @param {Move} move The move being used.
 * @param {Fighter} attacker The fighter performing the move.
 * @param {Fighter} defender The fighter receiving the move.
 * @param {BattleState} battleState The current state of the battle.
 * @param {ResolutionContext} context Additional context for the resolution.
 * @returns {DamageCalculation} A detailed object breaking down the damage calculation.
 */
export function calculateMoveDamage(move, attacker, defender, battleState, context) {
    let baseDamage = move.baseDamage || 0;

    // The attacker's power is derived from the total damage they've already
    // dealt in the battle, creating a positive feedback loop.
    const attackPower = attacker.stats?.damageDealt || 100;
    const attackMultiplier = attackPower / 100;
    baseDamage *= attackMultiplier;

    // The defender's resilience is calculated based on total damage received.
    // This formula means the more damage a fighter has taken, the less they
    // can mitigate from subsequent hits.
    const defense = defender.stats?.damageReceived || 100;
    const defenseMultiplier = 100 / (100 + defense);
    baseDamage *= defenseMultiplier;

    const moveTypeModifier = MOVE_TYPE_MODIFIERS[move.type] || 1.0;
    baseDamage *= moveTypeModifier;

    // The defender's element is determined by their 'archetype'. This assumes
    // a one-to-one mapping between a character's archetype and their elemental type.
    const elementalModifier = calculateElementalEffectiveness(move.element, defender.archetype);
    baseDamage *= elementalModifier;

    // A random variance is applied to prevent battles from being too deterministic.
    const variance = randomFloat(MIN_DAMAGE_VARIANCE, MAX_DAMAGE_VARIANCE);
    baseDamage *= (1 + variance);

    // There's a small base chance for a critical hit, which can be modified by the move itself.
    const criticalChance = move.criticalChance || 0.05;
    const isCritical = randomChance(criticalChance);
    if (isCritical) {
        baseDamage *= CRITICAL_HIT_MULTIPLIER;
    }

    // If the attack wasn't critical, there's a chance for a glancing blow, reducing damage.
    const isGlancing = !isCritical && randomChance(GLANCING_BLOW_CHANCE);
    if (isGlancing) {
        baseDamage *= GLANCING_BLOW_MULTIPLIER;
    }

    baseDamage = applyFinalDamageModifiers(baseDamage, move, attacker, defender, battleState, context);

    const finalDamage = Math.max(MIN_BASE_DAMAGE, Math.min(MAX_BASE_DAMAGE, Math.round(baseDamage)));

    return {
        baseDamage: move.baseDamage || 0,
        attackMultiplier,
        defenseMultiplier,
        moveTypeModifier,
        elementalModifier,
        variance,
        finalDamage,
        isCritical,
        isGlancing,
        modifiers: {
            attack: attackPower,
            defense,
            element: elementalModifier,
            type: moveTypeModifier,
        },
    };
}

/**
 * Calculates the damage multiplier based on the elemental matchup between an
 * attack and a defender. It retrieves the multiplier from a predefined
 * effectiveness matrix.
 *
 * @param {string} attackElement The element of the incoming move.
 * @param {string} defenderElement The element (archetype) of the defender.
 * @returns {number} The elemental effectiveness multiplier (e.g., 1.5 for
 *   super-effective, 0.5 for not very effective).
 */
function calculateElementalEffectiveness(attackElement, defenderElement) {
    if (!attackElement || !defenderElement) {
        return 1.0;
    }
    return ELEMENTAL_EFFECTIVENESS[attackElement]?.[defenderElement] || 1.0;
}

/**
 * Applies final, situational damage modifiers from sources like the fighter's
 * momentum score or environmental conditions.
 *
 * @param {number} damage The current damage value after initial calculations.
 * @param {Move} move The move being used.
 * @param {Fighter} attacker The attacker.
 * @param {Fighter} defender The defender.
 * @param {BattleState} battleState The current battle state.
 * @param {ResolutionContext} context Additional resolution context.
 * @returns {number} The damage after applying all final modifiers.
 */
function applyFinalDamageModifiers(damage, move, attacker, defender, battleState, context) {
    let modifiedDamage = damage;

    // Positive momentum provides a percentage-based damage boost.
    if (attacker.momentum) {
        const momentumBonus = Math.max(0, attacker.momentum) * 0.01;
        modifiedDamage *= (1 + momentumBonus);
    }

    if (battleState.environmentState) {
        const envModifier = calculateEnvironmentalDamageModifier(move, battleState.environmentState);
        modifiedDamage *= envModifier;
    }

    if (context.phase) {
        // A hardcoded damage boost during the 'climax' phase of the battle.
        if (context.phase === "climax") modifiedDamage *= 1.2;
    }

    return modifiedDamage;
}

/**
 * Calculates a damage modifier based on the current environment. For example,
 * a fire move might be stronger in the Fire Nation Capital.
 *
 * @param {Move} move The move being used.
 * @param {EnvironmentState} environment The current environmental state.
 * @returns {number} The environmental damage modifier.
 */
function calculateEnvironmentalDamageModifier(move, environment) {
    let modifier = 1.0;
    // A location-specific buff. This logic could be expanded to support more
    // complex environmental interactions.
    if (environment.locationId === "fire-nation-capital" && move.element === "fire") {
        modifier += 0.15;
    }
    return modifier;
}

