// FILE: ui_loading-states.js
'use strict';

// Manages the display and hiding of loading spinners and results panels.

import { characters } from './data_characters.js';
import { transformEventsToHtmlLog } from './battle_log_transformer.js';
import { startSimulation as startAnimationSimulation } from './simulation_mode_manager.js';
import { updateMomentumDisplay, updateEscalationDisplay } from './ui_momentum-escalation-display.js';
import { setupDetailedLogControls, displayFinalAnalysis, resetBattleResultsUI } from './ui_battle-results.js';

const DOM_ELEMENTS = {
    resultsSection: document.getElementById('results'),
    loadingSpinner: document.getElementById('loading'),
    battleResultsContainer: document.getElementById('battle-results'),
    vsDivider: document.getElementById('vsDivider'),
    winnerName: document.getElementById('winner-name'),
    winProbability: document.getElementById('win-probability'),
    battleStory: document.getElementById('battle-story'),
    animatedLogOutput: document.getElementById('animated-log-output'),
    toggleDetailedLogsBtn: document.getElementById('toggle-detailed-logs-btn'),
    copyDetailedLogsBtn: document.getElementById('copy-detailed-logs-btn'),
    // FIX: Add battleBtn to DOM_ELEMENTS
    battleBtn: document.getElementById('battleBtn'),
};

/**
 * Shows the loading state UI.
 * @param {string} simulationMode - 'animated' or 'instant'.
 */
