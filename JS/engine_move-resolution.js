// FILE: engine_move-resolution.js
'use strict';

// Version 1.7: Correctly process detailed reactiveResult from checkReactiveDefense

// --- IMPORTS ---
import { effectivenessLevels } from './data_narrative_effectiveness.js';
import { punishableMoves } from './move-interaction-matrix.js';
import { locationConditions } from './location-battle-conditions.js';
import { getMomentumCritModifier } from './engine_momentum.js';
import { applyEscalationDamageModifier, ESCALATION_STATES } from './engine_escalation.js';
import { checkReactiveDefense } from './engine_reactive-defense.js';
import { BATTLE_PHASES } from './engine_battle-phase.js'; // NEW: Import BATTLE_PHASES

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// MOVED TO TOP-LEVEL SCOPE
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
// Added modifyMomentum as a parameter
export function calculateMove(move, attacker, defender, conditions, interactionLog, environmentState, locationId, modifyMomentum) {
    if (!move || typeof move !== 'object' || !move.name) {
        move = { ...DEFAULT_MOVE_PROPERTIES, name: "ErrorMove", type: 'Offense', power: 5 };
    }
    const currentMoveTags = Array.isArray(move.moveTags) ? move.moveTags : [];
    // Ensure the move object itself has its tags correctly for reactive defense check.
    // This is primarily for the `lightning_attack` tag for Zuko's redirection.
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
    // Pass modifyMomentum to checkReactiveDefense
    const reactiveResult = checkReactiveDefense(attacker, defender, moveForReactiveCheck, battleStateForReactive, interactionLog, modifyMomentum);

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
                stunAppliedToOriginalAttacker = reactiveResult.stunAppliedToAttacker || 0; // Use reactiveResult, not redirectionResult
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
        // Momentum changes are now handled directly by attemptLightningRedirection
        // so no need to call modifyMomentum here.

        return {
            effectiveness: { label: reactiveResult.effectivenessLabel, emoji: reactiveResult.effectivenessEmoji },
            damage: clamp(Math.round(finalDamageToDefender), 0, 100),
            energyCost: originalMoveEnergyCost, // Original attacker still expended energy
            wasPunished: !reactiveResult.success, // The reaction itself might be "punished" if it fails
            payoff: reactiveResult.success,
            consumedStateName: null, // Reactions generally don't consume states in the same way
            collateralDamage: reactiveResult.collateralDamage !== undefined ? reactiveResult.collateralDamage : 0,
            momentumChange: { attacker: reactiveResult.momentumChangeAttacker || 0, defender: reactiveResult.momentumChangeDefender || 0 }, // Momentum from reaction itself
            isReactedAction: true,
            reactionType: reactiveResult.type,
            reactionSuccess: reactiveResult.success,
            narrativeEventsToPrepend: reactiveResult.narrativeEvents || [], // Key for narrative engine
            stunDuration: 0 // No stun from reposition moves
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
    let stunDurationApplied = 0; // NEW: Initialize for regular stun application

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
        let successChance = 0.4 + (mobilityFactor * 0.6); // Base 40% + up to 60% from mobility
        
        // Apply environmental mobility modifiers
        if (locationData?.environmentalModifiers?.mobility_move) {
            const envMobMod = locationData.environmentalModifiers.mobility_move;
            successChance *= (envMobMod.damageMultiplier || 1.0); // Assuming damageMultiplier acts as general effectiveness
            if (envMobMod.description) interactionLog.push(`${attacker.name}'s mobility affected by environment: ${envMobMod.description}`);
            
            // Azula/Ozai's Jet Propulsion mitigating muddy terrain or enhancing verticality
            if (attacker.specialTraits?.canJetPropel && (locationData.isMuddy || locationData.isVertical)) {
                successChance = Math.min(1.0, successChance * 1.5); // Boost success in muddy/vertical terrain if can jet propel
                interactionLog.push(`${attacker.name}'s jet propulsion partially mitigates/enhances mobility in this terrain.`);
                attacker.aiLog.push(`[Env Effect]: Jet Propulsion buffed Reposition in ${locationData.isMuddy ? 'muddy' : 'vertical'} terrain.`);
            }
        }

        const roll = Math.random();
        let effectivenessResult = DEFAULT_EFFECTIVENESS;

        if (roll < successChance) { // Successful reposition
            const intensity = 1.1 + (mobilityFactor * 0.3); // More mobile = better positive state
            attacker.tacticalState = { name: 'Repositioned', duration: 1, intensity, isPositive: true };
            interactionLog.push(`${attacker.name} successfully repositioned, gaining a tactical advantage.`);
            modifyMomentum(attacker, 1, `Successful reposition by ${attacker.name}`); // Use passed modifyMomentum
            effectivenessResult = effectivenessLevels.CRITICAL || DEFAULT_EFFECTIVENESS; // Treat as critical for narrative
            attacker.aiLog.push(`[Reposition Success]: Gained 'Repositioned' state.`);
        } else { // Failed or partially failed reposition
            const intensity = 1.0 + ((1 - mobilityFactor) * 0.5); // Less mobile = worse negative state
            if (roll > successChance + (0.5 * (1 - successChance))) { // Critical fail on reposition
                attacker.tacticalState = { name: 'Exposed', duration: 1, intensity, isPositive: false };
                interactionLog.push(`${attacker.name} failed to reposition effectively and is now exposed.`);
                modifyMomentum(attacker, -2, `Failed reposition by ${attacker.name}`); // Use passed modifyMomentum
                modifyMomentum(defender, 1, `Opponent failed reposition by ${attacker.name}`); // Use passed modifyMomentum
                effectivenessResult = effectivenessLevels.WEAK || DEFAULT_EFFECTIVENESS;
                wasPunished = true;
                attacker.aiLog.push(`[Reposition Fail]: Became 'Exposed'.`);
            } else { // Normal fail on reposition
                attacker.tacticalState = { name: 'Off-Balance', duration: 1, intensity, isPositive: false };
                interactionLog.push(`${attacker.name}'s repositioning attempt left them off-balance.`);
                modifyMomentum(attacker, -1, `Partial reposition fail by ${attacker.name}`); // Use passed modifyMomentum
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
            momentumChange: { attacker: 0, defender: 0 }, // Momentum handled by direct modifyMomentum calls
            stunDuration: 0 // No stun from reposition moves
        };
    }

    const { multiplier: envMultiplier, energyCostModifier: envEnergyMod, logReasons } = applyEnvironmentalModifiers(move, attacker, conditions, currentMoveTags);
    multiplier *= envMultiplier;
    energyCost *= envEnergyMod;
    if (logReasons.length > 0) {
        interactionLog.push(`${attacker.name}'s ${move.name} was influenced by: ${logReasons.join(', ')}.`);
        attacker.aiLog.push(`[Env Influence]: ${move.name} affected by ${logReasons.join(', ')} (x${envMultiplier.toFixed(2)} power, x${envEnergyMod.toFixed(2)} energy).`);
    }

    // NEW MECHANIC: Toph's Aerial Threat Vulnerability
    if (locationData?.environmentalModifiers?.aerialAttackVulnerability && defender.specialTraits?.seismicSense && attacker.mobility > defender.mobility * 1.5) { // Check if attacker is significantly more mobile (implies aerial advantage)
        const vulnerabilityMod = locationData.environmentalModifiers.aerialAttackVulnerability;
        if (move.element !== 'earth' && move.element !== 'physical' && move.type !== 'Defense') { // Only applies to non-earth/physical attacks, not defensive moves
            // Assuming this modifier is configured to apply when defender is 'grounded' and attacker is 'airborne'.
            // For now, simplify to: if attacker has significantly higher mobility than defender, and is not using an earth/physical move.
            multiplier *= (vulnerabilityMod.damageMultiplier || 1.0);
            momentumChangeDefender += (vulnerabilityMod.momentumChangeDefender || 0); // Apply momentum penalty to defender
            logReasons.push(vulnerabilityMod.description);
            attacker.aiLog.push(`[Env Effect]: Defender ${defender.name} (Toph) vulnerable to aerial attack from ${attacker.name}.`);
        }
    }


    let critChance = 0.1; // Base crit chance
    const attackerMomentum = typeof attacker.momentum === 'number' ? attacker.momentum : 0;
    critChance = clamp(critChance + getMomentumCritModifier(attacker), 0.01, 0.5); // Apply momentum mod, clamp
    attacker.aiLog.push(`[Crit Chance]: Base 0.1, Momentum Mod ${getMomentumCritModifier(attacker).toFixed(2)}, Final ${critChance.toFixed(2)} for ${move.name}.`);


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
        effectivenessLevel = DEFAULT_EFFECTIVENESS;
        attacker.aiLog.push(`[Move Result]: ${move.name} was NORMAL.`);
    }

    // Status Effect Chaining Logic (Pinned extending Stun)
    if (move.setup?.name === 'Pinned' && effectivenessLevel.label !== 'Weak') {
        if (defender.stunDuration > 0) {
            // NEW: Add stun resistance based on current stun duration
            const stunResistance = Math.min(0.8, defender.stunDuration * 0.2); // Max 80% resistance
            if (Math.random() > stunResistance) {
                defender.stunDuration++; // Extend existing stun
                interactionLog.push(`${defender.name}'s stun duration was extended by being Pinned! Now ${defender.stunDuration} turn(s).`);
                defender.aiLog.push(`[Stun Extended]: Stun duration increased to ${defender.stunDuration} by Pinned state.`);
            } else {
                interactionLog.push(`${defender.name} resisted the stun extension due to building resistance!`);
                defender.aiLog.push(`[Stun Resisted]: Resisted stun extension with ${(stunResistance * 100).toFixed(0)}% resistance.`);
            }
        }
    }

    // Apply Stun from Critical Hits (if not a defensive move)
    if (effectivenessLevel.label === 'Critical' && move.type !== 'Defense' && !move.isRepositionMove) {
        // NEW: Add stun resistance based on current stun duration
        const stunResistance = Math.min(0.8, defender.stunDuration * 0.2); // Max 80% resistance
        if (Math.random() > stunResistance) {
            // NEW: Cap maximum stun duration at 3 turns
            const newStunDuration = Math.min(3, (defender.stunDuration || 0) + 1);
            defender.stunDuration = newStunDuration;
            interactionLog.push(`${defender.name} is stunned for 1 turn from the critical ${move.name}! Stun Duration: ${defender.stunDuration}.`);
            defender.aiLog.push(`[Stun Applied]: Stunned for 1 turn by critical ${move.name}. Total: ${defender.stunDuration}.`);
        } else {
            interactionLog.push(`${defender.name} resisted the stun effect due to building resistance!`);
            defender.aiLog.push(`[Stun Resisted]: Resisted stun with ${(stunResistance * 100).toFixed(0)}% resistance.`);
        }
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

    // Apply stun chance after effectiveness, but before damage application for narrative context
    if (move.stunChance && Math.random() < move.stunChance && defender.stunImmunityTurns <= 0) {
        stunDurationApplied = move.stunDuration || 1; // Default to 1 turn if stunChance is met
        attacker.aiLog.push(`[Stun Applied]: ${defender.name} stunned for ${stunDurationApplied} turn(s).`);
    }

    // Final clamping and energy cost reduction for utility/defensive moves
    energyCost = clamp(energyCost, 0, 100);
    if (move.type === 'Defense' || move.type === 'Utility') {
        energyCost = Math.max(5, energyCost * 0.7); // Reduce energy cost for non-offensive moves
    }

    return {
        effectiveness: effectivenessLevel,
        damage: clamp(Math.round(damage), 0, 100),
        selfDamage: clamp(Math.round(move.selfDamage || 0), 0, 100),
        energyCost: energyCost,
        wasPunished,
        payoff,
        consumedStateName,
        collateralDamage: Math.round(collateralDamageCalculated),
        momentumChange: { attacker: momentumChangeAttacker, defender: momentumChangeDefender },
        isReactedAction: false,
        stunDuration: stunDurationApplied // NEW: Return applied stun duration
    };
}

export function getAvailableMoves(actor, conditions, currentPhase) { // Add currentPhase param
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
    const isEarthbender = ['bumi', 'toph-beifong'].includes(actor.id);
    const usesEasternAirTempleMoves = isWaterbender && conditions.id === 'eastern-air-temple' && actor.techniquesEasternAirTemple;
    const usesNorthernWaterTribeMoves = isEarthbender && conditions.id === 'northern-water-tribe' && actor.techniquesNorthernWaterTribe;
    const usesOmashuMoves = isEarthbender && conditions.id === 'omashu' && actor.techniquesOmashu;
    const usesSiWongDesertMoves = isEarthbender && conditions.id === 'si-wong-desert' && actor.techniquesSiWongDesert; // NEW: Condition for Si Wong Desert moveset
    const usesBoilingRockMoves = ['bumi', 'toph-beifong'].includes(actor.id) && conditions.id === 'boiling-rock' && actor.techniquesBoilingRock; // NEW: Condition for Boiling Rock moveset

    // NEW: Logic for location-specific movesets
    if (usesEasternAirTempleMoves) {
        currentTechniquesSource = actor.techniquesEasternAirTemple;
        if (currentTechniquesSource.length === 0 && actor.aiLog) {
            actor.aiLog.push(`[Terrain Warning]: ${actor.name} in Eastern Air Temple has no specific moves defined. Falling back to default.`);
            currentTechniquesSource = actor.techniquesFull || actor.techniques || [];
        }
    } else if (usesNorthernWaterTribeMoves) {
        currentTechniquesSource = actor.techniquesNorthernWaterTribe;
        if (currentTechniquesSource.length === 0 && actor.aiLog) {
            actor.aiLog.push(`[Terrain Warning]: ${actor.name} in Northern Water Tribe has no specific earthbending moves defined. Falling back to default.`);
            currentTechniquesSource = actor.techniquesFull || actor.techniques || [];
        }
    } else if (usesOmashuMoves) {
        currentTechniquesSource = actor.techniquesOmashu;
        if (currentTechniquesSource.length === 0 && actor.aiLog) {
            actor.aiLog.push(`[Terrain Warning]: ${actor.name} in Omashu has no specific earthbending moves defined. Falling back to default.`);
            currentTechniquesSource = actor.techniquesFull || actor.techniques || [];
        }
    } else if (usesSiWongDesertMoves) { // NEW: Si Wong Desert moveset priority for earthbenders
        currentTechniquesSource = actor.techniquesSiWongDesert;
        if (currentTechniquesSource.length === 0 && actor.aiLog) {
            actor.aiLog.push(`[Terrain Warning]: ${actor.name} in Si Wong Desert has no specific earthbending moves defined. Falling back to default.`);
            currentTechniquesSource = actor.techniquesFull || actor.techniques || [];
        }
    } else if (usesBoilingRockMoves) { // NEW: Boiling Rock moveset priority for earth/metalbenders
        currentTechniquesSource = actor.techniquesBoilingRock;
        if (currentTechniquesSource.length === 0 && actor.aiLog) {
            actor.aiLog.push(`[Terrain Warning]: ${actor.name} in Boiling Rock has no specific earth/metalbending moves defined. Falling back to default.`);
            currentTechniquesSource = actor.techniquesFull || actor.techniques || [];
        }
    }
    else {
        const hasWaterInLocation = locationData?.waterRich || !disabledElements.includes('water');
        // NEW: Special rule for Boiling Rock waterbenders: always use canteen moves
        const forceCanteenInBoilingRock = isWaterbender && conditions.id === 'boiling-rock' && locationData.hotWaterSource;

        const requiresCanteen = isWaterbender && (forceCanteenInBoilingRock || !hasWaterInLocation || disabledElements.includes('water') || disabledElements.includes('ice'));

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
    }


    const validTechniques = currentTechniquesSource.filter(move => move && typeof move === 'object' && move.name && move.type);

    let available = validTechniques.filter(move => {
        const moveElement = move.element || DEFAULT_MOVE_PROPERTIES.element;
        // If the location specifies this element is disabled AND the move is NOT a canteen move (which bypasses disabling)
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

    // NEW: Poking Phase restrictions
    if (currentPhase === BATTLE_PHASES.POKING) {
        available = available.filter(move => {
            // Only allow low-power offense, utility, defensive, and repositioning moves
            if (move.type === 'Offense' && (move.power || 0) > 40) return false; // Max power 40 for probing offense
            if (move.type === 'Finisher') return false; // No finishers in poking phase
            if (move.moveTags.includes('highRisk')) return false; // No high-risk moves
            // Allow Utility and Defense moves without power restriction
            return true;
        });
    }
    
    if (available.length === 0) {
        available.push(struggleMove); // Fallback to struggle if all moves restricted
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
        // Apply element-specific modifiers (e.g., fire in desert, water in swamp)
        const elementMod = locationData.environmentalModifiers[moveElement];
        if (elementMod) {
            if (typeof elementMod.damageMultiplier === 'number') {
                multiplier *= elementMod.damageMultiplier;
                logReasons.push(`${elementMod.description || `Location affects ${moveElement} damage`}`);
            }
            if (typeof elementMod.energyCostModifier === 'number') {
                energyCostModifier *= elementMod.energyCostModifier;
                if (elementMod.description && !logReasons.some(r => r.includes(elementMod.description))) {
                    logReasons.push(`${elementMod.description} (energy cost)`);
                } else if (!elementMod.description) {
                     logReasons.push(`Location affects ${moveElement} energy cost`);
                }
            }
            // Solar Amplification for Fire/Lightning
            if (elementMod.solar_amplification) {
                multiplier *= 1.25; // Additional buff if solar amplified
                energyCostModifier *= 0.85; // Reduced energy cost
                logReasons.push(`Solar Amplification`);
            }
            // Sensory Impairment for Earth (Toph)
            // If Toph has specific swamp immunity, this particular sensory impairment doesn't apply
            if (elementMod.sensory_impairment && attacker.specialTraits?.seismicSense && !(conditions.id === 'foggy-swamp' && attacker.specialTraits?.swampImmunity)) {
                multiplier *= 0.7; // Reduce effectiveness for seismic-based attacks
                energyCostModifier *= 1.3; // Increase energy cost for impaired sensing
                logReasons.push(`Sensory Impairment`);
            }
            // Moral Restraint for Waterbenders in Boiling Rock
            if (elementMod.moral_restraint_potential && (attacker.id === 'katara' || attacker.id === 'pakku') && (moveElement === 'water' || moveElement === 'ice')) {
                 multiplier *= 0.5; // Halve damage for offensive water/ice moves
                 energyCostModifier *= 1.5; // Increase energy cost
                 logReasons.push(`Moral Restraint (Boiling Water)`);
            }
            // Vertical Threat Vulnerability (for Toph in Boiling Rock)
            if (elementMod.vertical_threat_vulnerability && attacker.id === 'toph-beifong' && move.type !== 'Defense') {
                 multiplier *= 0.7; // General attack effectiveness reduced if fighting aerial/vertical opponents
                 logReasons.push(`Vertical Threat Vulnerability`);
            }
        }

        // Apply modifiers based on move tags, if defined in location conditions
        for (const tag of localMoveTags) {
            const tagMod = locationData.environmentalModifiers[tag];
            if (tagMod) {
                if (typeof tagMod.damageMultiplier === 'number') {
                    multiplier *= tagMod.damageMultiplier;
                    logReasons.push(`${tagMod.description || `Location affects ${tag} move damage`}`);
                }
                if (typeof tagMod.energyCostModifier === 'number') {
                    energyCostModifier *= tagMod.energyCostModifier;
                    if (tagMod.description && !logReasons.some(r => r.includes(tagMod.description))) {
                        logReasons.push(`${tagMod.description} (energy cost)`);
                    } else if (!tagMod.description) {
                         logReasons.push(`Location affects ${tag} move energy cost`);
                    }
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
    // Muddy terrain general mobility penalty for physical/evasive moves
    if (conditions?.isMuddy) {
        if (localMoveTags.includes('mobility_move') || localMoveTags.includes('evasive')) {
            // This multiplier interacts with the general 'mobility_move'/'evasive' modifiers in the swamp.
            // It acts as an additional penalty for *any* character not explicitly buffed.
            // For Azula/Ozai with jet propulsion, this will be counteracted by their specific trait logic.
            multiplier *= 0.8; // Base penalty for general mobility in mud
            energyCostModifier *= 1.2;
            logReasons.push(`muddy terrain hinders mobility`);
        }
        if (attacker.type === 'Nonbender' || attacker.element === 'physical') {
            multiplier *= 0.9; // General physical combat penalty
            energyCostModifier *= 1.1;
            logReasons.push(`muddy terrain hinders physical combat`);
        }
    }


    return { multiplier, energyCostModifier, logReasons };
}