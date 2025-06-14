// FILE: js/engine_ai-decision.js
// FILE: engine_ai-decision.js
'use strict';

// This is the "AI Brain" module.
// VERSION 8.1: Null-Safety Pass (Crash Proofing)

import { getAvailableMoves } from './engine_move-resolution.js';
import { moveInteractionMatrix } from './move-interaction-matrix.js'; // Assuming this is correctly structured
import { MAX_MOMENTUM, MIN_MOMENTUM } from './engine_momentum.js';
import { getPhaseAIModifiers } from './engine_battle-phase.js';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const DEFAULT_PERSONALITY_PROFILE = {
    aggression: 0.5, patience: 0.5, riskTolerance: 0.5, opportunism: 0.5,
    creativity: 0.5, defensiveBias: 0.5, antiRepeater: 0.5, signatureMoveBias: {},
    predictability: 0.5 // Added for getSoftmaxProbabilities
};

const DEFAULT_AI_MEMORY = {
    selfMoveEffectiveness: {},
    opponentModel: { isAggressive: 0, isDefensive: 0, isTurtling: false },
    moveSuccessCooldown: {},
    opponentSequenceLog: {},
    repositionCooldown: 0
};

function safeGet(obj, path, defaultValue, actorName = 'Unknown Actor', propertyPathName = path) {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    if (value === undefined || value === null) {
        if (defaultValue !== undefined) {
            console.warn(`AI Decision: Missing ${propertyPathName} for ${actorName}. Using default: ${defaultValue}.`);
            return defaultValue;
        }
        console.warn(`AI Decision: Critical data ${propertyPathName} missing for ${actorName}. This might lead to unexpected behavior.`);
        return null; // Or throw an error if truly critical and no default makes sense
    }
    return value;
}


export function adaptPersonality(actor) {
    if (!actor || !actor.moveHistory || !actor.personalityProfile || !actor.aiLog) {
        // console.warn("AI Decision (adaptPersonality): Invalid actor object or missing critical properties.");
        return;
    }
    if (actor.moveHistory.length < 2) return;

    const lastTwoMoves = actor.moveHistory.slice(-2);
    const lastTwoResults = lastTwoMoves.map(move => move?.effectiveness || 'Normal');

    if (lastTwoResults.every(r => r === 'Weak')) {
        actor.personalityProfile.creativity = clamp(safeGet(actor.personalityProfile, 'creativity', DEFAULT_PERSONALITY_PROFILE.creativity, actor.name, 'personalityProfile.creativity') + 0.15, 0, 1.0);
        actor.personalityProfile.riskTolerance = clamp(safeGet(actor.personalityProfile, 'riskTolerance', DEFAULT_PERSONALITY_PROFILE.riskTolerance, actor.name, 'personalityProfile.riskTolerance') + 0.1, 0, 1.0);
        actor.aiLog.push("[Personality Drift: Increased Creativity due to failure streak]");
    } else if (lastTwoResults.every(r => r === 'Strong' || r === 'Critical')) {
        actor.personalityProfile.aggression = clamp(safeGet(actor.personalityProfile, 'aggression', DEFAULT_PERSONALITY_PROFILE.aggression, actor.name, 'personalityProfile.aggression') + 0.1, 0, 1.0);
        actor.aiLog.push("[Personality Drift: Increased Aggression due to success streak]");
    }
}

