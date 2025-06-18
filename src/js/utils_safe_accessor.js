/**
 * @fileoverview Avatar Battle Arena - Safe Accessor Utilities
 * @description Defensive property access functions with comprehensive null/undefined checking and type validation
 * @version 2.0.0
 */

'use strict';

//# sourceURL=utils_safe_accessor.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').Fighter} Fighter
 * @typedef {import('./types.js').BattleState} BattleState
 * @typedef {import('./types.js').Move} Move
 */

/**
 * @typedef {Object} SafeAccessOptions
 * @description Options for safe accessor functions
 * @property {boolean} [strict=false] - Throw errors on missing properties instead of returning defaults
 * @property {boolean} [debug=false] - Log access attempts for debugging
 * @property {string} [context='SafeAccessor'] - Context string for error messages
 * @property {boolean} [warnOnMissing=false] - Log warnings for missing properties
 * @property {number} [maxDepth=10] - Maximum depth for property traversal
 */

/**
 * @typedef {Object} PropertyPath
 * @description Represents a property access path
 * @property {string[]} segments - Array of property names
 * @property {string} fullPath - Dot-notation string representation
 * @property {number} depth - Number of nested levels
 * @property {boolean} isValid - Whether the path syntax is valid
 */

/**
 * @typedef {Object} AccessResult
 * @description Result of property access operation
 * @property {boolean} success - Whether access was successful
 * @property {any} value - Retrieved or set value
 * @property {string[]} errors - Array of error messages
 * @property {string[]} warnings - Array of warning messages
 * @property {PropertyPath} path - Parsed property path information
 */

/**
 * @typedef {Object} TypeConstraints
 * @description Type constraints for safe accessors
 * @property {string} [expectedType] - Expected JavaScript type
 * @property {boolean} [allowNull=false] - Whether null values are allowed
 * @property {boolean} [allowUndefined=false] - Whether undefined values are allowed
 * @property {any[]} [allowedValues] - Array of specifically allowed values
 * @property {Function} [validator] - Custom validation function
 */

/**
 * @typedef {Object} NumericConstraints
 * @description Numeric value constraints
 * @property {number} [min] - Minimum value (inclusive)
 * @property {number} [max] - Maximum value (inclusive)
 * @property {boolean} [integer=false] - Must be an integer
 * @property {boolean} [positive=false] - Must be positive
 * @property {number} [precision] - Decimal precision
 */

/**
 * @typedef {Object} StringConstraints
 * @description String value constraints
 * @property {number} [minLength] - Minimum length
 * @property {number} [maxLength] - Maximum length
 * @property {RegExp} [pattern] - Pattern to match
 * @property {string[]} [allowedValues] - Allowed string values
 * @property {boolean} [trim=false] - Trim whitespace
 */

/**
 * @typedef {Object} ArrayConstraints
 * @description Array value constraints
 * @property {number} [minLength] - Minimum array length
 * @property {number} [maxLength] - Maximum array length
 * @property {string} [elementType] - Required type for array elements
 * @property {Function} [elementValidator] - Validator for each element
 * @property {boolean} [unique=false] - Whether elements must be unique
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {number} */
const MAX_SAFE_DEPTH = 10;

/** @type {number} */
const MIN_SAFE_DEPTH = 1;

/** @type {number} */
const DEFAULT_MAX_DEPTH = 5;

/** @type {string} */
const DEFAULT_CONTEXT = 'SafeAccessor';

/** @type {Object<string, any>} */
const DEFAULT_VALUES = {
    'string': '',
    'number': 0,
    'boolean': false,
    'object': {},
    'array': [],
    'function': () => {},
    'null': null,
    'undefined': undefined
};

/** @type {string[]} */
const VALID_TYPES = ['string', 'number', 'boolean', 'object', 'array', 'function', 'null', 'undefined'];

/** @type {SafeAccessOptions} */
const DEFAULT_OPTIONS = {
    strict: false,
    debug: false,
    context: DEFAULT_CONTEXT,
    warnOnMissing: false,
    maxDepth: MAX_SAFE_DEPTH
};

// ============================================================================
// CORE SAFE ACCESSOR FUNCTIONS
// ============================================================================

