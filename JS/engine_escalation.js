// FILE: js/engine_escalation.js
'use strict';

// ====================================================================================
//  Escalation Engine (v1.0)
// ====================================================================================
//  This module centralizes the logic for the Escalation Combat Overhaul,
//  including Incapacitation Score calculation, Escalation State determination,
//  Escalation Damage Modification, and AI behavior biasing during Escalation.
// ====================================================================================

export const INCAPACITATION_SCORE_VERSION = "1.0";

export const incapacitationScoreWeights = {
    // Status Effects
    StunnedDuration: 2, // Points per turn of stun duration
    Pinned: 2,          // Tactical state: Pinned
    Outmaneuvered: 1,   // Tactical state: Outmaneuvered
    Exposed: 1.5,       // Tactical state: Exposed (more severe than Outmaneuvered)
    OffBalance: 1,      // Tactical state: Off-Balance (was 'Repositioned (against)')

    // Mental States (fighter's own mental state contributing to their incapacitation)
    MentalState_Stressed: 0.5, // Reduced from 1, as it's common
    MentalState_Shaken: 1.5,   // Increased slightly
    MentalState_Broken: 3,

    // Health Thresholds
    HpBelow50: 1,
    HpBelow25: 2,

    // Momentum Disadvantage (fighter is at a momentum disadvantage)
    MomentumDisadvantage3: 1, // fighter.momentum is 3+ points lower than opponent.momentum
    MomentumDisadvantage5: 2, // fighter.momentum is 5+ points lower than opponent.momentum
};

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

const EDM_MULTIPLIERS = { // Escalation Damage Modifiers
    [ESCALATION_STATES.NORMAL]: 1.0,
    [ESCALATION_STATES.PRESSURED]: 1.1, // Slight increase when opponent is pressured
    [ESCALATION_STATES.SEVERELY_INCAPACITATED]: 1.3,
    [ESCALATION_STATES.TERMINAL_COLLAPSE]: 1.6
};

/**
 * Calculates the incapacitation score for a fighter.
 * @param {object} fighter - The fighter whose score is being calculated.
 * @param {object} opponent - The opposing fighter.
 * @returns {number} The total incapacitation score.
 */
export function calculateIncapacitationScore(fighter, opponent) {
    if (!fighter || !opponent) {
        console.error("EscalationEngine: Missing fighter or opponent for score calculation.");
        return 0;
    }

    let score = 0;

    // Status Effects on the fighter
    if (fighter.stunDuration && fighter.stunDuration > 0) {
        score += incapacitationScoreWeights.StunnedDuration * fighter.stunDuration;
    }
    if (fighter.tacticalState) {
        if (fighter.tacticalState.name === 'Pinned') score += incapacitationScoreWeights.Pinned;
        if (fighter.tacticalState.name === 'Outmaneuvered') score += incapacitationScoreWeights.Outmaneuvered;
        if (fighter.tacticalState.name === 'Exposed') score += incapacitationScoreWeights.Exposed;
        if (fighter.tacticalState.name === 'Off-Balance') score += incapacitationScoreWeights.OffBalance;
        // Add more tactical states as needed
    }

    // Mental State of the fighter
    if (fighter.mentalState) {
        switch (fighter.mentalState.level) {
            case 'stressed': score += incapacitationScoreWeights.MentalState_Stressed; break;
            case 'shaken': score += incapacitationScoreWeights.MentalState_Shaken; break;
            case 'broken': score += incapacitationScoreWeights.MentalState_Broken; break;
        }
    }

    // Health Thresholds of the fighter
    if (fighter.hp !== undefined && fighter.maxHp !== undefined) {
        if (fighter.hp < fighter.maxHp * 0.25) {
            score += incapacitationScoreWeights.HpBelow25;
        } else if (fighter.hp < fighter.maxHp * 0.50) {
            score += incapacitationScoreWeights.HpBelow50;
        }
    }

    // Momentum Disadvantage for the fighter
    if (fighter.momentum !== undefined && opponent.momentum !== undefined) {
        const momentumDelta = opponent.momentum - fighter.momentum;
        if (momentumDelta >= 5) {
            score += incapacitationScoreWeights.MomentumDisadvantage5;
        } else if (momentumDelta >= 3) {
            score += incapacitationScoreWeights.MomentumDisadvantage3;
        }
    }

    return Math.max(0, score); // Ensure score isn't negative
}

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

/**
 * Gets the AI weight multiplier for a move based on the current escalation situation.
 * This biases the AI towards certain actions when escalation mode is active for the opponent.
 * @param {object} attacker - The AI whose move is being chosen.
 * @param {object} defender - The opponent.
 * @param {object} move - The move being considered.
 * @returns {number} A multiplier for the move's weight.
 */
export function getEscalationAIWeights(attacker, defender, move) {
    if (!attacker || !defender || !move || !defender.escalationState || !attacker.personalityProfile) {
        return 1.0;
    }

    let multiplier = 1.0;
    const opponentState = defender.escalationState;

    // Default EMB logic based on opponent's vulnerability
    if (opponentState === ESCALATION_STATES.SEVERELY_INCAPACITATED || opponentState === ESCALATION_STATES.TERMINAL_COLLAPSE) {
        if (move.type === 'Finisher' || move.moveTags?.includes('requires_opening')) {
            multiplier *= 1.6; // From plan: Finishers +60%
        } else if (move.type === 'Offense' && (move.power || 0) >= 60) { // Assuming high-damage is >60 power
            multiplier *= 1.4; // From plan: High-damage attacks +40%
        } else if (move.type === 'Utility' && !move.moveTags?.includes('debuff_disable')) { // Deprioritize non-lethal utility
            multiplier *= 0.3; // From plan: Control moves deprioritized unless lethal setup
        }
    }

    // Character-specific EMB overrides
    // The attacker's escalationBehavior might react to the defender's state
    const attackerEscalationBehavior = attacker.escalationBehavior && attacker.escalationBehavior[opponentState];
    if (attackerEscalationBehavior) {
        if (attackerEscalationBehavior.signatureMoveBias && attackerEscalationBehavior.signatureMoveBias[move.name]) {
            multiplier *= attackerEscalationBehavior.signatureMoveBias[move.name];
        }
        if (move.type === 'Offense' && attackerEscalationBehavior.offensiveBias) {
            multiplier *= attackerEscalationBehavior.offensiveBias;
        }
        if (move.type === 'Finisher' && attackerEscalationBehavior.finisherBias) {
            multiplier *= attackerEscalationBehavior.finisherBias;
        }
        if (move.type === 'Utility' && attackerEscalationBehavior.utilityBias) {
            multiplier *= attackerEscalationBehavior.utilityBias;
        }
        // Add more specific biases as needed (e.g., for moveTags)
    }

    // If the attacker themselves is in a high escalation state (e.g., Terminal Collapse),
    // they might become more reckless or desperate, irrespective of opponent.
    // This is slightly different from the EMB which is primarily about exploiting opponent weakness.
    const actorOwnState = attacker.escalationState;
    if (actorOwnState === ESCALATION_STATES.TERMINAL_COLLAPSE) {
        if (move.moveTags?.includes('highRisk')) {
            multiplier *= 1.2; // Slight bias towards risky moves if attacker is collapsing
        }
    }


    return Math.max(0.1, multiplier); // Ensure it doesn't completely zero out a move unless intended
}