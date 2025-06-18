/**
 * @fileoverview AI Move Scoring System
 * @description Calculates move weights based on personality, strategic intent, and battle conditions.
 * Pure scoring logic without randomness or selection.
 * @version 1.0
 */

'use strict';

import { getAvailableMoves } from '../engine_move-resolution.js';
import { BATTLE_PHASES } from '../engine_battle-phase.js';
import { getEscalationAIWeights } from '../engine_escalation.js';
import { getDynamicPersonality } from './ai_personality.js';
import { STRATEGIC_INTENTS } from './ai_strategy_intent.js';

/**
 * Safe getter for nested object properties
 */
function safeGet(obj, path, defaultValue, actorName = 'Unknown Actor') {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    if (value === undefined || value === null) {
        return defaultValue;
    }
    return value;
}

/**
 * Intent-based multipliers for different move types and characteristics
 */
const INTENT_MULTIPLIERS = {
    [STRATEGIC_INTENTS.STANDARD_EXCHANGE]: { 
        Offense: 1.2, 
        Finisher: 0.8 
    },
    [STRATEGIC_INTENTS.OPENING_MOVES]: { 
        Utility: 1.3, 
        Finisher: 1.2, 
        aggressive: 1.2 
    },
    [STRATEGIC_INTENTS.CAUTIOUS_DEFENSE]: { 
        Offense: 0.5, 
        Defense: 1.8 
    },
    [STRATEGIC_INTENTS.PRESS_ADVANTAGE]: { 
        Offense: 1.5, 
        Finisher: 1.2 
    },
    [STRATEGIC_INTENTS.CAPITALIZE_ON_OPENING]: { 
        Offense: 1.8, 
        Finisher: 1.5 
    },
    [STRATEGIC_INTENTS.DESPERATE_GAMBIT]: { 
        Finisher: 2.0, 
        highRisk: 2.5 
    },
    [STRATEGIC_INTENTS.FINISHING_BLOW_ATTEMPT]: { 
        Finisher: 3.5, 
        requires_opening: 2.8 
    },
    [STRATEGIC_INTENTS.CONSERVE_ENERGY]: { 
        low_cost: 3.0 
    },
    [STRATEGIC_INTENTS.POKING_PHASE_TACTICS]: { 
        Utility: 2.0, 
        Defense: 1.5, 
        low_cost: 2.0, 
        mobility_move: 1.8, 
        evasive: 1.8 
    },
    [STRATEGIC_INTENTS.OVERWHELM_OFFENSE]: { 
        Offense: 2.0, 
        Finisher: 1.8, 
        aggressive: 1.5 
    },
    [STRATEGIC_INTENTS.RECKLESS_OFFENSE]: { 
        Offense: 1.5, 
        Finisher: 2.5, 
        highRisk: 3.0, 
        utility: 0.1 
    }
};

/**
 * Calculates base personality modifiers for a move
 */
function calculatePersonalityModifiers(move, profile, actor) {
    let weight = 1.0;
    let reasons = [];

    // Move type personality modifiers
    switch (move.type) {
        case 'Offense':
            weight *= (1 + profile.aggression);
            reasons.push(`Aggro:${profile.aggression.toFixed(2)}`);
            break;
        case 'Defense':
            weight *= (1 + profile.defensiveBias);
            reasons.push(`Def:${profile.defensiveBias.toFixed(2)}`);
            break;
        case 'Utility':
            weight *= (1 + profile.creativity);
            reasons.push(`Util:${profile.creativity.toFixed(2)}`);
            break;
        case 'Finisher':
            weight *= (1 + profile.riskTolerance);
            // Finisher timing logic is handled in calculateContextualModifiers
            break;
    }

    // Signature move bias
    const signatureBias = safeGet(profile.signatureMoveBias, move.name, 1.0, actor.name);
    if (signatureBias !== 1.0) {
        weight *= signatureBias;
        reasons.push(`SigMove`);
    }

    // Anti-repetition
    if (actor.lastMove?.name === move.name) {
        weight *= (1.0 - profile.antiRepeater);
        reasons.push(`AntiRepeat`);
    }

    return { weight, reasons };
}

/**
 * Calculates contextual modifiers based on battle state and opponent condition
 */
