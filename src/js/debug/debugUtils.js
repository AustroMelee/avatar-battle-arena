/**
 * @fileoverview Main Debug Utils Class for Avatar Battle Arena
 * @description Core debug utility class that orchestrates all debug modules
 * @version 1.0.0
 */

'use strict';

// Import configuration
import { DEBUG_CONFIG, DEBUG_FLAGS } from './debugConfig.js';

// Import specialized modules
import { 
    analyzeBattle, 
    analyzeEventTypes, 
    analyzeCharacterPerformance, 
    analyzePhases, 
    analyzePerformance, 
    calculateBattleDuration 
} from './battleAnalysis.js';

import { 
    setupGlobalErrorHandling, 
    logError, 
    analyzeErrors, 
    serializeErrorLog, 
    clearErrorLog 
} from './errorTracking.js';

import { 
    setupPerformanceObserver, 
    takeMemorySnapshot, 
    startMemoryMonitoring, 
    stopMemoryMonitoring, 
    measureExecutionTime, 
    analyzePerformanceMetrics 
} from './performanceTracking.js';

import { 
    generateReport, 
    exportDebugData, 
    exportPerformanceCSV, 
    clearDebugData 
} from './reporting.js';

/**
 * Main debug utility class providing comprehensive debugging tools.
 * Orchestrates all debug modules and provides a unified interface.
 * 
 * @class DebugUtils
 * @example
 * // Initialize debug utilities
 * const debug = new DebugUtils();
 * 
 * // Analyze a battle result
 * debug.analyzeBattle(battleResult);
 * 
 * // Monitor performance
 * debug.startPerformanceMonitoring();
 */
export class DebugUtils {
    constructor() {
        // Initialize data storage arrays
        this.logs = [];
        this.performanceMetrics = [];
        this.memorySnapshots = [];
        this.errorLog = [];
        
        // Store monitoring interval ID
        this.memoryMonitoringId = null;
        
        console.log('[Debug Utils] Initialized - Version 1.0.0');
        console.log('[Debug Utils] Available modules: Battle Analysis, Error Tracking, Performance Tracking, Reporting');
        
        // Initialize subsystems based on configuration
        this._initializeSubsystems();
    }

    /**
     * Initializes debug subsystems based on configuration flags.
     * @private
     */
    _initializeSubsystems() {
        if (DEBUG_FLAGS.ERROR_TRACKING && DEBUG_CONFIG.enableErrorTracking) {
            setupGlobalErrorHandling(this.errorLog);
        }
        
        if (DEBUG_FLAGS.PERFORMANCE_TRACKING && DEBUG_CONFIG.enablePerformanceTracking) {
            setupPerformanceObserver(this.performanceMetrics);
        }
        
        if (DEBUG_FLAGS.MEMORY_MONITORING && DEBUG_CONFIG.enableMemoryTracking) {
            // Take initial memory snapshot
            takeMemorySnapshot(this.memorySnapshots);
        }
    }

    // === BATTLE ANALYSIS METHODS ===
    
    /**
     * Analyzes a complete battle result with detailed breakdown.
     * Delegates to the battle analysis module.
     */
    analyzeBattle(battleResult) {
        if (!DEBUG_FLAGS.BATTLE_ANALYSIS) {
            console.warn('[Debug Utils] Battle analysis is disabled');
            return;
        }
        
        return analyzeBattle(battleResult);
    }

    /**
     * Analyzes event types in a battle log.
     */
    analyzeEventTypes(battleLog) {
        return analyzeEventTypes(battleLog);
    }

    /**
     * Analyzes character performance from battle results.
     */
    analyzeCharacterPerformance(battleResult) {
        return analyzeCharacterPerformance(battleResult);
    }

    /**
     * Analyzes battle phases and transitions.
     */
    analyzePhases(battleLog) {
        return analyzePhases(battleLog);
    }

    /**
     * Analyzes performance metrics from battle logs.
     */
    analyzePerformance(battleLog) {
        return analyzePerformance(battleLog);
    }

    /**
     * Calculates battle duration from event timestamps.
     */
    calculateBattleDuration(battleLog) {
        return calculateBattleDuration(battleLog);
    }

    // === ERROR TRACKING METHODS ===
    
    /**
     * Logs a custom error.
     */
    logError(error, context = null) {
        return logError(this.errorLog, error, context);
    }

