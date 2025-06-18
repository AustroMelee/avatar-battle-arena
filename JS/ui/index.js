/**
 * @fileoverview UI Module Index - Battle Results UI Architecture
 * @description Barrel exports with convenience functions and namespace object.
 * Provides a clean interface to all UI battle results functionality.
 * @version 1.0
 */

'use strict';

// --- CORE MODULE EXPORTS ---
export * from './battle_analysis.js';
export * from './battle_results_renderer.js';
export * from './battle_log_controls.js';
export * from './dom_elements.js';

// --- CONVENIENCE IMPORTS FOR NAMESPACE ---
import { analyzeBattleResults } from './battle_analysis.js';
import { renderBattleAnalysis, renderEnvironmentImpact, renderBattleLogContent } from './battle_results_renderer.js';
import { setupBattleLogControls, resetBattleLogControls } from './battle_log_controls.js';
import { 
    initializeDOMElements, 
    getBattleResultsElements, 
    getEnvironmentElements, 
    getBattleLogElements,
    validateRequiredElements
} from './dom_elements.js';

// --- NAMESPACE OBJECT ---
export const BattleResultsUI = {
    // Analysis
    analyzeBattleResults,
    
    // Rendering
    renderBattleAnalysis,
    renderEnvironmentImpact,
    renderBattleLogContent,
    
    // Controls
    setupBattleLogControls,
    resetBattleLogControls,
    
    // DOM Management
    initializeDOMElements,
    getBattleResultsElements,
    getEnvironmentElements,
    getBattleLogElements,
    validateRequiredElements
};

// --- HIGH-LEVEL CONVENIENCE FUNCTIONS ---

/**
 * Complete battle results display workflow
 * @param {Object} battleResult - Raw battle result data
 * @param {string} locationId - Location ID for environmental analysis
 */
export function displayCompleteBattleResults(battleResult, locationId) {
    // Initialize DOM elements
    initializeDOMElements();
    
    // Get required elements
    const { analysisList } = getBattleResultsElements();
    const { damageDisplay, impactsList } = getEnvironmentElements();
    const { logContent, toggleBtn, copyBtn } = getBattleLogElements();
    
    // Validate required elements exist
    if (!validateRequiredElements(['analysisList'])) {
        console.error('Cannot display battle results: missing required DOM elements');
        return;
    }
    
    // Analyze battle data
    const analysis = analyzeBattleResults(battleResult);
    
    // Render analysis
    if (analysisList) {
        renderBattleAnalysis(analysis, analysisList);
    }
    
    // Render environment impact
    if (damageDisplay && impactsList && analysis.isValid) {
        renderEnvironmentImpact(analysis.environment, damageDisplay, impactsList);
    }
    
    // Set up battle log if available
    if (logContent && battleResult.log) {
        // Import and use battle log transformer
        import('../battle_log_transformer.js').then(({ transformEventsToHtmlLog }) => {
            const htmlLog = transformEventsToHtmlLog(battleResult.log, {
                fighter1: battleResult.finalState?.fighter1,
                fighter2: battleResult.finalState?.fighter2,
                location: locationId
            });
            logContent.innerHTML = renderBattleLogContent(htmlLog);
        }).catch(err => {
            console.error('Failed to load battle log transformer:', err);
            logContent.innerHTML = renderBattleLogContent('');
        });
    }
    
    // Set up controls
    if (toggleBtn && copyBtn && logContent) {
        setupBattleLogControls(toggleBtn, copyBtn, logContent);
    }
}

/**
 * Resets all battle results UI components
 */
export function resetCompleteBattleResults() {
    // Initialize DOM elements
    initializeDOMElements();
    
    // Get all elements
    const { resultsSection, analysisList, winnerName, winProbability, battleStory } = getBattleResultsElements();
    const { damageDisplay, impactsList } = getEnvironmentElements();
    const { logContent, toggleBtn, copyBtn } = getBattleLogElements();
    
    // Reset results section
    if (resultsSection) {
        resultsSection.classList.remove('show');
        setTimeout(() => {
            if (!resultsSection.classList.contains('show')) {
                resultsSection.style.display = 'none';
            }
        }, 500);
    }
    
    // Clear analysis
    if (analysisList) analysisList.innerHTML = '';
    if (winnerName) winnerName.textContent = '';
    if (winProbability) winProbability.textContent = '';
    if (battleStory) battleStory.innerHTML = '';
    
    // Reset environment display
    if (damageDisplay) {
        damageDisplay.textContent = '';
        damageDisplay.className = 'environmental-damage-level';
    }
    if (impactsList) impactsList.innerHTML = '';
    
    // Reset battle log controls
    resetBattleLogControls(toggleBtn, copyBtn, logContent);
    
    // Reset momentum and escalation displays (external dependency)
    try {
        import('../ui_momentum-escalation-display.js').then(({ updateMomentumDisplay, updateEscalationDisplay }) => {
            updateMomentumDisplay('fighter1', 0);
            updateMomentumDisplay('fighter2', 0);
            updateEscalationDisplay('fighter1', 0, 'Normal');
            updateEscalationDisplay('fighter2', 0, 'Normal');
        });
    } catch (err) {
        console.warn('Could not reset momentum/escalation displays:', err);
    }
}

// --- DEFAULT EXPORT ---
export default BattleResultsUI; 