/**
 * Safely gets a nested property value with optional default
 * 
 * @param {Object} obj - Object to access
 * @param {string} path - Dot-notation property path (e.g., 'user.profile.name')
 * @param {any} [defaultValue=null] - Default value if property is missing
 * @param {SafeAccessOptions} [options={}] - Access options
 * 
 * @returns {any} Property value or default
 * 
 * @throws {TypeError} When obj is not an object
 * @throws {Error} When path is invalid
 * @throws {Error} When in strict mode and property is missing
 * @throws {RangeError} When path depth exceeds maximum
 * 
 * @example
 * // Basic usage
 * const name = safeGet(user, 'profile.name', 'Unknown');
 * 
 * // With type safety
 * const health = safeGet(fighter, 'stats.health', 100);
 * 
 * // Strict mode
 * const id = safeGet(fighter, 'id', null, { strict: true });
 * 
 * // With debugging
 * const value = safeGet(obj, 'deep.nested.prop', 0, { 
 *   debug: true, 
 *   context: 'BattleSystem' 
 * });
 * 
 * @since 2.0.0
 * @public
 */
export function safeGet(obj, path, defaultValue = null, options = {}) {
    // Input validation
    if (obj === null || obj === undefined) {
        if (options.strict) {
            throw new Error(`safeGet: Cannot access property '${path}' on null/undefined object`);
        }
        return defaultValue;
    }

    if (typeof obj !== 'object') {
        throw new TypeError(`safeGet: First argument must be an object, got ${typeof obj}`);
    }

    if (typeof path !== 'string' || !path.trim()) {
        throw new Error('safeGet: Path must be a non-empty string');
    }

    if (typeof options !== 'object' || options === null) {
        throw new TypeError('safeGet: Options must be an object');
    }

    // Merge options with defaults
    /** @type {SafeAccessOptions} */
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Validate maxDepth
    if (typeof opts.maxDepth !== 'number' || opts.maxDepth < MIN_SAFE_DEPTH || opts.maxDepth > MAX_SAFE_DEPTH) {
        throw new RangeError(`safeGet: maxDepth must be between ${MIN_SAFE_DEPTH} and ${MAX_SAFE_DEPTH}`);
    }

    /** @type {string} */
    const context = opts.context || DEFAULT_CONTEXT;

    if (opts.debug) {
        console.debug(`[${context}] Accessing: ${path}`);
    }

    try {
        // Parse property path
        /** @type {PropertyPath} */
        const propertyPath = parsePath(path);

        if (!propertyPath.isValid) {
            throw new Error(`Invalid property path syntax: ${path}`);
        }

        // Validate depth
        if (propertyPath.depth > opts.maxDepth) {
            throw new RangeError(`Property path too deep (${propertyPath.depth} > ${opts.maxDepth}): ${path}`);
        }

        // Navigate the object
        /** @type {any} */
        let current = obj;

        for (let i = 0; i < propertyPath.segments.length; i++) {
            /** @type {string} */
            const segment = propertyPath.segments[i];

            if (current === null || current === undefined) {
                if (opts.strict) {
                    /** @type {string} */
                    const partialPath = propertyPath.segments.slice(0, i).join('.');
                    throw new Error(`safeGet: Property '${segment}' not found on null/undefined at '${partialPath}'`);
                }

                if (opts.warnOnMissing) {
                    /** @type {string} */
                    const partialPath = propertyPath.segments.slice(0, i).join('.');
                    console.warn(`[${context}] Property access on null/undefined at '${partialPath}'`);
                }

                return defaultValue;
            }

            if (typeof current !== 'object') {
                if (opts.strict) {
                    /** @type {string} */
                    const partialPath = propertyPath.segments.slice(0, i).join('.');
                    throw new Error(`safeGet: Cannot access property '${segment}' on non-object (${typeof current}) at '${partialPath}'`);
                }

                if (opts.warnOnMissing) {
                    /** @type {string} */
                    const partialPath = propertyPath.segments.slice(0, i).join('.');
                    console.warn(`[${context}] Property access on non-object at '${partialPath}'`);
                }

                return defaultValue;
            }

            // Check if property exists
            if (!(segment in current)) {
                if (opts.strict) {
                    /** @type {string} */
                    const partialPath = propertyPath.segments.slice(0, i + 1).join('.');
                    throw new Error(`safeGet: Property '${partialPath}' does not exist`);
                }

                if (opts.warnOnMissing) {
                    /** @type {string} */
                    const partialPath = propertyPath.segments.slice(0, i + 1).join('.');
                    console.warn(`[${context}] Missing property: '${partialPath}'`);
                }

                return defaultValue;
            }

            current = current[segment];
        }

        if (opts.debug) {
            console.debug(`[${context}] Found value at '${path}':`, current);
        }

        return current;

    } catch (error) {
        if (opts.strict) {
            throw error;
        }

        console.warn(`[${context}] Error accessing '${path}':`, error.message);
        return defaultValue;
    }
}

