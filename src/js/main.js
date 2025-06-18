/**
 * @fileoverview Main application entry point for Avatar Battle Arena
 * @description Initializes the battle simulation system, UI components, and event handlers
 * @version 1.2.0
 */

'use strict';

console.log('[MAIN] Avatar Battle Arena - Application loaded successfully');

// --- TYPE IMPORTS ---
/**
 * @typedef {import('./types.js').BattleResult} BattleResult
 * @typedef {import('./types.js').UIState} UIState
 * @typedef {import('./types.js').RenderPerformance} RenderPerformance
 */

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

/** @type {string} */
let currentSimMode = "animated";

/**
 * Handles mode selection change events from radio buttons
 * 
 * @param {Event} event - DOM event from mode selection change
 * @returns {void}
 * 
 * @throws {TypeError} If event is not provided
 * 
 * @example
 * // Event listener setup
 * modeSelectionContainer.addEventListener('change', handleModeSelectionChange);
 * 
 * @since 1.2.0
 * @private
 */
function handleModeSelectionChange(event) {
    // Input validation
    if (!event || !event.target) {
        throw new TypeError('handleModeSelectionChange: event and event.target are required');
    }

    /** @type {HTMLInputElement} */
    const target = /** @type {HTMLInputElement} */ (event.target);
    
    if (target.name === "simulationMode") {
        currentSimMode = target.value;
        setSimulationMode(currentSimMode);
        updateGameState({ ui: { mode: currentSimMode } });
        console.log("Simulation mode changed to:", currentSimMode);
    }
}

/**
 * Initializes the application: sets up state, DOM references, event listeners, and UI components
 * 
 * @returns {void}
 * 
 * @throws {Error} When DOM elements are missing or initialization fails
 * 
 * @example
 * // Called on DOMContentLoaded
 * document.addEventListener('DOMContentLoaded', init);
 * 
 * @since 1.0.0
 * @public
 */
function init() {
    // Initialize centralized state management
    resetGameState();
    
    /** @type {Object<string, HTMLElement | null>} */
    const domRefs = {
        simulationContainer: document.getElementById('simulation-mode-container'),
        cancelButton: document.getElementById('cancel-simulation'),
        battleResultsContainer: document.getElementById('battle-results'),
        winnerNameDisplay: document.getElementById('winner-name'),
        analysisListDisplay: document.getElementById('analysis-list'),
        battleStoryDisplay: document.getElementById('battle-story'),
        animatedLogOutput: document.getElementById('animated-log-output'),
        zoomInBtn: document.getElementById('zoom-in'),
        zoomOutBtn: document.getElementById('zoom-out'),
    };
    
    initializeSimulationManagerDOM(domRefs);
    setSimulationMode(currentSimMode);
    updateGameState({ ui: { mode: currentSimMode } });
    
    // Initialize efficient UI components
    initializeEfficientCharacterSelection();
    initializeEfficientLocationSelection();
    
    // Setup debounced resize handler for responsive layouts
    setupDebouncedResizeHandler();
    
    // Force initial render after DOM initialization
    forceRender();

    /** @type {HTMLElement | null} */
    const modeSelectionContainer = document.querySelector('.mode-selection-section');
    if (modeSelectionContainer) {
        modeSelectionContainer.addEventListener('change', handleModeSelectionChange);
    }

    /** @type {HTMLInputElement | null} */
    const defaultModeRadio = /** @type {HTMLInputElement | null} */ (document.getElementById(`mode-${currentSimMode}`));
    if (defaultModeRadio) {
        defaultModeRadio.checked = true;
    }

    // Get battle button after DOM is loaded
    /** @type {HTMLButtonElement | null} */
    const battleBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('battleBtn'));
    
    if (battleBtn) {
        battleBtn.addEventListener('click', () => {
            console.log('[MAIN] Battle simulation initiated');
            
            /** @type {string} */
            const f1Id = 'aang-airbending-only';
            /** @type {string} */
            const f2Id = 'azula';
            /** @type {string} */
            const locId = 'fire-nation-capital';
            /** @type {string} */
            const timeOfDay = 'day';
            /** @type {boolean} */
            const emotionalMode = true;

            // Reset state and show loading - all through centralized state
            resetGlobalUI();
            showLoadingState(currentSimMode);

            setTimeout(() => {
                try {
                    /** @type {BattleResult} */
                    const battleResult = simulateBattle(f1Id, f2Id, locId, timeOfDay, emotionalMode);
                    console.log('[MAIN] Battle simulation completed successfully');
                    // Pass location ID to the result display
                    /** @type {any} */ (battleResult).locationId = locId;
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
 * 
 * @returns {void}
 * 
 * @throws {Error} If window resize event setup fails
 * 
 * @example
 * // Called during init to setup responsive behavior
 * setupDebouncedResizeHandler();
 * 
 * @since 1.1.0
 * @private
 */
function setupDebouncedResizeHandler() {
    /** @type {(event: UIEvent) => void} */
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
 * Logs efficient rendering performance statistics to console
 * 
 * @returns {void}
 * 
 * @example
 * // Available globally for debugging
 * window.logRenderingPerformance();
 * 
 * @since 1.1.0
 * @public
 */
function logRenderingPerformance() {
    /** @type {any} */
    const stats = performanceMonitor.getStats();
    console.group('[Efficient Rendering] Performance Stats');
    console.log('Total Renders:', stats.totalRenders || 0);
    console.log('Skipped Renders:', stats.skippedRenders || 0);
    console.log('Render Efficiency:', `${((stats.renderEfficiency || 0) * 100).toFixed(1)}%`);
    console.log('Average Render Time:', `${(stats.averageRenderTime || 0).toFixed(2)}ms`);
    console.log('Fragment Operations:', stats.fragmentOperations || 0);
    console.log('Debounced Calls:', stats.debouncedCalls || 0);
    console.groupEnd();
}

// Add performance logging to window for debugging
if (typeof window !== 'undefined') {
    window.logRenderingPerformance = logRenderingPerformance;
}

// Kick off app initialization on DOMContentLoaded
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Also check if DOM is already loaded (in case we missed the event)
if (document.readyState !== 'loading') {
    init();
}