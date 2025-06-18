/**
 * @fileoverview Random Number Utilities
 * @description Focused utilities for random number generation
 * @version 1.0.0
 */

'use strict';

/**
 * Generates a random number within a specified range.
 * 
 * @param {number} min - The minimum value (inclusive)
 * @param {number} max - The maximum value (exclusive)
 * 
 * @returns {number} A random number between min (inclusive) and max (exclusive)
 * 
 * @throws {TypeError} If any parameter is not a number
 * @throws {RangeError} If min >= max
 * 
 * @example
 * // Generate random damage variance
 * const damage = randomRange(10, 20);  // Returns 10-19.999...
 * 
 * @example
 * // Generate random percentage
 * const chance = randomRange(0, 100);  // Returns 0-99.999...
 * 
 * @since 1.0.0
 */
export const randomRange = (min, max) => {
    console.debug(`[Random Utils] randomRange(${min}, ${max})`);
    
    // Input validation
    if (typeof min !== 'number' || isNaN(min)) {
        throw new TypeError(`randomRange(): 'min' must be a valid number, received: ${typeof min} (${min})`);
    }
    
    if (typeof max !== 'number' || isNaN(max)) {
        throw new TypeError(`randomRange(): 'max' must be a valid number, received: ${typeof max} (${max})`);
    }
    
    if (min >= max) {
        throw new RangeError(`randomRange(): 'min' (${min}) must be less than 'max' (${max})`);
    }
    
    // Generate random number in range
    const result = Math.random() * (max - min) + min;
    
    console.debug(`[Random Utils] randomRange result: ${result}`);
    return result;
}; 