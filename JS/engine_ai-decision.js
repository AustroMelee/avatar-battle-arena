// FILE: engine_ai-decision.js
'use strict';

// Version 8.5: Escalation Tuning Pass 1.1 - AI Finisher Aggression & Narrative Flagging

import { getAvailableMoves } from './engine_move-resolution.js';
import { moveInteractionMatrix } from './move-interaction-matrix.js';
import { MAX_MOMENTUM, MIN_MOMENTUM } from './engine_momentum.js';
import { getPhaseAIModifiers } from './engine_battle-phase.js';
import { getEscalationAIWeights, ESCALATION_STATES } from './engine_escalation.js';

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

function safeGet(obj, path, defaultValue, actorName = 'Unknown Actor', propertyPathName = path) {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);

    if (value === undefined || value === null) {
        const isTacticalStateNullDefault = (propertyPathName === 'tacticalState' && defaultValue === null);
        const isMoveCooldownZeroDefault = (propertyPathName.startsWith('aiMemory.moveSuccessCooldown') && defaultValue === 0);
        const isSignatureBiasOneDefault = (propertyPathName.startsWith('profile.signatureMoveBias') && defaultValue === 1.0);

        const suppressWarningForThisDefault = isTacticalStateNullDefault || isMoveCooldownZeroDefault || isSignatureBiasOneDefault;

        if (defaultValue !== undefined) {
            if (!suppressWarningForThisDefault) {
                // console.warn(`AI Decision: Missing ${propertyPathName} for ${actorName}. Using default: ${defaultValue}.`);
            }
            return defaultValue;
        }
        console.error(`AI Decision: CRITICAL data ${propertyPathName} missing for ${actorName}. This WILL cause issues.`);
        return null;
    }
    return value;
}


