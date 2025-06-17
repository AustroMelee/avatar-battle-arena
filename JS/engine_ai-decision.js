// FILE: engine_ai-decision.js
'use strict';

// Version 9.0: Manipulation logic moved to its own module.

import { getAvailableMoves } from './engine_move-resolution.js';
import { moveInteractionMatrix } from './move-interaction-matrix.js';
import { getPhaseAIModifiers, BATTLE_PHASES } from './engine_battle-phase.js';
import { getEscalationAIWeights, ESCALATION_STATES } from './engine_escalation.js';
import { locationConditions } from './location-battle-conditions.js';
import { isInControl, isDesperateBroken } from './utils_condition_evaluator.js';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const DEFAULT_PERSONALITY_PROFILE = {
    aggression: 0.5, patience: 0.5, riskTolerance: 0.5, opportunism: 0.5,
    creativity: 0.5, defensiveBias: 0.5, antiRepeater: 0.5, signatureMoveBias: {},
    predictability: 0.5
};

const DEFAULT_AI_MEMORY = {
    selfMoveEffectiveness: {},
    opponentModel: { isAggressive: 0, isDefensive: 0, isTurtling: false },
    moveSuccessCooldown: {},
    opponentSequenceLog: {},
    repositionCooldown: 0
};

function safeGet(obj, path, defaultValue, actorName = 'Unknown Actor') {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    if (value === undefined || value === null) {
        return defaultValue;
    }
    return value;
}

export function adaptPersonality(actor) {
    if (!actor || !actor.moveHistory || !actor.personalityProfile || !actor.aiLog || actor.moveHistory.length < 2) {
        return;
    }

    const lastTwoResults = actor.moveHistory.slice(-2).map(move => move?.effectiveness || 'Normal');

    if (lastTwoResults.every(r => r === 'Weak')) {
        actor.personalityProfile.creativity = clamp(safeGet(actor.personalityProfile, 'creativity', 0.5, actor.name) + 0.15, 0, 1.0);
        actor.personalityProfile.riskTolerance = clamp(safeGet(actor.personalityProfile, 'riskTolerance', 0.5, actor.name) + 0.1, 0, 1.0);
        actor.aiLog.push("[Personality Drift: Increased Creativity due to failure streak]");
    } else if (lastTwoResults.every(r => r === 'Strong' || r === 'Critical')) {
        actor.personalityProfile.aggression = clamp(safeGet(actor.personalityProfile, 'aggression', 0.5, actor.name) + 0.1, 0, 1.0);
        actor.aiLog.push("[Personality Drift: Increased Aggression due to success streak]");
    }
}

export function updateAiMemory(learner, opponent) {
    if (!learner || !opponent || !learner.aiMemory || !opponent.moveHistory) {
        return;
    }
    learner.aiMemory = { ...DEFAULT_AI_MEMORY, ...learner.aiMemory };

    if (learner.lastMove?.name) {
        const { name, isRepositionMove } = learner.lastMove;
        if (!learner.aiMemory.selfMoveEffectiveness[name]) {
            learner.aiMemory.selfMoveEffectiveness[name] = { totalEffectiveness: 0, uses: 0 };
        }
        const effectivenessValue = { 'Weak': -1, 'Normal': 1, 'Strong': 2, 'Critical': 3 }[learner.lastMoveEffectiveness] || 0;
        learner.aiMemory.selfMoveEffectiveness[name].totalEffectiveness += effectivenessValue;
        learner.aiMemory.selfMoveEffectiveness[name].uses++;
        if (learner.lastMoveEffectiveness === 'Weak') learner.aiMemory.moveSuccessCooldown[name] = 2;
        if (isRepositionMove) learner.aiMemory.repositionCooldown = 2;
    }
    if (learner.aiMemory.repositionCooldown > 0) learner.aiMemory.repositionCooldown--;
    
    if (opponent.lastMove?.type) {
        const moveType = opponent.lastMove.type;
        if (moveType === 'Offense' || moveType === 'Finisher') learner.aiMemory.opponentModel.isAggressive = (learner.aiMemory.opponentModel.isAggressive || 0) + 1;
        else if (moveType === 'Defense') learner.aiMemory.opponentModel.isDefensive = (learner.aiMemory.opponentModel.isDefensive || 0) + 1;
    }
    learner.aiMemory.opponentModel.isTurtling = (opponent.consecutiveDefensiveTurns || 0) >= 2;
}

