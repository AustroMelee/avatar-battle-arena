// FILE: js/context-engine.js
'use strict';

import { characters } from './characters.js';
import { terrainTags } from './locations.js';

/**
 * Determines a character's available techniques based on personality, location, and move properties.
 * This engine ensures battles are contextually aware and lore-accurate.
 *
 * @param {string} charId - The ID of the character.
 * @param {string} locId - The ID of the location.
 * @returns {Array} An array of technique objects appropriate for the context.
 */
export function getContextualMoveset(charId, locId) {
    const character = characters[charId];
    const locationTags = new Set(terrainTags[locId] || []);

    // 1. Handle Environmental Overrides (e.g., Waterbenders in the desert)
    if (character.canteenMoves) {
        const isArid = (locationTags.has('sandy') || locationTags.has('hot')) && !locationTags.has('water_rich');
        if (isArid) {
            // In a dry environment, a waterbender can ONLY use their limited canteen moves.
            return character.canteenMoves;
        }
    }

    let contextualMoves = [...character.techniques];

    // 2. Filter moves based on location tags
    contextualMoves = contextualMoves.filter(move => {
        if (move.moveTags.includes('requires_water_source') && !locationTags.has('water_rich')) {
            return false; // Remove move if it needs water and there is none.
        }
        if (move.moveTags.includes('requires_ice_source') && !locationTags.has('ice_rich')) {
            return false; // Remove move if it needs ice and there is none.
        }
        if (move.moveTags.includes('requires_earth_source') && !locationTags.has('earth_rich')) {
            return false;
        }
        if (move.moveTags.includes('requires_metal_source') && !locationTags.has('metal_rich')) {
            return false;
        }
        // Add more source requirements as needed (e.g., plants)
        return true;
    });

    // 3. Filter moves based on character personality and location type
    const isUrbanOrCivilized = locationTags.has('urban') || locationTags.has('dense');
    
    if (isUrbanOrCivilized) {
        if (character.personalityTags.includes('restrained')) {
            // Restrained characters will not use highly destructive moves in civilized areas.
            contextualMoves = contextualMoves.filter(move => !move.moveTags.includes('collateral_damage_high'));
        }
        if (character.personalityTags.includes('pacifistic')) {
            // Pacifistic characters avoid even moderately destructive moves in cities.
            contextualMoves = contextualMoves.filter(move => 
                !move.moveTags.includes('collateral_damage_high') && 
                !move.moveTags.includes('collateral_damage_medium')
            );
        }
    }

    // Ensure there's always at least one move to prevent errors.
    if (contextualMoves.length === 0) {
        // Fallback to a single, simple, non-elemental move if all others are filtered out.
        return [{ name: "Desperate Strike", verb: 'strike', object: 'desperately', type: 'Offense', power: 20, emoji: '👊', element: 'physical', moveTags: [] }];
    }

    return contextualMoves;
}