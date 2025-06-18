/**
 * @fileoverview Avatar Battle Arena - Centralized State Management
 * @description Manages global application state with efficient rendering and UI synchronization
 * @version 2.0.0
 */

'use strict';

//# sourceURL=state_manager.js

// --- TYPE IMPORTS ---
/**
 * @typedef {import('./types.js').GameState} GameState
 * @typedef {import('./types.js').UIState} UIState
 * @typedef {import('./types.js').BattleState} BattleState
 * @typedef {import('./types.js').Fighter} Fighter
 * @typedef {import('./types.js').BattleResult} BattleResult
 * @typedef {import('./types.js').SelectionState} SelectionState
 * @typedef {import('./types.js').RenderState} RenderState
 * @typedef {import('./types.js').AnimationQueueItem} AnimationQueueItem
 */

import { 
    populateCharacterGrids,
    updateCharacterCardStates,
    getCharacterSelectionState 
} from './ui_character-selection.js';

import { 
    populateLocationGrid,
    updateLocationCardStates,
    getLocationSelectionState 
} from './ui_location-selection.js';

import { 
    renderCharacterSelection,
    setupCharacterSelectionEvents,
    updateCharacterSelection 
} from './ui_character-selection_efficient.js';

import { 
    renderLocationSelection,
    setupLocationSelectionEvents,
    updateLocationSelection 
} from './ui_location-selection_efficient.js';

import { 
    hideSimulationContainer,
    showSimulationContainer,
    clearAnimatedOutput,
    getAnimatedLogOutput 
} from './simulation_dom_manager.js';

import { 
    setAnimationQueue,
    setRunning,
    setBattleResult,
    resetState as resetSimulationState 
} from './simulation_state_manager.js';

import { 
    setSimulationMode,
    getSimulationMode 
} from './simulation_mode_manager.js';

import { transformEventsToAnimationQueue } from './battle_log_transformer.js';
import { renderIfChanged } from './utils_efficient_rendering.js';

/**
 * @typedef {Object} StateManagerOptions
 * @description Configuration options for state manager
 * @property {boolean} [enableDebugLogging=false] - Enable debug logging
 * @property {boolean} [enablePerformanceTracking=false] - Enable performance tracking
 * @property {number} [renderThrottleMs=16] - Render throttle in milliseconds
 */

// ============================================================================
// GLOBAL STATE CONTAINER
// ============================================================================

/** @type {GameState} */
let globalState = {
    ui: {
        currentScreen: 'selection',
        selection: {
            fighter1Id: '',
            fighter2Id: '',
            locationId: '',
            timeOfDay: 'day',
            gameMode: 'battle',
            emotionalMode: false
        },
        rendering: {
            needsUpdate: false,
            lastRendered: {},
            dirtyComponents: [],
            lastRenderTime: 0,
            performance: {
                averageRenderTime: 0,
                maxRenderTime: 0,
                totalRenders: 0,
                skippedRenders: 0,
                componentTimes: {}
            }
        },
        animation: {
            queue: [],
            isPlaying: false,
            currentIndex: 0,
            speed: 'normal',
            isPaused: false
        },
        interaction: {
            isInteracting: false,
            activeElement: '',
            disabledElements: {},
            history: [],
            preferences: {}
        },
        cache: {}
    },
    config: {
        debugMode: false,
        performanceTracking: false,
        logLevel: 'info',
        maxTurns: 50,
        deterministicRandom: false,
        customSettings: {}
    },
    cache: {}
};

/** @type {boolean} */
let isInitialized = false;

/** @type {Function[]} */
const stateChangeListeners = [];

// ============================================================================
// STATE ACCESS METHODS
// ============================================================================

/**
 * Gets the current global state
 * 
 * @returns {GameState} Current game state
 * 
 * @example
 * // Access current state
 * const state = getGlobalState();
 * console.log(state.ui.currentScreen); // 'selection'
 * 
 * @since 2.0.0
 * @public
 */
