// FILE: js/data_characters.js
'use strict';

// This file serves as the central assembler for all character data.
// It imports character objects from modular files and combines them
// into a single 'characters' object for the rest of the application.

import { gaangCharacters } from './data_characters_gaang.js';
// import { masterCharacters } from './data_characters_masters.js'; // REMOVED
import { antagonistCharacters } from './data_characters_antagonists.js';

import { allArchetypes } from './data_archetypes_index.js';

/**
 * @typedef {object} CharacterTechnique
 * @property {string} name - The name of the technique.
 * @property {string} verb - The verb used when the character performs the technique (e.g., 'unleash', 'form').
 * @property {string} object - The object of the verb (e.g., 'a focused blast of air', 'a swirling shield of wind').
 * @property {string} type - The type of move (e.g., 'Offense', 'Defense', 'Utility', 'Finisher').
 * @property {number} power - The base power of the move.
 * @property {string} element - The bending element or 'physical'/'utility' for non-benders/general moves.
 * @property {string[]} moveTags - An array of tags describing the move (e.g., 'ranged_attack', 'evasive', 'debuff_disable').
 * @property {string} collateralImpact - 'none', 'low', 'medium', 'high', 'catastrophic' indicating environmental damage.
 * @property {boolean} [requiresArticle] - Whether the object needs an 'a' or 'an' article.
 * @property {object} [setup] - Details if the move sets up a state for future moves.
 * @property {string} [setup.name] - Name of the setup state.
 * @property {number} [setup.duration] - Duration of the setup state.
 * @property {number} [setup.intensity] - Intensity of the setup state.
 * @property {boolean} [isRepositionMove] - True if this move is primarily for repositioning.
 * @property {number} [selfDamage] - Optional damage the character takes from this move.
 */

/**
 * @typedef {object} CharacterPersonalityProfile
 * @property {number} aggression - How aggressive the character is (0-1).
 * @property {number} patience - How patient the character is (0-1).
 * @property {number} riskTolerance - How risk-tolerant the character is (0-1).
 * @property {number} opportunism - How opportunistic the character is (0-1).
 * @property {number} creativity - How creative the character is (0-1).
 * @property {number} defensiveBias - How much the character prefers defensive moves (0-1).
 * @property {number} antiRepeater - How much the character avoids repeating moves (0-1).
 * @property {number} predictability - How predictable the character's actions are (0-1).
 * @property {object} signatureMoveBias - Object with move names as keys and bias multipliers as values.
 */

/**
 * @typedef {object} CharacterSpecialTraits
 * @property {number} [resilientToManipulation] - Modifier for resistance to manipulation.
 * @property {boolean} [isAvatar] - True if the character is the Avatar.
 * @property {boolean} [ethicalRestraintSwamp] - Specific trait for Aang in the Foggy Swamp.
 * @property {number} [manipulative] - How manipulative the character is (0-1).
 * @property {boolean} [canGenerateLightning] - True if the character can generate lightning.
 * @property {boolean} [canJetPropel] - True if the character can jet propel.
 */

/**
 * @typedef {object} CharacterQuotes
 * @property {string[]} [postWin] - Quotes for winning a battle.
 * @property {string[]} [postWin_overwhelming] - Quotes for winning overwhelmingly.
 * @property {object.<string, string>} [postWin_specific] - Specific win quotes keyed by opponent ID.
 */

/**
 * @typedef {object} CharacterRelationship
 * @property {string} relationshipType - Describes the nature of the relationship (e.g., 'sibling_rivalry_dominant').
 * @property {number} stressModifier - Modifies stress accumulation in this relationship.
 * @property {number} resilienceModifier - Modifies resilience in this relationship.
 * @property {object} [narrative] - Relationship-specific narrative snippets.
 */

/**
 * @typedef {object} CharacterPersonalityTriggerFunction
 * @property {function(object, object, object): boolean} [in_control] - Function to determine 'in_control' state.
 * @property {function(object, object, object): boolean} [desperate_broken] - Function to determine 'desperate_broken' state.
 */

/**
 * @typedef {object} CharacterData
 * @property {string} id - Unique identifier for the character.
 * @property {string} name - Display name of the character.
 * @property {string} type - 'Bender' or 'Non-Bender'.
 * @property {string} element - Bending element (e.g., 'air', 'fire', 'water', 'earth', 'chi', 'physical', 'lightning').
 * @property {object} pronouns - Pronoun object { s: 'she'|'he'|'it', p: 'her'|'his'|'its', o: 'her'|'him'|'it' }.
 * @property {string} imageUrl - URL to the character's portrait.
 * @property {string} victoryStyle - Describes how the character wins (e.g., 'Pacifist', 'Ruthless').
 * @property {number} powerTier - Numeric representation of character's general power level.
 * @property {string} faction - Character's faction (e.g., 'AirNomad', 'FireNation').
 * @property {boolean} [isInsane] - Specific trait for Azula.
 * @property {CharacterPersonalityProfile} personalityProfile - Defines AI behavior.
 * @property {CharacterSpecialTraits} specialTraits - Unique abilities or characteristics.
 * @property {number} collateralTolerance - How much collateral damage the character tolerates (0-1).
 * @property {number} mobility - Character's mobility rating (0-1).
 * @property {object[]} curbstompRules - Array of rules that can trigger curbstomp scenarios.
 * @property {CharacterPersonalityTriggerFunction} personalityTriggers - Functions for evaluating dynamic personality states.
 * @property {number} incapacitationScore - Current incapacitation score (used internally).
 * @property {string} escalationState - Current escalation state (e.g., 'Normal').
 * @property {number} stunDuration - Current stun duration.
 * @property {object.<string, object>} escalationBehavior - AI behavior modifiers based on escalation state.
 * @property {CharacterTechnique[]} techniques - Array of techniques the character can perform.
 * @property {CharacterQuotes} quotes - Collection of narrative quotes.
 * @property {object.<string, CharacterRelationship>} relationships - Relationships with other characters, keyed by opponent ID.
 */

// Combine all base character data into one object.
const baseCharacters = {
    ...gaangCharacters,
    // ...masterCharacters, // REMOVED
    ...antagonistCharacters,
};

// Create a map of archetypes for easy lookup.
const archetypes = allArchetypes;

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

/**
 * The main characters object, containing all merged character data, keyed by character ID.
 * @type {object.<string, CharacterData>}
 */
export const characters = Object.keys(baseCharacters).reduce((acc, charId) => {
    const baseChar = baseCharacters[charId];
    const archetype = archetypes[charId];
    const mergedChar = mergeCharacterData(baseChar, archetype);
    if (mergedChar) {
        acc[charId] = mergedChar;
    }
    return acc;
}, {});