// FILE: ui_location-selection.js
'use strict';

// Manages location selection UI elements and interactions.

import { locations } from './locations.js';
import { locationConditions } from './location-battle-conditions.js';
import { getModifierDescription } from './utils_description-generator.js';

let locationGrid = null;
let locationNameDisplay = null;
let locationSelect = null; // Hidden input for value
let locationEnvironmentSummary = null;
let onSelectionChangeCallback = null;

// Capitalizes the first letter of a string.
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Formats an element or move type name for display.
const formatTypeName = (type) => capitalize(type.replace(/_/g, ' '));

/**
 * Creates a single location card DOM element.
 * @param {object} locationData - The location data.
 * @param {string} locationId - The ID of the location.
 * @returns {HTMLElement} The created card element.
 */
function createLocationCard(locationData, locationId) {
    const card = document.createElement('div');
    card.className = 'location-card';
    if (locationData) {
        card.dataset.id = locationId;
        const image = document.createElement('img');
        image.src = locationData.background;
        image.alt = locationData.name;
        image.loading = 'lazy';
        card.appendChild(image);

        const name = document.createElement('h3');
        name.textContent = locationData.name;
        card.appendChild(name);

        card.addEventListener('click', () => {
            handleCardClick(locationData, locationId, card);
        });
    } else {
        card.textContent = "Error: Location Undefined";
    }
    return card;
}

/**
 * Handles the click event for a location card.
 * @param {object} locationData - The selected location's data.
 * @param {string} locationId - The ID of the selected location.
 * @param {HTMLElement} selectedCard - The clicked card element.
 */
function handleCardClick(locationData, locationId, selectedCard) {
    if (!locationGrid || !locationNameDisplay || !locationSelect) return;

    locationGrid.querySelectorAll('.location-card').forEach(card => card.classList.remove('selected'));
    selectedCard.classList.add('selected');
    
    locationNameDisplay.textContent = locationData ? locationData.name : "Unknown Location";
    locationSelect.value = locationId;
    
    updateEnvironmentalSummary(locationId);

    if (onSelectionChangeCallback) {
        onSelectionChangeCallback();
    }
}

/**
 * Updates the environmental summary display based on the selected location.
 * @param {string} locId - The ID of the selected location.
 */
export function updateEnvironmentalSummary(locId) {
    if (!locationEnvironmentSummary) return;
    const locConditions = locationConditions[locId];
    if (!locConditions) {
        locationEnvironmentSummary.innerHTML = 'Environmental details not available for this location.';
        return;
    }
    let summaryHtml = `This location is characterized by: `;
    const traits = [];
    if (locConditions.isUrban) traits.push(`<span>urban</span> setting`);
    if (locConditions.isDense) traits.push(`<span>dense</span> environment`);
    if (locConditions.isVertical) traits.push(`<span>vertical</span> terrain`);
    if (locConditions.isExposed) traits.push(`<span>exposed</span> areas`);
    if (locConditions.isSlippery) traits.push(`<span>slippery</span> surfaces`);
    if (locConditions.isHot) traits.push(`<span>intense heat</span>`);
    if (locConditions.isCold) traits.push(`<span>cold</span> temperatures`);
    if (locConditions.hasShiftingGround) traits.push(`<span>shifting ground</span>`);
    if (locConditions.lowVisibility) traits.push(`<span>low visibility</span>`);
    if (locConditions.isIndustrial) traits.push(`<span>industrial</span> elements`);
    if (locConditions.isPrecarious) traits.push(`<span>precarious</span> footing`);
    if (locConditions.isRocky) traits.push(`<span>rocky</span> terrain`);
    if (locConditions.isCoastal) traits.push(`<span>coastal</span> features`);
    if (locConditions.isSandy) traits.push(`<span>sandy</span> terrain`);
    if (locConditions.hasCover) traits.push(`ample <span>cover</span>`);
    if (locConditions.plantsRich) traits.push(`abundant <span>plant life</span>`);
    if (locConditions.airRich) traits.push(`rich in <span>air</span>`);
    if (locConditions.waterRich) traits.push(`rich in <span>water</span>`);
    if (locConditions.iceRich) traits.push(`rich in <span>ice</span>`);
    if (locConditions.earthRich) traits.push(`rich in <span>earth</span>`);
    if (locConditions.metalRich) traits.push(`rich in <span>metal</span>`);
    summaryHtml += traits.join(', ') || 'a unique atmosphere';

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
    if (locConditions.fragility !== undefined) summaryHtml += `<br>Fragility: <span>${(locConditions.fragility * 100).toFixed(0)}%</span>.`;
    locationEnvironmentSummary.innerHTML = summaryHtml;
}

