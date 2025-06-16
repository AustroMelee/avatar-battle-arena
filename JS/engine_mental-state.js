// FILE: js/engine_mental-state.js
'use strict';

// This is the "Psychological Warfare" module. It handles all logic related to
// stress, mental state changes, and the impact of character relationships
// on a fighter's resilience and stress accumulation.

import { locationConditions } from './location-battle-conditions.js';

export function updateMentalState(actor, opponent, moveResult, environmentState = { damageLevel: 0 }, locationId) {
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

    // Stress from Collateral Damage
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
    // --- END Stress from Collateral Damage ---

    // NEW: Environmental Stamina/Energy Depletion Mechanics
    const locationData = locationConditions[locationId];
    if (locationData) {
        const currentTurn = opponent.currentTurn || 0; // Use opponent.currentTurn to track battle duration globally

        // Cold-Based Stamina Depletion (Northern Water Tribe, Eastern Air Temple, etc.)
        if (locationData.isCold) {
            let coldEnergyDrain = 0;
            const baseDrain = 5; // Base energy drain per turn
            const progressiveDrain = (currentTurn / 6) * 10; // Increases over battle duration, max 10 by turn 6
            const damageEffect = (environmentState.damageLevel / 100) * 5; // Additional drain if environment is damaged/harsher

            if (actor.element === 'fire' || actor.element === 'lightning') {
                coldEnergyDrain = (baseDrain * 2) + progressiveDrain + damageEffect; // Firebenders suffer more
                actor.aiLog.push(`[Cold Drain]: ${actor.name} (Firebender) losing ${coldEnergyDrain.toFixed(1)} energy due to cold.`);
            } else if (actor.element === 'earth' || actor.element === 'metal' || actor.type === 'Chi Blocker') {
                coldEnergyDrain = baseDrain + (progressiveDrain * 0.5) + (damageEffect * 0.5); // Earthbenders/Chi-Blockers suffer moderately
                actor.aiLog.push(`[Cold Drain]: ${actor.name} (Earth/Chi) losing ${coldEnergyDrain.toFixed(1)} energy due to cold.`);
            } else {
                coldEnergyDrain = baseDrain * 0.5 + (progressiveDrain * 0.1); // Others suffer minimal drain
            }
            actor.energy = Math.max(0, actor.energy - coldEnergyDrain);
            actor.aiLog.push(`[Environment Effect]: ${actor.name} lost ${coldEnergyDrain.toFixed(1)} energy due to cold environment.`);
        }

        // Heat Exhaustion System (Si Wong Desert)
        if (locationData.isDesert) {
            let heatEnergyDrain = 0;
            const baseDrain = 6; // Base energy drain per turn
            const progressiveDrain = (currentTurn / 6) * 12; // Increases over battle duration, max 12 by turn 6

            if (actor.element === 'water' || actor.element === 'ice') {
                heatEnergyDrain = (baseDrain * 2.5) + progressiveDrain; // Waterbenders suffer most
                actor.aiLog.push(`[Heat Drain]: ${actor.name} (Waterbender) losing ${heatEnergyDrain.toFixed(1)} energy due to heat exhaustion.`);
            } else if (actor.element === 'earth' || actor.element === 'physical') {
                heatEnergyDrain = baseDrain + (progressiveDrain * 0.7); // Earthbenders/Physical users suffer moderately
                actor.aiLog.push(`[Heat Drain]: ${actor.name} (Earth/Physical) losing ${heatEnergyDrain.toFixed(1)} energy due to heat exhaustion.`);
            } else if (actor.element === 'fire' || actor.element === 'lightning') {
                heatEnergyDrain = baseDrain * 0.5 + (progressiveDrain * 0.2); // Firebenders suffer least (or even gain effectively if environmental buff is high)
                actor.aiLog.push(`[Heat Drain]: ${actor.name} (Firebender) losing ${heatEnergyDrain.toFixed(1)} energy due to heat exhaustion.`);
            } else if (actor.type === 'Chi Blocker') {
                 heatEnergyDrain = baseDrain + (progressiveDrain * 0.8); // Ty Lee suffers from stamina drain
                 actor.aiLog.push(`[Heat Drain]: ${actor.name} (Chi Blocker) losing ${heatEnergyDrain.toFixed(1)} energy due to heat exhaustion.`);
            } else {
                heatEnergyDrain = baseDrain + progressiveDrain; // Generic drain
            }
            actor.energy = Math.max(0, actor.energy - heatEnergyDrain);
            actor.aiLog.push(`[Environment Effect]: ${actor.name} lost ${heatEnergyDrain.toFixed(1)} energy due to heat exhaustion.`);
        }

        // NEW: Psychological Impact (e.g., Foggy Swamp discomfort, Mai's phobia)
        if (locationData.psychologicalImpact) {
            let psychologicalStress = locationData.psychologicalImpact.stressIncrease || 0;
            let appliedStress = false;

            // Toph is immune to psychological impact in the swamp
            if (locationId === 'foggy-swamp' && actor.specialTraits?.swampImmunity) {
                // Toph is unaffected by the swamp's psychological dampening
                actor.aiLog.push(`[Psychological Impact]: ${actor.name} (Toph) is immune to the swamp's psychological effects.`);
                psychologicalStress = 0;
            } else if (actor.specialTraits?.swampPhobia) {
                 // Mai has a swamp phobia, increasing stress
                 psychologicalStress += (locationData.psychologicalImpact.stressIncrease || 0) * 2; // Double base stress
                 actor.aiLog.push(`[Psychological Impact]: ${actor.name} (Mai) suffers increased stress due to swamp phobia.`);
            }
            // General application for others
            if (psychologicalStress > 0) {
                 stressThisTurn += psychologicalStress;
                 appliedStress = true;
                 actor.aiLog.push(`[Psychological Impact]: ${actor.name} stressed by environment, +${psychologicalStress.toFixed(1)} stress.`);
            }

            // Note: "Confidence Suppression" is indirectly modeled by increased stress
            // pushing mentalState.level towards 'stressed'/'shaken'/'broken',
            // which then impacts personality modifiers (like riskTolerance, aggression) in AI decision.
        }
    }
    // --- END Environmental Stamina/Energy Depletion ---
    
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