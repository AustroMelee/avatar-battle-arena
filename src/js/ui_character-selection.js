/**
 * @fileoverview Manages the character selection user interface.
 */

"use strict";

import { characters } from "../../data_characters.js";
import { initializeState } from "./character_selection/state.js";
import { populateGrid } from "./character_selection/dom.js";
import { addCardEventListeners } from "./character_selection/events.js";

/**
 * @typedef {import('./types.js').Character} Character
 * @typedef {import('./character_selection/types.js').SelectionChangeCallback} SelectionChangeCallback
 * @typedef {import('./character_selection/types.js').SelectionElements} SelectionElements
 */

/**
 * Populates the character selection grids.
 * @param {SelectionElements} elements
 * @param {SelectionChangeCallback} onSelectionChange
 */
export function populateCharacterGrids(elements, onSelectionChange) {
    initializeState(onSelectionChange);

    const characterList = Object.values(characters)
        .filter(c => c && c.id && c.name)
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const setupGrid = (grid, fighterKey) => {
        if (!grid) return;
        populateGrid(grid, characterList, fighterKey, (card) => {
            const characterId = card.dataset.id;
            const character = characterList.find(c => c.id === characterId);
            if (character) {
                addCardEventListeners(card, character, fighterKey, grid);
            }
        });
    };

    setupGrid(elements.fighter1Grid, "fighter1");
    setupGrid(elements.fighter2Grid, "fighter2");
}