export function getGlobalState() {
    return globalState;
}

/**
 * Gets the UI state portion of global state
 * 
 * @returns {UIState} Current UI state
 * 
 * @example
 * // Access UI state
 * const uiState = getUIState();
 * console.log(uiState.selection.fighter1Id);
 * 
 * @since 2.0.0
 * @public
 */
export function getUIState() {
    return globalState.ui;
}

/**
 * Gets current character and location selections
 * 
 * @returns {SelectionState} Current selection state
 * 
 * @example
 * // Get current selections
 * const selections = getSelectionState();
 * console.log(selections.fighter1Id, selections.locationId);
 * 
 * @since 2.0.0
 * @public
 */
export function getSelectionState() {
    return globalState.ui.selection;
}

// ============================================================================
// STATE UPDATE METHODS
// ============================================================================

/**
 * Updates the global state with new values
 * 
 * @param {Partial<GameState>} newState - Partial state updates to apply
 * @param {boolean} [triggerRender=true] - Whether to trigger UI re-render
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When newState is not an object
 * 
 * @example
 * // Update UI state
 * updateGameState({
 *   ui: { currentScreen: 'battle' }
 * });
 * 
 * @since 2.0.0
 * @public
 */
export function updateGameState(newState, triggerRender = true) {
    // Input validation
    if (!newState || typeof newState !== 'object') {
        throw new TypeError('updateGameState: newState must be an object');
    }
    
    if (typeof triggerRender !== 'boolean') {
        throw new TypeError('updateGameState: triggerRender must be a boolean');
    }

    console.debug('[State Manager] Updating global state:', newState);

    /** @type {GameState} */
    const oldState = JSON.parse(JSON.stringify(globalState));
    
    // Deep merge new state
    globalState = deepMerge(globalState, newState);
    
    // Track performance
    if (globalState.config.performanceTracking) {
        /** @type {number} */
        const updateTime = performance.now();
        console.debug(`[State Manager] State update took ${updateTime}ms`);
    }
    
    // Notify listeners
    notifyStateChangeListeners(oldState, globalState);
    
    // Trigger render if requested
    if (triggerRender) {
        requestRender();
    }
}

/**
 * Updates UI state specifically
 * 
 * @param {Partial<UIState>} uiUpdates - UI state updates to apply
 * @param {boolean} [triggerRender=true] - Whether to trigger UI re-render
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When uiUpdates is not an object
 * 
 * @example
 * // Update UI selection
 * updateUIState({
 *   selection: { fighter1Id: 'aang' }
 * });
 * 
 * @since 2.0.0
 * @public
 */
export function updateUIState(uiUpdates, triggerRender = true) {
    // Input validation
    if (!uiUpdates || typeof uiUpdates !== 'object') {
        throw new TypeError('updateUIState: uiUpdates must be an object');
    }

    updateGameState({ ui: uiUpdates }, triggerRender);
}

/**
 * Updates character selection in the state
 * 
 * @param {string} fighterId - Fighter identifier
 * @param {string} slotKey - Selection slot ('fighter1Id' or 'fighter2Id')
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When parameters are not strings
 * @throws {Error} When slotKey is invalid
 * 
 * @example
 * // Select first fighter
 * updateCharacterSelection('aang-airbending-only', 'fighter1Id');
 * 
 * @since 2.0.0
 * @public
 */
export function updateCharacterSelection(fighterId, slotKey) {
    // Input validation
    if (typeof fighterId !== 'string') {
        throw new TypeError('updateCharacterSelection: fighterId must be a string');
    }
    
    if (typeof slotKey !== 'string') {
        throw new TypeError('updateCharacterSelection: slotKey must be a string');
    }
    
    if (!['fighter1Id', 'fighter2Id'].includes(slotKey)) {
        throw new Error(`updateCharacterSelection: slotKey must be 'fighter1Id' or 'fighter2Id', received: ${slotKey}`);
    }

    console.debug(`[State Manager] Updating character selection: ${slotKey} = ${fighterId}`);

    updateUIState({
        selection: {
            ...globalState.ui.selection,
            [slotKey]: fighterId
        }
    });
}

