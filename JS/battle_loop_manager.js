/**
 * @fileoverview Avatar Battle Arena - Battle Loop Manager
 * @description Manages the main battle simulation loop with smaller, focused components
 * @version 2.0.0
 */

'use strict';

//# sourceURL=battle_loop_manager.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').Fighter} Fighter
 * @typedef {import('./types.js').BattleState} BattleState
 * @typedef {import('./types.js').PhaseState} PhaseState
 * @typedef {import('./types.js').BattleEvent} BattleEvent
 * @typedef {import('./types.js').BattleResult} BattleResult
 * @typedef {import('./types.js').TerminalStateResult} TerminalStateResult
 */

/**
 * @typedef {Object} BattleLoopConfig
 * @description Configuration for battle loop manager
 * @property {number} maxTurns - Maximum turns before stalemate (1-1000)
 * @property {boolean} enableDebugLogging - Enable debug output
 * @property {boolean} enableNarrative - Enable narrative generation
 * @property {number} stalemateThreshold - Turns before stalemate check (1-100)
 * @property {boolean} enableCurbstompRules - Enable curbstomp detection
 * @property {number} [turnTimeoutMs] - Timeout per turn in milliseconds
 * @property {boolean} [enablePerformanceLogging] - Log performance metrics
 * @property {boolean} [enableErrorRecovery] - Attempt error recovery
 */

/**
 * @typedef {Object} BattleLoopState
 * @description Current state of the battle loop
 * @property {number} turn - Current turn number (0+)
 * @property {boolean} battleOver - Whether battle has ended
 * @property {string | null} winnerId - Winner fighter ID if battle over
 * @property {string | null} loserId - Loser fighter ID if battle over
 * @property {boolean} isStalemate - Whether battle ended in stalemate
 * @property {BattleEvent[]} battleEventLog - Complete event log
 * @property {Object} metadata - Additional loop metadata
 * @property {number} executionStartTime - When battle loop started (timestamp)
 * @property {number} [executionEndTime] - When battle loop ended (timestamp)
 * @property {string} status - Current loop status
 */

/**
 * @typedef {Object} TurnExecutionResult
 * @description Result of executing a single turn
 * @property {boolean} success - Whether turn executed successfully
 * @property {BattleState} battleState - Updated battle state
 * @property {BattleEvent[]} newEvents - Events generated this turn
 * @property {number} turnNumber - Turn number executed
 * @property {number} executionTime - Turn execution time in milliseconds
 * @property {string[]} [errors] - Any errors encountered
 * @property {Object} [debug] - Debug information
 */

/**
 * @typedef {Object} LoopMetrics
 * @description Performance and execution metrics for battle loop
 * @property {number} totalExecutionTime - Total loop execution time in ms
 * @property {number} averageTurnTime - Average time per turn in ms
 * @property {number} totalTurns - Total number of turns executed
 * @property {number} totalEvents - Total number of events generated
 * @property {number} errorsEncountered - Number of errors encountered
 * @property {Object<string, number>} eventTypeCount - Count by event type
 * @property {number} [memoryUsage] - Memory usage metrics
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { processTurn } from './engine_turn-processor.js';
import { checkTerminalState } from './engine_terminal_state.js';
import { generateLogEvent } from './utils_log_event.js';
import { validateBattleState } from './utils_state_invariants.js';

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {number} */
const DEFAULT_MAX_TURNS = 50;

/** @type {number} */
const MIN_MAX_TURNS = 1;

/** @type {number} */
const MAX_MAX_TURNS = 1000;

/** @type {number} */
const DEFAULT_STALEMATE_THRESHOLD = 20;

/** @type {number} */
const MIN_STALEMATE_THRESHOLD = 1;

/** @type {number} */
const MAX_STALEMATE_THRESHOLD = 100;

/** @type {number} */
const DEFAULT_TURN_TIMEOUT = 30000;

/** @type {number} */
const MIN_TURN_TIMEOUT = 1000;

/** @type {number} */
const MAX_TURN_TIMEOUT = 120000;

/** @type {string[]} */
const VALID_LOOP_STATUSES = ['initializing', 'running', 'completed', 'error', 'terminated'];

/** @type {BattleLoopConfig} */
const DEFAULT_BATTLE_LOOP_CONFIG = {
    maxTurns: DEFAULT_MAX_TURNS,
    enableDebugLogging: false,
    enableNarrative: true,
    stalemateThreshold: DEFAULT_STALEMATE_THRESHOLD,
    enableCurbstompRules: true,
    turnTimeoutMs: DEFAULT_TURN_TIMEOUT,
    enablePerformanceLogging: false,
    enableErrorRecovery: true
};

// ============================================================================
// BATTLE LOOP MANAGER CLASS
// ============================================================================

/**
 * BattleLoopManager - Manages battle execution with turn processing and state tracking
 * 
 * @class
 * @since 2.0.0
 * @public
 */
