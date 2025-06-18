/**
 * @fileoverview Avatar Battle Arena - Battle Results UI (Refactored)
 * @description Compatibility layer for battle results display using modular architecture.
 * Maintains backward compatibility while internally using the new UI module system.
 * @version 3.0
 */

// FILE: ui_battle-results.js
'use strict';

// --- LEGACY IMPORTS (for compatibility) ---
import { updateMomentumDisplay, updateEscalationDisplay } from './ui_momentum-escalation-display.js';

// --- NEW MODULAR IMPORTS ---
import { 
    displayCompleteBattleResults, 
    resetCompleteBattleResults,
    BattleResultsUI 
} from './ui/index.js';

/**
 * Displays the final battle analysis, including fighter stats and environmental impact.
 * @param {object} battleResult - Object containing battle result data.
 * 
 * @deprecated Use displayCompleteBattleResults from ui/index.js for new implementations.
 * This function is maintained for backward compatibility.
 */
export function displayFinalAnalysis(battleResult) {
    console.debug('[UI Battle Results] Using legacy displayFinalAnalysis - consider migrating to modular UI');
    
    // Extract locationId from battleResult for new modular system
    const locationId = battleResult?.locationId || battleResult?.environmentState?.locationId;
    
    if (!locationId) {
        console.warn('[UI Battle Results] No locationId found in battleResult, using fallback');
    }
    
    // Delegate to new modular system
    displayCompleteBattleResults(battleResult, locationId);
}

/**
 * Sets up event listeners for the detailed battle logs toggle and copy buttons.
 * 
 * @deprecated Use setupBattleLogControls from ui/battle_log_controls.js for new implementations.
 * This function is maintained for backward compatibility.
 */
export function setupDetailedLogControls() {
    console.debug('[UI Battle Results] Using legacy setupDetailedLogControls - consider migrating to modular UI');
    
    // Delegate to new modular system
    const { toggleBtn, copyBtn, logContent } = BattleResultsUI.getBattleLogElements();
    BattleResultsUI.setupBattleLogControls(toggleBtn, copyBtn, logContent);
}

/**
 * Resets the display elements related to battle results.
 * This function is used by ui_loading-states.js before starting a new battle.
 * 
 * @deprecated Use resetCompleteBattleResults from ui/index.js for new implementations.
 * This function is maintained for backward compatibility.
 */
export function resetBattleResultsUI() {
    console.debug('[UI Battle Results] Using legacy resetBattleResultsUI - consider migrating to modular UI');
    
    // Delegate to new modular system
    resetCompleteBattleResults();
    
    // Keep legacy momentum/escalation reset for compatibility
    updateMomentumDisplay('fighter1', 0);
    updateMomentumDisplay('fighter2', 0);
    updateEscalationDisplay('fighter1', 0, 'Normal');
    updateEscalationDisplay('fighter2', 0, 'Normal');
}

// --- RE-EXPORT NEW MODULAR FUNCTIONS FOR DIRECT ACCESS ---

/**
 * Re-export the new modular battle results display function
 * @param {Object} battleResult - Raw battle result data
 * @param {string} locationId - Location ID for environmental analysis
 */
export { displayCompleteBattleResults };

/**
 * Re-export the new modular reset function
 */
export { resetCompleteBattleResults };

/**
 * Re-export the modular UI namespace
 */
export { BattleResultsUI };