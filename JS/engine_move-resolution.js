// FILE: js/engine_move-resolution.js
'use strict';

// Version 1.1: Null-Safety Pass

// --- IMPORTS ---
import { effectivenessLevels } from './narrative-v2.js'; // Assuming this is correctly structured
import { punishableMoves } from './move-interaction-matrix.js'; // Assuming this is correctly structured
import { locationConditions } from './location-battle-conditions.js'; // Assuming this is correctly structured
import { getMomentumCritModifier } from './engine_momentum.js'; // Assuming this is correctly structured

// --- CONSTANTS ---
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const COLLATERAL_IMPACT_MULTIPLIERS = {
    'none': 0,
    'low': 0.05,
    'medium': 0.15,
    'high': 0.3,
    'catastrophic': 0.5
};

const DEFAULT_MOVE_PROPERTIES = {
    power: 30, // Default power if missing
    collateralImpact: 'none',
    moveTags: [],
    element: 'physical', // Default element
    type: 'Offense' // Default type
};

const DEFAULT_EFFECTIVENESS = effectivenessLevels.NORMAL || { label: "Normal", emoji: "⚔️" }; // Fallback effectiveness

// --- MAIN MOVE RESOLUTION FUNCTION ---
export function calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locationId) {
    // Initial critical parameter checks
    if (!move || typeof move !== 'object' || !move.name) {
        // console.warn("Move Resolution: Invalid 'move' object provided. Defaulting to Struggle-like outcome.", move);
        move = { ...DEFAULT_MOVE_PROPERTIES, name: "ErrorMove", type: 'Offense', power: 5 }; // Minimal impact error move
    }
    if (!attacker || typeof attacker !== 'object') {
        // console.warn("Move Resolution: Invalid 'attacker' object provided.");
        attacker = { id: 'unknown-attacker', name: 'Unknown Attacker', momentum: 0, tacticalState: null, mobility: 0.5, type: 'Unknown', pronouns: {s:'they', p:'their', o:'them'} };
    }
    if (!defender || typeof defender !== 'object') {
        // console.warn("Move Resolution: Invalid 'defender' object provided.");
        defender = { id: 'unknown-defender', name: 'Unknown Defender', isStunned: false, tacticalState: null, hp: 100, pronouns: {s:'they', p:'their', o:'them'} };
    }
    if (!conditions || typeof conditions !== 'object') {
        // console.warn("Move Resolution: Invalid 'conditions' object provided.");
        conditions = { id: 'unknown-location', isDay: true, isNight: false, environmentalModifiers: {} };
    }
    if (!interactionLog || !Array.isArray(interactionLog)) {
        // console.warn("Move Resolution: Invalid 'interactionLog' provided. Creating new log.");
        interactionLog = [];
    }
    if (!environmentState || typeof environmentState !== 'object') {
        // console.warn("Move Resolution: Invalid 'environmentState' provided. Creating default.");
        environmentState = { damageLevel: 0, lastDamageSourceId: null, specificImpacts: new Set() };
    }
    if (typeof locationId !== 'string') {
        // console.warn("Move Resolution: Invalid 'locationId' provided.");
        locationId = conditions.id || 'unknown-location';
    }


    let basePower = move.power || DEFAULT_MOVE_PROPERTIES.power;
    let multiplier = 1.0;
    let wasPunished = false;
    let payoff = false;
    let consumedStateName = null;
    let damage = 0;
    let collateralDamage = 0;
    // Ensure move.power is a number for energy cost calculation, or use a default basis
    const powerForEnergyCalc = typeof move.power === 'number' ? move.power : DEFAULT_MOVE_PROPERTIES.power;
    let energyCost = (move.name === 'Struggle') ? 0 : Math.round(powerForEnergyCalc * 0.22) + 4;


    let momentumChangeAttacker = 0;
    let momentumChangeDefender = 0;

    // --- Collateral Damage ---
    const locationData = locationConditions[locationId]; // locationId is now guaranteed to be a string
    const collateralImpactType = move.collateralImpact || DEFAULT_MOVE_PROPERTIES.collateralImpact;
    const baseCollateralImpact = COLLATERAL_IMPACT_MULTIPLIERS[collateralImpactType] || 0;

    if (baseCollateralImpact > 0 && locationData) {
        let fragilityMultiplier = locationData.fragility !== undefined ? locationData.fragility : 0.5;
        const moveElement = move.element || DEFAULT_MOVE_PROPERTIES.element;
        const elementalCollateralMod = locationData.collateralModifiers?.[moveElement]?.damageMultiplier || 1.0;
        collateralDamage = Math.round(basePower * baseCollateralImpact * fragilityMultiplier * elementalCollateralMod);
        collateralDamage = clamp(collateralDamage, 0, 30); // Max collateral per move
    }

    // --- "Requires Opening" Moves ---
    const moveTags = move.moveTags || []; // Ensure moveTags is an array
    if (moveTags.includes('requires_opening')) {
        const openingExists = defender.isStunned || defender.tacticalState;
        if (openingExists) {
            if (defender.tacticalState) {
                multiplier *= (defender.tacticalState.intensity || 1.0); // Fallback for intensity
                consumedStateName = defender.tacticalState.name;
                interactionLog.push(`${attacker.name}'s ${move.name} was amplified by ${defender.name} being ${defender.tacticalState.name}.`);
                payoff = true;
                damage += 5; // Bonus damage for payoff
                momentumChangeAttacker += 1;
            } else if (defender.isStunned) {
                multiplier *= 1.3;
                interactionLog.push(`${attacker.name}'s ${move.name} capitalized on ${defender.name} being stunned.`);
                payoff = true;
                damage += 3; // Bonus damage for stun payoff
                momentumChangeAttacker += 1;
            }
        } else if (punishableMoves[move.name]) {
            multiplier *= punishableMoves[move.name].penalty;
            wasPunished = true;
            momentumChangeAttacker -= 1;
            momentumChangeDefender += 1;
            // Narration for punishment is typically handled by narrative engine, but a log entry here is good.
            interactionLog.push(`${attacker.name}'s ${move.name} was punished due to lack of opening.`);
        }
    }

    // --- "Tactical Reposition" Logic ---
    if (move.isRepositionMove) {
        const mobilityFactor = attacker.mobility !== undefined ? attacker.mobility : 0.5;
        const successChance = 0.4 + (mobilityFactor * 0.6); // Base chance + mobility scaling
        const roll = Math.random();
        let effectivenessResult = DEFAULT_EFFECTIVENESS; // Initialize with a default

        if (roll < successChance) { // Success
            const intensity = 1.1 + (mobilityFactor * 0.3);
            attacker.tacticalState = { name: 'Repositioned', duration: 1, intensity, isPositive: true };
            interactionLog.push(`${attacker.name} successfully repositioned, gaining a tactical advantage.`);
            momentumChangeAttacker += 1;
            effectivenessResult = effectivenessLevels.CRITICAL || DEFAULT_EFFECTIVENESS;
        } else { // Failure
            const intensity = 1.0 + ((1 - mobilityFactor) * 0.5); // Higher intensity for worse failure if less mobile
            if (roll > successChance + (0.5 * (1 - successChance))) { // Critical failure: Exposed
                attacker.tacticalState = { name: 'Exposed', duration: 1, intensity, isPositive: false };
                interactionLog.push(`${attacker.name} failed to reposition effectively and is now exposed.`);
                momentumChangeAttacker -= 2;
                momentumChangeDefender += 1;
                effectivenessResult = effectivenessLevels.WEAK || DEFAULT_EFFECTIVENESS;
                wasPunished = true; // Reposition failure is a form of punishment
            } else { // Normal failure: Off-Balance
                attacker.tacticalState = { name: 'Off-Balance', duration: 1, intensity, isPositive: false };
                interactionLog.push(`${attacker.name}'s repositioning attempt left them off-balance.`);
                momentumChangeAttacker -= 1;
                effectivenessResult = effectivenessLevels.NORMAL || DEFAULT_EFFECTIVENESS;
            }
        }
        return {
            effectiveness: effectivenessResult,
            damage: 0, // Reposition moves typically don't do direct damage
            energyCost: Math.max(5, energyCost - 5), // Reposition generally less costly, ensure min cost
            wasPunished,
            payoff: false, // Reposition doesn't consume states
            consumedStateName: null,
            collateralDamage: 0, // Reposition usually no collateral
            momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender }
        };
    }


    // --- Environmental Modifiers ---
    const { multiplier: envMultiplier, energyCostModifier: envEnergyMod, logReasons } = applyEnvironmentalModifiers(move, attacker, conditions);
    multiplier *= envMultiplier;
    energyCost *= envEnergyMod;
    if (logReasons.length > 0) {
        interactionLog.push(`${attacker.name}'s ${move.name} was influenced by: ${logReasons.join(', ')}.`);
    }

    // --- Critical Chance ---
    let critChance = 0.1; // Base crit chance
    // Ensure attacker.momentum is a number
    const attackerMomentum = typeof attacker.momentum === 'number' ? attacker.momentum : 0;
    critChance = clamp(critChance + getMomentumCritModifier({ momentum: attackerMomentum }), 0.01, 0.5); // Pass an object to getMomentumCritModifier

    const totalEffectivenessValue = basePower * multiplier; // Renamed to avoid confusion with effectivenessLevel object
    let effectivenessLevel = DEFAULT_EFFECTIVENESS; // Default to Normal if no other conditions met

    if (Math.random() < critChance) {
        effectivenessLevel = effectivenessLevels.CRITICAL || DEFAULT_EFFECTIVENESS;
        damage += Math.round(totalEffectivenessValue * 0.5); // Critical damage bonus
        momentumChangeAttacker += 2;
        momentumChangeDefender -= 1;
        interactionLog.push(`Critical Hit! ${attacker.name}'s crit chance was ${Math.round(critChance * 100)}%.`);
    } else if (totalEffectivenessValue < basePower * 0.7) {
        effectivenessLevel = effectivenessLevels.WEAK || DEFAULT_EFFECTIVENESS;
        momentumChangeAttacker -= 1;
        momentumChangeDefender += 1;
    } else if (totalEffectivenessValue > basePower * 1.1) {
        effectivenessLevel = effectivenessLevels.STRONG || DEFAULT_EFFECTIVENESS;
        damage += Math.round(totalEffectivenessValue * 0.25); // Strong damage bonus
        momentumChangeAttacker += 1;
    } else {
        effectivenessLevel = effectivenessLevels.NORMAL || DEFAULT_EFFECTIVENESS;
    }

    // --- Move-Type-Specific Bonuses ---
    const moveType = move.type || DEFAULT_MOVE_PROPERTIES.type;
    if (moveType.includes('Offense') || moveType.includes('Finisher')) {
        damage += Math.round(totalEffectivenessValue / 3); // Base damage for offensive moves
    } else if (moveType.includes('Defense')) {
        if (effectivenessLevel === (effectivenessLevels.CRITICAL || DEFAULT_EFFECTIVENESS)) {
            momentumChangeAttacker += 1;
            momentumChangeDefender -= 1;
        } else if (effectivenessLevel === (effectivenessLevels.WEAK || DEFAULT_EFFECTIVENESS)) {
            momentumChangeAttacker -= 1; // Penalty for weak defense
        }
    }

    return {
        effectiveness: effectivenessLevel,
        damage: clamp(Math.round(damage), 0, 100), // Max damage per move, ensure integer
        energyCost: clamp(Math.round(energyCost), 4, 100), // Ensure integer cost
        wasPunished,
        payoff,
        consumedStateName,
        collateralDamage: Math.round(collateralDamage),
        momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender }
    };
}

