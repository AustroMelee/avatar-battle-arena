/**
 * @fileoverview Avatar Battle Arena - Main UI Controller
 * @description Central UI management system handling character selection, battle display, and user interactions
 * @version 2.0.0
 */

'use strict';

//# sourceURL=ui.js

// ============================================================================
// TYPE IMPORTS
// ============================================================================

/**
 * @typedef {import('./types.js').Fighter} Fighter
 * @typedef {import('./types.js').BattleState} BattleState
 * @typedef {import('./types.js').UIState} UIState
 * @typedef {import('./types.js').BattleResult} BattleResult
 * @typedef {import('./types.js').SelectionState} SelectionState
 * @typedef {import('./types.js').Location} Location
 * @typedef {import('./types.js').Character} Character
 * @typedef {import('./types.js').BattleEvent} BattleEvent
 */

/**
 * @typedef {Object} UIConfig
 * @description UI configuration options
 * @property {boolean} enableAnimations - Whether to enable animations
 * @property {boolean} enableSounds - Whether to enable sound effects
 * @property {boolean} enableKeyboardShortcuts - Whether to enable keyboard shortcuts
 * @property {string} theme - UI theme ('light', 'dark', 'avatar')
 * @property {number} animationSpeed - Animation speed multiplier
 */

/**
 * @typedef {Object} ComponentState
 * @description Individual UI component state
 * @property {boolean} visible - Whether component is visible
 * @property {boolean} enabled - Whether component is enabled for interaction
 * @property {boolean} loading - Whether component is in loading state
 * @property {Object<string, any>} data - Component-specific data
 * @property {Error} [error] - Component error state
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { renderCharacterCards, showCharacterSelection } from './ui_character-selection.js';
import { renderLocationCards, showLocationSelection } from './ui_location-selection.js';
import { showBattleResults } from './ui_battle-results.js';
import { updateLoadingState, hideAllLoadingStates } from './ui_loading-states.js';

// ============================================================================
// CONSTANTS
// ============================================================================

/** @type {string[]} */
const VALID_THEMES = ['light', 'dark', 'avatar'];

/** @type {string[]} */
const REQUIRED_UI_ELEMENTS = [
    'character-selection',
    'location-selection', 
    'battle-display',
    'battle-controls',
    'battle-log'
];

/** @type {Object.<string, string>} */
const UI_SELECTORS = {
    characterSection: '#character-selection',
    locationSection: '#location-selection', 
    battleSection: '#battle-display',
    controlsSection: '#battle-controls',
    logSection: '#battle-log',
    loadingOverlay: '#loading-overlay',
    errorDisplay: '#error-display'
};

