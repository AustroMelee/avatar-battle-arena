/**
 * @fileoverview Error Tracking Module for Debug Utilities
 * @description Handles global error tracking, logging, and reporting
 * @version 1.0.0
 */

"use strict";

/**
 * Sets up global error handling for debugging.
 * Captures both standard errors and unhandled promise rejections.
 * 
 * @param {Array} errorLog - Array to store error information
 * 
 * @example
 * const errorLog = [];
 * setupGlobalErrorHandling(errorLog);
 */
export function setupGlobalErrorHandling(errorLog) {
    // Handle standard JavaScript errors
    window.addEventListener("error", (event) => {
        const errorInfo = {
            type: "javascript_error",
            message: event.error?.message || "Unknown error",
            stack: event.error?.stack || "No stack trace",
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        errorLog.push(errorInfo);
        console.error("[Global Error]", errorInfo);
    });
    
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
        const errorInfo = {
            type: "unhandled_rejection",
            reason: event.reason,
            promise: event.promise,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        errorLog.push(errorInfo);
        console.error("[Unhandled Promise Rejection]", errorInfo);
    });
    
    console.log("[Error Tracking] Global error handling initialized");
}

/**
 * Logs a custom error to the error tracking system.
 * 
 * @param {Array} errorLog - Array to store error information
 * @param {Error|string} error - Error object or error message
 * @param {string} [context] - Additional context about where the error occurred
 * 
 * @example
 * logError(errorLog, new Error('Battle simulation failed'), 'simulateBattle');
 */
export function logError(errorLog, error, context = null) {
    const errorInfo = {
        type: "custom_error",
        message: error.message || error.toString(),
        stack: error.stack || "No stack trace",
        context: context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };
    
    errorLog.push(errorInfo);
    console.error("[Custom Error]", errorInfo);
}

/**
 * Analyzes error patterns and frequencies.
 * 
 * @param {Array} errorLog - Array of error information
 * @returns {Object} Error analysis report
 */
export function analyzeErrors(errorLog) {
    if (errorLog.length === 0) {
        return {
            totalErrors: 0,
            errorTypes: {},
            commonErrors: [],
            recentErrors: []
        };
    }
    
    const errorTypes = {};
    const errorMessages = {};
    
    errorLog.forEach(error => {
        // Count by error type
        errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
        
        // Count by error message
        const message = error.message || "Unknown";
        errorMessages[message] = (errorMessages[message] || 0) + 1;
    });
    
    // Find most common errors
    const commonErrors = Object.entries(errorMessages)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([message, count]) => ({ message, count }));
    
    // Get recent errors (last 10)
    const recentErrors = errorLog.slice(-10);
    
    const analysis = {
        totalErrors: errorLog.length,
        errorTypes,
        commonErrors,
        recentErrors,
        firstError: errorLog[0],
        lastError: errorLog[errorLog.length - 1]
    };
    
    console.group("🚨 Error Analysis");
    console.log(`Total Errors: ${analysis.totalErrors}`);
    console.table(errorTypes);
    console.log("Most Common Errors:", commonErrors);
    console.groupEnd();
    
    return analysis;
}

/**
 * Serializes error log for export or transmission.
 * 
 * @param {Array} errorLog - Array of error information
 * @returns {string} Serialized error log as JSON string
 */
export function serializeErrorLog(errorLog) {
    try {
        return JSON.stringify(errorLog, null, 2);
    } catch (error) {
        console.error("[Error Tracking] Failed to serialize error log:", error);
        return JSON.stringify([{
            type: "serialization_error",
            message: "Failed to serialize error log",
            timestamp: new Date().toISOString()
        }], null, 2);
    }
}

/**
 * Clears the error log.
 * 
 * @param {Array} errorLog - Array to clear
 */
export function clearErrorLog(errorLog) {
    errorLog.length = 0;
    console.log("[Error Tracking] Error log cleared");
} 