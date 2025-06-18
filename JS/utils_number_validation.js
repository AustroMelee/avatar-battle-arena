/**
 * @fileoverview Number Validation Utilities
 * @description Focused utilities for number validation, clamping, and range checking
 * @version 1.0.0
 */

'use strict';

/**
 * Clamps a number within a specified range.
 * 
 * Ensures that a number falls within the specified minimum and maximum bounds.
 * If the number is below the minimum, returns the minimum. If above the maximum,
 * returns the maximum. Otherwise, returns the original number.
 * 
 * @param {number} num - The number to clamp
 * @param {number} min - The minimum allowed value (inclusive)
 * @param {number} max - The maximum allowed value (inclusive)
 * 
 * @returns {number} The clamped value within [min, max] range
 * 
 * @throws {TypeError} If any parameter is not a number
 * @throws {RangeError} If min > max
 * 
 * @example
 * // Basic clamping
 * clamp(5, 0, 10);    // Returns 5
 * clamp(-5, 0, 10);   // Returns 0
 * clamp(15, 0, 10);   // Returns 10
 * 
 * @example
 * // Health point validation
 * const newHP = clamp(calculatedHP, 0, 100);
 * 
 * @example
 * // Momentum range enforcement
 * const momentum = clamp(currentMomentum, -100, 100);
 * 
 * @since 1.0.0
 */
export const clamp = (num, min, max) => {
    // Input validation with comprehensive error checking
    if (typeof num !== 'number' || isNaN(num)) {
        const error = new TypeError(`clamp(): 'num' must be a valid number, received: ${typeof num} (${num})`);
        console.error(`[Number Validation] ${error.message}`);
        throw error;
    }
    
    if (typeof min !== 'number' || isNaN(min)) {
        const error = new TypeError(`clamp(): 'min' must be a valid number, received: ${typeof min} (${min})`);
        console.error(`[Number Validation] ${error.message}`);
        throw error;
    }
    
    if (typeof max !== 'number' || isNaN(max)) {
        const error = new TypeError(`clamp(): 'max' must be a valid number, received: ${typeof max} (${max})`);
        console.error(`[Number Validation] ${error.message}`);
        throw error;
    }
    
    if (min > max) {
        const error = new RangeError(`clamp(): 'min' (${min}) cannot be greater than 'max' (${max})`);
        console.error(`[Number Validation] ${error.message}`);
        throw error;
    }
    
    const result = Math.min(Math.max(num, min), max);
    
    // Debug logging for development
    if (result !== num) {
        console.debug(`[Number Validation] clamp(${num}, ${min}, ${max}) = ${result} (clamped)`);
    }
    
    return result;
};

/**
 * Checks if a number is within a specified range (inclusive).
 * 
 * @param {number} num - The number to check
 * @param {number} min - The minimum value (inclusive)
 * @param {number} max - The maximum value (inclusive)
 * 
 * @returns {boolean} True if the number is within the range
 * 
 * @throws {TypeError} If any parameter is not a number
 * 
 * @example
 * // Range checking
 * inRange(5, 0, 10);   // Returns true
 * inRange(-1, 0, 10);  // Returns false
 * inRange(15, 0, 10);  // Returns false
 * 
 * @since 1.0.0
 */
export const inRange = (num, min, max) => {
    console.debug(`[Number Validation] inRange(${num}, ${min}, ${max})`);
    
    // Input validation
    if (typeof num !== 'number' || isNaN(num)) {
        throw new TypeError(`inRange(): 'num' must be a valid number, received: ${typeof num} (${num})`);
    }
    
    if (typeof min !== 'number' || isNaN(min)) {
        throw new TypeError(`inRange(): 'min' must be a valid number, received: ${typeof min} (${min})`);
    }
    
    if (typeof max !== 'number' || isNaN(max)) {
        throw new TypeError(`inRange(): 'max' must be a valid number, received: ${typeof max} (${max})`);
    }
    
    if (min > max) {
        throw new RangeError(`inRange(): 'min' (${min}) cannot be greater than 'max' (${max})`);
    }
    
    const result = num >= min && num <= max;
    
    console.debug(`[Number Validation] inRange result: ${result}`);
    return result;
};

/**
 * Rounds a number to a specified number of decimal places.
 * 
 * @param {number} num - The number to round
 * @param {number} [decimals=2] - Number of decimal places
 * 
 * @returns {number} The rounded number
 * 
 * @throws {TypeError} If num is not a number or decimals is not an integer
 * 
 * @example
 * roundTo(3.14159, 2);  // Returns 3.14
 * roundTo(3.14159, 0);  // Returns 3
 * roundTo(3.14159);     // Returns 3.14 (default 2 decimals)
 * 
 * @since 1.0.0
 */
export const roundTo = (num, decimals = 2) => {
    console.debug(`[Number Validation] roundTo(${num}, ${decimals})`);
    
    // Input validation
    if (typeof num !== 'number' || isNaN(num)) {
        throw new TypeError(`roundTo(): 'num' must be a valid number, received: ${typeof num} (${num})`);
    }
    
    if (!Number.isInteger(decimals) || decimals < 0) {
        throw new TypeError(`roundTo(): 'decimals' must be a non-negative integer, received: ${decimals}`);
    }
    
    const multiplier = Math.pow(10, decimals);
    const result = Math.round(num * multiplier) / multiplier;
    
    console.debug(`[Number Validation] roundTo result: ${result}`);
    return result;
}; 