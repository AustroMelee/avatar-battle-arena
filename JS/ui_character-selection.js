/**
 * @fileoverview Avatar Battle Arena - Character Selection UI Component
 * @description Manages character selection interface with accessibility support and state management
 * @version 2.0.0
 */

'use strict';

//# sourceURL=ui_character-selection.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').Character} Character
 * @typedef {import('./types.js').Fighter} Fighter
 */

/**
 * @typedef {Object} CharacterSelectionState
 * @description Current state of character selection
 * @property {string | null} fighter1Id - Selected fighter 1 ID
 * @property {string | null} fighter2Id - Selected fighter 2 ID
 * @property {boolean} isReady - Whether both fighters are selected
 * @property {number} totalCharacters - Total available characters
 * @property {string[]} availableIds - List of available character IDs
 */

/**
 * @typedef {Object} SelectionElements
 * @description DOM elements for character selection
 * @property {HTMLElement | null} fighter1Grid - Fighter 1 grid container
 * @property {HTMLElement | null} fighter2Grid - Fighter 2 grid container
 * @property {HTMLElement | null} fighter1NameDisplay - Fighter 1 name display
 * @property {HTMLElement | null} fighter2NameDisplay - Fighter 2 name display
 * @property {HTMLInputElement | null} fighter1Select - Fighter 1 hidden input
 * @property {HTMLInputElement | null} fighter2Select - Fighter 2 hidden input
 */

/**
 * @typedef {Object} CharacterCardConfig
 * @description Configuration for creating character cards
 * @property {Character} character - Character data
 * @property {string} fighterKey - Fighter key ('fighter1' or 'fighter2')
 * @property {boolean} [enableAccessibility=true] - Enable accessibility features
 * @property {boolean} [enableKeyboard=true] - Enable keyboard navigation
 * @property {boolean} [enableLazyLoading=true] - Enable image lazy loading
 */

/**
 * @typedef {string} ElementClass
 * @description CSS class based on character element: 'card-fire', 'card-water', 'card-earth', 'card-air', 'card-chi', 'card-nonbender'
 */

/**
 * @typedef {string} FighterKey
 * @description Fighter identifier: 'fighter1' or 'fighter2'
 */

/**
 * @callback SelectionChangeCallback
 * @description Callback function called when character selection changes
 * @param {CharacterSelectionState} state - Current selection state
 * @returns {void}
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { characters } from './data_characters.js';

// ============================================================================
// MODULE STATE
// ============================================================================

/** @type {SelectionElements} */
let selectionElements = {
    fighter1Grid: null,
    fighter2Grid: null,
    fighter1NameDisplay: null,
    fighter2NameDisplay: null,
    fighter1Select: null,
    fighter2Select: null
};

/** @type {SelectionChangeCallback | null} */
let onSelectionChangeCallback = null;

/** @type {CharacterSelectionState} */
let currentState = {
    fighter1Id: null,
    fighter2Id: null,
    isReady: false,
    totalCharacters: 0,
    availableIds: []
};

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {string[]} */
const VALID_FIGHTER_KEYS = ['fighter1', 'fighter2'];

/** @type {Object<string, ElementClass>} */
const ELEMENT_CLASS_MAP = {
    'fire': 'card-fire',
    'lightning': 'card-fire',
    'water': 'card-water',
    'ice': 'card-water',
    'earth': 'card-earth',
    'metal': 'card-earth',
    'air': 'card-air',
    'special': 'card-chi',
    'chi': 'card-chi',
    'nonbender': 'card-nonbender'
};

/** @type {ElementClass} */
const DEFAULT_ELEMENT_CLASS = 'card-nonbender';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets the CSS class for a character card based on their primary element
 * 
 * @param {Character} character - The character data object
 * 
 * @returns {ElementClass} The CSS class name for the character's element
 * 
 * @throws {TypeError} When character is not an object
 * 
 * @example
 * // Get element class for fire bender
 * const cssClass = getElementClass(azula);
 * console.log(cssClass); // 'card-fire'
 * 
 * @since 2.0.0
 * @private
 */
function getElementClass(character) {
    if (!character || typeof character !== 'object') {
        return DEFAULT_ELEMENT_CLASS;
    }

    // Check primary element property
    if (typeof character.element === 'string' && character.element in ELEMENT_CLASS_MAP) {
        return ELEMENT_CLASS_MAP[character.element];
    }

    // Fallback to checking techniques for element
    if (Array.isArray(character.techniques) && character.techniques.length > 0) {
        /** @type {any} */
        const mainElementTechnique = character.techniques.find(t => t && t.element);
        
        if (mainElementTechnique && typeof mainElementTechnique.element === 'string') {
            /** @type {string} */
            const element = mainElementTechnique.element;
            return ELEMENT_CLASS_MAP[element] || DEFAULT_ELEMENT_CLASS;
        }
    }

    return DEFAULT_ELEMENT_CLASS;
}

