'use strict';

import { calculateWinProbability, generateBattleStory } from './battle-engine.js';
import { DOM, populateDropdowns, updateFighterDisplay, showLoadingState, showResultsState, resetBattleUI } from './ui.js';

function handleBattleStart() {
    const f1Id = DOM.fighter1Select.value;
    const f2Id = DOM.fighter2Select.value;
    const locId = DOM.locationSelect.value;

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
            const battleOutcome = calculateWinProbability(f1Id, f2Id, locId);
            const story = generateBattleStory(f1Id, f2Id, locId, battleOutcome);
            battleOutcome.story = story;
            showResultsState(battleOutcome);

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