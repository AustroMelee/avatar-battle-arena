/**
 * @fileoverview Efficient Location Selection UI
 * @description Location selection UI with DocumentFragment batching and state comparison
 * @version 2.0
 */

'use strict';

import { 
    batchDOMOperations, 
    batchAppendElements, 
    batchReplaceContent,
    renderIfChanged,
    createDebouncedStateUpdater,
    performanceMonitor 
} from './utils_efficient_rendering.js';
import { allLocations } from './data_locations_index.js';
import { getBattleConditionsForLocation } from './location-battle-conditions.js';

// State tracking for efficient rendering
let previousLocationState = null;

/**
 * Creates location card elements efficiently using DocumentFragment
 * @param {string} locationId - Location ID
 * @returns {HTMLElement} Location card element
 */
function createLocationCard(locationId) {
    const location = allLocations[locationId];
    if (!location) return null;

    const card = document.createElement('article');
    card.className = 'location-card';
    card.setAttribute('role', 'option');
    card.setAttribute('aria-label', `Select ${location.name} as battle location`);
    card.setAttribute('tabindex', '0');
    card.dataset.locationId = locationId;

    // Create image element
    const image = document.createElement('img');
    image.className = 'location-image';
    image.src = location.background || '';
    image.alt = `${location.name} battlefield`;
    image.loading = 'lazy'; // Performance optimization

    // Create name element
    const name = document.createElement('h3');
    name.className = 'location-name';
    name.textContent = location.name;

    // Batch append using DocumentFragment
    batchAppendElements(card, [image, name]);

    return card;
}

/**
 * Creates environmental summary efficiently
 * @param {string} locationId - Location ID
 * @returns {string} HTML content for environmental summary
 */
function createEnvironmentalSummary(locationId) {
    const location = allLocations[locationId];
    if (!location) {
        return 'Environmental details not available for this location.';
    }

    const locConditions = getBattleConditionsForLocation(locationId);
    if (!locConditions) {
        return 'Environmental details not available for this location.';
    }

    let summaryHtml = `<strong>${location.name}</strong> features `;
    
    // Environmental traits
    const traits = [];
    if (locConditions.sunlight) traits.push(`<span>bright sunlight</span>`);
    if (locConditions.shade) traits.push(`<span>deep shadows</span>`);
    if (locConditions.fireRich) traits.push(`rich in <span>fire energy</span>`);
    if (locConditions.waterRich) traits.push(`rich in <span>water</span>`);
    if (locConditions.airRich) traits.push(`rich in <span>air currents</span>`);
    if (locConditions.iceRich) traits.push(`rich in <span>ice</span>`);
    if (locConditions.earthRich) traits.push(`rich in <span>earth</span>`);
    if (locConditions.metalRich) traits.push(`rich in <span>metal</span>`);
    summaryHtml += traits.join(', ') || 'a unique atmosphere';

    // Environmental modifiers
    if (locConditions.environmentalModifiers) {
        summaryHtml += `<br>Elemental Impact: `;
        const elementalImpacts = [];
        for (const element in locConditions.environmentalModifiers) {
            const mod = locConditions.environmentalModifiers[element];
            let impactDesc = `<span>${element}</span>: `;
            let effects = []
            if (mod.damageMultiplier !== undefined && mod.damageMultiplier !== 1.0) {
                effects.push(`<span class="${mod.damageMultiplier > 1.0 ? 'positive-impact' : 'negative-impact'}">Dmg ${mod.damageMultiplier > 1.0 ? '+' : ''}${(mod.damageMultiplier * 100 - 100).toFixed(0)}%</span>`);
            }
            if (mod.energyCostModifier !== undefined && mod.energyCostModifier !== 1.0) {
                effects.push(`<span class="${mod.energyCostModifier < 1.0 ? 'positive-impact' : 'negative-impact'}">Energy ${mod.energyCostModifier < 1.0 ? '-' : '+'}${(mod.energyCostModifier * 100 - 100).toFixed(0)}%</span>`);
            }
            impactDesc += effects.length > 0 ? effects.join(', ') : `neutral`;
            if (mod.description) impactDesc += ` <em style="font-size:0.9em; opacity:0.8">(${mod.description})</em>`;
            elementalImpacts.push(impactDesc);
        }
        summaryHtml += elementalImpacts.join('; ') || 'None notable.';
    }
    
    if (locConditions.fragility !== undefined) {
        summaryHtml += `<br>Fragility: <span>${(locConditions.fragility * 100).toFixed(0)}%</span>.`;
    }

    return summaryHtml;
}