/**
 * Creates a single character card DOM element with accessibility support
 * 
 * @param {CharacterCardConfig} config - Configuration for creating the card
 * 
 * @returns {HTMLElement} The created character card element
 * 
 * @throws {TypeError} When config is not an object
 * @throws {Error} When required config properties are missing
 * 
 * @example
 * // Create a character card
 * const card = createCharacterCard({
 *   character: aang,
 *   fighterKey: 'fighter1',
 *   enableAccessibility: true
 * });
 * 
 * @since 2.0.0
 * @private
 */
function createCharacterCard(config) {
    // Input validation
    if (!config || typeof config !== 'object') {
        throw new TypeError('createCharacterCard: config must be an object');
    }

    if (!config.character || typeof config.character !== 'object') {
        throw new Error('createCharacterCard: config.character is required');
    }

    if (typeof config.fighterKey !== 'string' || !VALID_FIGHTER_KEYS.includes(config.fighterKey)) {
        throw new Error(`createCharacterCard: config.fighterKey must be one of: ${VALID_FIGHTER_KEYS.join(', ')}`);
    }

    /** @type {Character} */
    const character = config.character;
    /** @type {FighterKey} */
    const fighterKey = config.fighterKey;
    /** @type {boolean} */
    const enableAccessibility = config.enableAccessibility !== false;
    /** @type {boolean} */
    const enableKeyboard = config.enableKeyboard !== false;
    /** @type {boolean} */
    const enableLazyLoading = config.enableLazyLoading !== false;

    /** @type {HTMLElement} */
    const card = document.createElement('article');
    card.className = 'character-card';

    if (character.id && character.name) {
        // Add element-specific styling
        /** @type {ElementClass} */
        const elementClass = getElementClass(character);
        card.classList.add(elementClass);

        // Set data attributes
        card.dataset.id = character.id;
        card.dataset.fighterKey = fighterKey;

        // Accessibility attributes
        if (enableAccessibility) {
            card.setAttribute('role', 'option');
            card.setAttribute('aria-label', `Character: ${character.name} for ${fighterKey}`);
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-describedby', `${character.id}-description`);
        }

        // Create character image
        /** @type {HTMLImageElement} */
        const image = document.createElement('img');
        image.src = character.imageUrl || '';
        image.alt = `${character.name} - Avatar character portrait`;
        
        if (enableLazyLoading) {
            image.loading = 'lazy';
        }

        // Handle image load errors
        image.addEventListener('error', () => {
            image.alt = `${character.name} (image not available)`;
            console.warn(`[Character Selection] Failed to load image for ${character.name}: ${image.src}`);
        });

        card.appendChild(image);

        // Create character name
        /** @type {HTMLHeadingElement} */
        const name = document.createElement('h3');
        name.textContent = character.name;
        name.className = 'character-name';
        card.appendChild(name);

        // Add description for screen readers
        if (enableAccessibility && character.description) {
            /** @type {HTMLElement} */
            const description = document.createElement('div');
            description.id = `${character.id}-description`;
            description.className = 'sr-only';
            description.textContent = character.description;
            card.appendChild(description);
        }

        // Add click event listener
        card.addEventListener('click', (event) => {
            event.preventDefault();
            handleCardClick(character, fighterKey, card);
        });
        
        // Add keyboard support for accessibility
        if (enableKeyboard) {
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleCardClick(character, fighterKey, card);
                }
            });
        }
    } else {
        // Handle invalid character data
        card.className = 'character-card character-card--invalid';
        card.textContent = 'Invalid character data';
        card.setAttribute('aria-label', 'Invalid character');
        
        console.warn('[Character Selection] Invalid character data:', character);
    }

    return card;
}

/**
 * Handles the click event for a character card with validation
 * 
 * @param {Character} character - The selected character's data
 * @param {FighterKey} fighterKey - Fighter identifier ('fighter1' or 'fighter2')
 * @param {HTMLElement} selectedCard - The clicked card element
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When parameters are invalid
 * 
 * @example
 * // Handle character selection
 * handleCardClick(aang, 'fighter1', cardElement);
 * 
 * @since 2.0.0
 * @private
 */
