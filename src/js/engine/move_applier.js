"use strict";

/**
 * @fileoverview Move effect application and result generation.
 * @description Handles applying the effects of a move and creating standardized result objects.
 */

/**
 * @typedef {import('../types/battle.js').Fighter} Fighter
 * @typedef {import('../types/battle.js').Move} Move
 * @typedef {import('../types/battle.js').BattleState} BattleState
 * @typedef {import('../types/engine.js').ResolutionContext} ResolutionContext
 * @typedef {import('../types/engine.js').DamageCalculation} DamageCalculation
 * @typedef {import('../types/engine.js').MoveResult} MoveResult
 * @typedef {import('../types/engine.js').AccuracyCalculation} AccuracyCalculation
 */

import { generateLogEvent } from "../utils_log_event.js";

/**
 * Clamps a number between a minimum and maximum value.
 * @param {number} value The number to clamp.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @returns {number} The clamped number.
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

/**
 * Applies the effects of a move to the battle state.
 * @param {Move} move
 * @param {Fighter} attacker
 * @param {Fighter} defender
 * @param {DamageCalculation} damageResult
 * @param {BattleState} battleState
 * @param {ResolutionContext} context
 * @returns {Promise<MoveResult>}
 */
export async function applyMoveEffects(move, attacker, defender, damageResult, battleState, context) {
    // Apply damage
    defender.hp = clamp(defender.hp - damageResult.finalDamage, 0, 100);
    attacker.energy = clamp(attacker.energy - (move.energyCost || 0), 0, 100);

    // Apply status effects
    if (move.effects) {
        for (const effect of move.effects) {
            // Placeholder for effect application logic
        }
    }

    const event = generateLogEvent({
        type: "MOVE_EXECUTION",
        payload: {
            attackerId: attacker.id,
            defenderId: defender.id,
            moveId: move.id,
            damage: damageResult.finalDamage,
            isCritical: damageResult.isCritical,
        },
    });

    return {
        ...damageResult,
        hit: true,
        damage: damageResult.finalDamage,
        newAttackerState: { ...attacker },
        newDefenderState: { ...defender },
        events: [event],
    };
}

/**
 * Creates a move result for a missed attack
 * @param {Move} move
 * @param {Fighter} attacker
 * @param {Fighter} defender
 * @param {ResolutionContext} context
 * @param {AccuracyCalculation} accuracyResult
 * @returns {MoveResult}
 */
export function createMissResult(move, attacker, defender, context, accuracyResult) {
    const event = generateLogEvent({
        type: "MOVE_MISS",
        payload: {
            attackerId: attacker.id,
            defenderId: defender.id,
            moveId: move.id,
            accuracy: accuracyResult.finalAccuracy,
        },
    });
    return {
        hit: false,
        critical: false,
        damage: 0,
        newAttackerState: { ...attacker },
        newDefenderState: { ...defender },
        events: [event],
    };
}

/**
 * Creates a move result for an error during resolution
 * @param {Move} move
 * @param {Fighter} attacker
 * @param {Fighter} defender
 * @param {ResolutionContext} context
 * @param {Error} error
 * @returns {MoveResult}
 */
export function createErrorResult(move, attacker, defender, context, error) {
    const event = generateLogEvent({
        type: "MOVE_ERROR",
        payload: {
            attackerId: attacker.id,
            defenderId: defender.id,
            moveId: move.id,
            errorMessage: error.message,
        },
    });
    return {
        hit: false,
        critical: false,
        damage: 0,
        newAttackerState: { ...attacker },
        newDefenderState: { ...defender },
        events: [event],
        error: true,
    };
} 