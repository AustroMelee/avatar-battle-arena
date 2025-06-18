"use strict";

/**
 * A utility module for evaluating various dynamic conditions
 * related to characters, battle state, and environment.
 * This centralizes complex conditional logic for scalability.
 */

/**
 * Evaluates if a character is currently in an 'in_control' state based on their HP and opponent's mental state.
 * This is an example of a dynamic condition that could be used by AI or narrative systems.
 * @param {object} character - The character object.
 * @param {object} opponent - The opponent character object.
 * @param {object} battleState - The current battle state object.
 * @returns {boolean} True if the character is considered 'in control'.
 */
export function isInControl(character, opponent, battleState) {
    if (!character || !opponent || !battleState) return false;
    return (character.hp > character.maxHp * 0.5) &&
           !(battleState.characterReceivedCriticalHit) &&
           (opponent.mentalState.level === "stable" || opponent.mentalState.level === "stressed");
}

/**
 * Evaluates if a character is in a 'desperate_broken' state based on their HP or mental state.
 * @param {object} character - The character object.
 * @param {object} opponent - The opponent character object.
 * @param {object} battleState - The current battle state object.
 * @returns {boolean} True if the character is considered 'desperate broken'.
 */
export function isDesperateBroken(character, opponent, battleState) {
    if (!character) return false;
    return (character.hp < character.maxHp * 0.3) ||
           (character.mentalState.level === "broken");
}

// Add more generic or specific condition evaluation functions here as needed. 