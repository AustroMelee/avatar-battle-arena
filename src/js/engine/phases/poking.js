/**
 * @fileoverview Processes the transition from Poking to Early phase.
 */

"use strict";

import { BATTLE_PHASES } from "./constants.js";
import { locations } from "../../locations.js";

/**
 * @typedef {import('../../types/engine.js').PhaseState} PhaseState
 */

/**
 * Processes Poking to Early phase transition.
 * @param {PhaseState} phaseState - Current phase state.
 * @param {number} totalTurnsElapsed - Total turns elapsed.
 * @param {string} locationId - Battle location identifier.
 * @param {Function} updatePhaseStats - Function to update phase stats.
 * @returns {boolean} True if transition occurred.
 */
export function processPokingTransition(phaseState, totalTurnsElapsed, locationId, updatePhaseStats) {
    /** @type {PhaseState} */
    const state = phaseState;

    if (state.turnInCurrentPhase >= state.pokingDuration) {
        const locationOverrides = locations[locationId]?.phaseOverrides;
        
        if (locationOverrides && locationOverrides.pokingDuration !== undefined) {
            state.pokingDuration = locationOverrides.pokingDuration;
        }
        
        state.phaseSummaryLog.push({ 
            phase: BATTLE_PHASES["POKING"], 
            turns: state.turnInCurrentPhase 
        });

        state.currentPhase = BATTLE_PHASES["EARLY"];
        state.turnInCurrentPhase = 0;
        updatePhaseStats();
        state.phaseLog.push(
            `Transitioned to ${BATTLE_PHASES["EARLY"]} Phase on turn ${totalTurnsElapsed + 1}. Triggers: Poking Phase Duration Met.`
        );
        return true;
    }
    return false;
} 