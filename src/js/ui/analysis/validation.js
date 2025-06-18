/**
 * @fileoverview Validates the structure of battle result objects.
 */

"use strict";

/**
 * @typedef {import('../../types/battle.js').BattleResult} BattleResult
 */

/**
 * Validates the structure of a battle result object.
 * @param {BattleResult} battleResult - The battle result to validate.
 * @throws {Error} When required properties are missing or invalid.
 */
export function validateBattleResultStructure(battleResult) {
    if (!battleResult.finalState) {
        throw new Error("validateBattleResultStructure: battleResult.finalState is required");
    }
    if (!battleResult.finalState.fighter1 || !battleResult.finalState.fighter2) {
        throw new Error("validateBattleResultStructure: Both fighters must be present in finalState");
    }
    if (typeof battleResult.winnerId !== "string" && battleResult.winnerId !== null) {
        throw new Error("validateBattleResultStructure: winnerId must be a string or null");
    }
    if (typeof battleResult.isDraw !== "boolean") {
        throw new Error("validateBattleResultStructure: isDraw must be a boolean");
    }
    if (typeof battleResult.turnCount !== "number" || battleResult.turnCount < 0) {
        throw new Error("validateBattleResultStructure: turnCount must be a non-negative number");
    }
} 