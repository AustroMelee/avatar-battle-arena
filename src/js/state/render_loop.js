/**
 * @fileoverview Manages the rendering loop for the application.
 */

"use strict";

import { getGlobalState } from "./global_state.js";
import { renderIfChanged } from "../utils_efficient_rendering.js";
import { renderCharacterSelection } from "../ui_character-selection_efficient.js";
import { updateCharacterCardStates } from "../ui_character-selection.js";
import { renderLocationSelection, updateLocationSelection } from "../ui_location-selection_efficient.js";
import { hideSimulationContainer, showSimulationContainer, clearAnimatedOutput, getAnimatedLogOutput } from "../simulation_dom_manager.js";
import { getSimulationMode } from "../simulation_mode_manager.js";

/**
 * @typedef {import('../types/composite.js').GameState} GameState
 */

/**
 * Requests a UI re-render.
 */
export function requestRender() {
    /** @type {GameState} */
    const state = getGlobalState();
    if (!state.ui.rendering.needsUpdate) {
        state.ui.rendering.needsUpdate = true;
        requestAnimationFrame(performRender);
    }
}

/**
 * Forces an immediate UI re-render.
 */
export function forceRender() {
    performRender();
}

/**
 * Performs the actual rendering of the UI.
 */
function performRender() {
    /** @type {GameState} */
    const state = getGlobalState();
    const startTime = performance.now();
    const { selection, animation, currentScreen } = state.ui;

    // Render character selection
    renderIfChanged(state, "characterSelection", () => {
        renderCharacterSelection(selection.fighter1Id, selection.fighter2Id);
        updateCharacterCardStates(selection.fighter1Id, selection.fighter2Id);
    });

    // Render location selection
    renderIfChanged(state, "locationSelection", () => {
        renderLocationSelection(selection.locationId);
        updateLocationSelection(selection.locationId);
    });

    // Render simulation container
    const simulationMode = getSimulationMode();
    const shouldShow = (simulationMode === "animated" && (animation.isPlaying || currentScreen === "results")) || (simulationMode === "instant" && currentScreen === "results");
    renderIfChanged(state, "simulationContainer", () => {
        if (shouldShow) {
            showSimulationContainer();
            const logOutput = getAnimatedLogOutput();
            if (logOutput) {
                // Assuming renderHTMLBattleLog is available and imported
                // renderHTMLBattleLog(logOutput, battleResult.log, [fighter1, fighter2]);
            }
        } else {
            hideSimulationContainer();
        }
    });

    state.ui.rendering.needsUpdate = false;
    const endTime = performance.now();
    updateRenderPerformance(endTime - startTime);
}

/**
 * Updates performance tracking data for rendering.
 * @param {number} renderTime - The time taken for the render.
 */
function updateRenderPerformance(renderTime) {
    /** @type {GameState} */
    const state = getGlobalState();
    if (!state.config.performanceTracking) return;

    const performance = state.ui.rendering.performance;
    performance.totalRenders++;
    performance.lastRenderTime = renderTime;
    performance.maxRenderTime = Math.max(performance.maxRenderTime, renderTime);
    performance.averageRenderTime = ((performance.averageRenderTime * (performance.totalRenders - 1)) + renderTime) / performance.totalRenders;
} 