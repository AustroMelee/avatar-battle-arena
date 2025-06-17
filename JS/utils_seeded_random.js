'use strict';

let seed = 1;

/**
 * Initializes the seed for the deterministic random number generator.
 * @param {number} newSeed - The seed value.
 */
export function setSeed(newSeed) {
    seed = newSeed;
}

/**
 * Generates a deterministic pseudo-random number between 0 (inclusive) and 1 (exclusive).
 * Uses a simple linear congruential generator (LCG).
 * @returns {number} A pseudo-random number.
 */
export function seededRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
}

/**
 * Gets a random element from an array, using the seeded random function if available.
 * @param {Array<any>} arr - The array to pick from.
 * @param {boolean} useSeeded - Whether to use the seeded random number generator.
 * @returns {any|null} A random element from the array, or null if the array is empty.
 */
export function getRandomElementSeeded(arr, useSeeded) {
    if (!arr || arr.length === 0) {
        return null;
    }
    const randomIndex = useSeeded ? Math.floor(seededRandom() * arr.length) : Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
} 