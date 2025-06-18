/**
 * @fileoverview Interpolation Utilities
 * @description Focused utilities for interpolation, easing, and geometric calculations
 * @version 1.0.0
 */

'use strict';

/**
 * Linear interpolation between two values.
 * 
 * Calculates a value between two points based on a parameter t.
 * When t = 0, returns start value. When t = 1, returns end value.
 * 
 * @param {number} start - The starting value
 * @param {number} end - The ending value
 * @param {number} t - The interpolation parameter (0-1)
 * 
 * @returns {number} The interpolated value
 * 
 * @throws {TypeError} If any parameter is not a number
 * 
 * @example
 * // Basic interpolation
 * lerp(0, 100, 0.5);   // Returns 50
 * lerp(10, 20, 0.3);   // Returns 13
 * 
 * @example
 * // Animation easing
 * const currentFrame = lerp(startPosition, endPosition, animationProgress);
 * 
 * @since 1.0.0
 */
export const lerp = (start, end, t) => {
    console.debug(`[Interpolation Utils] lerp(${start}, ${end}, ${t})`);
    
    // Input validation
    if (typeof start !== 'number' || isNaN(start)) {
        throw new TypeError(`lerp(): 'start' must be a valid number, received: ${typeof start} (${start})`);
    }
    
    if (typeof end !== 'number' || isNaN(end)) {
        throw new TypeError(`lerp(): 'end' must be a valid number, received: ${typeof end} (${end})`);
    }
    
    if (typeof t !== 'number' || isNaN(t)) {
        throw new TypeError(`lerp(): 't' must be a valid number, received: ${typeof t} (${t})`);
    }
    
    // Calculate interpolated value
    const result = start + (end - start) * t;
    
    console.debug(`[Interpolation Utils] lerp result: ${result}`);
    return result;
};

/**
 * Calculates the distance between two points in 2D space.
 * 
 * Uses the Pythagorean theorem to calculate Euclidean distance.
 * 
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * 
 * @returns {number} The distance between the two points
 * 
 * @throws {TypeError} If any parameter is not a number
 * 
 * @example
 * // Distance calculation
 * distance(0, 0, 3, 4);  // Returns 5
 * distance(1, 1, 4, 5);  // Returns 5
 * 
 * @since 1.0.0
 */
export const distance = (x1, y1, x2, y2) => {
    console.debug(`[Interpolation Utils] distance(${x1}, ${y1}, ${x2}, ${y2})`);
    
    // Input validation
    const coords = [x1, y1, x2, y2];
    const labels = ['x1', 'y1', 'x2', 'y2'];
    
    for (let i = 0; i < coords.length; i++) {
        if (typeof coords[i] !== 'number' || isNaN(coords[i])) {
            throw new TypeError(`distance(): '${labels[i]}' must be a valid number, received: ${typeof coords[i]} (${coords[i]})`);
        }
    }
    
    // Calculate distance using Pythagorean theorem
    const dx = x2 - x1;
    const dy = y2 - y1;
    const result = Math.sqrt(dx * dx + dy * dy);
    
    console.debug(`[Interpolation Utils] distance result: ${result}`);
    return result;
}; 