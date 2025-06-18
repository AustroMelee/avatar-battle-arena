"use strict";

/**
 * @fileoverview Action Processor
 * @description Handles the execution of a fighter's chosen action for the turn, including AI decisions and move resolution.
 * @version 1.0.0
 */

// ============================================================================
// TYPE IMPORTS
// ============================================================================
/**
 * @typedef {import('../types.js').BattleState} BattleState
 * @typedef {import('../types.js').Fighter} Fighter
 * @typedef {import('../types.js').TurnOptions} TurnOptions
 * @typedef {import('../types.js').ActionContext} ActionContext
 * @typedef {import('../types.js').AiDecision} AiDecision
 * @typedef {import('../types.js').Move} Move
 * @typedef {import('../types.js').MoveResult} MoveResult
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
 * Executes the main action for the active player, deciding between AI and player input.
 * @param {BattleState} battleState - Current battle state.
 * @param {Fighter} activeFighter - Fighter taking action.
 * @param {Fighter} targetFighter - Target fighter.
 * @param {TurnOptions} options - Turn options.
 * @returns {Promise<BattleState>} Updated battle state.
 */
async function executePlayerAction(battleState, activeFighter, targetFighter, options) {
    const decision = options.skipAI ? null : await makeAIDecision(activeFighter, targetFighter, battleState);

    if (!decision) {
        return await executeBasicAction(battleState, activeFighter, targetFighter, options);
    }

    const actionContext = {
        actor: activeFighter,
        target: targetFighter,
        battleState: battleState,
        options,
        actionIndex: 0
    };

    return await executeAction(decision, actionContext);
}

/**
 * Executes a specific action based on an AI decision.
 * @param {AiDecision} decision - AI decision to execute.
 * @param {ActionContext} context - Action execution context.
 * @returns {Promise<BattleState>} Updated battle state.
 */
async function executeAction(decision, context) {
    const selectedMove = context.actor.moves?.find(move => move.id === decision.moveId);
    if (!selectedMove) {
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
 * Applies the results of a move to the battle state.
 * @param {BattleState} battleState The current battle state.
 * @param {MoveResult} moveResult The result of the executed move.
 * @param {ActionContext} context The context of the action.
 * @returns {BattleState} The updated battle state.
 */
function applyMoveResult(battleState, moveResult, context) {
    let updatedState = { ...battleState };
    // Apply damage, healing, etc. from moveResult to the state's fighters
    
    // This is a simplified placeholder. A real implementation would be more robust.
    const target = updatedState.fighters[context.target.id];
    if (target && moveResult.damage > 0) {
        target.hp -= moveResult.damage;
    }
    
    // Apply status effects
    if (moveResult.appliedEffects) {
        updatedState = applyStatusEffectsFromMove(updatedState, moveResult.appliedEffects, context);
    }
    
    return updatedState;
}


/**
 * Executes a basic fallback action if AI decision fails.
 * @param {BattleState} battleState - Current battle state.
 * @param {Fighter} activeFighter - Fighter taking action.
 * @param {Fighter} targetFighter - Target fighter.
 * @param {TurnOptions} options - Turn options.
 * @returns {Promise<BattleState>} Updated battle state.
 */
async function executeBasicAction(battleState, activeFighter, targetFighter, options) {
    const basicMove = activeFighter.moves?.[0];
    if (!basicMove) return battleState; // Or handle "struggle"

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