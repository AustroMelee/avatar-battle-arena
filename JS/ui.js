// FILE: js/ui.js
'use strict';

// Version 1.1: Null-Safety Pass

import { characters } from './data_characters.js';
import { locations } from './locations.js';
import { locationConditions } from './location-battle-conditions.js';
import { resolveArchetypeLabel } from './engine_archetype-engine.js';
import { renderArchetypeDisplay } from './ui_archetype-display.js';
import { startSimulation, resetSimulationManager } from './simulation_mode_manager.js';
import { transformEventsToAnimationQueue, transformEventsToHtmlLog } from './battle_log_transformer.js';
import { initializeCameraControls, resetCamera as resetCameraControls } from './camera_control.js'; // Added resetCameraControls

const DOM = {
    fighter1Grid: document.getElementById('fighter1-grid'),
    fighter2Grid: document.getElementById('fighter2-grid'),
    locationGrid: document.getElementById('location-grid'),
    emotionalModeCheckbox: document.getElementById('emotional-mode'),
    fighter1NameDisplay: document.getElementById('fighter1-name-display'),
    fighter2NameDisplay: document.getElementById('fighter2-name-display'),
    locationNameDisplay: document.getElementById('location-name-display'),
    battleBtn: document.getElementById('battleBtn'),
    resultsSection: document.getElementById('results'),
    loadingSpinner: document.getElementById('loading'),
    battleResultsContainer: document.getElementById('battle-results'),
    vsDivider: document.getElementById('vsDivider'),
    winnerName: document.getElementById('winner-name'),
    winProbability: document.getElementById('win-probability'),
    battleStory: document.getElementById('battle-story'),
    analysisList: document.getElementById('analysis-list'),
    timeToggleContainer: document.getElementById('time-toggle-container'),
    timeOfDayValue: document.getElementById('time-of-day-value'),
    timeFeedbackDisplay: document.getElementById('time-feedback'),
    fighter1Select: document.createElement('input'), // These are created dynamically
    fighter2Select: document.createElement('input'),
    locationSelect: document.createElement('input'),
    environmentDamageDisplay: document.getElementById('environment-damage-display'),
    environmentImpactsList: document.getElementById('environment-impacts-list'),
    locationEnvironmentSummary: document.getElementById('location-environment-summary'),
    fighter1MomentumValue: document.getElementById('fighter1-momentum-value'),
    fighter2MomentumValue: document.getElementById('fighter2-momentum-value'),
    archetypeContainer: document.getElementById('archetype-info-container'),
    archetypeHeadline: document.getElementById('archetype-headline'),
    archetypeIntroA: document.getElementById('archetype-intro-a'),
    archetypeIntroB: document.getElementById('archetype-intro-b'),
    archetypeError: document.getElementById('archetype-error'),
    simulationModeContainer: document.getElementById('simulation-mode-container'),
    animatedLogOutput: document.getElementById('animated-log-output'),
    cancelSimulationBtn: document.getElementById('cancel-simulation'),
    zoomInBtn: document.getElementById('zoom-in'),
    zoomOutBtn: document.getElementById('zoom-out'),
    modeAnimatedRadio: document.getElementById('mode-animated'),
    modeInstantRadio: document.getElementById('mode-instant'),
};

// For Simulation Mode Manager
export const DOM_simulation_references = {
    simulationContainer: DOM.simulationModeContainer,
    cancelButton: DOM.cancelSimulationBtn,
    battleResultsContainer: DOM.battleResultsContainer,
    winnerNameDisplay: DOM.winnerName,
    analysisListDisplay: DOM.analysisList,
    battleStoryDisplay: DOM.battleStory
};

// Initialize hidden inputs safely
DOM.fighter1Select.type = 'hidden';
DOM.fighter1Select.id = 'fighter1-value';
DOM.fighter2Select.type = 'hidden';
DOM.fighter2Select.id = 'fighter2-value';
DOM.locationSelect.type = 'hidden';
DOM.locationSelect.id = 'location-value';

// Append hidden inputs if they don't exist
if (document && !document.getElementById('fighter1-value')) document.body.appendChild(DOM.fighter1Select);
if (document && !document.getElementById('fighter2-value')) document.body.appendChild(DOM.fighter2Select);
if (document && !document.getElementById('location-value')) document.body.appendChild(DOM.locationSelect);


export function getCharacterImage(characterId) {
    if (!characterId || !characters) {
        // console.warn("UI (getCharacterImage): Invalid characterId or characters data missing.");
        return null;
    }
    return characters[characterId]?.imageUrl || null; // Fallback to null if imageUrl is missing
}