export function attemptManipulation(manipulator, target) {
    if (!manipulator || !target || !target.mentalState || !manipulator.pronouns || !target.pronouns) {
        // console.warn("AI Decision (attemptManipulation): Invalid manipulator or target object.");
        return { success: false };
    }

    const manipTrait = manipulator.specialTraits?.manipulative;
    if (!manipTrait) return { success: false };

    const mentalStateLevel = safeGet(target.mentalState, 'level', 'stable', target.name, 'mentalState.level');
    const mentalStateModifier = { 'stable': 0.5, 'stressed': 1.0, 'shaken': 1.5, 'broken': 0.2 }[mentalStateLevel] || 0.5;
    const resilience = target.specialTraits?.resilientToManipulation || 0;
    const attemptChance = manipTrait * mentalStateModifier * (1 - resilience);

    if (Math.random() < attemptChance) {
        const effect = Math.random() > 0.5 ? 'Exposed' : 'Shaken';
        const manipulatorName = manipulator.name || 'Manipulator';
        const manipulatorId = manipulator.id || 'unknown-manipulator';
        const targetName = target.name || 'Target';
        const targetId = target.id || 'unknown-target';
        const targetPronounO = target.pronouns.o || 'them';

        const manipulatorSpan = `<span class="char-${manipulatorId}">${manipulatorName}</span>`;
        const targetSpan = `<span class="char-${targetId}">${targetName}</span>`;
        const narration = `<p class="narrative-manipulation">${manipulatorSpan} unleashes a sharp taunt, preying on ${targetSpan}'s insecurities. It hits home, leaving ${targetPronounO} ${effect}!</p>`;
        return { success: true, effect, narration };
    }
    return { success: false };
}

export function updateAiMemory(learner, opponent) {
    if (!learner || !opponent || !learner.aiMemory || !opponent.moveHistory) {
        // console.warn("AI Decision (updateAiMemory): Invalid learner or opponent object, or missing aiMemory/moveHistory.");
        return;
    }
    // Ensure aiMemory sub-objects exist
    learner.aiMemory.selfMoveEffectiveness = learner.aiMemory.selfMoveEffectiveness || {};
    learner.aiMemory.moveSuccessCooldown = learner.aiMemory.moveSuccessCooldown || {};
    learner.aiMemory.opponentSequenceLog = learner.aiMemory.opponentSequenceLog || {};
    learner.aiMemory.opponentModel = learner.aiMemory.opponentModel || DEFAULT_AI_MEMORY.opponentModel;


    if (learner.lastMove && learner.lastMove.name) {
        const moveName = learner.lastMove.name;
        if (!learner.aiMemory.selfMoveEffectiveness[moveName]) {
            learner.aiMemory.selfMoveEffectiveness[moveName] = { totalEffectiveness: 0, uses: 0 };
        }
        const effectivenessValue = { 'Weak': -1, 'Normal': 1, 'Strong': 2, 'Critical': 3 }[learner.lastMoveEffectiveness] || 0;
        learner.aiMemory.selfMoveEffectiveness[moveName].totalEffectiveness += effectivenessValue;
        learner.aiMemory.selfMoveEffectiveness[moveName].uses++;
        if (learner.lastMoveEffectiveness === 'Weak') learner.aiMemory.moveSuccessCooldown[moveName] = 2;

        if (learner.lastMove.isRepositionMove) {
            learner.aiMemory.repositionCooldown = 2;
        }
    }
    if (learner.aiMemory.repositionCooldown > 0) {
        learner.aiMemory.repositionCooldown--;
    }

    if (opponent.moveHistory.length >= 2 && opponent.lastMove?.name) {
        const prevMove = opponent.moveHistory[opponent.moveHistory.length - 2];
        if (prevMove?.name) {
            const prev = prevMove.name;
            const curr = opponent.lastMove.name;
            if (!learner.aiMemory.opponentSequenceLog[prev]) learner.aiMemory.opponentSequenceLog[prev] = {};
            if (!learner.aiMemory.opponentSequenceLog[prev][curr]) learner.aiMemory.opponentSequenceLog[prev][curr] = 0;
            learner.aiMemory.opponentSequenceLog[prev][curr]++;
        }
    }
    if (opponent.lastMove?.type) {
        const moveType = opponent.lastMove.type;
        if (moveType === 'Offense' || moveType === 'Finisher') learner.aiMemory.opponentModel.isAggressive = (learner.aiMemory.opponentModel.isAggressive || 0) + 1;
        else if (moveType === 'Defense') learner.aiMemory.opponentModel.isDefensive = (learner.aiMemory.opponentModel.isDefensive || 0) + 1;
    }
    learner.aiMemory.opponentModel.isTurtling = (opponent.consecutiveDefensiveTurns || 0) >= 2;
}

