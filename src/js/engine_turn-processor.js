/**
 * @fileoverview Handles individual turn execution in battle.
 */

"use strict";

import { createWorkingBattleState, validateTurnEndState } from "./turn_processing/state.js";
import { applyPreTurnEffects, applyPostTurnEffects } from "./turn_processing/effects.js";
import { determineAndExecuteAction } from "./turn_processing/action.js";
import { updateMomentumAndEscalation } from "./turn_processing/momentum.js";
import { managePhaseTransition } from './engine_phase-manager.js';
import { assertBattleStateInvariants } from './utils_state_invariants.js';

/**
 * @typedef {import('./types/battle.js').BattleState} BattleState
 * @typedef {import('./types/engine.js').TurnOptions} TurnOptions
 */

/**
 * Processes a complete turn for the active fighter.
 * @param {BattleState} battleState - The current state of the battle.
 * @param {TurnOptions} options - Options for processing the turn.
 * @returns {Promise<BattleState>} The updated battle state after the turn.
 */
export async function processTurn(battleState, options) {
    const turnNumber = options.turnNumber || 1;
    const startTime = performance.now();

    try {
        let workingState = createWorkingBattleState(battleState, turnNumber);
        
        const activeFighter = determineActiveFighter(workingState, turnNumber);
        const inactiveFighter = activeFighter.id === workingState.fighter1.id ? workingState.fighter2 : workingState.fighter1;

        workingState = await applyPreTurnEffects(workingState, activeFighter, options);
        workingState = await determineAndExecuteAction(workingState, activeFighter, inactiveFighter, options);
        workingState = await applyPostTurnEffects(workingState, activeFighter, options);
        workingState = updateMomentumAndEscalation(workingState);

        // --- PHASE TRANSITION CHECK ---
        const phaseEvents = managePhaseTransition(workingState.phaseState, activeFighter, inactiveFighter, workingState);
        if (phaseEvents.length > 0) {
            workingState.log.push(...phaseEvents);
        }
        // --- END PHASE TRANSITION CHECK ---

        // --- STATE INVARIANT VALIDATION ---
        assertBattleStateInvariants(workingState, `end_of_turn_${turnNumber}`);
        // --- END STATE INVARIANT VALIDATION ---

        workingState.turn = turnNumber;
        validateTurnEndState(workingState, turnNumber);

        const executionTime = performance.now() - startTime;
        workingState.metadata.lastTurnExecutionTime = executionTime;

        return workingState;

    } catch (/** @type {any} */ error) {
        console.error(`[Turn Processor] Error on turn ${turnNumber}:`, error);
        // A more robust error handling system would be needed here.
        // For now, we re-throw to let the battle loop manager handle it.
        throw error;
    }
}

function determineActiveFighter(battleState, turnNumber) {
    // Simple alternating turn system for this refactoring.
    return turnNumber % 2 === 1 ? battleState.fighter1 : battleState.fighter2;
}
