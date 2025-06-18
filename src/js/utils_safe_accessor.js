"use strict";

/**
 * @fileoverview Core Safe Accessor Utilities
 * @description Defensive property access functions with null/undefined checking.
 */

/**
 * @typedef {import('./types/utility.js').SafeAccessOptions} SafeAccessOptions
 * @typedef {import('./types/utility.js').PropertyPath} PropertyPath
 */

const MAX_SAFE_DEPTH = 10;
const MIN_SAFE_DEPTH = 1;
const DEFAULT_CONTEXT = "SafeAccessor";

const DEFAULT_OPTIONS = {
    strict: false,
    debug: false,
    context: DEFAULT_CONTEXT,
    warnOnMissing: false,
    maxDepth: MAX_SAFE_DEPTH
};

/**
 * Parses a dot-notation string path into segments.
 * @param {string} path - The path string.
 * @returns {PropertyPath}
 * @private
 */
function parsePath(path) {
    const segments = path.split(".");
    const depth = segments.length;
    return {
        segments,
        fullPath: path,
        depth,
        isValid: segments.every(s => s.length > 0)
    };
}

/**
 * Safely gets a nested property value.
 * @param {object | null | undefined} obj
 * @param {string} path
 * @param {any} [defaultValue=null]
 * @param {SafeAccessOptions} [options={}]
 * @returns {any}
 */
export function safeGet(obj, path, defaultValue = null, options = {}) {
    if (obj === null || obj === undefined) {
        return defaultValue;
    }

    if (typeof obj !== "object") {
        throw new TypeError(`safeGet: First argument must be an object, got ${typeof obj}`);
    }
    
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const propertyPath = parsePath(path);

    if (propertyPath.depth > opts.maxDepth) {
        throw new RangeError(`Property path too deep (${propertyPath.depth} > ${opts.maxDepth}): ${path}`);
    }

    let current = /** @type {any} */ (obj);
    for (const segment of propertyPath.segments) {
        if (current === null || current === undefined) {
            if (opts.strict) {
                throw new Error(`safeGet: Property '${segment}' not found on null/undefined`);
            }
            return defaultValue;
        }
        current = current[segment];
    }
    return current === undefined ? defaultValue : current;
}