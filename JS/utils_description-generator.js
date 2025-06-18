/**
 * @fileoverview Avatar Battle Arena - Description Generation Utilities
 * @description Converts numerical modifiers to human-readable battle condition descriptions
 * @version 2.0.0
 */

'use strict';

//# sourceURL=utils_description-generator.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').ValidationResult} ValidationResult
 */

/**
 * @typedef {'damage' | 'energy'} ModifierType
 * @description Valid modifier types for description generation
 */

/**
 * @typedef {Object} ModifierRange
 * @description Range definition for modifier descriptions
 * @property {number} min - Minimum value (inclusive)
 * @property {number} max - Maximum value (inclusive)
 * @property {string} description - Human-readable description
 */

/**
 * @typedef {Object} DescriptionConfig
 * @description Configuration for description generation
 * @property {string} fallbackDescription - Default description when no range matches
 * @property {boolean} allowExtremeValues - Whether to handle values outside defined ranges
 * @property {string} extremeValueDescription - Description for extreme values
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {Object<ModifierType, Object<string, string>>} */
const modifierToDescription = {
    damage: {
        "[-100, -75]": "almost useless",
        "[-74, -50]": "severely hindered",
        "[-49, -25]": "hindered",
        "[-24, -10]": "slightly hindered",
        "[-9, 9]": "unaffected", // Neutral
        "[10, 24]": "slightly empowered",
        "[25, 49]": "empowered",
        "[50, 74]": "greatly empowered",
        "[75, 100]": "massively empowered"
    },
    energy: {
        "[-100, -75]": "massively draining",
        "[-74, -50]": "extremely draining",
        "[-49, -25]": "very draining",
        "[-24, -10]": "draining",
        "[-9, 9]": "unaffected", // Neutral
        "[10, 24]": "efficient",
        "[25, 49]": "very efficient",
        "[50, 74]": "extremely efficient",
        "[75, 100]": "incredibly efficient"
    }
};

/** @type {string} */
const DEFAULT_FALLBACK_DESCRIPTION = "unusually affected";

/** @type {ModifierType[]} */
const VALID_MODIFIER_TYPES = ['damage', 'energy'];

/** @type {number} */
const MODIFIER_VALUE_MIN = -1000;

/** @type {number} */
const MODIFIER_VALUE_MAX = 1000;

// ============================================================================
// CORE DESCRIPTION FUNCTIONS
// ============================================================================

/**
 * Converts a numerical modifier into a human-readable description
 * 
 * @param {number} value - The numerical modifier (e.g., -70, 15)
 * @param {ModifierType} type - The type of modifier ('damage' or 'energy')
 * @param {DescriptionConfig} [config] - Optional configuration for description generation
 * 
 * @returns {string} The human-readable description
 * 
 * @throws {TypeError} When value is not a number
 * @throws {TypeError} When type is not a valid modifier type
 * @throws {RangeError} When value is outside reasonable bounds
 * 
 * @example
 * // Get damage modifier description
 * const desc1 = getModifierDescription(-50, 'damage');
 * console.log(desc1); // "severely hindered"
 * 
 * // Get energy modifier description
 * const desc2 = getModifierDescription(30, 'energy');
 * console.log(desc2); // "very efficient"
 * 
 * @since 2.0.0
 * @public
 */
export function getModifierDescription(value, type, config = {}) {
    // Input validation
    if (typeof value !== 'number') {
        throw new TypeError('getModifierDescription: value must be a number');
    }

    if (!Number.isFinite(value)) {
        throw new RangeError('getModifierDescription: value must be a finite number');
    }

    if (typeof type !== 'string') {
        throw new TypeError('getModifierDescription: type must be a string');
    }

    if (!VALID_MODIFIER_TYPES.includes(type)) {
        throw new TypeError(`getModifierDescription: type must be one of ${VALID_MODIFIER_TYPES.join(', ')}`);
    }

    if (typeof config !== 'object' || config === null) {
        throw new TypeError('getModifierDescription: config must be an object');
    }

    // Range validation with reasonable bounds
    if (value < MODIFIER_VALUE_MIN || value > MODIFIER_VALUE_MAX) {
        throw new RangeError(`getModifierDescription: value must be between ${MODIFIER_VALUE_MIN} and ${MODIFIER_VALUE_MAX}`);
    }

    /** @type {DescriptionConfig} */
    const finalConfig = {
        fallbackDescription: DEFAULT_FALLBACK_DESCRIPTION,
        allowExtremeValues: true,
        extremeValueDescription: 'extraordinarily affected',
        ...config
    };

    /** @type {Object<string, string>} */
    const descriptions = modifierToDescription[type];

    if (!descriptions) {
        console.warn(`[Description Generator] No descriptions found for type: ${type}`);
        return finalConfig.fallbackDescription;
    }

    // Find matching range
    for (const range in descriptions) {
        try {
            /** @type {number[]} */
            const [min, max] = JSON.parse(`[${range}]`);
            
            if (value >= min && value <= max) {
                const description = descriptions[range];
                console.debug(`[Description Generator] Value ${value} (${type}) → "${description}"`);
                return description;
            }
        } catch (parseError) {
            console.warn(`[Description Generator] Invalid range format: ${range}`);
            continue;
        }
    }

    // Handle extreme values
    if (finalConfig.allowExtremeValues) {
        console.debug(`[Description Generator] Extreme value ${value} (${type}) → "${finalConfig.extremeValueDescription}"`);
        return finalConfig.extremeValueDescription;
    }

    console.debug(`[Description Generator] No match for value ${value} (${type}) → "${finalConfig.fallbackDescription}"`);
    return finalConfig.fallbackDescription;
}

