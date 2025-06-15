// FILE: engine_move-resolution.js
'use strict';

// Version 1.7: Correctly process detailed reactiveResult from checkReactiveDefense

// --- IMPORTS ---
import { effectivenessLevels } from './narrative-v2.js';
import { punishableMoves } from './move-interaction-matrix.js';
import { locationConditions } from './location-battle-conditions.js';
import { getMomentumCritModifier, modifyMomentum as applyMomentumChange } from './engine_momentum.js'; // Renamed for clarity
import { applyEscalationDamageModifier, ESCALATION_STATES } from './engine_escalation.js';
import { checkReactiveDefense } from './engine_reactive-defense.js';

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

// --- MAIN MOVE RESOLUTION FUNCTION ---
export function calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locationId) {
    if (!move || typeof move !== 'object' || !move.name) {
        move = { ...DEFAULT_MOVE_PROPERTIES, name: "ErrorMove", type: 'Offense', power: 5 };
    }
    const currentMoveTags = Array.isArray(move.moveTags) ? move.moveTags : [];
    // Ensure the move object itself has its tags correctly for reactive defense check
    const moveForReactiveCheck = { ...move, moveTags: currentMoveTags };


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
    const battleStateForReactive = {
        locationId: locationId,
        turn: attacker.currentTurn || 0, // Ensure currentTurn is available on attacker object
        isDay: conditions.isDay,
        isNight: conditions.isNight,
        // Add other necessary battleState properties if needed by specific reactive defenses
    };
    const reactiveResult = checkReactiveDefense(attacker, defender, moveForReactiveCheck, battleStateForReactive, interactionLog);

    if (reactiveResult.reacted) {
        attacker.aiLog.push(`[Reactive Defense Triggered]: ${defender.name}'s ${reactiveResult.type} against ${move.name}. Success: ${reactiveResult.success}`);
        defender.aiLog.push(`[Reactive Defense Activated]: ${reactiveResult.type} against ${attacker.name}'s ${move.name}. Success: ${reactiveResult.success}`);
        console.log(`[REACTIVE DEFENSE TRACER in calculateMove]: Attacker=${attacker.id}, Defender=${defender.id}, Move=${move.name}`);
        console.log(`[REACTIVE DEFENSE TRACER in calculateMove]: Result=${JSON.stringify(reactiveResult)}`);

        let finalDamageToDefender = 0; // Damage to the one reacting (e.g., Zuko)
        let stunAppliedToOriginalAttacker = 0;
        // Energy cost for the original attacker's move still applies
        const originalMoveEnergyCost = clamp(Math.round((move.power || DEFAULT_MOVE_PROPERTIES.power) * 0.22) + 4, 4, 100);

        if (reactiveResult.type === 'lightning_redirection') {
            if (reactiveResult.success) {
                finalDamageToDefender = 0; // Zuko takes no damage
                stunAppliedToOriginalAttacker = reactiveResult.stunAppliedToAttacker || 0;
                // Attacker (Azula/Ozai) is stunned
                if (stunAppliedToOriginalAttacker > 0) {
                    attacker.stunDuration = (attacker.stunDuration || 0) + stunAppliedToOriginalAttacker;
                    interactionLog.push(`${attacker.name} is stunned for ${stunAppliedToOriginalAttacker} turn(s) by the redirected lightning!`);
                    attacker.aiLog.push(`[Stun Applied]: Stunned by ${defender.name}'s successful redirection. Duration: ${attacker.stunDuration}.`);
                }
            } else { // Failed redirection
                // Zuko (defender) takes partial damage
                const baseLightningPower = move.power || DEFAULT_MOVE_PROPERTIES.power;
                finalDamageToDefender = Math.round(baseLightningPower * (1.0 - (reactiveResult.damageMitigation || 0)));
                interactionLog.push(`${defender.name} takes ${finalDamageToDefender} damage from the partially absorbed lightning.`);
                defender.aiLog.push(`[Damage Taken]: Took ${finalDamageToDefender} damage from failed lightning redirection.`);
            }
        }
        // Apply momentum changes from the reaction
        if (reactiveResult.momentumChangeAttacker) applyMomentumChange(attacker, reactiveResult.momentumChangeAttacker, `Opponent ${reactiveResult.type}`);
        if (reactiveResult.momentumChangeDefender) applyMomentumChange(defender, reactiveResult.momentumChangeDefender, `Successful ${reactiveResult.type}`);

        return {
            effectiveness: { label: reactiveResult.effectivenessLabel, emoji: reactiveResult.effectivenessEmoji },
            damage: clamp(Math.round(finalDamageToDefender), 0, 100),
            energyCost: originalMoveEnergyCost, // Original attacker still expended energy
            wasPunished: !reactiveResult.success, // The reaction itself might be "punished" if it fails
            payoff: reactiveResult.success,
            consumedStateName: null, // Reactions generally don't consume states in the same way
            collateralDamage: reactiveResult.collateralDamage !== undefined ? reactiveResult.collateralDamage : 0,
            momentumChange: { attacker: 0, defender: 0 }, // Momentum already applied via reactiveResult
            isReactedAction: true,
            reactionType: reactiveResult.type,
            reactionSuccess: reactiveResult.success,
            narrativeEventsToPrepend: reactiveResult.narrativeEvents || [] // Key for narrative engine
            // stunAppliedToOriginalAttacker is handled above by modifying attacker.stunDuration directly
        };
    }
    // --- END GLOBAL REACTIVE DEFENSE HOOK ---


    let basePower = move.power || DEFAULT_MOVE_PROPERTIES.power;
    let multiplier = 1.0;
    let wasPunished = false;
    let payoff = false;
    let consumedStateName = null;
    let damage = 0;
    let collateralDamageCalculated = 0; // Renamed to avoid conflict with the return property
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
        collateralDamageCalculated = Math.round(basePower * baseCollateralImpact * fragilityMultiplier * elementalCollateralMod);
        collateralDamageCalculated = clamp(collateralDamageCalculated, 0, 30);
    }

    if (currentMoveTags.includes('requires_opening')) {
        const openingExists = defender.stunDuration > 0 || defender.tacticalState;
        if (openingExists) {
            if (defender.tacticalState) {
                multiplier *= (defender.tacticalState.intensity || 1.0);
                consumedStateName = defender.tacticalState.name;
                interactionLog.push(`${attacker.name}'s ${move.name} was amplified by ${defender.name} being ${defender.tacticalState.name}.`);
                payoff = true;
                damage += 5; // Bonus damage for capitalizing
                momentumChangeAttacker += 1;
            } else if (defender.stunDuration > 0) { // Defender is stunned
                multiplier *= 1.3; // Stunned opponents are easier to hit well
                interactionLog.push(`${attacker.name}'s ${move.name} capitalized on ${defender.name} being stunned.`);
                payoff = true;
                damage += 3; // Bonus damage
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
        const successChance = 0.4 + (mobilityFactor * 0.6); // Base 40% + up to 60% from mobility
        const roll = Math.random();
        let effectivenessResult = DEFAULT_EFFECTIVENESS;

        if (roll < successChance) { // Successful reposition
            const intensity = 1.1 + (mobilityFactor * 0.3); // More mobile = better positive state
            attacker.tacticalState = { name: 'Repositioned', duration: 1, intensity, isPositive: true };
            interactionLog.push(`${attacker.name} successfully repositioned, gaining a tactical advantage.`);
            momentumChangeAttacker += 1;
            effectivenessResult = effectivenessLevels.CRITICAL || DEFAULT_EFFECTIVENESS; // Treat as critical for narrative
            attacker.aiLog.push(`[Reposition Success]: Gained 'Repositioned' state.`);
        } else { // Failed or partially failed reposition
            const intensity = 1.0 + ((1 - mobilityFactor) * 0.5); // Less mobile = worse negative state
            if (roll > successChance + (0.5 * (1 - successChance))) { // Critical fail on reposition
                attacker.tacticalState = { name: 'Exposed', duration: 1, intensity, isPositive: false };
                interactionLog.push(`${attacker.name} failed to reposition effectively and is now exposed.`);
                momentumChangeAttacker -= 2;
                momentumChangeDefender += 1;
                effectivenessResult = effectivenessLevels.WEAK || DEFAULT_EFFECTIVENESS;
                wasPunished = true;
                attacker.aiLog.push(`[Reposition Fail]: Became 'Exposed'.`);
            } else { // Normal fail on reposition
                attacker.tacticalState = { name: 'Off-Balance', duration: 1, intensity, isPositive: false };
                interactionLog.push(`${attacker.name}'s repositioning attempt left them off-balance.`);
                momentumChangeAttacker -= 1;
                effectivenessResult = effectivenessLevels.NORMAL || DEFAULT_EFFECTIVENESS;
                attacker.aiLog.push(`[Reposition Partial Fail]: Became 'Off-Balance'.`);
            }
        }
        return {
            effectiveness: effectivenessResult,
            damage: 0, // Reposition moves typically don't do direct damage
            energyCost: Math.max(5, energyCost - 5), // Reduced energy cost for utility
            wasPunished,
            payoff: false, // Not a payoff move in the standard sense
            consumedStateName: null,
            collateralDamage: 0, // No direct collateral
            momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender }
        };
    }

    const { multiplier: envMultiplier, energyCostModifier: envEnergyMod, logReasons } = applyEnvironmentalModifiers(move, attacker, conditions, currentMoveTags);
    multiplier *= envMultiplier;
    energyCost *= envEnergyMod;
    if (logReasons.length > 0) {
        interactionLog.push(`${attacker.name}'s ${move.name} was influenced by: ${logReasons.join(', ')}.`);
        attacker.aiLog.push(`[Env Influence]: ${move.name} affected by ${logReasons.join(', ')} (x${envMultiplier.toFixed(2)} power, x${envEnergyMod.toFixed(2)} energy).`);
    }

    let critChance = 0.1; // Base crit chance
    const attackerMomentum = typeof attacker.momentum === 'number' ? attacker.momentum : 0;
    critChance = clamp(critChance + getMomentumCritModifier({ momentum: attackerMomentum }), 0.01, 0.5); // Apply momentum mod, clamp
    attacker.aiLog.push(`[Crit Chance]: Base 0.1, Momentum Mod ${getMomentumCritModifier({ momentum: attackerMomentum }).toFixed(2)}, Final ${critChance.toFixed(2)} for ${move.name}.`);


    const totalEffectivenessValue = basePower * multiplier;
    let effectivenessLevel = DEFAULT_EFFECTIVENESS;

    if (Math.random() < critChance) {
        effectivenessLevel = effectivenessLevels.CRITICAL || DEFAULT_EFFECTIVENESS;
        damage += Math.round(totalEffectivenessValue * 0.5); // Crit damage bonus
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
        damage += Math.round(totalEffectivenessValue * 0.25); // Strong damage bonus
        momentumChangeAttacker += 1;
        attacker.aiLog.push(`[Move Result]: ${move.name} was STRONG.`);
    } else {
        effectivenessLevel = effectivenessLevels.NORMAL || DEFAULT_EFFECTIVENESS;
        attacker.aiLog.push(`[Move Result]: ${move.name} was NORMAL.`);
    }

    // Status Effect Chaining Logic (Pinned extending Stun)
    if (move.setup?.name === 'Pinned' && effectivenessLevel.label !== 'Weak') {
        if (defender.stunDuration > 0) {
            defender.stunDuration++; // Extend existing stun
            interactionLog.push(`${defender.name}'s stun duration was extended by being Pinned! Now ${defender.stunDuration} turn(s).`);
            defender.aiLog.push(`[Stun Extended]: Stun duration increased to ${defender.stunDuration} by Pinned state.`);
        }
    }

    // Apply Stun from Critical Hits (if not a defensive move)
    if (effectivenessLevel.label === 'Critical' && move.type !== 'Defense' && !move.isRepositionMove) {
        defender.stunDuration = (defender.stunDuration || 0) + 1; // Add 1 turn of stun
        interactionLog.push(`${defender.name} is stunned for 1 turn from the critical ${move.name}! Stun Duration: ${defender.stunDuration}.`);
        defender.aiLog.push(`[Stun Applied]: Stunned for 1 turn by critical ${move.name}. Total: ${defender.stunDuration}.`);
    }

    const moveType = move.type || DEFAULT_MOVE_PROPERTIES.type;
    if (moveType.includes('Offense') || moveType.includes('Finisher')) {
        damage += Math.round(totalEffectivenessValue / 3); // Base damage calculation for offensive moves
    } else if (moveType.includes('Defense')) {
        // Momentum for successful defense
        if (effectivenessLevel === (effectivenessLevels.CRITICAL || DEFAULT_EFFECTIVENESS)) { // Assuming critical defense is a strong success
            momentumChangeAttacker += 1;
            momentumChangeDefender -= 1;
        } else if (effectivenessLevel === (effectivenessLevels.WEAK || DEFAULT_EFFECTIVENESS)) { // Weak defense means it failed
            momentumChangeAttacker -= 1;
        }
    }

    // Apply Escalation Damage Modifier (EDM)
    if (damage > 0 && defender.escalationState) { // Ensure defender has escalationState
        const originalDamage = damage;
        damage = applyEscalationDamageModifier(damage, defender.escalationState);
        if (damage > originalDamage) {
            interactionLog.push(`${defender.name} is ${defender.escalationState}, taking increased damage from ${move.name}! (${originalDamage} -> ${damage})`);
            momentumChangeAttacker += 0.5; // Slight momentum boost for attacker hitting vulnerable target
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
        collateralDamage: Math.round(collateralDamageCalculated),
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
            if (move.isRepositionMove) return true; // Reposition is okay
            return false; // Other water/ice moves disabled without canteen
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

function applyEnvironmentalModifiers(move, attacker, conditions, moveTagsParam) {
    let multiplier = 1.0;
    let energyCostModifier = 1.0;
    let logReasons = [];

    const attackerPrimaryType = attacker?.type || 'Unknown';
    const moveElement = move?.element || DEFAULT_MOVE_PROPERTIES.element;
    const localMoveTags = Array.isArray(moveTagsParam) ? moveTagsParam : (Array.isArray(move?.moveTags) ? move.moveTags : []);


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

    if (conditions?.isSlippery && localMoveTags.includes('evasive')) {
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