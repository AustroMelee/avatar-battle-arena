// FILE: js/engine_ai-decision.js
// FILE: engine_ai-decision.js
'use strict';

// This is the "AI Brain" module.
// VERSION 8: Battle Phase Integration.

import { getAvailableMoves } from './engine_move-resolution.js';
import { moveInteractionMatrix } from './move-interaction-matrix.js';
import { MAX_MOMENTUM, MIN_MOMENTUM } from './engine_momentum.js';
import { getPhaseAIModifiers } from './engine_battle-phase.js'; // NEW: Import phase modifiers

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export function adaptPersonality(actor) {
    if (actor.moveHistory.length < 2) return;
    const lastTwoMoves = actor.moveHistory.slice(-2);
    const lastTwoResults = lastTwoMoves.map(move => move.effectiveness || 'Normal');
    if (lastTwoResults.every(r => r === 'Weak')) {
        actor.personalityProfile.creativity = clamp(actor.personalityProfile.creativity + 0.15, 0, 1.0);
        actor.personalityProfile.riskTolerance = clamp(actor.personalityProfile.riskTolerance + 0.1, 0, 1.0);
        actor.aiLog.push("[Personality Drift: Increased Creativity due to failure streak]");
    } else if (lastTwoResults.every(r => r === 'Strong' || r === 'Critical')) {
        actor.personalityProfile.aggression = clamp(actor.personalityProfile.aggression + 0.1, 0, 1.0);
        actor.aiLog.push("[Personality Drift: Increased Aggression due to success streak]");
    }
}

export function attemptManipulation(manipulator, target) {
    const manipTrait = manipulator.specialTraits?.manipulative;
    if (!manipTrait) return { success: false };
    const mentalStateModifier = { 'stable': 0.5, 'stressed': 1.0, 'shaken': 1.5, 'broken': 0.2 }[target.mentalState.level];
    const resilience = target.specialTraits?.resilientToManipulation || 0;
    const attemptChance = manipTrait * mentalStateModifier * (1 - resilience);
    if (Math.random() < attemptChance) {
        const effect = Math.random() > 0.5 ? 'Exposed' : 'Shaken';
        const manipulatorSpan = `<span class="char-${manipulator.id}">${manipulator.name}</span>`;
        const targetSpan = `<span class="char-${target.id}">${target.name}</span>`;
        const narration = `<p class="narrative-manipulation">${manipulatorSpan} unleashes a sharp taunt, preying on ${targetSpan}'s insecurities. It hits home, leaving ${target.pronouns.o} ${effect}!</p>`;
        return { success: true, effect, narration };
    }
    return { success: false };
}

export function updateAiMemory(learner, opponent) {
    if (learner.lastMove) {
        if (!learner.aiMemory.selfMoveEffectiveness[learner.lastMove.name]) {
            learner.aiMemory.selfMoveEffectiveness[learner.lastMove.name] = { totalEffectiveness: 0, uses: 0 };
        }
        const effectivenessValue = { 'Weak': -1, 'Normal': 1, 'Strong': 2, 'Critical': 3 }[learner.lastMoveEffectiveness] || 0;
        learner.aiMemory.selfMoveEffectiveness[learner.lastMove.name].totalEffectiveness += effectivenessValue;
        learner.aiMemory.selfMoveEffectiveness[learner.lastMove.name].uses++;
        if (learner.lastMoveEffectiveness === 'Weak') learner.aiMemory.moveSuccessCooldown[learner.lastMove.name] = 2;

        if (learner.lastMove.isRepositionMove) {
            learner.aiMemory.repositionCooldown = 2;
        }
    }
    if (learner.aiMemory.repositionCooldown > 0) {
        learner.aiMemory.repositionCooldown--;
    }

    if (opponent.moveHistory.length >= 2) {
        const prev = opponent.moveHistory[opponent.moveHistory.length - 2].name;
        const curr = opponent.lastMove.name;
        if (!learner.aiMemory.opponentSequenceLog[prev]) learner.aiMemory.opponentSequenceLog[prev] = {};
        if (!learner.aiMemory.opponentSequenceLog[prev][curr]) learner.aiMemory.opponentSequenceLog[prev][curr] = 0;
        learner.aiMemory.opponentSequenceLog[prev][curr]++;
    }
    if (opponent.lastMove) {
        const moveType = opponent.lastMove.type;
        if (moveType === 'Offense' || moveType === 'Finisher') learner.aiMemory.opponentModel.isAggressive++;
        else if (moveType === 'Defense') learner.aiMemory.opponentModel.isDefensive++;
    }
    learner.aiMemory.opponentModel.isTurtling = opponent.consecutiveDefensiveTurns >= 2;
}