/**
 * Safely sets a nested property value with automatic object creation
 * 
 * @param {Object} obj - Object to modify
 * @param {string} path - Dot-notation property path
 * @param {any} value - Value to set
 * @param {SafeAccessOptions} [options={}] - Access options
 * 
 * @returns {boolean} True if property was set successfully
 * 
 * @throws {TypeError} When obj is not an object
 * @throws {Error} When path is invalid
 * @throws {Error} When unable to set property in strict mode
 * @throws {RangeError} When path depth exceeds maximum
 * 
 * @example
 * // Basic usage
 * const success = safeSet(fighter, 'stats.health', 95);
 * 
 * // Auto-create nested objects
 * safeSet(config, 'ui.battle.showDamage', true);
 * 
 * // Strict mode
 * safeSet(obj, 'readonly.prop', 42, { strict: true });
 * 
 * @since 2.0.0
 * @public
 */
export function safeSet(obj, path, value, options = {}) {
    // Input validation
    if (obj === null || obj === undefined) {
        if (options.strict) {
            throw new Error(`safeSet: Cannot set property '${path}' on null/undefined object`);
        }
        return false;
    }

    if (typeof obj !== 'object') {
        throw new TypeError(`safeSet: First argument must be an object, got ${typeof obj}`);
    }

    if (typeof path !== 'string' || !path.trim()) {
        throw new Error('safeSet: Path must be a non-empty string');
    }

    if (typeof options !== 'object' || options === null) {
        throw new TypeError('safeSet: Options must be an object');
    }

    // Merge options with defaults
    /** @type {SafeAccessOptions} */
    const opts = { ...DEFAULT_OPTIONS, ...options };

    /** @type {string} */
    const context = opts.context || DEFAULT_CONTEXT;

    if (opts.debug) {
        console.debug(`[${context}] Setting '${path}' to:`, value);
    }

    try {
        // Parse property path
        /** @type {PropertyPath} */
        const propertyPath = parsePath(path);

        if (!propertyPath.isValid) {
            throw new Error(`Invalid property path syntax: ${path}`);
        }

        // Validate depth
        if (propertyPath.depth > opts.maxDepth) {
            throw new RangeError(`Property path too deep (${propertyPath.depth} > ${opts.maxDepth}): ${path}`);
        }

        // Navigate and create objects as needed
        /** @type {any} */
        let current = obj;

        for (let i = 0; i < propertyPath.segments.length - 1; i++) {
            /** @type {string} */
            const segment = propertyPath.segments[i];

            if (current[segment] === null || current[segment] === undefined) {
                // Create new object
                current[segment] = {};
            } else if (typeof current[segment] !== 'object') {
                if (opts.strict) {
                    /** @type {string} */
                    const partialPath = propertyPath.segments.slice(0, i + 1).join('.');
                    throw new Error(`safeSet: Cannot traverse non-object at '${partialPath}'`);
                }
                
                if (opts.debug) {
                    console.debug(`[${context}] Overwriting non-object at '${segment}'`);
                }
                
                current[segment] = {};
            }

            current = current[segment];
        }

        // Set the final property
        /** @type {string} */
        const finalSegment = propertyPath.segments[propertyPath.segments.length - 1];
        current[finalSegment] = value;

        if (opts.debug) {
            console.debug(`[${context}] Successfully set '${path}'`);
        }

        return true;

    } catch (error) {
        if (opts.strict) {
            throw error;
        }

        console.warn(`[${context}] Error setting '${path}':`, error.message);
        return false;
    }
}

/**
 * Safely checks if a nested property exists
 * 
 * @param {Object} obj - Object to check
 * @param {string} path - Dot-notation property path
 * @param {SafeAccessOptions} [options={}] - Access options
 * 
 * @returns {boolean} True if property exists
 * 
 * @throws {TypeError} When obj is not an object
 * @throws {Error} When path is invalid
 * 
 * @example
 * // Check property existence
 * if (safeHas(fighter, 'stats.health')) {
 *   console.log('Fighter has health stats');
 * }
 * 
 * // Check deeply nested properties
 * const hasSpecialAbility = safeHas(fighter, 'abilities.special.lightning');
 * 
 * @since 2.0.0
 * @public
 */
