/**
 * @fileoverview Escalation State Determination
 * @description Pure state logic for determining escalation levels
 * @version 1.0
 */

'use strict';

export const ESCALATION_STATES = {
    NORMAL: 'Normal',
    PRESSURED: 'Pressured',
    SEVERELY_INCAPACITATED: 'Severely Incapacitated',
    TERMINAL_COLLAPSE: 'Terminal Collapse'
};

const ESCALATION_THRESHOLDS = {
    [ESCALATION_STATES.NORMAL]: 0,
    [ESCALATION_STATES.PRESSURED]: 4,
    [ESCALATION_STATES.SEVERELY_INCAPACITATED]: 8,
    [ESCALATION_STATES.TERMINAL_COLLAPSE]: 11
};

/**
 * Determines the escalation state based on the incapacitation score.
 * @param {number} score - The incapacitation score.
 * @returns {string} The escalation state (e.g., ESCALATION_STATES.NORMAL).
 */
export function determineEscalationState(score) {
    if (score >= ESCALATION_THRESHOLDS[ESCALATION_STATES.TERMINAL_COLLAPSE]) {
        return ESCALATION_STATES.TERMINAL_COLLAPSE;
    }
    if (score >= ESCALATION_THRESHOLDS[ESCALATION_STATES.SEVERELY_INCAPACITATED]) {
        return ESCALATION_STATES.SEVERELY_INCAPACITATED;
    }
    if (score >= ESCALATION_THRESHOLDS[ESCALATION_STATES.PRESSURED]) {
        return ESCALATION_STATES.PRESSURED;
    }
    return ESCALATION_STATES.NORMAL;
} 