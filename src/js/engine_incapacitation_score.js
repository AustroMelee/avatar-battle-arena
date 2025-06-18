/**
 * @fileoverview Incapacitation Score Calculation
 * @description Pure calculation functions for character incapacitation scoring
 * @version 1.0
 */

"use strict";

export const INCAPACITATION_SCORE_VERSION = "1.1";

export const incapacitationScoreWeights = {
    // Status Effects
    StunnedDuration: 2, // Points per turn of stun duration
    Pinned: 2,          // Tactical state: Pinned
    Outmaneuvered: 1,   // Tactical state: Outmaneuvered
    Exposed: 2.0,       // Tactical state: Exposed (Increased from 1.5)
    OffBalance: 1,      // Tactical state: Off-Balance (was 'Repositioned (against)')

    // Mental States (fighter's own mental state contributing to their incapacitation)
    MentalState_Stressed: 0.5,
    MentalState_Shaken: 2.0,   // Increased from 1.5
    MentalState_Broken: 3,

    // Health Thresholds
    HpBelow50: 1,
    HpBelow25: 2,

    // Momentum Disadvantage (fighter is at a momentum disadvantage)
    MomentumDisadvantage3: 1, // fighter.momentum is 3+ points lower than opponent.momentum
    MomentumDisadvantage5: 2, // fighter.momentum is 5+ points lower than opponent.momentum
};

/**
 * Calculates the incapacitation score for a fighter.
 * @param {object} fighter - The fighter whose score is being calculated.
 * @param {object} opponent - The opposing fighter.
 * @returns {number} The total incapacitation score.
 */
export function calculateIncapacitationScore(fighter, opponent) {
    if (!fighter || !opponent) {
        console.error("IncapacitationScore: Missing fighter or opponent for score calculation.");
        return 0;
    }

    let score = 0;

    if (fighter.stunDuration && fighter.stunDuration > 0) {
        score += incapacitationScoreWeights.StunnedDuration * fighter.stunDuration;
    }
    if (fighter.tacticalState) {
        if (fighter.tacticalState.name === "Pinned") score += incapacitationScoreWeights.Pinned;
        if (fighter.tacticalState.name === "Outmaneuvered") score += incapacitationScoreWeights.Outmaneuvered;
        if (fighter.tacticalState.name === "Exposed") score += incapacitationScoreWeights.Exposed;
        if (fighter.tacticalState.name === "Off-Balance") score += incapacitationScoreWeights.OffBalance;
    }

    if (fighter.mentalState) {
        switch (fighter.mentalState.level) {
            case "stressed": score += incapacitationScoreWeights.MentalState_Stressed; break;
            case "shaken": score += incapacitationScoreWeights.MentalState_Shaken; break;
            case "broken": score += incapacitationScoreWeights.MentalState_Broken; break;
        }
    }

    if (fighter.hp !== undefined && fighter.maxHp !== undefined) {
        if (fighter.hp < fighter.maxHp * 0.25) {
            score += incapacitationScoreWeights.HpBelow25;
        } else if (fighter.hp < fighter.maxHp * 0.50) {
            score += incapacitationScoreWeights.HpBelow50;
        }
    }

    // Ensure momentum values are numbers before comparison
    const fighterMomentum = typeof fighter.momentum === "number" && !isNaN(fighter.momentum) ? fighter.momentum : 0;
    const opponentMomentum = typeof opponent.momentum === "number" && !isNaN(opponent.momentum) ? opponent.momentum : 0;

    const momentumDelta = opponentMomentum - fighterMomentum;
    if (momentumDelta >= 5) {
        score += incapacitationScoreWeights.MomentumDisadvantage5;
    } else if (momentumDelta >= 3) {
        score += incapacitationScoreWeights.MomentumDisadvantage3;
    }

    return Math.max(0, score);
} 