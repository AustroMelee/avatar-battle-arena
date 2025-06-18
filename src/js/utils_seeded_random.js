/**
 * @fileoverview Avatar Battle Arena - Seeded Random Number Generator
 * @description Deterministic pseudo-random number generation for reproducible battles
 * @version 2.0.0
 */

"use strict";

//# sourceURL=utils_seeded_random.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').ValidationResult} ValidationResult
 */

/**
 * @typedef {Object} RandomGeneratorState
 * @description State of the random number generator
 * @property {number} seed - Current seed value
 * @property {number} callCount - Number of random calls made
 * @property {boolean} isInitialized - Whether generator has been initialized
 */

// ============================================================================
// CONSTANTS & STATE
// ============================================================================

/** @type {number} */
const LCG_MULTIPLIER = 9301;

/** @type {number} */
const LCG_INCREMENT = 49297;

/** @type {number} */
const LCG_MODULUS = 233280;

/** @type {number} */
const DEFAULT_SEED = 1;

/** @type {number} */
let seed = DEFAULT_SEED;

/** @type {number} */
let callCount = 0;

// ============================================================================
// CORE RANDOM FUNCTIONS
// ============================================================================

/**
 * Initializes the seed for the deterministic random number generator
 * 
 * @param {number} newSeed - The seed value to use for random generation
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When newSeed is not a number
 * @throws {RangeError} When newSeed is not a finite positive integer
 * 
 * @example
 * // Set seed for reproducible random sequence
 * setSeed(12345);
 * const value1 = seededRandom(); // Will always be the same for seed 12345
 * 
 * @since 2.0.0
 * @public
 */
export function setSeed(newSeed) {
    // Input validation
    if (typeof newSeed !== "number") {
        throw new TypeError("setSeed: newSeed must be a number");
    }

    if (!Number.isFinite(newSeed)) {
        throw new RangeError("setSeed: newSeed must be finite");
    }

    if (newSeed < 1 || newSeed !== Math.floor(newSeed)) {
        throw new RangeError("setSeed: newSeed must be a positive integer");
    }

    seed = newSeed;
    callCount = 0;

    console.debug(`[Seeded Random] Seed set to ${newSeed}`);
}

/**
 * Generates a deterministic pseudo-random number between 0 (inclusive) and 1 (exclusive)
 * Uses a linear congruential generator (LCG) algorithm
 * 
 * @returns {number} A pseudo-random number between 0 and 1
 * 
 * @example
 * // Generate deterministic random values
 * setSeed(42);
 * const random1 = seededRandom(); // Always same value for seed 42
 * const random2 = seededRandom(); // Next value in sequence
 * 
 * @since 2.0.0
 * @public
 */
export function seededRandom() {
    // Update seed using LCG formula
    seed = (seed * LCG_MULTIPLIER + LCG_INCREMENT) % LCG_MODULUS;
    callCount++;

    /** @type {number} */
    const result = seed / LCG_MODULUS;

    // Ensure result is within expected range
    if (result < 0 || result >= 1) {
        console.warn(`[Seeded Random] Generated value out of range: ${result}`);
        return Math.max(0, Math.min(0.9999999, result));
    }

    return result;
}

/**
 * Gets a random element from an array using seeded or standard random generation
 * 
 * @param {Array<any>} arr - The array to select from
 * @param {boolean} [useSeeded=false] - Whether to use seeded random number generator
 * 
 * @returns {any | null} A random element from the array, or null if array is empty
 * 
 * @throws {TypeError} When arr is not an array
 * @throws {TypeError} When useSeeded is not a boolean
 * 
 * @example
 * // Get random element with seeded generator
 * const items = ['fire', 'water', 'earth', 'air'];
 * setSeed(123);
 * const element = getRandomElementSeeded(items, true);
 * 
 * @since 2.0.0
 * @public
 */
