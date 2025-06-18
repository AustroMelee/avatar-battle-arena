/**
 * @fileoverview Random utilities for arrays and collections.
 */

"use strict";

import { randomInt } from "./numeric.js";

/**
 * Selects a random element from an array.
 * @template T
 * @param {T[]} array
 * @returns {T}
 */
export function randomChoice(array) {
    if (!Array.isArray(array) || array.length === 0) {
        throw new Error("Input must be a non-empty array.");
    }
    return array[randomInt(0, array.length - 1)];
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export function randomShuffle(array) {
    if (!Array.isArray(array)) {
        throw new Error("Input must be an array.");
    }
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Selects a random sample of elements from an array.
 * @template T
 * @param {T[]} array
 * @param {number} count
 * @returns {T[]}
 */
export function randomSample(array, count) {
    if (!Array.isArray(array) || typeof count !== "number" || count < 0) {
        throw new Error("Invalid input. Requires an array and a non-negative count.");
    }
    if (count > array.length) {
        throw new RangeError("Sample count cannot be greater than the array length.");
    }
    return randomShuffle([...array]).slice(0, count);
}

/**
 * Selects a random element from an array based on weights.
 * @template T
 * @param {T[]} choices
 * @param {number[]} weights
 * @returns {T}
 */
export function weightedRandomChoice(choices, weights) {
    if (!Array.isArray(choices) || !Array.isArray(weights) || choices.length !== weights.length) {
        throw new Error("Choices and weights must be arrays of the same length.");
    }
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight <= 0) {
        throw new Error("Total weight must be positive.");
    }
    const randomValue = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    for (let i = 0; i < choices.length; i++) {
        cumulativeWeight += weights[i];
        if (randomValue <= cumulativeWeight) {
            return choices[i];
        }
    }
    return choices[choices.length - 1]; // Should not be reached with valid inputs
} 