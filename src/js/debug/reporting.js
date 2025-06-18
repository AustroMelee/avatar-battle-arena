/**
 * @fileoverview Reporting Module for Debug Utilities
 * @description Handles report generation, data export, and debug data management
 * @version 1.0.0
 */

'use strict';

/**
 * Generates a comprehensive debug report.
 * 
 * @param {Array} performanceMetrics - Performance tracking data
 * @param {Array} memorySnapshots - Memory usage snapshots
 * @param {Array} errorLog - Error tracking data
 * @param {Array} [logs] - General debug logs
 * @returns {Object} Comprehensive debug report
 * 
 * @example
 * const report = generateReport(performanceMetrics, memorySnapshots, errorLog);
 */
export function generateReport(performanceMetrics, memorySnapshots, errorLog, logs = []) {
    const report = {
        metadata: {
            timestamp: new Date().toISOString(),
            reportVersion: '1.0.0',
            userAgent: navigator.userAgent,
            url: window.location.href,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        
        performance: {
            metrics: performanceMetrics,
            summary: summarizePerformanceMetrics(performanceMetrics)
        },
        
        memory: {
            snapshots: memorySnapshots.slice(-10), // Last 10 snapshots
            summary: summarizeMemoryUsage(memorySnapshots)
        },
        
        errors: {
            log: errorLog,
            summary: summarizeErrors(errorLog)
        },
        
        logs: {
            entries: logs.slice(-50), // Last 50 log entries
            count: logs.length
        },
        
        browserInfo: {
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onlineStatus: navigator.onLine,
            screenResolution: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth
        },
        
        currentMemoryInfo: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            formatted: {
                used: formatBytes(performance.memory.usedJSHeapSize),
                total: formatBytes(performance.memory.totalJSHeapSize),
                limit: formatBytes(performance.memory.jsHeapSizeLimit)
            }
        } : null
    };
    
    console.log('[Debug Report] Generated comprehensive report');
    return report;
}

/**
 * Exports debug data to a downloadable JSON file.
 * 
 * @param {Object} report - Debug report to export
 * @param {string} [filename] - Custom filename for the export
 * 
 * @example
 * const report = generateReport(performanceMetrics, memorySnapshots, errorLog);
 * exportDebugData(report, 'battle-debug-data.json');
 */
export function exportDebugData(report, filename) {
    try {
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename || `debug-report-${Date.now()}.json`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        URL.revokeObjectURL(link.href);
        
        console.log(`[Debug Export] Data exported as ${link.download}`);
    } catch (error) {
        console.error('[Debug Export] Failed to export debug data:', error);
        
        // Fallback: log the report to console
        console.log('[Debug Export] Report data (copy from console):', report);
    }
}

/**
 * Exports debug data as CSV format for spreadsheet analysis.
 * 
 * @param {Array} performanceMetrics - Performance metrics to export
 * @param {string} [filename] - Custom filename for the export
 */
export function exportPerformanceCSV(performanceMetrics, filename) {
    if (performanceMetrics.length === 0) {
        console.warn('[Debug Export] No performance metrics to export');
        return;
    }
    
    try {
        // CSV Headers
        const headers = ['Name', 'Duration (ms)', 'Start Time', 'Entry Type', 'Timestamp'];
        const csvContent = [
            headers.join(','),
            ...performanceMetrics.map(metric => [
                `"${metric.name || 'Unknown'}"`,
                metric.duration || 0,
                metric.startTime || 0,
                `"${metric.entryType || 'Unknown'}"`,
                `"${metric.timestamp || ''}"`
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename || `performance-metrics-${Date.now()}.csv`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(link.href);
        console.log(`[Debug Export] Performance CSV exported as ${link.download}`);
    } catch (error) {
        console.error('[Debug Export] Failed to export performance CSV:', error);
    }
}

/**
 * Clears all debug data arrays.
 * 
 * @param {Array} performanceMetrics - Performance metrics array
 * @param {Array} memorySnapshots - Memory snapshots array
 * @param {Array} errorLog - Error log array
 * @param {Array} [logs] - General logs array
 */
export function clearDebugData(performanceMetrics, memorySnapshots, errorLog, logs = []) {
    performanceMetrics.length = 0;
    memorySnapshots.length = 0;
    errorLog.length = 0;
    logs.length = 0;
    
    console.log('[Debug Data] All debug data cleared');
}

/**
 * Creates a summary of performance metrics.
 * 
 * @param {Array} performanceMetrics - Performance metrics array
 * @returns {Object} Performance summary
 * @private
 */
function summarizePerformanceMetrics(performanceMetrics) {
    if (performanceMetrics.length === 0) {
        return {
            totalMetrics: 0,
            averageDuration: 0,
            totalDuration: 0,
            slowestOperation: null,
            fastestOperation: null
        };
    }
    
    const durations = performanceMetrics.map(m => m.duration).filter(d => typeof d === 'number');
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / durations.length;
    
    const sortedMetrics = [...performanceMetrics].sort((a, b) => (b.duration || 0) - (a.duration || 0));
    
    return {
        totalMetrics: performanceMetrics.length,
        averageDuration: Math.round(averageDuration * 100) / 100,
        totalDuration: Math.round(totalDuration * 100) / 100,
        slowestOperation: sortedMetrics[0] || null,
        fastestOperation: sortedMetrics[sortedMetrics.length - 1] || null
    };
}

/**
 * Creates a summary of memory usage.
 * 
 * @param {Array} memorySnapshots - Memory snapshots array
 * @returns {Object} Memory usage summary
 * @private
 */
function summarizeMemoryUsage(memorySnapshots) {
    if (memorySnapshots.length === 0) {
        return {
            totalSnapshots: 0,
            currentUsage: null,
            peakUsage: null,
            averageUsage: null
        };
    }
    
    const usages = memorySnapshots.map(s => s.usedJSHeapSize).filter(u => typeof u === 'number');
    const averageUsage = usages.reduce((sum, u) => sum + u, 0) / usages.length;
    const peakUsage = Math.max(...usages);
    const currentUsage = usages[usages.length - 1];
    
    return {
        totalSnapshots: memorySnapshots.length,
        currentUsage: formatBytes(currentUsage),
        peakUsage: formatBytes(peakUsage),
        averageUsage: formatBytes(averageUsage)
    };
}

/**
 * Creates a summary of errors.
 * 
 * @param {Array} errorLog - Error log array
 * @returns {Object} Error summary
 * @private
 */
function summarizeErrors(errorLog) {
    if (errorLog.length === 0) {
        return {
            totalErrors: 0,
            errorTypes: {},
            mostRecentError: null
        };
    }
    
    const errorTypes = {};
    errorLog.forEach(error => {
        const type = error.type || 'unknown';
        errorTypes[type] = (errorTypes[type] || 0) + 1;
    });
    
    return {
        totalErrors: errorLog.length,
        errorTypes,
        mostRecentError: errorLog[errorLog.length - 1]
    };
}

/**
 * Formats bytes into human-readable format.
 * 
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted byte string
 * @private
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 