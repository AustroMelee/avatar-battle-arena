/**
 * @fileoverview Avatar Battle Arena - Number Validation Utilities
 * @description Comprehensive numeric validation and sanitization functions with type safety and boundary checking
 * @version 2.0.0
 */

'use strict';

//# sourceURL=utils_number_validation.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

// No external types needed for this utility module

/**
 * @typedef {Object} ValidationOptions
 * @description Options for number validation functions
 * @property {boolean} [strict=false] - Throw errors instead of returning defaults
 * @property {boolean} [allowInfinity=false] - Allow Infinity and -Infinity values
 * @property {boolean} [allowNaN=false] - Allow NaN values
 * @property {boolean} [coerce=true] - Attempt to coerce non-numbers to numbers
 * @property {string} [context=''] - Context string for error messages
 * @property {boolean} [debug=false] - Enable debug logging
 */

/**
 * @typedef {Object} RangeConstraint
 * @description Numeric range constraint
 * @property {number} [min] - Minimum allowed value (inclusive)
 * @property {number} [max] - Maximum allowed value (inclusive)
 * @property {boolean} [minExclusive=false] - Whether minimum is exclusive
 * @property {boolean} [maxExclusive=false] - Whether maximum is exclusive
 * @property {boolean} [allowBoundary=true] - Whether boundary values are allowed
 */

/**
 * @typedef {Object} ValidationResult
 * @description Result of number validation
 * @property {boolean} isValid - Whether the number passed validation
 * @property {number | null} value - Validated/sanitized value
 * @property {string[]} errors - Array of validation error messages
 * @property {string[]} warnings - Array of validation warnings
 * @property {string[]} [info] - Array of informational messages
 * @property {Object} [metadata] - Additional validation metadata
 */

/**
 * @typedef {Object} NumericStatistics
 * @description Statistical information about a numeric value
 * @property {number} value - The numeric value
 * @property {boolean} isInteger - Whether value is an integer
 * @property {boolean} isPositive - Whether value is positive
 * @property {boolean} isNegative - Whether value is negative
 * @property {boolean} isZero - Whether value is zero
 * @property {number} absoluteValue - Absolute value
 * @property {number} [precision] - Decimal precision (if applicable)
 * @property {boolean} isSafeInteger - Whether value is a safe integer
 * @property {string} sign - Sign of the number ('+', '-', '0')
 */

/**
 * @typedef {Object} SanitizationOptions
 * @description Options for number sanitization
 * @property {boolean} [strict=false] - Throw errors on invalid input
 * @property {number} [defaultValue=0] - Default value for invalid input
 * @property {boolean} [preserveType=false] - Preserve original type if possible
 * @property {string} [context=''] - Context for error messages
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {number} */
const DEFAULT_MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;

/** @type {number} */
const DEFAULT_MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

/** @type {number} */
const DEFAULT_PRECISION = 10;

/** @type {number} */
const MAX_DECIMAL_PLACES = 15;

/** @type {number} */
const MIN_DECIMAL_PLACES = 0;

/** @type {number} */
const PERCENTAGE_MIN = 0;

/** @type {number} */
const PERCENTAGE_MAX = 100;

/** @type {number} */
const RATIO_MIN = 0;

/** @type {number} */
const RATIO_MAX = 1;

/** @type {ValidationOptions} */
const DEFAULT_VALIDATION_OPTIONS = {
    strict: false,
    allowInfinity: false,
    allowNaN: false,
    coerce: true,
    context: '',
    debug: false
};

/** @type {SanitizationOptions} */
const DEFAULT_SANITIZATION_OPTIONS = {
    strict: false,
    defaultValue: 0,
    preserveType: false,
    context: ''
};

/** @type {string[]} */
const NUMERIC_TYPES = ['number', 'bigint'];

/** @type {string[]} */
const COERCIBLE_TYPES = ['string', 'boolean'];