function predictOpponentNextMove(actor, defender) {
    if (!actor || !defender || !actor.aiMemory) {
        // console.warn("AI Decision (predictOpponentNextMove): Invalid actor or defender object.");
        return { predictedMove: null, confidence: 0 };
    }
    const opponentLastMoveName = defender.lastMove?.name;
    if (!opponentLastMoveName) return { predictedMove: null, confidence: 0 };

    const sequenceLog = safeGet(actor.aiMemory, 'opponentSequenceLog', {}, actor.name, 'aiMemory.opponentSequenceLog');
    const sequence = sequenceLog[opponentLastMoveName];
    if (!sequence || typeof sequence !== 'object') return { predictedMove: null, confidence: 0 };

    let totalObservations = 0, mostLikelyMove = null, maxCount = 0;
    for (const moveName in sequence) {
        const count = sequence[moveName];
        if (typeof count === 'number') {
            totalObservations += count;
            if (count > maxCount) { maxCount = count; mostLikelyMove = moveName; }
        }
    }
    if (!mostLikelyMove || totalObservations < 2) return { predictedMove: null, confidence: 0 };
    return { predictedMove: mostLikelyMove, confidence: maxCount / totalObservations };
}

function getDynamicPersonality(actor, currentPhase) {
    if (!actor || !actor.aiLog || !actor.mentalState) {
        // console.warn("AI Decision (getDynamicPersonality): Invalid actor object.");
        return { ...DEFAULT_PERSONALITY_PROFILE }; // Return a default profile
    }
    const baseActorProfile = actor.personalityProfile || DEFAULT_PERSONALITY_PROFILE;
    let dynamicProfile = { ...baseActorProfile };
    const phaseMods = getPhaseAIModifiers(currentPhase);

    Object.keys(phaseMods).forEach(key => {
        const traitName = key.replace('Multiplier', '');
        if (dynamicProfile[traitName] !== undefined) {
            dynamicProfile[traitName] = clamp(dynamicProfile[traitName] * phaseMods[key], 0, 1.5);
        } else {
            // console.warn(`AI Decision (getDynamicPersonality): Trait ${traitName} not found in profile for ${actor.name}. Using default from phaseMods.`);
            // This scenario means the base profile might be missing a trait that phaseMods tries to modify.
            // We might decide to initialize it or ignore. For now, ignore if not in baseProfile.
        }
    });

    const baseAggression = baseActorProfile.aggression !== undefined ? baseActorProfile.aggression : DEFAULT_PERSONALITY_PROFILE.aggression;
    actor.aiLog.push(`[Phase Influence (${currentPhase})]: Base Aggro: ${baseAggression.toFixed(2)}, Phase Modded Aggro: ${(dynamicProfile.aggression || baseAggression).toFixed(2)}`);


    if (actor.relationalState?.emotionalModifiers) {
        Object.keys(actor.relationalState.emotionalModifiers).forEach(key => {
            const value = actor.relationalState.emotionalModifiers[key];
            if (typeof value !== 'number') return; // Skip if modifier value is not a number

            if (key.includes('Boost')) {
                const trait = key.replace('Boost', '');
                dynamicProfile[trait] = clamp((dynamicProfile[trait] || 0) + value, 0, 1.5);
            } else if (key.includes('Reduction')) {
                const trait = key.replace('Reduction', '');
                dynamicProfile[trait] = clamp((dynamicProfile[trait] || 0) - value, 0, 1.5);
            }
        });
    }

    const mentalStateLevel = safeGet(actor.mentalState, 'level', 'stable', actor.name, 'mentalState.level');
    switch (mentalStateLevel) {
        case 'stressed':
            dynamicProfile.patience = (dynamicProfile.patience || DEFAULT_PERSONALITY_PROFILE.patience) * 0.7;
            dynamicProfile.riskTolerance = clamp((dynamicProfile.riskTolerance || DEFAULT_PERSONALITY_PROFILE.riskTolerance) + 0.15, 0, 1.2);
            break;
        case 'shaken':
            dynamicProfile.patience = (dynamicProfile.patience || DEFAULT_PERSONALITY_PROFILE.patience) * 0.4;
            dynamicProfile.opportunism = (dynamicProfile.opportunism || DEFAULT_PERSONALITY_PROFILE.opportunism) * 0.6;
            dynamicProfile.aggression = clamp((dynamicProfile.aggression || DEFAULT_PERSONALITY_PROFILE.aggression) + 0.2, 0, 1.2);
            dynamicProfile.riskTolerance = clamp((dynamicProfile.riskTolerance || DEFAULT_PERSONALITY_PROFILE.riskTolerance) + 0.3, 0, 1.2);
            break;
        case 'broken':
            dynamicProfile.patience = 0.05;
            dynamicProfile.opportunism = 0.1;
            dynamicProfile.aggression = clamp((dynamicProfile.aggression || DEFAULT_PERSONALITY_PROFILE.aggression) + 0.4, 0, 1.3);
            dynamicProfile.riskTolerance = clamp((dynamicProfile.riskTolerance || DEFAULT_PERSONALITY_PROFILE.riskTolerance) + 0.5, 0, 1.5);
            break;
    }
    return dynamicProfile;
}

