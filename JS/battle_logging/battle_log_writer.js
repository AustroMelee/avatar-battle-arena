/**
 * @fileoverview Battle Log Writer
 * @description Handles appending events to logs, log rotation, and batch operations
 * @version 1.0.0
 */

'use strict';

import { validateBattleLog, validateLogEvent } from './battle_event_validators.js';

/**
 * Default configuration for log management
 */
const DEFAULT_CONFIG = {
    maxLogSize: 10000,           // Maximum number of events
    rotationThreshold: 8000,     // When to start rotating
    enableValidation: true,      // Validate events before writing
    enableBatching: false,       // Enable batch writing
    batchSize: 50,              // Events per batch
    batchFlushInterval: 1000     // Milliseconds between batch flushes
};

/**
 * Log writer class for managing battle event logs
 */
export class BattleLogWriter {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.batchQueue = [];
        this.batchTimer = null;
        this.stats = {
            eventsWritten: 0,
            validationErrors: 0,
            rotations: 0,
            batchesProcessed: 0
        };
    }

    /**
     * Writes a single event to the battle log
     * @param {Array} battleLog - Target log array
     * @param {Object} event - Event to write
     * @returns {boolean} Success status
     */
    writeEvent(battleLog, event) {
        validateBattleLog(battleLog);
        
        if (this.config.enableValidation) {
            try {
                validateLogEvent(event);
            } catch (error) {
                console.warn(`[Log Writer] Event validation failed: ${error.message}`);
                this.stats.validationErrors++;
                
                // Add validation warning to event
                event = {
                    ...event,
                    metadata: {
                        ...event.metadata,
                        validationWarning: error.message
                    }
                };
            }
        }

        // Check if rotation is needed
        if (battleLog.length >= this.config.rotationThreshold) {
            this.rotateLogs(battleLog);
        }

        battleLog.push(event);
        this.stats.eventsWritten++;
        
        return true;
    }

    /**
     * Writes multiple events to the battle log
     * @param {Array} battleLog - Target log array
     * @param {Array} events - Events to write
     * @returns {Object} Result with success count and errors
     */
    writeEvents(battleLog, events) {
        validateBattleLog(battleLog);
        
        if (!Array.isArray(events)) {
            throw new TypeError('Events must be an array');
        }

        const result = {
            successCount: 0,
            errors: []
        };

        for (const event of events) {
            try {
                this.writeEvent(battleLog, event);
                result.successCount++;
            } catch (error) {
                result.errors.push({
                    event,
                    error: error.message
                });
            }
        }

        return result;
    }

    /**
     * Queues an event for batch writing
     * @param {Array} battleLog - Target log array
     * @param {Object} event - Event to queue
     */
    queueEvent(battleLog, event) {
        if (!this.config.enableBatching) {
            return this.writeEvent(battleLog, event);
        }

        this.batchQueue.push({ battleLog, event });

        if (this.batchQueue.length >= this.config.batchSize) {
            this.flushBatch();
        } else if (!this.batchTimer) {
            this.batchTimer = setTimeout(() => {
                this.flushBatch();
            }, this.config.batchFlushInterval);
        }

        return true;
    }

    /**
     * Flushes the batch queue
     */
    flushBatch() {
        if (this.batchQueue.length === 0) return;

        const batch = [...this.batchQueue];
        this.batchQueue = [];
        
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }

        // Group events by target log
        const logGroups = new Map();
        for (const { battleLog, event } of batch) {
            if (!logGroups.has(battleLog)) {
                logGroups.set(battleLog, []);
            }
            logGroups.get(battleLog).push(event);
        }

        // Write each group
        for (const [battleLog, events] of logGroups) {
            this.writeEvents(battleLog, events);
        }

        this.stats.batchesProcessed++;
    }

    /**
     * Rotates the log by removing older entries
     * @param {Array} battleLog - Log to rotate
     */
    rotateLogs(battleLog) {
        const keepCount = Math.floor(this.config.maxLogSize * 0.7); // Keep 70%
        const removeCount = battleLog.length - keepCount;
        
        if (removeCount > 0) {
            const removedEvents = battleLog.splice(0, removeCount);
            this.stats.rotations++;
            
            console.debug(`[Log Writer] Rotated log: removed ${removeCount} events, keeping ${keepCount}`);
            
            // Optionally archive removed events
            this.archiveEvents(removedEvents);
        }
    }

    /**
     * Archives removed events (placeholder for future implementation)
     * @param {Array} events - Events to archive
     * @private
     */
    archiveEvents(events) {
        // Future: Could write to localStorage, IndexedDB, or send to server
        console.debug(`[Log Writer] Archived ${events.length} events`);
    }

    /**
     * Clears all events from a battle log
     * @param {Array} battleLog - Log to clear
     * @returns {number} Number of events cleared
     */
    clearLog(battleLog) {
        validateBattleLog(battleLog);
        const count = battleLog.length;
        battleLog.splice(0, battleLog.length);
        return count;
    }

    /**
     * Trims a log to a specific size
     * @param {Array} battleLog - Log to trim
     * @param {number} maxSize - Maximum size to keep
     * @returns {number} Number of events removed
     */
    trimLog(battleLog, maxSize) {
        validateBattleLog(battleLog);
        
        if (battleLog.length <= maxSize) {
            return 0;
        }

        const removeCount = battleLog.length - maxSize;
        battleLog.splice(0, removeCount);
        return removeCount;
    }

    /**
     * Gets statistics about the log writer
     * @returns {Object} Statistics object
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Resets statistics
     */
    resetStats() {
        this.stats = {
            eventsWritten: 0,
            validationErrors: 0,
            rotations: 0,
            batchesProcessed: 0
        };
    }

    /**
     * Forces a flush of any pending batched events
     */
    forceFlush() {
        this.flushBatch();
    }

    /**
     * Shuts down the log writer, flushing any pending events
     */
    shutdown() {
        this.flushBatch();
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
    }
}

/**
 * Default log writer instance
 */
export const defaultLogWriter = new BattleLogWriter();

/**
 * Convenience function to write an event using the default writer
 * @param {Array} battleLog - Target log array
 * @param {Object} event - Event to write
 * @returns {boolean} Success status
 */
export function writeEvent(battleLog, event) {
    return defaultLogWriter.writeEvent(battleLog, event);
}

/**
 * Convenience function to write multiple events using the default writer
 * @param {Array} battleLog - Target log array
 * @param {Array} events - Events to write
 * @returns {Object} Result object
 */
export function writeEvents(battleLog, events) {
    return defaultLogWriter.writeEvents(battleLog, events);
} 