// ============================================================================
// CORE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates that a value is a valid number
 * 
 * @param {any} value - Value to validate
 * @param {ValidationOptions} [options={}] - Validation options
 * 
 * @returns {ValidationResult} Validation result
 * 
 * @throws {TypeError} When in strict mode and value is not a number
 * @throws {RangeError} When in strict mode and value is out of bounds
 * 
 * @example
 * // Basic validation
 * const result = validateNumber(42);
 * console.log(result.isValid); // true
 * console.log(result.value); // 42
 * 
 * // Coercion validation
 * const coerced = validateNumber('42.5');
 * console.log(coerced.value); // 42.5
 * 
 * // Strict validation
 * try {
 *   validateNumber('not a number', { strict: true });
 * } catch (error) {
 *   console.log(error.message); // TypeError
 * }
 * 
 * @since 2.0.0
 * @public
 */
export function validateNumber(value, options = {}) {
    // Input validation
    if (typeof options !== 'object' || options === null) {
        throw new TypeError('validateNumber: options must be an object');
    }

    // Merge options with defaults
    /** @type {ValidationOptions} */
    const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };

    /** @type {string[]} */
    const errors = [];
    /** @type {string[]} */
    const warnings = [];
    /** @type {string[]} */
    const info = [];
    /** @type {number | null} */
    let validatedValue = null;

    /** @type {string} */
    const context = opts.context ? `[${opts.context}] ` : '';

    try {
        if (opts.debug) {
            console.debug(`${context}Validating number:`, value, typeof value);
        }

        // Type checking
        if (typeof value === 'number') {
            validatedValue = value;
            info.push(`Value is already a number: ${value}`);
        } else if (typeof value === 'bigint') {
            // Handle BigInt
            if (value > DEFAULT_MAX_SAFE_INTEGER || value < DEFAULT_MIN_SAFE_INTEGER) {
                warnings.push(`BigInt value ${value} is outside safe integer range`);
            }
            validatedValue = Number(value);
            info.push(`Converted BigInt to number: ${value} -> ${validatedValue}`);
        } else if (opts.coerce && value !== null && value !== undefined) {
            // Attempt coercion
            if (typeof value === 'string' && value.trim() === '') {
                errors.push('Cannot coerce empty string to number');
            } else {
                /** @type {number} */
                const coerced = Number(value);
                
                if (!Number.isNaN(coerced)) {
                    validatedValue = coerced;
                    warnings.push(`Coerced ${typeof value} to number: ${value} -> ${coerced}`);
                } else {
                    errors.push(`Cannot coerce ${typeof value} '${value}' to number`);
                }
            }
        } else {
            errors.push(`Value must be a number, got ${typeof value}: ${value}`);
        }

        // Additional number validation if we have a number
        if (validatedValue !== null) {
            // NaN check
            if (Number.isNaN(validatedValue)) {
                if (!opts.allowNaN) {
                    errors.push('Value is NaN (Not a Number)');
                    validatedValue = null;
                } else {
                    info.push('NaN value allowed by options');
                }
            }

            // Infinity check
            if (!Number.isFinite(validatedValue)) {
                if (!opts.allowInfinity) {
                    /** @type {string} */
                    const infinityType = validatedValue > 0 ? 'positive' : 'negative';
                    errors.push(`Value is ${infinityType} infinity`);
                    validatedValue = null;
                } else {
                    info.push(`Infinity value allowed by options: ${validatedValue}`);
                }
            }

            // Safe integer check (informational)
            if (validatedValue !== null && !Number.isSafeInteger(validatedValue) && Number.isInteger(validatedValue)) {
                warnings.push(`Integer value ${validatedValue} is outside safe integer range`);
            }
        }

        /** @type {ValidationResult} */
        const result = {
            isValid: errors.length === 0,
            value: validatedValue,
            errors,
            warnings,
            info,
            metadata: {
                originalValue: value,
                originalType: typeof value,
                coerced: typeof value !== 'number' && validatedValue !== null,
                context: opts.context || 'validateNumber'
            }
        };

        // Handle strict mode
        if (opts.strict && !result.isValid) {
            throw new TypeError(`${context}Number validation failed: ${errors.join(', ')}`);
        }

        if (opts.debug) {
            console.debug(`${context}Validation result:`, result);
        }

        return result;

    } catch (error) {
        if (opts.strict) {
            throw error;
        }

        return {
            isValid: false,
            value: null,
            errors: [error.message],
            warnings,
            info,
            metadata: {
                originalValue: value,
                originalType: typeof value,
                error: error.message,
                context: opts.context || 'validateNumber'
            }
        };
    }
}

