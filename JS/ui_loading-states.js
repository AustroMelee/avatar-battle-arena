// FILE: ui_loading-states.js
'use strict';

// Manages the display and hiding of loading spinners and results panels.

import { characters } from './data_characters.js';
import { transformEventsToHtmlLog } from './battle_log_transformer.js'; // Ensure this is correct
import { startSimulation as startAnimationSimulation } from './simulation_mode_manager.js'; // Renamed import for clarity
import { updateMomentumDisplay, updateEscalationDisplay } from './ui_momentum-escalation-display.js'; // Correct import path
import { setupDetailedLogControls, displayFinalAnalysis, resetBattleResultsUI } from './ui_battle-results.js'; // Corrected import path and now importing resetBattleResultsUI from here

const DOM_ELEMENTS = {
    resultsSection: document.getElementById('results'),
    loadingSpinner: document.getElementById('loading'),
    battleResultsContainer: document.getElementById('battle-results'),
    vsDivider: document.getElementById('vsDivider'),
    winnerName: document.getElementById('winner-name'),
    winProbability: document.getElementById('win-probability'),
    battleStory: document.getElementById('battle-story'),
    animatedLogOutput: document.getElementById('animated-log-output'),
    toggleDetailedLogsBtn: document.getElementById('toggle-detailed-logs-btn'), // Added this line to retrieve the button
    copyDetailedLogsBtn: document.getElementById('copy-detailed-logs-btn'),     // Added this line to retrieve the button
};

/**
 * Shows the loading state UI.
 * @param {string} simulationMode - 'animated' or 'instant'.
 */
