/**
 * @fileoverview Avatar Battle Arena - Math Utilities
 * @description Core mathematical functions for calculations and number operations
 * @version 2.0.0
 */

'use strict';

//# sourceURL=utils_math.js

/**
 * Clamps a value between a minimum and maximum range
 * 
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * 
 * @returns {number} The clamped value
 * 
 * @throws {TypeError} When any parameter is not a number
 * @throws {RangeError} When min is greater than max
 * 
 * @example
 * // Basic clamping
 * clampValue(150, 0, 100); // Returns 100
 * clampValue(-10, 0, 100); // Returns 0
 * clampValue(50, 0, 100);  // Returns 50
 * 
 * @since 1.0.0
 * @public
 */
export function clampValue(value, min, max) {
    // Input validation
    if (typeof value !== 'number' || isNaN(value)) {
        throw new TypeError(`clampValue: value must be a valid number, received: ${typeof value} (${value})`);
    }
    
    if (typeof min !== 'number' || isNaN(min)) {
        throw new TypeError(`clampValue: min must be a valid number, received: ${typeof min} (${min})`);
    }
    
    if (typeof max !== 'number' || isNaN(max)) {
        throw new TypeError(`clampValue: max must be a valid number, received: ${typeof max} (${max})`);
    }
    
    if (min > max) {
        throw new RangeError(`clampValue: min (${min}) cannot be greater than max (${max})`);
    }
    
    return Math.min(Math.max(value, min), max);
}

/**
 * Calculates a percentage of a base value
 * 
 * @param {number} base - The base value
 * @param {number} percentage - The percentage (0-100)
 * 
 * @returns {number} The calculated percentage value
 * 
 * @throws {TypeError} When any parameter is not a number
 * @throws {RangeError} When percentage is negative
 * 
 * @example
 * // Calculate percentage
 * getPercentage(100, 25); // Returns 25 (25% of 100)
 * getPercentage(80, 50);  // Returns 40 (50% of 80)
 * 
 * @since 1.0.0
 * @public
 */
export function getPercentage(base, percentage) {
    // Input validation
    if (typeof base !== 'number' || isNaN(base)) {
        throw new TypeError(`getPercentage: base must be a valid number, received: ${typeof base} (${base})`);
    }
    
    if (typeof percentage !== 'number' || isNaN(percentage)) {
        throw new TypeError(`getPercentage: percentage must be a valid number, received: ${typeof percentage} (${percentage})`);
    }
    
    if (percentage < 0) {
        throw new RangeError(`getPercentage: percentage cannot be negative, received: ${percentage}`);
    }
    
    return (base * percentage) / 100;
}

/**
 * Checks if a value exceeds a given threshold
 * 
 * @param {number} value - The value to check
 * @param {number} threshold - The threshold value
 * @param {boolean} [isPercentage=false] - Whether threshold is a percentage
 * 
 * @returns {boolean} True if value exceeds threshold
 * 
 * @throws {TypeError} When value or threshold is not a number
 * @throws {TypeError} When isPercentage is not a boolean
 * 
 * @example
 * // Basic threshold checking
 * exceedsThreshold(75, 50);        // Returns true
 * exceedsThreshold(25, 50);        // Returns false
 * exceedsThreshold(75, 50, true);  // Returns true (75 > 50% of something)
 * 
 * @since 1.0.0
 * @public
 */
export function exceedsThreshold(value, threshold, isPercentage = false) {
    // Input validation
    if (typeof value !== 'number' || isNaN(value)) {
        throw new TypeError(`exceedsThreshold: value must be a valid number, received: ${typeof value} (${value})`);
    }
    
    if (typeof threshold !== 'number' || isNaN(threshold)) {
        throw new TypeError(`exceedsThreshold: threshold must be a valid number, received: ${typeof threshold} (${threshold})`);
    }
    
    if (typeof isPercentage !== 'boolean') {
        throw new TypeError(`exceedsThreshold: isPercentage must be a boolean, received: ${typeof isPercentage}`);
    }
    
    if (isPercentage) {
        /** @type {number} */
        const actualThreshold = getPercentage(100, threshold);
        return value > actualThreshold;
    }
    
    return value > threshold;
}