/** @type {number} */
const DEFAULT_ANIMATION_DURATION = 300;

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/** @type {UIState} */
let currentUIState = {
    currentScreen: 'character-selection',
    selection: {
        fighter1Id: null,
        fighter2Id: null,
        locationId: null,
        timeOfDay: 'noon',
        gameMode: 'standard',
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
    cache: {}
};

/** @type {UIConfig} */
let uiConfig = {
    enableAnimations: true,
    enableSounds: false,
    enableKeyboardShortcuts: true,
    theme: 'avatar',
    animationSpeed: 1.0
};

/** @type {Object.<string, ComponentState>} */
let componentStates = {};

// ============================================================================
// CORE UI FUNCTIONS
// ============================================================================

/**
 * Initializes the UI system and sets up event handlers
 * 
 * @param {UIConfig} [config={}] - UI configuration options
 * 
 * @returns {Promise<void>} Promise that resolves when UI is ready
 * 
 * @throws {Error} When required UI elements are missing
 * @throws {Error} When initialization fails
 * 
 * @example
 * // Initialize UI with custom config
 * await initializeUI({
 *   enableAnimations: true,
 *   theme: 'dark'
 * });
 * 
 * @since 2.0.0
 * @public
 */
export async function initializeUI(config = {}) {
    console.log('[UI] Initializing UI system...');

    try {
        // Merge configuration
        uiConfig = { ...uiConfig, ...config };
        
        // Validate configuration
        validateUIConfig(uiConfig);
        
        // Check required DOM elements
        validateRequiredElements();
        
        // Initialize component states
        initializeComponentStates();
        
        // Setup event handlers
        setupEventHandlers();
        
        // Apply theme
        applyTheme(uiConfig.theme);
        
        // Show initial screen
        await showScreen('character-selection');
        
        console.log('[UI] UI system initialized successfully');
        
    } catch (error) {
        console.error('[UI] Failed to initialize UI system:', error);
        throw new Error(`UI initialization failed: ${error.message}`);
    }
}

/**
 * Validates UI configuration object
 * 
 * @param {UIConfig} config - Configuration to validate
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When config properties are invalid
 * @throws {RangeError} When config values are out of range
 * 
 * @private
 * @since 2.0.0
 */
function validateUIConfig(config) {
    if (typeof config !== 'object' || config === null) {
        throw new TypeError('validateUIConfig: config must be an object');
    }
    
    if (typeof config.enableAnimations !== 'boolean') {
        throw new TypeError('validateUIConfig: enableAnimations must be a boolean');
    }
    
    if (typeof config.enableSounds !== 'boolean') {
        throw new TypeError('validateUIConfig: enableSounds must be a boolean');
    }
    
    if (typeof config.enableKeyboardShortcuts !== 'boolean') {
        throw new TypeError('validateUIConfig: enableKeyboardShortcuts must be a boolean');
    }
    
    if (!VALID_THEMES.includes(config.theme)) {
        throw new RangeError(`validateUIConfig: theme must be one of: ${VALID_THEMES.join(', ')}`);
    }
    
    if (typeof config.animationSpeed !== 'number' || config.animationSpeed <= 0 || config.animationSpeed > 5) {
        throw new RangeError('validateUIConfig: animationSpeed must be a number between 0 and 5');
    }
}

/**
 * Validates that all required DOM elements exist
 * 
 * @returns {void}
 * 
 * @throws {Error} When required elements are missing
 * 
 * @private
 * @since 2.0.0
 */
function validateRequiredElements() {
    /** @type {string[]} */
    const missingElements = [];
    
    for (const [key, selector] of Object.entries(UI_SELECTORS)) {
        /** @type {HTMLElement | null} */
        const element = document.querySelector(selector);
        
        if (!element) {
            missingElements.push(selector);
        }
    }
    
    if (missingElements.length > 0) {
        throw new Error(`Missing required UI elements: ${missingElements.join(', ')}`);
    }
}

/**
 * Initializes component state tracking
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function initializeComponentStates() {
    for (const elementId of REQUIRED_UI_ELEMENTS) {
        componentStates[elementId] = {
            visible: false,
            enabled: true,
            loading: false,
            data: {},
            error: null
        };
    }
}

/**
 * Sets up global event handlers
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function setupEventHandlers() {
    // Keyboard shortcuts
    if (uiConfig.enableKeyboardShortcuts) {
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }
    
    // Window resize handler
    window.addEventListener('resize', handleWindowResize);
    
    // Error handler
    window.addEventListener('error', handleGlobalError);
    
    // Animation frame handler for smooth updates
    requestAnimationFrame(updateRenderLoop);
}

/**
 * Handles keyboard shortcuts
 * 
 * @param {KeyboardEvent} event - Keyboard event
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function handleKeyboardShortcuts(event) {
    // Input validation
    if (!event || typeof event !== 'object') {
        return;
    }
    
    // Don't handle shortcuts when typing in input fields
    /** @type {HTMLElement} */
    const target = event.target;
    
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
    }
    
    switch (event.key) {
        case 'Escape':
            event.preventDefault();
            handleEscapeKey();
            break;
            
        case 'Enter':
            event.preventDefault();
            handleEnterKey();
            break;
            
        case 'r':
        case 'R':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                handleRefreshKey();
            }
            break;
            
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
            if (!event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                handleNumberKey(parseInt(event.key, 10));
            }
            break;
    }
}

/**
 * Handles window resize events
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function handleWindowResize() {
    // Mark all components for re-render
    markAllComponentsDirty();
    
    // Debounce resize handling
    clearTimeout(handleWindowResize.timeout);
    handleWindowResize.timeout = setTimeout(() => {
        updateLayout();
    }, 250);
}

/**
 * Handles global errors
 * 
 * @param {ErrorEvent} event - Error event
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function handleGlobalError(event) {
    console.error('[UI] Global error caught:', event.error);
    showErrorMessage('An unexpected error occurred. Please refresh the page.');
}

/**
 * Shows a specific UI screen
 * 
 * @param {string} screenName - Name of screen to show
 * @param {Object} [options={}] - Screen transition options
 * 
 * @returns {Promise<void>} Promise that resolves when screen is shown
 * 
 * @throws {TypeError} When screenName is not a string
 * @throws {Error} When screen doesn't exist
 * 
 * @example
 * // Show character selection
 * await showScreen('character-selection');
 * 
 * // Show with animation
 * await showScreen('battle-display', { animate: true });
 * 
 * @since 2.0.0
 * @public
 */
