// FILE: js/main.js
'use strict';

// This is the main entry point for the application.
// It handles user interactions and initiates the battle simulation.
// MODIFIED: The import for simulateBattle now points to the new engine core.

import { simulateBattle } from './engine/battle-engine-core.js';
import { DOM, populateDropdowns, updateFighterDisplay, showLoadingState, showResultsState, resetBattleUI } from './ui.js';

function handleBattleStart() {
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
    updateFighterDisplay('fighter1');
    updateFighterDisplay('fighter2');

    DOM.battleBtn.addEventListener('click', handleBattleStart);
    DOM.fighter1Select.addEventListener('change', () => updateFighterDisplay('fighter1'));
    DOM.fighter2Select.addEventListener('change', () => updateFighterDisplay('fighter2'));
}

document.addEventListener('DOMContentLoaded', init);