// FILE: js/engine_move-resolution.js
'use strict';

// --- IMPORTS ---
import { effectivenessLevels } from './narrative-v2.js';
import { punishableMoves } from './move-interaction-matrix.js';
import { locationConditions } from './location-battle-conditions.js';
import { getMomentumCritModifier } from './engine_momentum.js';

// --- CONSTANTS ---
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const COLLATERAL_IMPACT_MULTIPLIERS = {
    'none': 0,
    'low': 0.05,
    'medium': 0.15,
    'high': 0.3,
    'catastrophic': 0.5
};

// --- MAIN MOVE RESOLUTION FUNCTION ---
export function calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locationId) {
    let basePower = move.power || 30;
    let multiplier = 1.0;
    let wasPunished = false;
    let payoff = false;
    let consumedStateName = null;
    let damage = 0;
    let collateralDamage = 0;
    let energyCost = (move.name === 'Struggle') ? 0 : Math.round((move.power || 0) * 0.22) + 4;

    let momentumChangeAttacker = 0;
    let momentumChangeDefender = 0;

    // --- Collateral Damage ---
    const locationData = locationConditions[locationId];
    const baseCollateralImpact = COLLATERAL_IMPACT_MULTIPLIERS[move.collateralImpact || 'none'] || 0;
    if (baseCollateralImpact > 0 && locationData) {
        let fragilityMultiplier = locationData.fragility || 0.5;
        const elementalCollateralMod = locationData.collateralModifiers?.[move.element]?.damageMultiplier || 1.0;
        collateralDamage = Math.round(basePower * baseCollateralImpact * fragilityMultiplier * elementalCollateralMod);
        collateralDamage = clamp(collateralDamage, 0, 30);
    }

    // --- "Requires Opening" Moves ---
    if (move.moveTags?.includes('requires_opening')) {
        const openingExists = defender.isStunned || defender.tacticalState;
        if (openingExists) {
            if (defender.tacticalState) {
                multiplier *= defender.tacticalState.intensity;
                consumedStateName = defender.tacticalState.name;
                interactionLog.push(`${attacker.name}'s ${move.name} was amplified by ${defender.name} being ${defender.tacticalState.name}.`);
                payoff = true;
                damage += 5;
                momentumChangeAttacker += 1;
            } else if (defender.isStunned) {
                multiplier *= 1.3;
                interactionLog.push(`${attacker.name}'s ${move.name} capitalized on ${defender.name} being stunned.`);
                payoff = true;
                damage += 3;
                momentumChangeAttacker += 1;
            }
        } else if (punishableMoves[move.name]) {
            multiplier *= punishableMoves[move.name].penalty;
            wasPunished = true;
            momentumChangeAttacker -= 1;
            momentumChangeDefender += 1;
        }
    }

    // --- "Tactical Reposition" Logic ---
    if (move.isRepositionMove) {
        const mobilityFactor = attacker.mobility || 0.5;
        const successChance = 0.4 + (mobilityFactor * 0.6);
        const roll = Math.random();
        if (roll < successChance) {
            const intensity = 1.1 + (mobilityFactor * 0.3);
            const duration = 1;
            attacker.tacticalState = { name: 'Repositioned', duration, intensity, isPositive: true };
            interactionLog.push(`${attacker.name} successfully repositioned, gaining a tactical advantage.`);
            momentumChangeAttacker += 1;
            return {
                effectiveness: effectivenessLevels.CRITICAL,
                damage: 0,
                energyCost: 10,
                wasPunished: false,
                payoff: false,
                consumedStateName: null,
                collateralDamage: 0,
                momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender }
            };
        } else {
            const intensity = 1.0 + (1 - mobilityFactor) * 0.5;
            const duration = 1;
            if (roll > successChance + (0.5 * (1 - successChance))) {
                attacker.tacticalState = { name: 'Exposed', duration, intensity, isPositive: false };
                interactionLog.push(`${attacker.name} failed to reposition effectively and is now exposed.`);
                momentumChangeAttacker -= 2;
                momentumChangeDefender += 1;
                return {
                    effectiveness: effectivenessLevels.WEAK,
                    damage: 0,
                    energyCost: 10,
                    wasPunished: true,
                    payoff: false,
                    consumedStateName: null,
                    collateralDamage: 0,
                    momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender }
                };
            } else {
                attacker.tacticalState = { name: 'Off-Balance', duration, intensity, isPositive: false };
                interactionLog.push(`${attacker.name}'s repositioning attempt left them off-balance.`);
                momentumChangeAttacker -= 1;
                return {
                    effectiveness: effectivenessLevels.NORMAL,
                    damage: 0,
                    energyCost: 10,
                    wasPunished: false,
                    payoff: false,
                    consumedStateName: null,
                    collateralDamage: 0,
                    momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender }
                };
            }
        }
    }

    // --- Environmental Modifiers ---
    const { multiplier: envMultiplier, energyCostModifier, logReasons } = applyEnvironmentalModifiers(move, attacker, conditions);
    multiplier *= envMultiplier;
    energyCost *= energyCostModifier;
    if (logReasons.length > 0) {
        interactionLog.push(`${attacker.name}'s ${move.name} was influenced by: ${logReasons.join(', ')}.`);
    }

    // --- Critical Chance ---
    let critChance = 0.1;
    critChance = clamp(critChance + getMomentumCritModifier(attacker), 0.01, 0.5);

    const totalEffectiveness = basePower * multiplier;
    let level;
    if (Math.random() < critChance) {
        level = effectivenessLevels.CRITICAL;
        damage += Math.round(totalEffectiveness / 2);
        momentumChangeAttacker += 2;
        momentumChangeDefender -= 1;
        interactionLog.push(`Critical Hit Chance (Momentum Modified): ${attacker.name}'s crit chance was ${Math.round(critChance * 100)}%.`);
    } else if (totalEffectiveness < basePower * 0.7) {
        level = effectivenessLevels.WEAK;
        momentumChangeAttacker -= 1;
        momentumChangeDefender += 1;
    } else if (totalEffectiveness > basePower * 1.1) {
        level = effectivenessLevels.STRONG;
        damage += Math.round(totalEffectiveness / 4);
        momentumChangeAttacker += 1;
    } else {
        level = effectivenessLevels.NORMAL;
    }

    // --- Move-Type-Specific Bonuses ---
    if (move.type.includes('Offense') || move.type.includes('Finisher')) {
        damage += Math.round(totalEffectiveness / 3);
    } else if (move.type.includes('Defense')) {
        if (level === effectivenessLevels.CRITICAL) {
            momentumChangeAttacker += 1;
            momentumChangeDefender -= 1;
        } else if (level === effectivenessLevels.WEAK) {
            momentumChangeAttacker -= 1;
        }
    }

    return {
        effectiveness: level,
        damage: clamp(damage, 0, 50),
        energyCost: clamp(energyCost, 4, 100),
        wasPunished,
        payoff,
        consumedStateName,
        collateralDamage,
        momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender }
    };
}