// --- AVAILABLE MOVES FUNCTION ---
export function getAvailableMoves(actor, conditions) {
    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    if (!actor || typeof actor !== 'object' || !actor.id) {
        // console.warn("getAvailableMoves: Invalid 'actor' object provided.", actor);
        return [struggleMove];
    }
    if (!conditions || typeof conditions !== 'object' || !conditions.id) {
        // console.warn(`getAvailableMoves: Invalid 'conditions' object provided for ${actor.name}.`, conditions);
        return [struggleMove];
    }

    const locationData = locationConditions[conditions.id];
    const disabledElements = locationData?.disabledElements || [];
    let currentTechniquesSource = [];

    const isWaterbender = ['katara', 'pakku'].includes(actor.id);
    const requiresCanteen = isWaterbender && (disabledElements.includes('water') || disabledElements.includes('ice'));

    if (requiresCanteen) {
        currentTechniquesSource = actor.techniquesCanteen || [];
        if (currentTechniquesSource.length === 0 && actor.techniquesFull && actor.aiLog) {
            actor.aiLog.push(`[Terrain Warning]: ${actor.name} in ${conditions.id} requires canteen moves but has none defined. No water/ice moves available.`);
        }
    } else if (actor.techniquesFull && Array.isArray(actor.techniquesFull) && actor.techniquesFull.length > 0) {
        currentTechniquesSource = actor.techniquesFull;
    } else if (actor.techniques && Array.isArray(actor.techniques) && actor.techniques.length > 0) {
        currentTechniquesSource = actor.techniques; // Fallback to general techniques
    } else {
        // console.warn(`getAvailableMoves: ${actor.name} has no techniques defined (techniquesFull or techniques).`);
    }

    // Filter out invalid moves and ensure each move has an element property
    const validTechniques = currentTechniquesSource.filter(move => move && typeof move === 'object' && move.name && move.type);
    
    let available = validTechniques.filter(move => {
        const moveElement = move.element || DEFAULT_MOVE_PROPERTIES.element; // Default element if missing
        if (disabledElements.includes(moveElement) && !move.isCanteenMove) return false;
        
        // Special Boiling Rock logic for non-canteen water/ice moves
        if (conditions.id === 'boiling-rock' && (moveElement === 'water' || moveElement === 'ice') && !move.isCanteenMove) {
            if (move.isRepositionMove) return true; // Allow reposition, might use steam/mist
            return false; // Disable other non-canteen water/ice moves
        }
        // Check usage requirements
        const usageRequirements = move.usageRequirements || {};
        return Object.entries(usageRequirements).every(([key, val]) => conditions[key] === val);
    });

    if (available.length === 0) {
        available.push(struggleMove);
    }
    return available;
}


