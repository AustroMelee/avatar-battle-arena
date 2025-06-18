"use strict";

/**
 * @fileoverview Character Data System - Public API
 * @description Central registry and access point for all character definitions and creation.
 */

/**
 * @typedef {import('./types/character.js').CharacterTemplate} CharacterTemplate
 * @typedef {import('./types/character.js').CharacterRegistry} CharacterRegistry
 * @typedef {import('./types/battle.js').Fighter} Fighter
 */

import { allCharacterData } from "./data_characters_index.js";
import { validateCharacterDefinitions } from "./character_validator.js";
import { groupCharactersByElement, groupCharactersByNation } from "./character_utils.js";

/** @type {CharacterRegistry | null} */
let characterRegistry = null;

/**
 * Initializes the character registry with all available characters.
 * This function is idempotent and safe to call multiple times.
 * @returns {CharacterRegistry} The initialized character registry.
 * @throws {Error} If character data is invalid or initialization fails.
 */
export function initializeCharacterRegistry() {
    if (characterRegistry) {
        return characterRegistry;
    }

    try {
        validateCharacterDefinitions(allCharacterData);

        const availableIds = Object.keys(allCharacterData);
        const byElement = groupCharactersByElement(allCharacterData);
        const byNation = groupCharactersByNation(allCharacterData);

        characterRegistry = /** @type {CharacterRegistry} */ ({
            templates: allCharacterData,
            availableIds,
            byElement,
            byNation
        });

        console.debug(`[Character Data] Registry initialized with ${availableIds.length} characters.`);
        return characterRegistry;

    } catch (/** @type {any} */ error) {
        console.error("[Character Data] Failed to initialize character registry:", error);
        throw new Error(`Character registry initialization failed: ${error.message}`);
    }
}

/**
 * Gets the current character registry, initializing it if necessary.
 * @returns {CharacterRegistry} The character registry.
 */
export function getCharacterRegistry() {
    if (characterRegistry) {
        return characterRegistry;
    }
    return initializeCharacterRegistry();
}

/**
 * Gets a character template by its ID.
 * @param {string} characterId - The unique identifier for the character.
 * @returns {CharacterTemplate | null} The character template or null if not found.
 */
export function getCharacterTemplate(characterId) {
    if (!characterId) return null;
    const registry = getCharacterRegistry();
    return registry.templates[characterId] || null;
}

/**
 * Gets all available character IDs.
 * @returns {string[]} An array of character IDs.
 */
export function getAllCharacterIds() {
    const registry = getCharacterRegistry();
    return [...registry.availableIds];
}

/**
 * Gets character IDs filtered by a specific element.
 * @param {string} element - The element to filter by.
 * @returns {string[]} An array of character IDs matching the element.
 */
export function getCharactersByElement(element) {
    const registry = getCharacterRegistry();
    return registry.byElement[element] || [];
}

/**
 * Gets character IDs filtered by a specific nation.
 * @param {string} nation - The nation to filter by.
 * @returns {string[]} An array of character IDs matching the nation.
 */
export function getCharactersByNation(nation) {
    const registry = getCharacterRegistry();
    return registry.byNation[nation] || [];
}

/**
 * Checks if a character ID is valid and exists in the registry.
 * @param {string} characterId - The character ID to validate.
 * @returns {boolean} True if the character exists, false otherwise.
 */
export function isValidCharacter(characterId) {
    if (!characterId) return false;
    const registry = getCharacterRegistry();
    return registry.availableIds.includes(characterId);
}