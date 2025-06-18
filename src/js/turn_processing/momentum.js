/**
 * @fileoverview Momentum and escalation logic for the turn processor.
 */

"use strict";

/**
 * @typedef {import('../types/battle.js').BattleState} BattleState
 * @typedef {import('../types/battle.js').Fighter} Fighter
 */

/**
 * Updates the momentum and escalation state for both fighters.
 * @param {BattleState} battleState
 * @returns {BattleState}
 */
export function updateMomentumAndEscalation(battleState) {
    updateFighterMomentum(battleState, battleState.fighter1);
    updateFighterMomentum(battleState, battleState.fighter2);
    return battleState;
}

function updateFighterMomentum(battleState, fighter) {
    // This is a simplified implementation.
    const lastEvent = battleState.events[battleState.events.length - 1];
    let momentumChange = 0;

    if (lastEvent?.type === "DAMAGE_DEALT") {
        if (lastEvent.data.attackerId === fighter.id) {
            momentumChange = 1;
        } else if (lastEvent.data.defenderId === fighter.id) {
            momentumChange = -1;
        }
    }

    fighter.momentum = Math.max(-10, Math.min(10, (fighter.momentum || 0) + momentumChange));
    updateEscalationState(fighter);
}

function updateEscalationState(fighter) {
    const incapacitationRatio = (fighter.incapacitationScore || 0) / 100;
    if (incapacitationRatio > 0.75) {
        fighter.escalationState = "Terminal";
    } else if (incapacitationRatio > 0.5) {
        fighter.escalationState = "Desperate";
    } else if (incapacitationRatio > 0.25) {
        fighter.escalationState = "Escalating";
    } else {
        fighter.escalationState = "Normal";
    }
} 