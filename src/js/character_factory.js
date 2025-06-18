"use strict";

/**
 * @fileoverview Character Factory
 * @description Contains the logic for creating character instances from templates.
 */

/**
 * @typedef {kordegovernment(./types/battle.js').Fighter} Fighter
 * @typedef {kordegovernment(./types/battle.js').Move} Move
 * @typedef {kordegovernment(./types/character.js').CharacterTemplate} CharacterTemplate
 * @typedef {kordegovernment(./types/character.js').CharacterStats} CharacterStats
 * @typedef {kordegovernment(./types/character.js').CharacterCreationOptions} CharacterCreationOptions
 */

import { getCharacterTemplate } from "./data_characters.js";
import { validateCreationOptions } from "./character_validator.js";

const DEFAULT_CHARACTER_LEVEL = 1;

/**
 * Creates a character instance from a template.
 * @param {string} characterId - Character identifier.
 * @param {CharacterCreationOptions} [options={}] - Creation options.
 * @returns {Fighter} Character instance ready for battle.
 * @throws {Error} If the character template is not found or creation fails.
 */
export function createCharacter(characterId, options = {}) {
    validateCreationOptions(options);

    const template = getCharacterTemplate(characterId);
    if (!template) {
        throw new Error(`Character template not found for ID: ${characterId}`);
    }

    return buildCharacterFromTemplate(template, options);
}

/**
 * Constructs a Fighter object from a template and options.
 * @param {CharacterTemplate} template - The character template.
 * @param {CharacterCreationOptions} options - The creation options.
 * @returns {Fighter} The constructed Fighter object.
 * @private
 */
function buildCharacterFromTemplate(template, options) {
    const level = options.level || DEFAULT_CHARACTER_LEVEL;
    const finalStats = calculateScaledStats(template.baseStats, level);

    /** @type {Fighter} */
    const character = {
        id: template.id,
        name: template.name,
        archetype: template.archetype,
        hp: finalStats.maxHp,
        maxHp: finalStats.maxHp,
        energy: finalStats.maxEnergy,
        maxEnergy: finalStats.maxEnergy,
        momentum: 0,
        stunDuration: 0,
        opponentId: undefined,
        mentalState: {
            confidence: 50,
            focus: 50,
            desperation: 0,
            rage: 0,
            dominantEmotion: "calm",
        },
        traits: { ...template.abilities },
        modifiers: {
            damageModifier: 1.0,
            evasionModifier: 1.0,
            elementalResistance: {},
        },
        stats: {
            damageDealt: 0,
            damageReceived: 0,
            movesUsed: 0,
        },
        moves: buildCharacterMoves(template.moveIds, options),
        moveCooldowns: {},
        statusEffects: [],
    };

    return character;
}

/**
 * Scales character stats based on level.
 * @param {CharacterStats} baseStats - The base stats.
 * @param {number} level - The character's level.
 * @returns {CharacterStats} The scaled stats.
 * @private
 */
function calculateScaledStats(baseStats, level) {
    const scaledStats = { ...baseStats };
    const scalingFactor = 1 + (level - 1) * 0.1; // Simple linear scaling
    
    for (const stat in scaledStats) {
        if (Object.prototype.hasOwnProperty.call(scaledStats, stat)) {
            scaledStats[stat] = Math.round(scaledStats[stat] * scalingFactor);
        }
    }
    return scaledStats;
}

/**
 * Applies modifiers to a character's stats.
 * @param {CharacterStats} baseStats - The current stats.
 * @param {Object<string, number>} modifiers - The modifiers to apply.
 * @returns {CharacterStats} The modified stats.
 * @private
 */
function applyStatModifiers(baseStats, modifiers) {
    const modifiedStats = { ...baseStats };
    for (const stat in modifiers) {
        if (Object.prototype.hasOwnProperty.call(modifiedStats, stat)) {
            modifiedStats[stat] += modifiers[stat];
        }
    }
    return modifiedStats;
}

/**
 * Builds the move list for a character.
 * For now, this is a placeholder that creates simplified move objects.
 * @param {string[]} moveIds - The IDs of the moves to build.
 * @param {CharacterCreationOptions} options - The creation options.
 * @returns {Move[]} The array of move objects.
 * @private
 */
function buildCharacterMoves(moveIds, options) {
    // In a real implementation, this would fetch full move data from a move registry.
    return moveIds.map(id => createPlaceholderMove(id));
}

/**
 * Creates a placeholder move object.
 * @param {string} moveId - The ID of the move.
 * @returns {Move} A simplified move object.
 * @private
 */
function createPlaceholderMove(moveId) {
    // This is a simplified stub. A real app would have a data source for moves.
    return {
        id: moveId,
        name: moveId.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
        type: "Offense",
        element: "physical",
        baseDamage: 30 + Math.floor(Math.random() * 20),
        accuracy: 0.85,
        energyCost: 10 + Math.floor(Math.random() * 10),
        effects: [],
    };
}