/**
 * Populates the location selection grid with cards for all available locations.
 * @param {HTMLElement} locGridElement - The DOM element for the location grid.
 * @param {HTMLElement} locNameDisplayElement - The DOM element for the location name display.
 * @param {HTMLElement} locSelectElement - The hidden input for the location ID.
 * @param {HTMLElement} locEnvSummaryElement - The DOM element for the environmental summary.
 * @param {function} selectionChangedCallback - Callback to execute when a selection changes.
 */
export function populateLocationGrid(locGridElement, locNameDisplayElement, locSelectElement, locEnvSummaryElement, selectionChangedCallback) {
    // Store references to DOM elements
    locationGrid = locGridElement || document.getElementById('location-grid');
    locationNameDisplay = locNameDisplayElement || document.getElementById('location-name-display');
    locationSelect = locSelectElement || document.getElementById('location-value');
    locationEnvironmentSummary = locEnvSummaryElement || document.getElementById('location-environment-summary');
    onSelectionChangeCallback = selectionChangedCallback;

    if (!locationGrid) {
        console.error("Location grid not found in DOM for population.");
        return;
    }
    
    locationGrid.innerHTML = '';
    
    const sortedLocations = Object.entries(locations).sort(([, a], [, b]) => (a.name || "").localeCompare(b.name || ""));

    if (sortedLocations.length === 0) {
        locationGrid.textContent = "No locations available.";
        return;
    }

    for (const [id, locData] of sortedLocations) {
        if (locData && locData.name && locData.background) {
            const card = createLocationCard(locData, id);
            locationGrid.appendChild(card);
        } else {
            console.warn(`Skipping invalid location data for ID: ${id}`);
        }
    }

    if (locationEnvironmentSummary) {
        locationEnvironmentSummary.innerHTML = 'Select a battlefield to see its environmental characteristics.';
    }
}

/**
 * Displays the details of a selected location in the UI.
 * @param {object} location - The location object from location-battle-conditions.js.
 */
export function displayLocationDetails(location) {
    const detailsElement = document.getElementById('location-details');
    if (!detailsElement) return;

    // Build the HTML for the location details
    let environmentalImpactHtml = '';
    if (location.environmentalModifiers) {
        for (const type in location.environmentalModifiers) {
            const modifier = location.environmentalModifiers[type];
            const typeName = formatTypeName(type);

            // Generate descriptions for damage and energy
            const damageDesc = getModifierDescription(modifier.damage, 'damage');
            const energyDesc = getModifierDescription(modifier.energy, 'energy');

            // Build the final sentence
            let descriptionSentence = `<span class="location-modifier-type">${typeName}:</span> Attacks are <span class="location-modifier-value">${damageDesc}</span>`;
            if (modifier.energy !== 0) {
                descriptionSentence += ` and their techniques are <span class="location-modifier-value">${energyDesc}</span>`;
            }
            descriptionSentence += `. <em>(${modifier.reason})</em>`;

            environmentalImpactHtml += `<p>${descriptionSentence}</p>`;
        }
    }

    detailsElement.innerHTML = `
        <h3>${location.name}</h3>
        <p>${location.description}</p>
        <div class="elemental-impact">
            <h4>Elemental & Tactical Impact:</h4>
            ${environmentalImpactHtml}
        </div>
        <p><strong>Fragility:</strong> ${location.fragility}%</p>
    `;
}