/**
 * Validates that a number is within a specified range
 * 
 * @param {number} value - Number to validate
 * @param {RangeConstraint} constraint - Range constraint
 * @param {ValidationOptions} [options={}] - Validation options
 * 
 * @returns {ValidationResult} Validation result
 * 
 * @throws {TypeError} When value is not a number
 * @throws {RangeError} When value is out of range in strict mode
 * @throws {Error} When constraint is invalid
 * 
 * @example
 * // Validate percentage (0-100)
 * const result = validateRange(85, { min: 0, max: 100 });
 * console.log(result.isValid); // true
 * 
 * // Validate with exclusions
 * const exclusive = validateRange(0, { min: 0, minExclusive: true });
 * console.log(exclusive.isValid); // false
 * 
 * // Validate with custom constraint
 * const health = validateRange(150, { min: 0, max: 100 }, { strict: true });
 * // Throws RangeError
 * 
 * @since 2.0.0
 * @public
 */
export function validateRange(value, constraint, options = {}) {
    // Input validation
    if (typeof value !== 'number') {
        throw new TypeError(`validateRange: value must be a number, got ${typeof value}`);
    }

    if (!constraint || typeof constraint !== 'object') {
        throw new TypeError('validateRange: constraint must be an object');
    }

    if (typeof options !== 'object' || options === null) {
        throw new TypeError('validateRange: options must be an object');
    }

    // Validate constraint object
    if (typeof constraint.min !== 'undefined' && typeof constraint.min !== 'number') {
        throw new Error('validateRange: constraint.min must be a number');
    }

    if (typeof constraint.max !== 'undefined' && typeof constraint.max !== 'number') {
        throw new Error('validateRange: constraint.max must be a number');
    }

    if (typeof constraint.min === 'number' && typeof constraint.max === 'number' && constraint.min > constraint.max) {
        throw new Error('validateRange: constraint.min cannot be greater than constraint.max');
    }

    // Merge options with defaults
    /** @type {ValidationOptions} */
    const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };

    /** @type {string[]} */
    const errors = [];
    /** @type {string[]} */
    const warnings = [];
    /** @type {string[]} */
    const info = [];

    /** @type {string} */
    const context = opts.context ? `[${opts.context}] ` : '';

    // First validate the number itself
    /** @type {ValidationResult} */
    const numberValidation = validateNumber(value, { ...opts, strict: false });

    if (!numberValidation.isValid) {
        return {
            isValid: false,
            value: null,
            errors: numberValidation.errors,
            warnings: numberValidation.warnings,
            info: numberValidation.info,
            metadata: {
                ...numberValidation.metadata,
                rangeConstraint: constraint
            }
        };
    }

    /** @type {number} */
    const validValue = numberValidation.value;

    // Check minimum constraint
    if (typeof constraint.min === 'number') {
        /** @type {boolean} */
        const minViolation = constraint.minExclusive ? 
            validValue <= constraint.min : 
            validValue < constraint.min;

        if (minViolation) {
            /** @type {string} */
            const operator = constraint.minExclusive ? '>' : '>=';
            errors.push(`Value ${validValue} must be ${operator} ${constraint.min}`);
        } else {
            info.push(`Value ${validValue} satisfies minimum constraint: ${constraint.min}`);
        }
    }

    // Check maximum constraint
    if (typeof constraint.max === 'number') {
        /** @type {boolean} */
        const maxViolation = constraint.maxExclusive ? 
            validValue >= constraint.max : 
            validValue > constraint.max;

        if (maxViolation) {
            /** @type {string} */
            const operator = constraint.maxExclusive ? '<' : '<=';
            errors.push(`Value ${validValue} must be ${operator} ${constraint.max}`);
        } else {
            info.push(`Value ${validValue} satisfies maximum constraint: ${constraint.max}`);
        }
    }

    /** @type {ValidationResult} */
    const result = {
        isValid: errors.length === 0,
        value: errors.length === 0 ? validValue : null,
        errors,
        warnings: [...numberValidation.warnings, ...warnings],
        info: [...numberValidation.info, ...info],
        metadata: {
            ...numberValidation.metadata,
            rangeConstraint: constraint,
            minSatisfied: typeof constraint.min === 'undefined' || 
                (constraint.minExclusive ? validValue > constraint.min : validValue >= constraint.min),
            maxSatisfied: typeof constraint.max === 'undefined' || 
                (constraint.maxExclusive ? validValue < constraint.max : validValue <= constraint.max)
        }
    };

    // Handle strict mode
    if (opts.strict && !result.isValid) {
        throw new RangeError(`${context}Range validation failed: ${errors.join(', ')}`);
    }

    if (opts.debug) {
        console.debug(`${context}Range validation result:`, result);
    }

    return result;
}

