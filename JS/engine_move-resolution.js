// FILE: engine_move-resolution.js
'use strict';

// Version 1.4: Integrated Reactive Defense Hook

// --- IMPORTS ---
import { effectivenessLevels } from './narrative-v2.js';
import { punishableMoves } from './move-interaction-matrix.js';
import { locationConditions } from './location-battle-conditions.js';
import { getMomentumCritModifier } from './engine_momentum.js';
import { applyEscalationDamageModifier, ESCALATION_STATES } from './engine_escalation.js';
import { checkReactiveDefense } from './engine_reactive-defense.js'; // Import the new hook

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
    power: 30,
    collateralImpact: 'none',
    moveTags: [],
    element: 'physical',
    type: 'Offense'
};

const DEFAULT_EFFECTIVENESS = effectivenessLevels.NORMAL || { label: "Normal", emoji: "⚔️" };

// --- LIGHTNING REDIRECTION CONSTANTS ---
const LIGHTNING_REDIRECTION_BASE_SUCCESS_CHANCE = 0.80;
const LIGHTNING_REDIRECTION_HP_THRESHOLD_LOW = 30;
const LIGHTNING_REDIRECTION_HP_THRESHOLD_MID = 60;
const LIGHTNING_REDIRECTION_MENTAL_STATE_PENALTY = {
    stressed: 0.05,
    shaken: 0.15,
    broken: 0.30
};
const LIGHTNING_REDIRECTION_MIN_SUCCESS_CHANCE = 0.10;

