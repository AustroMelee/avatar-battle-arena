/**
 * @fileoverview Deterministic Snapshot Replay System
 * @description NASA-level flight recorder for battle simulations. Captures complete battle states
 * and input sequences, enabling frame-by-frame replay and black-box analysis of complex scenarios.
 * @version 1.0
 */

'use strict';

//# sourceURL=utils_deterministic_replay.js

/**
 * @typedef {Object} BattleSnapshot
 * @property {string} id - Unique snapshot identifier
 * @property {number} timestamp - When snapshot was taken
 * @property {number} turn - Turn number when captured
 * @property {Object} battleState - Complete battle state at snapshot time
 * @property {InputLogEntry[]} inputLog - Sequence of inputs that led to this state
 * @property {Object} metadata - Additional context (version, location, etc.)
 */

/**
 * @typedef {Object} InputLogEntry
 * @property {number} turn - Turn when input occurred
 * @property {string} type - Type of input (move_selection, random_roll, ai_decision)
 * @property {string} actorId - Who performed the action
 * @property {Object} data - Input-specific data
 * @property {number} timestamp - When input occurred
 */

class DeterministicReplaySystem {
    constructor() {
        this.currentInputLog = [];
        this.snapshots = new Map();
        this.isRecording = false;
        this.isReplaying = false;
        this.replayInputIndex = 0;
        this.replaySnapshot = null;
    }

    /**
     * Start recording a new battle session
     */
    startRecording() {
        this.currentInputLog = [];
        this.isRecording = true;
        this.isReplaying = false;
        console.log('[Deterministic Replay] Recording started');
    }

    /**
     * Stop recording current session
     */
    stopRecording() {
        this.isRecording = false;
        console.log(`[Deterministic Replay] Recording stopped. Captured ${this.currentInputLog.length} inputs`);
    }

    /**
     * Log an input during battle execution
     * @param {string} type - Type of input
     * @param {string} actorId - Actor performing action
     * @param {Object} data - Input data
     * @param {number} turn - Current turn
     */
    logInput(type, actorId, data, turn) {
        if (!this.isRecording || this.isReplaying) return;

        const inputEntry = {
            turn,
            type,
            actorId,
            data: this.deepClone(data),
            timestamp: Date.now()
        };

        this.currentInputLog.push(inputEntry);
        console.debug(`[Deterministic Replay] Logged input: ${type} by ${actorId} on turn ${turn}`);
    }

    /**
     * Create a complete battle state snapshot
     * @param {Object} battleState - Current battle state
     * @param {number} turn - Current turn number
     * @param {Object} metadata - Additional context
     * @returns {BattleSnapshot}
     */
         snapshotBattleState(battleState, turn, metadata = {}) {
        try {
            const snapshotId = `snapshot_${Date.now()}_turn_${turn}`;
            const metadataObj = metadata;
            
            const snapshot = {
                id: snapshotId,
                timestamp: Date.now(),
                turn,
                battleState: this.deepClone(battleState),
                inputLog: this.deepClone(this.currentInputLog),
                metadata: {
                    version: '1.0',
                    location: metadataObj.location || 'unknown',
                    fighters: metadataObj.fighters || [],
                    ...metadataObj
                }
            };

            this.snapshots.set(snapshotId, snapshot);
            console.log(`[Deterministic Replay] Snapshot created: ${snapshotId}`);
            
            return snapshot;
        } catch (error) {
            console.error('[Deterministic Replay] Failed to create snapshot:', error);
            throw new Error(`Snapshot creation failed: ${error.message}`);
        }
    }

    /**
     * Replay a battle from a saved snapshot
     * @param {string} snapshotId - ID of snapshot to replay from
     * @param {Function} stepCallback - Called for each replay step
     * @returns {Promise<Object>} Replay result
     */
    async replayBattle(snapshotId, stepCallback = null) {
        const snapshot = this.snapshots.get(snapshotId);
        if (!snapshot) {
            throw new Error(`Snapshot not found: ${snapshotId}`);
        }

        console.log(`[Deterministic Replay] Starting replay from snapshot: ${snapshotId}`);
        
        this.isReplaying = true;
        this.replayInputIndex = 0;
        this.replaySnapshot = snapshot;

        try {
            // Restore initial state
            let currentState = this.deepClone(snapshot.battleState);
            
            // Replay each input from the log
            for (let i = 0; i < snapshot.inputLog.length; i++) {
                const input = snapshot.inputLog[i];
                
                // Apply input to state (this would integrate with existing battle engine)
                currentState = await this.applyInputToState(currentState, input);
                
                // Call step callback if provided
                if (stepCallback) {
                    await stepCallback({
                        step: i + 1,
                        totalSteps: snapshot.inputLog.length,
                        input,
                        state: currentState,
                        snapshot
                    });
                }
                
                // Small delay for visualization
                await this.delay(100);
            }

            console.log(`[Deterministic Replay] Replay completed: ${snapshot.inputLog.length} steps`);
            return { success: true, finalState: currentState, stepsReplayed: snapshot.inputLog.length };

        } catch (error) {
            console.error('[Deterministic Replay] Replay failed:', error);
            throw error;
        } finally {
            this.isReplaying = false;
            this.replaySnapshot = null;
        }
    }