function getElementClass(character) {
    if (!character || typeof character !== 'object') {
        // console.warn("UI (getElementClass): Invalid character object provided.");
        return 'card-nonbender'; // Default class
    }
    // Prioritize techniquesFull for Katara/Pakku, then techniquesCanteen, then general techniques
    const charTechniques = (character.id === 'katara' || character.id === 'pakku')
        ? (character.techniquesFull || character.techniquesCanteen || character.techniques)
        : (character.techniques || []); // Ensure techniques is an array

    if (!Array.isArray(charTechniques) || charTechniques.length === 0) {
        // console.warn(`UI (getElementClass): No techniques found for ${character.name || character.id}. Defaulting to nonbender.`);
        return 'card-nonbender';
    }
    // Find the first technique with an element, or default to 'nonbender'
    const mainElement = charTechniques.find(t => t?.element)?.element || 'nonbender';

    switch (mainElement) {
        case 'fire': case 'lightning': return 'card-fire';
        case 'water': case 'ice': return 'card-water';
        case 'earth': case 'metal': return 'card-earth';
        case 'air': return 'card-air';
        case 'special': return 'card-chi'; // For chi-blockers etc.
        default: return 'card-nonbender';
    }
}

function updateArchetypeInfo() {
    const fighter1Id = DOM.fighter1Select?.value || null;
    const fighter2Id = DOM.fighter2Select?.value || null;
    const locationId = DOM.locationSelect?.value || null;

    // resolveArchetypeLabel should ideally handle null inputs and return a placeholder
    const archetypeData = resolveArchetypeLabel(fighter1Id, fighter2Id, locationId);

    // renderArchetypeDisplay should also be robust to partial data
    renderArchetypeDisplay(archetypeData, {
        container: DOM.archetypeContainer,
        headline: DOM.archetypeHeadline,
        introA: DOM.archetypeIntroA,
        introB: DOM.archetypeIntroB,
        error: DOM.archetypeError
    });
}

function createCharacterCard(character, fighterKey) {
    if (!character || typeof character !== 'object' || !character.id || !character.name) {
        // console.warn(`UI (createCharacterCard): Invalid character data for fighterKey ${fighterKey}.`, character);
        const card = document.createElement('div');
        card.textContent = "Error: Invalid Character";
        return card; // Return a minimal error card
    }

    const card = document.createElement('div');
    card.className = 'character-card';
    card.classList.add(getElementClass(character)); // getElementClass should be robust
    card.dataset.id = character.id;

    const image = document.createElement('img');
    image.src = character.imageUrl || 'path/to/default-character-image.png'; // Fallback image
    image.alt = character.name;
    image.loading = 'lazy';
    card.appendChild(image);

    const nameElement = document.createElement('h3'); // Renamed variable to avoid conflict
    nameElement.textContent = character.name;
    card.appendChild(nameElement);

    card.addEventListener('click', () => {
        handleCardSelection(character, fighterKey, card);
    });
    return card;
}

function handleCardSelection(character, fighterKey, selectedCard) {
    if (!character || !fighterKey || !selectedCard) {
        // console.warn("UI (handleCardSelection): Missing parameters.");
        return;
    }

    const grid = fighterKey === 'fighter1' ? DOM.fighter1Grid : DOM.fighter2Grid;
    const nameDisplay = fighterKey === 'fighter1' ? DOM.fighter1NameDisplay : DOM.fighter2NameDisplay;
    const hiddenInput = fighterKey === 'fighter1' ? DOM.fighter1Select : DOM.fighter2Select;
    const otherFighterInput = fighterKey === 'fighter1' ? DOM.fighter2Select : DOM.fighter1Select;

    if (!grid || !nameDisplay || !hiddenInput || !otherFighterInput) {
        // console.error("UI (handleCardSelection): Critical DOM elements missing for card selection.");
        return;
    }

    if (otherFighterInput.value === character.id) {
        alert("A fighter cannot battle themselves. Please choose a different opponent.");
        return;
    }

    grid.querySelectorAll('.character-card').forEach(card => card.classList.remove('selected'));
    selectedCard.classList.add('selected');
    nameDisplay.textContent = character.name || "Unknown Fighter";
    hiddenInput.value = character.id;
    updateArchetypeInfo(); // This function should also be robust
}


