/**
 * @fileoverview Creates a fallback AI decision when the main process fails.
 */

"use strict";

import { getAvailableMoves } from "../ai_utils.js";
import { getDynamicPersonality } from "../ai_personality.js";

/**
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 * @typedef {import('../../types/battle.js').BattleState} BattleState
 * @typedef {import('../../types/battle.js').Move} Move
 * @typedef {import('../../types/ai.js').AiDecision} AiDecision
 */

/**
 * Creates a fallback decision when normal decision making fails.
 * @param {Fighter} aiFighter - The AI fighter.
 * @param {Fighter} opponentFighter - The opponent fighter.
 * @param {BattleState} battleState - The current battle state.
 * @returns {AiDecision} The fallback decision.
 */
export function createFallbackDecision(aiFighter, opponentFighter, battleState) {
    const availableMoves = getAvailableMoves(aiFighter, battleState);
    const fallbackMove = availableMoves.length > 0 ? availableMoves[0] : null;

    if (!fallbackMove) {
        return {
            moveId: "struggle",
            confidence: 0.1,
            reasoning: "Fallback: No moves available, resorting to struggle.",
            analysis: {},
            moveScores: new Map(),
            personalityInfluence: getDynamicPersonality(aiFighter, battleState.phase),
            timestamp: new Date().toISOString(),
            metadata: {
                fallback: true,
            },
        };
    }

    return {
        moveId: fallbackMove.id,
        confidence: 0.2,
        reasoning: "Fallback: Defaulting to first available move due to an error.",
        analysis: {},
        moveScores: new Map(),
        personalityInfluence: getDynamicPersonality(aiFighter, battleState.phase),
        timestamp: new Date().toISOString(),
        metadata: {
            fallback: true,
        },
    };
} 