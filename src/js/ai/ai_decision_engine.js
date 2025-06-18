/**
 * @fileoverview Avatar Battle Arena - AI Decision Engine
 * @description Core AI system for making intelligent battle decisions based on fighter state, opponent analysis, and strategic goals
 * @version 2.0.0
 */

"use strict";

//# sourceURL=ai_decision_engine.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('../types/battle.js').Fighter} Fighter
 * @typedef {import('../types/battle.js').BattleState} BattleState
 * @typedef {import('../types/battle.js').Move} Move
 * @typedef {import('../types/ai.js').AiDecision} AiDecision
 * @typedef {import('../types/ai.js').AiAnalysis} AiAnalysis
 * @typedef {import('../types/ai.js').AiPersonality} AiPersonality
 * @typedef {import('../types/ai.js').AiMemory} AiMemory
 * @typedef {import('../types/ai.js').DecisionContext} DecisionContext
 * @typedef {import('../types/ai.js').MoveEvaluation} MoveEvaluation
 * @typedef {import('../types/ai.js').DecisionOptions} DecisionOptions
 * @typedef {import('../types/ai.js').StrategicGoal} StrategicGoal
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { selectMoveFromWeights } from "./ai_move_selection.js";
import { getDynamicPersonality } from "./ai_personality.js";
import { updateAiMemory } from "./ai_memory.js";
import { determineStrategicIntent } from "./ai_strategy_intent.js";
import { createMoveScoreMap } from "./ai_scoring_utils.js";
import { buildDecisionContext } from "./decision/context.js";
import { analyzeDecisionContext } from "./decision/analysis.js";
import { validateInputs, validateDecision } from "./decision/validation.js";
import { createFallbackDecision } from "./decision/fallback.js";
import { calculateMoveWeights, getTopMove } from "./ai_move_scoring.js";

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {number} */
const MIN_CONFIDENCE_THRESHOLD = 0.3;

/** @type {number} */
const MAX_CONFIDENCE_LEVEL = 1.0;

/** @type {number} */
const DECISION_TIMEOUT_MS = 5000;

/** @type {number} */
const DEFAULT_TURN_TIMEOUT = 3000;

/** @type {string[]} */
const VALID_STRATEGIC_INTENTS = [
    "aggressive",
    "defensive",
    "balanced",
    "adaptive",
    "opportunistic",
    "conservative",
    "reckless"
];

/** @type {string[]} */
const VALID_DECISION_PHASES = [
    "opening",
    "early",
    "mid",
    "late",
    "endgame",
    "desperate"
];

/** @type {Object<string, StrategicGoal>} */
const DEFAULT_STRATEGIC_GOALS = {
    offense: {
        type: "offense",
        priority: 70,
        description: "Deal maximum damage to opponent",
        parameters: { damageThreshold: 15, aggressionBonus: 0.2 },
        active: true
    },
    defense: {
        type: "defense",
        priority: 50,
        description: "Minimize incoming damage",
        parameters: { healthThreshold: 0.3, defensiveBonus: 0.15 },
        active: true
    },
    control: {
        type: "control",
        priority: 60,
        description: "Control battle flow and positioning",
        parameters: { statusEffectPriority: 0.8, controlBonus: 0.1 },
        active: true
    },
    survival: {
        type: "survival",
        priority: 90,
        description: "Survive when critically low on health",
        parameters: { criticalThreshold: 0.2, survivalBonus: 0.3 },
        active: false
    }
};

// ============================================================================
// CORE DECISION ENGINE
// ============================================================================