function populateCharacterGrids() {
    if (!DOM.fighter1Grid || !DOM.fighter2Grid) {
        // console.error("UI (populateCharacterGrids): Character grids not found in DOM.");
        return;
    }
    DOM.fighter1Grid.innerHTML = '';
    DOM.fighter2Grid.innerHTML = '';

    if (!characters || typeof characters !== 'object') {
        // console.error("UI (populateCharacterGrids): Global 'characters' data is missing or invalid.");
        DOM.fighter1Grid.textContent = "Error: Character data unavailable.";
        DOM.fighter2Grid.textContent = "Error: Character data unavailable.";
        return;
    }

    const availableCharacters = Object.values(characters).filter(c => {
        if (!c || typeof c !== 'object') return false; // Filter out invalid character entries
        if (c.id === 'katara' || c.id === 'pakku') {
            return (Array.isArray(c.techniquesFull) && c.techniquesFull.length > 0) ||
                   (Array.isArray(c.techniquesCanteen) && c.techniquesCanteen.length > 0);
        }
        return Array.isArray(c.techniques) && c.techniques.length > 0;
    });

    if (availableCharacters.length === 0) {
        // console.warn("UI (populateCharacterGrids): No available characters after filtering.");
        DOM.fighter1Grid.textContent = "No characters available.";
        DOM.fighter2Grid.textContent = "No characters available.";
        return;
    }

    const sortedCharacters = availableCharacters.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    sortedCharacters.forEach(character => {
        const card1 = createCharacterCard(character, 'fighter1'); // createCharacterCard is now robust
        const card2 = createCharacterCard(character, 'fighter2');
        DOM.fighter1Grid.appendChild(card1);
        DOM.fighter2Grid.appendChild(card2);
    });
}

function createLocationCard(locationData, locationId) {
    if (!locationData || typeof locationData !== 'object' || !locationId || !locationData.name) {
        // console.warn("UI (createLocationCard): Invalid locationData or locationId.", { locationData, locationId });
        const card = document.createElement('div');
        card.textContent = "Error: Invalid Location";
        return card;
    }

    const card = document.createElement('div');
    card.className = 'location-card';
    card.dataset.id = locationId;

    const image = document.createElement('img');
    image.src = locationData.imageUrl || 'path/to/default-location-image.png'; // Fallback image
    image.alt = locationData.name;
    image.loading = 'lazy';
    card.appendChild(image);

    const nameElement = document.createElement('h3'); // Renamed
    nameElement.textContent = locationData.name;
    card.appendChild(nameElement);

    card.addEventListener('click', () => {
        handleLocationCardSelection(locationData, locationId, card);
    });
    return card;
}

