/**
 * @fileoverview The core battle loop execution logic.
 */

"use strict";

import { processTurn } from "../engine_turn-processor.js";
import { checkBattleTermination } from "../engine/core/termination.js";

/**
 * @typedef {import('../types/battle.js').BattleState} BattleState
 * @typedef {import('../types/battle_loop.js').BattleLoopConfig} BattleLoopConfig
 * @typedef {import('../types/battle_loop.js').BattleLoopState} BattleLoopState
 */

/**
 * Executes the main battle loop.
 * @param {BattleState} initialBattleState
 * @param {BattleLoopConfig} config
 * @param {BattleLoopState} loopState
 * @returns {Promise<BattleState>}
 */
export async function executeMainLoop(initialBattleState, config, loopState) {
    let currentState = { ...initialBattleState };
    loopState.status = "running";

    for (let i = 1; i <= config.maxTurns; i++) {
        if (loopState.status !== "running") {
            console.log(`[Battle Loop] Loop terminated externally: ${loopState.metadata.terminationReason}`);
            break;
        }

        const turnResult = await processTurn(currentState, {
            turnNumber: i,
            enableNarrative: config.enableNarrative,
            enableDebugLogging: config.enableDebugLogging,
        });

        currentState = turnResult.battleState;
        loopState.battleEventLog.push(...turnResult.newEvents);
        loopState.turn = i;

        const winnerId = checkBattleTermination(currentState);
        if (winnerId) {
            loopState.battleOver = true;
            loopState.winnerId = winnerId;
            loopState.loserId = winnerId === currentState.fighter1.id ? currentState.fighter2.id : currentState.fighter1.id;
            break;
        }
    }

    if (!loopState.battleOver) {
        loopState.isStalemate = true;
    }
    loopState.status = "completed";
    loopState.executionEndTime = performance.now();

    return currentState;
} 