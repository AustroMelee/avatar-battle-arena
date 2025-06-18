/**
 * @fileoverview Avatar Battle Arena - Percentage Calculation Utilities
 * @description Provides safe percentage calculations with proper validation and formatting
 * @version 2.0.0
 */

'use strict';

//# sourceURL=utils_percentage.js

// ============================================================================
// PERCENTAGE CALCULATION UTILITIES
// ============================================================================

/**
 * Converts a decimal value to a percentage
 * 
 * @param {number} decimal - Decimal value (0.0 to 1.0)
 * @param {number} [decimalPlaces=1] - Number of decimal places to round to
 * 
 * @returns {number} Percentage value (0 to 100)
 * 
 * @throws {TypeError} When decimal is not a number or decimalPlaces is not a number
 * @throws {RangeError} When decimal is outside valid range or decimalPlaces is negative
 * 
 * @example
 * // Convert decimal to percentage
 * const percent = decimalToPercentage(0.75, 2); // 75.00
 * const simple = decimalToPercentage(0.5); // 75.0
 * 
 * @since 2.0.0
 * @public
 */
export function decimalToPercentage(decimal, decimalPlaces = 1) {
    // Input validation
    if (typeof decimal !== 'number' || isNaN(decimal)) {
        throw new TypeError('decimalToPercentage: decimal must be a valid number');
    }
    
    if (typeof decimalPlaces !== 'number' || isNaN(decimalPlaces) || !Number.isInteger(decimalPlaces)) {
        throw new TypeError('decimalToPercentage: decimalPlaces must be a valid integer');
    }
    
    if (decimal < 0 || decimal > 1) {
        throw new RangeError(`decimalToPercentage: decimal must be between 0 and 1, received: ${decimal}`);
    }
    
    if (decimalPlaces < 0 || decimalPlaces > 10) {
        throw new RangeError(`decimalToPercentage: decimalPlaces must be between 0 and 10, received: ${decimalPlaces}`);
    }

    /** @type {number} */
    const percentage = decimal * 100;
    
    return Number(percentage.toFixed(decimalPlaces));
}

/**
 * Converts a percentage value to a decimal
 * 
 * @param {number} percentage - Percentage value (0 to 100)
 * @param {number} [precision=4] - Number of decimal places for precision
 * 
 * @returns {number} Decimal value (0.0 to 1.0)
 * 
 * @throws {TypeError} When percentage is not a number or precision is not a number
 * @throws {RangeError} When percentage is outside valid range or precision is negative
 * 
 * @example
 * // Convert percentage to decimal
 * const decimal = percentageToDecimal(75); // 0.75
 * const precise = percentageToDecimal(33.33, 6); // 0.333300
 * 
 * @since 2.0.0
 * @public
 */
export function percentageToDecimal(percentage, precision = 4) {
    // Input validation
    if (typeof percentage !== 'number' || isNaN(percentage)) {
        throw new TypeError('percentageToDecimal: percentage must be a valid number');
    }
    
    if (typeof precision !== 'number' || isNaN(precision) || !Number.isInteger(precision)) {
        throw new TypeError('percentageToDecimal: precision must be a valid integer');
    }
    
    if (percentage < 0 || percentage > 100) {
        throw new RangeError(`percentageToDecimal: percentage must be between 0 and 100, received: ${percentage}`);
    }
    
    if (precision < 0 || precision > 15) {
        throw new RangeError(`percentageToDecimal: precision must be between 0 and 15, received: ${precision}`);
    }

    /** @type {number} */
    const decimal = percentage / 100;
    
    return Number(decimal.toFixed(precision));
}

