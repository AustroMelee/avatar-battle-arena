// FILE: engine_ai-decision.js
'use strict';

// Version 8.7: Lightning Redirection AI Awareness & Enhanced Logging

import { getAvailableMoves } from './engine_move-resolution.js';
import { moveInteractionMatrix } from './move-interaction-matrix.js';
import { MAX_MOMENTUM, MIN_MOMENTUM } from './engine_momentum.js';
import { getPhaseAIModifiers, BATTLE_PHASES } from './engine_battle-phase.js'; // CORRECTED LINE & ADDED BATTLE_PHASES
import { getEscalationAIWeights, ESCALATION_STATES } from './engine_escalation.js';
import { locationConditions } from './location-battle-conditions.js'; // NEW: Import locationConditions

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
    
    // --- Phase-specific Intent Priorities ---
    if (currentPhase === BATTLE_PHASES.PRE_BANTER) {
        actor.aiLog.push(`[Intent Decided]: NarrativeOnly due to ${BATTLE_PHASES.PRE_BANTER} Phase.`);
        return 'NarrativeOnly'; // Purely narrative, no combat actions
    }
    if (currentPhase === BATTLE_PHASES.POKING) {
        // Poking Phase: Encourage low-risk, probing moves, repositioning
        if (actor.aiMemory.repositionCooldown === 0 && actor.mobility > 0.4 && Math.random() < 0.7) {
             actor.aiLog.push(`[Intent Decided]: OpeningMoves (Poking Phase Reposition)`);
             return 'OpeningMoves'; // Prioritize repositioning
        }
        if (profile.patience > 0.6 || actor.energy > 70) { // Cautious probing if patient or high energy
             actor.aiLog.push(`[Intent Decided]: CautiousDefense (Poking Phase)`);
             return 'CautiousDefense';
        }
        actor.aiLog.push(`[Intent Decided]: PokingPhaseTactics (Default Poking)`);
        return 'PokingPhaseTactics'; // General probing
    }
    
    // --- Core Intent Logic (Prioritized by specific situations) ---
    if (defenderEscalationState === ESCALATION_STATES.SEVERELY_INCAPACITATED || defenderEscalationState === ESCALATION_STATES.TERMINAL_COLLAPSE) {
        if (profile.opportunism > 0.5 || profile.aggression > 0.7) {
            actor.aiLog.push(`[Intent Decided]: FinishingBlowAttempt due to Opponent Escalation (${defenderEscalationState}) and Actor Opportunism/Aggression.`);
            return 'FinishingBlowAttempt';
        }
    }

    const defenderIsStunned = safeGet(defender, 'stunDuration', 0, defender.name, 'stunDuration') > 0;
    const defenderTacticalState = safeGet(defender, 'tacticalState', null, defender.name, 'tacticalState');
    if (profile.opportunism > 0.7 && (defenderIsStunned || (defenderTacticalState && !defenderTacticalState.isPositive))) {
        actor.aiLog.push(`[Intent Decided]: CapitalizeOnOpening due to Opponent Stun/Negative Tactical State, High Opportunism.`);
        return 'CapitalizeOnOpening';
    }

    if (actorHp < 45 && profile.riskTolerance > 0.7) {
        actor.aiLog.push(`[Intent Decided]: DesperateGambit due to Actor Low HP, High Risk Tolerance.`);
        return 'DesperateGambit';
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
    if (opponentIsTurtling && profile.patience < 0.4) {
        actor.aiLog.push(`[Intent Decided]: BreakTheTurtle due to Opponent Turtling, Low Patience.`);
        return 'BreakTheTurtle';
    }

    const actorEnergy = safeGet(actor, 'energy', 100, actor.name, 'energy');
    if (actorEnergy < 25) {
        actor.aiLog.push(`[Intent Decided]: ConserveEnergy due to Low Energy.`);
        return 'ConserveEnergy';
    }
    
    // --- REVISED: Defaulting Logic based on Phase (⚠️ SAFER FALLBACK) ---
    if (currentPhase === BATTLE_PHASES.EARLY) {
         if (profile.patience > 0.8 && turn < 2) { // Allow for a very cautious start
             actor.aiLog.push(`[Intent Decided]: CautiousDefense (Default Early Phase Cautious).`);
             return 'CautiousDefense';
         }
         actor.aiLog.push(`[Intent Decided]: OpeningMoves (Default Early Phase Aggro).`);
         return 'OpeningMoves';
    }
    if (currentPhase === BATTLE_PHASES.MID) {
         if (profile.aggression > 0.8 && healthDiff > 15) {
            actor.aiLog.push(`[Intent Decided]: PressAdvantage (Default Mid Phase Aggro).`);
            return 'PressAdvantage';
         }
         actor.aiLog.push(`[Intent Decided]: StandardExchange (Default Mid Phase).`);
         return 'StandardExchange';
    }
    if (currentPhase === BATTLE_PHASES.LATE) {
         // Even in late, if not in a finishing blow scenario, try to press or fall back to standard
         if (profile.aggression > 0.7 && healthDiff > 0) {
             actor.aiLog.push(`[Intent Decided]: PressAdvantage (Default Late Phase Aggro).`);
             return 'PressAdvantage';
         }
         actor.aiLog.push(`[Intent Decided]: FinishingBlowAttempt (Default Late Phase).`); // Push towards finisher
         return 'FinishingBlowAttempt';
    }
    
    // Should theoretically not be reached if phase logic is complete, but as ultimate fallback
    actor.aiLog.push(`[Intent Decided]: StandardExchange (Ultimate Fallback).`);
    return 'StandardExchange';
}

