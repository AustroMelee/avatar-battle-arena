// FILE: js/engine_archetype-engine.js
'use strict';

// Import all individual character archetype data files
import { characters } from './data_characters.js';
import { locations } from './locations.js';
import { allArchetypes } from './data_archetypes_index.js';

import { aangArchetypeData } from './data_archetype_aang.js';
import { azulaArchetypeData } from './data_archetype_azula.js';

// Combine all imported archetype data into a single map.
// The structure will be: { fighterA_id: { fighterB_id: { location_id: {label, introA, introB} } } }
const combinedArchetypeMap = {
    'aang-airbending-only': aangArchetypeData,
    'azula': azulaArchetypeData,
};

// Global Fallback (if Fighter A's data isn't even in combinedArchetypeMap)
const GLOBAL_DEFAULT_ARCHETYPE = {
    label: "An Epic Confrontation Awaits",
    introA: (name1) => `${name1 || 'A skilled fighter'} prepares for battle.`,
    introB: (name2) => `${name2 || 'An unknown challenger'} steps into the arena.`,
    error: "Global default matchup."
};

const SELECT_PLACEHOLDER_TITLE = "Choose Your Destiny";
const SELECT_PLACEHOLDER_INTRO = "Select fighters and a battlefield to reveal their story.";
const ERROR_TITLE = "Matchup Anomaly";
const ERROR_INTRO = "There was an issue determining the matchup details. Please try again.";

/**
 * Determines the archetype label for a given matchup and location.
 * This function now receives full character data objects.
 * @param {string} fighter1Id - The ID of the first fighter.
 * @param {string} fighter2Id - The ID of the second fighter.
 * @param {string} locationId - The ID of the location.
 * @param {object} fighter1Data - The full data object for fighter 1.
 * @param {object} fighter2Data - The full data object for fighter 2.
 * @returns {object} An object containing the archetype headline and intro texts.
 */
export function resolveArchetypeLabel(fighter1Id, fighter2Id, locationId, fighter1Data, fighter2Data) {
    const defaultHeadline = "Royal Rumble: Princess's Perfection vs. Avatar's Air"; // Fallback

    // Access archetype data via the consolidated allArchetypes object
    const fighter1Archetype = allArchetypes[fighter1Id];
    const fighter2Archetype = allArchetypes[fighter2Id];

    if (!fighter1Id || !fighter2Id || !locationId) {
        return {
            label: SELECT_PLACEHOLDER_TITLE,
            introA: SELECT_PLACEHOLDER_INTRO,
            introB: "", // Keep B blank for placeholder
            error: null
        };
    }

    const fighter1Name = characters[fighter1Id]?.name || "Fighter 1";
    const fighter2Name = characters[fighter2Id]?.name || "Fighter 2";

    let entry = null;
    const fighterAData = combinedArchetypeMap[fighter1Id];

    if (fighterAData) {
        // Most specific lookup: [F1_Data][F2][LOC]
        if (fighterAData[fighter2Id] && fighterAData[fighter2Id][locationId]) {
            entry = fighterAData[fighter2Id][locationId];
        }
        // Fallback 1: [F1_Data][F2][_DEFAULT_LOCATION_]
        else if (fighterAData[fighter2Id] && fighterAData[fighter2Id]['_DEFAULT_LOCATION_']) {
            entry = fighterAData[fighter2Id]['_DEFAULT_LOCATION_'];
        }
        // Fallback 2: [F1_Data][_DEFAULT_OPPONENT_][_DEFAULT_LOCATION_] (Default within Fighter A's data)
        else if (fighterAData['_DEFAULT_OPPONENT_'] && fighterAData['_DEFAULT_OPPONENT_']['_DEFAULT_LOCATION_']) {
            entry = fighterAData['_DEFAULT_OPPONENT_']['_DEFAULT_LOCATION_'];
            // Specific default intros using names if possible
            if (entry) {
                entry = {
                    ...entry, // spread to keep original label
                    introA: entry.introA || `${fighter1Name} prepares for an unknown challenge.`,
                    introB: entry.introB ? entry.introB.replace("this fighter", fighter2Name).replace("this opponent", fighter2Name) : `${fighter2Name} steps up to face ${fighter1Name}.`
                };
            }
        }
    }

    // Fallback 3: Global Default (if no specific entry for fighterA or the specific combo)
    if (!entry) {
        return {
            label: GLOBAL_DEFAULT_ARCHETYPE.label,
            introA: GLOBAL_DEFAULT_ARCHETYPE.introA(fighter1Name),
            introB: GLOBAL_DEFAULT_ARCHETYPE.introB(fighter2Name),
            error: GLOBAL_DEFAULT_ARCHETYPE.error
        };
    }
    
    // Ensure entry has all parts, or use character-specific defaults if available in entry, else global defaults
    return {
        label: entry.label || GLOBAL_DEFAULT_ARCHETYPE.label,
        introA: entry.introA || GLOBAL_DEFAULT_ARCHETYPE.introA(fighter1Name),
        introB: entry.introB || GLOBAL_DEFAULT_ARCHETYPE.introB(fighter2Name),
        error: null // If we found an entry, even a default one from character file, it's not an error state.
    };
}