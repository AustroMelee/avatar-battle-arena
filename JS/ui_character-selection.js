// FILE: ui_character-selection.js
'use strict';

// Manages character selection UI elements and interactions.

import { characters } from './data_characters.js';

console.log('Characters object as imported by ui_character-selection:', characters);

let fighter1Grid = null;
let fighter2Grid = null;
let fighter1NameDisplay = null;
let fighter2NameDisplay = null;
let fighter1Select = null; // Hidden input for value
let fighter2Select = null; // Hidden input for value
let onSelectionChangeCallback = null;

/**
 * Gets the CSS class for a character card based on their primary element.
 * @param {object} character - The character data object.
 * @returns {string} The CSS class name.
 */
function getElementClass(character) {
    if (!character || !character.techniques || character.techniques.length === 0) {
        return 'card-nonbender';
    }
    const mainElementTechnique = character.techniques.find(t => t.element);
    const mainElement = mainElementTechnique ? mainElementTechnique.element : 'nonbender';
    switch (mainElement) {
        case 'fire': case 'lightning': return 'card-fire';
        case 'water': case 'ice': return 'card-water';
        case 'earth': case 'metal': return 'card-earth';
        case 'air': return 'card-air';
        case 'special': return 'card-chi';
        default: return 'card-nonbender';
    }
}

/**
 * Creates a single character card DOM element.
 * @param {object} character - The character data.
 * @param {string} fighterKey - 'fighter1' or 'fighter2'.
 * @returns {HTMLElement} The created card element.
 */
function createCharacterCard(character, fighterKey) {
    const card = document.createElement('div');
    card.className = 'character-card';
    if (character) {
        card.classList.add(getElementClass(character));
        card.dataset.id = character.id;

        const image = document.createElement('img');
        image.src = character.imageUrl;
        image.alt = character.name;
        image.loading = 'lazy';
        card.appendChild(image);

        const name = document.createElement('h3');
        name.textContent = character.name;
        card.appendChild(name);

        card.addEventListener('click', () => {
            handleCardClick(character, fighterKey, card);
        });
    } else {
        card.textContent = 'No character data';
    }
    return card;
}

/**
 * Handles the click event for a character card.
 * @param {object} character - The selected character's data.
 * @param {string} fighterKey - 'fighter1' or 'fighter2'.
 * @param {HTMLElement} selectedCard - The clicked card element.
 */
function handleCardClick(character, fighterKey, selectedCard) {
    if (!character) return;

    const currentFighterSelect = (fighterKey === 'fighter1' ? fighter1Select : fighter2Select);
    const otherFighterSelect = (fighterKey === 'fighter1' ? fighter2Select : fighter1Select);

    if (otherFighterSelect && otherFighterSelect.value === character.id) {
        alert("A fighter cannot battle themselves. Please choose a different opponent.");
        return;
    }

    const grid = (fighterKey === 'fighter1' ? fighter1Grid : fighter2Grid);
    if (grid) grid.querySelectorAll('.character-card').forEach(card => card.classList.remove('selected'));
    
    selectedCard.classList.add('selected');
    
    const nameDisplay = (fighterKey === 'fighter1' ? fighter1NameDisplay : fighter2NameDisplay);
    if (nameDisplay) nameDisplay.textContent = character.name;
    
    if (currentFighterSelect) currentFighterSelect.value = character.id;

    if (onSelectionChangeCallback) {
        onSelectionChangeCallback();
    }
}

/**
 * Populates the character selection grids with cards for all available characters.
 * @param {HTMLElement} f1GridElement - The DOM element for fighter 1's grid.
 * @param {HTMLElement} f2GridElement - The DOM element for fighter 2's grid.
 * @param {HTMLElement} f1NameDisplayElement - The DOM element for fighter 1's name display.
 * @param {HTMLElement} f2NameDisplayElement - The DOM element for fighter 2's name display.
 * @param {HTMLElement} f1SelectElement - The hidden input for fighter 1's ID.
 * @param {HTMLElement} f2SelectElement - The hidden input for fighter 2's ID.
 * @param {function} selectionChangedCallback - Callback to execute when a selection changes.
 */
export function populateCharacterGrids(f1GridElement, f2GridElement, f1NameDisplayElement, f2NameDisplayElement, f1SelectElement, f2SelectElement, selectionChangedCallback) {
    // Store references to DOM elements
    fighter1Grid = f1GridElement || document.getElementById('fighter1-grid');
    fighter2Grid = f2GridElement || document.getElementById('fighter2-grid');
    fighter1NameDisplay = f1NameDisplayElement || document.getElementById('fighter1-name-display');
    fighter2NameDisplay = f2NameDisplayElement || document.getElementById('fighter2-name-display');
    fighter1Select = f1SelectElement || document.getElementById('fighter1-value');
    fighter2Select = f2SelectElement || document.getElementById('fighter2-value');
    onSelectionChangeCallback = selectionChangedCallback;

    if (!fighter1Grid || !fighter2Grid) {
        console.error("Character grids not found in DOM for population.");
        return;
    }
    
    fighter1Grid.innerHTML = '';
    fighter2Grid.innerHTML = '';

    const characterList = Object.values(characters);
    const availableCharacters = characterList.filter(c => c && c.id && c.name && c.techniques && c.techniques.length > 0);
    const sortedCharacters = availableCharacters.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    if (sortedCharacters.length === 0) {
        console.warn("No available characters with techniques to populate grids.");
        fighter1Grid.textContent = "No characters available.";
        fighter2Grid.textContent = "No characters available.";
        return;
    }

    sortedCharacters.forEach(character => {
        const card1 = createCharacterCard(character, 'fighter1');
        const card2 = createCharacterCard(character, 'fighter2');
        fighter1Grid.appendChild(card1);
        fighter2Grid.appendChild(card2);
    });
}