/**
 * Gets all available description ranges for a modifier type
 * 
 * @param {ModifierType} type - The modifier type to get ranges for
 * 
 * @returns {ModifierRange[]} Array of modifier ranges with descriptions
 * 
 * @throws {TypeError} When type is not a valid modifier type
 * 
 * @example
 * // Get all damage modifier ranges
 * const ranges = getModifierRanges('damage');
 * console.log(ranges[0]); // { min: -100, max: -75, description: "almost useless" }
 * 
 * @since 2.0.0
 * @public
 */
export function getModifierRanges(type) {
    // Input validation
    if (typeof type !== 'string') {
        throw new TypeError('getModifierRanges: type must be a string');
    }

    if (!VALID_MODIFIER_TYPES.includes(type)) {
        throw new TypeError(`getModifierRanges: type must be one of ${VALID_MODIFIER_TYPES.join(', ')}`);
    }

    /** @type {Object<string, string>} */
    const descriptions = modifierToDescription[type];

    if (!descriptions) {
        return [];
    }

    /** @type {ModifierRange[]} */
    const ranges = [];

    for (const range in descriptions) {
        try {
            /** @type {number[]} */
            const [min, max] = JSON.parse(`[${range}]`);
            
            ranges.push({
                min,
                max,
                description: descriptions[range]
            });
        } catch (parseError) {
            console.warn(`[Description Generator] Skipping invalid range: ${range}`);
        }
    }

    // Sort ranges by minimum value
    ranges.sort((a, b) => a.min - b.min);

    return ranges;
}

/**
 * Validates if a value falls within any defined range for a modifier type
 * 
 * @param {number} value - The value to validate
 * @param {ModifierType} type - The modifier type
 * 
 * @returns {boolean} True if value falls within a defined range
 * 
 * @throws {TypeError} When parameters are invalid
 * 
 * @example
 * // Check if value is within defined ranges
 * const isValid = isValueInDefinedRange(50, 'damage');
 * console.log(isValid); // true (50 is in "greatly empowered" range)
 * 
 * @since 2.0.0
 * @public
 */
export function isValueInDefinedRange(value, type) {
    // Input validation
    if (typeof value !== 'number') {
        throw new TypeError('isValueInDefinedRange: value must be a number');
    }

    if (!Number.isFinite(value)) {
        throw new RangeError('isValueInDefinedRange: value must be a finite number');
    }

    if (typeof type !== 'string') {
        throw new TypeError('isValueInDefinedRange: type must be a string');
    }

    if (!VALID_MODIFIER_TYPES.includes(type)) {
        throw new TypeError(`isValueInDefinedRange: type must be one of ${VALID_MODIFIER_TYPES.join(', ')}`);
    }

    /** @type {ModifierRange[]} */
    const ranges = getModifierRanges(type);

    return ranges.some(range => value >= range.min && value <= range.max);
}

/**
 * Validates description generator configuration
 * 
 * @param {DescriptionConfig} config - Configuration to validate
 * 
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * // Validate configuration
 * const result = validateDescriptionConfig({
 *   fallbackDescription: 'custom fallback',
 *   allowExtremeValues: true
 * });
 * if (!result.isValid) {
 *   console.error('Config errors:', result.errors);
 * }
 * 
 * @since 2.0.0
 * @public
 */
export function validateDescriptionConfig(config) {
    /** @type {string[]} */
    const errors = [];
    /** @type {string[]} */
    const warnings = [];

    if (!config || typeof config !== 'object') {
        errors.push('Config must be an object');
        return { isValid: false, errors, warnings };
    }

    if (config.fallbackDescription !== undefined) {
        if (typeof config.fallbackDescription !== 'string') {
            errors.push('fallbackDescription must be a string');
        } else if (config.fallbackDescription.length === 0) {
            warnings.push('fallbackDescription is empty');
        }
    }

    if (config.allowExtremeValues !== undefined && typeof config.allowExtremeValues !== 'boolean') {
        errors.push('allowExtremeValues must be a boolean');
    }

    if (config.extremeValueDescription !== undefined) {
        if (typeof config.extremeValueDescription !== 'string') {
            errors.push('extremeValueDescription must be a string');
        } else if (config.extremeValueDescription.length === 0) {
            warnings.push('extremeValueDescription is empty');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Gets the neutral (unaffected) description for a modifier type
 * 
 * @param {ModifierType} type - The modifier type
 * 
 * @returns {string} The neutral description
 * 
 * @throws {TypeError} When type is invalid
 * 
 * @example
 * // Get neutral description
 * const neutral = getNeutralDescription('damage');
 * console.log(neutral); // "unaffected"
 * 
 * @since 2.0.0
 * @public
 */
export function getNeutralDescription(type) {
    // Input validation
    if (typeof type !== 'string') {
        throw new TypeError('getNeutralDescription: type must be a string');
    }

    if (!VALID_MODIFIER_TYPES.includes(type)) {
        throw new TypeError(`getNeutralDescription: type must be one of ${VALID_MODIFIER_TYPES.join(', ')}`);
    }

    // Find the neutral range (should contain 0)
    /** @type {ModifierRange[]} */
    const ranges = getModifierRanges(type);
    
    /** @type {ModifierRange | undefined} */
    const neutralRange = ranges.find(range => range.min <= 0 && range.max >= 0);

    if (neutralRange) {
        return neutralRange.description;
    }

    console.warn(`[Description Generator] No neutral range found for type: ${type}`);
    return DEFAULT_FALLBACK_DESCRIPTION;
} 