function updateEnvironmentalSummary(locationId) {
    if (!DOM.locationEnvironmentSummary) return;
    if (!locationId || !locationConditions || !locationConditions[locationId]) {
        DOM.locationEnvironmentSummary.innerHTML = 'Select a battlefield to see its environmental characteristics.';
        // console.warn(`UI (updateEnvironmentalSummary): No conditions found for locationId "${locationId}".`);
        return;
    }

    const locConditions = locationConditions[locationId];
    let summaryHtml = 'This location is characterized by: ';
    const traits = [];
    // Safely check each boolean condition
    if (locConditions.isUrban) traits.push('<span>urban</span> setting');
    if (locConditions.isDense) traits.push('<span>dense</span> environment');
    if (locConditions.isVertical) traits.push('<span>vertical</span> terrain');
    // ... (add similar safe checks for all other boolean traits)
    if (locConditions.isExposed) traits.push('<span>exposed</span> areas');
    if (locConditions.isSlippery) traits.push('<span>slippery</span> surfaces');
    if (locConditions.isHot) traits.push('<span>intense heat</span>');
    if (locConditions.isCold) traits.push('<span>cold</span> temperatures');
    if (locConditions.hasShiftingGround) traits.push('<span>shifting ground</span>');
    if (locConditions.lowVisibility) traits.push('<span>low visibility</span>');
    if (locConditions.isIndustrial) traits.push('<span>industrial</span> elements');
    if (locConditions.isPrecarious) traits.push('<span>precarious</span> footing');
    if (locConditions.isRocky) traits.push('<span>rocky</span> terrain');
    if (locConditions.isCoastal) traits.push('<span>coastal</span> features');
    if (locConditions.isSandy) traits.push('<span>sandy</span> terrain');
    if (locConditions.hasCover) traits.push('ample <span>cover</span>');
    if (locConditions.plantsRich) traits.push('abundant <span>plant life</span>');
    if (locConditions.airRich) traits.push('rich in <span>air</span>');
    if (locConditions.waterRich) traits.push('rich in <span>water</span>');
    if (locConditions.iceRich) traits.push('rich in <span>ice</span>');
    if (locConditions.earthRich) traits.push('rich in <span>earth</span>');
    if (locConditions.metalRich) traits.push('rich in <span>metal</span>');

    summaryHtml += traits.join(', ') || 'a unique atmosphere';

    if (locConditions.environmentalModifiers && typeof locConditions.environmentalModifiers === 'object') {
        summaryHtml += '<br>Elemental Impact: ';
        const elementalImpacts = [];
        for (const element in locConditions.environmentalModifiers) {
            const mod = locConditions.environmentalModifiers[element];
            if (!mod || typeof mod !== 'object') continue; // Skip invalid modifier entries

            let impactDesc = `<span>${element}</span>: `;
            let effects = [];
            if (mod.damageMultiplier !== undefined && typeof mod.damageMultiplier === 'number' && mod.damageMultiplier !== 1.0) {
                effects.push(`<span class="${mod.damageMultiplier > 1.0 ? 'positive-impact' : 'negative-impact'}">Dmg ${mod.damageMultiplier > 1.0 ? '+' : ''}${(mod.damageMultiplier * 100 - 100).toFixed(0)}%</span>`);
            }
            if (mod.energyCostModifier !== undefined && typeof mod.energyCostModifier === 'number' && mod.energyCostModifier !== 1.0) {
                effects.push(`<span class="${mod.energyCostModifier < 1.0 ? 'positive-impact' : 'negative-impact'}">Energy ${mod.energyCostModifier < 1.0 ? '-' : '+'}${(mod.energyCostModifier * 100 - 100).toFixed(0)}%</span>`);
            }
            impactDesc += effects.length > 0 ? effects.join(', ') : 'neutral';
            if (mod.description) impactDesc += `<em style="font-size:0.9em; opacity:0.8">(${mod.description})</em>`;
            elementalImpacts.push(impactDesc);
        }
        summaryHtml += elementalImpacts.join('; ') || 'None notable.';
    }
    if (locConditions.fragility !== undefined && typeof locConditions.fragility === 'number') {
        summaryHtml += `<br>Fragility: <span>${(locConditions.fragility * 100).toFixed(0)}%</span>.`;
    }
    DOM.locationEnvironmentSummary.innerHTML = summaryHtml;
}


function handleLocationCardSelection(locationData, locationId, selectedCard) {
    if (!locationData || !locationId || !selectedCard ||
        !DOM.locationGrid || !DOM.locationNameDisplay || !DOM.locationSelect) {
        // console.warn("UI (handleLocationCardSelection): Missing parameters or critical DOM elements.");
        return;
    }
    DOM.locationGrid.querySelectorAll('.location-card').forEach(card => card.classList.remove('selected'));
    selectedCard.classList.add('selected');
    DOM.locationNameDisplay.textContent = locationData.name || "Unknown Location";
    DOM.locationSelect.value = locationId;
    updateEnvironmentalSummary(locationId); // This function is now more robust
    updateArchetypeInfo(); // This function should also be robust
}

function populateLocationGrid() {
    if (!DOM.locationGrid) {
        // console.error("UI (populateLocationGrid): Location grid not found in DOM.");
        return;
    }
    DOM.locationGrid.innerHTML = '';

    if (!locations || typeof locations !== 'object') {
        // console.error("UI (populateLocationGrid): Global 'locations' data is missing or invalid.");
        DOM.locationGrid.textContent = "Error: Location data unavailable.";
        return;
    }

    const sortedLocations = Object.entries(locations)
        .filter(([id, locData]) => locData && typeof locData === 'object' && locData.name) // Filter invalid entries
        .sort(([, a], [, b]) => (a.name || '').localeCompare(b.name || ''));

    if (sortedLocations.length === 0) {
        // console.warn("UI (populateLocationGrid): No valid locations found after filtering.");
        DOM.locationGrid.textContent = "No locations available.";
        return;
    }

    for (const [id, locationData] of sortedLocations) {
        const card = createLocationCard(locationData, id); // createLocationCard is now robust
        DOM.locationGrid.appendChild(card);
    }

    if (DOM.locationEnvironmentSummary) {
        DOM.locationEnvironmentSummary.innerHTML = 'Select a battlefield to see its environmental characteristics.';
    }
}

