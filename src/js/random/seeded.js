/**
 * @fileoverview Seeded random number generation.
 * @deprecated This module is a placeholder. For true seeded random numbers,
 * a dedicated library like 'seedrandom' should be used.
 */

"use strict";

let currentSeed = Date.now();

/**
 * "Seeds" the random number generator.
 * @param {number} seed
 */
export function seedRandom(seed) {
    if (typeof seed !== "number") {
        throw new TypeError("Seed must be a number.");
    }
    console.warn("seedRandom is deprecated and does not provide true seeded randomness. Use a dedicated library instead.");
    currentSeed = seed;
}

/**
 * Generates a "seeded" random number.
 * @returns {number}
 */
export function seededRandom() {
    // This is not a true PRNG, just a simple way to get a number from a seed.
    const x = Math.sin(currentSeed++) * 10000;
    return x - Math.floor(x);
} 