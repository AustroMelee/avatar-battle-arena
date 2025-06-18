/**
 * @fileoverview Utility functions for the state management module.
 */

"use strict";

/**
 * Deeply merges two objects.
 * @param {object} target - The target object.
 * @param {object} source - The source object.
 * @returns {object} The merged object.
 */
export function deepMerge(target, source) {
    // @ts-ignore
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            // @ts-ignore
            if (isObject(source[key])) {
                if (!(key in target)) {
                    // @ts-ignore
                    Object.assign(output, { [key]: source[key] });
                } else {
                    // @ts-ignore
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                // @ts-ignore
                Object.assign(output, { [key]: source[key] });
            }
        });
    }

    return output;
}

/**
 * Checks if a variable is an object.
 * @param {any} item - The variable to check.
 * @returns {boolean} True if the variable is an object.
 */
function isObject(item) {
    return (item && typeof item === "object" && !Array.isArray(item));
} 