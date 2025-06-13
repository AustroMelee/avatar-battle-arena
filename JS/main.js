// FILE: js/main.js
'use strict';

import { simulateBattle } from './engine_battle-engine-core.js';
import { populateUI, showLoadingState, showResultsState, resetBattleUI, DOM_simulation_references } from './ui.js';
import { setSimulationMode, initializeSimulationManagerDOM, resetSimulationManager } from './simulation_mode_manager.js'; // Import new manager functions

const battleBtn = document.getElementById('battleBtn');
let currentSimMode = "animated"; // Default to animated

/**
 * Handles the start of a battle simulation.
 * Gathers selected fighter IDs, location, time of day, and emotional mode.
 * Initiates loading state, then runs the simulation and displays results.
 */
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

    resetBattleUI(); // Resets standard results and simulation container via simulation_mode_manager
    showLoadingState(currentSimMode); // Pass currentSimMode to showLoadingState

    setTimeout(() => {
        try {
            const rawBattleResult = simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode);
            showResultsState(rawBattleResult, currentSimMode);
        } catch (error) {
            console.error("An error occurred during battle simulation:", error);
            alert("A critical error occurred. Please check the console and refresh.");
            // Ensure UI is reset/usable on error
            const loadingSpinner = document.getElementById('loading');
            if(loadingSpinner) loadingSpinner.classList.add('hidden');
            
            const simModeContainer = document.getElementById('simulation-mode-container');
            if (simModeContainer) {
                 simModeContainer.classList.add('hidden');
            }
            if(battleBtn) battleBtn.disabled = false;
            resetSimulationManager(); 
        }
    }, 1500); // Artificial delay for loading spinner
}

/**
 * Handles changes in the simulation mode selection.
 * @param {Event} event - The change event from the radio button group.
 */
function handleModeSelectionChange(event) {
    if (event.target.name === "simulationMode") {
        currentSimMode = event.target.value;
        setSimulationMode(currentSimMode); 
        console.log("Simulation mode changed to:", currentSimMode);
    }
}

/**
 * Initializes the application.
 * Populates UI elements, sets up event listeners, and initializes managers.
 */
function init() {
    populateUI(); 
    
    initializeSimulationManagerDOM(DOM_simulation_references);
    setSimulationMode(currentSimMode); 

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
}

document.addEventListener('DOMContentLoaded', init);