function initializeTimeToggle() {
    if (!DOM.timeToggleContainer || !DOM.timeFeedbackDisplay || !DOM.timeOfDayValue) {
        // console.error("UI (initializeTimeToggle): Time toggle elements not found in DOM.");
        return;
    }
    const buttons = DOM.timeToggleContainer.querySelectorAll('.time-toggle-btn');
    if (buttons.length === 0) {
        // console.warn("UI (initializeTimeToggle): No time toggle buttons found.");
        DOM.timeFeedbackDisplay.innerHTML = "Time selection unavailable.";
        return;
    }

    // Set initial state based on default HTML (should be 'day')
    const initialTime = DOM.timeOfDayValue.value || 'day';
    DOM.timeFeedbackDisplay.innerHTML = `It is currently <b>${initialTime.charAt(0).toUpperCase() + initialTime.slice(1)}</b>. ${initialTime === 'day' ? 'Firebenders are empowered.' : 'Waterbenders are empowered.'}`;
    // Ensure the correct button is initially selected
    buttons.forEach(button => {
        if (button.dataset.value === initialTime) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });


    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            const time = button.dataset.value;
            if (DOM.timeOfDayValue) DOM.timeOfDayValue.value = time; // Check if element exists
            if (DOM.timeFeedbackDisplay) {
                 DOM.timeFeedbackDisplay.innerHTML = `It is now <b>${time.charAt(0).toUpperCase() + time.slice(1)}</b>. ${time === 'day' ? 'Firebenders are empowered.' : 'Waterbenders are empowered.'}`;
            }
        });
    });
}

function updateMomentumDisplay(fighterKey, momentumValue) {
    const momentumElement = fighterKey === 'fighter1' ? DOM.fighter1MomentumValue : DOM.fighter2MomentumValue;
    if (!momentumElement) {
        // console.warn(`UI (updateMomentumDisplay): Momentum display element for ${fighterKey} not found.`);
        return;
    }
    // Ensure momentumValue is a number, default to 0
    const value = typeof momentumValue === 'number' ? momentumValue : 0;

    momentumElement.textContent = String(value);
    momentumElement.classList.remove('momentum-positive', 'momentum-negative', 'momentum-neutral');
    if (value > 0) momentumElement.classList.add('momentum-positive');
    else if (value < 0) momentumElement.classList.add('momentum-negative');
    else momentumElement.classList.add('momentum-neutral');
}

export function populateUI() {
    populateCharacterGrids();
    populateLocationGrid();
    initializeTimeToggle();
    updateMomentumDisplay('fighter1', 0);
    updateMomentumDisplay('fighter2', 0);
    updateArchetypeInfo();
    if (DOM.simulationModeContainer && DOM.zoomInBtn && DOM.zoomOutBtn && DOM.animatedLogOutput) {
        initializeCameraControls(DOM.animatedLogOutput, DOM.zoomInBtn, DOM.zoomOutBtn);
    } else {
        // console.warn("UI (populateUI): One or more camera control DOM elements are missing for initialization.");
    }
}

