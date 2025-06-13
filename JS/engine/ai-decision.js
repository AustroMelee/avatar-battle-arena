// FILE: engine/ai-decision.js
'use strict';

// This is the "AI Brain" module. It is solely responsible for a character's
// decision-making process. It evaluates the situation, applies personality
// and behavioral traits, and selects an appropriate move.
// VERSION 6: Corrected sequence learning logic and refined prediction confidence.

import { getAvailableMoves } from './move-resolution.js';
import { moveInteractionMatrix } from '../move-interaction-matrix.js';

// --- HELPER FUNCTIONS ---
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

/**
 * Updates the AI's memory based on the outcome of the last turn.
 * @param {object} learner - The AI fighter who is updating its memory.
 * @param {object} opponent - The opponent fighter.
 * @param {object} learnerLastMove - The move the LEARNER just used (for self-reflection).
 * @param {object} resultOfLearnerMove - The result of that move.
 */
export function updateAiMemory(learner, opponent, learnerLastMove, resultOfLearnerMove) {
    // 1. Update own move effectiveness (self-reflection)
    if (learnerLastMove) {
        if (!learner.aiMemory.selfMoveEffectiveness[learnerLastMove.name]) {
            learner.aiMemory.selfMoveEffectiveness[learnerLastMove.name] = { totalEffectiveness: 0, uses: 0 };
        }
        const effectivenessValue = { 'Weak': -1, 'Normal': 1, 'Strong': 2, 'Critical': 3 }[resultOfLearnerMove.effectiveness.label] || 0;
        learner.aiMemory.selfMoveEffectiveness[learnerLastMove.name].totalEffectiveness += effectivenessValue;
        learner.aiMemory.selfMoveEffectiveness[learnerLastMove.name].uses++;

        if (resultOfLearnerMove.effectiveness.label === 'Weak') {
            learner.aiMemory.moveSuccessCooldown[learnerLastMove.name] = 2; // Avoid for 2 turns
        }
    }

    // 2. Log opponent's move sequence (learning about the opponent)
    // We need at least two moves from the opponent to form a sequence.
    if (opponent.moveHistory.length >= 2) {
        const opponentPrevMoveName = opponent.moveHistory[opponent.moveHistory.length - 2].name;
        const opponentCurrMoveName = opponent.moveHistory[opponent.moveHistory.length - 1].name;

        if (!learner.aiMemory.opponentSequenceLog[opponentPrevMoveName]) {
            learner.aiMemory.opponentSequenceLog[opponentPrevMoveName] = {};
        }
        if (!learner.aiMemory.opponentSequenceLog[opponentPrevMoveName][opponentCurrMoveName]) {
            learner.aiMemory.opponentSequenceLog[opponentPrevMoveName][opponentCurrMoveName] = 0;
        }
        learner.aiMemory.opponentSequenceLog[opponentPrevMoveName][opponentCurrMoveName]++;
    }

    // 3. Update general opponent model based on their most recent move
    const opponentCurrMove = opponent.lastMove;
    if (opponentCurrMove) {
        if (opponentCurrMove.type === 'Offense' || opponentCurrMove.type === 'Finisher') {
            learner.aiMemory.opponentModel.isAggressive++;
        } else if (opponentCurrMove.type === 'Defense') {
            learner.aiMemory.opponentModel.isDefensive++;
        }
    }
    learner.aiMemory.opponentModel.isTurtling = opponent.consecutiveDefensiveTurns >= 2;
}


/**
 * Predicts the opponent's next move based on learned sequences.
 * @returns {object} An object like { predictedMove: string, confidence: number }
 */
function predictOpponentNextMove(actor, defender) {
    const opponentLastMove = defender.lastMove;
    if (!opponentLastMove) {
        return { predictedMove: null, confidence: 0, reason: "No previous move to analyze." };
    }

    const sequence = actor.aiMemory.opponentSequenceLog[opponentLastMove.name];
    if (!sequence) {
        return { predictedMove: null, confidence: 0, reason: `No observed sequence after ${opponentLastMove.name}.` };
    }

    let totalObservations = 0;
    let mostLikelyMove = null;
    let maxCount = 0;

    for (const moveName in sequence) {
        const count = sequence[moveName];
        totalObservations += count;
        if (count > maxCount) {
            maxCount = count;
            mostLikelyMove = moveName;
        }
    }

    // A pattern needs to be seen at least once to be considered.
    if (!mostLikelyMove) {
        return { predictedMove: null, confidence: 0, reason: "No next-move data." };
    }

    const confidence = maxCount / totalObservations;
    
    // The prediction is only returned if it's somewhat reliable.
    if (confidence < 0.4 || totalObservations < 2) {
         return { predictedMove: mostLikelyMove, confidence: confidence, reason: `Low confidence (${(confidence*100).toFixed(0)}% from ${totalObservations} samples).` };
    }
    
    return { predictedMove: mostLikelyMove, confidence: confidence, reason: `High confidence (${(confidence*100).toFixed(0)}% from ${totalObservations} samples).` };
}