export function getRandomElementSeeded(arr, useSeeded = false) {
    // Input validation
    if (!Array.isArray(arr)) {
        throw new TypeError("getRandomElementSeeded: arr must be an array");
    }

    if (typeof useSeeded !== "boolean") {
        throw new TypeError("getRandomElementSeeded: useSeeded must be a boolean");
    }

    if (arr.length === 0) {
        return null;
    }

    /** @type {number} */
    const randomValue = useSeeded ? seededRandom() : Math.random();
    
    /** @type {number} */
    const randomIndex = Math.floor(randomValue * arr.length);

    // Defensive programming - ensure index is valid
    /** @type {number} */
    const safeIndex = Math.max(0, Math.min(arr.length - 1, randomIndex));

    return arr[safeIndex];
}

// ============================================================================
// UTILITY & STATE FUNCTIONS
// ============================================================================

/**
 * Gets the current state of the random number generator
 * 
 * @returns {RandomGeneratorState} Current generator state
 * 
 * @example
 * // Check generator state
 * const state = getGeneratorState();
 * console.log(`Seed: ${state.seed}, Calls: ${state.callCount}`);
 * 
 * @since 2.0.0
 * @public
 */
export function getGeneratorState() {
    return {
        seed,
        callCount,
        isInitialized: seed !== DEFAULT_SEED || callCount > 0
    };
}

/**
 * Resets the random number generator to its default state
 * 
 * @returns {void}
 * 
 * @example
 * // Reset to default state
 * resetGenerator();
 * const state = getGeneratorState(); // seed: 1, callCount: 0
 * 
 * @since 2.0.0
 * @public
 */
export function resetGenerator() {
    seed = DEFAULT_SEED;
    callCount = 0;
    console.debug("[Seeded Random] Generator reset to default state");
}

/**
 * Generates a seeded random integer within specified range
 * 
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @param {boolean} [useSeeded=true] - Whether to use seeded generator
 * 
 * @returns {number} Random integer between min and max (inclusive)
 * 
 * @throws {TypeError} When min or max are not numbers
 * @throws {RangeError} When min is greater than max
 * 
 * @example
 * // Generate random integer in range
 * setSeed(456);
 * const damage = randomIntInRange(10, 20, true); // 10-20 inclusive
 * 
 * @since 2.0.0
 * @public
 */
export function randomIntInRange(min, max, useSeeded = true) {
    // Input validation
    if (typeof min !== "number" || typeof max !== "number") {
        throw new TypeError("randomIntInRange: min and max must be numbers");
    }

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        throw new RangeError("randomIntInRange: min and max must be finite numbers");
    }

    if (min > max) {
        throw new RangeError("randomIntInRange: min cannot be greater than max");
    }

    /** @type {number} */
    const randomValue = useSeeded ? seededRandom() : Math.random();
    
    /** @type {number} */
    const range = max - min + 1;
    
    /** @type {number} */
    const result = Math.floor(randomValue * range) + min;

    // Defensive programming - clamp to valid range
    return Math.max(min, Math.min(max, result));
}

/**
 * Validates random generator configuration
 * 
 * @param {Object} config - Configuration to validate
 * @param {number} [config.seed] - Seed value
 * @param {boolean} [config.useSeeded] - Whether to use seeded generation
 * 
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * // Validate configuration
 * const result = validateRandomConfig({ seed: 123, useSeeded: true });
 * if (!result.isValid) {
 *   console.error('Invalid config:', result.errors);
 * }
 * 
 * @since 2.0.0
 * @public
 */
export function validateRandomConfig(config) {
    /** @type {string[]} */
    const errors = [];

    if (config && typeof config !== "object") {
        errors.push("Config must be an object");
    }

    if (config?.seed !== undefined) {
        if (typeof config.seed !== "number") {
            errors.push("Seed must be a number");
        } else if (!Number.isFinite(config.seed) || config.seed < 1 || config.seed !== Math.floor(config.seed)) {
            errors.push("Seed must be a positive integer");
        }
    }

    if (config?.useSeeded !== undefined && typeof config.useSeeded !== "boolean") {
        errors.push("useSeeded must be a boolean");
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings: []
    };
} 