export function showLoadingState(simulationMode) {
    // Ensure resultsSection exists before trying to modify its style
    if (DOM.resultsSection) {
        if (simulationMode === "animated") {
            DOM.resultsSection.style.display = 'none';
        } else {
            DOM.resultsSection.classList.remove('show');
            DOM.resultsSection.style.display = 'block';
        }
    } else {
        // console.warn("UI (showLoadingState): Results section DOM element not found.");
    }

    if (simulationMode === "animated") {
        if (DOM.simulationModeContainer) DOM.simulationModeContainer.classList.remove('hidden');
        if (DOM.animatedLogOutput) DOM.animatedLogOutput.innerHTML = `<div class="loading"><div class="spinner"></div><p>Preparing animated simulation...</p></div>`;
    } else {
        if (DOM.simulationModeContainer) DOM.simulationModeContainer.classList.add('hidden');
        if (DOM.loadingSpinner) DOM.loadingSpinner.classList.remove('hidden');
        if (DOM.battleResultsContainer) DOM.battleResultsContainer.classList.add('hidden');
    }

    if (DOM.battleBtn) DOM.battleBtn.disabled = true;
    if (DOM.vsDivider) DOM.vsDivider.classList.add('clash');

    const targetScrollElement = simulationMode === "animated" ? DOM.simulationModeContainer : DOM.resultsSection;
    if (targetScrollElement) {
        targetScrollElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

export function showResultsState(battleResult, simulationMode) {
    if (!battleResult) {
        // console.error("UI (showResultsState): battleResult is null or undefined. Cannot display results.");
        // Potentially show an error message to the user in the UI here.
        if(DOM.vsDivider) DOM.vsDivider.classList.remove('clash');
        if(DOM.loadingSpinner) DOM.loadingSpinner.classList.add('hidden');
        if(DOM.battleBtn) DOM.battleBtn.disabled = false;
        if(DOM.resultsSection) {
            DOM.resultsSection.innerHTML = "<p>Error: Could not load battle results.</p>";
            DOM.resultsSection.style.display = 'block';
            DOM.resultsSection.classList.add('show');
        }
        return;
    }

    if (DOM.vsDivider) DOM.vsDivider.classList.remove('clash');
    if (DOM.loadingSpinner) DOM.loadingSpinner.classList.add('hidden');

    const displayFinalResultsPanel = (result) => {
        if (!DOM.winnerName || !DOM.winProbability || !DOM.battleResultsContainer || !DOM.resultsSection || !DOM.battleBtn) {
            // console.error("UI (displayFinalResultsPanel): One or more critical DOM elements for displaying final results are missing.");
            return;
        }
        // Ensure `result` and its properties are safe to access
        const winnerCharacter = (result?.winnerId && characters) ? characters[result.winnerId] : null;

        if (result?.isDraw) {
            DOM.winnerName.textContent = `A Stalemate!`;
            DOM.winProbability.textContent = `The battle ends in a draw.`;
        } else if (winnerCharacter) {
            DOM.winnerName.textContent = `${winnerCharacter.name || 'Winner'} Wins!`;
            DOM.winProbability.textContent = `A decisive victory.`;
        } else {
            DOM.winnerName.textContent = `Battle Concluded`;
            DOM.winProbability.textContent = `Outcome details below.`;
        }

        const locationId = DOM.locationSelect?.value; // Get current location for analysis context
        displayFinalAnalysis(result?.finalState, result?.winnerId, result?.isDraw, result?.environmentState, locationId);

        if (result?.finalState?.fighter1) updateMomentumDisplay('fighter1', result.finalState.fighter1.momentum);
        if (result?.finalState?.fighter2) updateMomentumDisplay('fighter2', result.finalState.fighter2.momentum);

        DOM.battleResultsContainer.classList.remove('hidden');
        DOM.resultsSection.style.display = 'block';
        // Force reflow for transition
        void DOM.resultsSection.offsetWidth;
        DOM.resultsSection.classList.add('show');
        DOM.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        DOM.battleBtn.disabled = false;
    };

    if (simulationMode === "animated") {
        if (DOM.animatedLogOutput) DOM.animatedLogOutput.innerHTML = ''; // Clear loading/previous
        const animationQueue = transformEventsToAnimationQueue(battleResult.log || []); // Pass empty array if log is missing
        startSimulation(animationQueue, battleResult, (finalBattleResult, wasCancelledOrError) => {
            if (wasCancelledOrError && DOM.battleStory && finalBattleResult?.log) {
                DOM.battleStory.innerHTML = transformEventsToHtmlLog(finalBattleResult.log);
            }
            displayFinalResultsPanel(finalBattleResult);
        });
    } else { // Instant mode
        if (DOM.simulationModeContainer) DOM.simulationModeContainer.classList.add('hidden');
        if (DOM.battleStory) {
            DOM.battleStory.innerHTML = transformEventsToHtmlLog(battleResult.log || []); // Pass empty array if log is missing
        }
        displayFinalResultsPanel(battleResult);
    }
}


export function resetBattleUI() {
    if (DOM.resultsSection) DOM.resultsSection.classList.remove('show');
    if (DOM.environmentDamageDisplay) {
        DOM.environmentDamageDisplay.textContent = '';
        DOM.environmentDamageDisplay.className = 'environmental-damage-level'; // Reset class
    }
    if (DOM.environmentImpactsList) DOM.environmentImpactsList.innerHTML = '';
    if (DOM.battleStory) DOM.battleStory.innerHTML = '';
    if (DOM.analysisList) DOM.analysisList.innerHTML = '';
    if (DOM.winnerName) DOM.winnerName.textContent = '';
    if (DOM.winProbability) DOM.winProbability.textContent = '';

    resetSimulationManager(); // This will hide simulation container and reset its state
    resetCameraControls(DOM.simulationModeContainer); // Also reset camera zoom/scroll for simulation container

    updateMomentumDisplay('fighter1', 0);
    updateMomentumDisplay('fighter2', 0);

    // Delay hiding the results section to allow transition to complete
    setTimeout(() => {
        if (DOM.resultsSection && !DOM.resultsSection.classList.contains('show')) {
            DOM.resultsSection.style.display = 'none';
        }
    }, 500);
}

function displayFinalAnalysis(finalState, winnerId, isDraw = false, environmentState, locationId) {
    if (!DOM.analysisList) {
        // console.error("UI (displayFinalAnalysis): Analysis list DOM element not found.");
        return;
    }
    DOM.analysisList.innerHTML = ''; // Clear previous analysis

    if (!finalState || !finalState.fighter1 || !finalState.fighter2) {
        // console.warn("UI (displayFinalAnalysis): Final state for analysis is incomplete.");
        DOM.analysisList.innerHTML = "<li>Error: Analysis data incomplete.</li>";
        return;
    }
    const { fighter1, fighter2 } = finalState;

    const createListItem = (text, value, valueClass = 'modifier-neutral') => {
        const li = document.createElement('li');
        li.className = 'analysis-item';
        const spanReason = document.createElement('span');
        spanReason.innerHTML = text; // Allow HTML for bolding etc.
        const spanValue = document.createElement('span');
        spanValue.textContent = String(value); // Ensure value is a string
        spanValue.className = valueClass;
        li.appendChild(spanReason);
        li.appendChild(spanValue);
        DOM.analysisList.appendChild(li);
    };

    const createSummaryItem = (text) => {
        if (!text || typeof text !== 'string') return;
        const li = document.createElement('li');
        li.className = 'analysis-summary'; // New class for summary styling
        li.innerHTML = `<em>${text}</em>`; // Italicize summary
        DOM.analysisList.appendChild(li);
    };

    // New function for AI Log display
    const createLog = (logArray, title, className) => {
        if (!logArray || !Array.isArray(logArray) || logArray.length === 0) return;

        const validLogEntries = logArray.filter(entry => {
            // Basic check for object or non-empty string
            if (typeof entry === 'object' && entry !== null) return true;
            return typeof entry === 'string' && entry.trim() !== '';
        });

        if (validLogEntries.length === 0) return; // No valid entries to display

        const li = document.createElement('li');
        li.className = className; // e.g., 'ai-log' or 'phase-log'

        const formattedLog = validLogEntries.map(entry => {
            if (typeof entry === 'object' && entry !== null) {
                // Improved object formatting
                let parts = [];
                if(entry.turn !== undefined) parts.push(`T${entry.turn}`);
                if(entry.phase) parts.push(`Phase:${entry.phase}`);
                if(entry.intent) parts.push(`Intent:${entry.intent}`);
                if(entry.prediction) parts.push(`Pred:${entry.prediction}`);
                if(entry.chosenMove) parts.push(`Move:${entry.chosenMove}`);
                if(entry.finalProb) parts.push(`Prob:${entry.finalProb}`);
                if(entry.actorState) { // Safe access for actorState
                    parts.push(`HP:${(entry.actorState.hp || 0).toFixed(0)} E:${(entry.actorState.energy || 0).toFixed(0)} M:${entry.actorState.momentum || 0} MS:${entry.actorState.mental || 'N/A'}`);
                }
                if (entry.consideredMoves && Array.isArray(entry.consideredMoves) && entry.consideredMoves.length > 0) {
                    const topConsiderations = entry.consideredMoves.slice(0, 3).map(m => `${m?.name || 'N/A'}(${m?.prob || 'N/A'})`).join(', ');
                    parts.push(`Considered:[${topConsiderations}]`);
                }
                if (parts.length === 0) return JSON.stringify(entry); // Fallback for unexpected object structure
                return parts.join(' | ');
            }
            return String(entry); // Ensure it's a string
        }).join('<br>');

        li.innerHTML = `<strong>${title}:</strong><br><pre style="white-space: pre-wrap; word-break: break-all; font-size: 0.8em;"><code>${formattedLog}</code></pre>`;
        DOM.analysisList.appendChild(li);
    };


    if (!isDraw && winnerId) {
        const winner = winnerId === fighter1.id ? fighter1 : fighter2;
        // Ensure winner and winner.summary exist
        createSummaryItem(winner?.summary || `${winner?.name || 'Winner'} demonstrated superior skill.`);
    } else {
        createSummaryItem("The fighters were too evenly matched for a decisive outcome.");
    }

    // Add a spacer for visual separation
    const spacer = document.createElement('li');
    spacer.className = 'analysis-item-spacer'; // Style this with CSS for margin/padding
    DOM.analysisList.appendChild(spacer);


    // Fighter 1 Status
    const f1_name = fighter1.name || "Fighter 1";
    const f1_status = isDraw ? 'DRAW' : (fighter1.id === winnerId ? 'VICTORIOUS' : 'DEFEATED');
    const f1_class = isDraw ? 'modifier-neutral' : (fighter1.id === winnerId ? 'modifier-plus' : 'modifier-minus');
    createListItem(`<b>${f1_name}'s Final Status:</b>`, f1_status, f1_class);
    createListItem('• Health:', `${Math.round(fighter1.hp || 0)} / 100 HP`);
    createListItem('• Mental State:', (fighter1.mentalState?.level || 'stable').toUpperCase());
    createListItem('• Momentum:', fighter1.momentum || 0);

    // Fighter 2 Status
    const f2_name = fighter2.name || "Fighter 2";
    const f2_status = isDraw ? 'DRAW' : (fighter2.id === winnerId ? 'VICTORIOUS' : 'DEFEATED');
    const f2_class = isDraw ? 'modifier-neutral' : (fighter2.id === winnerId ? 'modifier-plus' : 'modifier-minus');
    createListItem(`<b>${f2_name}'s Final Status:</b>`, f2_status, f2_class);
    createListItem('• Health:', `${Math.round(fighter2.hp || 0)} / 100 HP`);
    createListItem('• Mental State:', (fighter2.mentalState?.level || 'stable').toUpperCase());
    createListItem('• Momentum:', fighter2.momentum || 0);

    DOM.analysisList.appendChild(spacer.cloneNode()); // Another spacer


    // Environmental Damage Analysis
    const currentLocData = locationId ? locationConditions[locationId] : null;
    if (environmentState && DOM.environmentDamageDisplay && DOM.environmentImpactsList && currentLocData?.damageThresholds) {
        const damageLevel = environmentState.damageLevel || 0;
        DOM.environmentDamageDisplay.textContent = `Environmental Damage: ${damageLevel.toFixed(0)}%`;
        let damageClass = '';
        if (damageLevel >= (currentLocData.damageThresholds.catastrophic || 101)) damageClass = 'catastrophic-damage';
        else if (damageLevel >= (currentLocData.damageThresholds.severe || 101)) damageClass = 'high-damage';
        else if (damageLevel >= (currentLocData.damageThresholds.moderate || 101)) damageClass = 'medium-damage';
        else if (damageLevel >= (currentLocData.damageThresholds.minor || 0)) damageClass = 'low-damage';
        DOM.environmentDamageDisplay.className = `environmental-damage-level ${damageClass}`;

        DOM.environmentImpactsList.innerHTML = ''; // Clear previous impacts
        if (environmentState.specificImpacts && environmentState.specificImpacts.size > 0) {
            environmentState.specificImpacts.forEach(impact => {
                if (typeof impact === 'string') { // Ensure impact is a string
                    const li = document.createElement('li');
                    li.textContent = impact;
                    DOM.environmentImpactsList.appendChild(li);
                }
            });
        } else {
            DOM.environmentImpactsList.innerHTML = '<li>The environment sustained minimal noticeable damage.</li>';
        }
    } else {
        if (DOM.environmentDamageDisplay) DOM.environmentDamageDisplay.textContent = 'Environmental Damage: N/A';
        if (DOM.environmentImpactsList) DOM.environmentImpactsList.innerHTML = '<li>No specific impact data.</li>';
        // console.warn("UI (displayFinalAnalysis): Environmental display elements or location data missing.");
    }

    // AI Logs
    DOM.analysisList.appendChild(spacer.cloneNode()); // Spacer before logs
    if (fighter1.aiLog && fighter1.aiLog.length > 0) {
        createLog(fighter1.aiLog, `${f1_name}'s Battle Log`, 'ai-log');
    }
    if (fighter2.aiLog && fighter2.aiLog.length > 0) {
        createLog(fighter2.aiLog, `${f2_name}'s Battle Log`, 'ai-log');
    }
    // Phase Log (assuming it's on one of the fighters, e.g., fighter1, or passed in finalState)
    const phaseLog = finalState.phaseLog || fighter1.phaseLog || []; // Get phase log
    if (phaseLog.length > 0) {
        createLog(phaseLog, 'Battle Phase Progression', 'phase-log');
    }
}