/**
 * Updates environmental summary with debouncing
 */
const debouncedUpdateEnvironmentalSummary = createDebouncedStateUpdater((locationId) => {
    const summaryElement = document.getElementById('location-environment-summary');
    if (summaryElement) {
        summaryElement.innerHTML = createEnvironmentalSummary(locationId);
    }
}, 100);

/**
 * Renders location grid efficiently with state comparison
 * @param {string} selectedLocationId - Currently selected location ID
 */
export function renderLocationSelection(selectedLocationId) {
    const startTime = performanceMonitor.startTiming();
    
    const newState = { selectedLocationId };
    
    // Skip render if state hasn't changed
    const result = renderIfChanged(previousLocationState, newState, () => {
        const locationGrid = document.getElementById('location-grid');
        const summaryElement = document.getElementById('location-environment-summary');
        
        if (!locationGrid) {
            console.warn('[Location Selection] Grid element not found');
            return false;
        }

        // Create location cards
        const locationCards = [];
        const availableLocationIds = Object.keys(allLocations);
        
        availableLocationIds.forEach(locationId => {
            const locationCard = createLocationCard(locationId);
            
            if (locationCard) {
                // Mark as selected if it matches current selection
                if (locationId === selectedLocationId) {
                    locationCard.classList.add('selected');
                    locationCard.setAttribute('aria-selected', 'true');
                }
                locationCards.push(locationCard);
            }
        });

        // Batch replace content using DocumentFragment
        const success = batchReplaceContent(locationGrid, locationCards);
        
        // Update environmental summary
        if (summaryElement && selectedLocationId) {
            summaryElement.innerHTML = createEnvironmentalSummary(selectedLocationId);
        } else if (summaryElement) {
            summaryElement.innerHTML = 'Select a battlefield to see its environmental characteristics.';
        }
        
        performanceMonitor.recordFragmentOperation();
        
        return success;
    });
    
    if (result === null) {
        performanceMonitor.endTiming(startTime, true); // Render was skipped
    } else {
        previousLocationState = newState;
        performanceMonitor.endTiming(startTime, false);
    }
    
    return result !== false; // Return success status
}

/**
 * Updates location selection efficiently
 * @param {string} locationId - Selected location ID
 */
export function updateLocationSelection(locationId) {
    renderLocationSelection(locationId);
    
    // Update environmental summary with debouncing
    debouncedUpdateEnvironmentalSummary(locationId);
}

/**
 * Sets up location selection event listeners with efficient handling
 */
export function setupLocationSelectionEvents() {
    // Use event delegation for efficiency
    const locationGrid = document.getElementById('location-grid');
    
    if (locationGrid) {
        locationGrid.addEventListener('click', (event) => {
            const card = event.target.closest('.location-card');
            if (card && card.dataset.locationId) {
                updateLocationSelection(card.dataset.locationId);
            }
        });
        
        // Keyboard support
        locationGrid.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                const card = event.target.closest('.location-card');
                if (card && card.dataset.locationId) {
                    event.preventDefault();
                    updateLocationSelection(card.dataset.locationId);
                }
            }
        });
    }
}

/**
 * Initialize efficient location selection
 */
export function initializeEfficientLocationSelection() {
    setupLocationSelectionEvents();
    
    // Initial render with default selection
    renderLocationSelection('fire-nation-capital');
    
    console.log('[Location Selection] Efficient rendering initialized');
}

/**
 * Get rendering performance stats
 * @returns {Object} Performance statistics
 */
export function getLocationSelectionStats() {
    return performanceMonitor.getStats();
} 