function determineStrategicIntent(actor, defender, turn, currentPhase) {
    if (!actor || !defender) {
        // console.warn("AI Decision (determineStrategicIntent): Invalid actor or defender.");
        return 'StandardExchange';
    }
    const profile = getDynamicPersonality(actor, currentPhase);
    const actorHp = safeGet(actor, 'hp', 100, actor.name, 'hp');
    const defenderHp = safeGet(defender, 'hp', 100, defender.name, 'hp');
    const healthDiff = actorHp - defenderHp;

    if (currentPhase === 'Early' && profile.patience > 0.7 && turn < 2) return 'OpeningMoves';
    if (currentPhase === 'Late' && actorHp < 30 && profile.riskTolerance > 0.7) return 'DesperateGambit';
    if (currentPhase === 'Late' && defenderHp < 25 && profile.opportunism > 0.8) return 'FinishingBlowAttempt';

    const defenderIsStunned = safeGet(defender, 'isStunned', false, defender.name, 'isStunned');
    const defenderTacticalState = safeGet(defender, 'tacticalState', null, defender.name, 'tacticalState');
    if (profile.opportunism > 0.8 && (defenderIsStunned || defenderTacticalState)) return 'CapitalizeOnOpening';

    if (profile.riskTolerance > 0.8 && actorHp < 40) return 'DesperateGambit';
    if (profile.patience > 0.8 && turn < 2 && currentPhase !== 'Late') return 'CautiousDefense';
    if (profile.aggression > 0.9 && healthDiff > 20) return 'PressAdvantage';

    const actorMentalStateLevel = safeGet(actor.mentalState, 'level', 'stable', actor.name, 'mentalState.level');
    if (actorMentalStateLevel === 'broken') return 'UnfocusedRage';
    if (actorMentalStateLevel === 'shaken') return 'PanickedDefense';

    const opponentIsTurtling = safeGet(actor.aiMemory?.opponentModel, 'isTurtling', false, actor.name, 'aiMemory.opponentModel.isTurtling');
    if (opponentIsTurtling) return 'BreakTheTurtle';

    const actorEnergy = safeGet(actor, 'energy', 100, actor.name, 'energy');
    if (actorEnergy < 30) return 'ConserveEnergy';

    if (turn < 2 && currentPhase === 'Early') return 'OpeningMoves';
    return 'StandardExchange';
}

