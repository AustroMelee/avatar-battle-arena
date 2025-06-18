/**
 * @fileoverview Escalation AI Weight Calculation
 * @description AI decision weight modifications based on escalation state
 * @version 1.0
 */

'use strict';

import { ESCALATION_STATES } from './engine_escalation_states.js';

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

    // --- Score-based Escalation Biasing ---
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

    // Default EMB logic based on opponent's broad escalation state
    if (opponentState === ESCALATION_STATES.SEVERELY_INCAPACITATED || opponentState === ESCALATION_STATES.TERMINAL_COLLAPSE) {
        // Boost finisher moves
        if (move.type === 'Finisher') {
            multiplier *= 1.8;
            scoreBasedReasonsApplied.push('EscalationFinisherBoost(x1.8)');
        }
        
        // Deprioritize low-damage moves
        if (move.power && move.power < 40) {
            multiplier *= 0.6;
            scoreBasedReasonsApplied.push('EscalationLowDamageDeprio(x0.6)');
        }
        
        // Boost signature moves
        if (attacker.personalityProfile.signatureMoveBias && attacker.personalityProfile.signatureMoveBias[move.name]) {
            multiplier *= 1.4;
            scoreBasedReasonsApplied.push('EscalationSignatureBoost(x1.4)');
        }
    }

    return { finalMultiplier: multiplier, scoreBasedReasonsApplied };
} 