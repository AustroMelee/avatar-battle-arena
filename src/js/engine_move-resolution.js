/**
 * @fileoverview Core move resolution engine.
 * @description Orchestrates the process of resolving a move, from accuracy and damage calculation to effect application.
 */

"use strict";

/**
 * @typedef {import('./types/battle.js').Fighter} Fighter
 * @typedef {import('./types/battle.js').BattleState} BattleState
 * @typedef {import('./types/battle.js').Move} Move
 * @typedef {import('./types/engine.js').MoveResult} MoveResult
 * @typedef {import('./types/engine.js').ResolutionContext} ResolutionContext
 */

import { generateLogEvent } from "./utils_log_event.js";
import { calculateHitSuccess } from "./engine/accuracy_calculator.js";
import { calculateMoveDamage } from "./engine/damage_calculator.js";
import { applyMoveEffects, createMissResult, createErrorResult } from "./engine/move_applier.js";
import { isValidMove } from "./engine_move_availability.js";
import { checkReactiveDefense } from "./engine_reactive-defense.js";
import { modifyMomentum } from "./engine_momentum.js";

/**
 * Resolves a move execution, calculating its outcome and effects.
 * This is the main entry point for processing a single move in a turn.
 * @param {Move} move The move to resolve.
 * @param {Fighter} attacker The fighter performing the move.
 * @param {Fighter} defender The fighter receiving the move.
 * @param {BattleState} battleState The current state of the battle.
 * @returns {Promise<MoveResult>} The result of the move.
 */
export async function resolveMove(move, attacker, defender, battleState) {
    const context = {
        turnNumber: battleState.turn,
        phase: battleState.phase,
        environment: battleState.environmentState,
    };

    try {
        if (!isValidMove(move, attacker)) {
            const error = new Error("Invalid or unavailable move");
            generateLogEvent({
                type: "MOVE_VALIDATION_FAILED",
                payload: {
                    moveId: move.id,
                    attackerId: attacker.id,
                    reason: error.message,
                },
            });
            return createErrorResult(move, attacker, defender, context, error);
        }

        // --- REACTIVE DEFENSE CHECK ---
        const reactionResult = checkReactiveDefense(attacker, defender, move, battleState, battleState.log, modifyMomentum);
        if (reactionResult.reacted) {
            // If a reaction occurred, bypass normal move resolution
            // and construct a result based on the reaction's outcome.
            // This part may need further implementation based on how reaction results are structured.
            generateLogEvent({
                type: "REACTIVE_DEFENSE_TRIGGERED",
                payload: {
                    reactionType: reactionResult.type,
                    attackerId: attacker.id,
                    defenderId: defender.id,
                    outcome: reactionResult,
                },
            });

            // Assuming reactionResult has a structure that can be transformed into a MoveResult
            // This is a placeholder for that transformation.
            const moveResult = {
                move,
                attacker,
                defender,
                damageResult: {
                    baseDamage: 0,
                    finalDamage: reactionResult.damageMitigation ? 0 : -1, // Example logic
                    mitigatedDamage: 0,
                    log: [],
                },
                didHit: !reactionResult.success, // If redirection fails, does it still "hit"?
                context,
                events: reactionResult.narrativeEvents || [],
            };
            
            // We need to update fighter states based on reactionResult
            // e.g., stun applied, momentum changes
            // This logic needs to be fully implemented.

            return moveResult;
        }
        // --- END REACTIVE DEFENSE CHECK ---

        const accuracyResult = calculateHitSuccess(move, attacker, defender, context);

        if (!accuracyResult.hit) {
            return createMissResult(move, attacker, defender, context, accuracyResult);
        }

        const damageResult = calculateMoveDamage(move, attacker, defender, battleState, context);

        const moveResult = await applyMoveEffects(move, attacker, defender, damageResult, battleState, context);

        generateLogEvent({
            type: "MOVE_RESOLUTION_COMPLETE",
            payload: {
                moveId: move.id,
                attackerId: attacker.id,
                defenderId: defender.id,
                finalDamage: moveResult.damageResult.finalDamage,
            },
        });

        return moveResult;

    } catch (err) {
        const error = /** @type {Error} */ (err);
        console.error(`Error resolving move ${move?.id}:`, error);
        generateLogEvent({
            type: "MOVE_RESOLUTION_ERROR",
            payload: {
                moveId: move?.id,
                attackerId: attacker?.id,
                error: error.message,
                stack: error.stack,
            },
        });
        return createErrorResult(move, attacker, defender, context, error);
    }
}