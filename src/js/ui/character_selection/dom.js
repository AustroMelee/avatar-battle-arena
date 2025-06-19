/**
 * @fileoverview DOM manipulation functions for the character selection UI.
 */

"use strict";

/**
 * @typedef {import('../../types/character.js').CharacterTemplate} CharacterTemplate
 * @typedef {import('./types.js').SelectionElements} SelectionElements
 * @typedef {import('./types.js').CharacterCardConfig} CharacterCardConfig
 * @typedef {import('./types.js').ElementClass} ElementClass
 */

/** @type {Object<string, ElementClass>} */
const ELEMENT_CLASS_MAP = {
    fire: "card-fire", water: "card-water", earth: "card-earth", air: "card-air",
    lightning: "card-fire", ice: "card-water", metal: "card-earth",
    chi: "card-chi", special: "card-chi", nonbender: "card-nonbender",
};
const DEFAULT_ELEMENT_CLASS = "card-nonbender";

/**
 * Creates a single character card DOM element.
 * @param {CharacterCardConfig} config
 * @returns {HTMLElement}
 */
export function createCharacterCard(config) {
    const { character, fighterKey, enableAccessibility = true, enableLazyLoading = true } = config;
    const card = document.createElement("article");
    card.className = "character-card";
    card.classList.add(getElementClass(character));
    card.dataset["id"] = character.id;
    card.dataset["fighterKey"] = fighterKey;

    if (enableAccessibility) {
        card.setAttribute("role", "option");
        card.setAttribute("aria-label", `Select ${character.name}`);
        card.tabIndex = 0;
    }

    const image = document.createElement("img");
    image.src = character.imageUrl || "";
    image.alt = character.name;
    if (enableLazyLoading) image.loading = "lazy";
    card.appendChild(image);

    const name = document.createElement("h3");
    name.textContent = character.name;
    card.appendChild(name);

    return card;
}

/**
 * Updates the visual selection state for a fighter's grid.
 * @param {HTMLElement} grid
 * @param {HTMLElement} selectedCard
 */
export function updateGridSelection(grid, selectedCard) {
    grid.querySelectorAll(".character-card.selected").forEach(card => card.classList.remove("selected"));
    selectedCard.classList.add("selected");
}

/**
 * Populates a grid with character cards.
 * @param {HTMLElement} gridElement
 * @param {Character[]} characters
 * @param {string} fighterKey
 * @param {(card: HTMLElement) => void} onCardCreated - Callback for each created card.
 */
export function populateGrid(gridElement, characters, fighterKey, onCardCreated) {
    gridElement.innerHTML = "";
    for (const character of characters) {
        const card = createCharacterCard({ character, fighterKey });
        gridElement.appendChild(card);
        onCardCreated(card);
    }
}

/**
 * @param {Character} character
 * @returns {ElementClass}
 */
function getElementClass(character) {
    const element = character.element || (character.techniques && character.techniques[0] ? character.techniques[0].element : undefined);
    return ELEMENT_CLASS_MAP[/**@type {string}*/(element)] || DEFAULT_ELEMENT_CLASS;
}

/**
 * Renders the character selection screen.
 * @param {Object<string, CharacterTemplate>} characters - A map of character templates.
 * @param {SelectionElements} elements - The DOM elements for the selection screen.
 */
export function renderCharacterSelection(characters, elements) {
    elements.grid.innerHTML = ""; // Clear existing
    for (const characterId in characters) {
        const character = characters[characterId];
        const card = createCharacterCard(character, { isSelectable: true });
        elements.grid.appendChild(card);
    }
}

/**
 * Creates a single character card element.
 * @param {CharacterTemplate} character - The character to display.
 * @param {CharacterCardConfig} config - Configuration for the card.
 * @returns {HTMLElement} The character card element.
 */
export function createCharacterCard(character, config) {
    const card = document.createElement("div");
    card.className = `char-card ${config.isSelectable ? 'selectable' : ''}`;
    card.dataset.charId = character.id;

    const img = document.createElement("img");
    img.src = character.image || 'path/to/default/image.png';
    img.alt = character.name;

    const name = document.createElement("h3");
    name.textContent = character.name;

    card.append(img, name);
    return card;
} 