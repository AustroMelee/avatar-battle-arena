"use strict";

/**
 * @fileoverview Move effect application and result generation.
 * @description This module is responsible for applying the immediate effects of a
 *   move (like damage and energy cost) and for creating standardized result
 *   objects for different outcomes (hit, miss, error).
 * @note This module has a significant architectural inconsistency. Instead of
 *   updating and returning the full `BattleState`, its functions return a
 *   `MoveResult` object which contains partially updated copies of the
 *   fighters. This deviates from a pure immutable state pattern and can make
 *   state management more complex.
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
 * @note This is a local utility function. To avoid code duplication, it should
 *   be moved to a central math utility file, as it also exists in other modules.
 * @param {number} value The number to clamp.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @returns {number} The clamped number.
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

/**
 * Applies the primary effects of a move, such as damage and energy cost, and
 * generates a result object for a successful hit.
 *
 * @note This function directly mutates the `hp` and `energy` of the fighter
 *   objects passed into it before creating shallow copies for the return object.
 *   This is a potential source of bugs and violates immutable state principles.
 *
 * @param {Move} move The move that was executed.
 * @param {Fighter} attacker The fighter who performed the move.
 * @param {Fighter} defender The fighter who received the move.
 * @param {DamageCalculation} damageResult The pre-calculated damage details.
 * @param {BattleState} battleState The complete battle state (used for logging).
 * @param {ResolutionContext} context Additional resolution context.
 * @returns {Promise<MoveResult>} An object containing the outcome of the move,
 *   including partially updated fighter states.
 */
export async function applyMoveEffects(move, attacker, defender, damageResult, battleState, context) {
    // Direct mutation of the defender object.
    defender.hp = clamp(defender.hp - damageResult.finalDamage, 0, 100);
    // Direct mutation of the attacker object.
    attacker.energy = clamp(attacker.energy - (move.energyCost || 0), 0, 100);

    // This section is a placeholder. A full implementation would need to iterate
    // through the move's effects and delegate them to the appropriate handlers,
    // similar to the logic in `effects_processor.js`.
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
 * Creates a standardized result object for a move that missed its target.
 * It ensures no state changes are propagated and logs the miss event.
 *
 * @param {Move} move The move that missed.
 * @param {Fighter} attacker The attacker.
 * @param {Fighter} defender The intended target.
 * @param {ResolutionContext} context Additional resolution context.
 * @param {AccuracyCalculation} accuracyResult The details of the accuracy roll.
 * @returns {MoveResult} A result object indicating a miss, with original
 *   fighter states.
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
 * Creates a standardized result object for an error that occurred during move
 * resolution. This prevents the system from crashing and provides a clear
 * error log.
 *
 * @param {Move} move The move that caused the error, which may be null.
 * @param {Fighter} attacker The attacker at the time of the error.
 * @param {Fighter} defender The intended target.
 * @param {ResolutionContext} context Additional resolution context.
 * @param {Error} error The error that was thrown.
 * @returns {MoveResult} A result object indicating an error, with original
 *   fighter states.
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