/**
 * Validates that a number is an integer
 * 
 * @param {number} value - Number to validate
 * @param {ValidationOptions} [options={}] - Validation options
 * 
 * @returns {ValidationResult} Validation result
 * 
 * @throws {TypeError} When value is not a number
 * @throws {Error} When value is not an integer in strict mode
 * 
 * @example
 * // Validate integer
 * const result = validateInteger(42);
 * console.log(result.isValid); // true
 * 
 * // Non-integer validation
 * const decimal = validateInteger(42.5);
 * console.log(decimal.isValid); // false
 * 
 * @since 2.0.0
 * @public
 */
export function validateInteger(value, options = {}) {
    // Input validation
    if (typeof value !== 'number') {
        throw new TypeError(`validateInteger: value must be a number, got ${typeof value}`);
    }

    // Merge options with defaults
    /** @type {ValidationOptions} */
    const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };

    /** @type {string[]} */
    const errors = [];
    /** @type {string[]} */
    const warnings = [];

    try {
        // Basic number validation first
        if (Number.isNaN(value)) {
            errors.push('Value is NaN');
        } else if (!Number.isFinite(value) && !opts.allowInfinity) {
            errors.push('Value is infinite');
        } else if (!Number.isInteger(value)) {
            errors.push(`Value ${value} is not an integer`);
        }

        /** @type {ValidationResult} */
        const result = {
            isValid: errors.length === 0,
            value: errors.length === 0 ? value : null,
            errors,
            warnings
        };

        // Handle strict mode
        if (opts.strict && !result.isValid) {
            /** @type {string} */
            const context = opts.context ? `[${opts.context}] ` : '';
            throw new Error(`${context}Integer validation failed: ${errors.join(', ')}`);
        }

        return result;

    } catch (error) {
        if (opts.strict) {
            throw error;
        }

        return {
            isValid: false,
            value: null,
            errors: [error.message],
            warnings
        };
    }
}

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitizes a number by clamping it to a valid range
 * 
 * @param {number} value - Number to sanitize
 * @param {RangeConstraint} constraint - Range constraint
 * @param {ValidationOptions} [options={}] - Sanitization options
 * 
 * @returns {number} Sanitized number within range
 * 
 * @throws {TypeError} When value is not a number
 * @throws {Error} When value cannot be sanitized
 * 
 * @example
 * // Clamp to percentage range
 * const percentage = sanitizeRange(150, { min: 0, max: 100 }); // 100
 * 
 * // Clamp with minimum only
 * const positive = sanitizeRange(-5, { min: 0 }); // 0
 * 
 * @since 2.0.0
 * @public
 */
