/**
 * @fileoverview Curbstomp State Management
 * @description Purely tracks who's marked for defeat, supports resetting, querying, and serializing the state
 * @version 1.0
 */

"use strict";

// This Set tracks characters marked for defeat
let charactersMarkedForDefeat = new Set();

/**
 * Resets the set of characters marked for defeat. Should be called before each battle.
 */
export function resetCurbstompState() {
    charactersMarkedForDefeat.clear();
}

/**
 * Marks a character for defeat
 * @param {string} characterId - Character ID to mark for defeat
 */
export function markCharacterForDefeat(characterId) {
    charactersMarkedForDefeat.add(characterId);
}

/**
 * Checks if a character is marked for defeat
 * @param {string} characterId - Character ID to check
 * @returns {boolean} True if character is marked for defeat
 */
export function isCharacterMarkedForDefeat(characterId) {
    return charactersMarkedForDefeat.has(characterId);
}

/**
 * Gets all characters marked for defeat
 * @returns {Set<string>} Set of character IDs marked for defeat
 */
export function getMarkedCharacters() {
    return new Set(charactersMarkedForDefeat);
}

/**
 * Serializes the current state for save/load/debug
 * @returns {Object} Serialized state
 */
export function serializeState() {
    return {
        markedCharacters: Array.from(charactersMarkedForDefeat)
    };
}

/**
 * Restores state from serialized data
 * @param {Object} state - Serialized state to restore
 */
export function restoreState(state) {
    charactersMarkedForDefeat = new Set(state.markedCharacters || []);
}

// Export the Set for backward compatibility (read-only access)
export { charactersMarkedForDefeat }; 