// --- MAIN MOVE RESOLUTION FUNCTION ---
export function calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locationId) {
    if (!move || typeof move !== 'object' || !move.name) {
        move = { ...DEFAULT_MOVE_PROPERTIES, name: "ErrorMove", type: 'Offense', power: 5 };
    }
    if (!attacker || typeof attacker !== 'object') {
        attacker = { id: 'unknown-attacker', name: 'Unknown Attacker', momentum: 0, tacticalState: null, mobility: 0.5, type: 'Unknown', pronouns: {s:'they', p:'their', o:'them'}, escalationState: ESCALATION_STATES.NORMAL, aiLog: [] };
    }
    if (!defender || typeof defender !== 'object') {
        defender = { id: 'unknown-defender', name: 'Unknown Defender', stunDuration: 0, tacticalState: null, hp: 100, pronouns: {s:'they', p:'their', o:'them'}, escalationState: ESCALATION_STATES.NORMAL, specialTraits: {}, aiLog: [] };
    }
    if (!conditions || typeof conditions !== 'object') {
        conditions = { id: 'unknown-location', isDay: true, isNight: false, environmentalModifiers: {} };
    }
    if (!interactionLog || !Array.isArray(interactionLog)) {
        interactionLog = [];
    }
    if (!environmentState || typeof environmentState !== 'object') {
        environmentState = { damageLevel: 0, lastDamageSourceId: null, specificImpacts: new Set() };
    }
    if (typeof locationId !== 'string') {
        locationId = conditions.id || 'unknown-location';
    }

    // --- GLOBAL REACTIVE DEFENSE HOOK ---
    // Pass the current battle state if available, default to empty object if not
    const battleStateForReactive = {
        locationId: locationId,
        turn: attacker.currentTurn || 0, // Assuming currentTurn is tracked on actor, otherwise pass from battle engine
        isDay: conditions.isDay,
        isNight: conditions.isNight,
        // ... other relevant battle state properties if needed by reactive defenses
    };
    const reactiveResult = checkReactiveDefense(attacker, defender, move, battleStateForReactive, interactionLog);

    if (reactiveResult.reacted) {
        attacker.aiLog.push(`[Reactive Defense Triggered]: ${defender.name}'s ${reactiveResult.type} against ${move.name}. Success: ${reactiveResult.success}`);
        defender.aiLog.push(`[Reactive Defense Activated]: ${reactiveResult.type} against ${attacker.name}'s ${move.name}. Success: ${reactiveResult.success}`);
        console.log(`[REDIRECTION CHECK]: Attacker=${attacker.id}, Defender=${defender.id}, Move=${move.name}`); // Debug log
        console.log(`[REDIRECTION RESULT]: Reacted=${reactiveResult.reacted}, Success=${reactiveResult.success}`); // Debug log

        // The reactiveResult should now contain all necessary outcome details.
        // The core idea is that if a reaction *happened*, it dictates the immediate outcome of *this specific interaction*.
        // The actual damage/stun/etc., should be part of the reactiveResult.
        let finalDamageToDefender = 0;
        let stunToAttacker = 0;
        let resultingMomentumChangeAttacker = reactiveResult.momentumChangeAttacker || 0;
        let resultingMomentumChangeDefender = reactiveResult.momentumChangeDefender || 0;

        if (reactiveResult.type === 'lightning_redirection') {
            if (reactiveResult.success) {
                finalDamageToDefender = 0; // Zuko takes no damage on success
                stunToAttacker = reactiveResult.stunAppliedToAttacker || 0;
                // Momentum already set in reactiveResult
            } else { // Failed redirection
                // Damage calculation for failed redirect is now part of reactiveResult
                // basePower and multiplier are defined below, ensure they are accessible if needed
                // For now, assume reactiveResult.damage is the damage Zuko takes on fail
                finalDamageToDefender = Math.round((move.power || DEFAULT_MOVE_PROPERTIES.power) * (1.0 - (reactiveResult.damageMitigation || 0)));
                // Momentum already set
            }
        }
        // Other reactive types would go here

        return {
            effectiveness: { label: reactiveResult.effectivenessLabel || "Reacted", emoji: reactiveResult.effectivenessEmoji || "🛡️" },
            damage: clamp(Math.round(finalDamageToDefender), 0, 100), // Damage to the defender (Zuko in this case)
            energyCost: clamp(Math.round((move.power || DEFAULT_MOVE_PROPERTIES.power) * 0.22) + 4, 4, 100), // Attacker still uses energy
            wasPunished: !reactiveResult.success, // Defender might be "punished" by a failed reaction
            payoff: reactiveResult.success, // Successful reaction is a payoff for the defender
            consumedStateName: null,
            collateralDamage: reactiveResult.collateralDamage !== undefined ? reactiveResult.collateralDamage : Math.round((COLLATERAL_IMPACT_MULTIPLIERS[move.collateralImpact || 'none'] || 0) * (move.power || 0) * 0.3),
            momentumChange: { attacker: resultingMomentumChangeAttacker, defender: resultingMomentumChangeDefender },
            isReactedAction: true, // Flag that this was a reactive outcome
            reactionType: reactiveResult.type,
            reactionSuccess: reactiveResult.success,
            narrativeEvents: reactiveResult.narrativeEvents || [], // Pass narrative events generated by the reactive defense
            stunAppliedToOriginalAttacker: stunToAttacker // Specific for redirection
        };
    }
    // --- END GLOBAL REACTIVE DEFENSE HOOK ---


    let basePower = move.power || DEFAULT_MOVE_PROPERTIES.power;
    let multiplier = 1.0;
    let wasPunished = false;
    let payoff = false;
    let consumedStateName = null;
    let damage = 0;
    let collateralDamage = 0;
    const powerForEnergyCalc = typeof move.power === 'number' ? move.power : DEFAULT_MOVE_PROPERTIES.power;
    let energyCost = (move.name === 'Struggle') ? 0 : Math.round(powerForEnergyCalc * 0.22) + 4;

    let momentumChangeAttacker = 0;
    let momentumChangeDefender = 0;

    const locationData = locationConditions[locationId];
    const collateralImpactType = move.collateralImpact || DEFAULT_MOVE_PROPERTIES.collateralImpact;
    const baseCollateralImpact = COLLATERAL_IMPACT_MULTIPLIERS[collateralImpactType] || 0;

    if (baseCollateralImpact > 0 && locationData) {
        let fragilityMultiplier = locationData.fragility !== undefined ? locationData.fragility : 0.5;
        const moveElement = move.element || DEFAULT_MOVE_PROPERTIES.element;
        const elementalCollateralMod = locationData.collateralModifiers?.[moveElement]?.damageMultiplier || 1.0;
        collateralDamage = Math.round(basePower * baseCollateralImpact * fragilityMultiplier * elementalCollateralMod);
        collateralDamage = clamp(collateralDamage, 0, 30);
    }

    // This was already here, no change
    // const moveTags = move.moveTags || []; // already defined at top of function for reactive check

    if (moveTags.includes('requires_opening')) {
        const openingExists = defender.stunDuration > 0 || defender.tacticalState;
        if (openingExists) {
            if (defender.tacticalState) {
                multiplier *= (defender.tacticalState.intensity || 1.0);
                consumedStateName = defender.tacticalState.name;
                interactionLog.push(`${attacker.name}'s ${move.name} was amplified by ${defender.name} being ${defender.tacticalState.name}.`);
                payoff = true;
                damage += 5;
                momentumChangeAttacker += 1;
            } else if (defender.stunDuration > 0) {
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
            interactionLog.push(`${attacker.name}'s ${move.name} was punished due to lack of opening.`);
            attacker.aiLog.push(`[Move Punished]: ${move.name} was less effective due to no opening.`);
        }
    }

    if (move.isRepositionMove) {
        const mobilityFactor = attacker.mobility !== undefined ? attacker.mobility : 0.5;
        const successChance = 0.4 + (mobilityFactor * 0.6);
        const roll = Math.random();
        let effectivenessResult = DEFAULT_EFFECTIVENESS;

        if (roll < successChance) {
            const intensity = 1.1 + (mobilityFactor * 0.3);
            attacker.tacticalState = { name: 'Repositioned', duration: 1, intensity, isPositive: true };
            interactionLog.push(`${attacker.name} successfully repositioned, gaining a tactical advantage.`);
            momentumChangeAttacker += 1;
            effectivenessResult = effectivenessLevels.CRITICAL || DEFAULT_EFFECTIVENESS;
            attacker.aiLog.push(`[Reposition Success]: Gained 'Repositioned' state.`);
        } else {
            const intensity = 1.0 + ((1 - mobilityFactor) * 0.5);
            if (roll > successChance + (0.5 * (1 - successChance))) {
                attacker.tacticalState = { name: 'Exposed', duration: 1, intensity, isPositive: false };
                interactionLog.push(`${attacker.name} failed to reposition effectively and is now exposed.`);
                momentumChangeAttacker -= 2;
                momentumChangeDefender += 1;
                effectivenessResult = effectivenessLevels.WEAK || DEFAULT_EFFECTIVENESS;
                wasPunished = true;
                attacker.aiLog.push(`[Reposition Fail]: Became 'Exposed'.`);
            } else {
                attacker.tacticalState = { name: 'Off-Balance', duration: 1, intensity, isPositive: false };
                interactionLog.push(`${attacker.name}'s repositioning attempt left them off-balance.`);
                momentumChangeAttacker -= 1;
                effectivenessResult = effectivenessLevels.NORMAL || DEFAULT_EFFECTIVENESS;
                attacker.aiLog.push(`[Reposition Partial Fail]: Became 'Off-Balance'.`);
            }
        }
        return {
            effectiveness: effectivenessResult,
            damage: 0,
            energyCost: Math.max(5, energyCost - 5),
            wasPunished,
            payoff: false,
            consumedStateName: null,
            collateralDamage: 0,
            momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender }
        };
    }

    const { multiplier: envMultiplier, energyCostModifier: envEnergyMod, logReasons } = applyEnvironmentalModifiers(move, attacker, conditions);
    multiplier *= envMultiplier;
    energyCost *= envEnergyMod;
    if (logReasons.length > 0) {
        interactionLog.push(`${attacker.name}'s ${move.name} was influenced by: ${logReasons.join(', ')}.`);
        attacker.aiLog.push(`[Env Influence]: ${move.name} affected by ${logReasons.join(', ')} (x${envMultiplier.toFixed(2)} power, x${envEnergyMod.toFixed(2)} energy).`);
    }

    let critChance = 0.1;
    const attackerMomentum = typeof attacker.momentum === 'number' ? attacker.momentum : 0;
    critChance = clamp(critChance + getMomentumCritModifier({ momentum: attackerMomentum }), 0.01, 0.5);
    attacker.aiLog.push(`[Crit Chance]: Base 0.1, Momentum Mod ${getMomentumCritModifier({ momentum: attackerMomentum }).toFixed(2)}, Final ${critChance.toFixed(2)} for ${move.name}.`);

    const totalEffectivenessValue = basePower * multiplier;
    let effectivenessLevel = DEFAULT_EFFECTIVENESS;

    if (Math.random() < critChance) {
        effectivenessLevel = effectivenessLevels.CRITICAL || DEFAULT_EFFECTIVENESS;
        damage += Math.round(totalEffectivenessValue * 0.5);
        momentumChangeAttacker += 2;
        momentumChangeDefender -= 1;
        interactionLog.push(`Critical Hit! ${attacker.name}'s crit chance was ${Math.round(critChance * 100)}%.`);
        attacker.aiLog.push(`[Move Result]: ${move.name} was CRITICAL!`);
    } else if (totalEffectivenessValue < basePower * 0.7) {
        effectivenessLevel = effectivenessLevels.WEAK || DEFAULT_EFFECTIVENESS;
        momentumChangeAttacker -= 1;
        momentumChangeDefender += 1;
        attacker.aiLog.push(`[Move Result]: ${move.name} was WEAK.`);
    } else if (totalEffectivenessValue > basePower * 1.1) {
        effectivenessLevel = effectivenessLevels.STRONG || DEFAULT_EFFECTIVENESS;
        damage += Math.round(totalEffectivenessValue * 0.25);
        momentumChangeAttacker += 1;
        attacker.aiLog.push(`[Move Result]: ${move.name} was STRONG.`);
    } else {
        effectivenessLevel = effectivenessLevels.NORMAL || DEFAULT_EFFECTIVENESS;
        attacker.aiLog.push(`[Move Result]: ${move.name} was NORMAL.`);
    }

    if (move.setup?.name === 'Pinned' && effectivenessLevel.label !== 'Weak') {
        if (defender.stunDuration > 0) {
            defender.stunDuration++;
            interactionLog.push(`${defender.name}'s stun duration was extended by being Pinned! Now ${defender.stunDuration} turn(s).`);
            defender.aiLog.push(`[Stun Extended]: Stun duration increased to ${defender.stunDuration} by Pinned state.`);
        }
    }

    if (effectivenessLevel.label === 'Critical' && move.type !== 'Defense' && !move.isRepositionMove) {
        defender.stunDuration = (defender.stunDuration || 0) + 1;
        interactionLog.push(`${defender.name} is stunned for 1 turn from the critical ${move.name}! Stun Duration: ${defender.stunDuration}.`);
        defender.aiLog.push(`[Stun Applied]: Stunned for 1 turn by critical ${move.name}. Total: ${defender.stunDuration}.`);
    }

    const moveType = move.type || DEFAULT_MOVE_PROPERTIES.type;
    if (moveType.includes('Offense') || moveType.includes('Finisher')) {
        damage += Math.round(totalEffectivenessValue / 3);
    } else if (moveType.includes('Defense')) {
        if (effectivenessLevel === (effectivenessLevels.CRITICAL || DEFAULT_EFFECTIVENESS)) {
            momentumChangeAttacker += 1;
            momentumChangeDefender -= 1;
        } else if (effectivenessLevel === (effectivenessLevels.WEAK || DEFAULT_EFFECTIVENESS)) {
            momentumChangeAttacker -= 1;
        }
    }

    if (damage > 0 && defender.escalationState) {
        const originalDamage = damage;
        damage = applyEscalationDamageModifier(damage, defender.escalationState);
        if (damage > originalDamage) {
            interactionLog.push(`${defender.name} is ${defender.escalationState}, taking increased damage from ${move.name}! (${originalDamage} -> ${damage})`);
            momentumChangeAttacker += 0.5;
            momentumChangeDefender -= 0.5;
            attacker.aiLog.push(`[EDM Applied]: Damage to ${defender.name} increased from ${originalDamage} to ${damage} due to their escalation state ${defender.escalationState}.`);
        }
    }

    return {
        effectiveness: effectivenessLevel,
        damage: clamp(Math.round(damage), 0, 100),
        energyCost: clamp(Math.round(energyCost), 4, 100),
        wasPunished,
        payoff,
        consumedStateName,
        collateralDamage: Math.round(collateralDamage),
        momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender }
    };
}

