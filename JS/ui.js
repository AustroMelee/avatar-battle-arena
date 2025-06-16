// FILE: ui.js
'use strict';

// Orchestrates the main UI components and battle simulation flow.

import { simulateBattle } from './engine_battle-engine-core.js';
import { showLoadingState, showResultsState } from './ui_loading-states.js';
import { resetBattleResultsUI } from './ui_battle-results.js';
import { transformEventsToAnimationQueue } from './battle_log_transformer.js';
import { initializeSimulationManagerDOM, setSimulationMode, resetSimulationManager } from './simulation_mode_manager.js';
import { initializeDevModeUI } from './dev_mode_manager.js';
import { populateCharacterGrids } from './ui_character-selection.js';
import { populateLocationGrid, updateEnvironmentalSummary } from './ui_location-selection.js';
import { updateMomentumDisplay, updateEscalationDisplay } from './ui_momentum-escalation-display.js';
import { renderArchetypeDisplay } from './ui_archetype-display.js';
import { resolveArchetypeLabel } from './engine_archetype-engine.js';
import { setupDetailedLogControls } from './ui_battle-results.js';
import { characters } from './data_characters.js';

// Centralized DOM references used across UI modules, or for orchestration
const DOM_SHARED = {
    fighter1Select: document.getElementById('fighter1-value'),
    fighter2Select: document.getElementById('fighter2-value'),
    locationSelect: document.getElementById('location-value'),
    timeOfDayValue: document.getElementById('time-of-day-value'),
    emotionalModeCheckbox: document.getElementById('emotional-mode'),
    battleBtn: document.getElementById('battleBtn'),
    vsDivider: document.getElementById('vsDivider'),
    fighter1NameDisplay: document.getElementById('fighter1-name-display'),
    fighter2NameDisplay: document.getElementById('fighter2-name-display'),
    locationNameDisplay: document.getElementById('location-name-display'),
    timeToggleContainer: document.getElementById('time-toggle-container'),
    timeFeedbackDisplay: document.getElementById('time-feedback'),
    locationEnvironmentSummary: document.getElementById('location-environment-summary'),

    // Archetype display elements
    archetypeContainer: document.getElementById('archetype-info-container'),
    archetypeHeadline: document.getElementById('archetype-headline'),
    archetypeIntroA: document.getElementById('archetype-intro-a'),
    archetypeIntroB: document.getElementById('archetype-intro-b'),
    archetypeError: document.getElementById('archetype-error'),

    // For simulation manager initialization
    simulationModeContainer: document.getElementById('simulation-mode-container'),
    animatedLogOutput: document.getElementById('animated-log-output'),
    cancelSimulationBtn: document.getElementById('cancel-simulation'),
    zoomInBtn: document.getElementById('zoom-in'),
    zoomOutBtn: document.getElementById('zoom-out'),

    // Character/Location grid containers (used by their respective populate functions)
    fighter1Grid: document.getElementById('fighter1-grid'),
    fighter2Grid: document.getElementById('fighter2-grid'),
    locationGrid: document.getElementById('location-grid'),

    // For battle results UI interaction
    resultsSection: document.getElementById('results'),
    battleResultsContainer: document.getElementById('battle-results'),
    winnerName: document.getElementById('winner-name'),
    winProbability: document.getElementById('win-probability'),
    battleStory: document.getElementById('battle-story'),
    analysisList: document.getElementById('analysis-list'),
    environmentDamageDisplay: document.getElementById('environment-damage-display'),
    environmentImpactsList: document.getElementById('environment-impacts-list'),
    detailedBattleLogsContent: document.getElementById('detailed-battle-logs-content'),
    toggleDetailedLogsBtn: document.getElementById('toggle-detailed-logs-btn'),
    copyDetailedLogsBtn: document.getElementById('copy-detailed-logs-btn'),
};

/**
 * Returns the image URL for a given character ID.
 * This is needed by `animated_text_engine.js`.
 * @param {string} charId - The ID of the character.
 * @returns {string|null} The image URL or null if not found.
 */
export function getCharacterImageFromUI(charId) { // Renamed to avoid direct conflict with characters.js access
    return characters[charId]?.imageUrl || null;
}

// Internal function to update archetype display based on current selections
function updateArchetypeInfo() {
    // Added null checks here before attempting to read .value
    const fighter1Id = DOM_SHARED.fighter1Select?.value || null;
    const fighter2Id = DOM_SHARED.fighter2Select?.value || null;
    const locationId = DOM_SHARED.locationSelect?.value || null;
    
    const archetypeData = resolveArchetypeLabel(fighter1Id, fighter2Id, locationId);
    renderArchetypeDisplay(archetypeData, {
        container: DOM_SHARED.archetypeContainer,
        headline: DOM_SHARED.archetypeHeadline,
        introA: DOM_SHARED.archetypeIntroA,
        introB: DOM_SHARED.archetypeIntroB,
        error: DOM_SHARED.archetypeError
    });
}

// Function passed to character/location selection modules to update archetype display on selection
function onSelectionChanged() {
    updateArchetypeInfo();
}

// Initialize time toggle handler
function initializeTimeToggle() {
    const buttons = DOM_SHARED.timeToggleContainer.querySelectorAll('.time-toggle-btn');
    if (buttons.length === 0) {
        console.warn("No time toggle buttons found.");
        DOM_SHARED.timeFeedbackDisplay.innerHTML = "Time toggle unavailable.";
        return;
    }
    DOM_SHARED.timeFeedbackDisplay.innerHTML = "It is currently <b>Day</b>. Firebenders are empowered.";
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            const time = button.dataset.value;
            DOM_SHARED.timeOfDayValue.value = time;
            DOM_SHARED.timeFeedbackDisplay.innerHTML = `It is now <b>${time.charAt(0).toUpperCase() + time.slice(1)}</b>. ${time === 'day' ? 'Firebenders are empowered.' : 'Waterbenders are empowered.'}`;
        });
    });
}

