/**
 * @fileoverview Processes the transition from Mid to Late phase.
 */

"use strict";

import { BATTLE_PHASES } from "./constants.js";

/**
 * @typedef {import('../../types/engine.js').PhaseState} PhaseState
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 */

/**
 * Processes Mid to Late phase transition.
 * @param {PhaseState} phaseState - Current phase state.
 * @param {Fighter} fighter1 - First fighter.
 * @param {Fighter} fighter2 - Second fighter.
 * @param {number} totalTurnsElapsed - Total turns elapsed.
 * @param {Function} updatePhaseStats - Function to update phase stats.
 * @returns {boolean} True if transition occurred.
 */
export function processMidTransition(phaseState, fighter1, fighter2, totalTurnsElapsed, updatePhaseStats) {
    let latePhaseTriggers = 0;

    const hpDeltaF1 = (phaseState.currentPhaseFighterStats.f1.hp || 0) - (fighter1.hp || 0);
    const hpDeltaF2 = (phaseState.currentPhaseFighterStats.f2.hp || 0) - (fighter2.hp || 0);

    if ((fighter1.hp || 0) <= 30 || (fighter2.hp || 0) <= 30) latePhaseTriggers++;
    if (hpDeltaF1 >= 25 || hpDeltaF2 >= 25) latePhaseTriggers++;
    if (Math.abs(Number(fighter1.momentum || 0)) >= 8 || Math.abs(Number(fighter2.momentum || 0)) >= 8) latePhaseTriggers++;
    if (fighter1.mentalState?.level === "desperate" || fighter2.mentalState?.level === "desperate") latePhaseTriggers++;
    if (fighter1.lastMove?.isFinisher || (fighter1.lastMove?.power && fighter1.lastMove.power >= 80)) latePhaseTriggers++;
    if (fighter2.lastMove?.isFinisher || (fighter2.lastMove?.power && fighter2.lastMove.power >= 80)) latePhaseTriggers++;

    const MIN_MID_TURNS = 2;
    const MAX_MID_TURNS = 7;
    if (phaseState.turnInCurrentPhase >= MIN_MID_TURNS && latePhaseTriggers === 0) latePhaseTriggers++;

    if (latePhaseTriggers >= 2 || phaseState.turnInCurrentPhase >= MAX_MID_TURNS) {
        phaseState.phaseSummaryLog.push({ 
            phase: BATTLE_PHASES.MID, 
            turns: phaseState.turnInCurrentPhase 
        });

        phaseState.currentPhase = BATTLE_PHASES.LATE;
        phaseState.turnInCurrentPhase = 0;
        updatePhaseStats();
        phaseState.phaseLog.push(
            `Transitioned to ${BATTLE_PHASES.LATE} Phase on turn ${totalTurnsElapsed + 1}. Triggers: ${latePhaseTriggers} (or max turns for phase).`
        );
        return true;
    }
    return false;
} 