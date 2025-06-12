// FILE: engine/ai-decision.js
'use strict';

// This is the "AI Brain" module. It is solely responsible for a character's
// decision-making process. It evaluates the situation, applies personality
// traits, and selects the most appropriate move.

import { getAvailableMoves } from './move-resolution.js';

// --- HELPER FUNCTIONS ---
const getRandomElement = (arr, fallback = null) => arr?.[Math.floor(Math.random() * arr.length)] || fallback;
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

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

export function selectMove(actor, defender, conditions) {
    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    const availableMoves = getAvailableMoves(actor, conditions);
    
    const profile = getDynamicPersonality(actor);
    const energyPercent = (actor.energy / 100);
    let staminaState = energyPercent > 0.65 ? 'fresh' : (energyPercent > 0.3 ? 'winded' : 'exhausted');

    let opportunismBonus = 1.0;
    if (defender.isStunned) opportunismBonus += profile.opportunism * 1.0;
    else if (defender.momentum <= -3) opportunismBonus += profile.opportunism * 0.7;
    else if (defender.lastMoveEffectiveness === 'Weak') opportunismBonus += profile.opportunism * 0.4;
    else if (defender.tacticalState) opportunismBonus += profile.opportunism * 0.8 * defender.tacticalState.intensity;

    let weightedMoves = availableMoves.map(move => {
        let weight = 1.0;
        const energyCost = Math.round((move.power || 0) * 0.22) + 4;
        if (actor.energy < energyCost) return { move, weight: 0 };
        
        switch (move.type) {
            case 'Offense': weight *= (1 + profile.aggression * 0.5) * opportunismBonus; break;
            case 'Defense': weight *= 1 + (1 - profile.aggression) * 0.5; break;
            case 'Utility': weight *= 1 + profile.patience * 0.3; break;
            case 'Finisher': weight *= (1 + profile.riskTolerance * 0.5) * opportunismBonus; break;
        }

        if (defender.tacticalState && move.setup) {
            weight *= 0.05;
        } else if (!defender.tacticalState && !defender.isStunned && move.setup) {
            weight *= (15.0 * move.setup.intensity);
        }

        if (staminaState === 'winded' && energyCost > 30) weight *= 0.6;
        if (staminaState === 'exhausted' && energyCost > 20) weight *= 0.3;
        if (staminaState !== 'fresh' && energyCost < 22) weight *= 1.3;

        if (actor.moveHistory.slice(-2).some(m => m.name === move.name)) weight *= 0.25;
        if (actor.moveFailureHistory.includes(move.name)) weight *= 0.1;
        
        if (move.moveTags?.includes('requires_opening')) {
            const openingExists = (defender.isStunned || defender.tacticalState);
            if(openingExists) {
                const intensity = defender.tacticalState?.intensity || 1.2;
                weight *= (25.0 * intensity);
            } else {
                 weight *= (profile.riskTolerance * 0.05);
            }
        }
        
        if (actor.personalityProfile.aggression > 0.9 && (actor.momentum >= 3 || defender.hp < 40)) {
            if (move.type === 'Offense') weight *= 3.0;
        }
        if (actor.id === 'azula' && defender.id === 'ozai-not-comet-enhanced' && defender.mentalState.level !== 'stable') {
             if (move.type === 'Finisher' || (move.type === 'Offense' && move.power > 65)) {
                weight *= 5.0;
             }
        }
        
        if (actor.mentalState.level === 'broken') {
             if (move.type === 'Utility' || move.type === 'Defense') weight *= 0.05;
             if (move.type === 'Finisher') weight *= 0.2;
        }

        return { move, weight, originalMove: move };
    });

    weightedMoves.push({move: struggleMove, weight: 0.1, originalMove: struggleMove});
    const validMoves = weightedMoves.filter(m => m.weight > 0);
    
    if (validMoves.length === 0) {
        return { move: struggleMove, aiLogEntry: `Selected 'Struggle' (no valid moves)` };
    }

    const sortedMoves = validMoves.sort((a,b) => b.weight - a.weight);
    const topMove = sortedMoves[0];

    const candidateThreshold = topMove.weight * 0.75;
    const candidatePool = sortedMoves.filter(m => m.weight >= candidateThreshold);
    
    const chosenMoveInfo = getRandomElement(candidatePool) || topMove;
    const chosenMove = chosenMoveInfo.originalMove;
    
    let aiLogEntry = `Selected '${chosenMove.name}' (W: ${chosenMoveInfo.weight.toFixed(2)}) from ${candidatePool.length} candidates|State:${actor.mentalState.level}|Stamina:${staminaState}`;
    if(defender.tacticalState) aiLogEntry += `|DEFENDER_STATE:${defender.tacticalState.name}`;
    
    return { move: chosenMove, aiLogEntry };
}