export class BattleLoopManager {
    /**
     * Creates a new BattleLoopManager instance
     * 
     * @param {BattleLoopConfig} [config={}] - Battle loop configuration
     * 
     * @throws {TypeError} When config is not an object
     * @throws {RangeError} When config values are out of valid range
     * 
     * @example
     * // Create with default configuration
     * const manager = new BattleLoopManager();
     * 
     * // Create with custom configuration
     * const customManager = new BattleLoopManager({
     *   maxTurns: 30,
     *   enableDebugLogging: true,
     *   stalemateThreshold: 15
     * });
     * 
     * @since 2.0.0
     * @public
     */
    constructor(config = {}) {
        // Input validation
        if (typeof config !== 'object' || config === null) {
            throw new TypeError('BattleLoopManager: config must be an object');
        }

        // Merge and validate configuration
        /** @type {BattleLoopConfig} */
        this.config = this._validateAndMergeConfig(config);

        // Initialize state
        /** @type {BattleLoopState | null} */
        this.state = null;

        /** @type {LoopMetrics} */
        this.metrics = {
            totalExecutionTime: 0,
            averageTurnTime: 0,
            totalTurns: 0,
            totalEvents: 0,
            errorsEncountered: 0,
            eventTypeCount: {}
        };

        /** @type {string} */
        this.id = `battle-loop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        if (this.config.enableDebugLogging) {
            console.debug(`[BattleLoopManager] Created instance ${this.id} with config:`, this.config);
        }
    }

    /**
     * Executes a complete battle loop
     * 
     * @param {Fighter} fighter1 - First fighter
     * @param {Fighter} fighter2 - Second fighter
     * @param {BattleState} initialBattleState - Initial battle state
     * 
     * @returns {Promise<BattleResult>} Complete battle result
     * 
     * @throws {TypeError} When fighters or battle state are invalid
     * @throws {Error} When battle execution fails
     * @throws {Error} When loop is already running
     * 
     * @example
     * // Execute battle
     * const result = await manager.executeBattle(
     *   aang, azula, initialState
     * );
     * console.log(`Winner: ${result.winnerId}`);
     * 
     * @since 2.0.0
     * @public
     */
    async executeBattle(fighter1, fighter2, initialBattleState) {
        // Input validation
        if (!fighter1 || typeof fighter1 !== 'object') {
            throw new TypeError('executeBattle: fighter1 must be a valid fighter object');
        }

        if (!fighter2 || typeof fighter2 !== 'object') {
            throw new TypeError('executeBattle: fighter2 must be a valid fighter object');
        }

        if (!initialBattleState || typeof initialBattleState !== 'object') {
            throw new TypeError('executeBattle: initialBattleState must be a valid battle state object');
        }

        // Check if loop is already running
        if (this.state && this.state.status === 'running') {
            throw new Error('executeBattle: Battle loop is already running');
        }

        // Validate battle state
        try {
            validateBattleState(initialBattleState);
        } catch (error) {
            throw new Error(`executeBattle: Invalid battle state - ${error.message}`);
        }

        /** @type {number} */
        const startTime = performance.now();

        try {
            // Initialize loop state
            this._initializeLoopState(fighter1, fighter2, initialBattleState);

            if (this.config.enableDebugLogging) {
                console.debug(`[BattleLoopManager] Starting battle: ${fighter1.id} vs ${fighter2.id}`);
            }

            // Execute main battle loop
            /** @type {BattleState} */
            const finalBattleState = await this._executeMainLoop(initialBattleState);

            // Generate final result
            /** @type {BattleResult} */
            const result = this._generateBattleResult(finalBattleState);

            // Update metrics
            this._updateFinalMetrics(startTime);

            if (this.config.enableDebugLogging) {
                console.debug(`[BattleLoopManager] Battle completed in ${this.metrics.totalExecutionTime.toFixed(2)}ms`);
            }

            return result;

        } catch (error) {
            this._handleLoopError(error, startTime);
            throw error;
        }
    }

    /**
     * Gets current loop state
     * 
     * @returns {BattleLoopState | null} Current loop state or null if not running
     * 
     * @example
     * // Check current state
     * const state = manager.getCurrentState();
     * if (state) {
     *   console.log(`Turn: ${state.turn}, Status: ${state.status}`);
     * }
     * 
     * @since 2.0.0
     * @public
     */
    getCurrentState() {
        return this.state ? { ...this.state } : null;
    }

    /**
     * Gets current performance metrics
     * 
     * @returns {LoopMetrics} Current loop metrics
     * 
     * @example
     * // Get performance data
     * const metrics = manager.getMetrics();
     * console.log(`Average turn time: ${metrics.averageTurnTime}ms`);
     * 
     * @since 2.0.0
     * @public
     */
    getMetrics() {
        return { ...this.metrics };
    }

    /**
     * Terminates the battle loop if running
     * 
     * @param {string} [reason='Manual termination'] - Reason for termination
     * 
     * @returns {boolean} True if loop was terminated, false if not running
     * 
     * @example
     * // Terminate loop
     * const terminated = manager.terminate('User cancelled');
     * 
     * @since 2.0.0
     * @public
     */
    terminate(reason = 'Manual termination') {
        if (!this.state || this.state.status !== 'running') {
            return false;
        }

        if (typeof reason !== 'string') {
            throw new TypeError('terminate: reason must be a string');
        }

        this.state.status = 'terminated';
        this.state.metadata.terminationReason = reason;
        this.state.executionEndTime = performance.now();

        if (this.config.enableDebugLogging) {
            console.debug(`[BattleLoopManager] Loop terminated: ${reason}`);
        }

        return true;
    }

    /**
     * Validates and merges configuration with defaults
     * 
     * @param {Object} userConfig - User-provided configuration
     * 
     * @returns {BattleLoopConfig} Validated and merged configuration
     * 
     * @throws {RangeError} When configuration values are out of range
     * @throws {TypeError} When configuration values have wrong type
     * 
     * @private
     * @since 2.0.0
     */
    _validateAndMergeConfig(userConfig) {
        /** @type {BattleLoopConfig} */
        const config = { ...DEFAULT_BATTLE_LOOP_CONFIG, ...userConfig };

        // Validate maxTurns
        if (typeof config.maxTurns !== 'number' || 
            config.maxTurns < MIN_MAX_TURNS || 
            config.maxTurns > MAX_MAX_TURNS) {
            throw new RangeError(`BattleLoopManager: maxTurns must be between ${MIN_MAX_TURNS} and ${MAX_MAX_TURNS}`);
        }

        // Validate stalemateThreshold
        if (typeof config.stalemateThreshold !== 'number' || 
            config.stalemateThreshold < MIN_STALEMATE_THRESHOLD || 
            config.stalemateThreshold > MAX_STALEMATE_THRESHOLD) {
            throw new RangeError(`BattleLoopManager: stalemateThreshold must be between ${MIN_STALEMATE_THRESHOLD} and ${MAX_STALEMATE_THRESHOLD}`);
        }

        // Validate boolean options
        if (typeof config.enableDebugLogging !== 'boolean') {
            throw new TypeError('BattleLoopManager: enableDebugLogging must be a boolean');
        }

        if (typeof config.enableNarrative !== 'boolean') {
            throw new TypeError('BattleLoopManager: enableNarrative must be a boolean');
        }

        if (typeof config.enableCurbstompRules !== 'boolean') {
            throw new TypeError('BattleLoopManager: enableCurbstompRules must be a boolean');
        }

        // Validate optional timeout
        if (typeof config.turnTimeoutMs !== 'undefined') {
            if (typeof config.turnTimeoutMs !== 'number' || 
                config.turnTimeoutMs < MIN_TURN_TIMEOUT || 
                config.turnTimeoutMs > MAX_TURN_TIMEOUT) {
                throw new RangeError(`BattleLoopManager: turnTimeoutMs must be between ${MIN_TURN_TIMEOUT} and ${MAX_TURN_TIMEOUT}`);
            }
        }

        // Validate optional boolean options
        if (typeof config.enablePerformanceLogging !== 'undefined' && 
            typeof config.enablePerformanceLogging !== 'boolean') {
            throw new TypeError('BattleLoopManager: enablePerformanceLogging must be a boolean');
        }

        if (typeof config.enableErrorRecovery !== 'undefined' && 
            typeof config.enableErrorRecovery !== 'boolean') {
            throw new TypeError('BattleLoopManager: enableErrorRecovery must be a boolean');
        }

        return config;
    }

    /**
     * Initializes the battle loop state
     * 
     * @param {Fighter} fighter1 - First fighter
     * @param {Fighter} fighter2 - Second fighter
     * @param {BattleState} initialBattleState - Initial battle state
     * 
     * @private
     * @since 2.0.0
     */
    _initializeLoopState(fighter1, fighter2, initialBattleState) {
        // Implementation of _initializeLoopState method
    }

    /**
     * Executes the main battle loop
     * 
     * @param {BattleState} initialBattleState - Initial battle state
     * 
     * @returns {Promise<BattleState>} Final battle state
     * 
     * @private
     * @since 2.0.0
     */
    async _executeMainLoop(initialBattleState) {
        // Implementation of _executeMainLoop method
    }

    /**
     * Generates the final battle result
     * 
     * @param {BattleState} finalBattleState - Final battle state
     * 
     * @returns {BattleResult} Complete battle result
     * 
     * @private
     * @since 2.0.0
     */
    _generateBattleResult(finalBattleState) {
        // Implementation of _generateBattleResult method
    }

    /**
     * Updates final loop metrics
     * 
     * @param {number} startTime - When loop started (timestamp)
     * 
     * @private
     * @since 2.0.0
     */
    _updateFinalMetrics(startTime) {
        // Implementation of _updateFinalMetrics method
    }

    /**
     * Handles loop error
     * 
     * @param {Error} error - Error encountered
     * @param {number} startTime - When loop started (timestamp)
     * 
     * @private
     * @since 2.0.0
     */
    _handleLoopError(error, startTime) {
        // Implementation of _handleLoopError method
    }
} 