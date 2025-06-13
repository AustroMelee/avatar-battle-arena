'use strict';

// This is the main entry point for the application.
// It handles user interactions and initiates the battle simulation.

import { simulateBattle } from './engine_battle-engine-core.js';
// MODIFIED: Calling a single UI setup function.
import { populateUI, showLoadingState, showResultsState, resetBattleUI } from './ui.js';

// Get a reference to the battle button
const battleBtn = document.getElementById('battleBtn');

function handleBattleStart() {
    // These values now come from the hidden input fields that the UI updates.
    const f1Id = document.getElementById('fighter1-value').value;
    const f2Id = document.getElementById('fighter2-value').value;
    const locId = document.getElementById('location-value').value;
    // MODIFIED: Reading from the new hidden input for time of day.
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

    resetBattleUI();
    showLoadingState();

    setTimeout(() => {
        try {
            const battleResult = simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode);
            showResultsState(battleResult);

        } catch (error) {
            console.error("An error occurred during battle simulation:", error);
            alert("A critical error occurred. Please check the console and refresh.");
            // Manually re-enable the button on error
            document.getElementById('loading').classList.add('hidden');
            battleBtn.disabled = false;
        }
    }, 1500);
}

function init() {
    // MODIFIED: Use the new unified UI setup function.
    populateUI();
    // Set up the primary event listener
    battleBtn.addEventListener('click', handleBattleStart);
}

// Run the application
document.addEventListener('DOMContentLoaded', init);