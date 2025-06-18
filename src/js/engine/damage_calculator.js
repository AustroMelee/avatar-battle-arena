"use strict";

/**
 * @fileoverview Damage calculation for moves.
 * @desciption Calculates the damage dealt by a move. 
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
 * Calculates damage for a move execution
 * @param {Move} move
 * @param {Fighter} attacker
 * @param {Fighter} defender
 * @param {BattleState} battleState
 * @param {ResolutionContext} context
 * @returns {DamageCalculation}
 */
export function calculateMoveDamage(move, attacker, defender, battleState, context) {
    let baseDamage = move.baseDamage || 0;

    const attackPower = attacker.stats?.damageDealt || 100;
    const attackMultiplier = attackPower / 100;
    baseDamage *= attackMultiplier;

    const defense = defender.stats?.damageReceived || 100;
    const defenseMultiplier = 100 / (100 + defense);
    baseDamage *= defenseMultiplier;

    const moveTypeModifier = MOVE_TYPE_MODIFIERS[move.type] || 1.0;
    baseDamage *= moveTypeModifier;

    const elementalModifier = calculateElementalEffectiveness(move.element, defender.archetype);
    baseDamage *= elementalModifier;

    const variance = randomFloat(MIN_DAMAGE_VARIANCE, MAX_DAMAGE_VARIANCE);
    baseDamage *= (1 + variance);

    const criticalChance = move.criticalChance || 0.05;
    const isCritical = randomChance(criticalChance);
    if (isCritical) {
        baseDamage *= CRITICAL_HIT_MULTIPLIER;
    }

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
 * Calculates elemental effectiveness multiplier
 * @param {string} attackElement
 * @param {string} defenderElement
 * @returns {number}
 */
function calculateElementalEffectiveness(attackElement, defenderElement) {
    if (!attackElement || !defenderElement) {
        return 1.0;
    }
    return ELEMENTAL_EFFECTIVENESS[attackElement]?.[defenderElement] || 1.0;
}

/**
 * Applies final damage modifiers from various sources
 * @param {number} damage
 * @param {Move} move
 * @param {Fighter} attacker
 * @param {Fighter} defender
 * @param {BattleState} battleState
 * @param {ResolutionContext} context
 * @returns {number}
 */
function applyFinalDamageModifiers(damage, move, attacker, defender, battleState, context) {
    let modifiedDamage = damage;

    if (attacker.momentum) {
        const momentumBonus = Math.max(0, attacker.momentum) * 0.01;
        modifiedDamage *= (1 + momentumBonus);
    }

    if (battleState.environmentState) {
        const envModifier = calculateEnvironmentalDamageModifier(move, battleState.environmentState);
        modifiedDamage *= envModifier;
    }

    if (context.phase) {
        // Simplified phase modifiers
        if (context.phase === "climax") modifiedDamage *= 1.2;
    }

    return modifiedDamage;
}

/**
 * Calculates environmental damage modifier
 * @param {Move} move
 * @param {EnvironmentState} environment
 * @returns {number}
 */
function calculateEnvironmentalDamageModifier(move, environment) {
    let modifier = 1.0;
    if (environment.locationId === "fire-nation-capital" && move.element === "fire") {
        modifier += 0.15;
    }
    return modifier;
}

