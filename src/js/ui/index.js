/**
 * @fileoverview Barrel file for the main UI system.
 * @description Exports the primary UI controller functions and all underlying UI modules.
 */

"use strict";

// Export high-level UI controller functions
export {
    initializeUI,
    updateSelection,
    getCurrentSelection,
    displayBattleResults
} from '../ui.js';

// Export the new, consolidated battle results module
export { displayCompleteBattleResults, resetCompleteBattleResults } from './battle_results.js';

// Re-export all underlying UI modules for more granular access
export * from './ui_module.js'; 