export function safeHas(obj, path, options = {}) {
    // Input validation
    if (obj === null || obj === undefined) {
        return false;
    }

    if (typeof obj !== 'object') {
        throw new TypeError(`safeHas: First argument must be an object, got ${typeof obj}`);
    }

    if (typeof path !== 'string' || !path.trim()) {
        throw new Error('safeHas: Path must be a non-empty string');
    }

    if (typeof options !== 'object' || options === null) {
        throw new TypeError('safeHas: Options must be an object');
    }

    /** @type {string} */
    const context = options.context || DEFAULT_CONTEXT;

    if (options.debug) {
        console.debug(`[${context}] Checking existence: ${path}`);
    }

    try {
        // Parse property path
        /** @type {PropertyPath} */
        const propertyPath = parsePath(path);

        // Navigate the object
        /** @type {any} */
        let current = obj;

        for (const segment of propertyPath.segments) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return false;
            }

            if (!(segment in current)) {
                return false;
            }

            current = current[segment];
        }

        return true;

    } catch (error) {
        console.warn(`[${context}] Error checking '${path}':`, error.message);
        return false;
    }
}

// ============================================================================
// SPECIALIZED SAFE ACCESSORS
// ============================================================================

/**
 * Safely gets a numeric value with validation
 * 
 * @param {Object} obj - Object to access
 * @param {string} path - Property path
 * @param {number} [defaultValue=0] - Default numeric value
 * @param {Object} [constraints={}] - Numeric constraints
 * @param {SafeAccessOptions} [options={}] - Access options
 * 
 * @returns {number} Numeric value or default
 * 
 * @throws {TypeError} When result is not a number in strict mode
 * @throws {RangeError} When value violates constraints in strict mode
 * 
 * @example
 * // Basic numeric access
 * const health = safeGetNumber(fighter, 'health', 100);
 * 
 * // With constraints
 * const percentage = safeGetNumber(fighter, 'accuracy', 0.8, {
 *   min: 0, max: 1
 * });
 * 
 * @since 2.0.0
 * @public
 */
export function safeGetNumber(obj, path, defaultValue = 0, constraints = {}, options = {}) {
    // Input validation
    if (typeof defaultValue !== 'number') {
        throw new TypeError('safeGetNumber: defaultValue must be a number');
    }

    if (typeof constraints !== 'object' || constraints === null) {
        throw new TypeError('safeGetNumber: constraints must be an object');
    }

    /** @type {any} */
    const value = safeGet(obj, path, defaultValue, options);

    // Type validation
    if (typeof value !== 'number') {
        if (options.strict) {
            throw new TypeError(`safeGetNumber: Property '${path}' is not a number (got ${typeof value})`);
        }
        return defaultValue;
    }

    // NaN check
    if (Number.isNaN(value)) {
        if (options.strict) {
            throw new TypeError(`safeGetNumber: Property '${path}' is NaN`);
        }
        return defaultValue;
    }

    // Constraints validation
    if (typeof constraints.min === 'number' && value < constraints.min) {
        if (options.strict) {
            throw new RangeError(`safeGetNumber: Property '${path}' (${value}) is below minimum (${constraints.min})`);
        }
        return Math.max(constraints.min, defaultValue);
    }

    if (typeof constraints.max === 'number' && value > constraints.max) {
        if (options.strict) {
            throw new RangeError(`safeGetNumber: Property '${path}' (${value}) is above maximum (${constraints.max})`);
        }
        return Math.min(constraints.max, defaultValue);
    }

    return value;
}

/**
 * Safely gets a string value with validation
 * 
 * @param {Object} obj - Object to access
 * @param {string} path - Property path
 * @param {string} [defaultValue=''] - Default string value
 * @param {Object} [constraints={}] - String constraints
 * @param {SafeAccessOptions} [options={}] - Access options
 * 
 * @returns {string} String value or default
 * 
 * @throws {TypeError} When result is not a string in strict mode
 * @throws {Error} When value violates constraints in strict mode
 * 
 * @example
 * // Basic string access
 * const name = safeGetString(fighter, 'name', 'Unknown');
 * 
 * // With constraints
 * const id = safeGetString(fighter, 'id', '', {
 *   minLength: 1, pattern: /^[a-z_]+$/
 * });
 * 
 * @since 2.0.0
 * @public
 */