function calculateMoveWeights(actor, defender, conditions, intent, prediction, currentPhase) {
    if (!actor || !defender || !conditions) {
        // console.warn("AI Decision (calculateMoveWeights): Invalid actor, defender, or conditions.");
        return [{ move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, weight: 1.0, reasons: ["ErrorInCalculateMoveWeights"] }];
    }

    const availableMoves = getAvailableMoves(actor, conditions);
    const profile = getDynamicPersonality(actor, currentPhase);

    const actorMomentum = safeGet(actor, 'momentum', 0, actor.name, 'momentum');
    const momentumInfluence = actorMomentum / (MAX_MOMENTUM - MIN_MOMENTUM) * 2;
    profile.aggression = clamp(profile.aggression + (momentumInfluence * 0.2), 0, 1.0);
    profile.riskTolerance = clamp(profile.riskTolerance + (momentumInfluence * 0.3), 0, 1.0);
    profile.defensiveBias = clamp(profile.defensiveBias - (momentumInfluence * 0.2), 0, 1.0);
    profile.patience = clamp(profile.patience - (momentumInfluence * 0.1), 0, 1.0);


    return availableMoves.map(move => {
        if (!move || !move.name || !move.type || !move.moveTags) {
            // console.warn(`AI Decision (calculateMoveWeights): Invalid move object found for ${actor.name}:`, move);
            return { move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, weight: 0.001, reasons: ["InvalidMoveObjectEncountered"] };
        }
        let weight = 1.0;
        let reasons = [];

        switch (move.type) {
            case 'Offense': weight *= (1 + profile.aggression * 1.5); reasons.push(`Aggro:${profile.aggression.toFixed(2)}`); break;
            case 'Defense': weight *= (1 + profile.defensiveBias * 1.5 + profile.patience); reasons.push(`Def:${profile.defensiveBias.toFixed(2)}`); break;
            case 'Utility': weight *= (1 + profile.creativity * 0.8 + profile.opportunism * 0.5); reasons.push(`Util:${profile.creativity.toFixed(2)}`); break;
            case 'Finisher':
                weight *= (1 + profile.riskTolerance * 2.0);
                reasons.push(`Risk:${profile.riskTolerance.toFixed(2)}`);
                const defenderHp = safeGet(defender, 'hp', 100, defender.name, 'hp');
                if (currentPhase === 'Early') weight *= 0.05;
                else if (currentPhase === 'Mid' && defenderHp > 50) weight *= 0.3;
                else if (currentPhase === 'Late' || defenderHp <= 30) weight *= 2.5;
                break;
            default:
                // console.warn(`AI Decision (calculateMoveWeights): Unknown move type "${move.type}" for move "${move.name}" of ${actor.name}.`);
                break;
        }

        if (move.isRepositionMove) {
            const actorMobility = safeGet(actor, 'mobility', 0.5, actor.name, 'mobility');
            weight *= (1 + actorMobility * 2.0); reasons.push(`Mobility:${actorMobility.toFixed(2)}`);
            const actorTacticalStateName = actor.tacticalState?.name;
            if (actorTacticalStateName === 'Exposed' || actorTacticalStateName === 'Off-Balance') {
                weight *= 3.0; reasons.push('SelfVulnerable');
            }
            if (safeGet(defender, 'isStunned', false, defender.name, 'isStunned') || safeGet(defender, 'tacticalState', null, defender.name, 'tacticalState')) {
                weight *= 0.5; reasons.push('OpponentVulnerable_LessReposition');
            }
            const repositionCooldown = safeGet(actor.aiMemory, 'repositionCooldown', 0, actor.name, 'aiMemory.repositionCooldown');
            if (repositionCooldown > 0) {
                weight *= 0.001; reasons.push('RepositionCooldown');
            }
            const actorEnergy = safeGet(actor, 'energy', 100, actor.name, 'energy');
            if (actorEnergy < 20 && !(move.moveTags?.includes('low_cost'))) {
                weight *= 1.5; reasons.push('LowEnergyReposition');
            }
            if (profile.patience > 0.7 || profile.defensiveBias > 0.7) {
                weight *= 1.5; reasons.push('PatienceDefensiveBias');
            }
            if (intent === 'FinishingBlowAttempt') {
                weight *= 0.2; reasons.push('Finishing_LessReposition');
            }
        }

        const signatureBias = safeGet(profile, `signatureMoveBias.${move.name}`, 1.0, actor.name, `profile.signatureMoveBias.${move.name}`);
        if (signatureBias !== 1.0) { weight *= signatureBias; reasons.push(`SigMove`); }

        if (actor.lastMove?.name === move.name) { weight *= (1.0 - profile.antiRepeater); reasons.push(`AntiRepeat`); }
        if (move.moveTags?.includes('counter') && profile.opportunism > 0.7) { weight *= (1.0 + profile.opportunism); reasons.push('CounterTag'); }
        if (move.moveTags?.includes('evasive') && profile.patience > 0.6) { weight *= (1.0 + profile.patience); reasons.push('EvasiveTag'); }
        if (move.moveTags?.includes('highRisk') && profile.riskTolerance > 0.5) { weight *= (1.0 + profile.riskTolerance * 1.2); reasons.push('HighRiskTag'); }

        const intentMultipliers = { /* ... as before ... */ }; // Keep this structure
        const multipliers = intentMultipliers[intent] || {};
        if (multipliers[move.type]) { weight *= multipliers[move.type]; reasons.push(`Intent:${intent}`); }
        const energyCostEstimate = Math.round((move.power || 0) * 0.22) + 4;
        if (multipliers['low_cost'] && energyCostEstimate < 20) weight *= multipliers['low_cost'];
        (move.moveTags || []).forEach(tag => { if (multipliers[tag]) { weight *= multipliers[tag]; reasons.push(`IntentTag:${tag}`); } });

        if (prediction.confidence > 0.4 && prediction.predictedMove) {
            const counters = moveInteractionMatrix[move.name]?.counters;
            if (counters && counters[prediction.predictedMove]) {
                const bonus = 1 + (counters[prediction.predictedMove] * prediction.confidence * 3.0);
                weight *= bonus;
                reasons.push(`PredictiveCounter(x${bonus.toFixed(1)})`);
            }
        }

        const envModForElement = conditions.environmentalModifiers?.[move.element] || {};
        const energyCostModifier = envModForElement.energyCostModifier || 1.0;
        const estimatedEnergyCostWithEnv = energyCostEstimate * energyCostModifier;
        const actorEnergy = safeGet(actor, 'energy', 100, actor.name, 'energy');
        if (actorEnergy < estimatedEnergyCostWithEnv) {
            weight = 0;
            reasons.push(`EnergyTooHigh`);
        }

        const moveCooldown = safeGet(actor.aiMemory?.moveSuccessCooldown, move.name, 0, actor.name, `aiMemory.moveSuccessCooldown.${move.name}`);
        if (moveCooldown) weight *= 0.01;
        if (move.moveTags?.includes('requires_opening') && !(safeGet(defender, 'isStunned', false, defender.name, 'isStunned') || safeGet(defender, 'tacticalState', null, defender.name, 'tacticalState'))) weight *= 0.01;

        if (weight < 0.05 && move.name !== "Struggle") return { move, weight: 0, reasons };
        return { move, weight, reasons };
    });
}