function calculateMoveWeights(actor, defender, conditions, intent, prediction, currentPhase) { // Added currentPhase
    if (!actor || !defender || !conditions) {
        return [{ move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, weight: 1.0, reasons: ["ErrorInCalculateMoveWeights"] }];
    }

    // NEW: Pass currentPhase to getAvailableMoves
    const availableMoves = getAvailableMoves(actor, conditions, currentPhase);
    const profile = getDynamicPersonality(actor, currentPhase);

    const actorMomentum = safeGet(actor, 'momentum', 0, actor.name, 'momentum');

    const locationData = locationConditions[conditions.id];
    const environmentDamageLevel = conditions.environmentState?.damageLevel || 0;

    return availableMoves.map(move => {
        if (!move || !move.name || !move.type || !move.moveTags) {
            return { move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, weight: 0.001, reasons: ["InvalidMoveObjectEncountered"] };
        }
        let weight = 1.0;
        let reasons = [];
        let isEscalationFinisherAttempt = false;

        switch (move.type) {
            case 'Offense': weight *= (1 + profile.aggression * 1.5); reasons.push(`Aggro:${profile.aggression.toFixed(2)}`); break;
            case 'Defense': weight *= (1 + profile.defensiveBias * 1.5 + profile.patience); reasons.push(`Def:${profile.defensiveBias.toFixed(2)}`); break;
            case 'Utility': weight *= (1 + profile.creativity * 0.8 + profile.opportunism * 0.5); reasons.push(`Util:${profile.creativity.toFixed(2)}`); break;
            case 'Finisher':
                weight *= (1 + profile.riskTolerance * 2.0);
                reasons.push(`Risk:${profile.riskTolerance.toFixed(2)}`);
                const defenderHp = safeGet(defender, 'hp', 100, defender.name, 'hp');
                if (currentPhase === BATTLE_PHASES.EARLY) weight *= 0.05; // Finisher penalty in Early phase
                else if (currentPhase === BATTLE_PHASES.POKING) weight *= 0.001; // Effectively disable in Poking
                else if (currentPhase === BATTLE_PHASES.MID && defenderHp > 50) weight *= 0.3;
                else if (currentPhase === BATTLE_PHASES.LATE || defenderHp <= 30) weight *= 2.5;
                break;
            default:
                break;
        }

        // Lightning Redirection AI Logic
        if (move.moveTags.includes('lightning_attack') && defender.id === 'zuko' && defender.specialTraits?.canRedirectLightning) {
            let lightningRiskModifier = 1.0;
            const zukoHp = safeGet(defender, 'hp', 100, defender.name, 'hp');
            const zukoMentalState = safeGet(defender.mentalState, 'level', 'stable', defender.name, 'mentalState.level');
            let riskReason = "LightningVsZuko:";

            if (zukoHp > 60 && (zukoMentalState === 'stable' || zukoMentalState === 'stressed')) {
                lightningRiskModifier = 0.2; // High risk for Azula/Ozai
                riskReason += "HighRisk(ZukoHealthyStable)";
            } else if (zukoHp > 30 && (zukoMentalState === 'stable' || zukoMentalState === 'stressed')) {
                lightningRiskModifier = 0.5; // Medium risk
                riskReason += "MedRisk(ZukoDamagedStable)";
            } else if (zukoHp <= 30 || zukoMentalState === 'shaken' || zukoMentalState === 'broken') {
                lightningRiskModifier = 1.5; // Lower risk for Azula/Ozai (higher chance Zuko fails redirect)
                riskReason += "LowRisk(ZukoWeakUnstable)";
            }
            weight *= lightningRiskModifier;
            reasons.push(riskReason);
            actor.aiLog.push(`[Lightning AI]: Considering ${move.name} vs Zuko. HP:${zukoHp}, Mental:${zukoMentalState}. RiskMod: ${lightningRiskModifier.toFixed(2)}.`);
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

        // Environmental adaptation for AI move selection (based on your notes)
        if (locationData) {
            // High agility characters in vertical/cramped environments -> favor mobility/evasive moves
            if (actor.mobility > 0.7 && (locationData.isVertical || locationData.isCramped)) {
                if (move.moveTags.includes('mobility_move') || move.moveTags.includes('evasive')) {
                    weight *= 1.5; reasons.push('EnvBuff_Mobility');
                }
            }
            // Ranged attack penalty in dense/cover_rich environments
            if ((locationData.isDense || locationData.hasCover) && move.moveTags.includes('ranged_attack')) {
                weight *= 0.7; reasons.push('EnvPenalty_Ranged');
            }

            // Collateral Tolerance influence for destructive moves
            // NEW: Conditional override for Eastern Air Temple specifically for Bumi, Toph, Zuko, Jeong Jeong
            let effectiveCollateralTolerance = actor.collateralTolerance !== undefined ? actor.collateralTolerance : 0.5;
            const sacredTempleFighters = ['bumi', 'toph-beifong', 'zuko', 'jeong-jeong'];

            if (conditions.id === 'eastern-air-temple' && sacredTempleFighters.includes(actor.id)) {
                // For these specific characters, their collateral tolerance is effectively very low AT THIS LOCATION
                effectiveCollateralTolerance = 0.05; // Treat as extremely sensitive to collateral
                actor.aiLog.push(`[Collateral AI]: ${actor.name} treating EAT as sacred. Effective Collateral Tolerance: ${effectiveCollateralTolerance.toFixed(2)}.`);
            }


            if ((move.type === 'Offense' || move.type === 'Finisher') &&
                (move.collateralImpact === 'medium' || move.collateralImpact === 'high' || move.collateralImpact === 'catastrophic')) {

                let collateralBias = 1.0;
                let collateralReason = 'CollateralBias:';

                if (effectiveCollateralTolerance < 0.4) { // Low tolerance (or overridden to be low for EAT)
                    if (environmentDamageLevel < 30) { // Early game, not much damage yet
                        collateralBias = 0.3; // Significantly reduce likelihood of high-collateral moves
                        collateralReason += "LowTolerance_LowDamage(x0.3)";
                    } else if (environmentDamageLevel < 70) { // Mid-game, some damage
                        collateralBias = 0.6; // Moderately reduce
                        collateralReason += "LowTolerance_MidDamage(x0.6)";
                    } else { // High damage already, might use as desperate measure or just accept.
                        collateralBias = 0.9;
                        collateralReason += "LowTolerance_HighDamage(x0.9)";
                    }
                } else if (effectiveCollateralTolerance > 0.7) { // High tolerance (e.g., Azula, Ozai)
                    collateralBias = 1.2; // Slightly increase likelihood
                    collateralReason += "HighTolerance(x1.2)";
                }
                weight *= collateralBias;
                reasons.push(collateralReason);
            }
        }

        const signatureBias = safeGet(profile.signatureMoveBias, move.name, 1.0, actor.name, `profile.signatureMoveBias.${move.name}`);
        if (signatureBias !== 1.0) { weight *= signatureBias; reasons.push(`SigMove`); }

        if (actor.lastMove?.name === move.name) { weight *= (1.0 - profile.antiRepeater); reasons.push(`AntiRepeat`); }
        if (move.moveTags?.includes('counter') && profile.opportunism > 0.7) { weight *= (1.0 + profile.opportunism); reasons.push('CounterTag'); }
        if (move.moveTags?.includes('evasive') && profile.patience > 0.6) { weight *= (1.0 + profile.patience); reasons.push('EvasiveTag'); }
        if (move.moveTags?.includes('highRisk') && profile.riskTolerance > 0.5) { weight *= (1.0 + profile.riskTolerance * 1.2); reasons.push('HighRiskTag'); }

        // NEW: Update intentMultipliers to include new phase intents
        const intentMultipliers = {
            StandardExchange: { Offense: 1.2, Defense: 1.0, Utility: 1.0, Finisher: 0.8 },
            OpeningMoves: { Offense: 0.8, Defense: 1.2, Utility: 1.3, Finisher: 0.1, low_cost: 1.5, evasive: 1.3 },
            CautiousDefense: { Offense: 0.5, Defense: 1.8, Utility: 1.2, Finisher: 0.05, utility_block: 2.0 },
            PressAdvantage: { Offense: 1.5, Defense: 0.6, Utility: 0.9, Finisher: 1.2, precise: 1.4, area_of_effect: 1.3 },
            CapitalizeOnOpening: { Offense: 1.8, Defense: 0.3, Utility: 1.0, Finisher: 1.5, single_target: 1.6, unblockable: 2.0 },
            DesperateGambit: { Offense: 1.2, Defense: 0.4, Utility: 0.7, Finisher: 2.0, highRisk: 2.5, unblockable: 2.2 },
            FinishingBlowAttempt: { Offense: 0.5, Defense: 0.1, Utility: 0.2, Finisher: 3.5, requires_opening: 2.8, unblockable: 3.0 },
            UnfocusedRage: { Offense: 1.6, Defense: 0.2, Utility: 0.3, Finisher: 1.0, area_of_effect_large: 1.5, highRisk: 1.8 },
            PanickedDefense: { Offense: 0.3, Defense: 2.5, Utility: 1.5, Finisher: 0.01, defensive_stance: 2.5, evasive: 2.0 },
            BreakTheTurtle: { Offense: 1.4, Defense: 0.7, Utility: 1.1, Finisher: 0.9, environmental_manipulation: 1.8, unblockable_ground: 2.0, bypasses_defense: 1.9 },
            ConserveEnergy: { Offense: 0.7, Defense: 1.1, Utility: 1.4, Finisher: 0.2, low_cost: 3.0, utility_reposition: 1.5 },
            // --- NEW Phase-Specific Intents ---
            NarrativeOnly: { Offense: 0.001, Defense: 0.001, Utility: 0.001, Finisher: 0.001 }, // Effectively disable combat moves
            PokingPhaseTactics: { Offense: 0.7, Defense: 1.5, Utility: 2.0, Finisher: 0.01, low_cost: 2.0, evasive: 1.8, utility_control: 1.5, ranged_attack: 1.0 } // Favor probing attacks, defensive, utility
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

        const escalationInfo = getEscalationAIWeights(actor, defender, move);
        const escalationWeightMultiplier = escalationInfo.finalMultiplier;

        if (escalationInfo.scoreBasedReasonsApplied && escalationInfo.scoreBasedReasonsApplied.length > 0) {
            reasons.push(...escalationInfo.scoreBasedReasonsApplied);
        }
        if (escalationWeightMultiplier !== 1.0 && (!escalationInfo.scoreBasedReasonsApplied || escalationInfo.scoreBasedReasonsApplied.length === 0)) {
            reasons.push(`EscalationBias(x${escalationWeightMultiplier.toFixed(1)})`);
        }

        weight *= escalationWeightMultiplier;

        if (move.type === 'Finisher' && (defender.escalationState === ESCALATION_STATES.SEVERELY_INCAPACITATED || defender.escalationState === ESCALATION_STATES.TERMINAL_COLLAPSE)) {
            isEscalationFinisherAttempt = true;
        }

        if (weight < 0.05 && move.name !== "Struggle") return { move, weight: 0, reasons, isEscalationFinisherAttempt };
        return { move, weight, reasons, isEscalationFinisherAttempt };
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


export function selectFromDistribution(movesWithProbs) {
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


export function selectMove(actor, defender, conditions, turn, currentPhase) { // Added currentPhase
    if (!actor || !defender || !conditions || !actor.aiLog) {
        return { move: { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }, aiLogEntry: { intent: 'Error', chosenMove: 'Struggle'} };
    }
    actor.personalityProfile = actor.personalityProfile || { ...DEFAULT_PERSONALITY_PROFILE };
    actor.aiMemory = actor.aiMemory || { ...DEFAULT_AI_MEMORY };


    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    const intent = determineStrategicIntent(actor, defender, turn, currentPhase);
    
    // NEW: Handle the NarrativeOnly intent
    if (intent === 'NarrativeOnly') {
         // No actual move is selected, this turn is for narrative only.
         // Return a null move and log that it's a narrative turn.
         return { move: null, aiLogEntryFromSelectMove: { turn: turn + 1, phase: currentPhase, intent, chosenMove: 'None (Narrative Turn)', actorState: { /* ... */ }, opponentEscalation: defender.escalationState } };
    }

    const prediction = predictOpponentNextMove(actor, defender);
    let weightedMoves = calculateMoveWeights(actor, defender, conditions, intent, prediction, currentPhase); // Pass currentPhase

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
        isEscalationFinisherAttempt: isEscalationFinisher
    };
    actor.aiLog.push(aiLogEntry);


    return {
        move: chosenMove,
        aiLogEntryFromSelectMove: aiLogEntry
    };
}