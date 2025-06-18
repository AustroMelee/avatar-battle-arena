/**
 * @fileoverview Builds the decision context for the AI.
 */

"use strict";

import { getAvailableMoves } from "../ai_utils.js";
import { determineBattlePhase } from "./phase.js"; // Assuming phase logic is also modularized

/**
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 * @typedef {import('../../types/battle.js').BattleState} BattleState
 * @typedef {import('../../types/battle.js').Move} Move
 * @typedef {import('../../types/ai.js').DecisionContext} DecisionContext
 * @typedef {import('../../types/ai.js').DecisionOptions} DecisionOptions
 */

const DEFAULT_TURN_TIMEOUT = 3000;

/**
 * Builds a comprehensive decision context for AI analysis.
 * @param {Fighter} aiFighter - The AI fighter.
 * @param {Fighter} opponentFighter - The opponent fighter.
 * @param {BattleState} battleState - The current battle state.
 * @param {DecisionOptions} options - The decision options.
 * @returns {Promise<DecisionContext>} The decision context.
 */
export async function buildDecisionContext(aiFighter, opponentFighter, battleState, options) {
    try {
        const availableMoves = getAvailableMoves(aiFighter, battleState);
        if (!availableMoves || availableMoves.length === 0) {
            throw new Error("buildDecisionContext: No available moves for AI fighter");
        }

        const battlePhase = determineBattlePhase(battleState, aiFighter, opponentFighter);

        /** @type {DecisionContext} */
        const context = {
            self: aiFighter,
            opponent: opponentFighter,
            battleState,
            availableMoves,
            turnNumber: battleState.turn,
            phase: battlePhase,
            environment: battleState.environment,
            options: {
                enableDebug: options.enableDebug || false,
                timeLimit: options.timeLimit || DEFAULT_TURN_TIMEOUT,
                personalityOverride: options.personalityOverride || null,
            },
        };

        return context;
    } catch (/** @type {any} */ error) {
        console.error("[AI Decision] Error building decision context:", error);
        throw new Error(`Decision context building failed: ${error.message}`);
    }
} 