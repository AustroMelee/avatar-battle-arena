/**
 * @fileoverview Avatar Battle Arena - Core Battle Engine
 * @description Implements the main entry point for executing a battle simulation loop.
 * This engine is a pure function that takes a pre-initialized battle state
 * and runs the simulation until a conclusion is reached.
 * @version 4.0.0
 */

"use strict";

//# sourceURL=engine_battle-engine-core.js

// --- TYPE IMPORTS ---
/**
 * @typedef {import('./types/battle.js').BattleState} BattleState
 * @typedef {import('./types/battle.js').BattleResult} BattleResult
 * @typedef {import('./types/battle.js').BattleEvent} BattleEvent
 * @typedef {import('./types/engine.js').BattleEngineOptions} BattleEngineOptions
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { isValidBattleResult } from "./engine/core/validation.js";
import { runBattleLoop } from "./engine/core/loop.js";
import { calculateBattleStatistics } from "./engine/core/results.js";

// ============================================================================
// CORE BATTLE ENGINE
// ============================================================================

/**
 * Executes a complete battle simulation on a given state.
 *
 * This is the primary public-facing function for the battle engine. It is a pure
 * function that receives a fully initialized battle state and orchestrates the
untime.
 *
 * @export
 * @param {BattleState} initialState - The fully initialized state for the battle.
 * @param {BattleEngineOptions} [options={}] - Engine configuration options.
 * @returns {Promise<BattleResult>} A promise that resolves with the complete battle result.
 * @throws {TypeError} If the initial state is not a valid BattleState object.
 * @throws {Error} If the battle loop produces an invalid result.
 */
export async function executeBattle(initialState, options = {}) {
    const startTime = performance.now();
    console.log("[Battle Engine] Starting battle with pre-initialized state...");

    try {
        // 1. Validate Core Parameters
        /** @type {BattleState} */
        const state = initialState;
        if (!state || typeof state !== "object" || !state.fighter1 || !state.fighter2) {
            throw new TypeError("executeBattle requires a valid, initialized BattleState object.");
        }

        // 2. Run Battle Loop
        const result = await runBattleLoop(state, options);

        // 3. Validate Result
        /** @type {BattleResult} */
        const battleResult = result;
        if (!isValidBattleResult(battleResult)) {
            throw new Error("Battle produced an invalid result object.");
        }

        // 4. Finalize and Return
        const executionTime = performance.now() - startTime;
        console.log(`[Battle Engine] Battle completed in ${executionTime.toFixed(2)}ms`);
        
        // Optional: Attach statistics for convenience
        /** @type {any} */ (battleResult).statistics = calculateBattleStatistics(battleResult);

        console.log("[Battle Engine] Final result:", {
            winnerId: battleResult.winnerId,
            turnCount: battleResult.finalState.turn,
            eventCount: battleResult.log.length,
        });

        return battleResult;

    } catch (/** @type {any} */ error) {
        console.error("[Battle Engine] Critical battle execution failed:", error);
        // Re-throw the error to be handled by the application's top-level error handler
        throw error;
    }
}
