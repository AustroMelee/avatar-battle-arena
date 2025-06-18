/**
 * @fileoverview Avatar Battle Arena - Interpolation Utilities
 * @description Focused utilities for interpolation, easing, and geometric calculations
 * @version 2.0.0
 */

'use strict';

//# sourceURL=utils_interpolation.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').ValidationResult} ValidationResult
 */

/**
 * @typedef {Object} Point2D
 * @description 2D point coordinates
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @typedef {Object} InterpolationConfig
 * @description Configuration for interpolation operations
 * @property {boolean} clampT - Whether to clamp t parameter to [0, 1] range
 * @property {number} precision - Number of decimal places for result precision
 * @property {boolean} enableDebugLogging - Whether to log debug information
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {number} */
const DEFAULT_PRECISION = 10;

/** @type {number} */
const INTERPOLATION_TOLERANCE = 1e-10;

/** @type {number} */
const MAX_COORDINATE_VALUE = 1e6;

// ============================================================================
// CORE INTERPOLATION FUNCTIONS
// ============================================================================

/**
 * Linear interpolation between two values
 * 
 * Calculates a value between two points based on a parameter t.
 * When t = 0, returns start value. When t = 1, returns end value.
 * 
 * @param {number} start - The starting value
 * @param {number} end - The ending value
 * @param {number} t - The interpolation parameter (typically 0-1)
 * @param {InterpolationConfig} [config] - Optional interpolation configuration
 * 
 * @returns {number} The interpolated value
 * 
 * @throws {TypeError} If any parameter is not a number
 * @throws {RangeError} If values are outside reasonable bounds
 * 
 * @example
 * // Basic interpolation
 * lerp(0, 100, 0.5);   // Returns 50
 * lerp(10, 20, 0.3);   // Returns 13
 * 
 * // Animation easing
 * const currentFrame = lerp(startPosition, endPosition, animationProgress);
 * 
 * // With configuration
 * const result = lerp(0, 100, 1.5, { clampT: true }); // Returns 100 (clamped)
 * 
 * @since 2.0.0
 * @public
 */
export function lerp(start, end, t, config = {}) {
    // Input validation
    if (typeof start !== 'number' || isNaN(start)) {
        throw new TypeError(`lerp: 'start' must be a valid number, received: ${typeof start} (${start})`);
    }
    
    if (typeof end !== 'number' || isNaN(end)) {
        throw new TypeError(`lerp: 'end' must be a valid number, received: ${typeof end} (${end})`);
    }
    
    if (typeof t !== 'number' || isNaN(t)) {
        throw new TypeError(`lerp: 't' must be a valid number, received: ${typeof t} (${t})`);
    }

    if (typeof config !== 'object' || config === null) {
        throw new TypeError('lerp: config must be an object');
    }

    // Range validation
    if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(t)) {
        throw new RangeError('lerp: all parameters must be finite numbers');
    }

    /** @type {InterpolationConfig} */
    const finalConfig = {
        clampT: false,
        precision: DEFAULT_PRECISION,
        enableDebugLogging: false,
        ...config
    };

    if (finalConfig.enableDebugLogging) {
        console.debug(`[Interpolation] lerp(${start}, ${end}, ${t})`);
    }

    /** @type {number} */
    let finalT = t;

    // Clamp t if configured
    if (finalConfig.clampT) {
        finalT = Math.max(0, Math.min(1, t));
        if (finalT !== t && finalConfig.enableDebugLogging) {
            console.debug(`[Interpolation] t clamped from ${t} to ${finalT}`);
        }
    }
    
    // Calculate interpolated value
    /** @type {number} */
    const result = start + (end - start) * finalT;

    // Apply precision if specified
    /** @type {number} */
    const finalResult = finalConfig.precision > 0 ? 
        Number(result.toFixed(finalConfig.precision)) : result;

    if (finalConfig.enableDebugLogging) {
        console.debug(`[Interpolation] lerp result: ${finalResult}`);
    }

    return finalResult;
}

/**
 * Calculates the distance between two points in 2D space
 * 
 * Uses the Pythagorean theorem to calculate Euclidean distance.
 * 
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @param {InterpolationConfig} [config] - Optional configuration
 * 
 * @returns {number} The distance between the two points
 * 
 * @throws {TypeError} If any parameter is not a number
 * @throws {RangeError} If coordinates are outside reasonable bounds
 * 
 * @example
 * // Distance calculation
 * distance(0, 0, 3, 4);  // Returns 5
 * distance(1, 1, 4, 5);  // Returns 5
 * 
 * // With configuration
 * const dist = distance(0, 0, 3.14159, 4.71239, { precision: 2 }); // Returns 5.66
 * 
 * @since 2.0.0
 * @public
 */