function predictOpponentNextMove(actor, defender) {
    const opponentLastMove = defender.lastMove;
    if (!opponentLastMove) return { predictedMove: null, confidence: 0 };
    const sequence = actor.aiMemory.opponentSequenceLog[opponentLastMove.name];
    if (!sequence) return { predictedMove: null, confidence: 0 };
    let totalObservations = 0, mostLikelyMove = null, maxCount = 0;
    for (const moveName in sequence) {
        const count = sequence[moveName];
        totalObservations += count;
        if (count > maxCount) { maxCount = count; mostLikelyMove = moveName; }
    }
    if (!mostLikelyMove || totalObservations < 2) return { predictedMove: null, confidence: 0 };
    return { predictedMove: mostLikelyMove, confidence: maxCount / totalObservations };
}

// MODIFIED: Accepts currentPhase to apply AI modifiers
function getDynamicPersonality(actor, currentPhase) {
    let baseProfile = { ...actor.personalityProfile };
    const phaseMods = getPhaseAIModifiers(currentPhase);

    // Apply phase modifiers
    Object.keys(phaseMods).forEach(key => {
        const traitName = key.replace('Multiplier', ''); // e.g., aggressionMultiplier -> aggression
        if (baseProfile[traitName] !== undefined) {
            baseProfile[traitName] = clamp(baseProfile[traitName] * phaseMods[key], 0, 1.5); // Apply phase mod, ensure bounds
        }
    });
    
    actor.aiLog.push(`[Phase Influence (${currentPhase})]: Base Aggro: ${actor.personalityProfile.aggression.toFixed(2)}, Phase Modded Aggro: ${baseProfile.aggression.toFixed(2)}`);


    if (actor.relationalState?.emotionalModifiers) {
        Object.keys(actor.relationalState.emotionalModifiers).forEach(key => {
            if (key.includes('Boost')) {
                const trait = key.replace('Boost', '');
                baseProfile[trait] = clamp((baseProfile[trait] || 0) + actor.relationalState.emotionalModifiers[key], 0, 1.5);
            } else if (key.includes('Reduction')) {
                const trait = key.replace('Reduction', '');
                baseProfile[trait] = clamp((baseProfile[trait] || 0) - actor.relationalState.emotionalModifiers[key], 0, 1.5);
            }
        });
    }
    switch (actor.mentalState.level) {
        case 'stressed': baseProfile.patience *= 0.7; baseProfile.riskTolerance = clamp(baseProfile.riskTolerance + 0.15, 0, 1.2); break;
        case 'shaken': baseProfile.patience *= 0.4; baseProfile.opportunism *= 0.6; baseProfile.aggression = clamp(baseProfile.aggression + 0.2, 0, 1.2); baseProfile.riskTolerance = clamp(baseProfile.riskTolerance + 0.3, 0, 1.2); break;
        case 'broken': baseProfile.patience = 0.05; baseProfile.opportunism = 0.1; baseProfile.aggression = clamp(baseProfile.aggression + 0.4, 0, 1.3); baseProfile.riskTolerance = clamp(baseProfile.riskTolerance + 0.5, 0, 1.5); break;
    }
    return baseProfile;
}