export function sanitizeRange(value, constraint, options = {}) {
    // Input validation
    if (typeof value !== 'number') {
        throw new TypeError(`sanitizeRange: value must be a number, got ${typeof value}`);
    }

    if (!constraint || typeof constraint !== 'object') {
        throw new TypeError('sanitizeRange: constraint must be an object');
    }

    // Handle invalid numbers
    if (Number.isNaN(value)) {
        throw new Error('sanitizeRange: Cannot sanitize NaN value');
    }

    if (!Number.isFinite(value)) {
        throw new Error('sanitizeRange: Cannot sanitize infinite value');
    }

    /** @type {number} */
    let sanitized = value;

    // Apply minimum constraint
    if (typeof constraint.min === 'number') {
        if (constraint.minExclusive) {
            if (sanitized <= constraint.min) {
                sanitized = constraint.min + Number.EPSILON;
            }
        } else {
            if (sanitized < constraint.min) {
                sanitized = constraint.min;
            }
        }
    }

    // Apply maximum constraint
    if (typeof constraint.max === 'number') {
        if (constraint.maxExclusive) {
            if (sanitized >= constraint.max) {
                sanitized = constraint.max - Number.EPSILON;
            }
        } else {
            if (sanitized > constraint.max) {
                sanitized = constraint.max;
            }
        }
    }

    return sanitized;
}

/**
 * Sanitizes a number to a specific precision
 * 
 * @param {number} value - Number to sanitize
 * @param {number} decimalPlaces - Number of decimal places
 * @param {ValidationOptions} [options={}] - Sanitization options
 * 
 * @returns {number} Number rounded to specified precision
 * 
 * @throws {TypeError} When value is not a number
 * @throws {RangeError} When decimalPlaces is invalid
 * 
 * @example
 * // Round to 2 decimal places
 * const rounded = sanitizePrecision(3.14159, 2); // 3.14
 * 
 * // Round to nearest integer
 * const integer = sanitizePrecision(42.7, 0); // 43
 * 
 * @since 2.0.0
 * @public
 */
export function sanitizePrecision(value, decimalPlaces, options = {}) {
    // Input validation
    if (typeof value !== 'number') {
        throw new TypeError(`sanitizePrecision: value must be a number, got ${typeof value}`);
    }

    if (typeof decimalPlaces !== 'number' || !Number.isInteger(decimalPlaces)) {
        throw new TypeError('sanitizePrecision: decimalPlaces must be an integer');
    }

    if (decimalPlaces < 0 || decimalPlaces > MAX_DECIMAL_PLACES) {
        throw new RangeError(`sanitizePrecision: decimalPlaces must be between 0 and ${MAX_DECIMAL_PLACES}`);
    }

    // Handle special values
    if (Number.isNaN(value) || !Number.isFinite(value)) {
        return value;
    }

    /** @type {number} */
    const multiplier = Math.pow(10, decimalPlaces);
    
    return Math.round(value * multiplier) / multiplier;
}

/**
 * Sanitizes a number to be a safe integer
 * 
 * @param {number} value - Number to sanitize
 * @param {ValidationOptions} [options={}] - Sanitization options
 * 
 * @returns {number} Safe integer value
 * 
 * @throws {TypeError} When value is not a number
 * @throws {Error} When value cannot be converted to safe integer
 * 
 * @example
 * // Convert to safe integer
 * const safe = sanitizeSafeInteger(42.7); // 43
 * 
 * // Handle large numbers
 * const large = sanitizeSafeInteger(Number.MAX_VALUE); // Number.MAX_SAFE_INTEGER
 * 
 * @since 2.0.0
 * @public
 */
