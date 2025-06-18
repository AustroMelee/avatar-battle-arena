/**
 * @fileoverview Processes the transition from Early to Mid phase.
 */

"use strict";

import { BATTLE_PHASES } from "./constants.js";

/**
 * @typedef {import('../../types/engine.js').PhaseState} PhaseState
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 */

/**
 * Processes Early to Mid phase transition.
 * @param {PhaseState} phaseState - Current phase state.
 * @param {Fighter} fighter1 - First fighter.
 * @param {Fighter} fighter2 - Second fighter.
 * @param {number} totalTurnsElapsed - Total turns elapsed.
 * @param {Function} updatePhaseStats - Function to update phase stats.
 * @returns {boolean} True if transition occurred.
 */
export function processEarlyTransition(phaseState, fighter1, fighter2, totalTurnsElapsed, updatePhaseStats) {
    /** @type {PhaseState} */
    const state = phaseState;
    let midPhaseTriggers = 0;

    const hpDeltaF1 = (state.currentPhaseFighterStats.f1.hp || 0) - (fighter1.hp || 0);
    const hpDeltaF2 = (state.currentPhaseFighterStats.f2.hp || 0) - (fighter2.hp || 0);
    const momentumDeltaF1 = Number(fighter1.momentum || 0) - Number(state.currentPhaseFighterStats.f1.momentum || 0);
    const momentumDeltaF2 = Number(fighter2.momentum || 0) - Number(state.currentPhaseFighterStats.f2.momentum || 0);

    if ((fighter1.hp || 0) <= 60 || (fighter2.hp || 0) <= 60) midPhaseTriggers++;
    if (Math.abs(Number(fighter1.momentum || 0)) >= 5 || Math.abs(Number(fighter2.momentum || 0)) >= 5) midPhaseTriggers++;
    if (hpDeltaF1 >= 30 || hpDeltaF2 >= 30) midPhaseTriggers++;
    if (momentumDeltaF1 >= 5 || momentumDeltaF2 >= 5) midPhaseTriggers++;
    if (Math.abs((fighter1.hp || 0) - (fighter2.hp || 0)) >= 30) midPhaseTriggers++;
    if (Math.abs(Number(fighter1.momentum || 0) - Number(fighter2.momentum || 0)) >= 8) midPhaseTriggers++;

    if (fighter1.mentalState?.level === "stressed" || fighter2.mentalState?.level === "stressed") midPhaseTriggers++;
    if (fighter1.lastMove?.type === "Finisher" || (fighter1.lastMove?.power && fighter1.lastMove.power >= 70)) midPhaseTriggers++;
    if (fighter2.lastMove?.type === "Finisher" || (fighter2.lastMove?.power && fighter2.lastMove.power >= 70)) midPhaseTriggers++;

    const MIN_EARLY_TURNS = 2;
    const MAX_EARLY_TURNS = 5;
    if (state.turnInCurrentPhase >= MIN_EARLY_TURNS && midPhaseTriggers === 0) midPhaseTriggers++;

    if (midPhaseTriggers >= 1 || state.turnInCurrentPhase >= MAX_EARLY_TURNS) {
        state.phaseSummaryLog.push({ 
            phase: BATTLE_PHASES["EARLY"], 
            turns: state.turnInCurrentPhase 
        });

        state.currentPhase = BATTLE_PHASES["MID"];
        state.turnInCurrentPhase = 0;
        updatePhaseStats();
        state.phaseLog.push(
            `Transitioned to ${BATTLE_PHASES["MID"]} Phase on turn ${totalTurnsElapsed + 1}. Triggers: ${midPhaseTriggers} (or max turns for phase).`
        );
        return true;
    }
    return false;
} 