// MODIFIED: Accepts currentPhase for dynamic personality
function determineStrategicIntent(actor, defender, turn, currentPhase) {
    const profile = getDynamicPersonality(actor, currentPhase); // Pass currentPhase
    const healthDiff = actor.hp - defender.hp;

    // Phase-specific intent overrides or strong suggestions
    if (currentPhase === 'Early' && profile.patience > 0.7 && turn < 2) return 'OpeningMoves';
    if (currentPhase === 'Late' && actor.hp < 30 && profile.riskTolerance > 0.7) return 'DesperateGambit';
    if (currentPhase === 'Late' && defender.hp < 25 && profile.opportunism > 0.8) return 'FinishingBlowAttempt'; // New intent for late game

    if (profile.opportunism > 0.8 && (defender.isStunned || defender.tacticalState)) return 'CapitalizeOnOpening';
    if (profile.riskTolerance > 0.8 && actor.hp < 40) return 'DesperateGambit';
    if (profile.patience > 0.8 && turn < 2 && currentPhase !== 'Late') return 'CautiousDefense'; // Avoid cautious late game
    if (profile.aggression > 0.9 && healthDiff > 20) return 'PressAdvantage';
    if (actor.mentalState.level === 'broken') return 'UnfocusedRage';
    if (actor.mentalState.level === 'shaken') return 'PanickedDefense';
    if (actor.aiMemory.opponentModel.isTurtling) return 'BreakTheTurtle';
    if (actor.energy < 30) return 'ConserveEnergy';
    if (turn < 2 && currentPhase === 'Early') return 'OpeningMoves';
    return 'StandardExchange';
}