export async function showScreen(screenName, options = {}) {
    // Input validation
    if (typeof screenName !== 'string') {
        throw new TypeError('showScreen: screenName must be a string');
    }
    
    if (typeof options !== 'object' || options === null) {
        throw new TypeError('showScreen: options must be an object');
    }
    
    console.debug(`[UI] Showing screen: ${screenName}`);
    
    try {
        // Hide current screen
        if (currentUIState.currentScreen !== screenName) {
            await hideScreen(currentUIState.currentScreen, options);
        }
        
        // Show new screen
        await showScreenImplementation(screenName, options);
        
        // Update state
        currentUIState.currentScreen = screenName;
        markComponentDirty(screenName);
        
    } catch (error) {
        console.error(`[UI] Failed to show screen ${screenName}:`, error);
        throw error;
    }
}

/**
 * Implementation of screen showing logic
 * 
 * @param {string} screenName - Screen to show
 * @param {Object} options - Show options
 * 
 * @returns {Promise<void>} Promise that resolves when shown
 * 
 * @private
 * @since 2.0.0
 */
async function showScreenImplementation(screenName, options) {
    switch (screenName) {
        case 'character-selection':
            await showCharacterSelection();
            break;
            
        case 'location-selection':
            await showLocationSelection();
            break;
            
        case 'battle-display':
            await showBattleDisplay(options);
            break;
            
        default:
            throw new Error(`Unknown screen: ${screenName}`);
    }
    
    // Update component state
    if (componentStates[screenName]) {
        componentStates[screenName].visible = true;
        componentStates[screenName].loading = false;
    }
}

/**
 * Hides a specific UI screen
 * 
 * @param {string} screenName - Name of screen to hide
 * @param {Object} [options={}] - Hide transition options
 * 
 * @returns {Promise<void>} Promise that resolves when screen is hidden
 * 
 * @private
 * @since 2.0.0
 */
async function hideScreen(screenName, options = {}) {
    if (!screenName || typeof screenName !== 'string') {
        return;
    }
    
    /** @type {HTMLElement | null} */
    const screenElement = document.querySelector(`#${screenName}`);
    
    if (screenElement) {
        if (options.animate && uiConfig.enableAnimations) {
            await animateHide(screenElement);
        } else {
            screenElement.style.display = 'none';
        }
    }
    
    // Update component state
    if (componentStates[screenName]) {
        componentStates[screenName].visible = false;
    }
}

/**
 * Updates the current selection state
 * 
 * @param {Partial<SelectionState>} updates - Selection updates to apply
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When updates is not an object
 * 
 * @example
 * // Update fighter selection
 * updateSelection({
 *   fighter1Id: 'aang-avatar-state',
 *   fighter2Id: 'azula-comet-enhanced'
 * });
 * 
 * @since 2.0.0
 * @public
 */
export function updateSelection(updates) {
    // Input validation
    if (typeof updates !== 'object' || updates === null) {
        throw new TypeError('updateSelection: updates must be an object');
    }
    
    console.debug('[UI] Updating selection:', updates);
    
    // Apply updates
    currentUIState.selection = { ...currentUIState.selection, ...updates };
    
    // Mark UI for update
    markUIForUpdate();
    
    // Validate selection completeness
    validateSelectionState();
}

/**
 * Gets the current selection state
 * 
 * @returns {SelectionState} Current selection state
 * 
 * @example
 * // Get current selections
 * const selection = getCurrentSelection();
 * console.log(selection.fighter1Id);
 * 
 * @since 2.0.0
 * @public
 */
export function getCurrentSelection() {
    return { ...currentUIState.selection };
}

/**
 * Validates the current selection state
 * 
 * @returns {boolean} True if selection is complete and valid
 * 
 * @private
 * @since 2.0.0
 */
function validateSelectionState() {
    /** @type {SelectionState} */
    const selection = currentUIState.selection;
    
    /** @type {boolean} */
    const hasCharacters = Boolean(selection.fighter1Id && selection.fighter2Id);
    /** @type {boolean} */
    const hasLocation = Boolean(selection.locationId);
    /** @type {boolean} */
    const differentFighters = selection.fighter1Id !== selection.fighter2Id;
    
    /** @type {boolean} */
    const isValid = hasCharacters && hasLocation && differentFighters;
    
    // Update UI based on validation
    updateSelectionValidation(isValid);
    
    return isValid;
}

