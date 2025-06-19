"use strict";

/**
 * @fileoverview Character Data Validation Utilities
 * @description Provides functions to validate character templates, stats, and creation options.
 */

/**
 * @typedef {import('./types/character.js').CharacterTemplate} CharacterTemplate
 * @typedef {import('./types/character.js').CharacterStats} CharacterStats
 * @typedef {import('./types/character.js').CharacterCreationOptions} CharacterCreationOptions
 * @typedef {import('./types/ai.js').AiPersonality} AiPersonality
 */

const MAX_CHARACTER_LEVEL = 100;
const VALID_ELEMENTS = ["fire", "water", "earth", "air", "spirit", "physical"];

/**
 * Validates a map of character definitions.
 * @param {Object<string, CharacterTemplate>} characters - A map of character ID to character template.
 * @throws {Error} If any character definition is invalid.
 */
export function validateCharacterDefinitions(characters) {
    if (typeof characters !== "object" || characters === null) {
        throw new Error("validateCharacterDefinitions: character data must be a valid object");
    }

    for (const characterId in characters) {
        if (Object.prototype.hasOwnProperty.call(characters, characterId)) {
            validateCharacterTemplate(characters[characterId], characterId);
        }
    }
}

/**
 * Validates a single character template.
 * @param {CharacterTemplate} template - The character template to validate.
 * @param {string} expectedId - The expected ID of the character.
 * @throws {Error} If the template is invalid.
 */
export function validateCharacterTemplate(template, expectedId) {
    if (!template || typeof template !== "object") {
        throw new Error(`Invalid character template for ID: ${expectedId}`);
    }

    if (template.id !== expectedId) {
        throw new Error(`Template ID '${template.id}' does not match expected ID '${expectedId}'`);
    }

    if (typeof template.name !== "string" || !template.name.trim()) {
        throw new Error(`Invalid or missing name for character: ${expectedId}`);
    }

    if (typeof template.archetype !== "string" || !template.archetype.trim()) {
        throw new Error(`Invalid or missing archetype for character: ${expectedId}`);
    }

    if (!VALID_ELEMENTS.includes(template.element)) {
        throw new Error(`Invalid element '${template.element}' for character: ${expectedId}`);
    }

    if (!template.baseStats || typeof template.baseStats !== "object") {
        throw new Error(`Missing or invalid baseStats for character: ${expectedId}`);
    }
    validateCharacterStats(template.baseStats, expectedId);

    if (!template.personality || typeof template.personality !== "object") {
        throw new Error(`Missing or invalid personality for character: ${expectedId}`);
    }
    validateAiPersonality(template.personality, expectedId);

    if (!Array.isArray(template.moveIds) || template.moveIds.length === 0) {
        throw new Error(`Character ${expectedId} must have at least one move ID`);
    }
}

/**
 * Validates a character's stats object.
 * @param {CharacterStats} stats - The stats object.
 * @param {string} characterId - The ID of the character for error reporting.
 * @throws {Error} If any stat is invalid.
 */
export function validateCharacterStats(stats, characterId) {
    const requiredStats = ["maxHp", "maxEnergy", "attack", "defense", "speed"];
    for (const stat of requiredStats) {
        if (typeof stats[stat] !== "number" || stats[stat] < 0) {
            throw new Error(`[${characterId}]: Invalid or missing stat '${stat}'`);
        }
    }
}

/**
 * Validates an AI personality object.
 * @param {AiPersonality} personality - The personality object.
 * @param {string} characterId - The ID of the character for error reporting.
 * @throws {Error} If any personality trait is invalid.
 */
export function validateAiPersonality(personality, characterId) {
    const requiredTraits = ["aggression", "patience", "riskTolerance", "opportunism", "defensiveBias"];
    for (const trait of requiredTraits) {
        if (typeof personality[trait] !== "number" || personality[trait] < 0 || personality[trait] > 1) {
            throw new Error(`[${characterId}]: Invalid or missing personality trait '${trait}'. Must be a number between 0 and 1.`);
        }
    }
}

/**
 * Validates the options for character creation.
 * @param {CharacterCreationOptions} options - The creation options object.
 * @throws {TypeError|RangeError} If any option is invalid.
 */
export function validateCreationOptions(options) {
    if (typeof options !== "object" || options === null) {
        throw new TypeError("validateCreationOptions: options must be a valid object");
    }

    if (options.level !== undefined && (typeof options.level !== "number" || options.level < 1 || options.level > MAX_CHARACTER_LEVEL)) {
        throw new RangeError(`Invalid level: ${options.level}. Must be between 1 and ${MAX_CHARACTER_LEVEL}`);
    }

    if (options.statModifiers !== undefined && (typeof options.statModifiers !== "object" || options.statModifiers === null)) {
        throw new TypeError("statModifiers must be an object");
    }

    if (options.enableDebug !== undefined && typeof options.enableDebug !== "boolean") {
        throw new TypeError("enableDebug must be a boolean");
    }

    if (options.includeAllMoves !== undefined && typeof options.includeAllMoves !== "boolean") {
        throw new TypeError("includeAllMoves must be a boolean");
    }
}