/**
 * Calculates the absolute difference between two numbers
 * 
 * @param {number} a - First number
 * @param {number} b - Second number
 * 
 * @returns {number} The absolute difference
 * 
 * @throws {TypeError} When any parameter is not a number
 * 
 * @example
 * // Calculate differences
 * absoluteDifference(10, 5);   // Returns 5
 * absoluteDifference(5, 10);   // Returns 5
 * absoluteDifference(-5, 5);   // Returns 10
 * 
 * @since 2.0.0
 * @public
 */
export function absoluteDifference(a, b) {
    // Input validation
    if (typeof a !== 'number' || isNaN(a)) {
        throw new TypeError(`absoluteDifference: a must be a valid number, received: ${typeof a} (${a})`);
    }
    
    if (typeof b !== 'number' || isNaN(b)) {
        throw new TypeError(`absoluteDifference: b must be a valid number, received: ${typeof b} (${b})`);
    }
    
    return Math.abs(a - b);
}

/**
 * Rounds a number to a specified number of decimal places
 * 
 * @param {number} value - The value to round
 * @param {number} [decimals=0] - Number of decimal places
 * 
 * @returns {number} The rounded value
 * 
 * @throws {TypeError} When value is not a number
 * @throws {TypeError} When decimals is not an integer
 * @throws {RangeError} When decimals is negative
 * 
 * @example
 * // Round numbers
 * roundToDecimals(3.14159, 2);  // Returns 3.14
 * roundToDecimals(3.14159, 0);  // Returns 3
 * roundToDecimals(3.14159);     // Returns 3 (default 0 decimals)
 * 
 * @since 2.0.0
 * @public
 */
export function roundToDecimals(value, decimals = 0) {
    // Input validation
    if (typeof value !== 'number' || isNaN(value)) {
        throw new TypeError(`roundToDecimals: value must be a valid number, received: ${typeof value} (${value})`);
    }
    
    if (!Number.isInteger(decimals) || decimals < 0) {
        throw new TypeError(`roundToDecimals: decimals must be a non-negative integer, received: ${decimals}`);
    }
    
    /** @type {number} */
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculates the average of an array of numbers
 * 
 * @param {number[]} numbers - Array of numbers to average
 * 
 * @returns {number} The average value
 * 
 * @throws {TypeError} When numbers is not an array
 * @throws {Error} When array is empty
 * @throws {TypeError} When array contains non-numbers
 * 
 * @example
 * // Calculate averages
 * average([1, 2, 3, 4, 5]);     // Returns 3
 * average([10, 20, 30]);        // Returns 20
 * average([100]);               // Returns 100
 * 
 * @since 2.0.0
 * @public
 */
export function average(numbers) {
    // Input validation
    if (!Array.isArray(numbers)) {
        throw new TypeError(`average: numbers must be an array, received: ${typeof numbers}`);
    }
    
    if (numbers.length === 0) {
        throw new Error('average: array cannot be empty');
    }
    
    // Validate all elements are numbers
    for (let i = 0; i < numbers.length; i++) {
        if (typeof numbers[i] !== 'number' || isNaN(numbers[i])) {
            throw new TypeError(`average: all elements must be valid numbers, found ${typeof numbers[i]} at index ${i}`);
        }
    }
    
    /** @type {number} */
    const sum = numbers.reduce((/** @type {number} */ acc, /** @type {number} */ num) => {
        return acc + num;
    }, 0);
    return sum / numbers.length;
}

/**
 * Generates a random number within a specified range
 * 
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * 
 * @returns {number} Random number within range
 * 
 * @throws {TypeError} When any parameter is not a number
 * @throws {RangeError} When min is greater than or equal to max
 * 
 * @example
 * // Generate random numbers
 * randomInRange(1, 10);    // Returns number between 1 and 9.999...
 * randomInRange(0, 1);     // Returns number between 0 and 0.999...
 * 
 * @since 2.0.0
 * @public
 */
export function randomInRange(min, max) {
    // Input validation
    if (typeof min !== 'number' || isNaN(min)) {
        throw new TypeError(`randomInRange: min must be a valid number, received: ${typeof min} (${min})`);
    }
    
    if (typeof max !== 'number' || isNaN(max)) {
        throw new TypeError(`randomInRange: max must be a valid number, received: ${typeof max} (${max})`);
    }
    
    if (min >= max) {
        throw new RangeError(`randomInRange: min (${min}) must be less than max (${max})`);
    }
    
    return Math.random() * (max - min) + min;
}

// Convenience alias for existing clamp function
export const clamp = clampValue; 