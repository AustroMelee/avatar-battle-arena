// FILE: engine_move-resolution.js
'use strict';

// Version 2.0: Modularized Move Resolution
// - This file now orchestrates move calculations, calling specialized modules for environmental
//   modifiers and move availability. It focuses on the core damage/state logic.

import { effectivenessLevels } from './data_narrative_effectiveness.js';
import { punishableMoves } from './move-interaction-matrix.js';
import { getMomentumCritModifier } from './engine_momentum.js';
import { applyEscalationDamageModifier, ESCALATION_STATES } from './engine_escalation.js';
import { checkReactiveDefense } from './engine_reactive-defense.js';
import { applyEnvironmentalModifiers } from './engine_environmental-modifiers.js';
import { getAvailableMoves as getMoves } from './engine_move_availability.js'; // Renamed to avoid conflict
import { EFFECT_TYPES } from './data_mechanics_definitions.js'; // NEW IMPORT

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const DEFAULT_MOVE_PROPERTIES = {
    power: 30,
    collateralImpact: 'none',
    moveTags: [],
    element: 'physical',
    type: 'Offense'
};
const DEFAULT_EFFECTIVENESS = effectivenessLevels.NORMAL || { label: "Normal", emoji: "⚔️" };

/**
 * Calculates the final outcome of a move.
 * @returns {object} The result of the move, including effectiveness, cost, and a list of effects to apply.
 */
