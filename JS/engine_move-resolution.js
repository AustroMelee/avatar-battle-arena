// FILE: engine_move-resolution.js
'use strict';

// This is the "Combat Math" module. Its sole purpose is to calculate the
// outcome of a move, including damage, effectiveness, energy cost, and the
// effects of environmental factors and special conditions like punishments.

// --- IMPORTS (PATHS CORRECTED) ---
import { effectivenessLevels } from './narrative-v2.js';
import { punishableMoves } from './move-interaction-matrix.js';
import { locationConditions } from './location-battle-conditions.js'; // Added for collateral damage
import { getMomentumCritModifier } from './engine_momentum.js'; // NEW: Import momentum crit modifier

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

    // NEW: Initialize momentum changes for the result
    let momentumChangeAttacker = 0;
    let momentumChangeDefender = 0;

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
                momentumChangeAttacker += 1; // Reward for capitalizing
            } else if (defender.isStunned) {
                multiplier *= 1.3;
                interactionLog.push(`${attacker.name}'s ${move.name} capitalized on ${defender.name} being stunned.`);
                payoff = true;
                damage += 3;
                momentumChangeAttacker += 1; // Reward for capitalizing
            }
        } else if (punishableMoves[move.name]) {
            multiplier *= punishableMoves[move.name].penalty;
            wasPunished = true;
            momentumChangeAttacker -= 1; // Penalty for misusing
            momentumChangeDefender += 1; // Gain for opponent
        }
    }

    // NEW: Handle "Tactical Reposition" move logic
    if (move.isRepositionMove) {
        const mobilityFactor = attacker.mobility || 0.5; // Default to neutral if not defined
        const successChance = 0.4 + (mobilityFactor * 0.6); // 40% (min mobility) to 100% (max mobility)
        const roll = Math.random();

        if (roll < successChance) {
            // Success: Apply a positive tactical state
            const intensity = 1.1 + (mobilityFactor * 0.3); // Intensity 1.1 to 1.4
            const duration = 1;
            attacker.tacticalState = { name: 'Repositioned', duration, intensity, isPositive: true };
            interactionLog.push(`${attacker.name} successfully repositioned, gaining a tactical advantage.`);
            momentumChangeAttacker += 1; // Gain momentum for successful reposition
            return {
                effectiveness: effectivenessLevels.CRITICAL, // Critical for successful reposition
                damage: 0,
                energyCost: 10, // Fixed low cost for reposition
                wasPunished: false,
                payoff: false,
                consumedStateName: null,
                collateralDamage: 0,
                momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender } // NEW: Return momentum changes
            };
        } else {
            // Failure: Apply a negative tactical state or stun
            const intensity = 1.0 + (1 - mobilityFactor) * 0.5; // Intensity 1.0 to 1.5 (more severe for low mobility)
            const duration = 1;
            if (roll > successChance + (0.5 * (1 - successChance))) { // Worse failure for lower mobility / higher roll
                attacker.tacticalState = { name: 'Exposed', duration, intensity, isPositive: false }; // Exposed state
                interactionLog.push(`${attacker.name} failed to reposition effectively and is now exposed.`);
                momentumChangeAttacker -= 2; // Significant penalty for critical failure
                momentumChangeDefender += 1; // Gain for opponent
                return {
                    effectiveness: effectivenessLevels.WEAK, // Weak for failed reposition
                    damage: 0,
                    energyCost: 10,
                    wasPunished: true, // Mark as punished for AI to learn
                    payoff: false,
                    consumedStateName: null,
                    collateralDamage: 0,
                    momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender } // NEW: Return momentum changes
                };
            } else {
                attacker.tacticalState = { name: 'Off-Balance', duration, intensity, isPositive: false }; // Off-Balance state
                interactionLog.push(`${attacker.name}'s repositioning attempt left them off-balance.`);
                momentumChangeAttacker -= 1; // Minor penalty for regular failure
                return {
                    effectiveness: effectivenessLevels.NORMAL, // Normal for minor failed reposition
                    damage: 0,
                    energyCost: 10,
                    wasPunished: false, // Not a punishment, but a neutral/minor negative outcome
                    payoff: false,
                    consumedStateName: null,
                    collateralDamage: 0,
                    momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender } // NEW: Return momentum changes
                };
            }
        }
    }
    
    // Apply environmental modifiers to move effectiveness and energy cost
    const { multiplier: envMultiplier, energyCostModifier, logReasons } = applyEnvironmentalModifiers(move, attacker, conditions);
    multiplier *= envMultiplier;
    energyCost *= energyCostModifier; // Adjust energy cost based on environment
    if (envReasons.length > 0) interactionLog.push(`${attacker.name}'s ${move.name} was influenced by: ${envReasons.join(', ')}.`);
    
    // Base Critical Chance
    let critChance = 0.1; // 10% base crit chance
    // Apply momentum modifier
    critChance = clamp(critChance + getMomentumCritModifier(attacker), 0.01, 0.5); // Min 1% max 50% crit chance

    const totalEffectiveness = basePower * multiplier;
    let level;
    if (Math.random() < critChance) { // Check for critical hit after all modifiers
        level = effectivenessLevels.CRITICAL;
        damage += Math.round(totalEffectiveness / 2); // Apply critical damage bonus
        momentumChangeAttacker += 2; // Big momentum gain for critical hit
        momentumChangeDefender -= 1; // Opponent loses momentum
        interactionLog.push(`Critical Hit Chance (Momentum Modified): ${attacker.name}'s crit chance was ${Math.round(critChance * 100)}%.`);
    } else if (totalEffectiveness < basePower * 0.7) {
        level = effectivenessLevels.WEAK; 
        momentumChangeAttacker -= 1; // Attacker loses momentum for weak hit
        momentumChangeDefender += 1; // Defender gains momentum
    } else if (totalEffectiveness > basePower * 1.1) {
        level = effectivenessLevels.STRONG;
        damage += Math.round(totalEffectiveness / 4); // Apply strong hit damage bonus
        momentumChangeAttacker += 1; // Attacker gains momentum for strong hit
    } else {
        level = effectivenessLevels.NORMAL;
    }
    
    if (move.type.includes('Offense') || move.type.includes('Finisher')) {
        damage += Math.round(totalEffectiveness / 3);
    } else if (move.type.includes('Defense')) { // Defensive moves can affect momentum
        if (level === effectivenessLevels.CRITICAL) { // Perfect defense
            momentumChangeAttacker += 1;
            momentumChangeDefender -= 1;
        } else if (level === effectivenessLevels.WEAK) { // Failed defense
            momentumChangeAttacker -= 1;
        }
    }
    
    return { 
        effectiveness: level, 
        damage: clamp(damage, 0, 50), 
        energyCost: clamp(energyCost, 4, 100), // Ensure minimum energy cost
        wasPunished, 
        payoff, 
        consumedStateName,
        collateralDamage, // New: Return collateral damage
        momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender } // NEW: Return momentum changes
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