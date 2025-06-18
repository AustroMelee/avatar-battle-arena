/**
 * @fileoverview Processes the transition from Pre-Banter to Poking phase.
 */

"use strict";

import { BATTLE_PHASES } from "./constants.js";

/**
 * @typedef {import('../../types/engine.js').PhaseState} PhaseState
 */

/**
 * Processes Pre-Banter to Poking phase transition.
 * @param {PhaseState} phaseState - Current phase state.
 * @param {number} totalTurnsElapsed - Total turns elapsed.
 * @param {Function} updatePhaseStats - Function to update phase stats.
 * @returns {boolean} True if transition occurred.
 */
export function processPreBanterTransition(phaseState, totalTurnsElapsed, updatePhaseStats) {
    if (phaseState.turnInCurrentPhase >= 1) {
        phaseState.phaseSummaryLog.push({ 
            phase: BATTLE_PHASES.PRE_BANTER, 
            turns: phaseState.turnInCurrentPhase 
        });

        phaseState.currentPhase = BATTLE_PHASES.POKING;
        phaseState.turnInCurrentPhase = 0;
        updatePhaseStats();
        phaseState.phaseLog.push(
            `Transitioned to ${BATTLE_PHASES.POKING} Phase on turn ${totalTurnsElapsed + 1}. Triggers: Narrative Completion.`
        );
        return true;
    }
    return false;
} 