export function showLoadingState(simulationMode) {
    if (simulationMode === "animated") {
        if (DOM_ELEMENTS.resultsSection) DOM_ELEMENTS.resultsSection.style.display = 'none';
        // Assuming simulationModeContainer is managed by simulation_mode_manager or ui.js for overall display
        // For now, let's directly interact with the animated output container
        if (DOM_ELEMENTS.animatedLogOutput) {
            DOM_ELEMENTS.animatedLogOutput.innerHTML = `<div class="loading"><div class="spinner"></div><p>Preparing animated simulation...</p></div>`;
            DOM_ELEMENT_E.animatedLogOutput.closest('.simulation-mode-container')?.classList.remove('hidden'); // Show parent container
        }
    } else { // Instant mode
        if (DOM_ELEMENTS.animatedLogOutput) DOM_ELEMENT_E.animatedLogOutput.closest('.simulation-mode-container')?.classList.add('hidden');
        if (DOM_ELEMENTS.resultsSection) {
            DOM_ELEMENTS.resultsSection.classList.remove('show');
            DOM_ELEMENTS.resultsSection.style.display = 'block';
        }
        if (DOM_ELEMENTS.loadingSpinner) DOM_ELEMENTS.loadingSpinner.classList.remove('hidden');
        if (DOM_ELEMENTS.battleResultsContainer) DOM_ELEMENTS.battleResultsContainer.classList.add('hidden');
    }
    // Access battleBtn from the main UI module, or ensure it's passed/managed appropriately.
    // For now, assuming it's available globally via DOM_ELEMENTS if this is a shared helper,
    // or handled by the calling ui.js
    const battleBtn = document.getElementById('battleBtn'); // Direct access as it's not in DOM_ELEMENTS yet.
    if (battleBtn) DOM_ELEMENTS.battleBtn.disabled = true;

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
        const battleBtn = document.getElementById('battleBtn');
        if (battleBtn) battleBtn.disabled = false;
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

        const locationId = document.getElementById('location-value')?.value; // Still relies on a hidden input
        if (locationId) {
            displayFinalAnalysis(result.finalState, result.winnerId, result.isDraw, result.environmentState, locationId);
        } else {
            console.error("Location ID not found for final analysis.");
            document.getElementById('analysis-list').innerHTML = "<li>Error: Location data missing for analysis.</li>"; // Direct DOM manipulation as fallback
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
        void DOM_ELEMENTS.resultsSection.offsetWidth; // Trigger reflow to ensure animation
        DOM_ELEMENTS.resultsSection.classList.add('show');

        if (simulationMode === "instant" || (simulationMode === "animated" && DOM_ELEMENTS.animatedLogOutput?.closest('.simulation-mode-container')?.classList.contains('hidden'))) {
            DOM_ELEMENTS.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        const battleBtn = document.getElementById('battleBtn');
        if (battleBtn) battleBtn.disabled = false;
    };

    if (simulationMode === "animated") {
        if (DOM_ELEMENTS.animatedLogOutput) DOM_ELEMENTS.animatedLogOutput.innerHTML = '';
        // Dynamic import here (as in your original, to avoid circular deps)
        const { transformEventsToAnimationQueue } = transformEventsToAnimationQueue; // This line needs to be an import from battle_log_transformer.js
        // Corrected dynamic import:
        import('./battle_log_transformer.js').then(module => {
            const animationQueue = module.transformEventsToAnimationQueue(battleResult.log);
            startAnimationSimulation(animationQueue, battleResult, (finalBattleResult, wasCancelledOrError) => {
                if (wasCancelledOrError && DOM_ELEMENTS.battleStory && finalBattleResult.log) {
                    // If cancelled, show the full log in the battle story section
                    DOM_ELEMENTS.battleStory.innerHTML = transformEventsToHtmlLog(finalBattleResult.log);
                }
                displayFinalResultsPanel(finalBattleResult);
                DOM_ELEMENTS.animatedLogOutput.closest('.simulation-mode-container')?.classList.add('hidden'); // Hide parent container
            });
        }).catch(err => {
            console.error("Failed to load battle_log_transformer for animation:", err);
            // Fallback to instant mode if animation setup fails
            if (DOM_ELEMENTS.animatedLogOutput) DOM_ELEMENTS.animatedLogOutput.closest('.simulation-mode-container')?.classList.add('hidden');
            if (DOM_ELEMENTS.battleStory && battleResult.log) DOM_ELEMENTS.battleStory.innerHTML = transformEventsToHtmlLog(battleResult.log);
            displayFinalResultsPanel(battleResult);
        });

    } else {
        DOM_ELEMENTS.animatedLogOutput.closest('.simulation-mode-container')?.classList.add('hidden'); // Ensure hidden in instant mode
        if (DOM_ELEMENTS.battleStory && battleResult.log) DOM_ELEMENTS.battleStory.innerHTML = transformEventsToHtmlLog(battleResult.log);
        displayFinalResultsPanel(battleResult);
    }
}

/**
 * Resets the battle results UI elements to their initial state.
 * This function is used by ui_loading-states.js before starting a new battle.
 */
/* MOVED TO ui_battle-results.js
export function resetBattleResultsUI() {
    initializeDOMElements(); // Ensure elements are initialized

    if (resultsSection) resultsSection.classList.remove('show');
    if (environmentDamageDisplay) {
        environmentDamageDisplay.textContent = '';
        environmentDamageDisplay.className = 'environmental-damage-level'; // Reset class
    }
    if (environmentImpactsList) environmentImpactsList.innerHTML = '';
    if (battleStory) battleStory.innerHTML = '';
    if (analysisList) analysisList.innerHTML = '';
    if (winnerName) winnerName.textContent = '';
    if (winProbability) winProbability.textContent = '';
    
    // Ensure detailed logs are collapsed and cleared
    if (detailedBattleLogsContent) {
        detailedBattleLogsContent.innerHTML = '';
        if (!detailedBattleLogsContent.classList.contains('collapsed')) {
            detailedBattleLogsContent.classList.add('collapsed');
            if (toggleDetailedLogsBtn) {
                toggleDetailedLogsBtn.setAttribute('aria-expanded', 'false');
                toggleDetailedLogsBtn.textContent = 'Show Detailed Battle Logs ►';
            }
        }
    }

    // Reset momentum and escalation displays via their dedicated functions
    updateMomentumDisplay('fighter1', 0);
    updateMomentumDisplay('fighter2', 0);
    updateEscalationDisplay('fighter1', 0, 'Normal');
    updateEscalationDisplay('fighter2', 0, 'Normal');

    setTimeout(() => {
        if (resultsSection && !resultsSection.classList.contains('show')) {
            resultsSection.style.display = 'none';
        }
    }, 500);
}
*/