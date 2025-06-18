/**
 * @fileoverview Battle Log Debug Output
 * @description Controls debug/console output and external monitoring
 * @version 1.0.0
 */

'use strict';

import { EVENT_TYPES } from './battle_event_types.js';

/**
 * Debug configuration
 */
const DEBUG_CONFIG = {
    enableConsoleLogging: true,
    logLevel: 'INFO', // DEBUG, INFO, WARN, ERROR
    enablePerformanceLogging: true,
    enableErrorReporting: true,
    enableExtremeRollWarnings: true,
    maxConsoleEvents: 100,
    externalMonitor: null
};

/**
 * Log levels hierarchy
 */
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

/**
 * Debug logger class
 */
export class BattleLogDebugger {
    constructor(config = {}) {
        this.config = { ...DEBUG_CONFIG, ...config };
        this.consoleEventCount = 0;
        this.stats = {
            debugEvents: 0,
            warningEvents: 0,
            errorEvents: 0,
            performanceEvents: 0
        };
    }

    /**
     * Logs an event to console if appropriate
     */
    logEventToConsole(event) {
        if (!this.config.enableConsoleLogging) return;
        if (this.consoleEventCount >= this.config.maxConsoleEvents) return;

        const logLevel = this.getEventLogLevel(event);
        if (!this.shouldLog(logLevel)) return;

        this.outputToConsole(event, logLevel);
        this.consoleEventCount++;
        this.updateStats(event);
    }

    /**
     * Logs multiple events
     */
    logEventsToConsole(events) {
        for (const event of events) {
            this.logEventToConsole(event);
        }
    }

    /**
     * Sends event to external monitor if configured
     */
    sendToExternalMonitor(event) {
        if (this.config.externalMonitor && typeof this.config.externalMonitor.log === 'function') {
            this.config.externalMonitor.log(event);
        }
    }

    /**
     * Determines appropriate log level for event
     * @private
     */
    getEventLogLevel(event) {
        switch (event.type) {
            case EVENT_TYPES.ERROR:
                return 'ERROR';
            case EVENT_TYPES.PERFORMANCE:
                return event.metadata?.isSlowOperation ? 'WARN' : 'DEBUG';
            case EVENT_TYPES.DICE_ROLL:
                return event.rollAnalysis?.isExtreme ? 'WARN' : 'DEBUG';
            default:
                return event.isMajorEvent ? 'INFO' : 'DEBUG';
        }
    }

    /**
     * Checks if we should log at this level
     * @private
     */
    shouldLog(eventLevel) {
        const configLevel = LOG_LEVELS[this.config.logLevel] || LOG_LEVELS.INFO;
        const eventLevelNum = LOG_LEVELS[eventLevel] || LOG_LEVELS.DEBUG;
        return eventLevelNum >= configLevel;
    }

    /**
     * Outputs event to appropriate console method
     * @private
     */
    outputToConsole(event, logLevel) {
        const message = this.formatConsoleMessage(event);

        switch (logLevel) {
            case 'ERROR':
                console.error(message);
                break;
            case 'WARN':
                console.warn(message);
                break;
            case 'INFO':
                console.info(message);
                break;
            default:
                console.debug(message);
        }
    }

    /**
     * Formats event for console output
     * @private
     */
    formatConsoleMessage(event) {
        const parts = [
            `[${event.type.toUpperCase()}]`,
            `Turn ${event.turnNumber}:`,
            event.text || 'No description'
        ];

        if (event.type === EVENT_TYPES.PERFORMANCE) {
            parts.push(`(${event.duration.toFixed(2)}ms)`);
        }

        if (event.type === EVENT_TYPES.DICE_ROLL && event.rollAnalysis?.isExtreme) {
            parts.push(`(EXTREME: ${event.result})`);
        }

        return parts.join(' ');
    }

    /**
     * Updates internal statistics
     * @private
     */
    updateStats(event) {
        switch (event.type) {
            case EVENT_TYPES.ERROR:
                this.stats.errorEvents++;
                break;
            case EVENT_TYPES.PERFORMANCE:
                this.stats.performanceEvents++;
                break;
            default:
                if (event.metadata?.validationWarning) {
                    this.stats.warningEvents++;
                } else {
                    this.stats.debugEvents++;
                }
        }
    }

    /**
     * Gets debug statistics
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Resets console event counter and stats
     */
    reset() {
        this.consoleEventCount = 0;
        this.stats = {
            debugEvents: 0,
            warningEvents: 0,
            errorEvents: 0,
            performanceEvents: 0
        };
    }

    /**
     * Sets external monitor
     */
    setExternalMonitor(monitor) {
        this.config.externalMonitor = monitor;
    }
}

/**
 * Default debugger instance
 */
export const defaultDebugger = new BattleLogDebugger();

/**
 * Convenience functions using default debugger
 */
export function logEventToConsole(event) {
    return defaultDebugger.logEventToConsole(event);
}

export function logEventsToConsole(events) {
    return defaultDebugger.logEventsToConsole(events);
}

export function setDebugLevel(level) {
    defaultDebugger.config.logLevel = level;
}

export function enableConsoleLogging(enabled = true) {
    defaultDebugger.config.enableConsoleLogging = enabled;
} 