    /**
     * Apply a logged input to a battle state (integrates with battle engine)
     * @param {Object} state - Current battle state
     * @param {InputLogEntry} input - Input to apply
     * @returns {Object} Updated state
     */
    async applyInputToState(state, input) {
        // This would integrate with the existing battle engine
        // For now, return state unchanged - integration point for battle engine
        console.debug(`[Deterministic Replay] Applying input: ${input.type} by ${input.actorId}`);
        
        switch (input.type) {
            case 'move_selection':
                // Apply move selection logic
                break;
            case 'random_roll':
                // Apply deterministic random with logged value
                break;
            case 'ai_decision':
                // Apply AI decision with logged choice
                break;
            default:
                console.warn(`[Deterministic Replay] Unknown input type: ${input.type}`);
        }

        return state;
    }

    /**
     * Export snapshot to JSON for external storage
     * @param {string} snapshotId - Snapshot to export
     * @returns {string} JSON representation
     */
    exportSnapshot(snapshotId) {
        const snapshot = this.snapshots.get(snapshotId);
        if (!snapshot) {
            throw new Error(`Snapshot not found: ${snapshotId}`);
        }

        try {
            return JSON.stringify(snapshot, null, 2);
        } catch (error) {
            console.error('[Deterministic Replay] Export failed:', error);
            throw new Error(`Export failed: ${error.message}`);
        }
    }

    /**
     * Import snapshot from JSON
     * @param {string} jsonData - JSON snapshot data
     * @returns {string} Imported snapshot ID
     */
    importSnapshot(jsonData) {
        try {
            const snapshot = JSON.parse(jsonData);
            
            // Validate snapshot structure
            if (!snapshot.id || !snapshot.battleState || !snapshot.inputLog) {
                throw new Error('Invalid snapshot format');
            }

            this.snapshots.set(snapshot.id, snapshot);
            console.log(`[Deterministic Replay] Imported snapshot: ${snapshot.id}`);
            
            return snapshot.id;
        } catch (error) {
            console.error('[Deterministic Replay] Import failed:', error);
            throw new Error(`Import failed: ${error.message}`);
        }
    }

    /**
     * Get all available snapshots
     * @returns {Array<Object>} Snapshot metadata
     */
    getAllSnapshots() {
        return Array.from(this.snapshots.values()).map(snapshot => ({
            id: snapshot.id,
            timestamp: snapshot.timestamp,
            turn: snapshot.turn,
            metadata: snapshot.metadata
        }));
    }

    /**
     * Delete a snapshot
     * @param {string} snapshotId - Snapshot to delete
     */
    deleteSnapshot(snapshotId) {
        if (this.snapshots.delete(snapshotId)) {
            console.log(`[Deterministic Replay] Deleted snapshot: ${snapshotId}`);
        } else {
            console.warn(`[Deterministic Replay] Snapshot not found for deletion: ${snapshotId}`);
        }
    }

    /**
     * Deep clone an object for state isolation
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Set) return new Set([...obj].map(item => this.deepClone(item)));
        if (obj instanceof Map) {
            const clonedMap = new Map();
            for (const [key, value] of obj) {
                clonedMap.set(this.deepClone(key), this.deepClone(value));
            }
            return clonedMap;
        }
        
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = this.deepClone(obj[key]);
            }
        }
        return clonedObj;
    }

    /**
     * Utility delay function for replay visualization
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current recording status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isRecording: this.isRecording,
            isReplaying: this.isReplaying,
            currentInputCount: this.currentInputLog.length,
            snapshotCount: this.snapshots.size,
            replayProgress: this.isReplaying ? {
                currentStep: this.replayInputIndex,
                totalSteps: this.replaySnapshot?.inputLog.length || 0
            } : null
        };
    }
}

// Create global instance
export const replaySystem = new DeterministicReplaySystem();

// Export class for testing/advanced usage
export { DeterministicReplaySystem };

// Utility functions for easy integration
export function startBattleRecording() {
    replaySystem.startRecording();
}

export function stopBattleRecording() {
    replaySystem.stopRecording();
}

export function logBattleInput(type, actorId, data, turn) {
    replaySystem.logInput(type, actorId, data, turn);
}

export function createBattleSnapshot(battleState, turn, metadata) {
    return replaySystem.snapshotBattleState(battleState, turn, metadata);
}

export function replayFromSnapshot(snapshotId, stepCallback) {
    return replaySystem.replayBattle(snapshotId, stepCallback);
} 