// --- The rest of the functions (getDynamicPersonality, getDynamicBehavior, etc.) have NO CHANGES ---
function getDynamicPersonality(actor) {
    let profile = { ...actor.personalityProfile };
    if (actor.relationalState) {
        const modifiers = actor.relationalState.emotionalModifiers || {};
        profile.aggression = clamp(profile.aggression + (modifiers.aggressionBoost || 0) - (modifiers.aggressionReduction || 0), 0, 1.2);
        profile.patience = clamp(profile.patience + (modifiers.patienceBoost || 0) - (modifiers.patienceReduction || 0), 0, 1.2);
        profile.riskTolerance = clamp(profile.riskTolerance + (modifiers.riskToleranceBoost || 0) - (modifiers.riskToleranceReduction || 0), 0, 1.2);
    }
    switch (actor.mentalState.level) {
        case 'stressed': profile.patience *= 0.7; profile.riskTolerance = clamp(profile.riskTolerance + 0.15, 0, 1.1); break;
        case 'shaken': profile.patience *= 0.4; profile.opportunism *= 0.6; profile.aggression = clamp(profile.aggression + 0.2, 0, 1.2); profile.riskTolerance = clamp(profile.riskTolerance + 0.3, 0, 1.2); break;
        case 'broken': profile.patience = 0.05; profile.opportunism = 0.1; profile.aggression = clamp(profile.aggression + 0.4, 0, 1.3); profile.riskTolerance = clamp(profile.riskTolerance + 0.5, 0, 1.5); break;
    }
    return profile;
}

function getDynamicBehavior(actor, defender) {
    let behavior = { ...actor.behaviorProfile };
    const healthDifference = actor.hp - defender.hp;
    if (healthDifference > 25) {
        behavior.predictability *= 0.8;
        behavior.creativity = clamp(behavior.creativity + 0.2, 0, 1.0);
        behavior.focus *= 0.9;
    } else if (healthDifference < -25) {
        behavior.predictability = clamp(behavior.predictability + 0.2, 0, 1.0);
        behavior.creativity *= 0.7;
        behavior.focus = clamp(behavior.focus + 0.2, 0, 1.0);
    }
    if (actor.lastMoveEffectiveness === 'Critical') {
        behavior.focus = clamp(behavior.focus + 0.15, 0, 1.0);
    } else if (actor.lastMoveEffectiveness === 'Weak' && defender.lastMoveEffectiveness === 'Critical') {
        behavior.predictability = clamp(behavior.predictability + 0.3, 0, 1.0);
    }
    return behavior;
}

function determineStrategicIntent(actor, defender, turn) {
    const healthDifference = actor.hp - defender.hp;
    if (actor.mentalState.level === 'broken') return 'UnfocusedRage';
    if (actor.mentalState.level === 'shaken') return 'PanickedDefense';
    if (defender.isStunned || defender.tacticalState) return 'CapitalizeOnOpening';
    if (healthDifference > 30 && actor.momentum >= 2) return 'PressAdvantage';
    if (healthDifference < -30 || actor.hp < 35) return 'DesperateGambit';
    if (turn < 2) return 'OpeningMoves';
    if (actor.aiMemory.opponentModel.isTurtling) return 'BreakTheTurtle';
    if (actor.energy < 30) return 'ConserveEnergy';
    return 'StandardExchange';
}

function getSoftmaxProbabilities(weightedMoves, temperature = 1.0) {
    if (!weightedMoves.length) return [];
    const temp = Math.max(0.01, temperature);
    const maxWeight = Math.max(...weightedMoves.map(m => m.weight));
    let weightExpSum = 0;
    const movesWithExp = weightedMoves.map(m => {
        const expWeight = Math.exp((m.weight - maxWeight) / temp);
        weightExpSum += expWeight;
        return { ...m, expWeight };
    });
    return movesWithExp.map(m => ({ ...m, probability: m.expWeight / weightExpSum }));
}

function selectFromDistribution(movesWithProbs) {
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const moveInfo of movesWithProbs) {
        cumulativeProbability += moveInfo.probability;
        if (rand < cumulativeProbability) {
            return moveInfo;
        }
    }
    return movesWithProbs[movesWithProbs.length - 1];
}