// MODIFIED: Accepts currentPhase for dynamic personality
function calculateMoveWeights(actor, defender, conditions, intent, prediction, currentPhase) {
    const availableMoves = getAvailableMoves(actor, conditions);
    const profile = getDynamicPersonality(actor, currentPhase); // Pass currentPhase

    const momentumInfluence = actor.momentum / (MAX_MOMENTUM - MIN_MOMENTUM) * 2;
    profile.aggression = clamp(profile.aggression + (momentumInfluence * 0.2), 0, 1.0);
    profile.riskTolerance = clamp(profile.riskTolerance + (momentumInfluence * 0.3), 0, 1.0);
    profile.defensiveBias = clamp(profile.defensiveBias - (momentumInfluence * 0.2), 0, 1.0);
    profile.patience = clamp(profile.patience - (momentumInfluence * 0.1), 0, 1.0);
    // actor.aiLog.push(`[Momentum Effect]: Momentum (${actor.momentum}) adjusted AI profile. Aggression: ${profile.aggression.toFixed(2)}, Risk: ${profile.riskTolerance.toFixed(2)}`);


    return availableMoves.map(move => {
        let weight = 1.0;
        let reasons = [];
        
        switch (move.type) {
            case 'Offense': weight *= (1 + profile.aggression * 1.5); reasons.push(`Aggro:${profile.aggression.toFixed(2)}`); break;
            case 'Defense': weight *= (1 + profile.defensiveBias * 1.5 + profile.patience); reasons.push(`Def:${profile.defensiveBias.toFixed(2)}`); break;
            case 'Utility': weight *= (1 + profile.creativity * 0.8 + profile.opportunism * 0.5); reasons.push(`Util:${profile.creativity.toFixed(2)}`); break;
            case 'Finisher': 
                weight *= (1 + profile.riskTolerance * 2.0); 
                reasons.push(`Risk:${profile.riskTolerance.toFixed(2)}`);
                // Heavy phase-based weighting for finishers
                if (currentPhase === 'Early') weight *= 0.05; // Very unlikely in early phase
                else if (currentPhase === 'Mid' && defender.hp > 50) weight *= 0.3; // Less likely mid unless opponent weak
                else if (currentPhase === 'Late' || defender.hp <= 30) weight *= 2.5; // Highly likely late or vs weak opponent
                break;
        }

        if (move.isRepositionMove) {
            weight *= (1 + actor.mobility * 2.0); reasons.push(`Mobility:${actor.mobility.toFixed(2)}`);
            if (actor.tacticalState?.name === 'Exposed' || actor.tacticalState?.name === 'Off-Balance') {
                weight *= 3.0; reasons.push('SelfVulnerable');
            }
            if (defender.isStunned || defender.tacticalState) {
                weight *= 0.5; reasons.push('OpponentVulnerable_LessReposition');
            }
            if (actor.aiMemory.repositionCooldown > 0) {
                weight *= 0.001; reasons.push('RepositionCooldown');
            }
            if (actor.energy < 20 && !move.moveTags.includes('low_cost')) {
                weight *= 1.5; reasons.push('LowEnergyReposition');
            }
            if (profile.patience > 0.7 || profile.defensiveBias > 0.7) {
                weight *= 1.5; reasons.push('PatienceDefensiveBias');
            }
             // Make repositioning less appealing if trying to finish
            if (intent === 'FinishingBlowAttempt') {
                weight *= 0.2; reasons.push('Finishing_LessReposition');
            }
        }


        if (profile.signatureMoveBias[move.name]) { weight *= profile.signatureMoveBias[move.name]; reasons.push(`SigMove`); }
        if (actor.lastMove?.name === move.name) { weight *= (1.0 - profile.antiRepeater); reasons.push(`AntiRepeat`); }
        if (move.moveTags.includes('counter') && profile.opportunism > 0.7) { weight *= (1.0 + profile.opportunism); reasons.push('CounterTag'); }
        if (move.moveTags.includes('evasive') && profile.patience > 0.6) { weight *= (1.0 + profile.patience); reasons.push('EvasiveTag'); }
        if (move.moveTags.includes('highRisk') && profile.riskTolerance > 0.5) { weight *= (1.0 + profile.riskTolerance * 1.2); reasons.push('HighRiskTag'); }
        
        const intentMultipliers = {
            'PressAdvantage': { Offense: 2.0, Finisher: 1.5, Defense: 0.5 },
            'CapitalizeOnOpening': { Offense: 1.8, Finisher: 2.5, Utility: 1.5, Defense: 0.2 },
            'BreakTheTurtle': { 'bypasses_defense': 5.0, 'unblockable_ground': 5.0, 'utility_control': 2.0, Defense: 0.1 },
            'ConserveEnergy': { 'low_cost': 3.0, 'reposition': 2.0 },
            'UnfocusedRage': { Offense: 2.5, Defense: 0.1, Utility: 0.1 },
            'PanickedDefense': { Defense: 3.0, 'evasive': 2.0, 'reposition': 2.5, Offense: 0.3, Finisher: 0.05 },
            'OpeningMoves': { Offense: 1.2, Defense: 1.0, Utility: 1.0, 'reposition': 1.5 },
            'FinishingBlowAttempt': { Finisher: 5.0, Offense: 2.0, Utility: 0.5, Defense: 0.1 } // New intent for finishers
        };
        const multipliers = intentMultipliers[intent] || {};
        if(multipliers[move.type]) { weight *= multipliers[move.type]; reasons.push(`Intent:${intent}`); }
        const energyCostEstimate = Math.round((move.power || 0) * 0.22) + 4;
        if (multipliers['low_cost'] && energyCostEstimate < 20) weight *= multipliers['low_cost'];
        move.moveTags.forEach(tag => { if (multipliers[tag]) { weight *= multipliers[tag]; reasons.push(`IntentTag:${tag}`); } });

        if (prediction.confidence > 0.4 && prediction.predictedMove) {
            const counters = moveInteractionMatrix[move.name]?.counters;
            if (counters && counters[prediction.predictedMove]) {
                const bonus = 1 + (counters[prediction.predictedMove] * prediction.confidence * 3.0);
                weight *= bonus;
                reasons.push(`PredictiveCounter(x${bonus.toFixed(1)})`);
            }
        }

        const { energyCostModifier } = conditions.environmentalModifiers?.[move.element] || { energyCostModifier: 1.0 };
        const estimatedEnergyCostWithEnv = energyCostEstimate * energyCostModifier;
        if (actor.energy < estimatedEnergyCostWithEnv) {
            weight = 0;
            reasons.push(`EnergyTooHigh`);
        }

        if (actor.aiMemory.moveSuccessCooldown[move.name]) weight *= 0.01;
        if (move.moveTags.includes('requires_opening') && !(defender.isStunned || defender.tacticalState)) weight *= 0.01;
        
        if (weight < 0.05 && move.name !== "Struggle") return { move, weight: 0, reasons }; // Ensure Struggle can always be chosen if nothing else is viable
        return { move, weight, reasons };
    });
}