/**
 * Makes an AI decision for the current battle situation
 * 
 * @param {Fighter} aiFighter - AI fighter making the decision
 * @param {Fighter} opponentFighter - Opponent fighter
 * @param {BattleState} battleState - Current battle state
 * @param {DecisionOptions} [options={}] - Decision options
 * 
 * @returns {Promise<AiDecision>} AI decision with reasoning and confidence
 * 
 * @throws {TypeError} When required parameters are invalid
 * @throws {Error} When decision cannot be made
 * @throws {Error} When decision times out
 * @throws {RangeError} When fighter stats are out of valid range
 * 
 * @example
 * // Make AI decision
 * const decision = await makeAIDecision(
 *   aiCharacter,
 *   playerCharacter,
 *   currentBattleState,
 *   { timeLimit: 3000, enableDebug: true }
 * );
 * console.log(`AI chose: ${decision.moveId} (${decision.confidence.toFixed(2)} confidence)`);
 * 
 * @since 2.0.0
 * @public
 */
export async function makeAIDecision(aiFighter, opponentFighter, battleState, options = {}) {
    const startTime = performance.now();
    try {
        validateInputs(aiFighter, opponentFighter, battleState, options);

        const timeLimit = options.timeLimit || DECISION_TIMEOUT_MS;
        const decisionPromise = makeDecisionInternal(aiFighter, opponentFighter, battleState, options);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("AI decision timed out")), timeLimit);
        });

        const decision = await Promise.race([decisionPromise, timeoutPromise]);
        
        validateDecision(decision, aiFighter);

        if (options.enableDebug) {
            const executionTime = performance.now() - startTime;
            console.debug(`[AI Decision] Decision: ${decision.moveId}, Confidence: ${decision.confidence.toFixed(2)}, Time: ${executionTime.toFixed(2)}ms`);
        }

        return decision;
    } catch (/** @type {any} */ error) {
        console.error(`[AI Decision] Error for ${aiFighter.id}:`, error);
        return createFallbackDecision(aiFighter, opponentFighter, battleState);
    }
}

/**
 * Internal decision making implementation
 * 
 * @param {Fighter} aiFighter - AI fighter
 * @param {Fighter} opponentFighter - Opponent fighter  
 * @param {BattleState} battleState - Current battle state
 * @param {DecisionOptions} options - Decision options
 * 
 * @returns {Promise<AiDecision>} AI decision
 * 
 * @throws {TypeError} When context building fails
 * @throws {Error} When move evaluation fails
 * 
 * @private
 * @since 2.0.0
 */
async function makeDecisionInternal(aiFighter, opponentFighter, battleState, options) {
    const context = await buildDecisionContext(aiFighter, opponentFighter, battleState, options);
    const analysis = await analyzeDecisionContext(context);
    /** @type {any} */
    const intent = determineStrategicIntent(aiFighter, opponentFighter, battleState.turn, battleState.phaseState.currentPhase);
    
    const weightedMoves = calculateMoveWeights(aiFighter, opponentFighter, intent, battleState.phaseState.currentPhase);
    
    if (!weightedMoves || weightedMoves.length === 0) {
        throw new Error("No moves available for evaluation.");
    }

    const personality = getDynamicPersonality(aiFighter, battleState.phaseState.currentPhase);
    const selectedMove = selectMoveFromWeights(weightedMoves, personality.predictability);

    updateAiMemory(aiFighter, opponentFighter);

    return {
        moveId: selectedMove.move.id,
        confidence: Math.min(MAX_CONFIDENCE_LEVEL, Math.max(MIN_CONFIDENCE_THRESHOLD, selectedMove.probability)),
        reasoning: selectedMove.reasons.join(", "),
        analysis,
        moveScores: createMoveScoreMap(weightedMoves),
        personalityInfluence: {}, // This is now difficult to calculate, return empty for now
        timestamp: new Date().toISOString(),
        metadata: {
            evaluatedMoves: weightedMoves.length,
            topScore: selectedMove.weight,
            decisionTime: Date.now(),
        },
    };
}

// ============================================================================
// MOVE SCORING FUNCTIONS
// ============================================================================

// All score calculation functions moved to evaluation/scoring_calculators.js

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// All goal setting functions moved to goals/goal_setting.js 