function calculateMoveWeights(actor, defender, conditions, intent, prediction) {
    const availableMoves = getAvailableMoves(actor, conditions);
    const profile = getDynamicPersonality(actor);
    const behavior = getDynamicBehavior(actor, defender);
    
    return availableMoves.map(move => {
        let weight = 1.0;
        const energyCost = Math.round((move.power || 0) * 0.22) + 4;
        if (actor.energy < energyCost) return { move, weight: 0 };
        
        switch (move.type) {
            case 'Offense': weight *= 1.2 * profile.aggression; break;
            case 'Defense': weight *= 1.1 * (1 - profile.aggression); break;
            case 'Utility': weight *= 1.0 * profile.patience; break;
            case 'Finisher': weight *= 1.5 * profile.riskTolerance; break;
        }

        const intentMultipliers = {
            'PressAdvantage': { Offense: 2.0, Finisher: 1.5, Defense: 0.5 },
            'CapitalizeOnOpening': { Offense: 1.8, Finisher: 2.5, Utility: 1.5, Defense: 0.2 },
            'DesperateGambit': { Offense: 1.5, Finisher: 2.0, riskTolerance: 1.5 },
            'CautiousDefense': { Defense: 2.0, Utility: 1.5, Offense: 0.5, Finisher: 0.1 },
            'BreakTheTurtle': { 'bypasses_defense': 5.0, 'unblockable_ground': 5.0, 'utility_control': 2.0, Defense: 0.1 },
            'ConserveEnergy': { 'low_cost': 3.0 },
            'UnfocusedRage': { Offense: 2.5, Defense: 0.1, Utility: 0.1 },
            'PanickedDefense': { Defense: 3.0, 'evasive': 2.0, Offense: 0.3, Finisher: 0.05 },
        };
        const multipliers = intentMultipliers[intent] || {};
        weight *= (multipliers[move.type] || 1.0);
        if (multipliers['low_cost'] && energyCost < 20) weight *= multipliers['low_cost'];
        move.moveTags.forEach(tag => { if (multipliers[tag]) weight *= multipliers[tag]; });

        // --- PREDICTIVE COUNTER-PLAY (Threshold Lowered to 0.4 for more activity) ---
        if (prediction.confidence > 0.4 && prediction.predictedMove) {
            const counters = moveInteractionMatrix[move.name]?.counters;
            if (counters && counters[prediction.predictedMove]) {
                const counterBonus = counters[prediction.predictedMove];
                // Apply a significant, confidence-scaled bonus for counter-picking
                weight *= (1 + (counterBonus * prediction.confidence * 3.0));
            }
        }

        if (actor.aiMemory.moveSuccessCooldown[move.name]) {
            weight *= 0.01;
        }
        const moveEffectiveness = actor.aiMemory.selfMoveEffectiveness[move.name];
        if (moveEffectiveness && moveEffectiveness.uses > 0) {
            const avgEffectiveness = moveEffectiveness.totalEffectiveness / moveEffectiveness.uses;
            if (avgEffectiveness > 1) weight *= 1.5;
            if (avgEffectiveness < 0) weight *= 0.5;
        }

        if (actor.moveHistory.slice(-1)[0]?.name === move.name) {
            weight *= (1.0 - behavior.creativity);
        }

        if (move.moveTags.includes('requires_opening')) {
            weight *= (defender.isStunned || defender.tacticalState) ? (20.0 * (1 + profile.opportunism)) : 0.01;
        }

        return { move, weight };
    });
}

export function selectMove(actor, defender, conditions, turn) {
    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    
    const intent = determineStrategicIntent(actor, defender, turn);
    const prediction = predictOpponentNextMove(actor, defender);
    
    let weightedMoves = calculateMoveWeights(actor, defender, conditions, intent, prediction);
    let validMoves = weightedMoves.filter(m => m.weight > 0);

    if (validMoves.length === 0) {
        validMoves.push({move: struggleMove, weight: 1.0});
    }

    const temperature = (1.0 - (actor.behaviorProfile.predictability || 0.8)) * 1.5 + 0.5;
    const movesWithProbs = getSoftmaxProbabilities(validMoves, temperature);
    const chosenMoveInfo = selectFromDistribution(movesWithProbs);
    const chosenMove = chosenMoveInfo.move;
    
    const aiLogEntry = {
        chosenMove: chosenMove.name,
        intent: intent,
        prediction: prediction,
        weight: chosenMoveInfo.weight.toFixed(2),
        probability: `${(chosenMoveInfo.probability * 100).toFixed(1)}%`,
        reasoning: {
            actorHP: actor.hp,
            defenderHP: defender.hp,
            actorMomentum: actor.momentum,
            actorMentalState: actor.mentalState.level,
            opponentTacticalState: defender.tacticalState?.name || "None",
            opponentIsTurtling: actor.aiMemory.opponentModel.isTurtling
        }
    };
    
    return { move: chosenMove, aiLogEntry };
}