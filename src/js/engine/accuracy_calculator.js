"use strict";

/**
 * @fileoverview Accuracy calculation for moves.
 * @description This module determines the probability of a move hitting its
 *   target. It combines the move's base accuracy with modifiers from the
 *   attacker, defender, status effects, and the environment.
 */

/**
 * @typedef {import('../types/battle.js').Fighter} Fighter
 * @typedef {import('../types/battle.js').Move} Move
 * @typedef {import('../types/battle.js').EnvironmentState} EnvironmentState
 * @typedef {import('../types/engine.js').ResolutionContext} ResolutionContext
 * @typedef {import('../types/engine.js').AccuracyCalculation} AccuracyCalculation
 */

import { randomChance } from "../utils_random.js";
import { DEFAULT_ACCURACY, MIN_ACCURACY, MAX_ACCURACY } from "../constants_battle.js";

/**
 * Calculates whether a move successfully hits its target.
 *
 * The accuracy calculation follows these steps:
 * 1.  **Base Accuracy**: Start with the move's own `accuracy` value or a global
 *     default if not specified.
 * 2.  **Attacker Bonuses**: Add any temporary accuracy modifiers from the attacker.
 * 3.  **Defender Penalties**: Subtract the defender's evasion modifiers.
 * 4.  **Environmental Modifiers**: Apply modifiers from weather effects (e.g.,
 *     rain reducing the accuracy of fire moves).
 * 5.  **Status Effects**: Apply modifiers from relevant status effects on both
 *     the attacker (e.g., 'blinded') and the defender (e.g., 'agile').
 * 6.  **Clamping**: The final accuracy value is clamped to stay within a
 *     defined min/max range, preventing 100% or 0% hit rates.
 * 7.  **Random Chance**: A random roll is performed against the final calculated
 *     accuracy to determine if the move hits.
 *
 * @param {Move} move The move being used.
 * @param {Fighter} attacker The fighter performing the move.
 * @param {Fighter} defender The target of the move.
 * @param {ResolutionContext} context Additional context for the resolution.
 * @returns {AccuracyCalculation} A detailed object breaking down the accuracy calculation.
 */
export function calculateHitSuccess(move, attacker, defender, context) {
    let accuracy = move.accuracy || DEFAULT_ACCURACY;

    const attackerAccuracyBonus = (attacker.modifiers?.accuracyModifier || 0);
    accuracy += attackerAccuracyBonus;

    const defenderEvasion = (defender.modifiers?.evasionModifier || 0);
    accuracy -= defenderEvasion;

    const environmentalAccuracy = context.environment ? calculateEnvironmentalAccuracyModifier(move, context.environment) : 0;
    accuracy += environmentalAccuracy;

    const statusModifier = calculateStatusAccuracyModifier(attacker, defender);
    accuracy += statusModifier;

    accuracy = Math.max(MIN_ACCURACY, Math.min(MAX_ACCURACY, accuracy));

    const hitSuccess = randomChance(accuracy);

    return {
        baseAccuracy: move.accuracy || DEFAULT_ACCURACY,
        attackerBonus: attackerAccuracyBonus,
        defenderPenalty: defenderEvasion,
        environmentalModifier: environmentalAccuracy,
        statusModifier,
        finalAccuracy: accuracy,
        hitSuccess
    };
}

/**
 * Calculates an accuracy modifier based on environmental conditions. For example,
 * rain might make fire-based moves less accurate.
 *
 * @param {Move} move The move being used.
 * @param {EnvironmentState} environment The current environmental state.
 * @returns {number} The accuracy modifier determined by the environment.
 */
function calculateEnvironmentalAccuracyModifier(move, environment) {
    let modifier = 0;
    // This logic creates a specific interaction where fire moves are less
    // effective in the rain. It assumes the `weather` property exists on the
    // environment object, which may be set dynamically.
    if (environment.weather === "rain" && move.element === "fire") {
        modifier -= 0.1;
    }
    return modifier;
}

/**
 * Calculates an accuracy modifier based on the status effects active on the
 * attacker and defender.
 *
 * @param {Fighter} attacker The fighter performing the move.
 * @param {Fighter} defender The target of the move.
 * @returns {number} The combined accuracy modifier from all relevant status effects.
 */
function calculateStatusAccuracyModifier(attacker, defender) {
    let modifier = 0;
    // A 'blinded' attacker has significantly reduced accuracy.
    if (attacker.statusEffects?.some(e => e.type === "blinded")) {
        modifier -= 0.3;
    }
    // An 'agile' defender is harder to hit.
    if (defender.statusEffects?.some(e => e.type === "agile")) {
        modifier -= 0.15;
    }
    return modifier;
}

