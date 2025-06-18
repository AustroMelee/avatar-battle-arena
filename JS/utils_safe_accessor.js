/**
 * @fileoverview Safe Object Access Utilities
 * @description Centralized utilities for safely accessing nested object properties
 * @version 1.0
 */

'use strict';

/**
 * Safely retrieves a nested property from an object using dot notation.
 * Prevents errors when accessing properties on undefined/null objects.
 * 
 * @param {object} obj - The object to query
 * @param {string} path - The dot-separated path to the property (e.g., 'user.profile.name')
 * @param {*} defaultValue - The value to return if the path is not found
 * @param {string} [contextName='Unknown Context'] - Context name for debugging
 * @returns {*} The property value or the default value
 * 
 * @example
 * const user = { profile: { name: 'John' } };
 * safeGet(user, 'profile.name', 'Anonymous'); // Returns 'John'
 * safeGet(user, 'profile.age', 0); // Returns 0 (default)
 * safeGet(null, 'any.path', 'fallback'); // Returns 'fallback'
 */
export function safeGet(obj, path, defaultValue, contextName = 'Unknown Context') {
    if (!obj || typeof obj !== 'object') {
        return defaultValue;
    }
    
    if (!path || typeof path !== 'string') {
        console.warn(`[Safe Accessor] Invalid path provided in ${contextName}:`, path);
        return defaultValue;
    }
    
    try {
        const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
        return (value !== undefined && value !== null) ? value : defaultValue;
    } catch (error) {
        console.warn(`[Safe Accessor] Error accessing path "${path}" in ${contextName}:`, error.message);
        return defaultValue;
    }
}

/**
 * Safely sets a nested property on an object using dot notation.
 * Creates intermediate objects as needed.
 * 
 * @param {object} obj - The object to modify
 * @param {string} path - The dot-separated path to the property
 * @param {*} value - The value to set
 * @returns {boolean} True if successful, false otherwise
 * 
 * @example
 * const obj = {};
 * safeSet(obj, 'user.profile.name', 'John'); // Creates nested structure
 * console.log(obj); // { user: { profile: { name: 'John' } } }
 */
export function safeSet(obj, path, value) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    
    if (!path || typeof path !== 'string') {
        return false;
    }
    
    try {
        const parts = path.split('.');
        const lastPart = parts.pop();
        
        let current = obj;
        for (const part of parts) {
            if (!(part in current) || typeof current[part] !== 'object') {
                current[part] = {};
            }
            current = current[part];
        }
        
        current[lastPart] = value;
        return true;
    } catch (error) {
        console.error(`[Safe Accessor] Error setting path "${path}":`, error.message);
        return false;
    }
}

/**
 * Checks if a nested property exists on an object.
 * 
 * @param {object} obj - The object to check
 * @param {string} path - The dot-separated path to check
 * @returns {boolean} True if the property exists and is not null/undefined
 */
export function hasProperty(obj, path) {
    if (!obj || typeof obj !== 'object' || !path) {
        return false;
    }
    
    try {
        const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
        return value !== undefined && value !== null;
    } catch (error) {
        return false;
    }
} 