function getDynamicPersonality(actor, currentPhase) {
    if (!actor || !actor.personalityProfile) return { ...DEFAULT_PERSONALITY_PROFILE };
    let dynamicProfile = { ...DEFAULT_PERSONALITY_PROFILE, ...actor.personalityProfile };
    const phaseMods = getPhaseAIModifiers(currentPhase);
    Object.keys(phaseMods).forEach(key => {
        const traitName = key.replace('Multiplier', '');
        if (dynamicProfile[traitName] !== undefined) {
            dynamicProfile[traitName] = clamp(dynamicProfile[traitName] * phaseMods[key], 0, 1.5);
        }
    });

    const mentalStateLevel = safeGet(actor.mentalState, 'level', 'stable', actor.name);
    switch (mentalStateLevel) {
        case 'stressed':
            dynamicProfile.patience *= 0.7;
            dynamicProfile.riskTolerance = clamp(dynamicProfile.riskTolerance + 0.15, 0, 1.2);
            break;
        case 'shaken':
            dynamicProfile.patience *= 0.4;
            dynamicProfile.aggression = clamp(dynamicProfile.aggression + 0.2, 0, 1.2);
            dynamicProfile.riskTolerance = clamp(dynamicProfile.riskTolerance + 0.3, 0, 1.2);
            break;
        case 'broken':
            dynamicProfile.patience = 0.05;
            dynamicProfile.aggression = clamp(dynamicProfile.aggression + 0.4, 0, 1.3);
            dynamicProfile.riskTolerance = clamp(dynamicProfile.riskTolerance + 0.5, 0, 1.5);
            break;
    }
    return dynamicProfile;
}

function determineStrategicIntent(actor, defender, turn, currentPhase) {
    if (!actor || !defender) return 'StandardExchange';
    const profile = getDynamicPersonality(actor, currentPhase);
    const actorHp = safeGet(actor, 'hp', 100, actor.name);
    const defenderHp = safeGet(defender, 'hp', 100, defender.name);

    if (isInControl(actor, defender, { characterReceivedCriticalHit: defender.lastMove?.isCrit })) {
        if (profile.opportunism > 0.6) return 'PressAdvantage';
        if (profile.aggression > 0.8) return 'OverwhelmOffense';
    }

    if (isDesperateBroken(actor, defender, {})) {
        if (profile.riskTolerance > 0.6) return 'DesperateGambit';
        if (profile.aggression > 0.7) return 'RecklessOffense';
    }

    if (currentPhase === BATTLE_PHASES.PRE_BANTER) return 'NarrativeOnly';
    if (currentPhase === BATTLE_PHASES.POKING) return 'PokingPhaseTactics';

    const defenderEscalation = safeGet(defender, 'escalationState', ESCALATION_STATES.NORMAL, defender.name);
    if (defenderEscalation === ESCALATION_STATES.SEVERELY_INCAPACITATED || defenderEscalation === ESCALATION_STATES.TERMINAL_COLLAPSE) {
        if (profile.opportunism > 0.5 || profile.aggression > 0.7) {
            return 'FinishingBlowAttempt';
        }
    }

    const defenderIsVulnerable = safeGet(defender, 'stunDuration', 0, defender.name) > 0 || safeGet(defender, 'tacticalState.isPositive', true, defender.name) === false;
    if (profile.opportunism > 0.7 && defenderIsVulnerable) {
        return 'CapitalizeOnOpening';
    }

    if (actorHp < 45 && profile.riskTolerance > 0.7) return 'DesperateGambit';

    if (currentPhase === BATTLE_PHASES.EARLY) return 'OpeningMoves';
    if (currentPhase === BATTLE_PHASES.MID) return 'StandardExchange';
    if (currentPhase === BATTLE_PHASES.LATE) return 'FinishingBlowAttempt';

    return 'StandardExchange';
}

function calculateMoveWeights(actor, defender, conditions, intent, currentPhase) {
    const availableMoves = getAvailableMoves(actor, conditions, currentPhase);
    const profile = getDynamicPersonality(actor, currentPhase);
    
    return availableMoves.map(move => {
        if (!move || !move.name) return { move: { name: "Struggle" }, weight: 0.001, reasons: ["InvalidMove"] };

        let weight = 1.0;
        let reasons = [];

        switch (move.type) {
            case 'Offense': weight *= (1 + profile.aggression); reasons.push(`Aggro:${profile.aggression.toFixed(2)}`); break;
            case 'Defense': weight *= (1 + profile.defensiveBias); reasons.push(`Def:${profile.defensiveBias.toFixed(2)}`); break;
            case 'Utility': weight *= (1 + profile.creativity); reasons.push(`Util:${profile.creativity.toFixed(2)}`); break;
            case 'Finisher':
                weight *= (1 + profile.riskTolerance);
                const defenderHp = safeGet(defender, 'hp', 100, defender.name);
                if (currentPhase === BATTLE_PHASES.LATE || defenderHp <= 30) {
                    weight *= 2.5;
                    weight = Math.max(weight, 10.0); // Finisher floor
                    reasons.push('FinisherFocus');
                } else {
                    weight *= 0.1; // Penalize finishers early
                }
                break;
        }

        const signatureBias = safeGet(profile.signatureMoveBias, move.name, 1.0, actor.name);
        if (signatureBias !== 1.0) { weight *= signatureBias; reasons.push(`SigMove`); }
        if (actor.lastMove?.name === move.name) { weight *= (1.0 - profile.antiRepeater); reasons.push(`AntiRepeat`); }

        // Intent Multipliers
        const intentMultipliers = {
            StandardExchange: { Offense: 1.2, Finisher: 0.8 },
            OpeningMoves: { Utility: 1.3, Finisher: 0.1 },
            CautiousDefense: { Offense: 0.5, Defense: 1.8 },
            PressAdvantage: { Offense: 1.5, Finisher: 1.2 },
            CapitalizeOnOpening: { Offense: 1.8, Finisher: 1.5 },
            DesperateGambit: { Finisher: 2.0, highRisk: 2.5 },
            FinishingBlowAttempt: { Finisher: 3.5, requires_opening: 2.8 },
            ConserveEnergy: { low_cost: 3.0 },
            PokingPhaseTactics: { Utility: 2.0, Defense: 1.5, low_cost: 2.0 },
            OverwhelmOffense: { Offense: 2.0, Finisher: 1.8, aggressive: 1.5 },
            RecklessOffense: { Offense: 1.5, Finisher: 2.5, highRisk: 3.0, utility: 0.1 }
        };
        const multipliers = intentMultipliers[intent] || {};
        if (multipliers[move.type]) { weight *= multipliers[move.type]; reasons.push(`Intent:${intent}`); }
        if (multipliers.low_cost && (move.power || 50) < 30) weight *= multipliers.low_cost;
        if (move.moveTags) move.moveTags.forEach(tag => { if (multipliers[tag]) weight *= multipliers[tag]; });
        
        const escalationInfo = getEscalationAIWeights(actor, defender, move);
        if (escalationInfo.finalMultiplier !== 1.0) {
            weight *= escalationInfo.finalMultiplier;
            reasons.push(...escalationInfo.scoreBasedReasonsApplied);
        }

        return { move, weight, reasons };
    });
}

