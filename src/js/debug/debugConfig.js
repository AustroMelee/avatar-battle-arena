/**
 * @fileoverview Debug Configuration for Avatar Battle Arena
 * @description Centralized debug configuration and flags
 * @version 1.0.0
 */

'use strict';

/**
 * Global debug configuration object.
 * Controls various debug features and their behavior.
 */
export const DEBUG_CONFIG = {
    enableConsoleLogging: true,
    enablePerformanceTracking: true,
    enableMemoryTracking: true,
    enableErrorTracking: true,
    logLevel: 'debug', // 'debug', 'info', 'warn', 'error'
    maxLogEntries: 1000
};

/**
 * Debug feature flags for conditional activation.
 */
export const DEBUG_FLAGS = {
    BATTLE_ANALYSIS: true,
    PERFORMANCE_TRACKING: true,
    ERROR_TRACKING: true,
    MEMORY_MONITORING: true,
    EXPORT_FEATURES: true
};

/**
 * Debug logging levels enumeration.
 */
export const LOG_LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
}; 