function getSoftmaxProbabilities(weightedMoves, temperature = 1.0) {
    if (!weightedMoves.length) return [];
    const temp = Math.max(0.01, temperature); // Ensure temperature is not zero
    
    // Filter out moves with zero weight before calculating maxWeight, unless all moves have zero weight
    const positiveWeightMoves = weightedMoves.filter(m => m.weight > 0);
    const targetMovesForExp = positiveWeightMoves.length > 0 ? positiveWeightMoves : weightedMoves;

    if (targetMovesForExp.length === 0) { // Should not happen if Struggle is always an option
        return weightedMoves.map(m => ({ ...m, probability: 1 / weightedMoves.length })); // Equal probability if all zero
    }

    const maxWeight = Math.max(...targetMovesForExp.map(m => m.weight));
    let weightExpSum = 0;

    const movesWithExp = targetMovesForExp.map(m => {
        const expWeight = Math.exp((m.weight - maxWeight) / temp);
        weightExpSum += expWeight;
        return { ...m, expWeight };
    });

    // If weightExpSum is 0 (e.g., all weights were 0 or negative, or temp is very high), assign uniform probability.
    if (weightExpSum === 0) {
        return movesWithExp.map(m => ({ ...m, probability: 1 / movesWithExp.length }));
    }

    return movesWithExp.map(m => ({ ...m, probability: m.expWeight / weightExpSum }));
}


function selectFromDistribution(movesWithProbs) {
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const moveInfo of movesWithProbs) {
        cumulativeProbability += moveInfo.probability;
        if (rand < cumulativeProbability) return moveInfo;
    }
    // Fallback for floating point issues or if all probabilities were zero (should be rare)
    return movesWithProbs.length > 0 ? movesWithProbs[movesWithProbs.length - 1] : { move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, weight: 1, probability: 1, reasons: ['EmergencyFallback'] };
}


// MODIFIED: Accepts currentPhase for AI logic
export function selectMove(actor, defender, conditions, turn, currentPhase) {
    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    const intent = determineStrategicIntent(actor, defender, turn, currentPhase); // Pass currentPhase
    const prediction = predictOpponentNextMove(actor, defender);
    let weightedMoves = calculateMoveWeights(actor, defender, conditions, intent, prediction, currentPhase); // Pass currentPhase
    
    let validMoves = weightedMoves.filter(m => m.weight > 0 && m.move.name !== "Struggle"); // Exclude struggle initially
    
    if (validMoves.length === 0) {
        // If no valid moves other than struggle, ensure struggle is the only option
        validMoves = [{move: struggleMove, weight: 1.0, reasons: ['FallbackOnlyStruggle']}];
    } else {
        // Add struggle as a low-probability option if other moves are available
        // This handles cases where all other moves might get filtered out by softmax if their weights are too low relative to each other.
        const struggleWeightInfo = weightedMoves.find(m => m.move.name === "Struggle") || {move: struggleMove, weight: 0.01, reasons: ['LowProbStruggle']};
        if(!validMoves.find(m => m.move.name === "Struggle")) { // only add if not already forced as only option
             validMoves.push(struggleWeightInfo);
        }
    }

    const temperature = (1.0 - (actor.personalityProfile.predictability || 0.8)) * 1.5 + 0.5;
    const movesWithProbs = getSoftmaxProbabilities(validMoves, temperature);
    const chosenMoveInfo = selectFromDistribution(movesWithProbs);
    
    const chosenMove = chosenMoveInfo.move;

    // Log the detailed AI decision process
    actor.aiLog.push({
        turn: turn + 1,
        phase: currentPhase,
        intent: intent,
        prediction: prediction.predictedMove ? `${prediction.predictedMove} (Conf: ${prediction.confidence.toFixed(2)})` : 'None',
        consideredMoves: movesWithProbs.map(m => ({
            name: m.move.name,
            baseW: m.weight.toFixed(3), // Original weight before softmax
            prob: `${(m.probability * 100).toFixed(1)}%`,
            reasons: m.reasons.join(', ')
        })).sort((a,b) => parseFloat(b.prob) - parseFloat(a.prob)), // Sort by probability for easier reading
        chosenMove: chosenMove.name,
        finalProb: `${(chosenMoveInfo.probability * 100).toFixed(1)}%`,
        actorState: { hp: actor.hp, energy: actor.energy, momentum: actor.momentum, mental: actor.mentalState.level }
    });
    
    return {
        move: chosenMove,
        // aiLogEntry is now part of the structured log pushed above
    };
}