/**
 * Updates location selection in the state
 * 
 * @param {string} locationId - Location identifier
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When locationId is not a string
 * 
 * @example
 * // Select battle location
 * updateLocationSelection('fire-nation-capital');
 * 
 * @since 2.0.0
 * @public
 */
export function updateLocationSelection(locationId) {
    // Input validation
    if (typeof locationId !== 'string') {
        throw new TypeError('updateLocationSelection: locationId must be a string');
    }

    console.debug(`[State Manager] Updating location selection: ${locationId}`);

    updateUIState({
        selection: {
            ...globalState.ui.selection,
            locationId: locationId
        }
    });
}

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

/**
 * Shows the loading state for battle simulation
 * 
 * @param {string} mode - Simulation mode ('animated', 'instant', etc.)
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When mode is not a string
 * 
 * @example
 * // Show loading for animated mode
 * showLoadingState('animated');
 * 
 * @since 2.0.0
 * @public
 */
export function showLoadingState(mode) {
    // Input validation
    if (typeof mode !== 'string') {
        throw new TypeError('showLoadingState: mode must be a string');
    }

    console.debug(`[State Manager] Showing loading state for mode: ${mode}`);

    updateUIState({
        currentScreen: 'loading',
        interaction: {
            ...globalState.ui.interaction,
            isInteracting: true,
            disabledElements: {
                battleBtn: true,
                characterSelection: true,
                locationSelection: true
            }
        }
    });

    // Show simulation container for animated mode
    if (mode === 'animated') {
        showSimulationContainer();
        setRunning(true);
    }
}

/**
 * Shows the results state after battle completion
 * 
 * @param {BattleResult} battleResult - Complete battle result
 * @param {string} mode - Simulation mode that was used
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When required parameters are invalid
 * 
 * @example
 * // Show battle results
 * showResultsState(battleResult, 'animated');
 * 
 * @since 2.0.0
 * @public
 */
export function showResultsState(battleResult, mode) {
    // Input validation
    if (!battleResult || typeof battleResult !== 'object') {
        throw new TypeError('showResultsState: battleResult must be an object');
    }
    
    if (typeof mode !== 'string') {
        throw new TypeError('showResultsState: mode must be a string');
    }

    console.debug('[State Manager] Showing results state');

    // Store battle result in simulation state
    setBattleResult(battleResult);

    // Process animations for animated mode
    if (mode === 'animated' && battleResult.log) {
        /** @type {AnimationQueueItem[]} */
        const animationQueue = transformEventsToAnimationQueue(battleResult.log);
        setAnimationQueue(animationQueue);
        
        updateUIState({
            animation: {
                ...globalState.ui.animation,
                queue: animationQueue,
                isPlaying: false,
                currentIndex: 0
            }
        });
    }

    updateUIState({
        currentScreen: 'results',
        interaction: {
            ...globalState.ui.interaction,
            isInteracting: false,
            disabledElements: {}
        }
    });

    setRunning(false);
}

/**
 * Resets the global state to initial values
 * 
 * @returns {void}
 * 
 * @example
 * // Reset application state
 * resetGameState();
 * 
 * @since 2.0.0
 * @public
 */
