// FILE: js/engine_escalation.js
'use strict';

// ====================================================================================
//  Escalation Engine (v1.2 - EMB Score-Based AI Weighting)
// ====================================================================================
//  - Added logic to getEscalationAIWeights to apply additional biases if
//    defender's incapacitationScore >= INCAPACITATION_SCORE_ESCALATION_THRESHOLD
//    and defender is at least 'Pressured'.
//  - getEscalationAIWeights now returns an object: { finalMultiplier, scoreBasedReasonsApplied }
// ====================================================================================

export const INCAPACITATION_SCORE_VERSION = "1.1"; // Matches previous version, no change to score calc itself

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
    [ESCALATION_STATES.PRESSURED]: 1.15, // Increased from 1.1
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

    if (fighter.stunDuration && fighter.stunDuration > 0) {
        score += incapacitationScoreWeights.StunnedDuration * fighter.stunDuration;
    }
    if (fighter.tacticalState) {
        if (fighter.tacticalState.name === 'Pinned') score += incapacitationScoreWeights.Pinned;
        if (fighter.tacticalState.name === 'Outmaneuvered') score += incapacitationScoreWeights.Outmaneuvered;
        if (fighter.tacticalState.name === 'Exposed') score += incapacitationScoreWeights.Exposed;
        if (fighter.tacticalState.name === 'Off-Balance') score += incapacitationScoreWeights.OffBalance;
    }

    if (fighter.mentalState) {
        switch (fighter.mentalState.level) {
            case 'stressed': score += incapacitationScoreWeights.MentalState_Stressed; break;
            case 'shaken': score += incapacitationScoreWeights.MentalState_Shaken; break;
            case 'broken': score += incapacitationScoreWeights.MentalState_Broken; break;
        }
    }

    if (fighter.hp !== undefined && fighter.maxHp !== undefined) {
        if (fighter.hp < fighter.maxHp * 0.25) {
            score += incapacitationScoreWeights.HpBelow25;
        } else if (fighter.hp < fighter.maxHp * 0.50) {
            score += incapacitationScoreWeights.HpBelow50;
        }
    }

    if (fighter.momentum !== undefined && opponent.momentum !== undefined) {
        const momentumDelta = opponent.momentum - fighter.momentum;
        if (momentumDelta >= 5) {
            score += incapacitationScoreWeights.MomentumDisadvantage5;
        } else if (momentumDelta >= 3) {
            score += incapacitationScoreWeights.MomentumDisadvantage3;
        }
    }

    return Math.max(0, score);
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
 * @returns {object} An object { finalMultiplier: number, scoreBasedReasonsApplied: string[] }
 */
export function getEscalationAIWeights(attacker, defender, move) {
    if (!attacker || !defender || !move || !defender.escalationState || !attacker.personalityProfile) {
        return { finalMultiplier: 1.0, scoreBasedReasonsApplied: [] };
    }

    let multiplier = 1.0;
    const opponentState = defender.escalationState;
    let scoreBasedReasonsApplied = [];

    // --- NEW: Score-based Escalation Biasing ---
    const INCAPACITATION_SCORE_ESCALATION_THRESHOLD = 5;
    const LOW_IMPACT_POWER_THRESHOLD = 30; // Threshold for deprioritizing weak moves

    if (defender.incapacitationScore !== undefined &&
        defender.incapacitationScore >= INCAPACITATION_SCORE_ESCALATION_THRESHOLD &&
        (opponentState === ESCALATION_STATES.PRESSURED ||
         opponentState === ESCALATION_STATES.SEVERELY_INCAPACITATED ||
         opponentState === ESCALATION_STATES.TERMINAL_COLLAPSE)) {

        let scoreBasedAdjustmentFactor = 1.0;

        // 1. Signature Move Boost
        if (attacker.personalityProfile.signatureMoveBias && attacker.personalityProfile.signatureMoveBias[move.name]) {
            // This doesn't multiply the existing bias, but adds a new multiplier if it's a signature move.
            // The original signatureMoveBias is applied in calculateMoveWeights. This is an *additional* situational boost.
            scoreBasedAdjustmentFactor *= 1.5; // e.g., 50% boost for signature moves when opponent is highly incapacitated
            scoreBasedReasonsApplied.push(`ScoreEscalationBias:SigMove(x1.5)`);
        }

        // 2. Finisher Boost
        if (move.type === 'Finisher' || (move.moveTags && move.moveTags.includes('requires_opening'))) {
            scoreBasedAdjustmentFactor *= 2.5; // e.g., 150% boost for finishers
             scoreBasedReasonsApplied.push(`ScoreEscalationBias:Finisher(x2.5)`);
        }

        // 3. Low-Impact Deprioritization
        if ((move.power || 0) < LOW_IMPACT_POWER_THRESHOLD &&
            (move.type === 'Offense' ||
             (move.type === 'Utility' && (!move.moveTags || (!move.moveTags.includes('debuff_disable') && !move.moveTags.includes('setup'))))
            )
           ) {
            scoreBasedAdjustmentFactor *= 0.4; // Reduce weight to 40%
            scoreBasedReasonsApplied.push(`ScoreEscalationBias:LowImpactDeprio(x0.4)`);
        }
        multiplier *= scoreBasedAdjustmentFactor;
    }
    // --- END NEW Score-based Biasing ---


    // Default EMB logic based on opponent's broad escalation state
    if (opponentState === ESCALATION_STATES.SEVERELY_INCAPACITATED || opponentState === ESCALATION_STATES.TERMINAL_COLLAPSE) {
        if (move.type === 'Finisher' || (move.moveTags && move.moveTags.includes('requires_opening'))) {
            multiplier *= 2.0;
        } else if (move.type === 'Offense' && (move.power || 0) >= 60) {
            multiplier *= 1.6;
        } else if (move.type === 'Utility' && (!move.moveTags || !move.moveTags.includes('debuff_disable')) && !move.isRepositionMove) {
            multiplier *= 0.2;
        }
    }

    // Character-specific EMB overrides
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
    }

    const actorOwnState = attacker.escalationState;
    if (actorOwnState === ESCALATION_STATES.TERMINAL_COLLAPSE) {
        if (move.moveTags && move.moveTags.includes('highRisk')) {
            multiplier *= 1.2;
        }
    }

    return { finalMultiplier: Math.max(0.01, multiplier), scoreBasedReasonsApplied };
}