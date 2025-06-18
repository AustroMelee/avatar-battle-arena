/**
 * @fileoverview Defines character-specific biases for the AI.
 * @description This layer provides a "soft influence" on AI decisions,
 * making characters act more like themselves, even when it's not
 * strictly optimal.
 */

"use strict";

/**
 * @typedef {Object} AiBias
 * @property {number} [overkill=0] - Tendency to use excessive force.
 * @property {number} [selfPreservation=0] - Focus on personal safety.
 * @property {number} [betrayalRisk=0] - Suspicion of opponent's tactics.
 * @property {number} [showboating=0] - Tendency to use flashy, less optimal moves.
 */

/** @type {AiBias} */
export const AZULA_BIAS = {
    overkill: 10,
    selfPreservation: -5,
    betrayalRisk: 20,
    showboating: 5,
};

/** @type {AiBias} */
export const AANG_BIAS = {
    overkill: -10,
    selfPreservation: 15,
    betrayalRisk: -5,
    showboating: -5,
};

/**
 * A map of character IDs to their bias objects.
 * @type {Object<string, AiBias>}
 */
export const CHARACTER_BIASES = {
    azula: AZULA_BIAS,
    aang: AANG_BIAS,
};

/**
 * Gets the bias for a given character.
 * @param {string} characterId - The ID of the character.
 * @returns {AiBias} The character's bias object, or an empty object if none is found.
 */
export function getCharacterBias(characterId) {
    return CHARACTER_BIASES[characterId] || {};
} 