// Main populate UI function
export function populateAllUI() { // Renamed from populateUI
    // Pass shared DOM elements and update callback to sub-modules
    populateCharacterGrids(DOM_SHARED.fighter1Grid, DOM_SHARED.fighter2Grid, DOM_SHARED.fighter1NameDisplay, DOM_SHARED.fighter2NameDisplay, DOM_SHARED.fighter1Select, DOM_SHARED.fighter2Select, onSelectionChanged);
    populateLocationGrid(DOM_SHARED.locationGrid, DOM_SHARED.locationNameDisplay, DOM_SHARED.locationSelect, DOM_SHARED.locationEnvironmentSummary, onSelectionChanged);
    initializeTimeToggle();
    
    updateMomentumDisplay('fighter1', 0); // Initialize momentum display
    updateMomentumDisplay('fighter2', 0); // Initialize momentum display
    updateEscalationDisplay('fighter1', 0, 'Normal'); // Initialize escalation display
    updateEscalationDisplay('fighter2', 0, 'Normal'); // Initialize escalation display
    updateArchetypeInfo(); // Initial archetype display
}

// Global reset UI function
export function resetGlobalUI() { // Renamed from resetBattleUI
    resetBattleResultsUI(); // Calls the centralized reset function in ui_battle-results.js
    resetSimulationManager(); // Resets simulation manager state

    updateMomentumDisplay('fighter1', 0);
    updateMomentumDisplay('fighter2', 0);
    updateEscalationDisplay('fighter1', 0, 'Normal');
    updateEscalationDisplay('fighter2', 0, 'Normal');
}


// Handle battle start button click
function handleBattleStart() {
    const f1Id = DOM_SHARED.fighter1Select.value;
    const f2Id = DOM_SHARED.fighter2Select.value;
    const locId = DOM_SHARED.locationSelect.value;
    const timeOfDay = DOM_SHARED.timeOfDayValue.value;
    const emotionalMode = DOM_SHARED.emotionalModeCheckbox.checked;

    if (!f1Id || !f2Id || !locId) {
        alert("Please select both fighters and a battlefield.");
        return;
    }
    if (f1Id === f2Id) {
        alert('Please select two different fighters!');
        return;
    }

    resetGlobalUI(); // Reset all UI elements before new battle
    showLoadingState(currentSimMode); // Show loading UI based on mode

    setTimeout(() => {
        try {
            const rawBattleResult = simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode);
            showResultsState(rawBattleResult, currentSimMode); // Display results based on mode
        } catch (error) {
            console.error("An error occurred during battle simulation:", error);
            alert("A critical error occurred. Please check the console and refresh.");
            // Re-enable button and hide loading on error
            if (DOM_SHARED.loadingSpinner) DOM_SHARED.loadingSpinner.classList.add('hidden');
            if (DOM_SHARED.simulationModeContainer) DOM_SHARED.simulationModeContainer.classList.add('hidden');
            if (DOM_SHARED.battleBtn) DOM_SHARED.battleBtn.disabled = false;
            resetSimulationManager(); // Ensure manager is reset even on error
        }
    }, 1500);
}

// Handle simulation mode radio button change
let currentSimMode = "animated"; // Default mode
function handleModeSelectionChange(event) {
    if (event.target.name === "simulationMode") {
        currentSimMode = event.target.value;
        setSimulationMode(currentSimMode);
        console.log("Simulation mode changed to:", currentSimMode);
    }
}

// Initial setup on DOMContentLoaded
function init() {
    // Populate grids and initial displays
    populateAllUI();

    // Initialize simulation manager with specific DOM references
    initializeSimulationManagerDOM({
        simulationContainer: DOM_SHARED.simulationModeContainer,
        cancelButton: DOM_SHARED.cancelSimulationBtn,
        battleResultsContainer: DOM_SHARED.battleResultsContainer,
        winnerNameDisplay: DOM_SHARED.winnerName,
        analysisListDisplay: DOM_SHARED.analysisList,
        battleStoryDisplay: DOM_SHARED.battleStory,
        animatedLogOutput: DOM_SHARED.animatedLogOutput,
        zoomInBtn: DOM_SHARED.zoomInBtn,
        zoomOutBtn: DOM_SHARED.zoomOutBtn,
    });
    setSimulationMode(currentSimMode); // Set initial mode in manager

    const modeSelectionContainer = document.querySelector('.mode-selection-section');
    if (modeSelectionContainer) {
        modeSelectionContainer.addEventListener('change', handleModeSelectionChange);
    } else {
        console.error("Mode selection container not found for event listener setup.");
    }
    const defaultModeRadio = document.getElementById(`mode-${currentSimMode}`);
    if (defaultModeRadio) {
        defaultModeRadio.checked = true;
    }

    if (DOM_SHARED.battleBtn) {
        DOM_SHARED.battleBtn.addEventListener('click', handleBattleStart);
    } else {
        console.error("Battle button not found.");
    }

    setupDetailedLogControls(); // Setup detailed log expand/copy functionality
    initializeDevModeUI(); // Initialize Dev Mode UI (if enabled)
}

document.addEventListener('DOMContentLoaded', init);