// --- AVAILABLE MOVES FUNCTION ---
export function getAvailableMoves(actor, conditions) {
    if (!actor || !actor.id || !conditions || !conditions.id) {
        console.error("getAvailableMoves: Missing actor or conditions.", { actor, conditions });
        return [{ name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] }];
    }
    const locationData = locationConditions[conditions.id];
    const disabledElements = locationData?.disabledElements || [];
    let currentTechniques = [];

    // Waterbender/Canteen logic
    const isWaterbender = ['katara', 'pakku'].includes(actor.id);
    const requiresCanteen = isWaterbender && (disabledElements.includes('water') || disabledElements.includes('ice'));

    if (requiresCanteen) {
        currentTechniques = actor.techniquesCanteen || [];
        if (currentTechniques.length === 0 && actor.techniquesFull) {
            actor.aiLog.push(`[Terrain Warning]: ${actor.name} in ${conditions.id} requires canteen moves but has none defined. No water/ice moves available.`);
        }
    } else if (actor.techniquesFull && actor.techniquesFull.length > 0) {
        currentTechniques = actor.techniquesFull;
    } else if (actor.techniques && actor.techniques.length > 0) {
        currentTechniques = actor.techniques;
    } else {
        console.warn(`getAvailableMoves: ${actor.name} has no techniques defined.`);
        currentTechniques = [];
    }

    let available = currentTechniques.filter(move => {
        const moveElement = move.element;
        if (disabledElements.includes(moveElement) && !move.isCanteenMove) return false;
        if (conditions.id === 'boiling-rock' && (moveElement === 'water' || moveElement === 'ice') && !move.isCanteenMove) {
            if (move.isRepositionMove) return true;
            return false;
        }
        return Object.entries(move.usageRequirements || {}).every(([key, val]) => conditions[key] === val);
    });

    if (available.length === 0) {
        available.push({ name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] });
    }
    return available;
}

// --- ENVIRONMENTAL MODIFIERS FUNCTION ---
function applyEnvironmentalModifiers(move, attacker, conditions) {
    let multiplier = 1.0;
    let energyCostModifier = 1.0;
    let logReasons = [];
    const attackerPrimaryType = attacker.type;

    if (conditions.isDay) {
        if (attackerPrimaryType === 'Bender' && (move.element === 'fire' || move.element === 'lightning')) {
            multiplier *= 1.1;
            logReasons.push(`daylight empowers ${attacker.name}'s fire/lightning bending`);
        } else if (attackerPrimaryType === 'Bender' && (move.element === 'water' || move.element === 'ice')) {
            multiplier *= 0.9;
            energyCostModifier *= 1.1;
            logReasons.push(`daylight penalizes ${attacker.name}'s water/ice bending`);
        }
    } else if (conditions.isNight) {
        if (attackerPrimaryType === 'Bender' && (move.element === 'fire' || move.element === 'lightning')) {
            multiplier *= 0.9;
            energyCostModifier *= 1.1;
            logReasons.push(`nighttime penalizes ${attacker.name}'s fire/lightning bending`);
        } else if (attackerPrimaryType === 'Bender' && (move.element === 'water' || move.element === 'ice')) {
            multiplier *= 1.1;
            logReasons.push(`nighttime empowers ${attacker.name}'s water/ice bending`);
        }
    }

    const locationData = locationConditions[conditions.id];
    if (locationData && locationData.environmentalModifiers) {
        const moveElement = move.element;
        if (locationData.environmentalModifiers[moveElement]) {
            const mod = locationData.environmentalModifiers[moveElement];
            if (mod.damageMultiplier) {
                multiplier *= mod.damageMultiplier;
                if (mod.description) logReasons.push(`${mod.description} (damage)`);
                else logReasons.push(`Location affects ${moveElement} damage`);
            }
            if (mod.energyCostModifier) {
                energyCostModifier *= mod.energyCostModifier;
                if (mod.description) logReasons.push(`${mod.description} (energy cost)`);
                else logReasons.push(`Location affects ${moveElement} energy cost`);
            }
        }
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