export function safeGetString(obj, path, defaultValue = '', constraints = {}, options = {}) {
    // Input validation
    if (typeof defaultValue !== 'string') {
        throw new TypeError('safeGetString: defaultValue must be a string');
    }

    if (typeof constraints !== 'object' || constraints === null) {
        throw new TypeError('safeGetString: constraints must be an object');
    }

    /** @type {any} */
    const value = safeGet(obj, path, defaultValue, options);

    // Type validation
    if (typeof value !== 'string') {
        if (options.strict) {
            throw new TypeError(`safeGetString: Property '${path}' is not a string (got ${typeof value})`);
        }
        return defaultValue;
    }

    // Length constraints
    if (typeof constraints.minLength === 'number' && value.length < constraints.minLength) {
        if (options.strict) {
            throw new Error(`safeGetString: Property '${path}' length (${value.length}) is below minimum (${constraints.minLength})`);
        }
        return defaultValue;
    }

    if (typeof constraints.maxLength === 'number' && value.length > constraints.maxLength) {
        if (options.strict) {
            throw new Error(`safeGetString: Property '${path}' length (${value.length}) is above maximum (${constraints.maxLength})`);
        }
        return value.substring(0, constraints.maxLength);
    }

    // Pattern validation
    if (constraints.pattern instanceof RegExp && !constraints.pattern.test(value)) {
        if (options.strict) {
            throw new Error(`safeGetString: Property '${path}' does not match pattern ${constraints.pattern}`);
        }
        return defaultValue;
    }

    return value;
}

/**
 * Safely gets an array value with validation
 * 
 * @param {Object} obj - Object to access
 * @param {string} path - Property path
 * @param {any[]} [defaultValue=[]] - Default array value
 * @param {Object} [constraints={}] - Array constraints
 * @param {SafeAccessOptions} [options={}] - Access options
 * 
 * @returns {any[]} Array value or default
 * 
 * @throws {TypeError} When result is not an array in strict mode
 * @throws {Error} When value violates constraints in strict mode
 * 
 * @example
 * // Basic array access
 * const moves = safeGetArray(fighter, 'moves', []);
 * 
 * // With constraints
 * const items = safeGetArray(inventory, 'items', [], {
 *   minLength: 1, maxLength: 10
 * });
 * 
 * @since 2.0.0
 * @public
 */
export function safeGetArray(obj, path, defaultValue = [], constraints = {}, options = {}) {
    // Input validation
    if (!Array.isArray(defaultValue)) {
        throw new TypeError('safeGetArray: defaultValue must be an array');
    }

    if (typeof constraints !== 'object' || constraints === null) {
        throw new TypeError('safeGetArray: constraints must be an object');
    }

    /** @type {any} */
    const value = safeGet(obj, path, defaultValue, options);

    // Type validation
    if (!Array.isArray(value)) {
        if (options.strict) {
            throw new TypeError(`safeGetArray: Property '${path}' is not an array (got ${typeof value})`);
        }
        return defaultValue;
    }

    // Length constraints
    if (typeof constraints.minLength === 'number' && value.length < constraints.minLength) {
        if (options.strict) {
            throw new Error(`safeGetArray: Property '${path}' length (${value.length}) is below minimum (${constraints.minLength})`);
        }
        return defaultValue;
    }

    if (typeof constraints.maxLength === 'number' && value.length > constraints.maxLength) {
        if (options.strict) {
            throw new Error(`safeGetArray: Property '${path}' length (${value.length}) is above maximum (${constraints.maxLength})`);
        }
        return value.slice(0, constraints.maxLength);
    }

    return value;
}

// ============================================================================
// BATTLE-SPECIFIC SAFE ACCESSORS
// ============================================================================

/**
 * Safely gets fighter health with validation
 * 
 * @param {Fighter} fighter - Fighter object
 * @param {string} [healthType='health'] - Health property type ('health', 'maxHealth')
 * @param {SafeAccessOptions} [options={}] - Access options
 * 
 * @returns {number} Health value (0-100)
 * 
 * @throws {TypeError} When fighter is invalid
 * @throws {RangeError} When health is out of bounds in strict mode
 * 
 * @example
 * // Get current health
 * const health = safeFighterHealth(fighter);
 * 
 * // Get max health
 * const maxHealth = safeFighterHealth(fighter, 'maxHealth');
 * 
 * @since 2.0.0
 * @public
 */
