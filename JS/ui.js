// FILE: js/main.js
'use strict';

// This is the main entry point for the application.
// It handles user interactions and initiates the battle simulation.

import { simulateBattle } from './engine/battle-engine-core.js';
// MODIFIED: 'updateFighterDisplay' is no longer imported as it has been removed.
import { DOM, populateDropdowns, showLoadingState, showResultsState, resetBattleUI } from './ui.js';

function handleBattleStart() {
    // This value now comes from the hidden input fields that the card UI updates.
    const f1Id = DOM.fighter1Select.value;
    const f2Id = DOM.fighter2Select.value;
    const locId = DOM.locationSelect.value;
    const timeOfDay = DOM.timeOfDaySelect.value;
    const emotionalMode = DOM.emotionalModeCheckbox.checked;

    if (!f1Id || !f2Id || !locId) {
        alert("Please select both fighters and a location.");
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
            DOM.loadingSpinner.classList.add('hidden');
            DOM.battleBtn.disabled = false;
        }
    }, 1500);
}

function init() {
    populateDropdowns();
    // REMOVED: These lines were calling the non-existent function.
    // The new card-based UI handles its own state updates via click events.
    // updateFighterDisplay('fighter1');
    // updateFighterDisplay('fighter2');

    DOM.battleBtn.addEventListener('click', handleBattleStart);
    // REMOVED: The old <select> event listeners are no longer needed.
    // The new card click listeners are set up within ui.js.
    // DOM.fighter1Select.addEventListener('change', () => updateFighterDisplay('fighter1'));
    // DOM.fighter2Select.addEventListener('change', () => updateFighterDisplay('fighter2'));
}

document.addEventListener('DOMContentLoaded', init);