"use strict";

/**
 * @fileoverview Character Data Utility Functions
 * @description Provides helper functions for grouping and organizing character data.
 */

/**
 * @typedef {import('./types/character.js').CharacterTemplate} CharacterTemplate
 */

import { allCharacterData } from "./data_characters_index.js";

/**
 * Groups characters by their element type.
 * @param {Object<string, CharacterTemplate>} characters - A map of character ID to character template.
 * @returns {{[x: string]: string[]}} A map of element types to character IDs.
 */
export function groupCharactersByElement(characters) {
    /** @type {{[x: string]: string[]}} */
    const byElement = {};
    for (const id in characters) {
        const character = characters[id];
        const element = character.element;
        if (!byElement[element]) {
            byElement[element] = [];
        }
        byElement[element].push(id);
    }
    return byElement;
}

/**
 * Groups characters by their nation.
 * @param {Object<string, CharacterTemplate>} characters - A map of character ID to character template.
 * @returns {{[x: string]: string[]}} A map of nations to character IDs.
 */
export function groupCharactersByNation(characters) {
    /** @type {{[x: string]: string[]}} */
    const byNation = {};
    for (const id in characters) {
        const character = characters[id];
        const nation = character.faction; // Assuming faction is nation
        if (!byNation[nation]) {
            byNation[nation] = [];
        }
        byNation[nation].push(id);
    }
    return byNation;
}

/**
 * Gets a list of all character IDs.
 * @returns {string[]} An array of character IDs.
 */
export function getCharacterIds() {
    return Object.keys(allCharacterData);
}