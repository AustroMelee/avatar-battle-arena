/**
 * @fileoverview AI Move Scoring System
 * @description Calculates move weights based on personality, strategic intent, and battle conditions.
 * Pure scoring logic without randomness or selection.
 * @version 1.1.0
 */

"use strict";

import { getAvailableMoves } from "../engine_move_availability.js";
import { BATTLE_PHASES } from "../engine_battle-phase.js";
import { getEscalationAIWeights } from "../engine_escalation.js";
import { getDynamicPersonality } from "./ai_personality.js";
import { STRATEGIC_INTENTS } from "./ai_strategy_intent.js";

/**
 * @typedef {import('../types/battle.js').Fighter} Fighter
 * @typedef {import('../types/battle.js').Move} Move
 * @typedef {import('../types/ai.js').AiPersonality} AiPersonality
 * @typedef {import('../types/ai.js').StrategicIntent} StrategicIntent
 * @typedef {import('../types/ai.js').IntentMultipliers} IntentMultipliers
 * @typedef {import('../types/ai.js').MoveEvaluation} MoveEvaluation
 * @typedef {import('../types/engine.js').BattlePhase} BattlePhase
 */

/**
 * Safe getter for nested object properties.
 * @template T
 * @param {object} obj The object to access.
 * @param {string} path The path to the property.
 * @param {T} defaultValue The default value to return if the property is not found.
 * @returns {T} The property value or the default value.
 */
function safeGet(obj, path, defaultValue) {
    const value = path.split(".").reduce((acc, part) => acc && acc[part], obj);
    if (value === undefined || value === null) {
        return defaultValue;
    }
    return value;
}

/**
 * Intent-based multipliers for different move types and characteristics.
 * @type {IntentMultipliers}
 */
const INTENT_MULTIPLIERS = {
    [STRATEGIC_INTENTS.STANDARD_EXCHANGE]: { 
        Offense: 1.2, 
        Finisher: 0.8 
    },
    [STRATEGIC_INTENTS.OPENING_MOVES]: { 
        Utility: 1.3, 
        Finisher: 1.2, 
        aggressive: 1.2 
    },
    [STRATEGIC_INTENTS.CAUTIOUS_DEFENSE]: { 
        Offense: 0.5, 
        Defense: 1.8 
    },
    [STRATEGIC_INTENTS.PRESS_ADVANTAGE]: { 
        Offense: 1.5, 
        Finisher: 1.2 
    },
    [STRATEGIC_INTENTS.CAPITALIZE_ON_OPENING]: { 
        Offense: 1.8, 
        Finisher: 1.5 
    },
    [STRATEGIC_INTENTS.DESPERATE_GAMBIT]: { 
        Finisher: 2.0, 
        highRisk: 2.5 
    },
    [STRATEGIC_INTENTS.FINISHING_BLOW_ATTEMPT]: { 
        Finisher: 3.5, 
        requires_opening: 2.8 
    },
    [STRATEGIC_INTENTS.CONSERVE_ENERGY]: { 
        low_cost: 3.0 
    },
    [STRATEGIC_INTENTS.POKING_PHASE_TACTICS]: { 
        Utility: 2.0, 
        Defense: 1.5, 
        low_cost: 2.0, 
        mobility_move: 1.8, 
        evasive: 1.8 
    },
    [STRATEGIC_INTENTS.OVERWHELM_OFFENSE]: { 
        Offense: 2.0, 
        Finisher: 1.8, 
        aggressive: 1.5 
    },
    [STRATEGIC_INTENTS.RECKLESS_OFFENSE]: { 
        Offense: 1.5, 
        Finisher: 2.5, 
        highRisk: 3.0, 
        utility: 0.1 
    }
};

/**
 * Calculates base personality modifiers for a move.
 * @param {Move} move The move to evaluate.
 * @param {AiPersonality} profile The AI's personality profile.
 * @param {Fighter} actor The AI fighter.
 * @returns {{weight: number, reasons: string[]}} The modifier weight and reasons.
 */
