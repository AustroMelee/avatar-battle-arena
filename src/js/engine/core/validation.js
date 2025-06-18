/**
 * @fileoverview Validates battle parameters and results.
 */

"use strict";

import { getCharacterTemplate } from "../../data_characters.js";
import { locations } from "../../locations.js";

/**
 * @typedef {import('../../types/battle.js').BattleResult} BattleResult
 */

/**
 * Validates battle parameters before execution.
 * @param {string} fighter1Id
 * @param {string} fighter2Id
 * @param {string} locationId
 */
export function validateBattleParameters(fighter1Id, fighter2Id, locationId) {
    if (!getCharacterTemplate(fighter1Id)) {
        throw new Error(`Fighter '${fighter1Id}' not found`);
    }
    if (!getCharacterTemplate(fighter2Id)) {
        throw new Error(`Fighter '${fighter2Id}' not found`);
    }
    if (!(/** @type {any} */ (locations)[locationId])) {
        throw new Error(`Location '${locationId}' not found`);
    }
    if (fighter1Id === fighter2Id) {
        throw new Error("Cannot battle identical fighters");
    }
}

/**
 * Validates a battle result object structure.
 * @param {any} result
 * @returns {result is BattleResult}
 */
export function isValidBattleResult(result) {
    if (!result || typeof result !== "object") return false;
    if (typeof result.winnerId !== "string" && result.winnerId !== null) return false;
    if (typeof result.isDraw !== "boolean") return false;
    if (typeof result.turnCount !== "number" || result.turnCount < 0) return false;
    if (!result.finalState || typeof result.finalState !== "object") return false;
    if (!Array.isArray(result.log)) return false;
    return true;
} 