function calculateContextualModifiers(move, actor, defender, currentPhase) {
    let weight = 1.0;
    let reasons = [];

    // Finisher timing logic
    if (move.type === 'Finisher') {
        const defenderHp = safeGet(defender, 'hp', 100, defender.name);
        if (currentPhase === BATTLE_PHASES.LATE || defenderHp <= 30) {
            weight *= 2.5;
            weight = Math.max(weight, 10.0); // Finisher floor
            reasons.push('FinisherFocus');
        } else {
            weight *= 0.1; // Penalize finishers early
        }
    }

    // Azula's broken mental state effects
    if (actor.id === 'azula' && actor.mentalState?.level === 'broken') {
        // Prioritize high-risk, high-power moves
        if (move.moveTags?.includes('highRisk') || (move.power || 0) >= 70) {
            weight *= 2.0;
            reasons.push('AzulaBroken:HighRisk/Power');
        }
        
        // Boost collateral damage moves
        if (move.collateralImpact && move.collateralImpact !== 'none') {
            weight *= 1.5;
            reasons.push('AzulaBroken:CollateralBoost');
        }
        
        // Additional aggression surge
        const profile = getDynamicPersonality(actor, currentPhase);
        weight *= (1 + profile.aggression * 0.5);
        weight *= (1 - profile.defensiveBias * 0.5);
        reasons.push('AzulaBroken:AggressionSurge');
    }

    return { weight, reasons };
}

/**
 * Applies intent-based multipliers to move weight
 */
function applyIntentModifiers(move, intent) {
    let weight = 1.0;
    let reasons = [];

    const multipliers = INTENT_MULTIPLIERS[intent] || {};

    // Apply move type multiplier
    if (multipliers[move.type]) {
        weight *= multipliers[move.type];
        reasons.push(`Intent:${intent}`);
    }

    // Apply low cost multiplier
    if (multipliers.low_cost && (move.power || 50) < 30) {
        weight *= multipliers.low_cost;
    }

    // Apply move tag multipliers
    if (move.moveTags) {
        move.moveTags.forEach(tag => {
            if (multipliers[tag]) {
                weight *= multipliers[tag];
            }
        });
    }

    return { weight, reasons };
}

/**
 * Calculates weight for a single move based on all factors
 */
function calculateSingleMoveWeight(move, actor, defender, intent, currentPhase) {
    if (!move || !move.name) {
        return { 
            move: { name: "Struggle" }, 
            weight: 0.001, 
            reasons: ["InvalidMove"] 
        };
    }

    let totalWeight = 1.0;
    let allReasons = [];

    const profile = getDynamicPersonality(actor, currentPhase);

    // 1. Base personality modifiers
    const personalityResult = calculatePersonalityModifiers(move, profile, actor);
    totalWeight *= personalityResult.weight;
    allReasons.push(...personalityResult.reasons);

    // 2. Contextual modifiers (timing, special conditions)
    const contextResult = calculateContextualModifiers(move, actor, defender, currentPhase);
    totalWeight *= contextResult.weight;
    allReasons.push(...contextResult.reasons);

    // 3. Intent modifiers
    const intentResult = applyIntentModifiers(move, intent);
    totalWeight *= intentResult.weight;
    allReasons.push(...intentResult.reasons);

    // 4. Escalation modifiers
    const escalationInfo = getEscalationAIWeights(actor, defender, move);
    if (escalationInfo.finalMultiplier !== 1.0) {
        totalWeight *= escalationInfo.finalMultiplier;
        allReasons.push(...escalationInfo.scoreBasedReasonsApplied);
    }

    return { 
        move, 
        weight: totalWeight, 
        reasons: allReasons 
    };
}

/**
 * Calculates weights for all available moves
 * Returns array of move objects with weights and reasoning
 */
export function calculateMoveWeights(actor, defender, conditions, intent, currentPhase) {
    const availableMoves = getAvailableMoves(actor, conditions, currentPhase);
    
    return availableMoves.map(move => 
        calculateSingleMoveWeight(move, actor, defender, intent, currentPhase)
    );
}

/**
 * Filters moves to only include those with positive weights
 */
export function getViableMoves(weightedMoves) {
    return weightedMoves.filter(moveInfo => 
        moveInfo.weight > 0 && 
        moveInfo.move && 
        moveInfo.move.name !== "Struggle"
    );
}

/**
 * Gets the highest weighted move (for deterministic selection)
 */
export function getTopMove(weightedMoves) {
    if (!weightedMoves || weightedMoves.length === 0) {
        return null;
    }

    return weightedMoves.reduce((best, current) => 
        current.weight > best.weight ? current : best
    );
}

/**
 * Gets move weights summary for debugging
 */
export function getMoveWeightsSummary(weightedMoves) {
    return weightedMoves
        .filter(m => m.weight > 0)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5) // Top 5 moves
        .map(m => ({
            name: m.move.name,
            weight: m.weight.toFixed(3),
            reasons: m.reasons.join(', ')
        }));
} 