function getSoftmaxProbabilities(weightedMoves, temperature = 1.0) {
    if (!weightedMoves || weightedMoves.length === 0) return [];
    const temp = Math.max(0.01, temperature);
    const positiveMoves = weightedMoves.filter(m => m.weight > 0 && m.move);
    if (positiveMoves.length === 0) {
        const validMoves = weightedMoves.filter(m => m.move);
        return validMoves.map(m => ({ ...m, probability: 1 / validMoves.length }));
    }
    const maxWeight = Math.max(...positiveMoves.map(m => m.weight));
    let weightExpSum = 0;
    const movesWithExp = positiveMoves.map(m => {
        const expWeight = Math.exp((m.weight - maxWeight) / temp);
        weightExpSum += expWeight;
        return { ...m, expWeight };
    });
    if (weightExpSum === 0) return movesWithExp.map(m => ({ ...m, probability: 1 / movesWithExp.length }));
    return movesWithExp.map(m => ({ ...m, probability: m.expWeight / weightExpSum }));
}

export function selectFromDistribution(movesWithProbs) {
    if (!movesWithProbs || movesWithProbs.length === 0) {
        return { move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, reasons: ['EmergencyFallback'] };
    }
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const moveInfo of movesWithProbs) {
        cumulativeProbability += moveInfo.probability;
        if (rand < cumulativeProbability) return moveInfo;
    }
    return movesWithProbs[movesWithProbs.length - 1];
}

export function selectMove(actor, defender, conditions, turn, currentPhase) {
    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    if (!actor || !defender || !conditions) {
        return { move: struggleMove, aiLogEntryFromSelectMove: { intent: 'Error', chosenMove: 'Struggle' } };
    }
    
    const intent = determineStrategicIntent(actor, defender, turn, currentPhase);
    if (intent === 'NarrativeOnly') {
        return { move: null, aiLogEntryFromSelectMove: { intent, chosenMove: 'None' } };
    }
    
    let weightedMoves = calculateMoveWeights(actor, defender, conditions, intent, currentPhase);
    let validMoves = weightedMoves.filter(m => m.weight > 0 && m.move?.name !== "Struggle");

    if (validMoves.length === 0) {
        validMoves = [{ move: struggleMove, weight: 1.0, reasons: ['FallbackOnlyStruggle'] }];
    }
    
    const predictability = safeGet(actor.personalityProfile, 'predictability', 0.5, actor.name);
    const temperature = (1.0 - predictability) * 1.5 + 0.5;
    const movesWithProbs = getSoftmaxProbabilities(validMoves, temperature);
    const chosenMoveInfo = selectFromDistribution(movesWithProbs) || { move: struggleMove, probability: 1, reasons: ["DistributionFallback"] };
    
    const aiLogEntry = {
        turn: turn + 1,
        phase: currentPhase,
        intent: intent,
        chosenMove: chosenMoveInfo.move.name,
        finalProb: `${((chosenMoveInfo.probability || 0) * 100).toFixed(1)}%`,
        actorState: { hp: actor.hp, energy: actor.energy, momentum: actor.momentum, mental: actor.mentalState.level, escalation: actor.escalationState },
        opponentEscalation: defender.escalationState,
        reasons: (chosenMoveInfo.reasons || []).join(', ')
    };
    actor.aiLog.push(aiLogEntry);

    return {
        move: chosenMoveInfo.move,
        aiLogEntryFromSelectMove: aiLogEntry
    };
}