export function safeFighterHealth(fighter, healthType = 'health', options = {}) {
    if (!fighter || typeof fighter !== 'object') {
        throw new TypeError('safeFighterHealth: fighter must be a valid object');
    }

    if (typeof healthType !== 'string') {
        throw new TypeError('safeFighterHealth: healthType must be a string');
    }

    /** @type {number} */
    const defaultHealth = healthType === 'maxHealth' ? 100 : 0;

    return safeGetNumber(fighter, healthType, defaultHealth, { min: 0, max: 100 }, options);
}

/**
 * Safely gets fighter move by index
 * 
 * @param {Fighter} fighter - Fighter object
 * @param {number} moveIndex - Move index
 * @param {SafeAccessOptions} [options={}] - Access options
 * 
 * @returns {Move | null} Move object or null if not found
 * 
 * @throws {TypeError} When parameters are invalid
 * @throws {RangeError} When index is out of bounds in strict mode
 * 
 * @example
 * // Get first move
 * const firstMove = safeFighterMove(fighter, 0);
 * 
 * // Strict mode with bounds checking
 * const move = safeFighterMove(fighter, 2, { strict: true });
 * 
 * @since 2.0.0
 * @public
 */
export function safeFighterMove(fighter, moveIndex, options = {}) {
    if (!fighter || typeof fighter !== 'object') {
        throw new TypeError('safeFighterMove: fighter must be a valid object');
    }

    if (typeof moveIndex !== 'number' || !Number.isInteger(moveIndex)) {
        throw new TypeError('safeFighterMove: moveIndex must be an integer');
    }

    /** @type {any[]} */
    const moves = safeGetArray(fighter, 'moves', [], {}, options);

    if (moveIndex < 0 || moveIndex >= moves.length) {
        if (options.strict) {
            throw new RangeError(`safeFighterMove: Move index ${moveIndex} out of bounds (0-${moves.length - 1})`);
        }
        return null;
    }

    return moves[moveIndex];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parses a dot-notation property path into segments
 * 
 * @param {string} path - Dot-notation path
 * 
 * @returns {PropertyPath} Parsed property path
 * 
 * @throws {Error} When path is invalid
 * 
 * @private
 * @since 2.0.0
 */
function parsePath(path) {
    if (typeof path !== 'string' || !path.trim()) {
        throw new Error('parsePath: Path must be a non-empty string');
    }

    /** @type {string[]} */
    const segments = path.split('.').filter(segment => segment.length > 0);

    if (segments.length === 0) {
        throw new Error('parsePath: Path must contain at least one valid segment');
    }

    // Validate segments
    for (let i = 0; i < segments.length; i++) {
        /** @type {string} */
        const segment = segments[i];
        
        if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(segment)) {
            throw new Error(`parsePath: Invalid property name '${segment}' at position ${i}`);
        }
    }

    return {
        segments,
        fullPath: segments.join('.'),
        depth: segments.length,
        isValid: true
    };
}

/**
 * Gets default value for a specific type
 * 
 * @param {string} type - Type name
 * 
 * @returns {any} Default value for type
 * 
 * @private
 * @since 2.0.0
 */
function getDefaultForType(type) {
    return DEFAULT_VALUES[type] || null;
}

/**
 * Creates a deep clone of an object for safe manipulation
 * 
 * @param {any} obj - Object to clone
 * @param {number} [maxDepth=5] - Maximum clone depth
 * 
 * @returns {any} Deep clone of object
 * 
 * @throws {Error} When object is too deeply nested
 * 
 * @example
 * // Safe clone for modification
 * const fighterCopy = safeClone(fighter);
 * fighterCopy.health = 50; // Won't modify original
 * 
 * @since 2.0.0
 * @public
 */
export function safeClone(obj, maxDepth = 5) {
    if (maxDepth <= 0) {
        throw new Error('safeClone: Maximum clone depth exceeded');
    }

    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => safeClone(item, maxDepth - 1));
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }

    if (obj instanceof RegExp) {
        return new RegExp(obj.source, obj.flags);
    }

    /** @type {Object<string, any>} */
    const cloned = {};
    
    for (const [key, value] of Object.entries(obj)) {
        cloned[key] = safeClone(value, maxDepth - 1);
    }

    return cloned;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    safeGet,
    safeSet, 
    safeHas,
    safeGetNumber,
    safeGetString,
    safeGetArray,
    safeFighterHealth,
    safeFighterMove,
    safeClone
}; 