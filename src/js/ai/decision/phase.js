/**
 * @fileoverview Determines the battle phase for AI decision making.
 */

"use strict";

/**
 * @typedef {import('../../types/battle.js').Fighter} Fighter
 * @typedef {import('../../types/battle.js').BattleState} BattleState
 */

/**
 * Determines the current battle phase.
 * @param {BattleState} battleState - The current battle state.
 * @param {Fighter} aiFighter - The AI fighter.
 * @param {Fighter} opponentFighter - The opponent fighter.
 * @returns {string} The current battle phase.
 */
export function determineBattlePhase(battleState, aiFighter, opponentFighter) {
    const turn = battleState.turn;
    const aiHealthPercent = aiFighter.hp / 100;
    const opponentHealthPercent = opponentFighter.hp / 100;

    if (turn < 3) return "opening";
    if (turn < 8) return "early";
    if (aiHealthPercent < 0.2 || opponentHealthPercent < 0.2) return "desperate";
    if (turn < 15) return "mid";
    if (turn < 25) return "late";
    return "endgame";
} 