export function resetGameState() {
    console.debug('[State Manager] Resetting global state');

    globalState = {
        ui: {
            currentScreen: 'selection',
            selection: {
                fighter1Id: '',
                fighter2Id: '',
                locationId: '',
                timeOfDay: 'day',
                gameMode: 'battle',
                emotionalMode: false
            },
            rendering: {
                needsUpdate: true,
                lastRendered: {},
                dirtyComponents: [],
                lastRenderTime: 0,
                performance: {
                    averageRenderTime: 0,
                    maxRenderTime: 0,
                    totalRenders: 0,
                    skippedRenders: 0,
                    componentTimes: {}
                }
            },
            animation: {
                queue: [],
                isPlaying: false,
                currentIndex: 0,
                speed: 'normal',
                isPaused: false
            },
            interaction: {
                isInteracting: false,
                activeElement: '',
                disabledElements: {},
                history: [],
                preferences: {}
            },
            cache: {}
        },
        config: {
            debugMode: false,
            performanceTracking: false,
            logLevel: 'info',
            maxTurns: 50,
            deterministicRandom: false,
            customSettings: {}
        },
        cache: {}
    };

    // Reset simulation state
    resetSimulationState();
    
    // Trigger full re-render
    requestRender();
}

// ============================================================================
// RENDERING MANAGEMENT
// ============================================================================

/**
 * Requests a UI render on the next frame
 * 
 * @returns {void}
 * 
 * @example
 * // Request render after state change
 * requestRender();
 * 
 * @since 2.0.0
 * @public
 */
export function requestRender() {
    if (!globalState.ui.rendering.needsUpdate) {
        globalState.ui.rendering.needsUpdate = true;
        requestAnimationFrame(performRender);
    }
}

/**
 * Forces an immediate render regardless of state changes
 * 
 * @returns {void}
 * 
 * @example
 * // Force immediate render
 * forceRender();
 * 
 * @since 2.0.0
 * @public
 */
export function forceRender() {
    globalState.ui.rendering.needsUpdate = true;
    performRender();
}

/**
 * Performs the actual UI rendering
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function performRender() {
    if (!globalState.ui.rendering.needsUpdate) {
        return;
    }

    /** @type {number} */
    const startTime = performance.now();

    try {
        console.debug('[State Manager] Performing UI render');

        // Track render attempt
        globalState.ui.rendering.performance.totalRenders++;

        // Get current state
        /** @type {UIState} */
        const currentUIState = globalState.ui;
        /** @type {Object} */
        const lastRendered = globalState.ui.rendering.lastRendered;

        // Check if character selection needs update
        /** @type {boolean} */
        const characterSelectionChanged = renderIfChanged(
            lastRendered.characterSelection,
            currentUIState.selection,
            () => {
                renderCharacterSelection(
                    currentUIState.selection.fighter1Id,
                    currentUIState.selection.fighter2Id
                );
                return true;
            }
        );

        // Check if location selection needs update  
        /** @type {boolean} */
        const locationSelectionChanged = renderIfChanged(
            lastRendered.locationSelection,
            { 
                locationId: currentUIState.selection.locationId,
                timeOfDay: currentUIState.selection.timeOfDay 
            },
            () => {
                renderLocationSelection(currentUIState.selection.locationId);
                return true;
            }
        );

        // Update render tracking
        if (characterSelectionChanged) {
            lastRendered.characterSelection = { ...currentUIState.selection };
        }
        
        if (locationSelectionChanged) {
            lastRendered.locationSelection = {
                locationId: currentUIState.selection.locationId,
                timeOfDay: currentUIState.selection.timeOfDay
            };
        }

        // Mark render as complete
        globalState.ui.rendering.needsUpdate = false;
        globalState.ui.rendering.lastRenderTime = performance.now();

        // Track performance
        /** @type {number} */
        const renderTime = performance.now() - startTime;
        updateRenderPerformance(renderTime);

        console.debug(`[State Manager] Render completed in ${renderTime.toFixed(2)}ms`);

    } catch (error) {
        console.error('[State Manager] Error during render:', error);
        globalState.ui.rendering.needsUpdate = false;
    }
}

/**
 * Updates render performance metrics
 * 
 * @param {number} renderTime - Time taken for render in milliseconds
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When renderTime is not a number
 * 
 * @private
 * @since 2.0.0
 */