/**
 * Updates UI components based on selection validation
 * 
 * @param {boolean} isValid - Whether selection is valid
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function updateSelectionValidation(isValid) {
    /** @type {HTMLElement | null} */
    const startButton = document.querySelector('#start-battle-button');
    
    if (startButton) {
        startButton.disabled = !isValid;
        startButton.classList.toggle('disabled', !isValid);
        
        if (isValid) {
            startButton.textContent = 'Start Battle';
        } else {
            startButton.textContent = 'Select Fighters and Location';
        }
    }
}

/**
 * Displays battle results to the user
 * 
 * @param {BattleResult} battleResult - Battle result to display
 * @param {Object} [options={}] - Display options
 * 
 * @returns {Promise<void>} Promise that resolves when results are displayed
 * 
 * @throws {TypeError} When battleResult is invalid
 * 
 * @example
 * // Display battle results
 * await displayBattleResults(result, {
 *   showDetailed: true,
 *   enableReplay: true
 * });
 * 
 * @since 2.0.0
 * @public
 */
export async function displayBattleResults(battleResult, options = {}) {
    // Input validation
    if (!battleResult || typeof battleResult !== 'object') {
        throw new TypeError('displayBattleResults: battleResult must be a valid battle result object');
    }
    
    if (typeof options !== 'object' || options === null) {
        throw new TypeError('displayBattleResults: options must be an object');
    }
    
    console.log('[UI] Displaying battle results');
    
    try {
        // Show results using dedicated component
        await showBattleResults(battleResult, options);
        
        // Update UI state
        currentUIState.currentScreen = 'battle-results';
        markComponentDirty('battle-results');
        
    } catch (error) {
        console.error('[UI] Failed to display battle results:', error);
        showErrorMessage('Failed to display battle results. Please try again.');
        throw error;
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Applies a theme to the UI
 * 
 * @param {string} themeName - Theme to apply
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When themeName is not a string
 * @throws {Error} When theme doesn't exist
 * 
 * @private
 * @since 2.0.0
 */
function applyTheme(themeName) {
    // Input validation
    if (typeof themeName !== 'string') {
        throw new TypeError('applyTheme: themeName must be a string');
    }
    
    if (!VALID_THEMES.includes(themeName)) {
        throw new Error(`applyTheme: invalid theme '${themeName}'. Valid themes: ${VALID_THEMES.join(', ')}`);
    }
    
    // Remove existing theme classes
    document.body.classList.remove(...VALID_THEMES.map(theme => `theme-${theme}`));
    
    // Add new theme class
    document.body.classList.add(`theme-${themeName}`);
    
    console.debug(`[UI] Applied theme: ${themeName}`);
}

/**
 * Shows an error message to the user
 * 
 * @param {string} message - Error message to display
 * @param {Object} [options={}] - Display options
 * 
 * @returns {void}
 * 
 * @throws {TypeError} When message is not a string
 * 
 * @since 2.0.0
 * @public
 */
export function showErrorMessage(message, options = {}) {
    // Input validation
    if (typeof message !== 'string') {
        throw new TypeError('showErrorMessage: message must be a string');
    }
    
    if (typeof options !== 'object' || options === null) {
        throw new TypeError('showErrorMessage: options must be an object');
    }
    
    console.error('[UI] Showing error message:', message);
    
    /** @type {HTMLElement | null} */
    const errorDisplay = document.querySelector(UI_SELECTORS.errorDisplay);
    
    if (errorDisplay) {
        errorDisplay.textContent = message;
        errorDisplay.style.display = 'block';
        
        // Auto-hide after delay
        /** @type {number} */
        const delay = options.autoHide !== false ? (options.delay || 5000) : 0;
        
        if (delay > 0) {
            setTimeout(() => {
                errorDisplay.style.display = 'none';
            }, delay);
        }
    }
}

/**
 * Marks a component as needing re-render
 * 
 * @param {string} componentId - Component to mark dirty
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function markComponentDirty(componentId) {
    if (typeof componentId === 'string' && !currentUIState.rendering.dirtyComponents.includes(componentId)) {
        currentUIState.rendering.dirtyComponents.push(componentId);
        currentUIState.rendering.needsUpdate = true;
    }
}

/**
 * Marks all components as needing re-render
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function markAllComponentsDirty() {
    currentUIState.rendering.dirtyComponents = [...REQUIRED_UI_ELEMENTS];
    currentUIState.rendering.needsUpdate = true;
}

/**
 * Marks the UI for update
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function markUIForUpdate() {
    currentUIState.rendering.needsUpdate = true;
}

/**
 * Main render loop for UI updates
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function updateRenderLoop() {
    if (currentUIState.rendering.needsUpdate) {
        /** @type {number} */
        const startTime = performance.now();
        
        try {
            renderDirtyComponents();
            
            /** @type {number} */
            const renderTime = performance.now() - startTime;
            updateRenderPerformance(renderTime);
            
        } catch (error) {
            console.error('[UI] Render loop error:', error);
        }
    }
    
    // Schedule next frame
    requestAnimationFrame(updateRenderLoop);
}

