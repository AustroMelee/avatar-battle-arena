'use strict';

// This is the "Psychological Warfare" module. It handles all logic related to
// stress, mental state changes, and the impact of character relationships
// on a fighter's resilience and stress accumulation.

export function updateMentalState(actor, opponent, moveResult, environmentState = { damageLevel: 0 }) {
    if (actor.mentalState.level === 'broken') return;
    let stressThisTurn = 0;
    
    // Base stress from move result
    if (moveResult) {
        const stressMultiplier = actor.relationalState?.stressModifier || 1.0;
        if (moveResult.effectiveness.label === 'Critical') stressThisTurn += (20 * stressMultiplier);
        if (moveResult.effectiveness.label === 'Strong') stressThisTurn += (15 * stressMultiplier);
        stressThisTurn += moveResult.damage / 2; // Damage itself causes some stress
    }
    
    // Stress from momentum loss
    if (actor.momentum < 0) stressThisTurn += Math.abs(actor.momentum) * 2;
    // Stress from being tactically exposed (old logic, now updated to use tacticalState object)
    if (actor.tacticalState?.name === 'Exposed' || actor.tacticalState?.name === 'Off-Balance') stressThisTurn += 15;

    // --- NEW: Stress from Collateral Damage ---
    if (environmentState && environmentState.damageLevel > 0) {
        // Ensure collateralTolerance has a default if not explicitly defined on character
        const collateralTolerance = actor.collateralTolerance !== undefined ? actor.collateralTolerance : 0.5; 
        const maxEnvironmentalStress = 30; // Max stress from environment per turn
        const environmentStressFactor = 0.8; // How much environment damage translates to stress

        // Higher damage level means more stress. Multiplied by (1 - tolerance)
        // If tolerance is 1.0, stress is 0. If tolerance is 0.0, stress is max.
        let environmentalStress = (environmentState.damageLevel / 100) * maxEnvironmentalStress * (1 - collateralTolerance);
        stressThisTurn += environmentalStress * environmentStressFactor;

        // If the actor caused the damage AND has low tolerance, add a small bonus stress (guilt/regret)
        if (environmentState.lastDamageSourceId === actor.id && collateralTolerance < 0.3) {
            stressThisTurn += 5;
        }

        // If the actor thrives in damage (high tolerance), slightly reduce overall stress for the turn
        if (collateralTolerance > 0.7 && environmentState.damageLevel > 10) {
            stressThisTurn = Math.max(0, stressThisTurn - (environmentalStress * 0.5)); // Reduce by half of the environmental stress
        }
    }
    // --- END NEW ---
    
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