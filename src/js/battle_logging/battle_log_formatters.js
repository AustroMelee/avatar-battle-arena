/**
 * @fileoverview Battle Log Formatters
 * @description Converts raw log events to various output formats
 * @version 1.0.0
 */

"use strict";

import { EVENT_TYPES } from "./battle_event_types.js";

/**
 * Converts log events to HTML format
 * @param {Array} events - Array of log events
 * @param {Object} options - Formatting options
 * @returns {string} HTML string
 */
export function toHTML(events, options = {}) {
    const config = {
        includeDebug: false,
        includeMajorOnly: false,
        cssClasses: true,
        timestamps: false,
        ...options
    };

    const filteredEvents = filterEvents(events, config);
    
    let html = "<div class=\"battle-log\">\n";
    
    for (const event of filteredEvents) {
        html += formatEventAsHTML(event, config);
    }
    
    html += "</div>";
    return html;
}

/**
 * Converts log events to plain text summary
 * @param {Array} events - Array of log events
 * @param {Object} options - Formatting options
 * @returns {string} Plain text summary
 */
export function toTextSummary(events, options = {}) {
    const config = {
        includeTimestamps: false,
        includeTurnNumbers: true,
        majorEventsOnly: false,
        maxWidth: 80,
        ...options
    };

    const filteredEvents = filterEvents(events, config);
    const lines = [];
    
    for (const event of filteredEvents) {
        lines.push(formatEventAsText(event, config));
    }
    
    return lines.join("\n");
}

/**
 * Converts log events to CSV format for data analysis
 * @param {Array} events - Array of log events
 * @param {Object} options - Formatting options
 * @returns {string} CSV string
 */
export function toCSV(events, options = {}) {
    const config = {
        includeDebugData: false,
        flattenObjects: true,
        ...options
    };

    if (events.length === 0) {
        return "";
    }

    // Determine columns from first event and options
    const columns = getCSVColumns(events[0], config);
    
    let csv = columns.join(",") + "\n";
    
    for (const event of events) {
        const row = columns.map(col => formatCSVCell(getNestedValue(event, col)));
        csv += row.join(",") + "\n";
    }
    
    return csv;
}

/**
 * Converts log events to JSON with optional filtering and formatting
 * @param {Array} events - Array of log events
 * @param {Object} options - Formatting options
 * @returns {string} JSON string
 */
export function toJSON(events, options = {}) {
    const config = {
        prettyPrint: true,
        includeDebugData: true,
        filterEmpty: false,
        ...options
    };

    let processedEvents = events;
    
    if (!config.includeDebugData) {
        processedEvents = events.map(event => {
            const { debugData, ...eventWithoutDebug } = event;
            return eventWithoutDebug;
        });
    }
    
    if (config.filterEmpty) {
        processedEvents = processedEvents.map(removeEmptyFields);
    }
    
    return config.prettyPrint 
        ? JSON.stringify(processedEvents, null, 2)
        : JSON.stringify(processedEvents);
}

/**
 * Creates a debug-friendly formatted output for console logging
 * @param {Array} events - Array of log events
 * @param {Object} options - Formatting options
 * @returns {string} Debug format string
 */
export function toDebugFormat(events, options = {}) {
    const config = {
        colorize: true,
        includeStackTraces: true,
        verboseMode: false,
        maxEventLength: 200,
        ...options
    };

    const lines = [];
    
    for (const event of events) {
        lines.push(formatEventAsDebug(event, config));
    }
    
    return lines.join("\n");
}

/**
 * Creates a battle summary report
 * @param {Array} events - Array of log events
 * @param {Object} options - Report options
 * @returns {Object} Battle summary object
 */
export function toBattleSummary(events, options = {}) {
    const config = {
        includeStatistics: true,
        includeTimeline: true,
        includePerformanceData: true,
        ...options
    };

    const summary = {
        totalEvents: events.length,
        battleDuration: calculateBattleDuration(events),
        eventsByType: {},
        timeline: [],
        performance: {},
        errors: []
    };

    // Count events by type
    for (const event of events) {
        summary.eventsByType[event.type] = (summary.eventsByType[event.type] || 0) + 1;
    }

    // Build timeline of major events
    if (config.includeTimeline) {
        summary.timeline = events
            .filter(event => event.isMajorEvent)
            .map(event => ({
                turn: event.turnNumber,
                type: event.type,
                description: event.text,
                timestamp: event.timestamp
            }));
    }

    // Extract performance data
    if (config.includePerformanceData) {
        const perfEvents = events.filter(event => event.type === EVENT_TYPES.PERFORMANCE);
        summary.performance = analyzePerformanceEvents(perfEvents);
    }

    // Extract errors
    summary.errors = events
        .filter(event => event.type === EVENT_TYPES.ERROR)
        .map(event => ({
            turn: event.turnNumber,
            context: event.context,
            message: event.error.message
        }));

    return summary;
}

