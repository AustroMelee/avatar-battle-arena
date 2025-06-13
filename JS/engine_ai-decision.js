'use strict';

// This is the "AI Brain" module.
// VERSION 7: Final version with all overkill features integrated.

import { getAvailableMoves } from './engine_move-resolution.js';
import { moveInteractionMatrix } from './move-interaction-matrix.js';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export function adaptPersonality(actor) {
    if (actor.moveHistory.length < 2) return;
    const lastTwoMoves = actor.moveHistory.slice(-2);
    // Ensure effectiveness is tracked on the move object itself
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

function getDynamicPersonality(actor) {
    let profile = { ...actor.personalityProfile };
    if (actor.relationalState?.emotionalModifiers) {
        Object.keys(actor.relationalState.emotionalModifiers).forEach(key => {
            if (key.includes('Boost')) {
                const trait = key.replace('Boost', '');
                profile[trait] = clamp((profile[trait] || 0) + actor.relationalState.emotionalModifiers[key], 0, 1.5);
            } else if (key.includes('Reduction')) {
                const trait = key.replace('Reduction', '');
                profile[trait] = clamp((profile[trait] || 0) - actor.relationalState.emotionalModifiers[key], 0, 1.5);
            }
        });
    }
    switch (actor.mentalState.level) {
        case 'stressed': profile.patience *= 0.7; profile.riskTolerance = clamp(profile.riskTolerance + 0.15, 0, 1.2); break;
        case 'shaken': profile.patience *= 0.4; profile.opportunism *= 0.6; profile.aggression = clamp(profile.aggression + 0.2, 0, 1.2); profile.riskTolerance = clamp(profile.riskTolerance + 0.3, 0, 1.2); break;
        case 'broken': profile.patience = 0.05; profile.opportunism = 0.1; profile.aggression = clamp(profile.aggression + 0.4, 0, 1.3); profile.riskTolerance = clamp(profile.riskTolerance + 0.5, 0, 1.5); break;
    }
    return profile;
}

function determineStrategicIntent(actor, defender, turn) {
    const profile = getDynamicPersonality(actor);
    const healthDiff = actor.hp - defender.hp;
    if (profile.opportunism > 0.8 && (defender.isStunned || defender.tacticalState)) return 'CapitalizeOnOpening';
    if (profile.riskTolerance > 0.8 && actor.hp < 40) return 'DesperateGambit';
    if (profile.patience > 0.8 && turn < 2) return 'CautiousDefense';
    if (profile.aggression > 0.9 && healthDiff > 20) return 'PressAdvantage';
    if (actor.mentalState.level === 'broken') return 'UnfocusedRage';
    if (actor.mentalState.level === 'shaken') return 'PanickedDefense';
    if (actor.aiMemory.opponentModel.isTurtling) return 'BreakTheTurtle';
    if (actor.energy < 30) return 'ConserveEnergy';
    if (turn < 2) return 'OpeningMoves';
    return 'StandardExchange';
}

function calculateMoveWeights(actor, defender, conditions, intent, prediction) {
    const availableMoves = getAvailableMoves(actor, conditions);
    const profile = getDynamicPersonality(actor);

    return availableMoves.map(move => {
        let weight = 1.0;
        let reasons = [];
        switch (move.type) {
            case 'Offense': weight *= (1 + profile.aggression * 1.5); reasons.push(`Aggro:${profile.aggression.toFixed(2)}`); break;
            case 'Defense': weight *= (1 + profile.defensiveBias * 1.5 + profile.patience); reasons.push(`Def:${profile.defensiveBias.toFixed(2)}`); break;
            case 'Utility': weight *= (1 + profile.creativity * 0.8 + profile.opportunism * 0.5); reasons.push(`Util:${profile.creativity.toFixed(2)}`); break;
            case 'Finisher': weight *= (1 + profile.riskTolerance * 2.0); reasons.push(`Risk:${profile.riskTolerance.toFixed(2)}`); break;
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
            'ConserveEnergy': { 'low_cost': 3.0 },
            'UnfocusedRage': { Offense: 2.5, Defense: 0.1, Utility: 0.1 },
            'PanickedDefense': { Defense: 3.0, 'evasive': 2.0, Offense: 0.3, Finisher: 0.05 },
        };
        const multipliers = intentMultipliers[intent] || {};
        if(multipliers[move.type]) { weight *= multipliers[move.type]; reasons.push(`Intent:${intent}`); }
        const energyCost = Math.round((move.power || 0) * 0.22) + 4; // This is a rough estimate; actual cost comes from move-resolution
        if (multipliers['low_cost'] && energyCost < 20) weight *= multipliers['low_cost'];
        move.moveTags.forEach(tag => { if (multipliers[tag]) { weight *= multipliers[tag]; reasons.push(`IntentTag:${tag}`); } });

        if (prediction.confidence > 0.4 && prediction.predictedMove) {
            const counters = moveInteractionMatrix[move.name]?.counters;
            if (counters && counters[prediction.predictedMove]) {
                const bonus = 1 + (counters[prediction.predictedMove] * prediction.confidence * 3.0);
                weight *= bonus;
                reasons.push(`PredictiveCounter(x${bonus.toFixed(1)})`);
            }
        }

        // NEW: Factor in environmental energy cost if available (pre-calculation)
        // This is an ESTIMATE for AI decision, actual cost will be from calculateMove
        const { energyCostModifier } = conditions.environmentalModifiers?.[move.element] || { energyCostModifier: 1.0 };
        const estimatedEnergyCost = energyCost * energyCostModifier;
        if (actor.energy < estimatedEnergyCost) { // Use estimated energy cost
            weight = 0; // Don't pick moves the actor can't afford
            reasons.push(`EnergyTooHigh`);
        }


        if (actor.aiMemory.moveSuccessCooldown[move.name]) weight *= 0.01;
        if (move.moveTags.includes('requires_opening') && !(defender.isStunned || defender.tacticalState)) weight *= 0.01;
        
        if (weight < 0.05) return { move, weight: 0, reasons };
        return { move, weight, reasons };
    });
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
        if (rand < cumulativeProbability) return moveInfo;
    }
    return movesWithProbs[movesWithProbs.length - 1];
}

export function selectMove(actor, defender, conditions, turn) {
    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    const intent = determineStrategicIntent(actor, defender, turn);
    const prediction = predictOpponentNextMove(actor, defender);
    let weightedMoves = calculateMoveWeights(actor, defender, conditions, intent, prediction);
    let validMoves = weightedMoves.filter(m => m.weight > 0);
    if (validMoves.length === 0) validMoves.push({move: struggleMove, weight: 1.0, reasons: ['Fallback']});
    const temperature = (1.0 - (actor.personalityProfile.predictability || 0.8)) * 1.5 + 0.5;
    const movesWithProbs = getSoftmaxProbabilities(validMoves, temperature);
    const chosenMoveInfo = selectFromDistribution(movesWithProbs);
    const chosenMove = chosenMoveInfo.move;
    return {
        move: chosenMove,
        aiLogEntry: {
            chosenMove: chosenMove.name, intent: intent,
            prediction: { move: prediction.predictedMove, conf: prediction.confidence.toFixed(2) },
            weight: chosenMoveInfo.weight.toFixed(2), probability: `${(chosenMoveInfo.probability * 100).toFixed(1)}%`,
            weightingReasons: chosenMoveInfo.reasons,
            actorState: { hp: actor.hp, energy: actor.energy, momentum: actor.momentum, mental: actor.mentalState.level },
        }
    };
}