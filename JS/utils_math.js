/**
 * @fileoverview Mathematical Utility Functions (Compatibility Layer)
 * @description Compatibility layer that re-exports focused math utilities
 * 
 * This module maintains backward compatibility while delegating to focused modules:
 * - Number validation utilities (utils_number_validation.js)
 * - Percentage calculations (utils_percentage.js)
 * - Interpolation functions (utils_interpolation.js)
 * - Random number generation (utils_random.js)
 * 
 * @version 2.0.0 - Refactored to modular architecture
 * @author Battle Arena Development Team
 * @since 1.0.0
 */

'use strict';

// Import from focused modules
import { clamp, inRange, roundTo } from './utils_number_validation.js';
import { toPercentage, fromPercentage } from './utils_percentage.js';
import { lerp, distance } from './utils_interpolation.js';
import { randomRange } from './utils_random.js';

// Re-export all functions for backward compatibility
export { clamp, inRange, roundTo } from './utils_number_validation.js';
export { toPercentage, fromPercentage } from './utils_percentage.js';
export { lerp, distance } from './utils_interpolation.js';
export { randomRange } from './utils_random.js';

// Legacy helper functions maintained in this file for backward compatibility
export function clampValue(value, min, max) {
    return clamp(value, min, max);
}

export function getPercentage(base, percentage) {
    return fromPercentage(percentage, 0, base);
}

export function exceedsThreshold(value, threshold, isPercentage = false) {
    if (isPercentage) {
        return (value >= threshold);
    }
    return (value >= threshold);
} 