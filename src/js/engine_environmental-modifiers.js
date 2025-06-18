// FILE: js/engine_environmental-modifiers.js
'use strict';

// This module centralizes the logic for calculating how the environment
// affects a move's power and energy cost.

import { locationConditions } from './location-battle-conditions.js';

/**
 * Calculates environmental modifiers for a given move.
 * @param {object} move - The move being executed.
 * @param {object} attacker - The character performing the move.
 * @param {object} conditions - The current battle conditions (location, time of day).
 * @param {string[]} moveTags - The tags associated with the move.
 * @returns {object} An object with { multiplier, energyCostModifier, logReasons }.
 */
export function applyEnvironmentalModifiers(move, attacker, conditions, moveTags) {
    let multiplier = 1.0;
    let energyCostModifier = 1.0;
    let logReasons = [];

    const moveElement = move?.element || 'physical';
    const locationData = locationConditions[conditions?.id];

    // Time of Day Modifiers
    if (conditions?.isDay && (moveElement === 'fire' || moveElement === 'lightning')) {
        multiplier *= 1.1;
        logReasons.push(`daylight empowers firebending`);
    } else if (conditions?.isNight && (moveElement === 'fire' || moveElement === 'lightning')) {
        multiplier *= 0.9;
        energyCostModifier *= 1.1;
        logReasons.push(`nighttime penalizes firebending`);
    }
    
    // Location-Specific Modifiers
    if (locationData?.environmentalModifiers) {
        const elementMod = locationData.environmentalModifiers[moveElement];
        if (elementMod) {
            if (typeof elementMod.damageMultiplier === 'number') {
                multiplier *= elementMod.damageMultiplier;
            }
            if (typeof elementMod.energyCostModifier === 'number') {
                energyCostModifier *= elementMod.energyCostModifier;
            }
            if (elementMod.description) {
                logReasons.push(elementMod.description);
            }
        }

        // Tag-based modifiers
        for (const tag of moveTags) {
            const tagMod = locationData.environmentalModifiers[tag];
            if (tagMod) {
                if (typeof tagMod.damageMultiplier === 'number') multiplier *= tagMod.damageMultiplier;
                if (typeof tagMod.energyCostModifier === 'number') energyCostModifier *= tagMod.energyCostModifier;
                if (tagMod.description) logReasons.push(tagMod.description);
            }
        }
    }
    
    // General condition modifiers
    if (conditions?.isHot && (moveElement === 'fire' || moveElement === 'lightning')) {
        multiplier *= 1.05;
        logReasons.push(`hot environment empowers ${moveElement}`);
    }

    return { multiplier, energyCostModifier, logReasons: [...new Set(logReasons)] }; // Return unique reasons
}