function calculatePersonalityModifiers(move, profile, actor) {
    let weight = 1.0;
    const reasons = [];

    // Move type personality modifiers
    switch (move.type) {
        case "Offense":
            weight *= (1 + profile.aggression);
            reasons.push(`Aggro:${profile.aggression.toFixed(2)}`);
            break;
        case "Defense":
            weight *= (1 + profile.defensiveBias);
            reasons.push(`Def:${profile.defensiveBias.toFixed(2)}`);
            break;
        case "Utility":
            weight *= (1 + profile.creativity);
            reasons.push(`Util:${profile.creativity.toFixed(2)}`);
            break;
        case "Finisher":
            weight *= (1 + profile.riskTolerance);
            // Finisher timing logic is handled in calculateContextualModifiers
            break;
    }

    // Signature move bias
    const signatureBias = safeGet(profile.signatureMoveBias, move.name, 1.0);
    if (signatureBias !== 1.0) {
        weight *= signatureBias;
        reasons.push("SigMove");
    }

    // Anti-repetition
    if (actor.lastMove?.name === move.name) {
        weight *= (1.0 - profile.antiRepeater);
        reasons.push("AntiRepeat");
    }

    return { weight, reasons };
}

/**
 * Calculates contextual modifiers based on battle state and opponent condition.
 * @param {Move} move The move to evaluate.
 * @param {Fighter} actor The AI fighter.
 * @param {Fighter} defender The opponent fighter.
 * @param {BattlePhase} currentPhase The current battle phase.
 * @returns {{weight: number, reasons: string[]}} The modifier weight and reasons.
 */
function calculateContextualModifiers(move, actor, defender, currentPhase) {
    let weight = 1.0;
    const reasons = [];

    // Finisher timing logic
    if (move.type === "Finisher") {
        const defenderHp = safeGet(defender, "hp", 100);
        if (currentPhase === BATTLE_PHASES.LATE || defenderHp <= 30) {
            weight *= 2.5;
            weight = Math.max(weight, 10.0); // Finisher floor
            reasons.push("FinisherFocus");
        } else {
            weight *= 0.1; // Penalize finishers early
        }
    }

    // Azula's broken mental state effects
    if (actor.id === "azula" && actor.mentalState?.level === "broken") {
        // Prioritize high-risk, high-power moves
        if (move.moveTags?.includes("highRisk") || (move.power || 0) >= 70) {
            weight *= 2.0;
            reasons.push("AzulaBroken:HighRisk/Power");
        }
        
        // Boost collateral damage moves
        if (move.collateralImpact && move.collateralImpact !== "none") {
            weight *= 1.5;
            reasons.push("AzulaBroken:CollateralBoost");
        }
        
        // Additional aggression surge
        const profile = getDynamicPersonality(actor, currentPhase);
        weight *= (1 + profile.aggression * 0.5);
        weight *= (1 - profile.defensiveBias * 0.5);
        reasons.push("AzulaBroken:AggressionSurge");
    }

    return { weight, reasons };
}

/**
 * Applies intent-based multipliers to move weight.
 * @param {Move} move The move to evaluate.
 * @param {StrategicIntent} intent The current strategic intent.
 * @returns {{weight: number, reasons: string[]}} The modifier weight and reasons.
 */
function applyIntentModifiers(move, intent) {
    let weight = 1.0;
    const reasons = [];

    const multipliers = INTENT_MULTIPLIERS[intent] || {};

    // Apply move type multiplier
    if (multipliers[move.type]) {
        weight *= multipliers[move.type];
        reasons.push(`Intent:${intent}`);
    }

    // Apply low cost multiplier
    if (multipliers.low_cost && (move.power || 50) < 30) {
        weight *= multipliers.low_cost;
    }

    // Apply move tag multipliers
    if (move.moveTags) {
        move.moveTags.forEach(tag => {
            if (multipliers[tag]) {
                weight *= multipliers[tag];
            }
        });
    }

    return { weight, reasons };
}

