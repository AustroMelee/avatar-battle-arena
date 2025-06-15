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

function handleBattleStart() {
    const f1Id = document.getElementById('fighter1-value').value;
    const f2Id = document.getElementById('fighter2-value').value;
    const locId = document.getElementById('location-value').value;
    const timeOfDay = document.getElementById('time-of-day-value').value;
    const emotionalMode = document.getElementById('emotional-mode').checked;
    if (!f1Id || !f2Id || !locId) {
        alert("Please select both fighters and a battlefield.");
        return;
    }
    if (f1Id === f2Id) {
        alert('Please select two different fighters!');
        return;
    }

    resetGlobalUI(); // Use the global reset function
    showLoadingState(currentSimMode); // Use the centralized loading state function

    setTimeout(() => {
        try {
            const rawBattleResult = simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode);
            showResultsState(rawBattleResult, currentSimMode); // Use the centralized results display function
        } catch (error) {
            console.error("An error occurred during battle simulation:", error);
            alert("A critical error occurred. Please check the console and refresh.");
            // Re-enable button and hide loading on error
            const loadingSpinner = document.getElementById('loading'); // Direct access here
            if (loadingSpinner) loadingSpinner.classList.add('hidden');

            const simModeContainer = document.getElementById('simulation-mode-container'); // Direct access here
            if (simModeContainer) {
                simModeContainer.classList.add('hidden');
            }
            if (battleBtn) battleBtn.disabled = false;
            resetSimulationManager(); // Use the centralized simulation manager reset
        }
    }, 1500);
}

function handleModeSelectionChange(event) {
    if (event.target.name === "simulationMode") {
        currentSimMode = event.target.value;
        setSimulationMode(currentSimMode); // Use the centralized set mode function
        console.log("Simulation mode changed to:", currentSimMode);
    }
}

/*
// Removed this local function as it's now centralized and exported from ui_battle-results.js
function setupDetailedLogControls() {
    const toggleBtn = document.getElementById('toggle-detailed-logs-btn');
    const copyBtn = document.getElementById('copy-detailed-logs-btn');
    const contentDiv = document.getElementById('detailed-battle-logs-content');
    if (toggleBtn && contentDiv) {
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = contentDiv.classList.toggle('collapsed');
            toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
            toggleBtn.textContent = isCollapsed ? 'Show Detailed Battle Logs ►' : 'Hide Detailed Battle Logs ▼';
        });
    } else {
        if (!toggleBtn) console.warn("Toggle detailed logs button not found.");
        if (!contentDiv) console.warn("Detailed battle logs content div not found.");
    }

    if (copyBtn && contentDiv) {
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(contentDiv.textContent || '');
                copyBtn.textContent = '📋 Copied!';
                setTimeout(() => {
                    copyBtn.textContent = '📋 Copy Battle Logs';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy detailed logs: ', err);
                copyBtn.textContent = 'Error Copying';
                setTimeout(() => {
                    copyBtn.textContent = '📋 Copy Battle Logs';
                }, 2000);
            }
        });
    } else {
        if (!copyBtn) console.warn("Copy detailed logs button not found.");
    }
}
*/

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

    if (battleBtn) {
        battleBtn.addEventListener('click', handleBattleStart);
    } else {
        console.error("Battle button not found.");
    }

    setupDetailedLogControls(); // Call the imported setup function
    initializeDevModeUI(); // Initialize Dev Mode UI
}


// Kick off app initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', init);