/**
 * @fileoverview Checks battle termination conditions.
 */

"use strict";

/**
 * @typedef {import('../../types/battle.js').BattleState} BattleState
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 */

const TERMINAL_INCAPACITATION_THRESHOLD = 100;

/**
 * Checks if the battle should terminate due to victory conditions.
 * @param {BattleState} state - The current battle state.
 * @returns {string | null} The winner's ID if the battle should end, otherwise null.
 */
export function checkBattleTermination(state) {
    if (!state || !state.fighter1 || !state.fighter2) {
        throw new TypeError("checkBattleTermination: state must be a valid battle state with two fighters");
    }

    const { fighter1, fighter2, winnerId } = state;

    if (winnerId) {
        return winnerId;
    }

    const f1Incapacitated = (fighter1.incapacitationScore || 0) >= TERMINAL_INCAPACITATION_THRESHOLD;
    const f2Incapacitated = (fighter2.incapacitationScore || 0) >= TERMINAL_INCAPACITATION_THRESHOLD;
    const f1Collapsed = fighter1.escalationState === "Terminal Collapse";
    const f2Collapsed = fighter2.escalationState === "Terminal Collapse";

    if ((f1Incapacitated || f1Collapsed) && (f2Incapacitated || f2Collapsed)) {
        return null; // Draw
    }
    if (f1Incapacitated || f1Collapsed) {
        return fighter2.id;
    }
    if (f2Incapacitated || f2Collapsed) {
        return fighter1.id;
    }

    return null; // Continue battle
} 