// @ts-nocheck
"use strict";

/**
 * @fileoverview Reporting Module for Debug Utilities
 * @description Handles report generation, data export, and debug data management
 * @version 1.0.0
 */

import { formatBytes } from "../utils_format.js";
import { DEBUG_CONFIG, LOG_LEVELS } from "./debugConfig.js";

/**
 * Generates a comprehensive debug report from collected data.
 * 
 * @param {Object} debugData - The main debug data object
 * @param {Array} debugData.log - General log entries
 * @param {Array} debugData.errorLog - Error log entries
 * @param {Array} debugData.performanceMetrics - Performance metrics
 * @param {Array} debugData.memorySnapshots - Memory snapshots
 * @param {Object} [battleResult] - Optional battle result for context
 * @returns {string} Formatted debug report
 */
export function generateReport(debugData, battleResult = null) {
    const { log, errorLog, performanceMetrics, memorySnapshots } = debugData;
    
    let report = `
=================================
  AVATAR BATTLE ARENA DEBUG REPORT
=================================
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
Debug Config: ${JSON.stringify(DEBUG_CONFIG, null, 2)}
---------------------------------
`;
    
    // Battle Context
    if (battleResult) {
        report += `
## BATTLE CONTEXT
---------------------------------
Winner: ${battleResult.winnerId || "N/A"}
Total Turns: ${battleResult.totalTurns || "N/A"}
Final State:
  - Fighter 1: ${JSON.stringify(battleResult.finalState.fighter1)}
  - Fighter 2: ${JSON.stringify(battleResult.finalState.fighter2)}
---------------------------------
`;
    }
    
    // Performance Summary
    const perfAnalysis = analyzePerformance(performanceMetrics);
    report += `
## PERFORMANCE SUMMARY
---------------------------------
Total Page Load Time: ${perfAnalysis.totalLoadTime}
Total Script Execution Time: ${perfAnalysis.scriptExecutionTime}
Slowest Resources:
${perfAnalysis.slowestResources.map(r => `  - ${r.name}: ${r.duration}ms`).join("\n")}
Longest Tasks:
${perfAnalysis.longestTasks.map(t => `  - ${t.name}: ${t.duration}ms`).join("\n")}
Current Memory Info: ${performance.memory ? `
  - Used: ${formatBytes(performance.memory.usedJSHeapSize)}
  - Total: ${formatBytes(performance.memory.totalJSHeapSize)}
  - Limit: ${formatBytes(performance.memory.jsHeapSizeLimit)}
` : "N/A"}
---------------------------------
`;
    
    // Error Summary
    const errorAnalysis = analyzeErrors(errorLog);
    report += `
## ERROR SUMMARY
---------------------------------
Total Errors: ${errorAnalysis.totalErrors}
Error Types:
${Object.entries(errorAnalysis.errorTypes).map(([type, count]) => `  - ${type}: ${count}`).join("\n")}
Most Common Errors:
${errorAnalysis.commonErrors.map(e => `  - "${e.message}" (${e.count} times)`).join("\n")}
---------------------------------
`;

    // Memory Usage Trend
    report += `
## MEMORY USAGE
---------------------------------
${memorySnapshots.length > 0 ? 
    memorySnapshots.map(s => `[${s.timestamp}] Used: ${s.formatted.used}, Total: ${s.formatted.total}, Limit: ${s.formatted.limit}`).join("\n") : 
    "No memory snapshots recorded."}
---------------------------------
`;

    // Detailed Logs
    report += `
## DETAILED LOGS
---------------------------------
`;
    log.forEach(entry => {
        report += `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}\n`;
        if (entry.data) {
            report += `  Data: ${JSON.stringify(entry.data, null, 2)}\n`;
        }
    });
    
    report += "\n=================================\n  END OF REPORT\n=================================\n";
    
    return report;
}

/**
 * Dumps the debug report to the console.
 * @param {string} report - The formatted debug report
 */
export function dumpReportToConsole(report) {
    console.log(report);
}

/**
 * Prepares the debug report for download.
 * @param {string} report - The formatted debug report
 * @param {string} [filename="debug-report.txt"] - The name of the file to download
 */
export function downloadReport(report, filename = "debug-report.txt") {
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`[Reporting] Debug report downloaded as ${filename}`);
}

/**
 * Helper to analyze performance metrics for the report.
 * @param {Array} performanceMetrics - Array of performance data
 * @returns {Object} Performance analysis summary
 * @private
 */
function analyzePerformance(performanceMetrics) {
    // Basic analysis, can be expanded
    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const totalLoadTime = navigationEntry ? navigationEntry.duration.toFixed(2) + "ms" : "N/A";
    
    const scriptEntries = performanceMetrics.filter(e => e.initiatorType === "script");
    const scriptExecutionTime = scriptEntries.reduce((sum, e) => sum + e.duration, 0).toFixed(2) + "ms";
    
    const slowestResources = [...performanceMetrics]
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .map(r => ({ name: r.name, duration: r.duration.toFixed(2) }));
        
    const longTasks = performance.getEntriesByType ? performance.getEntriesByType("longtask") || [] : [];
    const longestTasks = longTasks
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .map(t => ({ name: t.name, duration: t.duration.toFixed(2) }));

    return { totalLoadTime, scriptExecutionTime, slowestResources, longestTasks };
}

/**
 * Helper to analyze errors for the report.
 * @param {Array} errorLog - Array of error data
 * @returns {Object} Error analysis summary
 * @private
 */
function analyzeErrors(errorLog) {
    const totalErrors = errorLog.length;
    const errorTypes = errorLog.reduce((acc, err) => {
        acc[err.type] = (acc[err.type] || 0) + 1;
        return acc;
    }, {});
    
    const messageCounts = errorLog.reduce((acc, err) => {
        const msg = err.message || "Unknown";
        acc[msg] = (acc[msg] || 0) + 1;
        return acc;
    }, {});
    
    const commonErrors = Object.entries(messageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([message, count]) => ({ message, count }));

    return { totalErrors, errorTypes, commonErrors };
}
