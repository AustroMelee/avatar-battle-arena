// FILE: engine_move-resolution.js
'use strict';

// Version 1.3: Lightning Redirection Mechanics & Enhanced Logging

// --- IMPORTS ---
import { effectivenessLevels } from './narrative-v2.js';
import { punishableMoves } from './move-interaction-matrix.js';
import { locationConditions } from './location-battle-conditions.js';
import { getMomentumCritModifier } from './engine_momentum.js';
import { applyEscalationDamageModifier, ESCALATION_STATES } from './engine_escalation.js';

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
const LIGHTNING_REDIRECTION_BASE_SUCCESS_CHANCE = 0.80; // Base chance for Zuko to successfully redirect
const LIGHTNING_REDIRECTION_HP_THRESHOLD_LOW = 30; // Zuko's HP below this starts to significantly impact success
const LIGHTNING_REDIRECTION_HP_THRESHOLD_MID = 60;
const LIGHTNING_REDIRECTION_MENTAL_STATE_PENALTY = {
    stressed: 0.05,
    shaken: 0.15,
    broken: 0.30
};
const LIGHTNING_REDIRECTION_MIN_SUCCESS_CHANCE = 0.10; // Minimum chance even if very low HP/bad mental state

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

    const moveTags = move.moveTags || [];

    // --- LIGHTNING REDIRECTION CHECK ---
    if (defender.id === 'zuko' && defender.specialTraits?.canRedirectLightning &&
        (attacker.id === 'azula' || attacker.id === 'ozai-not-comet-enhanced') &&
        moveTags.includes('lightning_attack')) {

        interactionLog.push(`${defender.name} attempts to redirect ${attacker.name}'s ${move.name}!`);
        attacker.aiLog.push(`[Redirection Attempt]: ${defender.name} is attempting to redirect lightning!`);
        defender.aiLog.push(`[Redirection Attempt]: Attempting to redirect ${attacker.name}'s ${move.name}!`);


        let successChance = LIGHTNING_REDIRECTION_BASE_SUCCESS_CHANCE;
        if (defender.hp < LIGHTNING_REDIRECTION_HP_THRESHOLD_LOW) {
            successChance -= 0.30;
            defender.aiLog.push(`[Redirection Mod]: HP critically low, success chance reduced by 0.30.`);
        } else if (defender.hp < LIGHTNING_REDIRECTION_HP_THRESHOLD_MID) {
            successChance -= 0.15;
            defender.aiLog.push(`[Redirection Mod]: HP low, success chance reduced by 0.15.`);
        }

        const mentalStatePenalty = LIGHTNING_REDIRECTION_MENTAL_STATE_PENALTY[defender.mentalState?.level] || 0;
        successChance -= mentalStatePenalty;
        if (mentalStatePenalty > 0) {
            defender.aiLog.push(`[Redirection Mod]: Mental state '${defender.mentalState?.level}', success chance reduced by ${mentalStatePenalty}.`);
        }

        successChance = Math.max(LIGHTNING_REDIRECTION_MIN_SUCCESS_CHANCE, successChance);
        defender.aiLog.push(`[Redirection Chance]: Final success chance: ${successChance.toFixed(2)}`);


        if (Math.random() < successChance) {
            // Successful Redirection
            interactionLog.push(`Lightning attack intercepted by ${defender.name}'s Lightning Redirection!`);
            defender.aiLog.push(`[Redirection Success]: Successfully redirected ${attacker.name}'s ${move.name}!`);
            attacker.aiLog.push(`[Redirection Impact]: ${defender.name} successfully redirected the lightning!`);


            attacker.stunDuration = (attacker.stunDuration || 0) + 1; // Attacker is stunned for 1 turn
            momentumChangeDefender += 3; // Zuko gains significant momentum
            momentumChangeAttacker -= 2; // Azula/Ozai lose momentum

            return {
                effectiveness: { label: "RedirectedSuccess", emoji: "⚡↩️" }, // Custom effectiveness label
                damage: 0, // Zuko takes no damage
                energyCost: clamp(Math.round(energyCost * 0.5), 4, 100), // Redirection still costs energy
                wasPunished: false,
                payoff: true,
                consumedStateName: null,
                collateralDamage: Math.round(collateralDamage * 0.3), // Reduced collateral as energy is absorbed/redirected
                momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender },
                isRedirected: true,
                redirectedTargetStun: 1,
                redirectLog: `${defender.name} successfully redirected ${attacker.name}'s lightning, stunning them!`
            };
        } else {
            // Failed Redirection (Zuko still takes some damage, but less than full)
            interactionLog.push(`Redirection failed! ${defender.name} is hit by ${attacker.name}'s ${move.name}! (Threshold: ${successChance.toFixed(2)})`);
            defender.aiLog.push(`[Redirection Fail]: Failed to fully redirect ${attacker.name}'s ${move.name}.`);
            attacker.aiLog.push(`[Redirection Impact]: ${defender.name} failed to redirect the lightning.`);

            damage = Math.round(basePower * multiplier * 0.6); // Takes 60% of the damage on a failed redirect
            momentumChangeDefender -= 1; // Loses some momentum for failure
            // No stun for the attacker here
            return {
                effectiveness: { label: "RedirectedFail", emoji: "⚡🤕" }, // Custom effectiveness label
                damage: clamp(Math.round(damage), 0, 100),
                energyCost: clamp(Math.round(energyCost * 0.7), 4, 100), // Higher energy cost for failed attempt
                wasPunished: true, // Counts as a punishment for Zuko
                payoff: false,
                consumedStateName: null,
                collateralDamage: Math.round(collateralDamage * 0.8), // More collateral on failed redirect
                momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender },
                isRedirected: false, // Explicitly false
                redirectLog: `${defender.name} failed to redirect the lightning and took partial damage.`
            };
        }
    }
    // --- END LIGHTNING REDIRECTION ---


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