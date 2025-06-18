    "use strict";

    /**
     * @fileoverview Safe Cloning Utility
     * @description Provides a function for deep cloning objects with cycle detection.
     */

    /**
     * Deep clones an object, handling cycles and a maximum depth.
     * @param {any} obj - The object to clone.
     * @param {number} [maxDepth=5] - The maximum depth to clone.
     * @returns {any} The cloned object.
     */
    export function safeClone(obj, maxDepth = 5) {
        const seen = new WeakMap();

        /**
         * @param {any} current
         * @param {number} depth
         */
        function clone(current, depth) {
            if (current === null || typeof current !== "object") {
                return current;
            }

            if (depth >= maxDepth) {
                return null; // Or some other indicator of reaching max depth
            }

            if (seen.has(current)) {
                return seen.get(current);
            }

            if (current instanceof Date) {
                return new Date(current.getTime());
            }

            if (current instanceof RegExp) {
                return new RegExp(current);
            }

            const newObj = /** @type {any} */ (Array.isArray(current) ? [] : {});

            seen.set(current, newObj);

            for (const key in current) {
                if (Object.prototype.hasOwnProperty.call(current, key)) {
                    newObj[key] = clone(current[key], depth + 1);
                }
            }

            return newObj;
        }

        return clone(obj, 0);
    }