function updateRenderPerformance(renderTime) {
    // Input validation
    if (typeof renderTime !== 'number' || isNaN(renderTime)) {
        throw new TypeError('updateRenderPerformance: renderTime must be a valid number');
    }

    /** @type {RenderState} */
    const renderState = globalState.ui.rendering;
    
    // Update performance metrics
    renderState.performance.maxRenderTime = Math.max(
        renderState.performance.maxRenderTime,
        renderTime
    );
    
    /** @type {number} */
    const totalRenders = renderState.performance.totalRenders;
    /** @type {number} */
    const currentAverage = renderState.performance.averageRenderTime;
    
    renderState.performance.averageRenderTime = 
        (currentAverage * (totalRenders - 1) + renderTime) / totalRenders;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Deep merges two objects
 * 
 * @param {Object} target - Target object to merge into
 * @param {Object} source - Source object to merge from
 * 
 * @returns {Object} Merged object
 * 
 * @throws {TypeError} When parameters are not objects
 * 
 * @private
 * @since 2.0.0
 */
function deepMerge(target, source) {
    // Input validation
    if (!target || typeof target !== 'object') {
        throw new TypeError('deepMerge: target must be an object');
    }
    
    if (!source || typeof source !== 'object') {
        throw new TypeError('deepMerge: source must be an object');
    }

    /** @type {Object} */
    const result = { ...target };

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }

    return result;
}

/**
 * Notifies all state change listeners
 * 
 * @param {GameState} oldState - Previous state
 * @param {GameState} newState - New state
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function notifyStateChangeListeners(oldState, newState) {
    stateChangeListeners.forEach(/** @type {Function} */ (listener) => {
        try {
            listener(oldState, newState);
        } catch (error) {
            console.error('[State Manager] Error in state change listener:', error);
        }
    });
}

/**
 * Adds a state change listener
 * 
 * @param {Function} listener - Listener function to add
 * 
 * @returns {Function} Unsubscribe function
 * 
 * @throws {TypeError} When listener is not a function
 * 
 * @example
 * // Add state listener
 * const unsubscribe = addStateChangeListener((oldState, newState) => {
 *   console.log('State changed:', newState);
 * });
 * 
 * @since 2.0.0
 * @public
 */
export function addStateChangeListener(listener) {
    // Input validation
    if (typeof listener !== 'function') {
        throw new TypeError('addStateChangeListener: listener must be a function');
    }

    stateChangeListeners.push(listener);

    // Return unsubscribe function
    return () => {
        /** @type {number} */
        const index = stateChangeListeners.indexOf(listener);
        if (index > -1) {
            stateChangeListeners.splice(index, 1);
        }
    };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes the state manager
 * 
 * @param {StateManagerOptions} [options] - Configuration options
 * 
 * @returns {void}
 * 
 * @example
 * // Initialize with debug logging
 * initializeStateManager({ enableDebugLogging: true });
 * 
 * @since 2.0.0
 * @public
 */
export function initializeStateManager(options = {}) {
    if (isInitialized) {
        console.warn('[State Manager] Already initialized');
        return;
    }

    console.debug('[State Manager] Initializing...');

    // Apply configuration
    if (options.enableDebugLogging) {
        globalState.config.debugMode = true;
    }
    
    if (options.enablePerformanceTracking) {
        globalState.config.performanceTracking = true;
    }

    // Setup initial UI event listeners
    try {
        setupCharacterSelectionEvents();
        setupLocationSelectionEvents();
    } catch (error) {
        console.warn('[State Manager] Could not setup UI events (DOM may not be ready):', error);
    }

    isInitialized = true;
    console.debug('[State Manager] Initialization complete');
}

// ============================================================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

// Re-export commonly used functions for backward compatibility
export { hideSimulationContainer, showSimulationContainer } from './simulation_dom_manager.js';
export { setSimulationMode, getSimulationMode } from './simulation_mode_manager.js';

// Initialize on module load if in browser environment
if (typeof window !== 'undefined' && document.readyState !== 'loading') {
    initializeStateManager();
}