// @ts-nocheck
"use strict";

/**
 * @fileoverview Performance Tracking Module for Debug Utilities
 * @description Handles performance monitoring, memory tracking, and metrics collection
 * @version 1.0.0
 */

/**
 * Sets up performance observer for monitoring resource loading and custom measures.
 * 
 * @param {Array} performanceMetrics - Array to store performance data
 * 
 * @example
 * const performanceMetrics = [];
 * setupPerformanceObserver(performanceMetrics);
 */
export function setupPerformanceObserver(performanceMetrics) {
    if ("PerformanceObserver" in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.initiatorType === "script" || entry.initiatorType === "xmlhttprequest") {
                        const metric = {
                            name: entry.name,
                            duration: entry.duration,
                            startTime: entry.startTime,
                            entryType: entry.entryType,
                            initiatorType: entry.initiatorType,
                            timestamp: new Date().toISOString()
                        };
                        
                        performanceMetrics.push(metric);
                        console.debug(`[Performance Observer] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
                    }
                });
            });
            
            observer.observe({ entryTypes: ["resource", "measure", "navigation"] });
            console.log("[Performance Tracking] Performance Observer initialized");
        } catch (error) {
            console.warn("[Performance Tracking] Performance Observer setup failed:", error);
        }
    } else {
        console.warn("[Performance Tracking] PerformanceObserver not supported");
    }
}

/**
 * Takes a memory snapshot using Performance Memory API.
 * 
 * @param {Array} memorySnapshots - Array to store memory snapshots
 * @returns {Object|null} Memory snapshot or null if not supported
 */
export function takeMemorySnapshot(memorySnapshots) {
    if ("memory" in performance) {
        const snapshot = {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            timestamp: new Date().toISOString(),
            formattedUsage: {
                used: formatBytes(performance.memory.usedJSHeapSize),
                total: formatBytes(performance.memory.totalJSHeapSize),
                limit: formatBytes(performance.memory.jsHeapSizeLimit)
            }
        };
        
        memorySnapshots.push(snapshot);
        return snapshot;
    } else {
        console.warn("[Performance Tracking] Memory API not supported");
        return null;
    }
}

/**
 * Starts automatic memory monitoring at regular intervals.
 * 
 * @param {Array} memorySnapshots - Array to store memory snapshots
 * @param {number} [interval=5000] - Monitoring interval in milliseconds
 * @returns {number} Interval ID for stopping the monitor
 */
export function startMemoryMonitoring(memorySnapshots, interval = 5000) {
    console.log(`[Performance Tracking] Starting memory monitoring (${interval}ms intervals)`);
    
    return setInterval(() => {
        takeMemorySnapshot(memorySnapshots);
    }, interval);
}

/**
 * Stops memory monitoring.
 * 
 * @param {number} intervalId - Interval ID returned by startMemoryMonitoring
 */
export function stopMemoryMonitoring(intervalId) {
    clearInterval(intervalId);
    console.log("[Performance Tracking] Memory monitoring stopped");
}

/**
 * Measures the execution time of a function.
 * 
 * @param {Function} fn - Function to measure
 * @param {string} label - Label for the measurement
 * @param {Array} performanceMetrics - Array to store performance data
 * @returns {*} Result of the function execution
 */
export function measureExecutionTime(fn, label, performanceMetrics) {
    const start = performance.now();
    
    try {
        const result = fn();
        const duration = performance.now() - start;
        
        const metric = {
            name: label,
            duration: duration,
            startTime: start,
            entryType: "measure",
            operation: "function_execution",
            timestamp: new Date().toISOString(),
            success: true
        };
        
        performanceMetrics.push(metric);
        console.debug(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
        
        return result;
    } catch (error) {
        const duration = performance.now() - start;
        
        const metric = {
            name: label,
            duration: duration,
            startTime: start,
            entryType: "measure",
            operation: "function_execution",
            timestamp: new Date().toISOString(),
            success: false,
            error: error.message
        };
        
        performanceMetrics.push(metric);
        console.error(`[Performance] ${label} failed after ${duration.toFixed(2)}ms:`, error);
        
        throw error;
    }
}

/**
 * Analyzes performance metrics and identifies bottlenecks.
 * 
 * @param {Array} performanceMetrics - Array of performance data
 * @returns {Object} Performance analysis report
 */
export function analyzePerformanceMetrics(performanceMetrics) {
    if (performanceMetrics.length === 0) {
        return {
            totalMetrics: 0,
            averageDuration: 0,
            slowestOperations: [],
            fastestOperations: [],
            operationStats: {}
        };
    }
    
    const operationStats = {};
    let totalDuration = 0;
    
    performanceMetrics.forEach(metric => {
        const name = metric.name || metric.operation || "unknown";
        
        if (!operationStats[name]) {
            operationStats[name] = {
                count: 0,
                totalTime: 0,
                avgTime: 0,
                minTime: Infinity,
                maxTime: 0
            };
        }
        
        const stats = operationStats[name];
        stats.count++;
        stats.totalTime += metric.duration;
        stats.minTime = Math.min(stats.minTime, metric.duration);
        stats.maxTime = Math.max(stats.maxTime, metric.duration);
        
        totalDuration += metric.duration;
    });
    
    // Calculate averages
    Object.keys(operationStats).forEach(name => {
        operationStats[name].avgTime = operationStats[name].totalTime / operationStats[name].count;
    });
    
    // Find slowest and fastest operations
    const sortedByAvg = Object.entries(operationStats)
        .sort(([,a], [,b]) => b.avgTime - a.avgTime);
    
    const analysis = {
        totalMetrics: performanceMetrics.length,
        averageDuration: totalDuration / performanceMetrics.length,
        slowestOperations: sortedByAvg.slice(0, 5),
        fastestOperations: sortedByAvg.slice(-5).reverse(),
        operationStats
    };
    
    console.group("⚡ Performance Analysis");
    console.log(`Total Metrics: ${analysis.totalMetrics}`);
    console.log(`Average Duration: ${analysis.averageDuration.toFixed(2)}ms`);
    console.table(operationStats);
    console.groupEnd();
    
    return analysis;
}

/**
 * Formats bytes into human-readable format.
 * 
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted byte string
 * @private
 */
function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
} 