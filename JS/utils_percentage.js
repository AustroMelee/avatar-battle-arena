/**
 * @fileoverview Percentage Utilities
 * @description Focused utilities for percentage calculations and conversions
 * @version 1.0.0
 */

'use strict';

import { clamp } from './utils_number_validation.js';

/**
 * Converts a value to a percentage within a given range.
 * 
 * Calculates what percentage a value represents within a specified range.
 * Useful for health bars, progress indicators, and scaling calculations.
 * 
 * @param {number} value - The current value
 * @param {number} min - The minimum value of the range
 * @param {number} max - The maximum value of the range
 * @param {boolean} [clampResult=true] - Whether to clamp result to [0, 100]
 * 
 * @returns {number} The percentage (0-100) that value represents in the range
 * 
 * @throws {TypeError} If any numeric parameter is not a number
 * @throws {RangeError} If min >= max
 * 
 * @example
 * // Health percentage calculation
 * const healthPercent = toPercentage(75, 0, 100);  // Returns 75
 * 
 * @example
 * // Momentum percentage (with negative range)
 * const momentumPercent = toPercentage(25, -100, 100);  // Returns 62.5
 * 
 * @example
 * // Unclamped percentage (can exceed 100%)
 * const overflowPercent = toPercentage(150, 0, 100, false);  // Returns 150
 * 
 * @since 1.0.0
 */
export const toPercentage = (value, min, max, clampResult = true) => {
    console.debug(`[Percentage Utils] toPercentage(${value}, ${min}, ${max}, ${clampResult})`);
    
    // Input validation
    if (typeof value !== 'number' || isNaN(value)) {
        throw new TypeError(`toPercentage(): 'value' must be a valid number, received: ${typeof value} (${value})`);
    }
    
    if (typeof min !== 'number' || isNaN(min)) {
        throw new TypeError(`toPercentage(): 'min' must be a valid number, received: ${typeof min} (${min})`);
    }
    
    if (typeof max !== 'number' || isNaN(max)) {
        throw new TypeError(`toPercentage(): 'max' must be a valid number, received: ${typeof max} (${max})`);
    }
    
    if (min >= max) {
        throw new RangeError(`toPercentage(): 'min' (${min}) must be less than 'max' (${max})`);
    }
    
    // Calculate percentage
    const range = max - min;
    const normalizedValue = value - min;
    const percentage = (normalizedValue / range) * 100;
    
    const result = clampResult ? clamp(percentage, 0, 100) : percentage;
    
    console.debug(`[Percentage Utils] toPercentage result: ${result}%`);
    return result;
};

/**
 * Converts a percentage back to a value within a given range.
 * 
 * The inverse of toPercentage - takes a percentage and converts it back
 * to the corresponding value within the specified range.
 * 
 * @param {number} percentage - The percentage (0-100)
 * @param {number} min - The minimum value of the range
 * @param {number} max - The maximum value of the range
 * 
 * @returns {number} The value that corresponds to the percentage in the range
 * 
 * @example
 * // Convert health percentage to actual HP
 * const actualHP = fromPercentage(75, 0, 100);  // Returns 75
 * 
 * @example
 * // Convert momentum percentage to actual momentum
 * const actualMomentum = fromPercentage(62.5, -100, 100);  // Returns 25
 * 
 * @since 1.0.0
 */
export const fromPercentage = (percentage, min, max) => {
    console.debug(`[Percentage Utils] fromPercentage(${percentage}, ${min}, ${max})`);
    
    // Input validation
    if (typeof percentage !== 'number' || isNaN(percentage)) {
        throw new TypeError(`fromPercentage(): 'percentage' must be a valid number, received: ${typeof percentage} (${percentage})`);
    }
    
    if (typeof min !== 'number' || isNaN(min)) {
        throw new TypeError(`fromPercentage(): 'min' must be a valid number, received: ${typeof min} (${min})`);
    }
    
    if (typeof max !== 'number' || isNaN(max)) {
        throw new TypeError(`fromPercentage(): 'max' must be a valid number, received: ${typeof max} (${max})`);
    }
    
    if (min >= max) {
        throw new RangeError(`fromPercentage(): 'min' (${min}) must be less than 'max' (${max})`);
    }
    
    // Calculate value from percentage
    const range = max - min;
    const result = min + (percentage / 100) * range;
    
    console.debug(`[Percentage Utils] fromPercentage result: ${result}`);
    return result;
}; 