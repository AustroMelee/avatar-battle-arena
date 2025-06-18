/**
 * @fileoverview Numeric random generation utilities.
 */

"use strict";

/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
        throw new TypeError("min and max must be integers.");
    }
    if (min > max) {
        throw new RangeError("min cannot be greater than max.");
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min and max.
 * @param {number} min
 * @param {number} max
 * @param {number} [precision=2]
 * @returns {number}
 */
export function randomFloat(min, max, precision = 2) {
    if (typeof min !== "number" || typeof max !== "number") {
        throw new TypeError("min and max must be numbers.");
    }
    if (min >= max) {
        throw new RangeError("min must be less than max.");
    }
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(precision));
}

/**
 * Generates a normally distributed random number (Box-Muller transform).
 * @param {number} [mean=0]
 * @param {number} [stdDev=1]
 * @returns {number}
 */
export function randomNormal(mean = 0, stdDev = 1) {
    if (stdDev <= 0) {
        throw new RangeError("Standard deviation must be positive.");
    }
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
} 