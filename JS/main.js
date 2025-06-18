// FILE: main.js
'use strict';

//# sourceURL=main.js

console.log('🔧 [DEBUG] main.js loaded - version with debug messages');

import { simulateBattle } from './engine_battle-engine-core.js';
import { 
    updateGameState, 
    resetGameState, 
    showLoadingState, 
    showResultsState,
    forceRender 
} from './state_manager.js';
import { resetGlobalUI } from './ui.js';
import { setSimulationMode, initializeSimulationManagerDOM } from './simulation_mode_manager.js';
import { setupDetailedLogControls } from './ui_battle-results.js';
import { 
    createDebouncedResizeHandler,
    performanceMonitor 
} from './utils_efficient_rendering.js';
import { initializeEfficientCharacterSelection } from './ui_character-selection_efficient.js';
import { initializeEfficientLocationSelection } from './ui_location-selection_efficient.js';

const battleBtn = document.getElementById('battleBtn');
let currentSimMode = "animated";

function handleModeSelectionChange(event) {
    if (event.target.name === "simulationMode") {
        currentSimMode = event.target.value;
        setSimulationMode(currentSimMode);
        updateGameState({ ui: { mode: currentSimMode } });
        console.log("Simulation mode changed to:", currentSimMode);
    }
}

function init() {
    // Initialize centralized state management
    resetGameState();
    
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
    updateGameState({ ui: { mode: currentSimMode } });
    
    // Initialize efficient UI components
    initializeEfficientCharacterSelection();
    initializeEfficientLocationSelection();
    
    // Setup debounced resize handler for responsive layouts
    setupDebouncedResizeHandler();
    
    // Force initial render after DOM initialization
    forceRender();

    const modeSelectionContainer = document.querySelector('.mode-selection-section');
    if (modeSelectionContainer) {
        modeSelectionContainer.addEventListener('change', handleModeSelectionChange);
    }

    const defaultModeRadio = document.getElementById(`mode-${currentSimMode}`);
    if (defaultModeRadio) {
        defaultModeRadio.checked = true;
    }

    if (battleBtn) {
        console.log('[MAIN] Battle button found, adding click listener');
        battleBtn.addEventListener('click', () => {
            console.log('[MAIN] ⚔️ FIGHT button clicked! Starting battle...');
            const f1Id = 'aang-airbending-only';
            const f2Id = 'azula';
            const locId = 'fire-nation-capital';
            const timeOfDay = 'day';
            const emotionalMode = true; // Hardcoded

            console.log('[MAIN] Battle parameters:', { f1Id, f2Id, locId, timeOfDay, emotionalMode });

            // Reset state and show loading - all through centralized state
            resetGlobalUI();
            showLoadingState(currentSimMode);

            setTimeout(() => {
                try {
                    console.log('[MAIN] Calling simulateBattle...');
                    const battleResult = simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode);
                    console.log('[MAIN] Battle simulation completed successfully');
                    // Pass location ID to the result display
                    battleResult.locationId = locId;
                    showResultsState(battleResult, currentSimMode);
                } catch (error) {
                     console.error("[MAIN] An error occurred during battle simulation:", error);
                     console.error("[MAIN] Error stack:", error.stack);
                     alert("A critical error occurred. Please check the console and refresh.");
                     // Use state-driven error handling
                     updateGameState({ 
                         ui: { 
                             loading: false, 
                             simulationRunning: false 
                         } 
                     });
                }
            }, 100);
        });
    } else {
        console.error('[MAIN] Battle button not found! Cannot attach click listener.');
    }

    setupDetailedLogControls();
}

/**
 * Sets up debounced resize handler for responsive layouts
 */
function setupDebouncedResizeHandler() {
    const debouncedResizeHandler = createDebouncedResizeHandler(() => {
        // Handle responsive layout changes
        forceRender(); // Force re-render on resize for layout updates
        
        // Log performance if in development mode
        if (window.location.search.includes('debug=performance')) {
            console.log('[Performance] Resize triggered render:', performanceMonitor.getStats());
        }
    }, 100);
    
    window.addEventListener('resize', debouncedResizeHandler);
}

/**
 * Logs efficient rendering performance stats
 */
function logRenderingPerformance() {
    const stats = performanceMonitor.getStats();
    console.group('[Efficient Rendering] Performance Stats');
    console.log('Total Renders:', stats.totalRenders);
    console.log('Skipped Renders:', stats.skippedRenders);
    console.log('Render Efficiency:', `${(stats.renderEfficiency * 100).toFixed(1)}%`);
    console.log('Average Render Time:', `${stats.averageRenderTime.toFixed(2)}ms`);
    console.log('Fragment Operations:', stats.fragmentOperations);
    console.log('Debounced Calls:', stats.debouncedCalls);
    console.groupEnd();
}

// Add performance logging to window for debugging
if (typeof window !== 'undefined') {
    window.logRenderingPerformance = logRenderingPerformance;
}

// Kick off app initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', init);