// FILE: engine/move-resolution.js
'use strict';

// This is the "Combat Math" module. Its sole purpose is to calculate the
// outcome of a move, including damage, effectiveness, energy cost, and the
// effects of environmental factors and special conditions like punishments.

import { effectivenessLevels } from '../js/narrative-v2.js';
import { punishableMoves } from '../js/move-interaction-matrix.js';

// --- HELPER FUNCTIONS ---
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export function calculateMove(move, attacker, defender, conditions, interactionLog) {
    let basePower = move.power || 30;
    let multiplier = 1.0;
    let wasPunished = false;
    let payoff = false;
    let consumedStateName = null;
    let damage = 0;

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
    
    const { multiplier: envMultiplier, logReasons: envReasons } = applyEnvironmentalModifiers(move, attacker, conditions);
    multiplier *= envMultiplier;
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
    const energyCost = (move.name === 'Struggle') ? 0 : Math.round((move.power || 0) * 0.22) + 4;
    
    return { effectiveness: level, damage: clamp(damage, 0, 50), energyCost: clamp(energyCost, 4, 100), wasPunished, payoff, consumedStateName };
}

export function getAvailableMoves(actor, conditions) {
    if (!actor.techniques) return [];
    return actor.techniques.filter(move => Object.entries(move.usageRequirements || {}).every(([key, val]) => conditions[key] === val));
}

function applyEnvironmentalModifiers(move, attacker, conditions) {
    let multiplier = 1.0;
    let logReasons = [];
    const isFirebender = attacker.techniques.some(t => t.element === 'fire' || t.element === 'lightning');
    const isWaterbender = attacker.techniques.some(t => t.element === 'water' || t.element === 'ice');
    if (conditions.isDay) { if (isFirebender) { multiplier *= 1.1; logReasons.push(`daylight`); } if (isWaterbender) { multiplier *= 0.9; }
    } else if (conditions.isNight) { if (isFirebender) { multiplier *= 0.9; } if (isWaterbender) { multiplier *= 1.1; logReasons.push(`nighttime`); } }
    return { multiplier, logReasons };
}