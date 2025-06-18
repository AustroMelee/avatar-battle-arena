/**
 * @fileoverview Boolean and probability-based random utilities.
 */

"use strict";

/**
 * Returns true with a given probability.
 * @param {number} probability - A number between 0 and 1.
 * @returns {boolean}
 */
export function randomChance(probability) {
    if (typeof probability !== "number" || probability < 0 || probability > 1) {
        throw new RangeError("Probability must be a number between 0 and 1.");
    }
    return Math.random() < probability;
} 