export function sanitizeSafeInteger(value, options = {}) {
    // Input validation
    if (typeof value !== 'number') {
        throw new TypeError(`sanitizeSafeInteger: value must be a number, got ${typeof value}`);
    }

    // Handle special values
    if (Number.isNaN(value)) {
        throw new Error('sanitizeSafeInteger: Cannot convert NaN to safe integer');
    }

    if (!Number.isFinite(value)) {
        throw new Error('sanitizeSafeInteger: Cannot convert infinite value to safe integer');
    }

    // Round to integer
    /** @type {number} */
    let sanitized = Math.round(value);

    // Clamp to safe integer range
    if (sanitized > DEFAULT_MAX_SAFE_INTEGER) {
        sanitized = DEFAULT_MAX_SAFE_INTEGER;
    } else if (sanitized < DEFAULT_MIN_SAFE_INTEGER) {
        sanitized = DEFAULT_MIN_SAFE_INTEGER;
    }

    return sanitized;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Checks if a value is a positive number
 * 
 * @param {any} value - Value to check
 * @param {boolean} [allowZero=false] - Whether to consider zero as positive
 * 
 * @returns {boolean} True if value is positive
 * 
 * @example
 * // Check positive numbers
 * console.log(isPositiveNumber(42)); // true
 * console.log(isPositiveNumber(0, true)); // true
 * console.log(isPositiveNumber(-5)); // false
 * 
 * @since 2.0.0
 * @public
 */
export function isPositiveNumber(value, allowZero = false) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return false;
    }

    return allowZero ? value >= 0 : value > 0;
}

/**
 * Checks if a value is a negative number
 * 
 * @param {any} value - Value to check
 * @param {boolean} [allowZero=false] - Whether to consider zero as negative
 * 
 * @returns {boolean} True if value is negative
 * 
 * @example
 * // Check negative numbers
 * console.log(isNegativeNumber(-42)); // true
 * console.log(isNegativeNumber(0, true)); // true
 * console.log(isNegativeNumber(5)); // false
 * 
 * @since 2.0.0
 * @public
 */
export function isNegativeNumber(value, allowZero = false) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return false;
    }

    return allowZero ? value <= 0 : value < 0;
}

/**
 * Checks if a value is within a numeric range
 * 
 * @param {any} value - Value to check
 * @param {RangeConstraint} constraint - Range constraint
 * 
 * @returns {boolean} True if value is within range
 * 
 * @example
 * // Check if value is percentage
 * const isPercentage = isInRange(85, { min: 0, max: 100 }); // true
 * 
 * // Check with exclusive bounds
 * const inRange = isInRange(0, { min: 0, minExclusive: true }); // false
 * 
 * @since 2.0.0
 * @public
 */
export function isInRange(value, constraint) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return false;
    }

    if (!constraint || typeof constraint !== 'object') {
        return false;
    }

    // Check minimum constraint
    if (typeof constraint.min === 'number') {
        /** @type {boolean} */
        const violatesMin = constraint.minExclusive ? 
            value <= constraint.min : 
            value < constraint.min;

        if (violatesMin) {
            return false;
        }
    }

    // Check maximum constraint
    if (typeof constraint.max === 'number') {
        /** @type {boolean} */
        const violatesMax = constraint.maxExclusive ? 
            value >= constraint.max : 
            value > constraint.max;

        if (violatesMax) {
            return false;
        }
    }

    return true;
}

/**
 * Gets statistical information about a numeric value
 * 
 * @param {number} value - Number to analyze
 * 
 * @returns {NumericStatistics} Statistical information
 * 
 * @throws {TypeError} When value is not a number
 * 
 * @example
 * // Get number statistics
 * const stats = getNumericStats(-42.5);
 * console.log(stats.isNegative); // true
 * console.log(stats.absoluteValue); // 42.5
 * console.log(stats.precision); // 1
 * 
 * @since 2.0.0
 * @public
 */
export function getNumericStats(value) {
    if (typeof value !== 'number') {
        throw new TypeError(`getNumericStats: value must be a number, got ${typeof value}`);
    }

    /** @type {NumericStatistics} */
    const stats = {
        value,
        isInteger: Number.isInteger(value),
        isPositive: value > 0,
        isNegative: value < 0,
        isZero: value === 0,
        absoluteValue: Math.abs(value)
    };

    // Calculate precision for non-integers
    if (!stats.isInteger && Number.isFinite(value)) {
        /** @type {string} */
        const valueStr = value.toString();
        /** @type {number} */
        const decimalIndex = valueStr.indexOf('.');
        
        if (decimalIndex !== -1) {
            stats.precision = valueStr.length - decimalIndex - 1;
        }
    }

    return stats;
}

