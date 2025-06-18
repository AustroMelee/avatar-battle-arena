/**
 * @fileoverview Avatar Battle Arena - Random Number Generation Utilities
 * @description Provides secure random number generation with validation and seeding support
 * @version 2.0.0
 */

'use strict';

//# sourceURL=utils_random.js

// ============================================================================
// RANDOM NUMBER GENERATION UTILITIES
// ============================================================================

/**
 * Generates a random integer between min and max (inclusive)
 * 
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * 
 * @returns {number} Random integer between min and max
 * 
 * @throws {TypeError} When min or max are not numbers
 * @throws {RangeError} When min is greater than max
 * 
 * @example
 * // Generate random integers
 * const dice = randomInt(1, 6); // 1-6
 * const damage = randomInt(10, 20); // 10-20
 * 
 * @since 2.0.0
 * @public
 */
export function randomInt(min, max) {
    // Input validation
    if (typeof min !== 'number' || isNaN(min)) {
        throw new TypeError('randomInt: min must be a valid number');
    }
    
    if (typeof max !== 'number' || isNaN(max)) {
        throw new TypeError('randomInt: max must be a valid number');
    }
    
    if (!Number.isInteger(min)) {
        throw new TypeError('randomInt: min must be an integer');
    }
    
    if (!Number.isInteger(max)) {
        throw new TypeError('randomInt: max must be an integer');
    }
    
    if (min > max) {
        throw new RangeError(`randomInt: min (${min}) cannot be greater than max (${max})`);
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min and max
 * 
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @param {number} [precision=2] - Number of decimal places to round to
 * 
 * @returns {number} Random float between min and max
 * 
 * @throws {TypeError} When parameters are not numbers
 * @throws {RangeError} When min is greater than or equal to max
 * @throws {RangeError} When precision is out of range
 * 
 * @example
 * // Generate random floats
 * const multiplier = randomFloat(0.5, 1.5); // 0.5-1.5
 * const precise = randomFloat(0, 1, 4); // 0.0000-0.9999
 * 
 * @since 2.0.0
 * @public
 */
export function randomFloat(min, max, precision = 2) {
    // Input validation
    if (typeof min !== 'number' || isNaN(min)) {
        throw new TypeError('randomFloat: min must be a valid number');
    }
    
    if (typeof max !== 'number' || isNaN(max)) {
        throw new TypeError('randomFloat: max must be a valid number');
    }
    
    if (typeof precision !== 'number' || isNaN(precision) || !Number.isInteger(precision)) {
        throw new TypeError('randomFloat: precision must be a valid integer');
    }
    
    if (min >= max) {
        throw new RangeError(`randomFloat: min (${min}) must be less than max (${max})`);
    }
    
    if (precision < 0 || precision > 10) {
        throw new RangeError(`randomFloat: precision must be between 0 and 10, received: ${precision}`);
    }

    /** @type {number} */
    const randomValue = Math.random() * (max - min) + min;
    
    return Number(randomValue.toFixed(precision));
}

/**
 * Returns true with the specified probability
 * 
 * @param {number} probability - Probability of returning true (0.0 to 1.0)
 * 
 * @returns {boolean} True if random value is less than probability
 * 
 * @throws {TypeError} When probability is not a number
 * @throws {RangeError} When probability is outside valid range
 * 
 * @example
 * // Probability checks
 * const critical = randomChance(0.15); // 15% chance
 * const coinFlip = randomChance(0.5); // 50% chance
 * 
 * @since 2.0.0
 * @public
 */
export function randomChance(probability) {
    // Input validation
    if (typeof probability !== 'number' || isNaN(probability)) {
        throw new TypeError('randomChance: probability must be a valid number');
    }
    
    if (probability < 0 || probability > 1) {
        throw new RangeError(`randomChance: probability must be between 0 and 1, received: ${probability}`);
    }

    return Math.random() < probability;
}

/**
 * Randomly selects an element from an array
 * 
 * @param {any[]} array - Array to select from
 * 
 * @returns {any} Randomly selected element from array
 * 
 * @throws {TypeError} When array is not an array
 * @throws {Error} When array is empty
 * 
 * @example
 * // Random selection
 * const moves = ['attack', 'defend', 'special'];
 * const selectedMove = randomChoice(moves);
 * 
 * @since 2.0.0
 * @public
 */
export function randomChoice(array) {
    // Input validation
    if (!Array.isArray(array)) {
        throw new TypeError('randomChoice: first argument must be an array');
    }
    
    if (array.length === 0) {
        throw new Error('randomChoice: array cannot be empty');
    }

    /** @type {number} */
    const randomIndex = randomInt(0, array.length - 1);
    
    return array[randomIndex];
}

/**
 * Randomly shuffles an array using Fisher-Yates algorithm
 * 
 * @param {any[]} array - Array to shuffle (not modified)
 * 
 * @returns {any[]} New shuffled array
 * 
 * @throws {TypeError} When array is not an array
 * 
 * @example
 * // Shuffle array
 * const deck = [1, 2, 3, 4, 5];
 * const shuffled = randomShuffle(deck);
 * 
 * @since 2.0.0
 * @public
 */
export function randomShuffle(array) {
    // Input validation
    if (!Array.isArray(array)) {
        throw new TypeError('randomShuffle: first argument must be an array');
    }

    /** @type {any[]} */
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        /** @type {number} */
        const j = randomInt(0, i);
        
        // Swap elements
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

/**
 * Generates multiple random choices without replacement
 * 
 * @param {any[]} array - Array to select from
 * @param {number} count - Number of elements to select
 * 
 * @returns {any[]} Array of randomly selected elements
 * 
 * @throws {TypeError} When array is not an array or count is not a number
 * @throws {RangeError} When count is greater than array length or negative
 * 
 * @example
 * // Select multiple random elements
 * const characters = ['aang', 'katara', 'toph', 'sokka'];
 * const team = randomSample(characters, 2); // Select 2 characters
 * 
 * @since 2.0.0
 * @public
 */
export function randomSample(array, count) {
    // Input validation
    if (!Array.isArray(array)) {
        throw new TypeError('randomSample: first argument must be an array');
    }
    
    if (typeof count !== 'number' || isNaN(count) || !Number.isInteger(count)) {
        throw new TypeError('randomSample: count must be a valid integer');
    }
    
    if (count < 0) {
        throw new RangeError('randomSample: count cannot be negative');
    }
    
    if (count > array.length) {
        throw new RangeError(`randomSample: count (${count}) cannot be greater than array length (${array.length})`);
    }

    if (count === 0) {
        return [];
    }
    
    if (count === array.length) {
        return [...array];
    }

    /** @type {any[]} */
    const shuffled = randomShuffle(array);
    
    return shuffled.slice(0, count);
}

/**
 * Generates a weighted random choice
 * 
 * @param {any[]} choices - Array of choices
 * @param {number[]} weights - Array of weights corresponding to choices
 * 
 * @returns {any} Weighted random choice
 * 
 * @throws {TypeError} When choices or weights are not arrays
 * @throws {Error} When arrays have different lengths or weights are invalid
 * 
 * @example
 * // Weighted random selection
 * const moves = ['basic', 'special', 'ultimate'];
 * const weights = [0.7, 0.25, 0.05]; // 70%, 25%, 5%
 * const selectedMove = weightedRandomChoice(moves, weights);
 * 
 * @since 2.0.0
 * @public
 */
export function weightedRandomChoice(choices, weights) {
    // Input validation
    if (!Array.isArray(choices)) {
        throw new TypeError('weightedRandomChoice: choices must be an array');
    }
    
    if (!Array.isArray(weights)) {
        throw new TypeError('weightedRandomChoice: weights must be an array');
    }
    
    if (choices.length === 0) {
        throw new Error('weightedRandomChoice: choices array cannot be empty');
    }
    
    if (choices.length !== weights.length) {
        throw new Error('weightedRandomChoice: choices and weights arrays must have the same length');
    }

    // Validate weights
    for (let i = 0; i < weights.length; i++) {
        if (typeof weights[i] !== 'number' || isNaN(weights[i]) || weights[i] < 0) {
            throw new Error(`weightedRandomChoice: all weights must be non-negative numbers, invalid weight at index ${i}: ${weights[i]}`);
        }
    }

    /** @type {number} */
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    if (totalWeight === 0) {
        throw new Error('weightedRandomChoice: total weight cannot be zero');
    }

    /** @type {number} */
    const randomValue = Math.random() * totalWeight;
    
    /** @type {number} */
    let cumulativeWeight = 0;

    for (let i = 0; i < choices.length; i++) {
        cumulativeWeight += weights[i];
        
        if (randomValue <= cumulativeWeight) {
            return choices[i];
        }
    }

    // Fallback (should never reach here with valid inputs)
    return choices[choices.length - 1];
}

/**
 * Generates a random string of specified length
 * 
 * @param {number} length - Length of string to generate
 * @param {string} [characters='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'] - Characters to choose from
 * 
 * @returns {string} Random string of specified length
 * 
 * @throws {TypeError} When length is not a number or characters is not a string
 * @throws {RangeError} When length is negative or characters is empty
 * 
 * @example
 * // Generate random strings
 * const id = randomString(8); // 8-character alphanumeric
 * const hex = randomString(16, '0123456789ABCDEF'); // 16-character hex
 * 
 * @since 2.0.0
 * @public
 */
export function randomString(length, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    // Input validation
    if (typeof length !== 'number' || isNaN(length) || !Number.isInteger(length)) {
        throw new TypeError('randomString: length must be a valid integer');
    }
    
    if (typeof characters !== 'string') {
        throw new TypeError('randomString: characters must be a string');
    }
    
    if (length < 0) {
        throw new RangeError('randomString: length cannot be negative');
    }
    
    if (characters.length === 0) {
        throw new RangeError('randomString: characters string cannot be empty');
    }

    if (length === 0) {
        return '';
    }

    /** @type {string} */
    let result = '';

    for (let i = 0; i < length; i++) {
        /** @type {number} */
        const randomIndex = randomInt(0, characters.length - 1);
        result += characters[randomIndex];
    }

    return result;
}

/**
 * Generates a random UUID v4 string
 * 
 * @returns {string} Random UUID v4 string
 * 
 * @example
 * // Generate UUID
 * const id = randomUUID(); // e.g., "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * 
 * @since 2.0.0
 * @public
 */
export function randomUUID() {
    /** @type {string} */
    const hexChars = '0123456789abcdef';
    
    /** @type {string} */
    let uuid = '';

    for (let i = 0; i < 32; i++) {
        if (i === 8 || i === 12 || i === 16 || i === 20) {
            uuid += '-';
        }
        
        if (i === 12) {
            uuid += '4'; // Version 4
        } else if (i === 16) {
            uuid += hexChars[randomInt(8, 11)]; // Variant bits
        } else {
            uuid += hexChars[randomInt(0, 15)];
        }
    }

    return uuid;
}

/**
 * Applies normal distribution to a random value using Box-Muller transform
 * 
 * @param {number} [mean=0] - Mean of the distribution
 * @param {number} [standardDeviation=1] - Standard deviation of the distribution
 * 
 * @returns {number} Normally distributed random value
 * 
 * @throws {TypeError} When mean or standardDeviation are not numbers
 * @throws {RangeError} When standardDeviation is not positive
 * 
 * @example
 * // Generate normal distribution values
 * const damage = randomNormal(50, 10); // Mean 50, std dev 10
 * const accuracy = randomNormal(0.8, 0.1); // Mean 80%, std dev 10%
 * 
 * @since 2.0.0
 * @public
 */
export function randomNormal(mean = 0, standardDeviation = 1) {
    // Input validation
    if (typeof mean !== 'number' || isNaN(mean)) {
        throw new TypeError('randomNormal: mean must be a valid number');
    }
    
    if (typeof standardDeviation !== 'number' || isNaN(standardDeviation)) {
        throw new TypeError('randomNormal: standardDeviation must be a valid number');
    }
    
    if (standardDeviation <= 0) {
        throw new RangeError('randomNormal: standardDeviation must be positive');
    }

    // Box-Muller transform
    /** @type {number} */
    const u1 = Math.random();
    /** @type {number} */
    const u2 = Math.random();
    
    /** @type {number} */
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    return z0 * standardDeviation + mean;
}

/**
 * Seeds the Math.random function (Note: This doesn't actually seed Math.random)
 * For true seeded random, use utils_seeded_random.js instead
 * 
 * @param {number} seed - Seed value (not actually used by Math.random)
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When seed is not a number
 * 
 * @deprecated Use utils_seeded_random.js for deterministic random generation
 * 
 * @since 2.0.0
 * @public
 */
export function seedRandom(seed) {
    // Input validation
    if (typeof seed !== 'number' || isNaN(seed)) {
        throw new TypeError('seedRandom: seed must be a valid number');
    }

    console.warn('[Random Utils] seedRandom does not affect Math.random. Use utils_seeded_random.js for deterministic randomness.');
    
    // This function exists for API compatibility but doesn't actually seed Math.random
    // JavaScript's Math.random() cannot be seeded - use a separate PRNG for that
} 