/**
 * Calculates percentage change between two values
 * 
 * @param {number} oldValue - Original value
 * @param {number} newValue - New value
 * @param {number} [decimalPlaces=1] - Number of decimal places to round to
 * 
 * @returns {number} Percentage change (positive for increase, negative for decrease)
 * 
 * @throws {TypeError} When values are not numbers or decimalPlaces is not a number
 * @throws {Error} When oldValue is zero (division by zero)
 * 
 * @example
 * // Calculate percentage change
 * const increase = calculatePercentageChange(50, 75); // 50.0
 * const decrease = calculatePercentageChange(100, 80); // -20.0
 * 
 * @since 2.0.0
 * @public
 */
export function calculatePercentageChange(oldValue, newValue, decimalPlaces = 1) {
    // Input validation
    if (typeof oldValue !== 'number' || isNaN(oldValue)) {
        throw new TypeError('calculatePercentageChange: oldValue must be a valid number');
    }
    
    if (typeof newValue !== 'number' || isNaN(newValue)) {
        throw new TypeError('calculatePercentageChange: newValue must be a valid number');
    }
    
    if (typeof decimalPlaces !== 'number' || isNaN(decimalPlaces) || !Number.isInteger(decimalPlaces)) {
        throw new TypeError('calculatePercentageChange: decimalPlaces must be a valid integer');
    }
    
    if (oldValue === 0) {
        throw new Error('calculatePercentageChange: Cannot calculate percentage change when oldValue is zero');
    }
    
    if (decimalPlaces < 0 || decimalPlaces > 10) {
        throw new RangeError(`calculatePercentageChange: decimalPlaces must be between 0 and 10, received: ${decimalPlaces}`);
    }

    /** @type {number} */
    const change = ((newValue - oldValue) / Math.abs(oldValue)) * 100;
    
    return Number(change.toFixed(decimalPlaces));
}

/**
 * Calculates what percentage one value is of another
 * 
 * @param {number} part - The part value
 * @param {number} whole - The whole value
 * @param {number} [decimalPlaces=1] - Number of decimal places to round to
 * 
 * @returns {number} Percentage that part represents of whole
 * 
 * @throws {TypeError} When values are not numbers or decimalPlaces is not a number
 * @throws {Error} When whole is zero (division by zero)
 * @throws {RangeError} When decimalPlaces is out of range
 * 
 * @example
 * // Calculate percentage of whole
 * const percent = calculatePercentageOf(25, 100); // 25.0
 * const fraction = calculatePercentageOf(1, 3, 2); // 33.33
 * 
 * @since 2.0.0
 * @public
 */
export function calculatePercentageOf(part, whole, decimalPlaces = 1) {
    // Input validation
    if (typeof part !== 'number' || isNaN(part)) {
        throw new TypeError('calculatePercentageOf: part must be a valid number');
    }
    
    if (typeof whole !== 'number' || isNaN(whole)) {
        throw new TypeError('calculatePercentageOf: whole must be a valid number');
    }
    
    if (typeof decimalPlaces !== 'number' || isNaN(decimalPlaces) || !Number.isInteger(decimalPlaces)) {
        throw new TypeError('calculatePercentageOf: decimalPlaces must be a valid integer');
    }
    
    if (whole === 0) {
        throw new Error('calculatePercentageOf: Cannot calculate percentage when whole is zero');
    }
    
    if (decimalPlaces < 0 || decimalPlaces > 10) {
        throw new RangeError(`calculatePercentageOf: decimalPlaces must be between 0 and 10, received: ${decimalPlaces}`);
    }

    /** @type {number} */
    const percentage = (part / whole) * 100;
    
    return Number(percentage.toFixed(decimalPlaces));
}

/**
 * Formats a percentage value as a string with proper symbols
 * 
 * @param {number} percentage - Percentage value to format
 * @param {Object} [options] - Formatting options
 * @param {number} [options.decimalPlaces=1] - Number of decimal places
 * @param {boolean} [options.includeSymbol=true] - Whether to include % symbol
 * @param {boolean} [options.includeSign=false] - Whether to include + sign for positive values
 * 
 * @returns {string} Formatted percentage string
 * 
 * @throws {TypeError} When percentage is not a number or options is not an object
 * @throws {RangeError} When decimalPlaces is out of range
 * 
 * @example
 * // Format percentages
 * const basic = formatPercentage(75.5); // "75.5%"
 * const precise = formatPercentage(33.333, { decimalPlaces: 2 }); // "33.33%"
 * const withSign = formatPercentage(25, { includeSign: true }); // "+25.0%"
 * 
 * @since 2.0.0
 * @public
 */