export function getAvailableMoves(actor, conditions) {
    const struggleMove = { name: "Struggle", verb: 'struggle', type: 'Offense', power: 10, element: 'physical', moveTags: [] };
    if (!actor || typeof actor !== 'object' || !actor.id) {
        return [struggleMove];
    }
    if (!conditions || typeof conditions !== 'object' || !conditions.id) {
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
        currentTechniquesSource = actor.techniques;
    }

    const validTechniques = currentTechniquesSource.filter(move => move && typeof move === 'object' && move.name && move.type);

    let available = validTechniques.filter(move => {
        const moveElement = move.element || DEFAULT_MOVE_PROPERTIES.element;
        if (disabledElements.includes(moveElement) && !move.isCanteenMove) return false;

        if (conditions.id === 'boiling-rock' && (moveElement === 'water' || moveElement === 'ice') && !move.isCanteenMove) {
            if (move.isRepositionMove) return true;
            return false;
        }
        // Lightning Redirection is reactive, not actively chosen from available moves
        if (move.name === "Lightning Redirection") return false;

        const usageRequirements = move.usageRequirements || {};
        return Object.entries(usageRequirements).every(([key, val]) => conditions[key] === val);
    });

    if (available.length === 0) {
        available.push(struggleMove);
    }
    return available;
}

function applyEnvironmentalModifiers(move, attacker, conditions) {
    let multiplier = 1.0;
    let energyCostModifier = 1.0;
    let logReasons = [];

    const attackerPrimaryType = attacker?.type || 'Unknown';
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
                if (mod.description && !logReasons.some(r => r.includes(mod.description))) {
                    logReasons.push(`${mod.description} (energy cost)`);
                } else if (!mod.description) {
                     logReasons.push(`Location affects ${moveElement} energy cost`);
                }
            }
        }
    }

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