export function adaptPersonality(actor) {
    if (!actor || !actor.moveHistory || !actor.personalityProfile || !actor.aiLog) {
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
        return;
    }
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
        return { ...DEFAULT_PERSONALITY_PROFILE };
    }
    const baseActorProfile = actor.personalityProfile || DEFAULT_PERSONALITY_PROFILE;
    let dynamicProfile = { ...baseActorProfile };
    const phaseMods = getPhaseAIModifiers(currentPhase);

    Object.keys(phaseMods).forEach(key => {
        const traitName = key.replace('Multiplier', '');
        if (dynamicProfile[traitName] !== undefined) {
            dynamicProfile[traitName] = clamp(dynamicProfile[traitName] * phaseMods[key], 0, 1.5);
        }
    });

    const baseAggression = baseActorProfile.aggression !== undefined ? baseActorProfile.aggression : DEFAULT_PERSONALITY_PROFILE.aggression;
    // Removed the AI log push from here as it was very spammy; AI log now in selectMove
    // actor.aiLog.push(`[Phase Influence (${currentPhase})]: Base Aggro: ${baseAggression.toFixed(2)}, Phase Modded Aggro: ${(dynamicProfile.aggression || baseAggression).toFixed(2)}`);


    if (actor.relationalState?.emotionalModifiers) {
        Object.keys(actor.relationalState.emotionalModifiers).forEach(key => {
            const value = actor.relationalState.emotionalModifiers[key];
            if (typeof value !== 'number') return;

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
        return 'StandardExchange';
    }
    const profile = getDynamicPersonality(actor, currentPhase);
    const actorHp = safeGet(actor, 'hp', 100, actor.name, 'hp');
    const defenderHp = safeGet(defender, 'hp', 100, defender.name, 'hp');
    const healthDiff = actorHp - defenderHp;

    const defenderEscalationState = safeGet(defender, 'escalationState', ESCALATION_STATES.NORMAL, defender.name, 'escalationState');
    // TUNING: Increased opportunism threshold and added check for actor's aggression for finisher attempt
    if (defenderEscalationState === ESCALATION_STATES.SEVERELY_INCAPACITATED || defenderEscalationState === ESCALATION_STATES.TERMINAL_COLLAPSE) {
        if (profile.opportunism > 0.5 || profile.aggression > 0.7) { // Lowered opportunism, added aggression check
             actor.aiLog.push(`[Intent Decided]: FinishingBlowAttempt due to Opponent Escalation (${defenderEscalationState}) and Actor Opportunism/Aggression.`);
            return 'FinishingBlowAttempt';
        }
    }

    if (currentPhase === 'Early' && profile.patience > 0.7 && turn < 2) {
        actor.aiLog.push(`[Intent Decided]: OpeningMoves due to Early Phase, High Patience, Low Turn.`);
        return 'OpeningMoves';
    }
    if (currentPhase === 'Late' && actorHp < 30 && profile.riskTolerance > 0.6) { // Slightly lowered risk tolerance for late game gambit
        actor.aiLog.push(`[Intent Decided]: DesperateGambit due to Late Phase, Low HP, High Risk Tolerance.`);
        return 'DesperateGambit';
    }
    // TUNING: Make FinishingBlowAttempt more likely even if defender HP is not extremely low, if they are in high escalation
    if (currentPhase === 'Late' && (defenderHp < 30 || defenderEscalationState === ESCALATION_STATES.SEVERELY_INCAPACITATED) && profile.opportunism > 0.7) {
        actor.aiLog.push(`[Intent Decided]: FinishingBlowAttempt due to Late Phase, Opponent Low HP/High Escalation, High Opportunism.`);
        return 'FinishingBlowAttempt';
    }


    const defenderIsStunned = safeGet(defender, 'stunDuration', 0, defender.name, 'stunDuration') > 0;
    const defenderTacticalState = safeGet(defender, 'tacticalState', null, defender.name, 'tacticalState');
    if (profile.opportunism > 0.7 && (defenderIsStunned || (defenderTacticalState && !defenderTacticalState.isPositive))) { // Ensure tactical state is negative for opponent
        actor.aiLog.push(`[Intent Decided]: CapitalizeOnOpening due to Opponent Stun/Negative Tactical State, High Opportunism.`);
        return 'CapitalizeOnOpening';
    }


    if (profile.riskTolerance > 0.7 && actorHp < 45) { // Increased HP threshold for Desperate Gambit
        actor.aiLog.push(`[Intent Decided]: DesperateGambit due to Actor Low HP, High Risk Tolerance.`);
        return 'DesperateGambit';
    }
    if (profile.patience > 0.8 && turn < 2 && currentPhase !== 'Late') {
        actor.aiLog.push(`[Intent Decided]: CautiousDefense due to High Patience, Early Turn.`);
        return 'CautiousDefense';
    }
    if (profile.aggression > 0.8 && healthDiff > 15) { // Lowered health diff for Press Advantage
        actor.aiLog.push(`[Intent Decided]: PressAdvantage due to High Aggression, Health Lead.`);
        return 'PressAdvantage';
    }


    const actorMentalStateLevel = safeGet(actor.mentalState, 'level', 'stable', actor.name, 'mentalState.level');
    if (actorMentalStateLevel === 'broken') {
        actor.aiLog.push(`[Intent Decided]: UnfocusedRage due to Broken Mental State.`);
        return 'UnfocusedRage';
    }
    if (actorMentalStateLevel === 'shaken') {
        actor.aiLog.push(`[Intent Decided]: PanickedDefense due to Shaken Mental State.`);
        return 'PanickedDefense';
    }

    const opponentIsTurtling = safeGet(actor.aiMemory?.opponentModel, 'isTurtling', false, actor.name, 'aiMemory.opponentModel.isTurtling');
    if (opponentIsTurtling && profile.patience < 0.4) { // Only if actor is not patient
        actor.aiLog.push(`[Intent Decided]: BreakTheTurtle due to Opponent Turtling, Low Patience.`);
        return 'BreakTheTurtle';
    }


    const actorEnergy = safeGet(actor, 'energy', 100, actor.name, 'energy');
    if (actorEnergy < 25) { // Lowered energy threshold
        actor.aiLog.push(`[Intent Decided]: ConserveEnergy due to Low Energy.`);
        return 'ConserveEnergy';
    }


    if (turn < 2 && currentPhase === 'Early') {
        actor.aiLog.push(`[Intent Decided]: OpeningMoves (Default Early Phase).`);
        return 'OpeningMoves';
    }
    actor.aiLog.push(`[Intent Decided]: StandardExchange (Default).`);
    return 'StandardExchange';
}

function calculateMoveWeights(actor, defender, conditions, intent, prediction, currentPhase) {
    if (!actor || !defender || !conditions) {
        return [{ move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, weight: 1.0, reasons: ["ErrorInCalculateMoveWeights"] }];
    }

    const availableMoves = getAvailableMoves(actor, conditions);
    const profile = getDynamicPersonality(actor, currentPhase);

    const actorMomentum = safeGet(actor, 'momentum', 0, actor.name, 'momentum');
    const momentumInfluence = actorMomentum / (MAX_MOMENTUM - MIN_MOMENTUM) * 2;
    // Momentum influence already baked into dynamic profile from getDynamicPersonality if needed,
    // but direct application here could be re-evaluated if further emphasis is desired.
    // For now, dynamic profile handles momentum's effect on personality traits.

    return availableMoves.map(move => {
        if (!move || !move.name || !move.type || !move.moveTags) {
            return { move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, weight: 0.001, reasons: ["InvalidMoveObjectEncountered"] };
        }
        let weight = 1.0;
        let reasons = [];
        let isEscalationFinisherAttempt = false; // For narrative flag

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
                else if (currentPhase === 'Late' || defenderHp <= 30) weight *= 2.5; // Increased bias late or low HP
                break;
            default:
                break;
        }

        if (move.isRepositionMove) {
            const actorMobility = safeGet(actor, 'mobility', 0.5, actor.name, 'mobility');
            weight *= (1 + actorMobility * 2.0); reasons.push(`Mobility:${actorMobility.toFixed(2)}`);
            const actorTacticalStateName = actor.tacticalState?.name;
            if (actorTacticalStateName === 'Exposed' || actorTacticalStateName === 'Off-Balance') {
                weight *= 3.0; reasons.push('SelfVulnerable');
            }
            if (safeGet(defender, 'stunDuration', 0, defender.name, 'stunDuration') > 0 || safeGet(defender, 'tacticalState', null, defender.name, 'tacticalState')) {
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

        const signatureBias = safeGet(profile.signatureMoveBias, move.name, 1.0, actor.name, `profile.signatureMoveBias.${move.name}`);
        if (signatureBias !== 1.0) { weight *= signatureBias; reasons.push(`SigMove`); }

        if (actor.lastMove?.name === move.name) { weight *= (1.0 - profile.antiRepeater); reasons.push(`AntiRepeat`); }
        if (move.moveTags?.includes('counter') && profile.opportunism > 0.7) { weight *= (1.0 + profile.opportunism); reasons.push('CounterTag'); }
        if (move.moveTags?.includes('evasive') && profile.patience > 0.6) { weight *= (1.0 + profile.patience); reasons.push('EvasiveTag'); }
        if (move.moveTags?.includes('highRisk') && profile.riskTolerance > 0.5) { weight *= (1.0 + profile.riskTolerance * 1.2); reasons.push('HighRiskTag'); }

        const intentMultipliers = {
            StandardExchange: { Offense: 1.2, Defense: 1.0, Utility: 1.0, Finisher: 0.8 },
            OpeningMoves: { Offense: 0.8, Defense: 1.2, Utility: 1.3, Finisher: 0.1, low_cost: 1.5, evasive: 1.3 },
            CautiousDefense: { Offense: 0.5, Defense: 1.8, Utility: 1.2, Finisher: 0.05, utility_block: 2.0 },
            PressAdvantage: { Offense: 1.5, Defense: 0.6, Utility: 0.9, Finisher: 1.2, precise: 1.4, area_of_effect: 1.3 },
            CapitalizeOnOpening: { Offense: 1.8, Defense: 0.3, Utility: 1.0, Finisher: 1.5, single_target: 1.6, unblockable: 2.0 },
            DesperateGambit: { Offense: 1.2, Defense: 0.4, Utility: 0.7, Finisher: 2.0, highRisk: 2.5, unblockable: 2.2 },
            FinishingBlowAttempt: { Offense: 0.5, Defense: 0.1, Utility: 0.2, Finisher: 3.5, requires_opening: 2.8, unblockable: 3.0 }, // TUNED: Increased Finisher bias
            UnfocusedRage: { Offense: 1.6, Defense: 0.2, Utility: 0.3, Finisher: 1.0, area_of_effect_large: 1.5, highRisk: 1.8 },
            PanickedDefense: { Offense: 0.3, Defense: 2.5, Utility: 1.5, Finisher: 0.01, defensive_stance: 2.5, evasive: 2.0 },
            BreakTheTurtle: { Offense: 1.4, Defense: 0.7, Utility: 1.1, Finisher: 0.9, environmental_manipulation: 1.8, unblockable_ground: 2.0, bypasses_defense: 1.9 },
            ConserveEnergy: { Offense: 0.7, Defense: 1.1, Utility: 1.4, Finisher: 0.2, low_cost: 3.0, utility_reposition: 1.5 }
        };
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
        if (moveCooldown > 0) {
             weight *= 0.01;
             reasons.push('MoveCooldown');
        }
        if (move.moveTags?.includes('requires_opening') && !(safeGet(defender, 'stunDuration', 0, defender.name, 'stunDuration') > 0 || safeGet(defender, 'tacticalState', null, defender.name, 'tacticalState'))) weight *= 0.01;

        const escalationWeightMultiplier = getEscalationAIWeights(actor, defender, move);
        if (escalationWeightMultiplier !== 1.0) {
            weight *= escalationWeightMultiplier;
            reasons.push(`EscalationBias(x${escalationWeightMultiplier.toFixed(1)})`);
            if (move.type === 'Finisher' && (defender.escalationState === ESCALATION_STATES.SEVERELY_INCAPACITATED || defender.escalationState === ESCALATION_STATES.TERMINAL_COLLAPSE)) {
                isEscalationFinisherAttempt = true; // Flag for narrative
            }
        }

        if (weight < 0.05 && move.name !== "Struggle") return { move, weight: 0, reasons, isEscalationFinisherAttempt }; // Pass flag
        return { move, weight, reasons, isEscalationFinisherAttempt }; // Pass flag
    });
}

function getSoftmaxProbabilities(weightedMoves, temperature = 1.0) {
    if (!weightedMoves || weightedMoves.length === 0) {
        return [];
    }
    const temp = Math.max(0.01, temperature);

    const positiveWeightMoves = weightedMoves.filter(m => m.weight > 0);
    const targetMovesForExp = positiveWeightMoves.length > 0 ? positiveWeightMoves : weightedMoves.filter(m => m.move);

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
        const numMoves = movesWithExp.length;
        return movesWithExp.map(m => ({ ...m, probability: numMoves > 0 ? 1 / numMoves : 0 }));
    }


    return movesWithExp.map(m => ({ ...m, probability: m.expWeight / weightExpSum }));
}


function selectFromDistribution(movesWithProbs) {
    if (!movesWithProbs || movesWithProbs.length === 0) {
        return { move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, weight: 1, probability: 1, reasons: ['EmergencyFallbackNoProbs'], isEscalationFinisherAttempt: false };
    }
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const moveInfo of movesWithProbs) {
        if (typeof moveInfo.probability !== 'number' || isNaN(moveInfo.probability)) {
            continue;
        }
        cumulativeProbability += moveInfo.probability;
        if (rand < cumulativeProbability) return moveInfo;
    }
    return movesWithProbs[movesWithProbs.length - 1] || { move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, weight: 1, probability: 1, reasons: ['EmergencyFallbackDistributionEnd'], isEscalationFinisherAttempt: false };
}