/**
 * Calculates weight for a single move based on all factors.
 * @param {Move} move The move to evaluate.
 * @param {Fighter} actor The AI fighter.
 * @param {Fighter} defender The opponent fighter.
 * @param {StrategicIntent} intent The current strategic intent.
 * @param {BattlePhase} currentPhase The current battle phase.
 * @returns {MoveEvaluation} The evaluated move with its score and reasoning.
 */
function calculateSingleMoveWeight(move, actor, defender, intent, currentPhase) {
    if (!move || !move.name) {
        return { 
            move,
            weight: 0.001, 
            reasons: ["InvalidMove"] 
        };
    }

    let totalWeight = 1.0;
    const allReasons = [];

    const profile = getDynamicPersonality(actor, currentPhase);

    // 1. Base personality modifiers
    const personalityResult = calculatePersonalityModifiers(move, profile, actor);
    totalWeight *= personalityResult.weight;
    allReasons.push(...personalityResult.reasons);

    // 2. Contextual modifiers (timing, special conditions)
    const contextResult = calculateContextualModifiers(move, actor, defender, currentPhase);
    totalWeight *= contextResult.weight;
    allReasons.push(...contextResult.reasons);

    // 3. Intent modifiers
    const intentResult = applyIntentModifiers(move, intent);
    totalWeight *= intentResult.weight;
    allReasons.push(...intentResult.reasons);

    // 4. Escalation modifiers
    const escalationInfo = getEscalationAIWeights(actor, defender, move);
    if (escalationInfo.finalMultiplier !== 1.0) {
        totalWeight *= escalationInfo.finalMultiplier;
        allReasons.push(...escalationInfo.scoreBasedReasonsApplied);
    }

    return { 
        move, 
        weight: totalWeight, 
        reasons: allReasons 
    };
}

/**
 * Calculates weights for all available moves.
 * Returns array of move objects with weights and reasoning.
 * @param {Fighter} actor The AI fighter.
 * @param {Fighter} defender The opponent fighter.
 * @param {StrategicIntent} intent The current strategic intent.
 * @param {BattlePhase} currentPhase The current battle phase.
 * @returns {MoveEvaluation[]} An array of evaluated moves.
 */
export function calculateMoveWeights(actor, defender, intent, currentPhase) {
    const availableMoves = getAvailableMoves(actor, currentPhase);
    if (!availableMoves || availableMoves.length === 0) {
        return [];
    }

    const weightedMoves = availableMoves.map(move => 
        calculateSingleMoveWeight(move, actor, defender, intent, currentPhase)
    );

    return weightedMoves;
}

/**
 * Filters weighted moves to get only viable options (weight > 0).
 * @param {MoveEvaluation[]} weightedMoves - Array of moves with weights.
 * @returns {MoveEvaluation[]} Filtered array of viable moves.
 */
export function getViableMoves(weightedMoves) {
    return weightedMoves.filter(move => move.weight > 0);
}

/**
 * Gets the top-scoring move from a weighted list.
 * @param {MoveEvaluation[]} weightedMoves - Array of moves with weights.
 * @returns {MoveEvaluation | null} The move with the highest weight, or null if empty.
 */
export function getTopMove(weightedMoves) {
    if (!weightedMoves || weightedMoves.length === 0) {
        return null;
    }
    return weightedMoves.reduce((top, current) => current.weight > top.weight ? current : top, weightedMoves[0]);
}

/**
 * Creates a summary string of the move weights for logging.
 * @param {MoveEvaluation[]} weightedMoves - Array of moves with weights.
 * @returns {string} A formatted string summarizing the move weights.
 */
export function getMoveWeightsSummary(weightedMoves) {
    if (!weightedMoves || weightedMoves.length === 0) {
        return "No moves were weighted.";
    }

    return weightedMoves
        .sort((a, b) => b.weight - a.weight)
        .map(m => `${m.move.name}: ${m.weight.toFixed(2)} (${m.reasons.join(", ")})`)
        .join(" | ");
} 