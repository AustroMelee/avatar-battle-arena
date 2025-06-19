/**
 * @fileoverview Manages the state for the character selection UI.
 */

"use strict";

/**
 * @typedef {import('../../types/character.js').CharacterTemplate} CharacterTemplate
 * @typedef {import('./types.js').CharacterSelectionState} CharacterSelectionState
 * @typedef {import('./types.js').SelectionChangeCallback} SelectionChangeCallback
 */

/** @type {CharacterSelectionState} */
export const currentState = {
    fighter1Id: null,
    fighter2Id: null,
    isReady: false,
};

/** @type {SelectionChangeCallback | null} */
let onSelectionChangeCallback = null;

/**
 * Initializes the state module with a change callback.
 * @param {SelectionChangeCallback} callback
 */
export function initializeState(callback) {
    onSelectionChangeCallback = callback;
}

/**
 * Updates the selected character for a fighter.
 * @param {string} fighterKey - 'fighter1' or 'fighter2'.
 * @param {string} characterId - The ID of the selected character.
 */
export function updateSelection(fighterKey, characterId) {
    if (fighterKey === "fighter1") {
        currentState.fighter1Id = characterId;
    } else {
        currentState.fighter2Id = characterId;
    }
    currentState.isReady = !!(currentState.fighter1Id && currentState.fighter2Id);
    triggerCallback();
}

/**
 * Checks if a character is already selected by the other fighter.
 * @param {string} fighterKey - The current fighter key.
 * @param {string} characterId - The character ID to check.
 * @returns {boolean}
 */
export function isCharacterSelectedByOpponent(fighterKey, characterId) {
    const opponentKey = fighterKey === "fighter1" ? "fighter2Id" : "fighter1Id";
    return currentState[opponentKey] === characterId;
}

function triggerCallback() {
    if (typeof onSelectionChangeCallback === "function") {
        try {
            onSelectionChangeCallback({ ...currentState });
        } catch (error) {
            console.error("[Character Selection State] Error in selection change callback:", error);
        }
    }
} 