export function formatPercentage(percentage, options = {}) {
    // Input validation
    if (typeof percentage !== 'number' || isNaN(percentage)) {
        throw new TypeError('formatPercentage: percentage must be a valid number');
    }
    
    if (typeof options !== 'object' || options === null) {
        throw new TypeError('formatPercentage: options must be an object');
    }

    // Default options
    /** @type {number} */
    const decimalPlaces = options.decimalPlaces ?? 1;
    /** @type {boolean} */
    const includeSymbol = options.includeSymbol ?? true;
    /** @type {boolean} */
    const includeSign = options.includeSign ?? false;

    // Validate options
    if (typeof decimalPlaces !== 'number' || isNaN(decimalPlaces) || !Number.isInteger(decimalPlaces)) {
        throw new TypeError('formatPercentage: options.decimalPlaces must be a valid integer');
    }
    
    if (decimalPlaces < 0 || decimalPlaces > 10) {
        throw new RangeError(`formatPercentage: options.decimalPlaces must be between 0 and 10, received: ${decimalPlaces}`);
    }

    // Format the number
    /** @type {string} */
    let formattedValue = percentage.toFixed(decimalPlaces);

    // Add positive sign if requested
    if (includeSign && percentage > 0) {
        formattedValue = '+' + formattedValue;
    }

    // Add percentage symbol
    if (includeSymbol) {
        formattedValue += '%';
    }

    return formattedValue;
}

/**
 * Clamps a percentage value to valid range (0-100)
 * 
 * @param {number} percentage - Percentage value to clamp
 * @param {number} [decimalPlaces=1] - Number of decimal places to round to
 * 
 * @returns {number} Clamped percentage value
 * 
 * @throws {TypeError} When percentage is not a number or decimalPlaces is not a number
 * @throws {RangeError} When decimalPlaces is out of range
 * 
 * @example
 * // Clamp percentages to valid range
 * const clamped1 = clampPercentage(150); // 100.0
 * const clamped2 = clampPercentage(-25); // 0.0
 * const normal = clampPercentage(75.5); // 75.5
 * 
 * @since 2.0.0
 * @public
 */
export function clampPercentage(percentage, decimalPlaces = 1) {
    // Input validation
    if (typeof percentage !== 'number' || isNaN(percentage)) {
        throw new TypeError('clampPercentage: percentage must be a valid number');
    }
    
    if (typeof decimalPlaces !== 'number' || isNaN(decimalPlaces) || !Number.isInteger(decimalPlaces)) {
        throw new TypeError('clampPercentage: decimalPlaces must be a valid integer');
    }
    
    if (decimalPlaces < 0 || decimalPlaces > 10) {
        throw new RangeError(`clampPercentage: decimalPlaces must be between 0 and 10, received: ${decimalPlaces}`);
    }

    /** @type {number} */
    const clampedValue = Math.max(0, Math.min(100, percentage));
    
    return Number(clampedValue.toFixed(decimalPlaces));
}

/**
 * Checks if a value represents a valid percentage (0-100)
 * 
 * @param {any} value - Value to check
 * 
 * @returns {boolean} True if value is a valid percentage
 * 
 * @example
 * // Check percentage validity
 * const valid1 = isValidPercentage(75.5); // true
 * const valid2 = isValidPercentage(-10); // false
 * const valid3 = isValidPercentage('50%'); // false
 * 
 * @since 2.0.0
 * @public
 */
export function isValidPercentage(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return false;
    }
    
    return value >= 0 && value <= 100;
}

// No additional exports needed - functions already exported individually 