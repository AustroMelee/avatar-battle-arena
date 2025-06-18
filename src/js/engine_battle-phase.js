/**
 * @fileoverview Avatar Battle Arena - Battle Phase Management Engine
 * @description Manages battle phase transitions and state throughout combat.
 * @version 2.1.0
 */

"use strict";

import * as Phase from "./engine/phases/index.js";
import { USE_DETERMINISTIC_RANDOM } from "./config_game.js";
import { generateLogEvent } from "./utils_log_event.js";
import { seededRandom } from "./utils_seeded_random.js";
import { getPhaseTransitionRequirements } from "./engine/phases/phase_utils.js";

/**
 * @typedef {import('./types/battle.js').Fighter} Fighter
 * @typedef {import('./types/battle.js').BattleState} BattleState
 * @typedef {import('./types/engine.js').PhaseState} PhaseState
 * @typedef {import('./types/battle.js').BattleEvent} BattleEvent
 */

export const BATTLE_PHASES = Phase.BATTLE_PHASES;

/**
 * Initializes the battle phase state for a new battle.
 * @param {BattleState} battleState
 * @param {BattleEvent[]} battleEventLog
 * @returns {PhaseState}
 */
export function initializeBattlePhaseState(battleState, battleEventLog) {
    if (!battleState || !Array.isArray(battleEventLog)) {
        throw new TypeError("Invalid arguments for initializeBattlePhaseState");
    }

    const pokingReqs = getPhaseTransitionRequirements("POKING", "EARLY");
    if (!pokingReqs) {
        throw new Error("Could not retrieve poking phase transition requirements.");
    }
    const pokingDuration = Math.floor((USE_DETERMINISTIC_RANDOM ? seededRandom() : Math.random()) * (pokingReqs.MAX_DURATION - pokingReqs.MIN_DURATION + 1)) + pokingReqs.MIN_DURATION;

    battleEventLog.push(generateLogEvent(battleState, {
        type: "dice_roll",
        rollType: "pokingDuration",
        result: pokingDuration,
        outcome: `Poking phase duration set to ${pokingDuration} turns.`
    }));

    const phaseState = {
        currentPhase: BATTLE_PHASES["PRE_BANTER"],
        turnInCurrentPhase: 0,
        pokingDuration: pokingDuration,
        phaseLog: [`Battle started in ${BATTLE_PHASES["PRE_BANTER"]} Phase.`],
        phaseSummaryLog: [],
        currentPhaseFighterStats: { f1: { hp: null, momentum: null }, f2: { hp: null, momentum: null } }
    };

    console.log(`[Phase Manager] Initialized phase state: ${BATTLE_PHASES["PRE_BANTER"]}, poking duration: ${pokingDuration}`);
    return phaseState;
}

/**
 * Checks for and processes battle phase transitions.
 * @param {PhaseState} phaseState
 * @param {Fighter} fighter1
 * @param {Fighter} fighter2
 * @param {number} totalTurnsElapsed
 * @param {string} locationId
 * @returns {boolean}
 */
export function checkAndTransitionPhase(phaseState, fighter1, fighter2, totalTurnsElapsed, locationId) {
    /** @type {PhaseState} */
    const state = phaseState;
    const originalPhase = state.currentPhase;
    state.turnInCurrentPhase++;

    const updatePhaseStats = () => {
        state.currentPhaseFighterStats.f1 = { hp: fighter1.hp, momentum: fighter1.momentum };
        state.currentPhaseFighterStats.f2 = { hp: fighter2.hp, momentum: fighter2.momentum };
    };

    let transitioned = false;
    switch (state.currentPhase) {
        case BATTLE_PHASES["PRE_BANTER"]:
            transitioned = Phase.processPreBanterTransition(state, totalTurnsElapsed, updatePhaseStats);
            break;
        case BATTLE_PHASES["POKING"]:
            transitioned = Phase.processPokingTransition(state, totalTurnsElapsed, locationId, updatePhaseStats);
            break;
        case BATTLE_PHASES["EARLY"]:
            transitioned = Phase.processEarlyTransition(state, fighter1, fighter2, totalTurnsElapsed, updatePhaseStats);
            break;
        case BATTLE_PHASES["MID"]:
            transitioned = Phase.processMidTransition(state, fighter1, fighter2, totalTurnsElapsed, updatePhaseStats);
            break;
    }

    if (transitioned) {
        console.log(`[Phase Manager] Transition: ${originalPhase} → ${state.currentPhase} (turn ${totalTurnsElapsed + 1})`);
    }

    return originalPhase !== state.currentPhase;
}

export { getPhaseAIModifiers, validatePhaseState, getPhaseTransitionRequirements } from "./engine/phases/index.js";