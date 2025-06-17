// FILE: js/data_characters.js
'use strict';

// This file serves as the central assembler for all character data.
// It imports character objects from modular files and combines them
// into a single 'characters' object for the rest of the application.

import { gaangCharacters } from './data_characters_gaang.js';
// import { masterCharacters } from './data_characters_masters.js'; // REMOVED
import { antagonistCharacters } from './data_characters_antagonists.js';

import { aangArchetypeData } from './data_archetype_aang.js';
import { azulaArchetypeData } from './data_archetype_azula.js';
// All other archetype imports removed

// Combine all base character data into one object.
const baseCharacters = {
    ...gaangCharacters,
    // ...masterCharacters, // REMOVED
    ...antagonistCharacters,
};

// Create a map of archetypes for easy lookup.
const archetypes = {
    'aang-airbending-only': aangArchetypeData,
    'azula': azulaArchetypeData,
};

/**
 * Merges a base character with their corresponding archetype data.
 * The archetype data (matchup-specific quotes) is spread into the base character object.
 * @param {object} baseChar - The base character data.
 * @param {object} archetype - The archetype data for that character.
 * @returns {object} The fully merged character object.
 */
const mergeCharacterData = (baseChar, archetype) => {
    if (!baseChar) {
        console.error("Attempted to merge with an undefined base character.");
        return null;
    }
    if (!archetype) {
        // This is not an error, as some characters might not have archetype data yet.
        return baseChar;
    }

    // Combine all technique arrays into one.
    const combinedTechniques = [
        ...(baseChar.techniques || []),
        ...(baseChar.techniquesFull || []),
        ...(baseChar.techniquesCanteen || []),
        ...(baseChar.techniquesEasternAirTemple || []),
        ...(baseChar.techniquesNorthernWaterTribe || []),
        ...(baseChar.techniquesOmashu || []),
        ...(baseChar.techniquesSiWongDesert || []),
        ...(baseChar.techniquesBoilingRock || [])
    ];

    return {
        ...baseChar,
        ...archetype, // Spread archetype data (matchup quotes)
        techniques: combinedTechniques, // Overwrite with the master list of techniques
    };
};

// Build the final, exported characters object.
export const characters = Object.keys(baseCharacters).reduce((acc, charId) => {
    const baseChar = baseCharacters[charId];
    const archetype = archetypes[charId];
    const mergedChar = mergeCharacterData(baseChar, archetype);
    if (mergedChar) {
        acc[charId] = mergedChar;
    }
    return acc;
}, {});