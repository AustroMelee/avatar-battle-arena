// FILE: ui.js
'use strict';

//# sourceURL=ui.js

// Orchestrates the main UI components and battle simulation flow.

import { renderArchetypeDisplay } from './ui_archetype-display.js';
import { resolveArchetypeLabel } from './engine_archetype-engine.js';
import { setupDetailedLogControls, resetBattleResultsUI } from './ui_battle-results.js';
import { characters } from './data_characters.js';
import { resetSimulationManager } from './simulation_mode_manager.js';
import { updateMomentumDisplay, updateEscalationDisplay } from './ui_momentum-escalation-display.js';


// Centralized DOM references used across UI modules, or for orchestration
const DOM_SHARED = {
    // Selection elements are no longer needed
    vsDivider: document.getElementById('vsDivider'),

    // Archetype display elements
    archetypeContainer: document.getElementById('archetype-info-container'),
    archetypeHeadline: document.getElementById('archetype-headline'),
    archetypeIntroA: document.getElementById('archetype-intro-a'),
    archetypeIntroB: document.getElementById('archetype-intro-b'),
    archetypeError: document.getElementById('archetype-error'),

    // For simulation manager initialization
    simulationModeContainer: document.getElementById('simulation-mode-container'),
    animatedLogOutput: document.getElementById('animated-log-output'),
    cancelSimulationBtn: document.getElementById('cancel-simulation'),
    zoomInBtn: document.getElementById('zoom-in'),
    zoomOutBtn: document.getElementById('zoom-out'),
};

/**
 * Returns the image URL for a given character ID.
 * This is needed by animated_text_engine.js.
 * @param {string} charId - The ID of the character.
 * @returns {string|null} The image URL or null if not found.
 */
export function getCharacterImageFromUI(charId) {
    return characters[charId]?.imageUrl || null;
}

// Internal function to update archetype display based on current selections
function updateArchetypeInfo() {
    const fighter1Id = 'aang-airbending-only';
    const fighter2Id = 'azula';
    const locationId = 'fire-nation-capital';
    
    // Pass full character data objects to resolveArchetypeLabel
    const fighter1Data = characters[fighter1Id];
    const fighter2Data = characters[fighter2Id];

    const archetypeData = resolveArchetypeLabel(fighter1Id, fighter2Id, locationId, fighter1Data, fighter2Data);
    renderArchetypeDisplay(archetypeData, {
        container: DOM_SHARED.archetypeContainer,
        headline: DOM_SHARED.archetypeHeadline,
        introA: DOM_SHARED.archetypeIntroA,
        introB: DOM_SHARED.archetypeIntroB,
        error: DOM_SHARED.archetypeError
    });
}


// Global reset UI function
export function resetGlobalUI() {
    resetBattleResultsUI();
    resetSimulationManager();

    updateMomentumDisplay('fighter1', 0);
    updateMomentumDisplay('fighter2', 0);
    updateEscalationDisplay('fighter1', 0, 'Normal');
    updateEscalationDisplay('fighter2', 0, 'Normal');
}


// Initial setup on DOMContentLoaded
function init() {
    // No need to populate grids
    updateMomentumDisplay('fighter1', 0);
    updateMomentumDisplay('fighter2', 0);
    updateEscalationDisplay('fighter1', 0, 'Normal');
    updateEscalationDisplay('fighter2', 0, 'Normal');
    updateArchetypeInfo(); // Initial archetype display for the hardcoded match

    setupDetailedLogControls();
}

// Since ui.js is imported by main.js, this will run after main's DOMContentLoaded
init();