    /**
     * Analyzes error patterns and frequencies.
     */
    analyzeErrors() {
        return analyzeErrors(this.errorLog);
    }

    /**
     * Gets the current error log.
     */
    getErrorLog() {
        return [...this.errorLog]; // Return copy to prevent external modification
    }

    // === PERFORMANCE TRACKING METHODS ===
    
    /**
     * Takes a memory snapshot.
     */
    takeMemorySnapshot() {
        return takeMemorySnapshot(this.memorySnapshots);
    }

    /**
     * Starts automatic memory monitoring.
     */
    startMemoryMonitoring(interval = 5000) {
        if (this.memoryMonitoringId) {
            console.warn('[Debug Utils] Memory monitoring already active');
            return this.memoryMonitoringId;
        }
        
        this.memoryMonitoringId = startMemoryMonitoring(this.memorySnapshots, interval);
        return this.memoryMonitoringId;
    }

    /**
     * Stops memory monitoring.
     */
    stopMemoryMonitoring() {
        if (this.memoryMonitoringId) {
            stopMemoryMonitoring(this.memoryMonitoringId);
            this.memoryMonitoringId = null;
        }
    }

    /**
     * Measures execution time of a function.
     */
    measureExecutionTime(fn, label) {
        return measureExecutionTime(fn, label, this.performanceMetrics);
    }

    /**
     * Analyzes collected performance metrics.
     */
    analyzePerformanceMetrics() {
        return analyzePerformanceMetrics(this.performanceMetrics);
    }

    /**
     * Gets current performance metrics.
     */
    getPerformanceMetrics() {
        return [...this.performanceMetrics]; // Return copy
    }

    /**
     * Gets current memory snapshots.
     */
    getMemorySnapshots() {
        return [...this.memorySnapshots]; // Return copy
    }

    // === REPORTING METHODS ===
    
    /**
     * Generates a comprehensive debug report.
     */
    generateReport() {
        return generateReport(
            this.performanceMetrics, 
            this.memorySnapshots, 
            this.errorLog, 
            this.logs
        );
    }

    /**
     * Exports debug data to a downloadable JSON file.
     */
    exportDebugData(filename) {
        if (!DEBUG_FLAGS.EXPORT_FEATURES) {
            console.warn('[Debug Utils] Export features are disabled');
            return;
        }
        
        const report = this.generateReport();
        return exportDebugData(report, filename);
    }

    /**
     * Exports performance metrics as CSV.
     */
    exportPerformanceCSV(filename) {
        if (!DEBUG_FLAGS.EXPORT_FEATURES) {
            console.warn('[Debug Utils] Export features are disabled');
            return;
        }
        
        return exportPerformanceCSV(this.performanceMetrics, filename);
    }

    /**
     * Clears all debug data.
     */
    clearDebugData() {
        return clearDebugData(
            this.performanceMetrics, 
            this.memorySnapshots, 
            this.errorLog, 
            this.logs
        );
    }

    // === UTILITY METHODS ===
    
    /**
     * Adds a custom log entry.
     */
    log(message, level = 'debug', data = null) {
        const logEntry = {
            message,
            level,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.logs.push(logEntry);
        
        // Respect max log entries limit
        if (this.logs.length > DEBUG_CONFIG.maxLogEntries) {
            this.logs.shift(); // Remove oldest entry
        }
        
        // Console output based on log level and config
        if (DEBUG_CONFIG.enableConsoleLogging) {
            const consoleMethod = console[level] || console.log;
            consoleMethod(`[Debug Log] ${message}`, data);
        }
    }

    /**
     * Gets current debug configuration.
     */
    getConfig() {
        return { ...DEBUG_CONFIG, ...DEBUG_FLAGS };
    }

    /**
     * Gets current status of all debug systems.
     */
    getStatus() {
        return {
            config: this.getConfig(),
            dataStats: {
                logs: this.logs.length,
                performanceMetrics: this.performanceMetrics.length,
                memorySnapshots: this.memorySnapshots.length,
                errors: this.errorLog.length
            },
            memoryMonitoring: {
                active: this.memoryMonitoringId !== null,
                intervalId: this.memoryMonitoringId
            },
            lastSnapshot: this.memorySnapshots[this.memorySnapshots.length - 1] || null
        };
    }

    /**
     * Cleanup method for proper shutdown.
     */
    destroy() {
        this.stopMemoryMonitoring();
        console.log('[Debug Utils] Debug utilities shut down');
    }
} 