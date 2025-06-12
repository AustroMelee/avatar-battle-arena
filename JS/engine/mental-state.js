// FILE: engine/mental-state.js
'use strict';

// This is the "Psychological Warfare" module. It handles all logic related to
// stress, mental state changes, and the impact of character relationships
// on a fighter's resilience and stress accumulation.

export function updateMentalState(actor, opponent, moveResult) {
    if (actor.mentalState.level === 'broken') return;
    let stressThisTurn = 0;
    
    if (moveResult) {
        const stressMultiplier = actor.relationalState?.stressModifier || 1.0;
        if (moveResult.effectiveness.label === 'Critical') stressThisTurn += (20 * stressMultiplier);
        if (moveResult.effectiveness.label === 'Strong') stressThisTurn += (15 * stressMultiplier);
        stressThisTurn += moveResult.damage / 2;
    }
    
    if (actor.momentum < 0) stressThisTurn += Math.abs(actor.momentum) * 2;
    if (actor.tacticalState) stressThisTurn += 15;
    
    actor.mentalState.stress += stressThisTurn;
    const resilience = actor.relationalState?.resilienceModifier || 1.0;
    const thresholds = { stressed: 25 * resilience, shaken: 60 * resilience, broken: 90 * resilience };
    const oldLevel = actor.mentalState.level;

    if (actor.mentalState.stress > thresholds.broken) actor.mentalState.level = 'broken';
    else if (actor.mentalState.stress > thresholds.shaken) actor.mentalState.level = 'shaken';
    else if (actor.mentalState.stress > thresholds.stressed) actor.mentalState.level = 'stressed';
    
    if (oldLevel !== actor.mentalState.level) {
        actor.aiLog.push(`[Mental State Change]: ${actor.name} is now ${actor.mentalState.level.toUpperCase()}. (Stress: ${actor.mentalState.stress.toFixed(0)})`);
        actor.mentalStateChangedThisTurn = true;
    }
}