function handleCardClick(character, fighterKey, selectedCard) {
    // Input validation
    if (!character || typeof character !== 'object' || !character.id) {
        console.error('[Character Selection] Invalid character in handleCardClick:', character);
        return;
    }

    if (typeof fighterKey !== 'string' || !VALID_FIGHTER_KEYS.includes(fighterKey)) {
        throw new TypeError(`handleCardClick: fighterKey must be one of: ${VALID_FIGHTER_KEYS.join(', ')}`);
    }

    if (!selectedCard || !selectedCard.classList) {
        throw new TypeError('handleCardClick: selectedCard must be a valid DOM element');
    }

    console.debug(`[Character Selection] Character selected: ${character.name} for ${fighterKey}`);

    // Get current and other fighter inputs
    /** @type {HTMLInputElement | null} */
    const currentFighterSelect = fighterKey === 'fighter1' ? 
        selectionElements.fighter1Select : 
        selectionElements.fighter2Select;

    /** @type {HTMLInputElement | null} */
    const otherFighterSelect = fighterKey === 'fighter1' ? 
        selectionElements.fighter2Select : 
        selectionElements.fighter1Select;

    // Prevent selecting the same character for both fighters
    if (otherFighterSelect && otherFighterSelect.value === character.id) {
        alert("A fighter cannot battle themselves. Please choose a different opponent.");
        console.warn(`[Character Selection] Attempted to select same character (${character.id}) for both fighters`);
        return;
    }

    // Update visual selection state
    /** @type {HTMLElement | null} */
    const grid = fighterKey === 'fighter1' ? 
        selectionElements.fighter1Grid : 
        selectionElements.fighter2Grid;

    if (grid) {
        // Remove previous selection
        /** @type {NodeListOf<Element>} */
        const allCards = grid.querySelectorAll('.character-card');
        allCards.forEach(card => card.classList.remove('selected'));
        
        // Add selection to current card
        selectedCard.classList.add('selected');
    }

    // Update name display
    /** @type {HTMLElement | null} */
    const nameDisplay = fighterKey === 'fighter1' ? 
        selectionElements.fighter1NameDisplay : 
        selectionElements.fighter2NameDisplay;

    if (nameDisplay) {
        nameDisplay.textContent = character.name;
    }

    // Update hidden input value
    if (currentFighterSelect) {
        currentFighterSelect.value = character.id;
    }

    // Update module state
    if (fighterKey === 'fighter1') {
        currentState.fighter1Id = character.id;
    } else {
        currentState.fighter2Id = character.id;
    }

    currentState.isReady = !!(currentState.fighter1Id && currentState.fighter2Id);

    // Trigger callback
    if (typeof onSelectionChangeCallback === 'function') {
        try {
            onSelectionChangeCallback({ ...currentState });
        } catch (error) {
            console.error('[Character Selection] Error in selection change callback:', error);
        }
    }

    console.debug(`[Character Selection] Selection updated:`, currentState);
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
    selectionElements.fighter1Grid = f1GridElement || document.getElementById('fighter1-grid');
    selectionElements.fighter2Grid = f2GridElement || document.getElementById('fighter2-grid');
    selectionElements.fighter1NameDisplay = f1NameDisplayElement || document.getElementById('fighter1-name-display');
    selectionElements.fighter2NameDisplay = f2NameDisplayElement || document.getElementById('fighter2-name-display');
    selectionElements.fighter1Select = f1SelectElement || document.getElementById('fighter1-value');
    selectionElements.fighter2Select = f2SelectElement || document.getElementById('fighter2-value');
    onSelectionChangeCallback = selectionChangedCallback;

    if (!selectionElements.fighter1Grid || !selectionElements.fighter2Grid) {
        console.error("Character grids not found in DOM for population.");
        return;
    }
    
    selectionElements.fighter1Grid.innerHTML = '';
    selectionElements.fighter2Grid.innerHTML = '';

    const characterList = Object.values(characters);
    const availableCharacters = characterList.filter(c => c && c.id && c.name && c.techniques && c.techniques.length > 0);
    const sortedCharacters = availableCharacters.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    if (sortedCharacters.length === 0) {
        console.warn("No available characters with techniques to populate grids.");
        selectionElements.fighter1Grid.textContent = "No characters available.";
        selectionElements.fighter2Grid.textContent = "No characters available.";
        return;
    }

    sortedCharacters.forEach(character => {
        const card1 = createCharacterCard({
            character: character,
            fighterKey: 'fighter1',
            enableAccessibility: true,
            enableKeyboard: true,
            enableLazyLoading: true
        });
        const card2 = createCharacterCard({
            character: character,
            fighterKey: 'fighter2',
            enableAccessibility: true,
            enableKeyboard: true,
            enableLazyLoading: true
        });
        selectionElements.fighter1Grid.appendChild(card1);
        selectionElements.fighter2Grid.appendChild(card2);
    });
}