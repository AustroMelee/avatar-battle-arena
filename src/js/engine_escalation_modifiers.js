/**
 * @fileoverview Escalation Damage Modifiers
 * @description Combat damage modification based on escalation state
 * @version 1.0
 */

"use strict";

import { ESCALATION_STATES } from "./engine_escalation_states.js";

const EDM_MULTIPLIERS = { // Escalation Damage Modifiers
    [ESCALATION_STATES.NORMAL]: 1.0,
    [ESCALATION_STATES.PRESSURED]: 1.15, // Increased from 1.1
    [ESCALATION_STATES.SEVERELY_INCAPACITATED]: 1.3,
    [ESCALATION_STATES.TERMINAL_COLLAPSE]: 1.6
};

/**
 * Applies the Escalation Damage Modifier (EDM) to a base damage value.
 * This modifier is based on the *defender's* escalation state.
 * @param {number} baseDamage - The initial damage of the move.
 * @param {string} defenderEscalationState - The current escalation state of the defender.
 * @returns {number} The damage after applying the EDM.
 */
export function applyEscalationDamageModifier(baseDamage, defenderEscalationState) {
    const multiplier = EDM_MULTIPLIERS[defenderEscalationState] || 1.0;
    return Math.round(baseDamage * multiplier);
} 