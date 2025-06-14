// FILE: main.js
'use strict';

import { simulateBattle } from './engine_battle-engine-core.js';
import { populateUI, showLoadingState, showResultsState, resetBattleUI, DOM_simulation_references } from './ui.js';
import { setSimulationMode, initializeSimulationManagerDOM, resetSimulationManager } from './simulation_mode_manager.js'; 

const battleBtn = document.getElementById('battleBtn');
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

    resetBattleUI(); 
    showLoadingState(currentSimMode); 

    setTimeout(() => {
        try {
            const rawBattleResult = simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode);
            showResultsState(rawBattleResult, currentSimMode);
        } catch (error) {
            console.error("An error occurred during battle simulation:", error);
            alert("A critical error occurred. Please check the console and refresh.");
            const loadingSpinner = document.getElementById('loading');
            if(loadingSpinner) loadingSpinner.classList.add('hidden');
            
            const simModeContainer = document.getElementById('simulation-mode-container');
            if (simModeContainer) {
                 simModeContainer.classList.add('hidden');
            }
            if(battleBtn) battleBtn.disabled = false;
            resetSimulationManager(); 
        }
    }, 1500); 
}

function handleModeSelectionChange(event) {
    if (event.target.name === "simulationMode") {
        currentSimMode = event.target.value;
        setSimulationMode(currentSimMode); 
        console.log("Simulation mode changed to:", currentSimMode);
    }
}

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
    
    setupDetailedLogControls();
}

document.addEventListener('DOMContentLoaded', init);