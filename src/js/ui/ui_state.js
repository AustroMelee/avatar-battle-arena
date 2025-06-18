/**
 * @fileoverview Manages the UI state, including selections, rendering, and configuration.
 */

"use strict";

/**
 * @typedef {import('../types/ui.js').UIState} UIState
 * @typedef {import('../types/ui.js').UIConfig} UIConfig
 * @typedef {import('../types/ui.js').ComponentState} ComponentState
 * @typedef {import('../types/ui.js').SelectionState} SelectionState
 */

/** @type {UIState} */
const currentUIState = {
    currentScreen: "character-selection",
    selection: {
        fighter1Id: null,
        fighter2Id: null,
        locationId: null,
        timeOfDay: "noon",
        gameMode: "standard",
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
        speed: "normal",
        isPaused: false
    },
    cache: {}
};

/** @type {UIConfig} */
let uiConfig = {
    enableAnimations: true,
    enableSounds: false,
    enableKeyboardShortcuts: true,
    theme: "avatar",
    animationSpeed: 1.0
};

/** @type {Object.<string, ComponentState>} */
const componentStates = {};

/**
 * Initializes the component states.
 * @param {string[]} requiredElements - The IDs of the required elements.
 */
export function initializeComponentStates(requiredElements) {
    for (const elementId of requiredElements) {
        componentStates[elementId] = {
            visible: false,
            enabled: true,
            loading: false,
            data: {},
            error: null
        };
    }
}

/** @returns {UIState} */
export function getUIState() {
    return currentUIState;
}

/** @returns {UIConfig} */
export function getUIConfig() {
    return uiConfig;
}

/**
 * @param {Partial<UIConfig>} config 
 */
export function setUIConfig(config) {
    uiConfig = { ...uiConfig, ...config };
}

/**
 * @param {string} screenName
 */
export function setCurrentScreen(screenName) {
    /** @type {import('../types/ui.js').UIState} */
    (currentUIState).currentScreen = screenName;
}

/**
 * @param {Partial<import('../types/ui.js').SelectionState>} updates
 */
export function updateSelectionState(updates) {
    /** @type {import('../types/ui.js').UIState} */
    (currentUIState).selection = { ...(currentUIState).selection, ...updates };
}

/**
 * @param {string} componentId
 */
export function markComponentDirty(componentId) {
    /** @type {import('../types/ui.js').UIState} */
    const state = currentUIState;
    if (typeof componentId === "string" && !state.rendering.dirtyComponents.includes(componentId)) {
        state.rendering.dirtyComponents.push(componentId);
        state.rendering.needsUpdate = true;
    }
}

/**
 * @param {string[]} requiredElements
 */
export function markAllComponentsDirty(requiredElements) {
    /** @type {import('../types/ui.js').UIState} */
    const state = currentUIState;
    state.rendering.dirtyComponents = [...requiredElements];
    state.rendering.needsUpdate = true;
}

export function markUIForUpdate() {
    /** @type {import('../types/ui.js').UIState} */
    (currentUIState).rendering.needsUpdate = true;
}

/**
 * @param {number} renderTime
 */
export function updateRenderPerformance(renderTime) {
    /** @type {import('../types/ui.js').UIState} */
    const state = currentUIState;
    const perf = state.rendering.performance;
    perf.totalRenders++;
    perf.maxRenderTime = Math.max(perf.maxRenderTime, renderTime);
    perf.averageRenderTime = (perf.averageRenderTime * (perf.totalRenders - 1) + renderTime) / perf.totalRenders;
}

export function clearDirtyComponents() {
    /** @type {import('../types/ui.js').UIState} */
    const state = currentUIState;
    state.rendering.dirtyComponents = [];
    state.rendering.needsUpdate = false;
    state.rendering.lastRenderTime = performance.now();
}

/**
 * Updates component state.
 * @param {string} componentId
 * @param {Partial<ComponentState>} state
 */
export function setComponentState(componentId, state) {
    if (componentStates[componentId]) {
        componentStates[componentId] = { ...componentStates[componentId], ...state };
    }
} 