export function showLoadingState(simulationMode) {
    if (simulationMode === "animated") {
        if (DOM_ELEMENTS.resultsSection) DOM_ELEMENTS.resultsSection.style.display = 'none';
        
        if (DOM_ELEMENTS.animatedLogOutput) {
            DOM_ELEMENTS.animatedLogOutput.innerHTML = `<div class="loading"><div class="spinner"></div><p>Preparing animated simulation...</p></div>`;
            DOM_ELEMENTS.animatedLogOutput.closest('.simulation-mode-container')?.classList.remove('hidden'); 
        }
    } else { // Instant mode
        if (DOM_ELEMENTS.animatedLogOutput) DOM_ELEMENTS.animatedLogOutput.closest('.simulation-mode-container')?.classList.add('hidden');
        if (DOM_ELEMENTS.resultsSection) {
            DOM_ELEMENTS.resultsSection.classList.remove('show');
            DOM_ELEMENTS.resultsSection.style.display = 'block';
        }
        if (DOM_ELEMENTS.loadingSpinner) DOM_ELEMENTS.loadingSpinner.classList.remove('hidden');
        if (DOM_ELEMENTS.battleResultsContainer) DOM_ELEMENTS.battleResultsContainer.classList.add('hidden');
    }
    
    // FIX: Directly use DOM_ELEMENTS.battleBtn which is now properly initialized
    if (DOM_ELEMENTS.battleBtn) DOM_ELEMENTS.battleBtn.disabled = true;

    if (DOM_ELEMENTS.vsDivider) DOM_ELEMENTS.vsDivider.classList.add('clash');
    const targetScrollElement = simulationMode === "animated" ? (DOM_ELEMENTS.animatedLogOutput?.closest('.simulation-mode-container') || DOM_ELEMENTS.resultsSection) : DOM_ELEMENTS.resultsSection;
    if (targetScrollElement) {
        targetScrollElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Displays the battle results in the UI.
 * @param {object} battleResult - The full battle result object.
 * @param {string} simulationMode - The current simulation mode ('animated' or 'instant').
 */
export function showResultsState(battleResult, simulationMode) {
    if (!battleResult || !battleResult.finalState) {
        console.error("Invalid battleResult passed to showResultsState", battleResult);
        if (DOM_ELEMENTS.winnerName) DOM_ELEMENTS.winnerName.textContent = "Error processing results.";
        if (DOM_ELEMENTS.battleStory) DOM_ELEMENTS.battleStory.innerHTML = "<p>An error occurred, and results cannot be displayed.</p>";
        if (DOM_ELEMENTS.loadingSpinner) DOM_ELEMENTS.loadingSpinner.classList.add('hidden');
        // FIX: Directly use DOM_ELEMENTS.battleBtn which is now properly initialized
        if (DOM_ELEMENTS.battleBtn) DOM_ELEMENTS.battleBtn.disabled = false;
        return;
    }

    if (DOM_ELEMENTS.vsDivider) DOM_ELEMENTS.vsDivider.classList.remove('clash');
    if (DOM_ELEMENTS.loadingSpinner) DOM_ELEMENTS.loadingSpinner.classList.add('hidden');

    const displayFinalResultsPanel = (result) => {
        if (!DOM_ELEMENTS.winnerName || !DOM_ELEMENTS.winProbability || !DOM_ELEMENTS.battleResultsContainer || !DOM_ELEMENTS.resultsSection) {
            console.error("One or more critical DOM elements for displaying final results are missing.");
            return;
        }

        if (result.isDraw) {
            DOM_ELEMENTS.winnerName.textContent = `A Stalemate!`;
            DOM_ELEMENTS.winProbability.textContent = `The battle ends in a draw.`;
        } else if (result.winnerId && characters[result.winnerId]) {
            DOM_ELEMENTS.winnerName.textContent = `${characters[result.winnerId].name} Wins!`;
            DOM_ELEMENTS.winProbability.textContent = `A decisive victory.`;
        } else {
            DOM_ELEMENTS.winnerName.textContent = `Battle Concluded`;
            DOM_ELEMENTS.winProbability.textContent = `Outcome details below.`;
        }

        const locationId = document.getElementById('location-value')?.value;
        if (locationId) {
            displayFinalAnalysis(result.finalState, result.winnerId, result.isDraw, result.environmentState, locationId);
        } else {
            console.error("Location ID not found for final analysis.");
            document.getElementById('analysis-list').innerHTML = "<li>Error: Location data missing for analysis.</li>"; 
        }

        if (result.finalState?.fighter1) {
            updateMomentumDisplay('fighter1', result.finalState.fighter1.momentum);
            updateEscalationDisplay('fighter1', result.finalState.fighter1.incapacitationScore, result.finalState.fighter1.escalationState);
        }
        if (result.finalState?.fighter2) {
            updateMomentumDisplay('fighter2', result.finalState.fighter2.momentum);
            updateEscalationDisplay('fighter2', result.finalState.fighter2.incapacitationScore, result.finalState.fighter2.escalationState);
        }

        DOM_ELEMENTS.battleResultsContainer.classList.remove('hidden');
        DOM_ELEMENTS.resultsSection.style.display = 'block';
        void DOM_ELEMENTS.resultsSection.offsetWidth; 
        DOM_ELEMENTS.resultsSection.classList.add('show');

        if (simulationMode === "instant" || (simulationMode === "animated" && DOM_ELEMENTS.animatedLogOutput?.closest('.simulation-mode-container')?.classList.contains('hidden'))) {
            DOM_ELEMENTS.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // FIX: Directly use DOM_ELEMENTS.battleBtn which is now properly initialized
        if (DOM_ELEMENTS.battleBtn) DOM_ELEMENTS.battleBtn.disabled = false;
    };

    if (simulationMode === "animated") {
        if (DOM_ELEMENTS.animatedLogOutput) DOM_ELEMENTS.animatedLogOutput.innerHTML = '';
        
        const animationQueue = transformEventsToAnimationQueue(battleResult.log);
        startAnimationSimulation(animationQueue, battleResult, (finalBattleResult, wasCancelledOrError) => {
            if (wasCancelledOrError && DOM_ELEMENTS.battleStory && finalBattleResult.log) {
                // If cancelled, show the full log in the battle story section
                DOM_ELEMENTS.battleStory.innerHTML = transformEventsToHtmlLog(finalBattleResult.log);
            }
            displayFinalResultsPanel(finalBattleResult);
            DOM_ELEMENTS.animatedLogOutput.closest('.simulation-mode-container')?.classList.add('hidden'); 
        });

    } else {
        DOM_ELEMENTS.animatedLogOutput.closest('.simulation-mode-container')?.classList.add('hidden'); 
        if (DOM_ELEMENTS.battleStory && battleResult.log) DOM_ELEMENTS.battleStory.innerHTML = transformEventsToHtmlLog(battleResult.log);
        displayFinalResultsPanel(battleResult);
    }
}