/**
 * @namespace globalThis
 */

/**
 * @property {import('../debug/debugUtils.js').DebugUtils} [DEBUG]
 * @property {object} [DEBUG_QUICK]
 * @property {typeof import('../debug/debugConfig.js').DEBUG_CONFIG} [DEBUG_CONFIG]
 */

/**
 * @typedef {import('../debug/debugUtils.js').DebugUtils} DebugUtils
 */

/**
 * Extends the global Window interface for TypeScript type checking.
 * @global
 * @typedef {object} Window
 * @property {DebugUtils} [DEBUG] - The global debug utility instance.
 * @property {object} [DEBUG_QUICK] - Quick access shortcuts for debugging.
 * @property {import('../debug/debugConfig.js').DebugConfig} [DEBUG_CONFIG] - Global debug configuration.
 */