// --- ENVIRONMENTAL MODIFIERS FUNCTION ---
function applyEnvironmentalModifiers(move, attacker, conditions) {
    let multiplier = 1.0;
    let energyCostModifier = 1.0;
    let logReasons = [];

    // Default to 'Unknown' if attacker.type is missing
    const attackerPrimaryType = attacker?.type || 'Unknown';
    // Ensure move.element exists, defaulting to 'physical'
    const moveElement = move?.element || DEFAULT_MOVE_PROPERTIES.element;


    if (conditions?.isDay) {
        if (attackerPrimaryType === 'Bender' && (moveElement === 'fire' || moveElement === 'lightning')) {
            multiplier *= 1.1;
            logReasons.push(`daylight empowers ${attacker?.name || 'attacker'}'s ${moveElement} bending`);
        } else if (attackerPrimaryType === 'Bender' && (moveElement === 'water' || moveElement === 'ice')) {
            multiplier *= 0.9;
            energyCostModifier *= 1.1;
            logReasons.push(`daylight penalizes ${attacker?.name || 'attacker'}'s ${moveElement} bending`);
        }
    } else if (conditions?.isNight) {
        if (attackerPrimaryType === 'Bender' && (moveElement === 'fire' || moveElement === 'lightning')) {
            multiplier *= 0.9;
            energyCostModifier *= 1.1;
            logReasons.push(`nighttime penalizes ${attacker?.name || 'attacker'}'s ${moveElement} bending`);
        } else if (attackerPrimaryType === 'Bender' && (moveElement === 'water' || moveElement === 'ice')) {
            multiplier *= 1.1;
            logReasons.push(`nighttime empowers ${attacker?.name || 'attacker'}'s ${moveElement} bending`);
        }
    }

    const locationData = locationConditions[conditions?.id];
    if (locationData?.environmentalModifiers) {
        const mod = locationData.environmentalModifiers[moveElement];
        if (mod) {
            if (typeof mod.damageMultiplier === 'number') {
                multiplier *= mod.damageMultiplier;
                logReasons.push(`${mod.description || `Location affects ${moveElement} damage`}`);
            }
            if (typeof mod.energyCostModifier === 'number') {
                energyCostModifier *= mod.energyCostModifier;
                if (mod.description && !logReasons.some(r => r.includes(mod.description))) { // Avoid duplicate description
                    logReasons.push(`${mod.description} (energy cost)`);
                } else if (!mod.description) {
                     logReasons.push(`Location affects ${moveElement} energy cost`);
                }
            }
        }
    }
    
    // Ensure move.moveTags is an array before calling includes
    const moveTags = Array.isArray(move?.moveTags) ? move.moveTags : [];

    if (conditions?.isSlippery && moveTags.includes('evasive')) {
        multiplier *= 1.05;
        logReasons.push(`slippery footing aids evasive moves`);
    }
    if (conditions?.isHot && (moveElement === 'fire' || moveElement === 'lightning')) {
        multiplier *= 1.05;
        logReasons.push(`hot environment empowers ${moveElement}`);
    }
    if (conditions?.isCold && (moveElement === 'water' || moveElement === 'ice')) {
        multiplier *= 1.05;
        logReasons.push(`cold environment empowers ${moveElement}`);
    }

    return { multiplier, energyCostModifier, logReasons };
}