/**
 * @fileoverview Manages the UI rendering loop and component updates.
 */

"use strict";

import { getUIState, updateRenderPerformance, clearDirtyComponents } from "./ui_state.js";
import { populateCharacterGrids } from "../ui_character-selection.js";

/**
 * Main render loop for UI updates.
 */
export function updateRenderLoop() {
    /** @type {import('../types/ui.js').UIState} */
    const uiState = getUIState();
    if (uiState.rendering.needsUpdate) {
        const startTime = performance.now();
        
        try {
            renderDirtyComponents();
            
            const renderTime = performance.now() - startTime;
            updateRenderPerformance(renderTime);
            
        } catch (error) {
            console.error("[UI] Render loop error:", error);
        }
    }
    
    requestAnimationFrame(updateRenderLoop);
}

/**
 * Renders components marked as dirty.
 */
function renderDirtyComponents() {
    /** @type {import('../types/ui.js').UIState} */
    const uiState = getUIState();
    const dirtyComponents = uiState.rendering.dirtyComponents;
    
    for (const componentId of dirtyComponents) {
        try {
            renderComponent(componentId);
        } catch (error) {
            console.error(`[UI] Failed to render component ${componentId}:`, error);
        }
    }
    
    clearDirtyComponents();
}

/**
 * Renders a specific component.
 * @param {string} componentId - The ID of the component to render.
 */
function renderComponent(componentId) {
    const startTime = performance.now();
    
    switch (componentId) {
        case "character-selection":
            populateCharacterGrids(
                {
                    fighter1Grid: document.querySelector("#fighter1-grid"),
                    fighter2Grid: document.querySelector("#fighter2-grid"),
                    fighter1NameDisplay: document.querySelector("#fighter1-name"),
                    fighter2NameDisplay: document.querySelector("#fighter2-name"),
                    fighter1Select: document.querySelector("#fighter1-select"),
                    fighter2Select: document.querySelector("#fighter2-select"),
                },
                () => {}
            );
            break;
            
        case "location-selection":
            // populateLocationGrid was here, but the file it came from (ui_location-selection.js) was deleted.
            break;
            
        default:
            console.warn(`[UI] Unknown component for rendering: ${componentId}`);
    }
    
    const renderTime = performance.now() - startTime;
    /** @type {import('../types/ui.js').UIState} */
    const uiState = getUIState();
    uiState.rendering.performance.componentTimes[componentId] = renderTime;
} 