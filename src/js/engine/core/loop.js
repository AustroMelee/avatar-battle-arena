/**
 * @fileoverview Runs the main battle loop.
 */

"use strict";

import { processTurn } from "../../engine_turn-processor.js";
import { checkBattleTermination } from "./termination.js";
import { createBattleResult } from "./results.js";

/**
 * @typedef {import('../../types/battle.js').BattleState} BattleState
 * @typedef {import('../../types/battle.js').BattleResult} BattleResult
 * @typedef {import('../../types/battle.js').BattleEvent} BattleEvent
 * @typedef {import('../../types/engine.js').BattleEngineOptions} BattleEngineOptions
 */

const DEFAULT_MAX_TURNS = 50;

/**
 * Runs the main battle loop until victory or maximum turns.
 * @param {BattleState} initialState
 * @param {BattleEngineOptions} options
 * @returns {Promise<BattleResult>}
 */
export async function runBattleLoop(initialState, options) {
    let currentState = { ...initialState };
    const maxTurns = options.maxTurns || DEFAULT_MAX_TURNS;
    const battleLog = [];

    for (let turnNumber = 1; turnNumber <= maxTurns; turnNumber++) {
        try {
            const turnResult = await processTurn(currentState, {
                turnNumber,
                enableNarrative: options.enableNarrative !== false,
                enableDebugLogging: options.enableDebugLogging || false,
            });

            if (turnResult.events?.length) {
                battleLog.push(...turnResult.events);
            }
            currentState = turnResult;

            const winnerId = checkBattleTermination(currentState);
            if (winnerId) {
                return createBattleResult(currentState, winnerId, turnNumber, battleLog, false);
            }
        } catch (/** @type {any} */ error) {
            console.error(`[Battle Loop] Error on turn ${turnNumber}:`, error);
            battleLog.push({
                type: "ERROR",
                turn: turnNumber,
                data: { message: error.message, stack: error.stack },
                timestamp: new Date().toISOString(),
            });
            throw new Error(`Battle loop failed on turn ${turnNumber}: ${error.message}`);
        }
    }

    return createBattleResult(currentState, null, maxTurns, battleLog, true);
} 