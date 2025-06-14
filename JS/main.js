// FILE: js/main.js
'use strict';

import { simulateBattle } from './engine_battle-engine-core.js';
import { populateUI, showLoadingState, showResultsState, resetBattleUI, DOM_simulation_references } from './ui.js';
import { setSimulationMode, initializeSimulationManagerDOM, resetSimulationManager } from './simulation_mode_manager.js';

const battleBtn = document.getElementById('battleBtn');
let currentSimMode = "animated"; // Default to animated

// NEW: Get references to toggle and copy buttons
const toggleSimLogBtn = document.getElementById('toggle-sim-log-btn');
const animatedLogOutput = document.getElementById('animated-log-output');
const copySimLogBtn = document.getElementById('copy-sim-log-btn');

const toggleResultsDetailsBtn = document.getElementById('toggle-results-details-btn');
const resultsDetailsContent = document.getElementById('results-details-content');
const copyResultsDetailsBtn = document.getElementById('copy-results-details-btn');


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

    // Collapse sections before battle
    if (animatedLogOutput && !animatedLogOutput.classList.contains('collapsed')) {
        animatedLogOutput.classList.add('collapsed');
        if (toggleSimLogBtn) {
            toggleSimLogBtn.textContent = "Show Log ►";
            toggleSimLogBtn.setAttribute('aria-expanded', 'false');
        }
    }
    if (resultsDetailsContent && !resultsDetailsContent.classList.contains('collapsed')) {
        resultsDetailsContent.classList.add('collapsed');
        if (toggleResultsDetailsBtn) {
            toggleResultsDetailsBtn.textContent = "Show Details ►";
            toggleResultsDetailsBtn.setAttribute('aria-expanded', 'false');
        }
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

// NEW: Function to handle toggling collapsible sections
function setupCollapsible(button, contentElement, showText, hideText) {
    if (!button || !contentElement) return;

    button.addEventListener('click', () => {
        const isCollapsed = contentElement.classList.toggle('collapsed');
        button.textContent = isCollapsed ? showText : hideText;
        button.setAttribute('aria-expanded', String(!isCollapsed));
    });
}

// NEW: Function to handle copying content
async function copyContentToClipboard(contentElement, buttonElement, buttonOriginalText) {
    if (!contentElement || !buttonElement) return;

    let textToCopy = "";
    if (contentElement.id === 'animated-log-output') {
        const lines = contentElement.querySelectorAll('.simulation-line');
        lines.forEach(line => {
            const textSpan = line.querySelector('.simulation-text-content');
            // For phase headers, they might not have the 'simulation-text-content' span,
            // so we take the whole line's innerText. Also trim whitespace.
            let lineText = textSpan ? textSpan.innerText : line.innerText;
            lineText = lineText.trim();
            if (lineText) { // Only add non-empty lines
                 textToCopy += lineText + "\n";
            }
        });
        textToCopy = textToCopy.trim(); // Remove trailing newline
    } else {
        textToCopy = contentElement.innerText.trim();
    }


    if (!textToCopy) {
        buttonElement.textContent = 'Nothing to Copy!';
        setTimeout(() => {
            buttonElement.textContent = buttonOriginalText;
        }, 2000);
        return;
    }

    try {
        await navigator.clipboard.writeText(textToCopy);
        buttonElement.textContent = 'Copied!';
    } catch (err) {
        console.error('Failed to copy: ', err);
        buttonElement.textContent = 'Copy Failed!';
    } finally {
        setTimeout(() => {
            buttonElement.textContent = buttonOriginalText;
        }, 2000);
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

    // NEW: Setup for collapsible sections and copy buttons
    if (toggleSimLogBtn && animatedLogOutput) {
        setupCollapsible(toggleSimLogBtn, animatedLogOutput, "Show Log ►", "Hide Log ▼");
    }
    if (copySimLogBtn && animatedLogOutput) {
        copySimLogBtn.addEventListener('click', () => copyContentToClipboard(animatedLogOutput, copySimLogBtn, "📋 Copy Log"));
    }

    if (toggleResultsDetailsBtn && resultsDetailsContent) {
        setupCollapsible(toggleResultsDetailsBtn, resultsDetailsContent, "Show Details ►", "Hide Details ▼");
    }
    if (copyResultsDetailsBtn && resultsDetailsContent) {
        copyResultsDetailsBtn.addEventListener('click', () => copyContentToClipboard(resultsDetailsContent, copyResultsDetailsBtn, "📋 Copy Details"));
    }
}

document.addEventListener('DOMContentLoaded', init);