/**
 * @fileoverview Main application entry point for Avatar Battle Arena
 * @description Initializes the battle simulation system, UI components, and event handlers
 * @version 1.2.0
 */

'use strict';

console.log('[MAIN] Avatar Battle Arena - Application loaded successfully');

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
    console.log('[MAIN] 🚀 Initializing Avatar Battle Arena...');
    
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

    // Get battle button after DOM is loaded
    const battleBtn = document.getElementById('battleBtn');
    console.log('[MAIN] 🔍 Looking for battle button...');
    console.log('[MAIN] Battle button element:', battleBtn);
    console.log('[MAIN] Battle button found:', !!battleBtn);
    
    if (battleBtn) {
        console.log('[MAIN] ✅ Attaching click listener to battle button');
        battleBtn.addEventListener('click', () => {
            console.log('[MAIN] ⚔️ FIGHT button clicked! Battle simulation initiated');
            const f1Id = 'aang-airbending-only';
            const f2Id = 'azula';
            const locId = 'fire-nation-capital';
            const timeOfDay = 'day';
            const emotionalMode = true;

            // Reset state and show loading - all through centralized state
            resetGlobalUI();
            showLoadingState(currentSimMode);

            setTimeout(() => {
                try {
                    const battleResult = simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode);
                    console.log('[MAIN] Battle simulation completed successfully');
                    // Pass location ID to the result display
                    battleResult.locationId = locId;
                    showResultsState(battleResult, currentSimMode);
                } catch (error) {
                     console.error("[MAIN] Battle simulation failed:", error);
                     alert("Battle simulation failed. Please refresh the page and try again.");
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
        console.warn('[MAIN] Battle button not found. Battle functionality may not work.');
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