export function calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locationId, modifyMomentum) {
    if (!move || typeof move !== 'object') {
        move = { ...DEFAULT_MOVE_PROPERTIES, name: "ErrorMove", type: 'Offense', power: 5 };
    }
    const currentMoveTags = Array.isArray(move.moveTags) ? move.moveTags : [];
    const effectsToApply = []; // NEW: Array to collect effects

    // --- REACTIVE DEFENSE HOOK ---
    const reactiveResult = checkReactiveDefense(attacker, defender, move, { locationId }, interactionLog, modifyMomentum);
    if (reactiveResult.reacted) {
        // Reactive defense now returns effects directly as well
        const reactiveEffects = [];
        if (reactiveResult.damage > 0) reactiveEffects.push({ type: EFFECT_TYPES.DAMAGE, value: reactiveResult.damage, targetId: defender.id });
        if (reactiveResult.stunDuration > 0) reactiveEffects.push({ type: EFFECT_TYPES.STUN, duration: reactiveResult.stunDuration, targetId: defender.id });
        // Momentum changes are now handled by modifyMomentum during checkReactiveDefense, so no effect needed here for now.
        // If modifyMomentum is refactored to use applyEffect, this would change.

        return {
            effectiveness: { label: reactiveResult.effectivenessLabel, emoji: reactiveResult.effectivenessEmoji },
            energyCost: clamp(Math.round((move.power || 30) * 0.22) + 4, 4, 100),
            wasPunished: !reactiveResult.success,
            payoff: reactiveResult.success,
            isReactedAction: true,
            reactionType: reactiveResult.type,
            reactionSuccess: reactiveResult.success,
            effects: reactiveEffects, // Return collected effects
        };
    }
    // --- END HOOK ---

    let basePower = move.power || 30;
    let multiplier = 1.0;
    let wasPunished = false;
    let payoff = false;
    let consumedStateName = null;
    let calculatedDamage = 0; // Renamed to avoid confusion with the 'damage' effect value
    
    // Apply punishment for using moves without an opening
    if (currentMoveTags.includes('requires_opening') && !(defender.stunDuration > 0 || defender.tacticalState)) {
        if (punishableMoves[move.name]) {
            multiplier *= punishableMoves[move.name].penalty;
            wasPunished = true;
            effectsToApply.push(
                { type: EFFECT_TYPES.MOMENTUM_CHANGE, value: -1, targetId: attacker.id },
                { type: EFFECT_TYPES.MOMENTUM_CHANGE, value: 1, targetId: defender.id }
            );
        }
    }
    
    // Apply environmental modifiers
    const { multiplier: envMultiplier, energyCostModifier: envEnergyMod, logReasons } = applyEnvironmentalModifiers(move, attacker, conditions, currentMoveTags);
    multiplier *= envMultiplier;
    let energyCost = ((move.name === 'Struggle') ? 0 : Math.round((move.power || 30) * 0.22) + 4) * envEnergyMod;

    // NEW: Apply character-specific move adjustments based on location (collateral damage aversion)
    const locationData = conditions.id ? locationConditions[conditions.id] : null;
    if (locationData?.characterMoveAdjustments?.[attacker.id]?.[move.name]) {
        const adjustment = locationData.characterMoveAdjustments[attacker.id][move.name];
        if (adjustment.energyCostModifier) {
            energyCost *= adjustment.energyCostModifier;
            logReasons.push(adjustment.description || `character's aversion to collateral damage`);
        }
    }

    if (logReasons.length > 0) {
        interactionLog.push(`${attacker.name}'s ${move.name} was influenced by: ${logReasons.join(', ')}.`);
        attacker.aiLog.push(`[Env Influence]: ${move.name} affected by ${logReasons.join(', ')} (x${envMultiplier.toFixed(2)} power, x${envEnergyMod.toFixed(2)} energy).`);
    }

    // Determine effectiveness (Normal, Strong, Critical, etc.)
    let critChance = clamp(0.1 + getMomentumCritModifier(attacker), 0.01, 0.5);
    const totalEffectivenessValue = basePower * multiplier;
    let effectivenessLevel = DEFAULT_EFFECTIVENESS;

    if (Math.random() < critChance) {
        effectivenessLevel = effectivenessLevels.CRITICAL || DEFAULT_EFFECTIVENESS;
        calculatedDamage += Math.round(totalEffectivenessValue * 0.5);
        effectsToApply.push({ type: EFFECT_TYPES.MOMENTUM_CHANGE, value: 2, targetId: attacker.id });
    } else if (totalEffectivenessValue < basePower * 0.7) {
        effectivenessLevel = effectivenessLevels.WEAK || DEFAULT_EFFECTIVENESS;
        effectsToApply.push({ type: EFFECT_TYPES.MOMENTUM_CHANGE, value: -1, targetId: attacker.id });
    } else if (totalEffectivenessValue > basePower * 1.1) {
        effectivenessLevel = effectivenessLevels.STRONG || DEFAULT_EFFECTIVENESS;
        calculatedDamage += Math.round(totalEffectivenessValue * 0.25);
        effectsToApply.push({ type: EFFECT_TYPES.MOMENTUM_CHANGE, value: 1, targetId: attacker.id });
    }

    // Calculate base damage from move type
    if (move.type === 'Offense' || move.type === 'Finisher') {
        calculatedDamage += Math.round(totalEffectivenessValue / 3);
    }

    // Apply escalation damage modifier (this will be an effect later if we generalize modifiers fully)
    if (calculatedDamage > 0 && defender.escalationState) {
        calculatedDamage = applyEscalationDamageModifier(calculatedDamage, defender.escalationState);
    }

    if (calculatedDamage > 0) {
        effectsToApply.push({ type: EFFECT_TYPES.DAMAGE, value: clamp(calculatedDamage, 0, 100), targetId: defender.id });
    }

    // Add stun effect if critical hit and not a defensive move
    if (effectivenessLevel.label === 'Critical' && move.type !== 'Defense') {
        effectsToApply.push({ type: EFFECT_TYPES.STUN, duration: 1, targetId: defender.id });
    }

    // Placeholder for collateral damage (was always 0 before)
    // If move has a collateralImpact, create a COLLATERAL_DAMAGE effect
    if (move.collateralImpact && move.collateralImpact !== 'none') {
        let collateralValue = 0;
        switch (move.collateralImpact) {
            case 'low': collateralValue = 5; break;
            case 'medium': collateralValue = 15; break;
            case 'high': collateralValue = 30; break;
            case 'catastrophic': collateralValue = 50; break;
        }
        if (collateralValue > 0) {
            effectsToApply.push({ type: EFFECT_TYPES.COLLATERAL_DAMAGE, value: collateralValue });
        }
    }

    // Placeholder for self-damage (was always 0 before)
    // If a move causes self-damage, add a DAMAGE effect to the attacker
    if (move.selfDamage > 0) { // Assuming move.selfDamage can be defined in move data
        effectsToApply.push({ type: EFFECT_TYPES.DAMAGE, value: move.selfDamage, targetId: attacker.id });
    }

    return {
        effectiveness: effectivenessLevel,
        energyCost: clamp(energyCost, 0, 100),
        wasPunished,
        payoff,
        consumedStateName,
        isReactedAction: false,
        effects: effectsToApply,
    };
}

// Export the renamed function from the new module
export { getMoves as getAvailableMoves };