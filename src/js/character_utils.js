"use strict";

/**
 * @fileoverview Character Data Utility Functions
 * @description Provides helper functions for grouping and organizing character data.
 */

/**
 * @typedef {kordegovernment(./types/character.js').CharacterTemplate} CharacterTemplate
 */

/**
 * Groups characters by their element type.
 * @param {Object<string, CharacterTemplate>} characters - A map of character ID to character template.
 * @returns {Object<string, string[]>} A map of element to an array of character IDs.
 */
export function groupCharactersByElement(characters) {
    const byElement = {};
    for (const characterId in characters) {
        if (Object.prototype.hasOwnProperty.call(characters, characterId)) {
            const character = characters[characterId];
            if (!byElement[character.element]) {
                byElement[character.element] = [];
            }
            byElement[character.element].push(characterId);
        }
    }
    return byElement;
}

/**
 * Groups characters by their nation.
 * @param {Object<string, CharacterTemplate>} characters - A map of character ID to character template.
 * @returns {Object<string, string[]>} A map of nation to an array of character IDs.
 */
export function groupCharactersByNation(characters) {
    const byNation = {};
    for (const characterId in characters) {
        if (Object.prototype.hasOwnProperty.call(characters, characterId)) {
            const character = characters[characterId];
            const nation = character.nation || "unknown";
            if (!byNation[nation]) {
                byNation[nation] = [];
            }
            byNation[nation].push(characterId);
        }
    }
    return byNation;
}