/**
 * Generates a random number within constraints
 * 
 * @param {RangeConstraint} constraint - Range constraint
 * @param {Object} [options={}] - Generation options
 * @param {boolean} [options.integer=false] - Generate integer values only
 * @param {number} [options.precision=2] - Decimal precision for non-integers
 * 
 * @returns {number} Random number within constraints
 * 
 * @throws {Error} When constraints are invalid
 * 
 * @example
 * // Generate random percentage
 * const percentage = generateRandomNumber({ min: 0, max: 100 });
 * 
 * // Generate random integer
 * const dice = generateRandomNumber({ min: 1, max: 6 }, { integer: true });
 * 
 * @since 2.0.0
 * @public
 */
export function generateRandomNumber(constraint, options = {}) {
    if (!constraint || typeof constraint !== 'object') {
        throw new Error('generateRandomNumber: constraint must be an object');
    }

    /** @type {number} */
    const min = constraint.min ?? 0;
    /** @type {number} */
    const max = constraint.max ?? 1;

    if (typeof min !== 'number' || typeof max !== 'number') {
        throw new Error('generateRandomNumber: min and max must be numbers');
    }

    if (min >= max) {
        throw new Error('generateRandomNumber: min must be less than max');
    }

    /** @type {boolean} */
    const integer = options.integer || false;
    /** @type {number} */
    const precision = options.precision || 2;

    if (integer) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        /** @type {number} */
        const random = Math.random() * (max - min) + min;
        return sanitizePrecision(random, precision);
    }
}

// ============================================================================
// PERCENTAGE UTILITIES
// ============================================================================

/**
 * Validates a percentage value (0-100)
 * 
 * @param {number} value - Percentage value to validate
 * @param {ValidationOptions} [options={}] - Validation options
 * 
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * // Validate percentage
 * const result = validatePercentage(85); // valid
 * const invalid = validatePercentage(150); // invalid
 * 
 * @since 2.0.0
 * @public
 */
export function validatePercentage(value, options = {}) {
    return validateRange(value, { min: 0, max: 100 }, options);
}

/**
 * Validates a ratio value (0-1)
 * 
 * @param {number} value - Ratio value to validate
 * @param {ValidationOptions} [options={}] - Validation options
 * 
 * @returns {ValidationResult} Validation result
 * 
 * @example
 * // Validate ratio
 * const result = validateRatio(0.85); // valid
 * const invalid = validateRatio(1.5); // invalid
 * 
 * @since 2.0.0
 * @public
 */
export function validateRatio(value, options = {}) {
    return validateRange(value, { min: 0, max: 1 }, options);
}

/**
 * Converts percentage to ratio
 * 
 * @param {number} percentage - Percentage value (0-100)
 * 
 * @returns {number} Ratio value (0-1)
 * 
 * @throws {RangeError} When percentage is out of range
 * 
 * @example
 * const ratio = percentageToRatio(85); // 0.85
 * 
 * @since 2.0.0
 * @public
 */
export function percentageToRatio(percentage) {
    /** @type {ValidationResult} */
    const validation = validatePercentage(percentage, { strict: true });
    
    return validation.value / 100;
}

/**
 * Converts ratio to percentage
 * 
 * @param {number} ratio - Ratio value (0-1)
 * 
 * @returns {number} Percentage value (0-100)
 * 
 * @throws {RangeError} When ratio is out of range
 * 
 * @example
 * const percentage = ratioToPercentage(0.85); // 85
 * 
 * @since 2.0.0
 * @public
 */
export function ratioToPercentage(ratio) {
    /** @type {ValidationResult} */
    const validation = validateRatio(ratio, { strict: true });
    
    return validation.value * 100;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    validateNumber,
    validateRange,
    validateInteger,
    sanitizeRange,
    sanitizePrecision,
    sanitizeSafeInteger,
    isPositiveNumber,
    isNegativeNumber,
    isInRange,
    getNumericStats,
    generateRandomNumber,
    validatePercentage,
    validateRatio,
    percentageToRatio,
    ratioToPercentage
}; 