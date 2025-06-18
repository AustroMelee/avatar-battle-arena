"use strict";

/**
 * @fileoverview Utility Type Definitions
 * @description Defines various helper and utility data structures for validation, logging, and configuration.
 */

// ============================================================================
// UTILITY AND HELPER TYPES
// ============================================================================

/**
 * @typedef {Object} ValidationOptions
 * @description Options for number validation functions
 * @property {boolean} [strict=false] - Throw errors instead of returning defaults
 * @property {boolean} [allowInfinity=false] - Allow Infinity and -Infinity values
 * @property {boolean} [allowNaN=false] - Allow NaN values
 * @property {boolean} [coerce=true] - Attempt to coerce non-numbers to numbers
 */

/**
 * @typedef {Object} ValidationResult
 * @description Result of number validation
 * @property {boolean} isValid - Whether the number passed validation
 * @property {number | null} value - Validated/sanitized value
 * @property {string[]} errors - Array of validation error messages
 */

/**
 * @typedef {Object} RangeConstraint
 * @description Numeric range constraint
 * @property {number} [min] - Minimum allowed value (inclusive)
 * @property {number} [max] - Maximum allowed value (inclusive)
 */

/**
 * @typedef {Object} SanitizationOptions
 * @description Options for number sanitization
 * @property {boolean} [strict=false] - Throw errors on invalid input
 * @property {number} [defaultValue=0] - Default value for invalid input
 */

/**
 * @typedef {Object} NumericStatistics
 * @description Statistical information about a numeric value
 * @property {boolean} isInteger - Whether value is an integer
 * @property {boolean} isPositive - Whether value is positive
 */

/**
 * @typedef {Object} LogEntry
 * @description Structured log entry
 * @property {string} level - Log level (debug, info, warn, error)
 * @property {string} message - Log message
 * @property {string} module - Module that generated log
 */
 
/**
 * @typedef {Object} ConfigOptions
 * @description Configuration options
 * @property {boolean} debugMode - Debug mode enabled
 * @property {boolean} performanceTracking - Performance tracking enabled
 */
 
/**
 * @typedef {Object} ErrorContext
 * @description Error context information
 * @property {string} module - Module where error occurred
 * @property {string} function - Function where error occurred
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

export {}; 