function getSoftmaxProbabilities(weightedMoves, temperature = 1.0) {
    if (!weightedMoves || weightedMoves.length === 0) {
        // console.warn("AI Decision (getSoftmaxProbabilities): No weighted moves provided.");
        return [];
    }
    const temp = Math.max(0.01, temperature);

    const positiveWeightMoves = weightedMoves.filter(m => m.weight > 0);
    const targetMovesForExp = positiveWeightMoves.length > 0 ? positiveWeightMoves : weightedMoves.filter(m => m.move); // Ensure move exists

    if (targetMovesForExp.length === 0) {
        return weightedMoves.map(m => ({ ...m, probability: (m.move ? 1 : 0) / weightedMoves.filter(wm => wm.move).length || 0 }));
    }

    const maxWeight = Math.max(...targetMovesForExp.map(m => m.weight));
    let weightExpSum = 0;

    const movesWithExp = targetMovesForExp.map(m => {
        const expWeight = Math.exp((m.weight - maxWeight) / temp);
        weightExpSum += expWeight;
        return { ...m, expWeight };
    });

    if (weightExpSum === 0) {
        return movesWithExp.map(m => ({ ...m, probability: 1 / movesWithExp.length }));
    }

    return movesWithExp.map(m => ({ ...m, probability: m.expWeight / weightExpSum }));
}