/**
 * Renders components marked as dirty
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function renderDirtyComponents() {
    /** @type {string[]} */
    const dirtyComponents = currentUIState.rendering.dirtyComponents;
    
    for (const componentId of dirtyComponents) {
        try {
            renderComponent(componentId);
        } catch (error) {
            console.error(`[UI] Failed to render component ${componentId}:`, error);
        }
    }
    
    // Clear dirty state
    currentUIState.rendering.dirtyComponents = [];
    currentUIState.rendering.needsUpdate = false;
    currentUIState.rendering.lastRenderTime = performance.now();
}

/**
 * Renders a specific component
 * 
 * @param {string} componentId - Component to render
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function renderComponent(componentId) {
    /** @type {number} */
    const startTime = performance.now();
    
    switch (componentId) {
        case 'character-selection':
            renderCharacterCards();
            break;
            
        case 'location-selection':
            renderLocationCards();
            break;
            
        // Add other components as needed
        default:
            console.warn(`[UI] Unknown component for rendering: ${componentId}`);
    }
    
    /** @type {number} */
    const renderTime = performance.now() - startTime;
    currentUIState.rendering.performance.componentTimes[componentId] = renderTime;
}

/**
 * Updates render performance metrics
 * 
 * @param {number} renderTime - Time taken for render
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function updateRenderPerformance(renderTime) {
    /** @type {Object} */
    const perf = currentUIState.rendering.performance;
    
    perf.totalRenders++;
    perf.maxRenderTime = Math.max(perf.maxRenderTime, renderTime);
    perf.averageRenderTime = (perf.averageRenderTime * (perf.totalRenders - 1) + renderTime) / perf.totalRenders;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handles escape key press
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function handleEscapeKey() {
    // Close any open modals or return to previous screen
    console.debug('[UI] Escape key pressed');
}

/**
 * Handles enter key press
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function handleEnterKey() {
    // Confirm current action or proceed to next step
    console.debug('[UI] Enter key pressed');
}

/**
 * Handles refresh key combination
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function handleRefreshKey() {
    // Refresh current view
    console.debug('[UI] Refresh key pressed');
    markAllComponentsDirty();
}

/**
 * Handles number key press for quick selection
 * 
 * @param {number} number - Number key pressed (1-5)
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function handleNumberKey(number) {
    console.debug(`[UI] Number key ${number} pressed`);
    // Implement quick selection logic
}

/**
 * Updates layout after window resize
 * 
 * @returns {void}
 * 
 * @private
 * @since 2.0.0
 */
function updateLayout() {
    console.debug('[UI] Updating layout after resize');
    markAllComponentsDirty();
}

// ============================================================================
// ANIMATION HELPERS
// ============================================================================

/**
 * Animates showing an element
 * 
 * @param {HTMLElement} element - Element to animate
 * 
 * @returns {Promise<void>} Promise that resolves when animation completes
 * 
 * @private
 * @since 2.0.0
 */
async function animateShow(element) {
    return new Promise((resolve) => {
        element.style.display = 'block';
        element.style.opacity = '0';
        element.style.transform = 'translateY(-20px)';
        
        requestAnimationFrame(() => {
            element.style.transition = `opacity ${DEFAULT_ANIMATION_DURATION}ms ease, transform ${DEFAULT_ANIMATION_DURATION}ms ease`;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            
            setTimeout(resolve, DEFAULT_ANIMATION_DURATION);
        });
    });
}

/**
 * Animates hiding an element
 * 
 * @param {HTMLElement} element - Element to animate
 * 
 * @returns {Promise<void>} Promise that resolves when animation completes
 * 
 * @private
 * @since 2.0.0
 */
async function animateHide(element) {
    return new Promise((resolve) => {
        element.style.transition = `opacity ${DEFAULT_ANIMATION_DURATION}ms ease, transform ${DEFAULT_ANIMATION_DURATION}ms ease`;
        element.style.opacity = '0';
        element.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            element.style.display = 'none';
            resolve();
        }, DEFAULT_ANIMATION_DURATION);
    });
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    initializeUI,
    showScreen,
    updateSelection,
    getCurrentSelection,
    displayBattleResults,
    showErrorMessage
};