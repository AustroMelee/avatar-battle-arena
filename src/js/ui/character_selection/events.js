/**
 * @fileoverview Event handling for the character selection UI.
 */

"use strict";

import { updateSelection, isCharacterSelectedByOpponent } from "./state.js";
import { updateGridSelection } from "./dom.js";

/**
 * @typedef {import('../../types/character.js').Character} Character
 */

/**
 * Handles the click/keyboard event for a character card.
 * @param {Event} event
 * @param {Character} character
 * @param {string} fighterKey
 * @param {HTMLElement} selectedCard
 * @param {HTMLElement} grid
 */
export function handleCardSelection(event, character, fighterKey, selectedCard, grid) {
    event.preventDefault();

    if (isCharacterSelectedByOpponent(fighterKey, character.id)) {
        alert("This character is already selected by the opponent.");
        return;
    }

    updateSelection(fighterKey, character.id);
    updateGridSelection(grid, selectedCard);
}

/**
 * Attaches event listeners to a character card.
 * @param {HTMLElement} card
 * @param {Character} character
 * @param {string} fighterKey
 * @param {HTMLElement} grid
 */
export function addCardEventListeners(card, character, fighterKey, grid) {
    const handler = (event) => handleCardSelection(event, character, fighterKey, card, grid);
    card.addEventListener("click", handler);
    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            handler(event);
        }
    });
} 