function selectFromDistribution(movesWithProbs) {
    if (!movesWithProbs || movesWithProbs.length === 0) {
        // console.warn("AI Decision (selectFromDistribution): No moves with probabilities provided. Defaulting to Struggle.");
        return { move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, weight: 1, probability: 1, reasons: ['EmergencyFallbackNoProbs'] };
    }
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const moveInfo of movesWithProbs) {
        if (typeof moveInfo.probability !== 'number' || isNaN(moveInfo.probability)) {
            // console.warn("AI Decision (selectFromDistribution): Invalid probability found for move:", moveInfo);
            continue; // Skip this move
        }
        cumulativeProbability += moveInfo.probability;
        if (rand < cumulativeProbability) return moveInfo;
    }
    return movesWithProbs[movesWithProbs.length - 1] || { move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, weight: 1, probability: 1, reasons: ['EmergencyFallbackDistributionEnd'] };
}


export function selectMove(actor, defender, conditions, turn, currentPhase) {
    if (!actor || !defender || !conditions || !actor.aiLog) {
        // console.warn("AI Decision (selectMove): Critical parameters missing. Defaulting to Struggle.");
        return { move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] } };
    }
    actor.personalityProfile = actor.personalityProfile || { ...DEFAULT_PERSONALITY_PROFILE };
    actor.aiMemory = actor.aiMemory || { ...DEFAULT_AI_MEMORY };


    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    const intent = determineStrategicIntent(actor, defender, turn, currentPhase);
    const prediction = predictOpponentNextMove(actor, defender);
    let weightedMoves = calculateMoveWeights(actor, defender, conditions, intent, prediction, currentPhase);

    let validMoves = weightedMoves.filter(m => m.move && m.weight > 0 && m.move.name !== "Struggle");

    if (validMoves.length === 0) {
        validMoves = [{ move: struggleMove, weight: 1.0, reasons: ['FallbackOnlyStruggle'] }];
    } else {
        const struggleWeightInfo = weightedMoves.find(m => m.move?.name === "Struggle") || { move: struggleMove, weight: 0.01, reasons: ['LowProbStruggle'] };
        if (!validMoves.find(m => m.move?.name === "Struggle")) {
            validMoves.push(struggleWeightInfo);
        }
    }

    const predictability = safeGet(actor.personalityProfile, 'predictability', DEFAULT_PERSONALITY_PROFILE.predictability, actor.name, 'personalityProfile.predictability');
    const temperature = (1.0 - predictability) * 1.5 + 0.5;
    const movesWithProbs = getSoftmaxProbabilities(validMoves, temperature);
    const chosenMoveInfo = selectFromDistribution(movesWithProbs);

    const chosenMove = chosenMoveInfo?.move || struggleMove; // Ensure chosenMove is always defined

    actor.aiLog.push({
        turn: turn + 1,
        phase: currentPhase,
        intent: intent,
        prediction: prediction.predictedMove ? `${prediction.predictedMove} (Conf: ${prediction.confidence.toFixed(2)})` : 'None',
        consideredMoves: movesWithProbs.map(m => ({
            name: m.move?.name || 'N/A',
            baseW: (m.weight || 0).toFixed(3),
            prob: `${((m.probability || 0) * 100).toFixed(1)}%`,
            reasons: (m.reasons || []).join(', ')
        })).sort((a, b) => parseFloat(b.prob) - parseFloat(a.prob)),
        chosenMove: chosenMove.name,
        finalProb: `${((chosenMoveInfo?.probability || 0) * 100).toFixed(1)}%`,
        actorState: {
            hp: safeGet(actor, 'hp', 0, actor.name, 'hp'),
            energy: safeGet(actor, 'energy', 0, actor.name, 'energy'),
            momentum: safeGet(actor, 'momentum', 0, actor.name, 'momentum'),
            mental: safeGet(actor.mentalState, 'level', 'stable', actor.name, 'mentalState.level')
        }
    });

    return {
        move: chosenMove
    };
}