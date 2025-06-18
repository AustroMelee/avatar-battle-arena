/**
 * @fileoverview Validates inputs and outputs for the AI decision engine.
 */

"use strict";

/**
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 * @typedef {import('../../types/battle.js').BattleState} BattleState
 * @typedef {import('../../types/ai.js').AiDecision} AiDecision
 */

const MIN_CONFIDENCE_THRESHOLD = 0.3;

/**
 * Validates the inputs for the main AI decision function.
 * @param {Fighter} aiFighter - The AI fighter.
 * @param {Fighter} opponentFighter - The opponent fighter.
 * @param {BattleState} battleState - The current battle state.
 * @param {Object} options - The decision options.
 */
export function validateInputs(aiFighter, opponentFighter, battleState, options) {
    if (!aiFighter || typeof aiFighter !== "object" || !aiFighter.id) {
        throw new TypeError("validateInputs: aiFighter must be a valid fighter object with an id");
    }
    if (!opponentFighter || typeof opponentFighter !== "object" || !opponentFighter.id) {
        throw new TypeError("validateInputs: opponentFighter must be a valid fighter object with an id");
    }
    if (!battleState || typeof battleState !== "object") {
        throw new TypeError("validateInputs: battleState must be a valid battle state object");
    }
    if (typeof options !== "object" || options === null) {
        throw new TypeError("validateInputs: options must be an object");
    }
    if (typeof aiFighter.hp !== "number" || aiFighter.hp < 0 || aiFighter.hp > 100) {
        throw new RangeError("validateInputs: aiFighter.hp must be a number between 0 and 100");
    }
}

/**
 * Validates a decision before it's returned.
 * @param {AiDecision} decision - The decision to validate.
 * @param {Fighter} fighter - The AI fighter.
 */
export function validateDecision(decision, fighter) {
    if (!decision || typeof decision !== "object") {
        throw new Error("validateDecision: decision must be an object");
    }
    if (!decision.moveId || typeof decision.moveId !== "string") {
        throw new Error("validateDecision: decision must have a valid moveId");
    }
    if (typeof decision.confidence !== "number" || decision.confidence < 0 || decision.confidence > 1) {
        throw new Error("validateDecision: confidence must be a number between 0 and 1");
    }
    if (decision.confidence < MIN_CONFIDENCE_THRESHOLD) {
        throw new Error(`validateDecision: confidence ${decision.confidence} is below the minimum threshold of ${MIN_CONFIDENCE_THRESHOLD}`);
    }
    const moveExists = fighter.moves?.some(move => move.id === decision.moveId);
    if (!moveExists) {
        throw new Error(`validateDecision: move '${decision.moveId}' not found in the fighter's moveset`);
    }
} 