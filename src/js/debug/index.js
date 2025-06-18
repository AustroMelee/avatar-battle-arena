/**
 * @fileoverview Debug Utilities Barrel Export
 * @description Main entry point for debug utilities with both flat and namespaced exports
 * @version 1.0.0
 */

"use strict";

// Configuration exports
export { DEBUG_CONFIG, DEBUG_FLAGS, LOG_LEVELS } from "./debugConfig.js";

// Main class export
import { DebugUtils } from "./debugUtils.js";
export { DebugUtils };

// Global initialization
export { initializeGlobalDebug, cleanupGlobalDebug } from "./debugGlobal.js";

// Flat exports for individual functions
export {
    analyzeBattle,
    analyzeEventTypes,
    analyzeCharacterPerformance,
    analyzePhases,
    analyzePerformance,
    calculateBattleDuration
} from "./battleAnalysis.js";

export {
    setupGlobalErrorHandling,
    logError,
    analyzeErrors,
    serializeErrorLog,
    clearErrorLog
} from "./errorTracking.js";

export {
    setupPerformanceObserver,
    takeMemorySnapshot,
    startMemoryMonitoring,
    stopMemoryMonitoring,
    measureExecutionTime,
    analyzePerformanceMetrics
} from "./performanceTracking.js";

export {
    generateReport,
    exportDebugData,
    exportPerformanceCSV,
    clearDebugData
} from "./reporting.js";

// Namespaced exports for organized access
import * as BattleAnalysis from "./battleAnalysis.js";
import * as ErrorTracking from "./errorTracking.js";
import * as PerformanceTracking from "./performanceTracking.js";
import * as Reporting from "./reporting.js";
import * as Config from "./debugConfig.js";

export {
    BattleAnalysis,
    ErrorTracking,
    PerformanceTracking,
    Reporting,
    Config
};

/**
 * Factory function to create a new DebugUtils instance with custom config.
 * 
 * @param {Object} customConfig - Custom configuration overrides
 * @returns {DebugUtils} New debug utilities instance
 * 
 * @example
 * const customDebug = createDebugUtils({
 *   enableConsoleLogging: false,
 *   maxLogEntries: 500
 * });
 */
export function createDebugUtils(customConfig = {}) {
    // Temporarily override config
    const originalConfig = { ...Config.DEBUG_CONFIG };
    Object.assign(Config.DEBUG_CONFIG, customConfig);
    
    const debugUtils = new DebugUtils();
    
    // Restore original config
    Object.assign(Config.DEBUG_CONFIG, originalConfig);
    
    return debugUtils;
}

/**
 * Convenience function to quickly analyze a battle result.
 * Creates a temporary debug instance, analyzes the battle, and returns the analysis.
 * 
 * @param {Object} battleResult - Battle result to analyze
 * @returns {void}
 * 
 * @example
 * import { quickAnalyzeBattle } from './debug/index.js';
 * quickAnalyzeBattle(simulateBattle('aang', 'azula', 'fire-nation-capital', 'noon'));
 */
export function quickAnalyzeBattle(battleResult) {
    const debug = new DebugUtils();
    debug.analyzeBattle(battleResult);
}

/**
 * Version information for the debug utilities.
 */
export const VERSION = "1.0.0";

/**
 * Module information for debugging the debug system itself.
 */
export const MODULE_INFO = {
    version: VERSION,
    modules: [
        "debugConfig",
        "debugUtils",
        "debugGlobal",
        "battleAnalysis",
        "errorTracking",
        "performanceTracking",
        "reporting"
    ],
    description: "Modular debug utilities for Avatar Battle Arena",
    author: "Battle Arena Development Team"
}; 