/**
 * @fileoverview Manages the main battle simulation loop.
 */

"use strict";

import { validateAndMergeConfig } from "./battle_loop/config.js";
import { initializeLoopState } from "./battle_loop/state.js";
import { executeMainLoop } from "./battle_loop/loop.js";
import { initializeMetrics, updateFinalMetrics } from "./battle_loop/metrics.js";
import { generateBattleResult } from "./battle_loop/results.js";
import { handleLoopError } from "./battle_loop/error_handler.js";

/**
 * @typedef {import('./types/battle.js').Fighter} Fighter
 * @typedef {import('./types/battle.js').BattleState} BattleState
 * @typedef {import('./types/battle.js').BattleResult} BattleResult
 * @typedef {import('./types/battle_loop.js').BattleLoopConfig} BattleLoopConfig
 * @typedef {import('./types/battle_loop.js').BattleLoopState} BattleLoopState
 * @typedef {import('./types/battle_loop.js').LoopMetrics} LoopMetrics
 */

export class BattleLoopManager {
    /** @type {BattleLoopConfig} */
    config;
    /** @type {BattleLoopState | null} */
    state = null;
    /** @type {LoopMetrics} */
    metrics;

    /**
     * @param {Partial<BattleLoopConfig>} [config={}]
     */
    constructor(config = {}) {
        this.config = validateAndMergeConfig(config);
        this.metrics = initializeMetrics();
    }

    /**
     * @param {Fighter} fighter1
     * @param {Fighter} fighter2
     * @param {BattleState} initialBattleState
     * @returns {Promise<BattleResult>}
     */
    async executeBattle(fighter1, fighter2, initialBattleState) {
        if (this.state && this.state.status === "running") {
            throw new Error("Battle loop is already running.");
        }

        this.state = initializeLoopState(fighter1, fighter2);

        try {
            const finalBattleState = await executeMainLoop(initialBattleState, this.config, this.state);
            const result = generateBattleResult(finalBattleState, this.state);
            this.metrics = updateFinalMetrics(this.metrics, this.state);
            return result;
        } catch (/** @type {any} */ error) {
            this.state = handleLoopError(error, this.state);
            this.metrics = updateFinalMetrics(this.metrics, this.state);
            throw error;
        }
    }

    /**
     * @returns {BattleLoopState | null}
     */
    getCurrentState() {
        return this.state ? { ...this.state } : null;
    }

    /**
     * @returns {LoopMetrics}
     */
    getMetrics() {
        return { ...this.metrics };
    }

    /**
     * @param {string} [reason='Manual termination']
     * @returns {boolean}
     */
    terminate(reason = "Manual termination") {
        if (!this.state || this.state.status !== "running") {
            return false;
        }
        this.state.status = "terminated";
        this.state.metadata.terminationReason = reason;
        this.state.executionEndTime = performance.now();
        return true;
    }
} 