/**
 * @fileoverview Random string and ID generation utilities.
 */

"use strict";

import { randomInt } from "./numeric.js";

const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generates a random string of a given length.
 * @param {number} length
 * @param {string} [charset=DEFAULT_CHARSET]
 * @returns {string}
 */
export function randomString(length, charset = DEFAULT_CHARSET) {
    if (typeof length !== "number" || length < 0) {
        throw new RangeError("Length must be a non-negative number.");
    }
    if (typeof charset !== "string" || charset.length === 0) {
        throw new Error("Charset must be a non-empty string.");
    }
    let result = "";
    for (let i = 0; i < length; i++) {
        result += charset[randomInt(0, charset.length - 1)];
    }
    return result;
}

/**
 * Generates a random v4 UUID.
 * @returns {string}
 */
export function randomUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
} 