/**
 * Filters events based on configuration
 * @private
 */
function filterEvents(events, config) {
    return events.filter(event => {
        if (config.includeMajorOnly && !event.isMajorEvent) {
            return false;
        }
        
        if (!config.includeDebug && event.type === EVENT_TYPES.DEBUG) {
            return false;
        }
        
        return true;
    });
}

/**
 * Formats a single event as HTML
 * @private
 */
function formatEventAsHTML(event, config) {
    const cssClass = config.cssClasses ? ` class="event-${event.type}"` : "";
    const timestamp = config.timestamps ? `<span class="timestamp">[${event.timestamp}]</span> ` : "";
    const content = event.html_content || escapeHTML(event.text || "No description");
    
    return `  <div${cssClass}>${timestamp}${content}</div>\n`;
}

/**
 * Formats a single event as text
 * @private
 */
function formatEventAsText(event, config) {
    const parts = [];
    
    if (config.includeTimestamps) {
        parts.push(`[${event.timestamp}]`);
    }
    
    if (config.includeTurnNumbers) {
        parts.push(`Turn ${event.turnNumber}:`);
    }
    
    parts.push(event.text || "No description");
    
    let line = parts.join(" ");
    
    if (config.maxWidth && line.length > config.maxWidth) {
        line = line.substring(0, config.maxWidth - 3) + "...";
    }
    
    return line;
}

/**
 * Formats a single event for debug output
 * @private
 */
function formatEventAsDebug(event, config) {
    const lines = [];
    
    // Header line
    lines.push(`[${event.type.toUpperCase()}] Turn ${event.turnNumber} - ${event.eventId}`);
    
    // Main content
    if (event.text) {
        lines.push(`  Text: ${event.text}`);
    }
    
    // Debug data in verbose mode
    if (config.verboseMode && event.debugData) {
        lines.push(`  Debug: ${JSON.stringify(event.debugData, null, 2).replace(/\n/g, "\n    ")}`);
    }
    
    // Stack traces for errors
    if (config.includeStackTraces && event.error && event.error.stack) {
        lines.push(`  Stack: ${event.error.stack.replace(/\n/g, "\n    ")}`);
    }
    
    return lines.join("\n");
}

/**
 * Helper functions
 * @private
 */
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function getCSVColumns(sampleEvent, config) {
    const baseColumns = ["eventId", "type", "turnNumber", "timestamp", "text"];
    
    if (config.includeDebugData) {
        baseColumns.push("debugData");
    }
    
    return baseColumns;
}

function formatCSVCell(value) {
    if (value === null || value === undefined) {
        return "";
    }
    
    const str = typeof value === "object" ? JSON.stringify(value) : String(value);
    
    // Escape quotes and wrap in quotes if contains comma or quote
    if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
        return `"${str.replace(/"/g, "\"\"")}"`;
    }
    
    return str;
}

function getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
}

function removeEmptyFields(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined && value !== "") {
            result[key] = value;
        }
    }
    return result;
}

function calculateBattleDuration(events) {
    if (events.length === 0) return 0;
    
    const first = new Date(events[0].timestamp).getTime();
    const last = new Date(events[events.length - 1].timestamp).getTime();
    return last - first;
}

function analyzePerformanceEvents(perfEvents) {
    if (perfEvents.length === 0) {
        return { totalOperations: 0 };
    }
    
    const operations = {};
    let totalDuration = 0;
    
    for (const event of perfEvents) {
        const op = event.operation;
        if (!operations[op]) {
            operations[op] = { count: 0, totalTime: 0, avgTime: 0 };
        }
        
        operations[op].count++;
        operations[op].totalTime += event.duration;
        operations[op].avgTime = operations[op].totalTime / operations[op].count;
        totalDuration += event.duration;
    }
    
    return {
        totalOperations: perfEvents.length,
        totalDuration,
        averageDuration: totalDuration / perfEvents.length,
        operationBreakdown: operations
    };
} 