// FILE: main.js
'use strict';

import { simulateBattle } from './engine_battle-engine-core.js';
import { showLoadingState, showResultsState } from './ui_loading-states.js';
import { resetGlobalUI } from './ui.js';
import { setSimulationMode, initializeSimulationManagerDOM } from './simulation_mode_manager.js';
import { setupDetailedLogControls } from './ui_battle-results.js';

const battleBtn = document.getElementById('battleBtn');
let currentSimMode = "animated";

function handleModeSelectionChange(event) {
    if (event.target.name === "simulationMode") {
        currentSimMode = event.target.value;
        setSimulationMode(currentSimMode);
        console.log("Simulation mode changed to:", currentSimMode);
    }
}

function init() {
    // No longer need to populate UI selections

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
    setSimulationMode(currentSimMode);

    const modeSelectionContainer = document.querySelector('.mode-selection-section');
    if (modeSelectionContainer) {
        modeSelectionContainer.addEventListener('change', handleModeSelectionChange);
    }

    const defaultModeRadio = document.getElementById(`mode-${currentSimMode}`);
    if (defaultModeRadio) {
        defaultModeRadio.checked = true;
    }

    if (battleBtn) {
        battleBtn.addEventListener('click', () => {
            const f1Id = 'aang-airbending-only';
            const f2Id = 'azula';
            const locId = 'fire-nation-capital';
            const timeOfDay = 'day';
            const emotionalMode = true; // Hardcoded

            resetGlobalUI();
            showLoadingState(currentSimMode);

            setTimeout(() => {
                try {
                    const battleResult = simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode);
                    showResultsState(battleResult, currentSimMode);
                } catch (error) {
                     console.error("An error occurred during battle simulation:", error);
                     alert("A critical error occurred. Please check the console and refresh.");
                     if (document.getElementById('loading')) document.getElementById('loading').classList.add('hidden');
                     if (battleBtn) battleBtn.disabled = false;
                }
            }, 100);
        });
    }

    setupDetailedLogControls();
}

// Kick off app initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', init);