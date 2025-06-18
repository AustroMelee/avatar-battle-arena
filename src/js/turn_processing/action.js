/**
 * @fileoverview Action determination and execution for the turn processor.
 */

"use strict";

import { makeAIDecision } from "../ai/ai_decision_engine.js";
import { resolveMove } from "../engine_move-resolution.js";

/**
 * @typedef {import('../types/battle.js').BattleState} BattleState
 * @typedef {import('../types/battle.js').Fighter} Fighter
 * @typedef {import('../types/engine.js').TurnOptions} TurnOptions
 */

/**
 * Determines and executes the action for the active fighter.
 * @param {BattleState} battleState
 * @param {Fighter} activeFighter
 * @param {Fighter} inactiveFighter
 * @param {TurnOptions} options
 * @returns {Promise<BattleState>}
 */
export async function determineAndExecuteAction(battleState, activeFighter, inactiveFighter, options) {
    // For now, we'll assume the action is always AI-driven.
    // A more complete implementation would check if the fighter is human-controlled.
    const aiDecision = await makeAIDecision(battleState, activeFighter, inactiveFighter);

    // This is a simplified execution model.
    if (aiDecision.action === "move" && aiDecision.moveId) {
        const move = activeFighter.moves.find(m => m.id === aiDecision.moveId);
        if (move) {
            return resolveMove(battleState, activeFighter, inactiveFighter, move);
        }
    }

    // Default to a 'pass' action if no other action is taken.
    // This should be expanded to handle other action types.
    return battleState;
} 