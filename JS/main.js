// FILE: main.js
'use strict';

import { simulateBattle } from './engine_battle-engine-core.js';
// --- UPDATED IMPORTS ---
import { showLoadingState, showResultsState } from './ui_loading-states.js'; // Imports show/hide loading/results states
import { populateAllUI, resetGlobalUI, getCharacterImageFromUI as getCharacterImage } from './ui.js'; // Harmonized UI functions, and importing getCharacterImage
import { setSimulationMode, initializeSimulationManagerDOM, resetSimulationManager } from './simulation_mode_manager.js'; // Correct imports for sim manager
import { setupDetailedLogControls } from './ui_battle-results.js'; // Correct import for setupDetailedLogControls
// --- END UPDATED IMPORTS ---
import { initializeDevModeUI } from './dev_mode_manager.js';

const battleBtn = document.getElementById('battleBtn'); // Keep this as it's the trigger element
let currentSimMode = "animated";

function handleModeSelectionChange(event) {
    if (event.target.name === "simulationMode") {
        currentSimMode = event.target.value;
        setSimulationMode(currentSimMode);
        console.log("Simulation mode changed to:", currentSimMode);
    }
}

function init() {
    populateAllUI(); // Use the global populate UI function

    // Initialize simulation manager, passing the necessary DOM elements directly from the main document
    // (these are accessed via document.getElementById in the sim manager, so no need for DOM_SHARED here)
    initializeSimulationManagerDOM({
        simulationContainer: document.getElementById('simulation-mode-container'),
        cancelButton: document.getElementById('cancel-simulation'),
        battleResultsContainer: document.getElementById('battle-results'),
        winnerNameDisplay: document.getElementById('winner-name'),
        analysisListDisplay: document.getElementById('analysis-list'),
        battleStoryDisplay: document.getElementById('battle-story'),
        animatedLogOutput: document.getElementById('animated-log-output'),
        zoomInBtn: document.getElementById('zoom-in'),
        zoomOutBtn: document.getElementById('zoom-out'),
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

    setupDetailedLogControls(); // Call the imported setup function
    initializeDevModeUI(); // Initialize Dev Mode UI
}


// Kick off app initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', init);