export function distance(x1, y1, x2, y2, config = {}) {
    // Input validation
    /** @type {number[]} */
    const coords = [x1, y1, x2, y2];
    /** @type {string[]} */
    const labels = ['x1', 'y1', 'x2', 'y2'];
    
    for (let i = 0; i < coords.length; i++) {
        if (typeof coords[i] !== 'number' || isNaN(coords[i])) {
            throw new TypeError(`distance: '${labels[i]}' must be a valid number, received: ${typeof coords[i]} (${coords[i]})`);
        }

        if (!Number.isFinite(coords[i])) {
            throw new RangeError(`distance: '${labels[i]}' must be a finite number`);
        }

        if (Math.abs(coords[i]) > MAX_COORDINATE_VALUE) {
            throw new RangeError(`distance: '${labels[i]}' is outside reasonable bounds (±${MAX_COORDINATE_VALUE})`);
        }
    }

    if (typeof config !== 'object' || config === null) {
        throw new TypeError('distance: config must be an object');
    }

    /** @type {InterpolationConfig} */
    const finalConfig = {
        precision: DEFAULT_PRECISION,
        enableDebugLogging: false,
        ...config
    };

    if (finalConfig.enableDebugLogging) {
        console.debug(`[Interpolation] distance(${x1}, ${y1}, ${x2}, ${y2})`);
    }
    
    // Calculate distance using Pythagorean theorem
    /** @type {number} */
    const dx = x2 - x1;
    /** @type {number} */
    const dy = y2 - y1;
    /** @type {number} */
    const result = Math.sqrt(dx * dx + dy * dy);

    // Apply precision if specified
    /** @type {number} */
    const finalResult = finalConfig.precision > 0 ? 
        Number(result.toFixed(finalConfig.precision)) : result;

    if (finalConfig.enableDebugLogging) {
        console.debug(`[Interpolation] distance result: ${finalResult}`);
    }

    return finalResult;
}

// ============================================================================
// ADVANCED INTERPOLATION FUNCTIONS
// ============================================================================

/**
 * Smooth interpolation using smoothstep function
 * 
 * @param {number} start - The starting value
 * @param {number} end - The ending value
 * @param {number} t - The interpolation parameter (0-1)
 * 
 * @returns {number} The smoothly interpolated value
 * 
 * @throws {TypeError} When parameters are invalid
 * 
 * @example
 * // Smooth interpolation for easing
 * const smoothValue = smoothstep(0, 100, 0.5); // Smoother than linear
 * 
 * @since 2.0.0
 * @public
 */
export function smoothstep(start, end, t) {
    // Input validation
    if (typeof start !== 'number' || !Number.isFinite(start)) {
        throw new TypeError('smoothstep: start must be a finite number');
    }

    if (typeof end !== 'number' || !Number.isFinite(end)) {
        throw new TypeError('smoothstep: end must be a finite number');
    }

    if (typeof t !== 'number' || !Number.isFinite(t)) {
        throw new TypeError('smoothstep: t must be a finite number');
    }

    // Clamp t to [0, 1]
    /** @type {number} */
    const clampedT = Math.max(0, Math.min(1, t));

    // Apply smoothstep function: 3t² - 2t³
    /** @type {number} */
    const smoothT = clampedT * clampedT * (3 - 2 * clampedT);

    return lerp(start, end, smoothT);
}

/**
 * Calculates normalized direction vector between two points
 * 
 * @param {Point2D} from - Starting point
 * @param {Point2D} to - Ending point
 * 
 * @returns {Point2D} Normalized direction vector
 * 
 * @throws {TypeError} When points are invalid
 * @throws {Error} When points are identical (zero-length vector)
 * 
 * @example
 * // Get direction from one point to another
 * const direction = getDirection({ x: 0, y: 0 }, { x: 3, y: 4 });
 * console.log(direction); // { x: 0.6, y: 0.8 }
 * 
 * @since 2.0.0
 * @public
 */
export function getDirection(from, to) {
    // Input validation
    if (!from || typeof from !== 'object') {
        throw new TypeError('getDirection: from must be a point object');
    }

    if (!to || typeof to !== 'object') {
        throw new TypeError('getDirection: to must be a point object');
    }

    if (typeof from.x !== 'number' || typeof from.y !== 'number') {
        throw new TypeError('getDirection: from must have numeric x and y properties');
    }

    if (typeof to.x !== 'number' || typeof to.y !== 'number') {
        throw new TypeError('getDirection: to must have numeric x and y properties');
    }

    /** @type {number} */
    const dx = to.x - from.x;
    /** @type {number} */
    const dy = to.y - from.y;
    /** @type {number} */
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < INTERPOLATION_TOLERANCE) {
        throw new Error('getDirection: points are too close together (zero-length vector)');
    }

    return {
        x: dx / length,
        y: dy / length
    };
}

/**
 * Validates interpolation configuration
 * 
 * @param {InterpolationConfig} config - Configuration to validate
 * 
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * // Validate configuration
 * const result = validateInterpolationConfig({
 *   clampT: true,
 *   precision: 3
 * });
 * 
 * @since 2.0.0
 * @public
 */
export function validateInterpolationConfig(config) {
    /** @type {string[]} */
    const errors = [];
    /** @type {string[]} */
    const warnings = [];

    if (!config || typeof config !== 'object') {
        errors.push('Config must be an object');
        return { isValid: false, errors, warnings };
    }

    if (config.clampT !== undefined && typeof config.clampT !== 'boolean') {
        errors.push('clampT must be a boolean');
    }

    if (config.precision !== undefined) {
        if (typeof config.precision !== 'number') {
            errors.push('precision must be a number');
        } else if (!Number.isInteger(config.precision) || config.precision < 0) {
            errors.push('precision must be a non-negative integer');
        } else if (config.precision > 15) {
            warnings.push('precision > 15 may cause floating point issues');
        }
    }

    if (config.enableDebugLogging !== undefined && typeof config.enableDebugLogging !== 'boolean') {
        errors.push('enableDebugLogging must be a boolean');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
} 