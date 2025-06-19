"use strict";

/**
 * @fileoverview Action Processor
 * @description This module serves as the central hub for executing a fighter's
 *   action during a turn. It orchestrates getting a decision from the AI,
 *   resolving the chosen move, and applying its results to the battle state.
 * @version 1.0.0
 */

// ============================================================================
// TYPE IMPORTS
// ============================================================================
/**
 * @typedef {import('../types/battle.js').BattleState} BattleState
 * @typedef {import('../types/battle.js').Fighter} Fighter
 * @typedef {import('../types/engine.js').TurnOptions} TurnOptions
 * @typedef {import('../types/engine.js').ActionContext} ActionContext
 * @typedef {import('../types/ai.js').AiDecision} AiDecision
 * @typedef {import('../types/battle.js').Move} Move
 * @typedef {import('../types/engine.js').MoveResult} MoveResult
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { makeAIDecision } from "../ai/ai_decision_engine.js";
import { resolveMove } from "./engine_move-resolution.js";
import { applyStatusEffectsFromMove } from "./effects_processor.js";

// ============================================================================
// ACTION EXECUTION
// ============================================================================

/**
 * Executes the main action for the active fighter. It determines whether to
 * request a decision from the AI or to proceed with a basic, default action.
 * This is the primary entry point for a fighter's turn.
 *
 * @param {BattleState} battleState - The current battle state.
 * @param {Fighter} activeFighter - The fighter whose turn it is to act.
 * @param {Fighter} targetFighter - The intended target of the action.
 * @param {TurnOptions} options - Options for the current turn, such as whether
 *   to bypass the AI.
 * @returns {Promise<BattleState>} The battle state after the action is resolved.
 */
async function executePlayerAction(battleState, activeFighter, targetFighter, options) {
    // The `skipAI` option allows for scenarios where a player action is
    // predetermined, or for testing specific moves without AI intervention.
    const decision = options.skipAI ? null : await makeAIDecision(activeFighter, targetFighter, battleState);

    // If the AI doesn't return a decision (e.g., it can't find a valid move),
    // the system falls back to a basic, predictable action.
    if (!decision) {
        return await executeBasicAction(battleState, activeFighter, targetFighter, options);
    }

    const actionContext = {
        actor: activeFighter,
        target: targetFighter,
        battleState: battleState,
        options,
        // The actionIndex is part of a potential feature for multiple actions
        // per turn, but is currently unused.
        actionIndex: 0
    };

    return await executeAction(decision, actionContext);
}

/**
 * Executes a specific move based on a decision from the AI. This function
 * finds the move on the fighter's movelist, passes it to the move resolution
 * engine, and then applies the outcome.
 *
 * @param {AiDecision} decision - The decision object from the AI, containing
 *   the ID of the move to be executed.
 * @param {ActionContext} context - The context for the action execution,
 *   containing the actor, target, and current battle state.
 * @returns {Promise<BattleState>} The battle state after the move is resolved.
 * @throws {Error} If the move specified in the AI decision cannot be found.
 */
async function executeAction(decision, context) {
    const selectedMove = context.actor.moves?.find(move => move.id === decision.moveId);
    if (!selectedMove) {
        // This is a critical failure state. If the AI chooses a move the fighter
        // doesn't have, it indicates a desynchronization between the AI's
        // knowledge and the fighter's actual state.
        throw new Error(`executeAction: Move '${decision.moveId}' not found for fighter ${context.actor.id}`);
    }

    const moveResult = await resolveMove(
        selectedMove,
        context.actor,
        context.target,
        context.battleState,
        {
            turnNumber: context.options.turnNumber || 1,
            phase: context.options.phase || "combat",
            environment: context.battleState.environment
        }
    );

    return applyMoveResult(context.battleState, moveResult, context);
}

/**
 * Applies the results of a resolved move to the battle state. This function is
 * responsible for taking the outcomes of a move (damage, status effects, etc.)
 * and updating the state of the fighters accordingly.
 *
 * @param {BattleState} battleState The current battle state.
 * @param {MoveResult} moveResult The result object from the move resolution engine.
 * @param {ActionContext} context The context of the original action.
 * @returns {BattleState} The updated battle state.
 */
function applyMoveResult(battleState, moveResult, context) {
    let updatedState = { ...battleState };
    // This is a simplified, placeholder implementation of applying damage.
    // It directly mutates a copy of the state. A more robust implementation
    // would use a safer method to update the nested fighter object.
    const target = updatedState.fighters[context.target.id];
    if (target && moveResult.damage > 0) {
        target.hp -= moveResult.damage;
    }
    
    // Delegates the application of any status effects to the effects processor.
    if (moveResult.appliedEffects) {
        updatedState = applyStatusEffectsFromMove(updatedState, moveResult.appliedEffects, context);
    }
    
    return updatedState;
}


/**
 * Executes a basic, deterministic fallback action. This is used when the AI
 * fails to make a decision or is explicitly bypassed. It typically involves
 * using the fighter's first available move.
 *
 * @param {BattleState} battleState - The current battle state.
 * @param {Fighter} activeFighter - The fighter taking the action.
 * @param {Fighter} targetFighter - The target of the action.
 * @param {TurnOptions} options - Turn-specific options.
 * @returns {Promise<BattleState>} The battle state after the action is resolved.
 */
async function executeBasicAction(battleState, activeFighter, targetFighter, options) {
    // This fallback is very naive. A better implementation might choose the
    // lowest-cost move or a move with no side effects.
    const basicMove = activeFighter.moves?.[0];
    if (!basicMove) return battleState; // If the fighter has no moves, they cannot act. A "Struggle" move could be implemented here.

    const moveResult = await resolveMove(basicMove, activeFighter, targetFighter, battleState, {
        turnNumber: options.turnNumber || 1,
        phase: "combat"
    });

    return applyMoveResult(battleState, moveResult, { actor: activeFighter, target: targetFighter, battleState, options, actionIndex: 0 });
}


// ============================================================================
// EXPORTS
// ============================================================================
export { executePlayerAction }; 