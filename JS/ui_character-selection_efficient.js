/**
 * @fileoverview Efficient Character Selection UI
 * @description Character selection UI with DocumentFragment batching and state comparison
 * @version 2.0
 */

'use strict';

import { 
    batchDOMOperations, 
    batchAppendElements, 
    batchReplaceContent,
    renderIfChanged,
    performanceMonitor 
} from './utils_efficient_rendering.js';
import { characters } from './data_characters.js';

// State tracking for efficient rendering
let previousCharacterState = null;

/**
 * Creates character card elements efficiently using DocumentFragment
 * @param {string} characterId - Character ID
 * @param {string} gridType - 'fighter1' or 'fighter2'
 * @returns {HTMLElement} Character card element
 */
function createCharacterCard(characterId, gridType) {
    const character = characters[characterId];
    if (!character) return null;

    const card = document.createElement('article');
    card.className = `character-showcase__character character-card ${gridType}-option`;
    card.setAttribute('role', 'option');
    card.setAttribute('aria-label', `Select ${character.name} as ${gridType}`);
    card.setAttribute('tabindex', '0');
    card.dataset.characterId = characterId;
    card.dataset.gridType = gridType;

    // Create image element
    const image = document.createElement('img');
    image.className = 'character-showcase__portrait';
    image.src = character.imageUrl || '';
    image.alt = `${character.name} portrait`;
    image.loading = 'lazy'; // Performance optimization

    // Create name element
    const name = document.createElement('h3');
    name.className = 'character-showcase__name';
    name.textContent = character.name;

    // Batch append using DocumentFragment
    batchAppendElements(card, [image, name]);

    return card;
}

/**
 * Renders character grids efficiently with state comparison
 * @param {string} fighter1Id - Fighter 1 character ID
 * @param {string} fighter2Id - Fighter 2 character ID
 */
export function renderCharacterSelection(fighter1Id, fighter2Id) {
    const startTime = performanceMonitor.startTiming();
    
    const newState = { fighter1Id, fighter2Id };
    
    // Skip render if state hasn't changed
    const result = renderIfChanged(previousCharacterState, newState, () => {
        const fighter1Grid = document.getElementById('fighter1-grid');
        const fighter2Grid = document.getElementById('fighter2-grid');
        
        if (!fighter1Grid || !fighter2Grid) {
            console.warn('[Character Selection] Grid elements not found');
            return false;
        }

        // Create character cards for each grid
        const fighter1Cards = [];
        const fighter2Cards = [];

        // Use available character IDs or default to specific characters
        const availableCharacterIds = Object.keys(characters);
        
        availableCharacterIds.forEach(characterId => {
            const fighter1Card = createCharacterCard(characterId, 'fighter1');
            const fighter2Card = createCharacterCard(characterId, 'fighter2');
            
            if (fighter1Card) {
                // Mark as selected if it matches current selection
                if (characterId === fighter1Id) {
                    fighter1Card.classList.add('selected');
                    fighter1Card.setAttribute('aria-selected', 'true');
                }
                fighter1Cards.push(fighter1Card);
            }
            
            if (fighter2Card) {
                // Mark as selected if it matches current selection
                if (characterId === fighter2Id) {
                    fighter2Card.classList.add('selected');
                    fighter2Card.setAttribute('aria-selected', 'true');
                }
                fighter2Cards.push(fighter2Card);
            }
        });

        // Batch replace content using DocumentFragment
        const success1 = batchReplaceContent(fighter1Grid, fighter1Cards);
        const success2 = batchReplaceContent(fighter2Grid, fighter2Cards);
        
        performanceMonitor.recordFragmentOperation();
        
        return success1 && success2;
    });
    
    if (result === null) {
        performanceMonitor.endTiming(startTime, true); // Render was skipped
    } else {
        previousCharacterState = newState;
        performanceMonitor.endTiming(startTime, false);
    }
    
    return result !== false; // Return success status
}

/**
 * Updates character selection efficiently with debounced rendering
 * @param {string} characterId - Selected character ID
 * @param {string} gridType - 'fighter1' or 'fighter2'
 */
export function updateCharacterSelection(characterId, gridType) {
    const currentState = previousCharacterState || {};
    
    if (gridType === 'fighter1') {
        renderCharacterSelection(characterId, currentState.fighter2Id);
    } else if (gridType === 'fighter2') {
        renderCharacterSelection(currentState.fighter1Id, characterId);
    }
}

/**
 * Sets up character selection event listeners with efficient handling
 */
export function setupCharacterSelectionEvents() {
    // Use event delegation for efficiency
    const fighter1Grid = document.getElementById('fighter1-grid');
    const fighter2Grid = document.getElementById('fighter2-grid');
    
    if (fighter1Grid) {
        fighter1Grid.addEventListener('click', (event) => {
            const card = event.target.closest('.character-card');
            if (card && card.dataset.characterId) {
                updateCharacterSelection(card.dataset.characterId, 'fighter1');
            }
        });
        
        // Keyboard support
        fighter1Grid.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                const card = event.target.closest('.character-card');
                if (card && card.dataset.characterId) {
                    event.preventDefault();
                    updateCharacterSelection(card.dataset.characterId, 'fighter1');
                }
            }
        });
    }
    
    if (fighter2Grid) {
        fighter2Grid.addEventListener('click', (event) => {
            const card = event.target.closest('.character-card');
            if (card && card.dataset.characterId) {
                updateCharacterSelection(card.dataset.characterId, 'fighter2');
            }
        });
        
        // Keyboard support
        fighter2Grid.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                const card = event.target.closest('.character-card');
                if (card && card.dataset.characterId) {
                    event.preventDefault();
                    updateCharacterSelection(card.dataset.characterId, 'fighter2');
                }
            }
        });
    }
}

/**
 * Initialize efficient character selection
 */
export function initializeEfficientCharacterSelection() {
    setupCharacterSelectionEvents();
    
    // Initial render with default selections
    renderCharacterSelection('aang-airbending-only', 'azula');
    
    console.log('[Character Selection] Efficient rendering initialized');
}

/**
 * Get rendering performance stats
 * @returns {Object} Performance statistics
 */
export function getCharacterSelectionStats() {
    return performanceMonitor.getStats();
} 