export function selectMove(actor, defender, conditions, turn, currentPhase) {
    if (!actor || !defender || !conditions || !actor.aiLog) {
        return { move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, aiLogEntry: { intent: 'Error', chosenMove: 'Struggle'} };
    }
    actor.personalityProfile = actor.personalityProfile || { ...DEFAULT_PERSONALITY_PROFILE };
    actor.aiMemory = actor.aiMemory || { ...DEFAULT_AI_MEMORY };


    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    const intent = determineStrategicIntent(actor, defender, turn, currentPhase);
    const prediction = predictOpponentNextMove(actor, defender);
    let weightedMoves = calculateMoveWeights(actor, defender, conditions, intent, prediction, currentPhase);

    let validMoves = weightedMoves.filter(m => m.move && m.weight > 0 && m.move.name !== "Struggle");

    if (validMoves.length === 0) {
        validMoves = [{ move: struggleMove, weight: 1.0, reasons: ['FallbackOnlyStruggle'], isEscalationFinisherAttempt: false }];
    } else {
        const struggleWeightInfo = weightedMoves.find(m => m.move?.name === "Struggle");
        if (!struggleWeightInfo) {
            validMoves.push({ move: struggleMove, weight: 0.01, reasons: ['LowProbStruggleDefault'], isEscalationFinisherAttempt: false });
        } else if (!validMoves.find(m => m.move?.name === "Struggle")){
             validMoves.push({...struggleWeightInfo, weight: Math.max(0.01, struggleWeightInfo.weight) });
        }
    }

    const predictability = safeGet(actor.personalityProfile, 'predictability', DEFAULT_PERSONALITY_PROFILE.predictability, actor.name, 'personalityProfile.predictability');
    const temperature = (1.0 - predictability) * 1.5 + 0.5;
    const movesWithProbs = getSoftmaxProbabilities(validMoves, temperature);
    const chosenMoveInfo = selectFromDistribution(movesWithProbs);

    const chosenMove = chosenMoveInfo?.move || struggleMove;
    const isEscalationFinisher = chosenMoveInfo?.isEscalationFinisherAttempt || false;


    const aiLogEntry = {
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
            mental: safeGet(actor.mentalState, 'level', 'stable', actor.name, 'mentalState.level'),
            escalation: safeGet(actor, 'escalationState', ESCALATION_STATES.NORMAL, actor.name, 'escalationState')
        },
        opponentEscalation: safeGet(defender, 'escalationState', ESCALATION_STATES.NORMAL, defender.name, 'escalationState'),
        isEscalationFinisherAttempt: isEscalationFinisher // Store this flag
    };
    actor.aiLog.push(aiLogEntry);


    return {
        move: chosenMove,
        aiLogEntryFromSelectMove: aiLogEntry // Pass the whole entry for narrative engine
    };
}