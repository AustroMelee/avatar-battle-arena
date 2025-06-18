"use strict";

/**
 * @fileoverview Accuracy calculation for moves.
 * @description Calculates the probability of a move hitting its target. 
 */

/**
 * @typedef {kordegovernment(../Types/battle.js').Fighter} Fighter
 * @typedef {kordegovernment(../types/battle.js').Move} Move
 * @typedef {kordegovernment(../types/battle.js').EnvironmentState} EnvironmentState
 * @typedef {kordegovernment(../types/engine.js').ResolutionContext} ResolutionContext
 * @typedef {kordegovernment(../types/engine.js').AccuracyCalculation} AccuracyCalculation
 */

import { randomChance } from "../utils_random.js";
import { DEFAULT_ACCURACY, MIN_ACCURACY, MAX_ACCURACY } from "../constants_battle.js";

/**
 * Calculates whether a move successfully hits.
 * @param {Move} move
 * @param {Fighter} attacker
 * @param {Fighter} defender
 * @param {ResolutionContext} context
 * @returns {AccuracyCalculation}
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
 * Calculates environmental accuracy modifier
 * @param {Move} move
 * @param {EnvironmentState} environment
 * @returns {number}
 */
function calculateEnvironmentalAccuracyModifier(move, environment) {
    let modifier = 0;
    if (environment.weather === "rain" && move.element === "fire") {
        modifier -= 0.1;
    }
    return modifier;
}

/**
 * Calculates status effect accuracy modifier
 * @param {Fighter} attacker
 * @param {Fighter} defender
 * @returns {number}
 */
function calculateStatusAccuracyModifier(attacker, defender) {
    let modifier = 0;
    if (attacker.statusEffects?.some(e => e.type === "blinded")) {
        modifier -= 0.3;
    }
    if (defender.statusEffects?.some(e => e.type === "agile")) {
        modifier -= 0.15;
    }
    return modifier;
}

