'use strict';

// This is the "Combat Math" module. Its sole purpose is to calculate the
// outcome of a move, including damage, effectiveness, energy cost, and the
// effects of environmental factors and special conditions like punishments.

// --- IMPORTS (PATHS CORRECTED) ---
import { effectivenessLevels } from './narrative-v2.js';
import { punishableMoves } from './move-interaction-matrix.js';
import { locationConditions } from './location-battle-conditions.js'; // Added for collateral damage

// --- HELPER FUNCTIONS ---
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// Collateral damage mapping
const COLLATERAL_IMPACT_MULTIPLIERS = {
    'none': 0,
    'low': 0.05, // 5% of move power contributes to environment damage
    'medium': 0.15, // 15%
    'high': 0.3, // 30%
    'catastrophic': 0.5 // 50%
};

export function calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locationId) {
    let basePower = move.power || 30;
    let multiplier = 1.0;
    let wasPunished = false;
    let payoff = false;
    let consumedStateName = null;
    let damage = 0;
    let collateralDamage = 0; // New: Collateral damage value
    let energyCost = (move.name === 'Struggle') ? 0 : Math.round((move.power || 0) * 0.22) + 4;

    // Collateral damage calculation
    const locationData = locationConditions[locationId];
    const baseCollateralImpact = COLLATERAL_IMPACT_MULTIPLIERS[move.collateralImpact || 'none'] || 0;
    if (baseCollateralImpact > 0 && locationData) {
        let fragilityMultiplier = locationData.fragility || 0.5; // Default fragility
        // Apply location-specific collateral modifiers if available
        const elementalCollateralMod = locationData.collateralModifiers?.[move.element]?.damageMultiplier || 1.0;
        collateralDamage = Math.round(basePower * baseCollateralImpact * fragilityMultiplier * elementalCollateralMod);
        // Ensure collateral damage is non-negative and within a reasonable range per move
        collateralDamage = clamp(collateralDamage, 0, 30);
    }

    if (move.moveTags?.includes('requires_opening')) {
        const openingExists = defender.isStunned || defender.tacticalState;
        if (openingExists) {
            if(defender.tacticalState) {
                multiplier *= defender.tacticalState.intensity;
                consumedStateName = defender.tacticalState.name;
                interactionLog.push(`${attacker.name}'s ${move.name} was amplified by ${defender.name} being ${defender.tacticalState.name}.`);
                payoff = true;
                damage += 5;
            } else if (defender.isStunned) {
                multiplier *= 1.3;
                interactionLog.push(`${attacker.name}'s ${move.name} capitalized on ${defender.name} being stunned.`);
                payoff = true;
                damage += 3;
            }
        } else if (punishableMoves[move.name]) {
            multiplier *= punishableMoves[move.name].penalty;
            wasPunished = true;
        }
    }
    
    // NEW: Apply environmental modifiers to move effectiveness and energy cost
    const { multiplier: envMultiplier, energyCostModifier, logReasons: envReasons } = applyEnvironmentalModifiers(move, attacker, conditions);
    multiplier *= envMultiplier;
    energyCost *= energyCostModifier; // Adjust energy cost based on environment
    if (envReasons.length > 0) interactionLog.push(`${attacker.name}'s ${move.name} was influenced by: ${envReasons.join(', ')}.`);
    
    const totalEffectiveness = basePower * multiplier;
    let level;
    if (totalEffectiveness < basePower * 0.7) level = effectivenessLevels.WEAK; 
    else if (totalEffectiveness > basePower * 1.5) level = effectivenessLevels.CRITICAL;
    else if (totalEffectiveness > basePower * 1.1) level = effectivenessLevels.STRONG;
    else level = effectivenessLevels.NORMAL;
    
    if (move.type.includes('Offense') || move.type.includes('Finisher')) {
        damage += Math.round(totalEffectiveness / 3);
    }
    
    return { 
        effectiveness: level, 
        damage: clamp(damage, 0, 50), 
        energyCost: clamp(energyCost, 4, 100), // Ensure minimum energy cost
        wasPunished, 
        payoff, 
        consumedStateName,
        collateralDamage // New: Return collateral damage
    };
}

export function getAvailableMoves(actor, conditions) {
    if (!actor.techniques) return [];
    return actor.techniques.filter(move => Object.entries(move.usageRequirements || {}).every(([key, val]) => conditions[key] === val));
}

function applyEnvironmentalModifiers(move, attacker, conditions) {
    let multiplier = 1.0;
    let energyCostModifier = 1.0; // NEW: Energy cost modifier
    let logReasons = [];
    
    // Determine the primary elemental type of the attacker's character
    // This is a rough proxy, actual logic might be more complex if characters have multiple strong elements
    const attackerPrimaryType = attacker.type; 

    // General time-of-day modifiers (already present, ensured they interact correctly)
    if (conditions.isDay) {
        if (attackerPrimaryType === 'Bender' && (move.element === 'fire' || move.element === 'lightning')) { 
            multiplier *= 1.1; 
            logReasons.push(`daylight empowers ${attacker.name}'s fire/lightning bending`); 
        } else if (attackerPrimaryType === 'Bender' && (move.element === 'water' || move.element === 'ice')) { 
            multiplier *= 0.9; energyCostModifier *= 1.1; 
            logReasons.push(`daylight penalizes ${attacker.name}'s water/ice bending`); 
        }
    } else if (conditions.isNight) {
        if (attackerPrimaryType === 'Bender' && (move.element === 'fire' || move.element === 'lightning')) { 
            multiplier *= 0.9; energyCostModifier *= 1.1; 
            logReasons.push(`nighttime penalizes ${attacker.name}'s fire/lightning bending`); 
        } else if (attackerPrimaryType === 'Bender' && (move.element === 'water' || move.element === 'ice')) { 
            multiplier *= 1.1; 
            logReasons.push(`nighttime empowers ${attacker.name}'s water/ice bending`); 
        }
    }

    // Location-specific environmental modifiers for move effectiveness and energy cost
    const locationData = locationConditions[conditions.id]; // conditions.id should be the locationId passed
    if (locationData && locationData.environmentalModifiers) {
        const moveElement = move.element;
        if (locationData.environmentalModifiers[moveElement]) {
            const mod = locationData.environmentalModifiers[moveElement];
            if (mod.damageMultiplier) { 
                multiplier *= mod.damageMultiplier; 
                logReasons.push(`${mod.description} (damage)`); 
            }
            if (mod.energyCostModifier) { 
                energyCostModifier *= mod.energyCostModifier; 
                logReasons.push(`${mod.description} (energy cost)`); 
            }
        }
        // General environmental tags that apply to any move type or attacker type
        if (conditions.isSlippery && move.moveTags.includes('evasive')) { 
            multiplier *= 1.05; 
            logReasons.push(`slippery footing aids evasive moves`); 
        }
        if (conditions.isHot && (moveElement === 'fire' || moveElement === 'lightning')) {
            multiplier *= 1.05;
            logReasons.push(`hot environment empowers fire/lightning`);
        }
        if (conditions.isCold && (moveElement === 'water' || moveElement === 'ice')) {
            multiplier *= 1.05;
            logReasons.push(`cold environment empowers water/ice`);
        }
    }

    return { multiplier, energyCostModifier, logReasons };
}